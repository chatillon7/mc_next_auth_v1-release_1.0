import { join } from 'path';
import { writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const origFilename = req.headers.get('x-filename');
  if (!origFilename) return new Response(JSON.stringify({ error: 'No filename' }), { status: 400 });
  const ext = origFilename.split('.').pop();
  const base = origFilename.replace(/\.[^/.]+$/, "");
  const filename = `${Date.now()}_${base}.${ext}`;
  const buffer = Buffer.from(await req.arrayBuffer());
  const filePath = join(process.cwd(), 'public', filename);
  await writeFile(filePath, buffer);
  return new Response(JSON.stringify({ ok: true, filename }), { status: 200 });
}
