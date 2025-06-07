import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export async function GET() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  if (!cookie) return Response.json({ user: null });
  const session = await decrypt(cookie);
  if (!session?.userId) return Response.json({ user: null });
  return Response.json({ user: session });
}
