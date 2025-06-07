import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) return Response.json({ error: 'Username required' }, { status: 400 });
  const user = await prisma.user.findUnique({
    where: { name: username },
    include: {
      userBadges: { include: { badge: true } }
    }
  });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  const badges = user.userBadges.map(ub => ub.badge);
  return Response.json(badges);
}

export async function POST(req) {
  const { username, badgeId } = await req.json();
  if (!username || !badgeId) return Response.json({ error: 'Username and badgeId required' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { name: username } });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  if (!badge) return Response.json({ error: 'Badge not found' }, { status: 404 });
  const userBadge = await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: user.id, badgeId } },
    update: {},
    create: { userId: user.id, badgeId },
  });
  return Response.json(userBadge);
}

export async function DELETE(req) {
  const { username, badgeId } = await req.json();
  if (!username || !badgeId) return Response.json({ error: 'Username and badgeId required' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { name: username } });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  await prisma.userBadge.deleteMany({ where: { userId: user.id, badgeId } });
  return Response.json({ ok: true });
}
