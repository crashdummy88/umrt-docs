-- Photos attached to a work order -- the "tech notes and photos" piece of
-- the customer-facing docs feature (added 2026-09-16). Many-per-job,
-- unlike work_orders' 1:1 with jobs, since a real repair usually needs
-- more than one photo (before/after, part number, damage close-up).
--
-- r2_key points into the umrt-work-order-photos R2 bucket (see
-- wrangler.toml), format `wo/<job_id>/<random>.<ext>` -- job_id is
-- embedded in the key on purpose so functions/r2/[[path]].js can check
-- photo ownership (admin, or the signed-in customer whose email matches
-- that job) straight from the key, no extra join needed on every image
-- request.

CREATE TABLE IF NOT EXISTS work_order_photos (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  caption TEXT,
  bytes INTEGER,
  uploaded_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_work_order_photos_job_id ON work_order_photos(job_id);
