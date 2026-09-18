/** Alias → canonical /estimates/ (still portal-gated). */
import { getSessionUser } from '../_lib/auth.js';
import { portalAccountRedirect } from '../_lib/safe-next.js';

export async function onRequest(context) {
  const user = await getSessionUser(context.env, context.request);
  if (!user) return portalAccountRedirect(context.request);
  return Response.redirect(new URL('/estimates/', context.request.url), 302);
}
