import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Admin Verification
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { bidId } = params;
    const { status } = await req.json();

    if (!['valid', 'disqualified'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Get the bid to be updated
        const targetBidRes = await client.query('SELECT * FROM bids WHERE id = $1', [bidId]);
        const targetBid = targetBidRes.rows[0];
        if (!targetBid) throw new Error('Bid not found');

        // 2. Update status
        await client.query('UPDATE bids SET status = $1 WHERE id = $2', [status, bidId]);

        // 3. Recalculate Highest Valid Bid for the Product
        const newMaxBidRes = await client.query(`
            SELECT amount FROM bids 
            WHERE product_id = $1 AND status = 'valid' 
            ORDER BY amount DESC 
            LIMIT 1
        `, [targetBid.product_id]);
        const newMaxBid = newMaxBidRes.rows[0];

        let newPrice = 0;
        
        if (newMaxBid) {
            newPrice = newMaxBid.amount;
        } else {
             newPrice = 0; 
        }

        if (newPrice > 0) {
             await client.query('UPDATE products SET price = $1 WHERE id = $2', [newPrice, targetBid.product_id]);
        }

        await client.query('COMMIT');
        
        return NextResponse.json({ success: true, newPrice });

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

  } catch (error) {
    console.error('Update Bid Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update bid' }, { status: 500 });
  }
}
