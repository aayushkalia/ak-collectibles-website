import db from '@/lib/db';
import Link from 'next/link';
import BidManagementClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminBidsPage({ params }) {
  const productId = params.id;
  
  // Fetch Product
  const productRes = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
  const product = productRes.rows[0];

  if (!product) {
    return <div>Product not found</div>;
  }

  // Fetch Bids with User Info
  const bidsRes = await db.query(`
    SELECT bids.*, users.name, users.email 
    FROM bids 
    JOIN users ON bids.user_id = users.id 
    WHERE product_id = $1 
    ORDER BY amount DESC
  `, [productId]);
  const bids = bidsRes.rows;

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
