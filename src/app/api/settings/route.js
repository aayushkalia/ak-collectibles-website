import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function GET() {
  try {
    const res = await db.query('SELECT key, value FROM settings');
    const settings = res.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const keys = ['upi_id', 'whatsapp_number', 'instructions', 'qr_code_url', 'email'];
    
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const key of keys) {
            if (body[key] !== undefined) {
                // Postgres UPSERT syntax
                await client.query(`
                    INSERT INTO settings (key, value) 
                    VALUES ($1, $2)
                    ON CONFLICT (key) 
                    DO UPDATE SET value = $2
                `, [key, body[key]]);
            }
        }
        
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
         client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
