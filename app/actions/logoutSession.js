export async function logoutSession() {
  await fetch('/api/logout', { method: 'POST' });
}
