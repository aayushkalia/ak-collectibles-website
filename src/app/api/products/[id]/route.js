import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const res = await db.query('SELECT * FROM products WHERE id = $1', [params.id]);
    const product = res.rows[0];
    
    if (product) {
      try {
        const mediaRes = await db.query('SELECT url, type FROM product_media WHERE product_id = $1', [params.id]);
        const media = mediaRes.rows;
        product.media = media.length > 0 ? media : [{ url: product.image_url, type: 'image' }]; // Fallback
      } catch (mediaError) {
        console.error('Error fetching media for product ' + params.id, mediaError);
        // Fallback if media fetch fails
        product.media = [{ url: product.image_url, type: 'image' }];
      }
      return NextResponse.json(product);
    }
    
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('PUT Body received:', JSON.stringify(body, null, 2));
    const { title, description, price, category, is_auction, auction_end_time, media, shipping_cost, stock, max_per_user } = body;

    const mainImage = (media && media.length > 0) ? media[0].url : '';

    const finalStock = stock !== undefined ? Number(stock) : 0;
    const newStatus = finalStock > 0 ? 'available' : 'sold';

    const client = await db.connect();
    
    try {
        await client.query('BEGIN');

        await client.query(`
          UPDATE products 
          SET title = $1, description = $2, price = $3, category = $4, image_url = $5, is_auction = $6, auction_end_time = $7, shipping_cost = $8, stock = $9, max_per_user = $10, status = $11
          WHERE id = $12
        `, [
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
        ]);

        // Update Media
        if (media && Array.isArray(media)) {
          await client.query('DELETE FROM product_media WHERE product_id = $1', [params.id]);
          
          for (const item of media) {
             await client.query('INSERT INTO product_media (product_id, url, type) VALUES ($1, $2, $3)', [params.id, item.url, item.type]);
          }
        }
        
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
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
    const res = await db.query('DELETE FROM products WHERE id = $1', [params.id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
