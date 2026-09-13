/**
 * GET  /api/work-orders/:job_id — the job plus its work order (or null if
 *      none exists yet).
 * PUT  /api/work-orders/:job_id — create or update the work order for this
 *      job (upsert, keyed on job_id's UNIQUE constraint).
 * Both admin-only. Signing (customer_signed_name/at, technician_signed_at)
 * is set via dedicated fields in the PUT body -- once technician_signed_at
 * is set and status is 'completed', treat the record as final: the UI
 * should stop offering an edit form and show a read-only/printable view,
 * but nothing here enforces that server-side yet (small shop, single
 * admin -- add a status-lock check if this ever needs it).
 */
import { getSessionUser, isAdminUser, randomToken, json } from '../../_lib/auth.js';

const VALID_STATUSES = ['draft', 'completed', 'void'];

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const user = await getSessionUser(env, request);
  if (!user || !isAdminUser(user, env)) {
    return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }
  if (!env.DB) return json({ error: 'no_db' }, 503);

  const jobId = params.job_id;
  const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(jobId).first();
  if (!job) return json({ error: 'job_not_found' }, 404);

  const workOrder = await env.DB.prepare('SELECT * FROM work_orders WHERE job_id = ?').bind(jobId).first();
  return json({ job, work_order: workOrder || null }, 200, { 'Cache-Control': 'no-store' });
}

export async function onRequestPut(context) {
  const { env, request, params } = context;
  const user = await getSessionUser(env, request);
  if (!user || !isAdminUser(user, env)) {
    return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }
  if (!env.DB) return json({ error: 'no_db' }, 503);

  const jobId = params.job_id;
  const job = await env.DB.prepare('SELECT id FROM jobs WHERE id = ?').bind(jobId).first();
  if (!job) return json({ error: 'job_not_found' }, 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const status = body.status !== undefined ? body.status : 'draft';
  if (!VALID_STATUSES.includes(status)) {
    return json({ error: 'invalid_status' }, 400);
  }

  const laborHours = body.labor_hours === undefined || body.labor_hours === null || body.labor_hours === ''
    ? null
    : Number(body.labor_hours);
  if (laborHours !== null && (!Number.isFinite(laborHours) || laborHours < 0)) {
    return json({ error: 'invalid_labor_hours' }, 400);
  }

  const existing = await env.DB.prepare('SELECT id, technician_signed_at FROM work_orders WHERE job_id = ?').bind(jobId).first();

  const technicianName = String(body.technician_name || 'Matt').slice(0, 100);
  const diagnosis = body.diagnosis != null ? String(body.diagnosis).slice(0, 4000) : null;
  const workPerformed = body.work_performed != null ? String(body.work_performed).slice(0, 4000) : null;
  const partsUsed = body.parts_used != null ? String(body.parts_used).slice(0, 4000) : null;
  const customerSignedName = body.customer_signed_name != null ? String(body.customer_signed_name).slice(0, 200) : null;

  if (existing) {
    const technicianSignedAt = body.technician_sign === true
      ? (existing.technician_signed_at || new Date().toISOString())
      : existing.technician_signed_at;
    const customerSignedAt = body.customer_sign === true
      ? new Date().toISOString()
      : (customerSignedName ? undefined : null); // don't clear a prior signature just because the name field wasn't resent

    await env.DB.prepare(
      `UPDATE work_orders SET
         technician_name = ?, diagnosis = ?, work_performed = ?, parts_used = ?,
         labor_hours = ?, status = ?, customer_signed_name = ?,
         customer_signed_at = COALESCE(?, customer_signed_at),
         technician_signed_at = ?, updated_at = datetime('now')
       WHERE job_id = ?`
    ).bind(
      technicianName, diagnosis, workPerformed, partsUsed, laborHours, status,
      customerSignedName, customerSignedAt === undefined ? null : customerSignedAt,
      technicianSignedAt, jobId
    ).run();
  } else {
    const id = await randomToken(16);
    const technicianSignedAt = body.technician_sign === true ? new Date().toISOString() : null;
    const customerSignedAt = body.customer_sign === true ? new Date().toISOString() : null;
    await env.DB.prepare(
      `INSERT INTO work_orders
         (id, job_id, technician_name, diagnosis, work_performed, parts_used,
          labor_hours, status, customer_signed_name, customer_signed_at,
          technician_signed_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, jobId, technicianName, diagnosis, workPerformed, partsUsed, laborHours,
      status, customerSignedName, customerSignedAt, technicianSignedAt, user.id
    ).run();
  }

  const workOrder = await env.DB.prepare('SELECT * FROM work_orders WHERE job_id = ?').bind(jobId).first();
  return json({ work_order: workOrder }, 200, { 'Cache-Control': 'no-store' });
}
