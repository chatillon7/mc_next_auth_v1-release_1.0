import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

async function getSessionUserId() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  if (!cookie) return null;
  const session = await decrypt(cookie);
  return session?.userId || null;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  let tickets;
  if (id) {
    tickets = await prisma.ticket.findUnique({
      where: { id: Number(id) },
      include: { user: { select: { id: true, name: true } } }
    });
  } else if (userId) {
    tickets = await prisma.ticket.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } }
    });
  } else {
    tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } }
    });
  }
  return Response.json({ tickets });
}

export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: 'Giriş gerekli' }, { status: 401 });
  }
  const body = await req.json();
  const { subject, description } = body;
  if (!subject || !description) {
    return Response.json({ error: 'Konu ve açıklama zorunlu' }, { status: 400 });
  }
  const ticket = await prisma.ticket.create({
    data: {
      subject,
      description,
      userId,
      status: 'Cevaplanmadı',
    },
  });
  return Response.json({ ticket });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Eksik ID' }, { status: 400 });
  try {
    await prisma.ticket.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: 'Talep silinemedi.' }, { status: 500 });
  }
}

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Eksik ID' }, { status: 400 });
  const body = await req.json();
  const { status } = body;
  try {
    const updated = await prisma.ticket.update({ where: { id: Number(id) }, data: { status } });
    return Response.json({ success: true, ticket: updated });
  } catch (e) {
    return Response.json({ error: 'Durum güncellenemedi.' }, { status: 500 });
  }
}
