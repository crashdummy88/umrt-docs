import { assert, test, run } from '../lib/tiny-test.js';
import {
  isAllowedDocsPath,
  safeDocsNextPath,
  docsNextUrl,
  safePortalNext,
  portalAccountRedirect,
} from '../../functions/_lib/safe-next.js';

test('allowlisted SOP / ESTIMATE paths pass', () => {
  assert.equal(isAllowedDocsPath('/sop/'), true);
  assert.equal(isAllowedDocsPath('/sop'), true);
  assert.equal(isAllowedDocsPath('/estimates/'), true);
  assert.equal(isAllowedDocsPath('/estimate/'), true);
  assert.equal(isAllowedDocsPath('/sop/internal/'), true);
});

test('non-docs and open-redirect shapes fail closed', () => {
  assert.equal(isAllowedDocsPath('/guides/'), false);
  assert.equal(isAllowedDocsPath('/account/'), false);
  assert.equal(isAllowedDocsPath('//evil.example/'), false);
  assert.equal(isAllowedDocsPath('/sop/../guides/'), false);
  assert.equal(isAllowedDocsPath('/sop/\\evil'), false);
  assert.equal(isAllowedDocsPath(''), false);
});

test('safeDocsNextPath normalizes and falls back to /sop/', () => {
  assert.equal(safeDocsNextPath('/sop'), '/sop/');
  assert.equal(safeDocsNextPath('/estimates'), '/estimates/');
  assert.equal(safeDocsNextPath('/guides/'), '/sop/');
  assert.equal(docsNextUrl('/estimates/'), 'https://docs.unitedmobilerv.com/estimates/');
});

test('safePortalNext: only https docs SOP/ESTIMATE URLs', () => {
  assert.equal(safePortalNext('https://docs.unitedmobilerv.com/sop/'), 'https://docs.unitedmobilerv.com/sop/');
  assert.equal(safePortalNext('/estimates/'), 'https://docs.unitedmobilerv.com/estimates/');
  assert.equal(safePortalNext('https://portal.unitedmobilerv.com/account/'), '');
  assert.equal(safePortalNext('https://evil.example/sop/'), '');
  assert.equal(safePortalNext('http://docs.unitedmobilerv.com/sop/'), '');
  assert.equal(safePortalNext('//docs.unitedmobilerv.com/sop/'), '');
  assert.equal(safePortalNext('https://docs.unitedmobilerv.com/guides/'), '');
});

test('portalAccountRedirect 302s to portal account with safe next', async () => {
  const res = portalAccountRedirect({ url: 'https://docs.unitedmobilerv.com/estimates/' });
  assert.equal(res.status, 302);
  const loc = res.headers.get('Location');
  assert.match(loc, /^https:\/\/portal\.unitedmobilerv\.com\/account\/\?next=/);
  const next = new URL(loc).searchParams.get('next');
  assert.equal(next, 'https://docs.unitedmobilerv.com/estimates/');
});

test('portalAccountRedirect drops a non-allowlisted path to /sop/', async () => {
  const res = portalAccountRedirect({ url: 'https://docs.unitedmobilerv.com/guides/starlink-rv-guide/' });
  const next = new URL(res.headers.get('Location')).searchParams.get('next');
  assert.equal(next, 'https://docs.unitedmobilerv.com/sop/');
});

await run();
