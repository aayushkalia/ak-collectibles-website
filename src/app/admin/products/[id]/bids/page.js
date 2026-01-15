import db from '@/lib/db';
import Link from 'next/link';
import BidManagementClient from './client'; // We will create this

export const dynamic = 'force-dynamic';

export default function AdminBidsPage({ params }) {
  const productId = params.id;
  
  // Fetch Product
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Fetch Bids with User Info
  const bids = db.prepare(`
    SELECT bids.*, users.name, users.email 
    FROM bids 
    JOIN users ON bids.user_id = users.id 
    WHERE product_id = ? 
    ORDER BY amount DESC
  `).all(productId);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
            <Link href="/admin" style={{ color: '#666', textDecoration: 'none' }}>← Back to Dashboard</Link>
            <h1 style={{ marginTop: '1rem', color: '#1a472a' }}>Manage Bids: {product.title}</h1>
            <p>Current Price: <strong>₹{product.price}</strong></p>
        </div>

        <BidManagementClient initialBids={bids} productId={productId} />
    </div>
  );
}
