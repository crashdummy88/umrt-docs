/**
 * GET /api/my-jobs -- every job belonging to the signed-in user, matched
 * by email against the shared jobs table (same D1 as umrt-portal, same
 * Google account a customer already uses there -- see functions/_lib/auth.js
 * upsertOAuthUser, which keys the users table by email). No new auth
 * system, no per-job link/token -- any authenticated user can call this
 * and gets back only rows matching their own session email.
 */
import { getSessionUser, json } from '../_lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const user = await getSessionUser(env, request);
  if (!user) return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  if (!env.DB) return json({ jobs: [] }, 200, { 'Cache-Control': 'no-store' });

  const { results } = await env.DB.prepare(
    `SELECT j.id, j.rv_year, j.rv_make, j.rv_model, j.issue, j.status, j.created_at,
       w.id AS work_order_id, w.status AS wo_status, w.updated_at AS wo_updated_at
     FROM jobs j
     LEFT JOIN work_orders w ON w.job_id = j.id
     WHERE j.email = ?
     ORDER BY j.created_at DESC`
  ).bind(user.email).all();

  return json({ jobs: results || [] }, 200, { 'Cache-Control': 'no-store' });
}
