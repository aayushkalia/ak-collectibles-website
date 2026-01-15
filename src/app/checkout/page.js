'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/context/ToastContext';

import Modal from '@/components/Modal';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    paymentMethod: 'UPI'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  if (!session) {
      return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Please log in to checkout.</p>
              <Link href="/login">Login</Link>
          </div>
      );
  }

  if (cart.length === 0) {
    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem', textAlign: 'center', minHeight: '60vh' }}>
                <h1>Your Cart is Empty</h1>
                <Link href="/shop" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 'bold' }}>
                    Browse Collection
                </Link>
            </div>
        </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullAddress = `${formData.name}, ${formData.address}, ${formData.city} - ${formData.pincode}. Phone: ${formData.phone}`;

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                address: fullAddress,
                paymentMethod: formData.paymentMethod
            })
        });
        
        const data = await res.json();

        if (res.ok) {
            clearCart();
            router.push(`/order-confirmation/${data.orderId}`);
        } else {
            const msg = data.message || 'Checkout failed';
            setError(msg);
            setModalMessage(`Order Failed: ${msg}`);
            setModalOpen(true);
            showToast(msg, 'error');
        }
    } catch (err) {
        setError('Something went wrong. Please try again.');
        setModalMessage('Order Failed: Something went wrong.');
        setModalOpen(true);
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const shippingTotal = cart.reduce((acc, item) => acc + (item.shipping_cost || 0), 0);
    const grandTotal = totalPrice + shippingTotal;

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <Modal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            title="Notification"
        >
            {modalMessage}
        </Modal>

        <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            
            {/* Shipping Form */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: 'var(--color-deep-green)', marginBottom: '1.5rem' }}>Shipping Details</h2>
                {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Full Name</label>
                        <input name="name" required placeholder="John Doe" onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Address</label>
                        <textarea name="address" required placeholder="Flat No, Street, Landmark" onChange={handleChange} rows="3" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>City</label>
                            <input name="city" required placeholder="Mumbai" onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pincode</label>
                            <input name="pincode" required placeholder="400001" onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Phone Number</label>
                        <input name="phone" required placeholder="+91 98765 43210" onChange={handleChange} type="tel" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Payment Method</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                           <label style={{ padding: '1rem', border: '1px solid #1a472a', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: '#e8f5e9' }}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="UPI" 
                                    checked={true}
                                    readOnly 
                                />
                                UPI / Google Pay (QR Code)
                           </label>
                           <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem'}}>
                               Cash on Delivery is currently unavailable.
                           </p>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            marginTop: '1rem', 
                            padding: '1rem', 
                            backgroundColor: 'var(--color-gold)', 
                            color: '#1a472a', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold', 
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : `Place Order - ₹${grandTotal}`}
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '0.5rem' }}>
                        By placing this order, you agree to our Terms of Service.
                    </p>
                </form>
            </div>

            {/* Order Summary */}
            <div style={{ height: 'fit-content' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                                <div style={{ color: '#666' }}>Qty: {item.quantity}</div>
                                {item.shipping_cost > 0 && <div style={{ fontSize: '0.8rem', color: '#888' }}>Shipping: ₹{item.shipping_cost}</div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div style={{ borderTop: '2px solid #eee', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Subtotal:</span>
                         <span>₹{totalPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Shipping:</span>
                         <span>₹{cart.reduce((acc, item) => acc + (item.shipping_cost || 0), 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--color-deep-green)' }}>
                        <span>Total:</span>
                        <span>₹{totalPrice + cart.reduce((acc, item) => acc + (item.shipping_cost || 0), 0)}</span>
                    </div>
                </div>
                </div>
            </div>
        </main>
    </div>
  );
}
