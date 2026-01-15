import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();
    const productId = params.id;
    const userId = session.user.id;

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ message: 'Invalid bid amount' }, { status: 400 });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Product (Fresh Read)
        const productRes = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
        const product = productRes.rows[0];

        if (!product) {
            throw new Error('Product not found');
        }

        // is_auction might be boolean or 0/1 depending on DB config, handled loosely
        if (!product.is_auction) {
            throw new Error('This product is not up for auction');
        }

        const now = new Date();
        const endTime = new Date(product.auction_end_time);

        if (now > endTime) {
            throw new Error('Auction has ended');
        }

        // 2. Validate Bid Amount
        if (Number(amount) <= Number(product.price)) {
            throw new Error(`Bid must be higher than current price (₹${product.price})`);
        }

        // 3. Insert Bid
        await client.query(`
            INSERT INTO bids (product_id, user_id, amount)
            VALUES ($1, $2, $3)
        `, [productId, userId, amount]);

        // 4. Update Product Price
        await client.query(`
            UPDATE products 
            SET price = $1
            WHERE id = $2
        `, [amount, productId]);

        await client.query('COMMIT');
        
        return NextResponse.json({ success: true, newPrice: amount });

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

  } catch (error) {
    console.error('Bidding Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to place bid' }, { status: 400 });
  }
}
