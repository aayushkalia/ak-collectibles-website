import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, price, shipping_cost, category, is_auction, auction_end_time, media, stock, max_per_user } = body; 

    // Use first image as main thumbnail
    let mainImage = '';
    if (media && Array.isArray(media) && media.length > 0) {
      mainImage = media[0].url;
    }

    console.log('[POST] Creating product. Main Image:', mainImage);

    const stmt = db.prepare(`
      INSERT INTO products (title, description, price, shipping_cost, category, image_url, is_auction, auction_end_time, stock, max_per_user)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, description, price, shipping_cost || 0, category, mainImage, is_auction, auction_end_time || null, stock || 1, max_per_user || null);
    const productId = result.lastInsertRowid;
    console.log('[POST] Product created with ID:', productId);

    // Insert Media
    if (media && Array.isArray(media)) {
      const mediaStmt = db.prepare('INSERT INTO product_media (product_id, url, type) VALUES (?, ?, ?)');
      for (const item of media) {
        if (item.url)  mediaStmt.run(productId, item.url, item.type);
      }
      console.log(`[POST] Inserted ${media.length} media items.`);
    }

    return NextResponse.json({ success: true, id: productId });
  } catch (error) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}
