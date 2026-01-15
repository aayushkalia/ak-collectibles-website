import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    const products = res.rows;
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

    const result = await db.query(`
      INSERT INTO products (title, description, price, shipping_cost, category, image_url, is_auction, auction_end_time, stock, max_per_user)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [title, description, price, shipping_cost || 0, category, mainImage, is_auction, auction_end_time || null, stock || 1, max_per_user || null]);

    const productId = result.rows[0].id;
    console.log('[POST] Product created with ID:', productId);

    // Insert Media
    if (media && Array.isArray(media)) {
      for (const item of media) {
        if (item.url) {
          await db.query('INSERT INTO product_media (product_id, url, type) VALUES ($1, $2, $3)', [productId, item.url, item.type]);
        }
      }
      console.log(`[POST] Inserted ${media.length} media items.`);
    }

    return NextResponse.json({ success: true, id: productId });
  } catch (error) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}
