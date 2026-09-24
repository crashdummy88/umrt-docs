# umrt-docs

Docs site for United Mobile RV LLC (Cloudflare Pages). Two real audiences:

- **Customers** — `/account/`: sign in with Google (same account as portal.unitedmobilerv.com)
  to see their own job's diagnosis, work performed, parts used, and repair
  photos, once the technician marks the work order complete.
- **Internal** — `/work-orders/`: admin-only (`ADMIN_EMAILS`), where the
  technician writes the diagnosis/work/parts, attaches photos, and both
  sides sign off. This is the "official record" a customer later sees
  read-only in `/account/`.
- `/` and `/guides/` — public job is a searchable catalog of the Field Guide
  set (client-side `?q=` / `?cat=`). Cards link `/guides/<slug>/` on this host
  plus the WP source `unitedmobilerv.com/guide/<slug>/`. Article bodies stay
  the WordPress-adapted how-tos — the catalog does not replace them with stubs.
  Categories: electrical, power, solar, wireless, plumbing, LP gas, appliances,
  roof & slides, chassis & towing, generators, seasonal, reference.
- `/sop/` — staff teaser only (`noindex`). Not part of the public catalog.
  `/sop/internal/` and `/sop/estimate/` stay staff-gated. Square owns
  SOP/ESTIMATE product work; this host does not add public SOP/ESTIMATE gates.
  `/account/` and `/work-orders/` are not advertised on `/` or `/guides/`.
- `/policies/` — public Matt-provided business PDFs (downloads only, not
  Field Guides). `/policies/*.pdf`. Not WordPress articles.

## Forum pin CTAs (not in this PR)

After the catalog lands, Docs CTAs for **winterize, 12V, solar, slides,
generator** must use real forum pin URLs published by Cloudflare. Slots live
in `design/docs-catalog.js` as `FORUM_PINS` with `href: null`. Do not invent
slugs. Do not point those CTAs at the generic forum home. The row renders
only after a pin URL is filled in.

## Convert chrome
- Call (616) 606-5277 → `tel:+16166065277` · Text Now → `sms:+16166065277` · Book → https://united-mobile-rv-llc.square.site/ · leftover `/go/book` 302s there
- Sticky mobile bar (`.umrt-mobile-bar`): Call · Text Now (gold) · Book (Square URL unchanged) · Join the Free Forum → `https://forum.unitedmobilerv.com/` (ghost)
- Applied on `/`, `/guides/`, `/sop/`, `/work-orders/` via `/design/convert-chrome.css`/`.js` -- no "Call (older phones)"
- Platform bar lock: Home → `https://unitedmobilerv.com/` · Services → `https://unitedmobilerv.com/service/` · Shop · Book (Square) · Forum · Software · Docs (current). Same-window land-to-land. No Portal / Status. No sticky “United Mobile RV” brand TEXT in chrome (page h1 is the title). No Book rewires (`book.*` stays unused). Field Guides stay on WP + this docs host — not in other products' chrome.
- Mesh lands stay on custom domains (never `book.*` for Book)

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

Unknown routes serve `404.html` with status 404 (`/* /404.html 404`). Sitemap lists the catalog, adapted Field Guide pages, and public policy PDFs — not SOP internals.
