# umrt-docs

Docs site for United Mobile RV LLC (Cloudflare Pages).

**Public surface** is a searchable Field Guide index — buying guides and troubleshooting in one catalog, grouped like the `/guide/` system list (Electrical, Lithium & Solar, Appliances, Generator, Seasonal). No SOP teasers, work-order blurbs, or staff tools on the homepage.

**Staff / customer tools** stay on this host but are not promoted:

- `/account/` — customer repair history (Google sign-in, same account as the portal)
- `/work-orders/` — admin write-up + photos (`ADMIN_EMAILS`)
- `/sop/internal/` and `/sop/estimate/` — staff-gated stubs. Estimates and booking live on Square; do not pitch a gated SOP portal to customers.

## Chrome

Home · Shop · Book · Forum · Software · Docs

- **Home** → https://unitedmobilerv.com/ (not “MAIN HUB”)
- **Book** → https://united-mobile-rv-llc.square.site/
- No Portal / Status in customer chrome
- Call `(616) 606-5277` (`tel:+16166065277`) and **Text Now** (`sms:+16166065277`) stay in the footer and mobile bar only
- Dark/gold Pages tokens: `#1A1A1A` / `#C9972C` / `#0C0C0C`

## Data

Shares `umrt-portal-db` (D1, binding `DB`) with `umrt-portal`. Work-order photos live in `umrt-work-order-photos` (R2, binding `MEDIA`).

## Secrets (env var names only)

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`
- `ADMIN_EMAILS` — comma-separated; falls back to the owner account if unset
- `STAFF_EMAILS` — optional extra staff list for SOP/ESTIMATE
- `SSO_SHARED_SECRET` — optional display-only recognition

Unknown routes serve `404.html` with status 404. Sitemap lists finished guides only.
