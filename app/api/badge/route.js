import prisma from '@/lib/prisma';

export async function GET() {
  const badges = await prisma.badge.findMany();
  return Response.json(badges);
}

export async function POST(req) {
  const { description, icon, bgColor } = await req.json();
  const badge = await prisma.badge.create({
    data: { description, icon, bgColor },
  });
  return Response.json(badge);
}

export async function PUT(req) {
  const { id, description, icon, bgColor } = await req.json();
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  const badge = await prisma.badge.update({
    where: { id },
    data: { description, icon, bgColor },
  });
  return Response.json(badge);
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  await prisma.userBadge.deleteMany({ where: { badgeId: id } });
  await prisma.badge.delete({ where: { id } });
  return Response.json({ ok: true });
}
