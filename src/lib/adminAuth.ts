export function requireAdmin(request: Request): Response | null {
  const token = process.env.HIDAYA_ADMIN_TOKEN;
  if (!token || request.headers.get('authorization') !== `Bearer ${token}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  return null;
}
