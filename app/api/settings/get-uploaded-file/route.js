import { join } from 'path';
import { stat, createReadStream } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('file');
  if (!filename) return new Response('No file specified', { status: 400 });

  const uploadsPath = join(process.cwd(), 'uploads', filename);
  const publicPath = join(process.cwd(), 'public', filename);
  let filePath = uploadsPath;
  let found = false;
  try {
    await new Promise((resolve, reject) => stat(uploadsPath, err => err ? reject(err) : resolve()));
    found = true;
  } catch {
    try {
      await new Promise((resolve, reject) => stat(publicPath, err => err ? reject(err) : resolve()));
      filePath = publicPath;
      found = true;
    } catch {
      found = false;
    }
  }
  if (!found) return new Response('File not found', { status: 404 });
  const stream = createReadStream(filePath);
  const ext = filename.split('.').pop().toLowerCase();
  let contentType = 'application/octet-stream';
  if (["png","jpg","jpeg","gif","webp"].includes(ext)) contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  return new Response(stream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
