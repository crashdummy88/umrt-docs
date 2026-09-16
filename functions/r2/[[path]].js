/**
 * GET /r2/<key> -- serves a work-order photo out of the umrt-work-order-photos
 * R2 bucket. Unlike united-mobile-rv's forum /r2/ route (fully public --
 * forum images are meant to be seen by anyone), these are a customer's
 * own repair photos: only the admin or the job's owning customer
 * (session email matches jobs.email) may view one. job_id is embedded in
 * the key itself (wo/<job_id>/<random>.<ext>, see migration 0002 and
 * api/work-order-photos/upload.js) so ownership is one query, not a join
 * through work_order_photos on every image request.
 */
import { getSessionUser, isAdminUser, json } from '../_lib/auth.js';

export async function onRequestGet(context) {
  const { env, params, request } = context;
  if (!env.MEDIA) return new Response('Not configured', { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join('/') : params.path;
  if (!key || !key.startsWith('wo/')) return new Response('Not found', { status: 404 });

  const jobId = key.split('/')[1];
  if (!jobId) return new Response('Not found', { status: 404 });

  const user = await getSessionUser(env, request);
  if (!user) return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });

  if (!isAdminUser(user, env)) {
    if (!env.DB) return new Response('Not found', { status: 404 });
    const job = await env.DB.prepare('SELECT email FROM jobs WHERE id = ?').bind(jobId).first();
    const owner = job && job.email && String(job.email).toLowerCase() === String(user.email).toLowerCase();
    if (!owner) return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }

  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  // Private, not the forum route's long public cache -- access is
  // per-viewer here, so a shared/proxy cache must not serve one
  // customer's cached response to another.
  headers.set('Cache-Control', 'private, max-age=3600');

  return new Response(object.body, { headers });
}
