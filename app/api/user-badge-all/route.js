import prisma from '@/lib/prisma';

export async function GET() {
  const userBadges = await prisma.userBadge.findMany({ select: { badgeId: true } });
  return Response.json(userBadges);
}
