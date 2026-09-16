/**
 * GET  /api/work-orders/:job_id — the job plus its work order and photos
 *      (or null work_order if none exists yet). Two callers, both real:
 *      the admin edit page (full job record, can also PUT) and, added
 *      2026-09-16, a signed-in customer viewing their OWN job (job.email
 *      matches their session email) -- read-only, and a reduced set of
 *      job fields (no admin_notes, lead source, or raw Square object
 *      IDs). Ownership is checked here rather than adding a third
 *      endpoint, so the two views can never drift apart.
 * PUT  /api/work-orders/:job_id — create or update the work order.
 *      Admin-only (unchanged). Signing (customer_signed_name/at,
 *      technician_signed_at) is set via dedicated fields in the PUT body
 *      -- once technician_signed_at is set and status is 'completed',
 *      treat the record as final: the UI should stop offering an edit
 *      form and show a read-only/printable view, but nothing here
 *      enforces that server-side yet (small shop, single admin -- add a
 *      status-lock check if this ever needs it).
 */
import { getSessionUser, isAdminUser, randomToken, json } from '../../_lib/auth.js';

const VALID_STATUSES = ['draft', 'completed', 'void'];

// Fields a customer is allowed to see on their own job. Deliberately
// excludes admin_notes, source (internal lead tracking), and the raw
// square_order_id/square_invoice_id object IDs -- square_invoice_url is
// kept since that's the actual pay link a customer needs.
const CUSTOMER_JOB_FIELDS = [
  'id', 'full_name', 'rv_year', 'rv_make', 'rv_model', 'issue', 'city', 'state',
  'status', 'created_at', 'updated_at', 'final_amount_cents', 'payment_method',
  'paid_at', 'square_invoice_url', 'square_invoice_status',
];

function customerSafeJob(job) {
  const out = {};
  for (const k of CUSTOMER_JOB_FIELDS) out[k] = job[k];
  return out;
}

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const user = await getSessionUser(env, request);
  if (!user) return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  if (!env.DB) return json({ error: 'no_db' }, 503);

  const jobId = params.job_id;
  const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(jobId).first();
  if (!job) return json({ error: 'job_not_found' }, 404);

  const admin = isAdminUser(user, env);
  const owner = !admin && job.email && String(job.email).toLowerCase() === String(user.email).toLowerCase();
  if (!admin && !owner) {
    return json({ error: 'unauthorized' }, 401, { 'Cache-Control': 'no-store' });
  }

  let workOrder = await env.DB.prepare('SELECT * FROM work_orders WHERE job_id = ?').bind(jobId).first();
  // A 'draft' work order is Matt's in-progress working notes, not yet
  // meant for the customer to see -- only 'completed' (or 'void', shown
  // so a customer isn't left wondering why nothing appears) is customer-
  // visible. Admin always sees everything regardless of status.
  if (!admin && workOrder && workOrder.status === 'draft') workOrder = null;

  const { results: photos } = !admin && !workOrder
    ? { results: [] }
    : await env.DB.prepare(
        `SELECT id, r2_key, caption, created_at FROM work_order_photos WHERE job_id = ? ORDER BY created_at ASC`
      ).bind(jobId).all();

  return json({
    job: admin ? job : customerSafeJob(job),
    work_order: workOrder || null,
    photos: (photos || []).map((p) => ({ ...p, url: `/r2/${p.r2_key}` })),
  }, 200, { 'Cache-Control': 'no-store' });
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
