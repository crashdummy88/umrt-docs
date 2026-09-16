/**
 * DELETE /api/work-order-photos/:id -- remove one photo (R2 object + row).
 * Admin-only, same gate as upload.js.
 */
import { getSessionUser, isAdminUser, json } from '../../_lib/auth.js';

export async function onRequestDelete(context) {
  const { env, request, params } = context;
  const user = await getSessionUser(env, request);
  if (!user || !isAdminUser(user, env)) {
    return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }
  if (!env.DB) return json({ error: 'no_db' }, 503);

  const photo = await env.DB.prepare('SELECT id, r2_key FROM work_order_photos WHERE id = ?').bind(params.id).first();
  if (!photo) return json({ error: 'not_found' }, 404);

  if (env.MEDIA) {
    await env.MEDIA.delete(photo.r2_key);
  }
  await env.DB.prepare('DELETE FROM work_order_photos WHERE id = ?').bind(photo.id).run();

  return json({ success: true });
}
