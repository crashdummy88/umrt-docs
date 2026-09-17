import { getSessionUser, isStaffUser } from './auth.js';

function redirectToSop(request, reason) {
  const dest = new URL('/sop/', request.url);
  dest.searchParams.set('auth', reason);
  return Response.redirect(dest.toString(), 302);
}

/** Gate /sop/internal/* and /sop/estimate/* — same staff check as work-orders admin, plus optional STAFF_EMAILS. */
export async function onRequest(context) {
  const user = await getSessionUser(context.env, context.request);
  if (!user) return redirectToSop(context.request, 'required');
  if (!isStaffUser(user, context.env)) return redirectToSop(context.request, 'forbidden');
  const res = await context.next();
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
