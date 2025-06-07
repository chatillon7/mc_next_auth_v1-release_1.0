export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) return Response.json({ error: 'Eksik kullanıcı adı.' }, { status: 400 });
  const mojangRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
  if (!mojangRes.ok) {
    return Response.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
  }
  const data = await mojangRes.json();
  return Response.json(data);
}
