import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const userId = searchParams.get('userId');
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  } else if (name) {
    user = await prisma.user.findUnique({ where: { name } });
  } else {
    user = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
  return Response.json({ user });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Eksik ID' }, { status: 400 });
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: 'Kullanıcı silinemedi.' }, { status: 500 });
  }
}

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) return Response.json({ error: 'Eksik kullanıcı adı' }, { status: 400 });
  const body = await req.json();
  let { role } = body;
  if (!role) return Response.json({ error: 'Eksik rol' }, { status: 400 });
  role = role.toUpperCase();
  try {
    const updated = await prisma.user.update({ where: { name }, data: { role } });
    return Response.json({ success: true, user: updated });
  } catch (e) {
    return Response.json({ error: 'Rol güncellenemedi.' }, { status: 500 });
  }
}
