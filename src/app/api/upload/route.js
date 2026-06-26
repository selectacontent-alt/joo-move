import { NextResponse } from 'next/server';
import path from 'path';
import { writeUploadedFile } from '@/lib/uploadStorage';

const IMAGE_LIMIT_BYTES = 5 * 1024 * 1024;
const VIDEO_LIMIT_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.gif', '.svg']);
const ALLOWED_VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    const mime = String(file.type || '').toLowerCase();
    const isVideo = mime.startsWith('video/') || ALLOWED_VIDEO_EXTENSIONS.has(ext);
    const isImage = mime.startsWith('image/') || ALLOWED_IMAGE_EXTENSIONS.has(ext);

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only image and video files are allowed' }, { status: 400 });
    }

    const limit = isVideo ? VIDEO_LIMIT_BYTES : IMAGE_LIMIT_BYTES;
    if (file.size > limit) {
      return NextResponse.json(
        { error: isVideo ? 'Video size must not exceed 10MB' : 'Image size must not exceed 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeExt = ext || (isVideo ? '.mp4' : '.jpg');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${safeExt}`;

    await writeUploadedFile(filename, buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, type: isVideo ? 'video' : 'image' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
