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
  'estimates/index.html',
  'guides/index.html',
];

test('SOP + ESTIMATE + home keep convert lock hrefs', () => {
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

test('SOP + ESTIMATE footer mesh: Main Hub, Guides=/guide/, Forum, Shop', () => {
  for (const rel of ['sop/index.html', 'estimates/index.html']) {
    const html = read(rel);
    assert.match(html, /href="https:\/\/unitedmobilerv\.com\/"/);
    assert.match(html, /href="https:\/\/unitedmobilerv\.com\/guide\/"/);
    assert.match(html, /href="https:\/\/forum\.unitedmobilerv\.com\/"/);
    assert.match(html, /href="https:\/\/shop\.unitedmobilerv\.com\/"/);
  }
});

test('guides stay a bridge to the WP Field Guide hub', () => {
  const html = read('guides/index.html');
  assert.match(html, /href="https:\/\/unitedmobilerv\.com\/guide\/"/);
});

test('convert-chrome.js never remaps sms: to tel:', () => {
  const js = read('design/convert-chrome.js');
  assert.equal(js.includes('setAttribute(\'href\', \'tel:') || js.includes('href = \'tel:'), false);
  assert.match(js, /sms:\+16166065277/);
  assert.match(js, /Never remap sms:/);
});

await run();
