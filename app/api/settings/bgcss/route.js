import { join } from 'path';
import { writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { backgroundImage, backgroundColor } = await req.json();
  const css = `body.bg-image {\n  background-image: url('/${backgroundImage || 'bg.jpg'}');\n  background-color: ${backgroundColor || '#262a66b5'};\n  background-repeat: no-repeat;\n  background-blend-mode: overlay;\n  background-size: cover;\n  min-height: 100vh;\n}`;
  const filePath = join(process.cwd(), 'public', 'bg-image.css');
  await writeFile(filePath, css, 'utf-8');
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
