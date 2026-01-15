import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function GET() {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = rows.reduce((acc, row) => {
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
    const { upi_id, whatsapp_number, instructions, qr_code_url, email } = body;

    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction(() => {
        if (upi_id !== undefined) stmt.run('upi_id', upi_id);
        if (whatsapp_number !== undefined) stmt.run('whatsapp_number', whatsapp_number);
        if (instructions !== undefined) stmt.run('instructions', instructions);
        if (qr_code_url !== undefined) stmt.run('qr_code_url', qr_code_url);
        if (email !== undefined) stmt.run('email', email);
    });

    transaction();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
