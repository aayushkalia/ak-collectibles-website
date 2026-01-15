import Link from 'next/link';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function OrderConfirmationPage({ params }) {
  // Client-side fetching for settings needed since db access here is server-side but mixed with client needs? 
  // Wait, this file was a Server Component in the previous view ('export default function...'). 
  // But to use fetching hooks, it must be a Client Component OR I should fetch settings server-side.
  // The user's previous code verified it was a server component (db.prepare).
  // I will fetch settings server-side here to keep it simple and SEO friendly.
  
  const orderId = params.id;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const settingsRows = db.prepare('SELECT key, value FROM settings').all();
  
  const settings = settingsRows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  const upiId = settings.upi_id || '9876543210@upi';
  const whatsappNumber = settings.whatsapp_number || '9876543210';
  const instructions = settings.instructions || 'After payment, please send a screenshot or Transaction ID to our WhatsApp.';

  if (!order) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1>Order Not Found</h1>
            <Link href="/">Go Home</Link>
        </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <main style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ color: 'var(--color-deep-green)', marginBottom: '0.5rem' }}>Thank You!</h1>
            <h2 style={{ fontSize: '1.2rem', color: '#555', fontWeight: 'normal' }}>Your order has been placed successfully.</h2>
            
            <div style={{ margin: '2rem 0', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', textAlign: 'left', border: '1px solid #eee' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Payment Instructions</h3>
                
                {order.payment_method === 'UPI' ? (
                    <div>
                        <p style={{ marginBottom: '1rem' }}>Please complete your payment to confirm this order.</p>
                        <div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px', border: '1px solid #c8e6c9', marginBottom: '1rem' }}>
                            <p style={{ fontWeight: 'bold', color: '#1a472a', marginBottom: '0.5rem' }}>Scan to Pay</p>
                            <p style={{ fontSize: '0.9rem' }}>Use Google Pay / Paytm / PhonePe</p>
                            {/* QR Code Display */}
                            <div style={{ width: '200px', height: '200px', backgroundColor: '#fff', margin: '1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', overflow: 'hidden' }}>
                                {settings.qr_code_url ? (
                                    <img src={settings.qr_code_url} alt="Scan QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ color: '#888' }}>[No QR Code Uploaded]</span>
                                )}
                            </div>
                            <p><strong>UPI ID:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: '#fff', padding: '2px 5px', borderRadius: '3px' }}>{upiId}</span></p>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            {instructions} ({whatsappNumber}) with Order ID #{order.id}.
                        </p>
                    </div>
                ) : (
                   <p><strong>Cash on Delivery:</strong> Please pay ₹{order.total_amount} to the delivery agent upon receipt.</p>
                )}
            </div>

            <p style={{ color: '#666', marginBottom: '2rem' }}>
                We will contact you shortly at your provided phone number to confirm the delivery details.
            </p>

            <Link href="/shop" style={{ 
                padding: '0.75rem 2rem', 
                backgroundColor: 'var(--color-deep-green)', 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                borderRadius: '4px' 
            }}>
                Continue Shopping
            </Link>
        </main>
    </div>
  );
}
