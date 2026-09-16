/**
 * POST /api/work-order-photos/upload -- attach one photo to a job's work
 * order. Admin-only (technician uploads from the field, same as filling
 * in diagnosis/parts on the edit page) -- these are private per-customer
 * photos, not public forum images, so this deliberately does NOT reuse
 * united-mobile-rv's /api/upload.js pattern's public-read model.
 *
 * multipart/form-data: "image" (file), "job_id", optional "caption".
 */
import { getSessionUser, isAdminUser, randomToken, json } from '../../_lib/auth.js';

const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic', // iPhone camera default -- techs shoot from the field
};
const MAX_BYTES = 8 * 1024 * 1024; // 8MB -- real repair photos, not avatars

export async function onRequestPost(context) {
  const { env, request } = context;
  const user = await getSessionUser(env, request);
  if (!user || !isAdminUser(user, env)) {
    return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }
  if (!env.DB) return json({ error: 'no_db' }, 503);
  if (!env.MEDIA) return json({ error: 'not_configured' }, 503);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'invalid_form' }, 400);
  }

  const jobId = form.get('job_id');
  if (!jobId || typeof jobId !== 'string') {
    return json({ error: 'missing_job_id' }, 400);
  }
  const job = await env.DB.prepare('SELECT id FROM jobs WHERE id = ?').bind(jobId).first();
  if (!job) return json({ error: 'job_not_found' }, 404);

  const file = form.get('image');
  if (!file || typeof file === 'string') {
    return json({ error: 'missing_file' }, 400);
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return json({ error: 'unsupported_type', message: 'Only JPEG, PNG, WEBP, or HEIC photos are allowed.' }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: 'too_large', message: 'Photo must be under 8MB.' }, 400);
  }

  const caption = typeof form.get('caption') === 'string' ? form.get('caption').slice(0, 200) : null;

  // job_id embedded in the key on purpose -- see migration 0002's header
  // comment: lets functions/r2/[[path]].js check ownership straight from
  // the key with no extra DB join on every image request.
  const key = `wo/${jobId}/${await randomToken(16)}.${ext}`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const id = await randomToken(16);
  await env.DB.prepare(
    `INSERT INTO work_order_photos (id, job_id, r2_key, caption, bytes, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, jobId, key, caption, file.size, user.id).run();

  return json({ success: true, photo: { id, job_id: jobId, r2_key: key, caption, url: `/r2/${key}` } });
}
