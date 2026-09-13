-- Work orders: the official record of what was actually done on a job.
-- Extends umrt-portal's jobs table (same shared D1 database, id
-- cad7eb04-167f-4330-b7e4-5e35a52de927) rather than duplicating
-- customer/job data. Purely additive -- does not alter the jobs, users,
-- or sessions tables in any way.
--
-- One job has at most one work order (1:1). If multi-visit jobs ever
-- need more than one, this will need revisiting (e.g. a visit_number
-- column + composite handling) -- not needed yet.

CREATE TABLE IF NOT EXISTS work_orders (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  technician_name TEXT NOT NULL DEFAULT 'Matt',
  diagnosis TEXT,
  work_performed TEXT,
  parts_used TEXT,              -- free text, one line per part/qty/price
  labor_hours REAL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | completed | void
  customer_signed_name TEXT,
  customer_signed_at TEXT,
  technician_signed_at TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_work_orders_job_id ON work_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
