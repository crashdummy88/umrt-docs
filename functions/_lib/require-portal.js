import { getSessionUser } from './auth.js';
import { portalAccountRedirect } from './safe-next.js';

/**
 * Gate /sop/* and /estimates/* on a real portal/central (or legacy docs)
 * DB session. umrt_sso alone is not enough. Unauth → portal account with
 * a safe ?next= back to this docs path.
 */
export async function onRequest(context) {
  const user = await getSessionUser(context.env, context.request);
  if (!user) return portalAccountRedirect(context.request);
  const res = await context.next();
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
