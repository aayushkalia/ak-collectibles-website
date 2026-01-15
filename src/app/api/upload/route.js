import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase(); // Sanitize filename
    const filename = `${uniqueSuffix}-${originalName}`;
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.error('Error creating directory:', e);
    }

    const path = join(uploadDir, filename);
    
    // Log path for debugging
    console.log('Writing file to:', path);
    
    await writeFile(path, buffer);
    
    // Use dynamic route for immediate availability
    const url = `/api/view/${filename}`;
    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error('Upload API Error:', error);
    // Return the actual error message to the client for debugging
    return NextResponse.json({ success: false, message: 'Upload failed', error: error.message }, { status: 500 });
  }
}
