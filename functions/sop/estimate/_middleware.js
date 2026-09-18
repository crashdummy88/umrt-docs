/** Old path → canonical ESTIMATE hub (auth already checked by /sop/_middleware). */
export async function onRequest(context) {
  return Response.redirect(new URL('/estimates/', context.request.url), 302);
}
