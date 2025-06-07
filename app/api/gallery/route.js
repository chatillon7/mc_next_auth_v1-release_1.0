import prisma from '@/lib/prisma';

export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(images);
}

export async function POST(req) {
  const { imageUrl, caption } = await req.json();
  if (!imageUrl) return Response.json({ error: 'Görsel yolu gerekli' }, { status: 400 });
  const image = await prisma.galleryImage.create({ data: { imageUrl, caption } });
  return Response.json(image);
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'ID gerekli' }, { status: 400 });
  await prisma.galleryImage.delete({ where: { id } });
  return Response.json({ ok: true });
}
