import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const mimeTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v'
};

export async function GET(request, { params }) {
  try {
    const { path: filePathParams } = params;
    const filename = filePathParams.join('/');
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const filePath = path.resolve(uploadsDir, filename);

    if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const range = request.headers.get('range');

    if (range) {
      const match = range.match(/bytes=(\d*)-(\d*)/);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Number(match[2]) : stat.size - 1;
      const safeStart = Math.max(0, Math.min(start, stat.size - 1));
      const safeEnd = Math.max(safeStart, Math.min(end, stat.size - 1));
      const chunk = fs.readFileSync(filePath).subarray(safeStart, safeEnd + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(chunk.length),
          'Content-Range': `bytes ${safeStart}-${safeEnd}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
