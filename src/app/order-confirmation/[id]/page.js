import Link from 'next/link';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({ params }) {
  const orderId = params.id;

  // 1. Fetch Order
  const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderRes.rows[0];

  if (!order) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1>Order Not Found</h1>
            <Link href="/">Go Home</Link>
        </div>
    );
  }

  // 2. Fetch Order Items
  const itemsRes = await db.query(`
    SELECT order_items.*, products.title, products.image_url 
    FROM order_items 
    JOIN products ON order_items.product_id = products.id 
    WHERE order_items.order_id = $1
  `, [orderId]);
  const items = itemsRes.rows;

  // 3. Fetch Settings
  const settingsRes = await db.query('SELECT key, value FROM settings');
  const settings = settingsRes.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  const upiId = settings.upi_id || '9876543210@upi';
  const whatsappNumber = settings.whatsapp_number || '9876543210';
  const instructions = settings.instructions || 'After payment, please send a screenshot to our WhatsApp.';

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '2rem 0' }}>
        <main style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h1 style={{ color: 'var(--color-deep-green)', marginBottom: '0.5rem' }}>Order Placed!</h1>
                <p style={{ color: '#666' }}>Order ID: <strong>#{order.id}</strong></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '2rem' }}>
                
                {/* Left Column: Order Details */}
                <div>
                     <h3 style={{ borderBottom: '2px solid var(--color-gold)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-deep-green)' }}>
                        Items Ordered
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                                    <div style={{ color: '#888' }}>x {item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-deep-green)' }}>
                            <span>Total Amount</span>
                            <span>₹{order.total_amount}</span>
                        </div>
                    </div>

                    <h3 style={{ borderBottom: '2px solid var(--color-gold)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem', color: 'var(--color-deep-green)' }}>
                        Shipping Address
                    </h3>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#555', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
                        {order.shipping_address}
                    </p>
                </div>

                {/* Right Column: Payment & Next Steps */}
                <div style={{ backgroundColor: '#f0f7f4', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3 style={{ color: '#1a472a', marginBottom: '1rem' }}>Next Steps</h3>
                    
                    {order.payment_method === 'UPI' ? (
                        <>
                            <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                                To confirm your order, please convert the payment via UPI.
                            </p>
                            
                             <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #c8e6c9', marginBottom: '1rem', textAlign: 'center' }}>
                                {settings.qr_code_url ? (
                                    <img src={settings.qr_code_url} alt="Scan QR" style={{ width: '150px', height: '150px', objectFit: 'contain', margin: '0 auto' }} />
                                ) : (
                                    <div style={{ width: '150px', height: '150px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#888' }}>No QR</div>
                                )}
                                <div style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{order.total_amount}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666', fontFamily: 'monospace', marginTop: '0.25rem' }}>{upiId}</div>
                            </div>

                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Instructions:</p>
                            <ul style={{ fontSize: '0.9rem', color: '#666', paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                                <li>Scan the QR code or use the UPI ID.</li>
                                <li>Pay the exact total amount.</li>
                                <li><strong>Send a screenshot</strong> of the payment to our WhatsApp.</li>
                            </ul>
                            
                            <a href={`https://wa.me/${whatsappNumber}?text=Hi, I placed order #${order.id}. Here is the payment proof.`} target="_blank" style={{ 
                                display: 'block',
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: '#25D366',
                                color: 'white',
                                textAlign: 'center',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                Chat on WhatsApp
                            </a>
                        </>
                    ) : (
                        <p>Please pay cash to the delivery agent.</p>
                    )}
                </div>
            </div>

            <div style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid #eee' }}>
                <Link href="/shop" style={{ color: 'var(--color-deep-green)', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Continue Shopping
                </Link>
            </div>
        </main>
    </div>
  );
}
