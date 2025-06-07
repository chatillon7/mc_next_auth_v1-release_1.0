import { getSettings, saveSettings } from '@/lib/settings';

export async function GET() {
  const settings = await getSettings();
  return Response.json(settings);
}

export async function POST(req) {
  const body = await req.json();
  await saveSettings(body);
  return Response.json({ ok: true });
}
