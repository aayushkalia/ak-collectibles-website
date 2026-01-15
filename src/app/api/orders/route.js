import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function POST(req) {
  try {

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { items, address, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    if (!address) {
       return NextResponse.json({ message: 'Address is required' }, { status: 400 });
    }

    // FRAUD PREVENTION & VALIDATION
    // We must validate every single item against the DB.
    let totalAmount = 0;
    const validatedItems = [];

    // Use a transaction for validation + creation to ensure consistency
    const orderResult = db.transaction(() => {
        for (const item of items) {
            const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);

            // 1. Existence Check
            if (!product) {
                throw new Error(`Product ${item.title} not found in database.`);
            }

            // 2. Availability Check
            // Self-healing: If stock exists > 0, ignore 'sold' status (it might be stale)
            if (product.status === 'sold' && product.stock <= 0) {
                throw new Error(`Product ${product.title} is already sold.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.title}. Only ${product.stock} available.`);
            }

            // 3. Price Check (Core Fraud Prevention)
            // For auctions, the 'price' in DB should be the final bid amount.
            if (Math.abs(product.price - item.price) > 0.1) {
                throw new Error(`Price mismatch for ${product.title}. Expected ₹${product.price}, got ₹${item.price}. Please refresh cart.`);
            }

            // 4. Auction Winner Check (Critical)
            if (product.is_auction === 1) {
                // Check if auction is ended
                if (new Date(product.auction_end_time) > new Date()) {
                    throw new Error(`Auction for ${product.title} has not ended yet.`);
                }

                // Check highest bidder
                const winner = db.prepare(`
                    SELECT user_id FROM bids 
                    WHERE product_id = ? AND status = 'valid' 
                    ORDER BY amount DESC 
                    LIMIT 1
                `).get(product.id);

                if (!winner || winner.user_id !== Number(session.user.id)) {
                     throw new Error(`You are not the winner of auction ${product.title}.`);
                }
            }

            validatedItems.push({
                product_id: product.id,
                price: product.price,
                quantity: item.quantity, 
                title: product.title 
            });
            
            // Add Price + Shipping Cost
            totalAmount += (product.price * item.quantity) + (product.shipping_cost || 0);
        }

        // All checks passed. Create Order.
        const result = db.prepare(`
            INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method) 
            VALUES (?, ?, ?, ?, ?)
        `).run(session.user.id, totalAmount, 'pending', address, paymentMethod || 'COD');

        const orderId = result.lastInsertRowid;

        // Insert Order Items and Update Product Status
        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price) 
            VALUES (?, ?, ?, ?)
        `);
        const updateProductStock = db.prepare(`
            UPDATE products SET stock = stock - ? WHERE id = ?
        `);
        
        const markSold = db.prepare(`
            UPDATE products SET status = 'sold' WHERE id = ? AND stock <= 0
        `);

        for (const vItem of validatedItems) {
            insertItem.run(orderId, vItem.product_id, vItem.quantity, vItem.price);
            updateProductStock.run(vItem.quantity, vItem.product_id); // Decrement stock
            markSold.run(vItem.product_id); // Mark as sold ONLY if stock hits 0
        }

        return { orderId, totalAmount };
    })();

    return NextResponse.json({ success: true, orderId: orderResult.orderId });

  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ message: error.message || 'Checkout failed' }, { status: 400 });
  }
}
