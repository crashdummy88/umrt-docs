import { getSessionUser, json, sessionCookie } from '../../_lib/auth.js';
import { readSsoCookie } from '../../_lib/sso.js';

export async function onRequestGet(context) {
  const user = await getSessionUser(context.env, context.request);
  if (user) {
    return json({ user }, 200, { 'Cache-Control': 'no-store' });
  }

  // Fallback: no docs session, but recognized via the shared
  // cross-subdomain SSO cookie (e.g. logged in on forum/portal first).
  // Display-only -- does NOT grant account access, which still requires
  // a real docs session via getSessionUser above.
  if (context.env.SSO_SHARED_SECRET) {
    const identity = await readSsoCookie(context.request, context.env.SSO_SHARED_SECRET);
    if (identity) {
      return json(
        { user: { name: identity.name, picture: identity.avatar, email: identity.email, ssoOnly: true } },
        200,
        { 'Cache-Control': 'no-store' }
      );
    }
  }

  return json({ error: 'unauthorized' }, 401, {
    'Set-Cookie': sessionCookie('', true),
    'Cache-Control': 'no-store',
  });
}
