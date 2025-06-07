import prisma from './prisma';

export async function getUserByName(name) {
  if (!name) return null;
  try {
    return await prisma.user.findUnique({
      where: { name },
    });
  } catch (error) {
    return null;
  }
}
