import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const origFilename = req.headers.get('x-filename');
  if (!origFilename) return new Response(JSON.stringify({ error: 'No filename' }), { status: 400 });
  const ext = origFilename.split('.').pop();
  const base = origFilename.replace(/\.[^/.]+$/, "");
  const filename = `${Date.now()}_${base}.${ext}`;
  const uploadsDir = join(process.cwd(), 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await req.arrayBuffer());
  const filePath = join(uploadsDir, filename);
  await writeFile(filePath, buffer);
  return new Response(JSON.stringify({ ok: true, filename }), { status: 200 });
}
