import { destroySession, sessionCookie, clearCentralSessionCookie } from '../../_lib/auth.js';
import { clearSsoCookie } from '../../_lib/sso.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  await destroySession(env, request);

  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  headers.append('Set-Cookie', sessionCookie('', true));
  headers.append('Set-Cookie', clearCentralSessionCookie());
  headers.append('Set-Cookie', clearSsoCookie());
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

export async function onRequestGet(context) {
  return onRequestPost(context);
}
