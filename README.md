# umrt-docs

Docs site for United Mobile RV LLC (Cloudflare Pages). Two real audiences:

- **Customers** — `/account/`: sign in with Google (same account as portal.unitedmobilerv.com)
  to see their own job's diagnosis, work performed, parts used, and repair
  photos, once the technician marks the work order complete.
- **Internal** — `/work-orders/`: admin-only (`ADMIN_EMAILS`), where the
  technician writes the diagnosis/work/parts, attaches photos, and both
  sides sign off. This is the "official record" a customer later sees
  read-only in `/account/`.
- `/guides/` — CF surface of Matt’s live Field Guides. Top-set articles are
  adapted from `unitedmobilerv.com/guide/<slug>/` (attributed on each page).
  The full WP hub remains the library. Book → book.unitedmobilerv.com · Forum · Shop · Call/Text.
- `/sop/` — public teaser + Portal login CTA. `/sop/internal/` and
  `/sop/estimate/` are staff-gated stubs (ADMIN or `STAFF_EMAILS`), same
  session check as work orders. Public marketing stays on the main site.

## Convert chrome
- Call (616) 606-5277 → `tel:+16166065277` · Text Now → `sms:+16166065277` · Book → https://book.unitedmobilerv.com/ · leftover `/go/book` 302s there
- Applied on `/`, `/guides/`, `/sop/`, `/work-orders/` via `/design/convert-chrome.css`/`.js` -- no "Call (older phones)"
- Platform bar lock: Home · Shop · Book · Forum · Software · Docs (current). Home → `https://unitedmobilerv.com/`. Book → `https://book.unitedmobilerv.com/` (Square embed host; not bare `united-mobile-rv-llc.square.site`). No Portal / Status. Field Guides stay on WP + this docs `/guides/` bridge — not in the product MESH.

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
- `STAFF_EMAILS` — optional extra staff list for SOP/ESTIMATE (comma-separated).
- `SSO_SHARED_SECRET` — optional, cross-subdomain "already signed in
  elsewhere" recognition only, never grants access by itself.

Tokens: `#1A1A1A` / `#C9972C` · v0 is static HTML + Pages Functions.

Unknown routes serve `404.html` with status 404 (`/* /404.html 404`). Sitemap lists the docs pointer pages only — not SOP internals.
