'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'security'

  // Change Password State
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPass, setChangingPass] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  if (status === 'loading') return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Fetch Orders
  useEffect(() => {
    if (activeTab === 'orders') {
        fetch('/api/orders/my-orders') // We need to create this API endpoint or modify existing one
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch orders');
        })
        .then(data => {
            setOrders(data);
            setLoadingOrders(false);
        })
        .catch(err => {
            console.error(err);
            setLoadingOrders(false);
        });
    }
  }, [activeTab]);


  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    setChangingPass(true);
    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                currentPassword: passData.currentPassword, 
                newPassword: passData.newPassword 
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showToast('Password changed successfully!', 'success');
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            showToast(data.message || 'Failed to change password', 'error');
        }
    } catch (err) {
        showToast('Something went wrong', 'error');
    } finally {
        setChangingPass(false);
    }
  };


  return (
    <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '1rem', minHeight: '60vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
            <h1 style={{ color: 'var(--color-deep-green)', margin: 0 }}>My Profile</h1>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>Welcome back, <strong>{session.user.name || session.user.email}</strong></p>
        </div>
        
        {session.user.role === 'admin' && (
            <Link href="/admin" style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--color-gold)', 
                color: 'var(--color-deep-green)', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                borderRadius: '4px',
                whiteSpace: 'nowrap'
            }}>
                Go to Admin Panel
            </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Sidebar */}
        <div style={{ width: '100%', maxWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 250px' }}>
            <button 
                onClick={() => setActiveTab('orders')}
                style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    backgroundColor: activeTab === 'orders' ? 'var(--color-deep-green)' : '#f5f5f5',
                    color: activeTab === 'orders' ? 'white' : '#333',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                }}
            >
                📦 My Orders
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    backgroundColor: activeTab === 'security' ? 'var(--color-deep-green)' : '#f5f5f5',
                    color: activeTab === 'security' ? 'white' : '#333',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                }}
            >
                🔒 Security
            </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            
            {activeTab === 'security' && (
                <div>
                    <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Change Password</h2>
                    <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Password</label>
                            <input 
                                type="password" 
                                value={passData.currentPassword}
                                onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password</label>
                            <input 
                                type="password" 
                                value={passData.newPassword}
                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={changingPass}
                            style={{ 
                                padding: '1rem 2rem', 
                                backgroundColor: 'var(--color-deep-green)', 
                                color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
                                opacity: changingPass ? 0.7 : 1
                            }}
                        >
                            {changingPass ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Order History</h2>
                    {loadingOrders ? (
                        <p>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                            <p>No orders found.</p>
                            <Link href="/shop" style={{ color: 'var(--color-deep-green)', fontWeight: 'bold' }}>Start Shopping</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{order.total_amount}</p>
                                        <span style={{ 
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8rem', 
                                            backgroundColor: order.status === 'delivered' ? '#e8f5e9' : '#fff3e0',
                                            color: order.status === 'delivered' ? '#1a472a' : '#f57c00'
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                        {order.status === 'shipped' && order.tracking_id && (
                                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                Tracking: <strong>{order.tracking_id}</strong>
                                            </p>
                                        )}
                                    </div>
                                    <Link href={`/order-confirmation/${order.id}`} style={{ color: 'var(--color-deep-green)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                        Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </main>
  );
}
