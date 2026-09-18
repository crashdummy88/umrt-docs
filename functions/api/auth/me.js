import { getSessionUser, isAdminUser, isStaffUser, json, sessionCookie } from '../../_lib/auth.js';
import { readSsoCookie } from '../../_lib/sso.js';

export async function onRequestGet(context) {
  const user = await getSessionUser(context.env, context.request);
  if (user) {
    return json({
      user,
      admin: isAdminUser(user, context.env),
      staff: isStaffUser(user, context.env),
    }, 200, { 'Cache-Control': 'no-store' });
  }

  // Fallback: no DB session, but recognized via the shared
  // cross-subdomain SSO cookie (e.g. logged in on forum first).
  // Display-only -- does NOT open /sop/ or /estimates/, which still
  // require getSessionUser (central or legacy docs session).
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
