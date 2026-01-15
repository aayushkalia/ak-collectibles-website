import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, trackingId } = await req.json();
    const orderId = params.id;

    if (status === 'cancelled') {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Update Order Status
            await client.query('UPDATE orders SET status = $1 WHERE id = $2', ['cancelled', orderId]);

            // 2. Get all products in this order
            const itemsRes = await client.query('SELECT product_id FROM order_items WHERE order_id = $1', [orderId]);
            const items = itemsRes.rows;

            // 3. Revert product status to 'available'
            for (const item of items) {
                await client.query("UPDATE products SET status = 'available' WHERE id = $1", [item.product_id]);
            }
            
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } else if (status === 'shipped') {
        await db.query('UPDATE orders SET status = $1, tracking_id = $2 WHERE id = $3', ['shipped', trackingId || null, orderId]);
    } else {
        // Normal status update
        await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
