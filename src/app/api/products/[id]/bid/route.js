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

    // Wrap in a transaction to ensure integrity
    const result = db.transaction(() => {
      // 1. Get Product (Fresh Read)
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.is_auction !== 1) {
        throw new Error('This product is not up for auction');
      }

      const now = new Date();
      const endTime = new Date(product.auction_end_time);

      if (now > endTime) {
        throw new Error('Auction has ended');
      }

      // 2. Validate Bid Amount
      // Minimum increment logical check (e.g. must be 10 higher?)
      // For now, strict > current price
      if (amount <= product.price) {
        throw new Error(`Bid must be higher than current price (₹${product.price})`);
      }

      // 3. Insert Bid
      db.prepare(`
        INSERT INTO bids (product_id, user_id, amount)
        VALUES (?, ?, ?)
      `).run(productId, userId, amount);

      // 4. Update Product Price
      db.prepare(`
        UPDATE products 
        SET price = ?
        WHERE id = ?
      `).run(amount, productId);

      return { success: true, newPrice: amount };
    })();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Bidding Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to place bid' }, { status: 400 });
  }
}
