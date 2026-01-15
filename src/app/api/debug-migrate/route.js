import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');
        
        // Add column if not exists
        await client.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE
        `);

        // Update existing NULLs to TRUE
        await client.query(`
            UPDATE products SET is_visible = TRUE WHERE is_visible IS NULL
        `);

        await client.query('COMMIT');

        return NextResponse.json({ success: true, message: 'Migration executed successfully.' });
    } catch (e) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
