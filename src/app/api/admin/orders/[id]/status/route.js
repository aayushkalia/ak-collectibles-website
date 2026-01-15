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
        const cancelResult = db.transaction(() => {
            // 1. Update Order Status
            db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', orderId);

            // 2. Get all products in this order
            const items = db.prepare('SELECT product_id FROM order_items WHERE order_id = ?').all(orderId);

            // 3. Revert product status to 'available'
            const updateProduct = db.prepare("UPDATE products SET status = 'available' WHERE id = ?");
            for (const item of items) {
                updateProduct.run(item.product_id);
            }
            return true;
        })();
    } else if (status === 'shipped') {
        db.prepare('UPDATE orders SET status = ?, tracking_id = ? WHERE id = ?').run('shipped', trackingId || null, orderId);
    } else {
        // Normal status update
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
