/**
 * GET /api/work-orders — every job, left-joined with its work order (if any).
 * Admin-only. This is the dashboard list: shows which jobs still need a
 * work order written up, and which are drafted/completed/void.
 */
import { getSessionUser, isAdminUser, json } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const user = await getSessionUser(env, request);
  if (!user || !isAdminUser(user, env)) {
    return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }
  if (!env.DB) {
    return json({ jobs: [] }, 200, { 'Cache-Control': 'no-store' });
  }

  const { results } = await env.DB.prepare(
    `SELECT
       j.id AS job_id, j.full_name, j.phone, j.email, j.rv_year, j.rv_make, j.rv_model,
       j.issue, j.city, j.state, j.status AS job_status, j.created_at AS job_created_at,
       w.id AS work_order_id, w.status AS wo_status, w.technician_name,
       w.labor_hours, w.updated_at AS wo_updated_at
     FROM jobs j
     LEFT JOIN work_orders w ON w.job_id = j.id
     ORDER BY j.created_at DESC
     LIMIT 300`
  ).all();

  return json({ jobs: results || [] }, 200, { 'Cache-Control': 'no-store' });
}
