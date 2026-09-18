/** Old staff stub → gated SOP hub (auth already checked by /sop/_middleware). */
export async function onRequest(context) {
  return Response.redirect(new URL('/sop/', context.request.url), 302);
}
