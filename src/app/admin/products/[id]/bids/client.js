'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BidManagementClient({ initialBids, productId }) {
  const [bids, setBids] = useState(initialBids);
  const router = useRouter();

  const handleStatusChange = async (bidId, newStatus) => {
    if (!confirm(`Are you sure you want to mark this bid as ${newStatus}?`)) return;

    try {
        const res = await fetch(`/api/admin/bids/${bidId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            // Update local state securely
            setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: newStatus } : b));
            router.refresh(); // Refresh server data to get new price calculation
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error(error);
        alert('Error updating status');
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Bidder</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {bids.map(bid => (
                    <tr key={bid.id} style={{ borderBottom: '1px solid #eee', backgroundColor: bid.status === 'disqualified' ? '#ffebee' : 'transparent' }}>
                        <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{bid.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{bid.email}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1a472a' }}>₹{bid.amount}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }} suppressHydrationWarning>{new Date(bid.created_at).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>
                            <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem',
                                backgroundColor: bid.status === 'valid' ? '#e8f5e9' : '#ffcdd2',
                                color: bid.status === 'valid' ? '#2e7d32' : '#c62828'
                            }}>
                                {bid.status}
                            </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                            {bid.status === 'valid' && (
                                <button 
                                    onClick={() => handleStatusChange(bid.id, 'disqualified')}
                                    style={{ 
                                        padding: '0.5rem 1rem', 
                                        backgroundColor: '#d32f2f', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Disqualify
                                </button>
                            )}
                            {bid.status === 'disqualified' && (
                                <button 
                                    onClick={() => handleStatusChange(bid.id, 'valid')}
                                    style={{ 
                                        padding: '0.5rem 1rem', 
                                        backgroundColor: '#1976d2', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Re-instate
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
