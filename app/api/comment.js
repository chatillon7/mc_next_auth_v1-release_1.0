import prisma from '@/lib/prisma';
import { getUser } from '@/lib/dal';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const profileName = searchParams.get('user');
  if (!profileName) return Response.json({ comments: [] });
  const profile = await prisma.user.findUnique({ where: { name: profileName } });
  if (!profile) return Response.json({ comments: [] });
  const comments = await prisma.comment.findMany({
    where: { profileId: profile.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
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
    include: { user: true },
  });
  return Response.json({ comment });
}
