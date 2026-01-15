import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id);
  
  if (product) {
    const media = db.prepare('SELECT url, type FROM product_media WHERE product_id = ?').all(params.id);
    product.media = media.length > 0 ? media : [{ url: product.image_url, type: 'image' }]; // Fallback
    return NextResponse.json(product);
  }
  
  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('PUT Body received:', JSON.stringify(body, null, 2)); // DEBUG LOG
    const { title, description, price, category, is_auction, auction_end_time, media, shipping_cost, stock, max_per_user } = body;

    // Use first image as main thumbnail, or keep existing if not provided (though form sends all)
    const mainImage = (media && media.length > 0) ? media[0].url : '';

    // 1. Determine Status based on Stock
    const finalStock = stock !== undefined ? Number(stock) : 0;
    const newStatus = finalStock > 0 ? 'available' : 'sold';

    // 2. Update Product Details
    const stmt = db.prepare(`
      UPDATE products 
      SET title = ?, description = ?, price = ?, category = ?, image_url = ?, is_auction = ?, auction_end_time = ?, shipping_cost = ?, stock = ?, max_per_user = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(
        title, 
        description, 
        price, 
        category, 
        mainImage, 
        is_auction, 
        auction_end_time || null, 
        shipping_cost || 0,
        finalStock, 
        max_per_user || null,
        newStatus,
        params.id
    );

    // 2. Update Media (Delete all and re-insert for simplicity)
    if (media && Array.isArray(media)) {
      db.prepare('DELETE FROM product_media WHERE product_id = ?').run(params.id);
      
      const mediaStmt = db.prepare('INSERT INTO product_media (product_id, url, type) VALUES (?, ?, ?)');
      for (const item of media) {
        mediaStmt.run(params.id, item.url, item.type);
      }
    }

    return NextResponse.json({ success: true, id: params.id });
  } catch (error) {
    console.error('[PUT] Update Product Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(params.id);
    if (result.changes === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
