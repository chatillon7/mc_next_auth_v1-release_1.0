import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'db.sqlite');
    const dbBuffer = await fs.readFile(dbPath);

    const zip = new JSZip();
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `db-backup-${dateStr}.sqlite`;
    zip.file(fileName, dbBuffer);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}.zip"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Yedekleme başarısız', detail: e.message }, { status: 500 });
  }
}
