export const config = { matcher: '/rest/v1/:path*' };

const SB_HOST = 'hwsgawbvpkizpgwoybme.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3c2dhd2J2cGtpenBnd295Ym1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjU1NzgsImV4cCI6MjA5MTc0MTU3OH0.6AveHSFyHlBprWFaKp112TElHpdVQHXCx5rFOc2KUmw';

export default async function middleware(request) {
  const url = new URL(request.url);
  const sbUrl = `https://${SB_HOST}${url.pathname}${url.search}`;
  
  const res = await fetch(sbUrl, {
    method: request.method,
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
    },
    body: request.body,
  });
  
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
