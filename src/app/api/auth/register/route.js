import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('[Register API] Starting registration request...');
    const body = await request.json();
    const { name, email, password } = body;
    console.log('[Register API] Request body received:', { name, email, passwordLength: password?.length });

    if (!email || !password || !name) {
      console.log('[Register API] Missing fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    console.log('[Register API] Checking existence for:', email);
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('[Register API] User exists check result:', existingUser);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('[Register API] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[Register API] Password hashed.');

    // Insert user
    console.log('[Register API] Inserting user...');
    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    );
    const result = insertUser.run(name, email, hashedPassword, 'user');
    console.log('[Register API] Insert result:', result);

    return NextResponse.json(
      { message: 'User created successfully', userId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register API] CRITICAL ERROR:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack }, // Return actual error for debugging
      { status: 500 }
    );
  }
}
