import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path.join(process.cwd(), 'public', fileName);
  await writeFile(filePath, buffer);
  return NextResponse.json({ url: `/${fileName}` });
}
