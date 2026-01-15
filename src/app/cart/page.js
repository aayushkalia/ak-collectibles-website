'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const handleCheckout = () => {
    if (!session) {
      router.push('/login?callbackUrl=/cart');
      return;
    }
    showToast('Proceeding to checkout...');
    // Future: Integrate Stripe/Payment Gateway
  };

  if (cart.length === 0) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--color-deep-green)' }}>Your Cart</h1>
        <p style={{ margin: '2rem 0', color: '#666' }}>Your cart is empty.</p>
        <Link href="/shop" style={{ 
          padding: '0.75rem 1.5rem', 
          backgroundColor: 'var(--color-gold)', 
          color: 'white', 
          borderRadius: '4px',
          fontWeight: 'bold' 
        }}>
          Browse Collection
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--color-deep-green)', marginBottom: '2rem' }}>Your Cart</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {cart.map(item => (
          <div key={item.id} style={{ 
            display: 'flex', 
            padding: '1.5rem', 
            borderBottom: '1px solid #eee',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <img src={item.image_url} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#666' }}>{item.category}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ padding: '0.25rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >-</button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ padding: '0.25rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >+</button>
            </div>

            <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 'bold' }}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>

            <button 
              onClick={() => removeFromCart(item.id)}
              style={{ color: '#d32f2f', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
        ))}

        <div style={{ padding: '2rem', backgroundColor: '#f9f9f9', textAlign: 'right' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            Total: <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--color-gold-dark)' }}>₹{totalPrice.toFixed(2)}</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button 
              onClick={clearCart}
              style={{ 
                padding: '1rem 2rem', 
                border: '1px solid #ddd', 
                backgroundColor: 'white',
                borderRadius: '4px',
                fontWeight: 'bold',
                color: '#666'
              }}
            >
              Clear Cart
            </button>
            <Link href="/checkout" style={{ textDecoration: 'none' }}>
              <button 
                style={{ 
                  padding: '1rem 2rem', 
                  backgroundColor: 'var(--color-deep-green)', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
