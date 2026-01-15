import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file'); // File object from client

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Upload to Vercel Blob (Cloud Storage)
    // 'access: public' means anyone can view the image (required for website)
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // Prevent filename collisions
    });

    console.log('File uploaded to Vercel Blob:', blob.url);

    // Return the new cloud URL
    return NextResponse.json({ success: true, url: blob.url });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed', error: error.message }, { status: 500 });
  }
}
