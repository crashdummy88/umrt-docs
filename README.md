# umrt-docs

Docs site for United Mobile RV LLC (Cloudflare Pages). Two real audiences:

- **Customers** — `/account/`: sign in with Google (same account as portal.unitedmobilerv.com)
  to see their own job's diagnosis, work performed, parts used, and repair
  photos, once the technician marks the work order complete.
- **Internal** — `/work-orders/`: admin-only (`ADMIN_EMAILS`), where the
  technician writes the diagnosis/work/parts, attaches photos, and both
  sides sign off. This is the "official record" a customer later sees
  read-only in `/account/`.
- `/guides/`, `/sop/` — public field-guide/SOP stubs, unrelated to a
  specific job.

## Convert chrome
- Call (616) 606-5277 → `tel:+16166065277` · Text Now → `sms:+16166065277` · Book → https://united-mobile-rv-llc.square.site/ · leftover `/go/book` 302s there
- Applied on `/`, `/guides/`, `/sop/`, `/work-orders/` via `/design/convert-chrome.css`/`.js` -- no "Call (older phones)"

## Data

Shares `umrt-portal-db` (D1, binding `DB`) with `umrt-portal` — same
`jobs`/`users`/`sessions` tables, no data duplication. `work_orders` and
`work_order_photos` are this project's own tables in that same database
(`migrations/`). Photos live in the `umrt-work-order-photos` R2 bucket
(binding `MEDIA`) — private per-job, served with an ownership check via
`functions/r2/[[path]].js` (not the forum's fully-public model).

## Secrets (env var names only)

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` — same
  Google OAuth app as umrt-portal, so one sign-in works on both.
- `ADMIN_EMAILS` — comma-separated; falls back to the owner's account if unset.
- `SSO_SHARED_SECRET` — optional, cross-subdomain "already signed in
  elsewhere" recognition only, never grants access by itself.

Tokens: `#1A1A1A` / `#C9972C` · v0 is static HTML + Pages Functions.
