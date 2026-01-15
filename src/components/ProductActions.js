'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import styles from '@/app/shop/[id]/product.module.css';
import CountdownTimer from './CountdownTimer';

export default function ProductActions({ product, highestBidderId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  
  const isAuction = product.is_auction === 1;
  const isShowcase = product.is_auction === 2;
  
  // Bidding State
  const [bidAmount, setBidAmount] = useState(''); // User must type
  const [loading, setLoading] = useState(false);

  // Check if auction is active
  const auctionEnded = isAuction && new Date(product.auction_end_time) <= new Date();

  // Check if current user is winner
  const isWinner = auctionEnded && session?.user?.id && highestBidderId === Number(session.user.id);
  const isHighestBidder = !auctionEnded && session?.user?.id && highestBidderId === Number(session.user.id);

  const handleAction = () => {
    if (!session) {
      router.push('/login?callbackUrl=/shop/' + product.id);
      return;
    }

    addToCart(product);
    showToast(`${product.title} added to cart!`);
  };

  const handleBid = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push('/login?callbackUrl=/shop/' + product.id);
      return;
    }
    
    if (auctionEnded) {
      showToast('Auction has ended', 'error');
      return;
    }

    if (bidAmount <= product.price) {
      showToast(`Bid must be higher than ₹${product.price}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmount })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Bid placed successfully! New Price: ₹${data.newPrice}`);
        setBidAmount(''); // Clear input for next bid
        router.refresh(); // Refresh to show new price
      } else {
        showToast(data.message || 'Failed to place bid', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isShowcase) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#666' }}>Museum Piece</p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#888' }}>Not currently for sale</p>
      </div>
    );
  }

  if (isAuction) {
    return (
      <div>
        <div className={styles.auctionInfo} style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: '4px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#d32f2f' }}>Time Remaining:</p>
          <CountdownTimer targetDate={product.auction_end_time} />
        </div>
        
        {auctionEnded ? (
           <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: isWinner ? '#e8f5e9' : '#eee', borderRadius: '8px' }}>
             <p style={{ fontWeight: 'bold', color: isWinner ? 'var(--color-deep-green)' : '#555', marginBottom: isWinner ? '0.5rem' : '0' }}>
               {isWinner ? '🎉 You Won This Auction!' : 'Auction Ended'}
             </p>
             <p style={{ fontSize: '0.9rem', marginBottom: isWinner ? '1rem' : '0' }}>Final Price: ₹{product.price}</p>
             
             {isWinner && (
               <button 
                 onClick={handleAction} 
                 className={styles.actionButton}
                 style={{ width: '100%', marginTop: '0.5rem' }}
               >
                 Pay Now
               </button>
             )}
           </div>
        ) : (
          <>
            {isHighestBidder && (
                <div style={{ marginBottom: '0.5rem', textAlign: 'center', color: 'var(--color-deep-green)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    You are the highest bidder!
                </div>
            )}
            <form onSubmit={handleBid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '1.5rem', fontWeight: 'bold' }}>₹</span>
                <input 
                  type="number"
                  min={product.price + 1}
                  step="1"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  disabled={loading}
                  placeholder={`> ₹${product.price}`}
                  style={{
                    width: '100%',
                    padding: '12px 10px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '1.1rem',
                    height: '100%'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className={styles.actionButton} 
                style={{ width: '100%', padding: '0.75rem 0', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading ? '...' : 'Place Bid'}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // Default: Direct Buy
  const [quantity, setQuantity] = useState(1);
  const stock = product.stock ?? 0; // Fix: Allow 0 as valid stock
  const maxPerUser = product.max_per_user || stock; 
  const maxLimit = Math.min(stock, maxPerUser);

  // Check how many already in cart
  const cartItem = cart.find(item => item.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  
  // Calculate remaining buyable quantity
  const remainingStock = maxLimit - currentInCart;
  const isOutOfStock = remainingStock <= 0;

  const handleAddToCart = () => {
      if (!session) {
        router.push('/login?callbackUrl=/shop/' + product.id);
        return;
      }
      
      if (quantity > remainingStock) {
          showToast(`Only ${remainingStock} more available!`, 'error');
          return;
      }

      addToCart({ ...product, quantity: Number(quantity) }); 
      showToast(`${quantity} x ${product.title} added to cart!`);
  };

  const handleQuantityChange = (e) => {
      const val = e.target.value;
      if (val === '') {
          setQuantity('');
          return;
      }
      const num = Number(val);
      if (num < 1) return;
      if (num > maxLimit) return;
      setQuantity(num);
  };

  const handleBlur = () => {
      if (quantity === '' || quantity < 1) setQuantity(1);
  };

  return (
    <div className={styles.actionContainer}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', opacity: isOutOfStock ? 0.5 : 1 }}>
            <button 
                onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}
                disabled={isOutOfStock}
                style={{ padding: '0.5rem 1rem', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '1.2rem' }}
            >−</button>
            <input 
                type="number"
                min="1"
                max={Math.max(1, remainingStock)} // Ensure max doesn't go below 1 for display
                value={isOutOfStock ? 0 : quantity}
                disabled={isOutOfStock}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                style={{ width: '50px', textAlign: 'center', border: 'none', padding: '0.5rem', fontSize: '1rem', MozAppearance: 'textfield' }}
            />
            <button 
                onClick={() => setQuantity(q => Math.min(Math.max(1, remainingStock), Number(q) + 1))}
                disabled={isOutOfStock}
                style={{ padding: '0.5rem 1rem', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '1.2rem' }}
            >+</button>
        </div>
        
        <div style={{ flex: 1 }}>
            <button 
              onClick={handleAddToCart} 
              className={styles.actionButton} 
              disabled={isOutOfStock}
              style={{ width: '100%', backgroundColor: isOutOfStock ? '#ccc' : '', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              {stock <= 0 ? 'Out of Stock' : (isOutOfStock ? 'Max Quantity in Cart' : 'Add to Cart')}
            </button>
            {product.max_per_user && <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', textAlign: 'center' }}>Max {product.max_per_user} per person</div>}
        </div>


        {stock <= 3 && stock > 0 && <span style={{ color: '#d32f2f', fontSize: '0.9rem' }}>Only {stock} left!</span>}
        {stock <= 0 && <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Out of Stock</span>}
    </div>
  );
}
