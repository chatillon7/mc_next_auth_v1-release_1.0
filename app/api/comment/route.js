import prisma from '@/lib/prisma';
import { getUser } from '@/lib/dal';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const profileName = searchParams.get('user');
  let comments = [];
  if (profileName) {
    const profile = await prisma.user.findUnique({ where: { name: profileName } });
    if (!profile) return Response.json({ comments: [] });
    comments = await prisma.comment.findMany({
      where: { profileId: profile.id },
      include: { user: true, profile: true },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    comments = await prisma.comment.findMany({
      include: { user: true, profile: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  return Response.json({ comments });
}

export async function POST(req) {
  const sessionUser = await getUser();
  if (!sessionUser) return Response.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  const body = await req.json();
  const { content, profileName } = body;
  if (!content || !profileName) return Response.json({ error: 'Eksik veri.' }, { status: 400 });
  const profile = await prisma.user.findUnique({ where: { name: profileName } });
  if (!profile) return Response.json({ error: 'Profil bulunamadı.' }, { status: 404 });
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: sessionUser.id,
      profileId: profile.id,
    },
    include: { user: true, profile: true },
  });
  return Response.json({ comment });
}

export async function DELETE(req) {
  const sessionUser = await getUser();
  if (!sessionUser) return Response.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Eksik veri.' }, { status: 400 });
  const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });
  if (!comment) return Response.json({ error: 'Yorum bulunamadı.' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (comment.userId !== sessionUser.id && user.role !== 'ADMIN') {
    return Response.json({ error: 'Bu yorumu silme yetkiniz yok.' }, { status: 403 });
  }
  await prisma.comment.delete({ where: { id: Number(id) } });
  return Response.json({ success: true });
}
