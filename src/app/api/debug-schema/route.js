import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const productsCols = db.prepare('PRAGMA table_info(products)').all();
    const ordersCols = db.prepare('PRAGMA table_info(orders)').all();
    
    return NextResponse.json({
      products: productsCols,
      orders: ordersCols,
      dbPath: db.name 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
