import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, test, run } from '../lib/tiny-test.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

const pages = [
  'index.html',
  'sop/index.html',
  'sop/estimate/index.html',
  'estimates/index.html',
  'guides/index.html',
  '404.html',
];

test('home / guides / sop / estimates keep convert lock hrefs', () => {
  for (const rel of pages) {
    const html = read(rel);
    assert.match(html, /href="tel:\+16166065277"/, `${rel} missing Call`);
    assert.match(html, /href="sms:\+16166065277"/, `${rel} missing Text Now`);
    assert.match(html, /united-mobile-rv-llc\.square\.site/, `${rel} missing Square Book`);
    assert.equal(html.includes('pages.dev'), false, `${rel} has pages.dev`);
    assert.equal(html.includes('Prefer Text'), false, `${rel} has Prefer Text`);
    assert.equal(html.includes('book.unitedmobilerv.com'), false, `${rel} retargets Book`);
  }
});

test('docs theme uses Pages dark/gold tokens', () => {
  const css = read('design/docs-theme.css');
  assert.match(css, /--black:\s*#1A1A1A/);
  assert.match(css, /--gold:\s*#C9972C/);
  assert.match(css, /background:\s*var\(--black\)/);
});

test('convert-chrome.js never remaps sms: to tel:', () => {
  const js = read('design/convert-chrome.js');
  assert.equal(js.includes("setAttribute('href', 'tel:") || js.includes("href = 'tel:"), false);
  assert.match(js, /sms:\+16166065277/);
  assert.match(js, /Never remap sms:/);
});

test('guides stay a bridge to the WP Field Guide hub', () => {
  const html = read('guides/index.html');
  assert.match(html, /href="https:\/\/unitedmobilerv\.com\/guide\/"/);
});

test('SOP / ESTIMATE keep staff gate (tip pattern, not #15 rewrite)', () => {
  assert.match(read('functions/sop/estimate/_middleware.js'), /require-staff/);
  assert.match(read('functions/estimates/_middleware.js'), /require-staff/);
  assert.match(read('functions/_lib/require-staff.js'), /getSessionUser/);
});

await run();
