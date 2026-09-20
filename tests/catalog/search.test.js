'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const src = fs.readFileSync(path.join(root, 'design/docs-catalog.js'), 'utf8');

const catBlock = src.match(/var CATEGORIES = (\[[\s\S]*?\]);/);
const entBlock = src.match(/var ENTRIES = (\[[\s\S]*?\]);/);
const pinBlock = src.match(/var FORUM_PINS = (\{[\s\S]*?\});/);
if (!catBlock || !entBlock || !pinBlock) {
  console.error('Could not parse catalog data');
  process.exit(1);
}
const CATEGORIES = vm.runInNewContext('(' + catBlock[1] + ')');
const ENTRIES = vm.runInNewContext('(' + entBlock[1] + ')');
const FORUM_PINS = vm.runInNewContext('(' + pinBlock[1] + ')');

function categoryLabel(id) {
  const hit = CATEGORIES.find((c) => c.id === id);
  return hit ? hit.label : id;
}
function haystack(entry) {
  return [entry.title, entry.blurb, entry.kind, categoryLabel(entry.category), entry.tags, entry.href, entry.source].join(' ').toLowerCase();
}
function matches(entry, q, cat) {
  if (cat && cat !== 'all' && entry.category !== cat) return false;
  if (!q) return true;
  return haystack(entry).indexOf(q.toLowerCase()) !== -1;
}

const catIds = new Set(CATEGORIES.map((c) => c.id));
const diskSlugs = fs.readdirSync(path.join(root, 'guides'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok', msg);
  }
}

assert(ENTRIES.length >= 76, 'catalog indexes the #22 Field Guide set');
assert(new Set(ENTRIES.map((e) => e.id)).size === ENTRIES.length, 'ids are unique');
assert(ENTRIES.every((e) => e.title && e.blurb && e.kind && e.category && e.source), 'required fields');
assert(ENTRIES.every((e) => catIds.has(e.category)), 'every entry has a known category');
assert(ENTRIES.filter((e) => e.href).every((e) => e.href.startsWith('/guides/')), 'docs hrefs stay on /guides/');
assert(diskSlugs.every((slug) => ENTRIES.some((e) => e.id === slug)), 'every on-disk /guides/<slug>/ is in the catalog');
assert(ENTRIES.filter((e) => e.href).every((e) => {
  const slug = e.href.replace(/^\/guides\/|\/$/g, '');
  return diskSlugs.includes(slug);
}), 'docs hrefs do not invent thin pages');

assert(matches(ENTRIES.find((e) => e.id === 'starlink-rv-guide'), 'starlink', 'all'), 'search starlink');
assert(matches(ENTRIES.find((e) => e.id === 'rv-furnace-troubleshooting-guide'), 'sail switch', 'all'), 'search sail switch');
assert(!matches(ENTRIES.find((e) => e.id === 'starlink-rv-guide'), 'furnace', 'all'), 'starlink does not match furnace');
assert(ENTRIES.filter((e) => matches(e, '', 'generators')).every((e) => e.category === 'generators'), 'category filter');
assert(ENTRIES.filter((e) => matches(e, '', 'generators')).length >= 2, 'generators category is populated');
assert(ENTRIES.filter((e) => matches(e, 'victron', 'all')).some((e) => e.id === 'victron-fault-code-guide'), 'victron is searchable');
assert(ENTRIES.some((e) => e.id === 'wireless-landing' && e.source === 'https://unitedmobilerv.com/wireless/' && !e.href), 'WP-only wireless landing');
assert(ENTRIES.some((e) => e.id === 'lithium-buying' && /lithium-battery-buying-guide/.test(e.source) && !e.href), 'WP-only lithium buying');

assert(['winterize', '12v', 'solar', 'slides', 'generator'].every((k) => FORUM_PINS[k]), 'forum pin slots reserved');
assert(Object.keys(FORUM_PINS).every((k) => !FORUM_PINS[k].href), 'forum pin hrefs stay unset until CF publishes');

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const guides = fs.readFileSync(path.join(root, 'guides/index.html'), 'utf8');
const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
const sop = fs.readFileSync(path.join(root, 'sop/index.html'), 'utf8');
for (const [name, html] of [['home', home], ['guides', guides]]) {
  assert(!/\/sop\//.test(html), name + ' has no SOP link');
  assert(!/\/work-orders\//.test(html), name + ' has no work-orders link');
  assert(!/My Jobs/.test(html), name + ' has no My Jobs teaser');
  assert(!/umrt-cta-row/.test(html), name + ' has no convert stack');
  assert(!/book\.unitedmobilerv\.com/.test(html), name + ' does not rewire Book');
  assert(/united-mobile-rv-llc\.square\.site/.test(html), name + ' keeps Square Book');
  assert(/docs-catalog\.js/.test(html), name + ' loads catalog script');
  assert(/data-platform-link="hub">Home</.test(html), name + ' keeps Home chrome');
}
assert(/guides and troubleshooting/.test(notFound), '404 points at the catalog');
assert(/noindex/.test(sop), 'SOP is noindex');
assert(/Not part of the public docs catalog/.test(sop), 'SOP is not advertised as catalog');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
