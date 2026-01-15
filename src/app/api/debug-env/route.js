import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env_check: {
      POSTGRES_URL_EXISTS: !!process.env.POSTGRES_URL,
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL_EXISTS: !!process.env.NEXTAUTH_URL,
      BLOB_TOKEN_EXISTS: !!process.env.BLOB_READ_WRITE_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString()
  });
}
