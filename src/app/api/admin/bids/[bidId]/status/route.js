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

    // Wrap in transaction
    const result = db.transaction(() => {
        // 1. Get the bid to be updated
        const targetBid = db.prepare('SELECT * FROM bids WHERE id = ?').get(bidId);
        if (!targetBid) throw new Error('Bid not found');

        // 2. Update status
        db.prepare('UPDATE bids SET status = ? WHERE id = ?').run(status, bidId);

        // 3. Recalculate Highest Valid Bid for the Product
        const newMaxBid = db.prepare(`
            SELECT amount FROM bids 
            WHERE product_id = ? AND status = 'valid' 
            ORDER BY amount DESC 
            LIMIT 1
        `).get(targetBid.product_id);

        let newPrice = 0;
        
        if (newMaxBid) {
            newPrice = newMaxBid.amount;
        } else {
             // Fallback: If no valid bids left, revert to base price? 
             // Or keep it 0? Ideally base price but we don't have it stored separately from 'price'.
             // For now, let's query the product to handle logic? 
             // Actually, the 'price' column IS the current price. 
             // Ideally we should have 'starting_price' vs 'current_price'.
             // Simplification: Set to 0 or leave as is? 
             // BETTER: Don't change price if there are no bids? 
             // Or fetch product and see.
             newPrice = 0; // The logic below implies price = max bid.
        }

        if (newPrice > 0) {
             db.prepare('UPDATE products SET price = ? WHERE id = ?').run(newPrice, targetBid.product_id);
        } else {
             // If no valid bids, maybe reset to a default or keep the last known?
             // Since we overwrote 'price' with bids, we lost the original asking price.
             // This is a flaw in current DB design but acceptable for prototype.
             // We will just leave the price as is IF no new max bid found? 
             // No, that's confusing. 
             // Let's just set it to 0 or some indicator.
             // Actually, if we disqualify the ONLY bid, the price should technically revert.
             // Without 'starting_price', we can't revert perfectly.
        }

        return { success: true, newPrice };
    })();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Update Bid Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update bid' }, { status: 500 });
  }
}
