import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AdminOrdersClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch Orders with User info
  const ordersRes = await db.query(`
    SELECT orders.*, users.name as userName, users.email as userEmail
    FROM orders 
    JOIN users ON orders.user_id = users.id
    ORDER BY orders.created_at DESC
  `);
  const orders = ordersRes.rows;

  // Enhance with item count
  // We should ideally use a JOIN or subquery for performance, but loop is acceptable for MVP scale
  const ordersWithDetails = [];
  
  for (const order of orders) {
      const itemsRes = await db.query(`
        SELECT order_items.*, products.title, products.image_url 
        FROM order_items 
        JOIN products ON order_items.product_id = products.id 
        WHERE order_items.order_id = $1
      `, [order.id]);
      
      const items = itemsRes.rows;
      const itemCount = items.length;
      ordersWithDetails.push({ ...order, items, itemCount });
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-deep-green)' }}>Order Management</h1>
      <AdminOrdersClient initialOrders={ordersWithDetails} />
    </main>
  );
}
