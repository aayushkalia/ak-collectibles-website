import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { filename } = params;
    // Map to public/uploads
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    
    const fileBuffer = await readFile(filePath);
    
    // Determine content type manually to avoid external deps
    const ext = filename.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'mp4') contentType = 'video/mp4';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0', // Disable caching for now to ensure fresh load
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
