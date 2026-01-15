'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Modal from '@/components/Modal';

export default function AdminOrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const router = useRouter();
  
  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'confirm', 'input', 'alert'
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // Store action to execute on confirm

  const openConfirm = (title, message, action) => {
    setModalTitle(title);
    setModalMessage(message);
    setPendingAction(() => action);
    setActiveModal('confirm');
  };

  const openInput = (title, message, action) => {
    setModalTitle(title);
    setModalMessage(message);
    setInputVal('');
    setPendingAction(() => action);
    setActiveModal('input');
  };

  const closeModal = () => {
    setActiveModal(null);
    setPendingAction(null);
  };

  const handleConfirm = () => {
    if (pendingAction) {
       if (activeModal === 'input') pendingAction(inputVal);
       else pendingAction();
    }
    closeModal();
  };

  const updateStatus = async (orderId, newStatus, trackingId = null) => {
      try {
          const res = await fetch(`/api/admin/orders/${orderId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus, trackingId })
          });

          if (res.ok) {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, tracking_id: trackingId } : o));
              router.refresh();
          } else {
              const data = await res.json();
              alert('Failed to update: ' + (data.error || 'Unknown error')); // Keeping simple alert for system errors for now, or use another modal
          }
      } catch (err) {
          console.error(err);
          alert('Error updating status: ' + err.message);
      }
  };

  const handleStatusChange = (orderId, newStatus) => {
      if (newStatus === 'shipped') {
          openInput(
            "Tracking Information", 
            "Enter Speed Post / Tracking ID (Optional):", 
            (val) => updateStatus(orderId, 'shipped', val)
          );
      } else {
          const actionText = newStatus === 'cancelled' ? 'CANCEL' : 'Mark as ' + newStatus;
          openConfirm(
            "Confirm Action",
            `Are you sure you want to ${actionText} Order #${orderId}? This will revert item stock.`,
            () => updateStatus(orderId, newStatus)
          );
      }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
      
      {/* Custom Modal Rendering */}
      <Modal
        isOpen={!!activeModal}
        onClose={closeModal}
        title={modalTitle}
        type={activeModal === 'input' ? 'prompt' : 'confirm'}
        onConfirm={handleConfirm}
      >
        <p>{modalMessage}</p>
        {activeModal === 'input' && (
            <input 
              type="text" 
              value={inputVal} 
              onChange={(e) => setInputVal(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Tracking ID..."
              autoFocus
            />
        )}
      </Modal>

      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9', fontSize: '0.9rem' }}>
            <th style={{ padding: '1rem' }}>Order</th>
            <th style={{ padding: '1rem' }}>Customer & Shipping</th>
            <th style={{ padding: '1rem' }}>Items Ordered</th>
            <th style={{ padding: '1rem' }}>Payment</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', color: '#666' }}>#{order.id}</div>
                  <div suppressHydrationWarning style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  <div suppressHydrationWarning style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(order.created_at).toLocaleTimeString()}</div>
              </td>
              <td style={{ padding: '1rem', verticalAlign: 'top', maxWidth: '250px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--color-deep-green)' }}>{order.userName}</div>
                <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                    {order.shipping_address}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>{order.userEmail}</div>
              </td>
              <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {order.items.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '8px', fontSize: '0.9rem', borderBottom: '1px dashed #eee', paddingBottom: '4px' }}>
                              <span style={{ fontWeight: 'bold' }}>{item.title}</span><br/>
                              <span style={{ color: '#666' }}>Qty: {item.quantity} × ₹{item.price}</span>
                          </li>
                      ))}
                  </ul>
                  <div style={{ marginTop: '0.5rem', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                      Total: ₹{order.total_amount}
                  </div>
              </td>
              <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                      backgroundColor: order.payment_method === 'UPI' ? '#E3F2FD' : '#FFF3E0',
                      color: order.payment_method === 'UPI' ? '#1565C0' : '#E65100'
                  }}>
                      {order.payment_method}
                  </span>
              </td>
              <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: 'bold',
                      backgroundColor: order.status === 'shipped' ? '#E8F5E9' : order.status === 'cancelled' ? '#FFEBEE' : '#FFF3E0',
                      color: order.status === 'shipped' ? '#2E7D32' : order.status === 'cancelled' ? '#C62828' : '#EF6C00'
                  }}>
                      {order.status}
                  </span>
                  {order.tracking_id && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#666' }}>
                          Ref: {order.tracking_id}
                      </div>
                  )}
              </td>
              <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {order.status !== 'shipped' && order.status !== 'cancelled' && (
                          <>
                            <button 
                                onClick={() => handleStatusChange(order.id, 'shipped')}
                                style={{ padding: '0.5rem', backgroundColor: '#1a472a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                Mark Shipped
                            </button>
                            <button 
                                onClick={() => handleStatusChange(order.id, 'cancelled')}
                                style={{ padding: '0.5rem', backgroundColor: '#C62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                Cancel Order
                            </button>
                          </>
                      )}
                      {order.status === 'cancelled' && <span style={{fontSize: '0.8rem', color: '#999'}}>Stock Reverted</span>}
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
