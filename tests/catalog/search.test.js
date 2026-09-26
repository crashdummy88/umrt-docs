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
  return [entry.title, entry.blurb, entry.kind, categoryLabel(entry.category), entry.tags, entry.href, entry.pdf, entry.source].join(' ').toLowerCase();
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
const policies = ENTRIES.filter((e) => e.category === 'policies');
const guides = ENTRIES.filter((e) => e.category !== 'policies');

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
assert(ENTRIES.every((e) => e.title && e.blurb && e.kind && e.category), 'required fields');
assert(guides.every((e) => e.source), 'guide entries have source page URL');
assert(ENTRIES.every((e) => catIds.has(e.category)), 'every entry has a known category');
assert(ENTRIES.filter((e) => e.href).every((e) => e.href.startsWith('/guides/')), 'docs hrefs stay on /guides/');
assert(diskSlugs.every((slug) => ENTRIES.some((e) => e.id === slug)), 'every on-disk /guides/<slug>/ is in the catalog');
assert(ENTRIES.filter((e) => e.href).every((e) => {
  const slug = e.href.replace(/^\/guides\/|\/$/g, '');
  return diskSlugs.includes(slug);
}), 'docs hrefs do not invent thin pages');

assert(CATEGORIES.some((c) => c.id === 'policies'), 'Policies category exists');
assert(policies.length === 5, 'five public policies');
assert(policies.every((e) => e.kind === 'Policy' && e.pdf && !e.href && !e.source), 'policies are PDF downloads, not WP/docs articles');
assert(policies.every((e) => e.pdf.startsWith('/policies/') && e.pdf.endsWith('.pdf')), 'policy PDFs stay under /policies/');
assert(policies.every((e) => !/\$\d|24-hour|14-day/i.test(e.blurb)), 'policy blurbs do not invent terms');

assert(matches(ENTRIES.find((e) => e.id === 'starlink-rv-guide'), 'starlink', 'all'), 'search starlink');
assert(matches(ENTRIES.find((e) => e.id === 'rv-furnace-troubleshooting-guide'), 'sail switch', 'all'), 'search sail switch');
assert(!matches(ENTRIES.find((e) => e.id === 'starlink-rv-guide'), 'furnace', 'all'), 'starlink does not match furnace');
assert(ENTRIES.filter((e) => matches(e, '', 'generators')).every((e) => e.category === 'generators'), 'category filter');
assert(ENTRIES.filter((e) => matches(e, '', 'generators')).length >= 2, 'generators category is populated');
assert(ENTRIES.filter((e) => matches(e, 'victron', 'all')).some((e) => e.id === 'victron-fault-code-guide'), 'victron is searchable');
assert(ENTRIES.some((e) => e.id === 'wireless-landing' && e.source === 'https://unitedmobilerv.com/wireless/' && !e.href), 'WP-only wireless landing');
assert(ENTRIES.some((e) => e.id === 'lithium-buying' && /lithium-battery-buying-guide/.test(e.source) && !e.href), 'WP-only lithium buying');
assert(matches(ENTRIES.find((e) => e.id === 'cancellation-no-show-policy'), 'no-show', 'all'), 'search no-show');
assert(matches(ENTRIES.find((e) => e.id === 'invoice'), 'invoice', 'policies'), 'search invoice in Policies');
assert(ENTRIES.filter((e) => matches(e, 'waiver', 'all')).every((e) => e.category === 'policies'), 'waiver stays in Policies');
assert(!ENTRIES.some((e) => /operating\s+agreement/i.test(haystack(e))), 'catalog has no operating agreement');

const EXPECTED_PINS = {
  winterize: 'https://forum.unitedmobilerv.com/forum/t/tech-winterize',
  '12v': 'https://forum.unitedmobilerv.com/forum/t/tech-12v-battery',
  solar: 'https://forum.unitedmobilerv.com/forum/t/tech-solar',
  slides: 'https://forum.unitedmobilerv.com/forum/t/tech-slides',
  generator: 'https://forum.unitedmobilerv.com/forum/t/tech-generator'
};
assert(Object.keys(FORUM_PINS).length === 5, 'exactly five forum pins');
assert(['winterize', '12v', 'solar', 'slides', 'generator'].every((k) => FORUM_PINS[k]), 'forum pin slots reserved');
assert(Object.keys(FORUM_PINS).every((k) => FORUM_PINS[k].href === EXPECTED_PINS[k]), 'forum pins match Architect GO URLs');
assert(Object.keys(FORUM_PINS).every((k) => !/forum\.unitedmobilerv\.com\/?$/.test(FORUM_PINS[k].href)), 'pins are not the generic forum home');

const expectedPdfs = [
  'cancellation-no-show-policy.pdf',
  'service-estimate.pdf',
  'invoice.pdf',
  'service-agreement.pdf',
  'limitation-of-liability-waiver.pdf'
];
for (const name of expectedPdfs) {
  const full = path.join(root, 'policies', name);
  assert(fs.existsSync(full) && fs.readFileSync(full, { encoding: null }).subarray(0, 4).toString() === '%PDF', name + ' is a PDF');
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const guidesHtml = fs.readFileSync(path.join(root, 'guides/index.html'), 'utf8');
const policiesHtml = fs.readFileSync(path.join(root, 'policies/index.html'), 'utf8');
const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
const sop = fs.readFileSync(path.join(root, 'sop/index.html'), 'utf8');
for (const [name, html] of [['home', home], ['guides', guidesHtml], ['policies', policiesHtml]]) {
  assert(!/\/sop\//.test(html), name + ' has no SOP link');
  assert(!/\/work-orders\//.test(html), name + ' has no work-orders link');
  assert(!/My Jobs/.test(html), name + ' has no My Jobs teaser');
  assert(/umrt-cta-row/.test(html), name + ' has Call / Text Now / Book convert row');
  assert(/tel:\+16166065277/.test(html), name + ' Call is tel:+16166065277');
  assert(/sms:\+16166065277/.test(html), name + ' Text Now is sms:+16166065277');
  assert(!/book\.unitedmobilerv\.com/.test(html), name + ' does not rewire Book');
  assert(/united-mobile-rv-llc\.square\.site/.test(html), name + ' keeps Square Book');
  assert(!/MAIN HUB/.test(html), name + ' keeps Home label');
  assert(/docs-catalog\.js/.test(html), name + ' loads catalog script');
  assert(/data-platform-link="hub">Home</.test(html), name + ' keeps Home chrome');
  assert(/data-platform-link="services">Services</.test(html), name + ' keeps Services chrome');
  assert(/href="https:\/\/unitedmobilerv\.com\/service\/" data-platform-link="services"/.test(html), name + ' Services lands on /service/');
  assert(/\/policies\//.test(html), name + ' links Policies');
  assert(!/operating\s+agreement/i.test(html), name + ' does not mention operating agreement');
}
assert(/data-default-cat="policies"/.test(policiesHtml), 'policies index presets the Policies chip');
assert(!/policy-terms/.test(policiesHtml), 'policies index does not invent term lists');
assert(!/\$\d/.test(policiesHtml), 'policies index does not invent fee text');
assert(/guides and troubleshooting/.test(notFound), '404 points at the catalog');
assert(/\/policies\//.test(notFound), '404 links Policies');
assert(!/operating\s+agreement/i.test(notFound), '404 does not mention operating agreement');
assert(/noindex/.test(sop), 'SOP is noindex');
assert(/Not part of the public docs catalog/.test(sop), 'SOP is not advertised as catalog');

for (const name of expectedPdfs) {
  const slug = name.replace(/\.pdf$/, '');
  const stub = path.join(root, 'policies', slug, 'index.html');
  assert(!fs.existsSync(stub), slug + ' has no invented HTML article');
}

const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
assert(!/operating-agreement/.test(redirects), 'no operating-agreement redirect');
for (const name of expectedPdfs) {
  assert(redirects.includes('/policies/' + name), name + ' redirect target exists');
}

const furnace = fs.readFileSync(path.join(root, 'guides/rv-furnace-troubleshooting-guide/index.html'), 'utf8');
assert(/sail switch/.test(furnace), '#22 furnace body is preserved');
const articleSop = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /href="\/sop\/"/.test(html) || /href="\/account\/"/.test(html);
});
assert(articleSop.length === 0, 'article pages do not advertise SOP or My Jobs');
const articleConvert = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return !/umrt-cta-row/.test(html) || !/tel:\+16166065277/.test(html) || !/sms:\+16166065277/.test(html) || !/united-mobile-rv-llc\.square\.site/.test(html);
});
assert(articleConvert.length === 0, 'every article has Call / Text Now / Square Book');
assert(diskSlugs.every((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return !/book\.unitedmobilerv\.com/.test(html) && !/MAIN HUB/.test(html);
}), 'articles do not reopen book.* or MAIN HUB');
const articleBanners = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /Adapted from/.test(html) || /class="source wrap"/.test(html);
});
assert(articleBanners.length === 0, 'no Adapted-from source banner');
const articlePricing = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /Pricing teaser/.test(html) || /What does a visit cost/.test(html);
});
assert(articlePricing.length === 0, 'no pricing teaser blocks or visit-cost cards');
const articleDollars = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /\$175|\$225|Trip fee <strong>\$75/.test(html);
});
assert(articleDollars.length === 0, 'no dollar teaser cards that replace booking');
const articleWpCta = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  const wp = 'https://unitedmobilerv.com/guide/' + slug + '/';
  return !html.includes('guide-end-cta') || !html.includes(wp) || !/>Source page</.test(html);
});
assert(articleWpCta.length === 0, 'every article has bottom Source page button');
const articleBookCta = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return !/class="btn"[^>]*>Book service</.test(html);
});
assert(articleBookCta.length === 0, 'every article has gold Book service button');
const articleNav = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /WP library/.test(html) || /WordPress library/.test(html) || /WordPress-adapted/.test(html);
});
assert(articleNav.length === 0, 'no WP library / adapted advertising on articles');
const articleCorridor = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /Active corridor:/.test(html) || !/class="service-area"/.test(html) || !/Washington \(on-site booking\); remote help anywhere/.test(html);
});
assert(articleCorridor.length === 0, 'every article has professional service-area copy');
const nestedCta = diskSlugs.filter((slug) => {
  const html = fs.readFileSync(path.join(root, 'guides', slug, 'index.html'), 'utf8');
  return /service-card[\s\S]{0,400}guide-end-cta/.test(html);
});
assert(nestedCta.length === 0, 'end CTA is not nested in a service card');

const CHROME_ORDER = ['Home', 'Services', 'Shop', 'Book', 'Forum', 'Software', 'Docs'];
const CHROME_HREFS = {
  Home: 'https://unitedmobilerv.com/',
  Services: 'https://unitedmobilerv.com/service/',
  Shop: 'https://shop.unitedmobilerv.com/',
  Book: 'https://united-mobile-rv-llc.square.site/',
  Forum: 'https://forum.unitedmobilerv.com/',
  Software: 'https://software.unitedmobilerv.com/',
  Docs: 'https://docs.unitedmobilerv.com/'
};
function walkHtml(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(full, acc);
    else if (ent.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}
const chromePages = walkHtml(root, []).filter((file) => {
  const html = fs.readFileSync(file, 'utf8');
  return /umrt-platform-bar/.test(html);
});
assert(chromePages.length >= 80, 'platform bar is shared across public + staff chrome');
for (const file of chromePages) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const bar = html.match(/<div class="umrt-platform-bar-inner">([\s\S]*?)<\/div>/);
  assert(bar, rel + ' has platform-bar inner');
  const labels = [...bar[1].matchAll(/>(Home|Services|Shop|Book|Forum|Software|Docs)</g)].map((m) => m[1]);
  assert(labels.join('|') === CHROME_ORDER.join('|'), rel + ' platform bar order');
  for (const [label, href] of Object.entries(CHROME_HREFS)) {
    const re = new RegExp('href="' + href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>' + label + '<');
    assert(re.test(bar[1]), rel + ' platform ' + label + ' href');
  }
  assert(!/book\.unitedmobilerv\.com/.test(html), rel + ' never uses book.*');
  assert(!/Adapted from/.test(html) && !/class="source wrap"/.test(html), rel + ' has no Adapted-from banner');
  const foot = html.match(/<footer[\s\S]*?<\/footer>/);
  if (foot) {
    const footLabels = [...foot[0].matchAll(/>(Home|Services|Shop|Book|Forum|Software|Docs)</g)].map((m) => m[1]);
    if (footLabels.includes('Home')) {
      assert(footLabels.join('|') === CHROME_ORDER.join('|'), rel + ' footer chrome order');
      assert(foot[0].includes('https://unitedmobilerv.com/service/'), rel + ' footer Services href');
      assert(foot[0].includes('https://united-mobile-rv-llc.square.site/'), rel + ' footer Book stays Square');
    }
  }
}

for (const [name, html] of [['home', home], ['guides', guidesHtml], ['policies', policiesHtml]]) {
  assert(!/WP library/.test(html), name + ' has no WP library label');
  assert(!/WordPress-adapted/.test(html), name + ' does not advertise adapted');
  assert(!/WordPress library/.test(html), name + ' has no WordPress library footer');
  assert(/>Book service</.test(html), name + ' has Book service button');
}

const forumMobileCta = /<a href="https:\/\/forum\.unitedmobilerv\.com\/">Join the Free Forum<\/a>/;
const textNowMobile = /<a href="sms:\+16166065277">Text Now<\/a>/;
const mobileBarFiles = walkHtml(root, []).filter((file) => /class="umrt-mobile-bar/.test(fs.readFileSync(file, 'utf8')));
assert(mobileBarFiles.length >= 80, 'sticky mobile bar is on docs pages');
for (const file of mobileBarFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const bars = html.match(/<div class="umrt-mobile-bar[\s\S]*?<\/div>/g) || [];
  assert(bars.length >= 1, rel + ' has a mobile bar');
  for (const bar of bars) {
    assert(forumMobileCta.test(bar), rel + ' mobile bar has Join the Free Forum');
    assert(textNowMobile.test(bar), rel + ' mobile bar keeps Text Now');
    assert(!/class="btn/.test(bar), rel + ' mobile bar is text links, not pills');
    assert(/https:\/\/united-mobile-rv-llc\.square\.site\//.test(bar), rel + ' mobile bar keeps Square Book');
  }
}
const portScript = fs.readFileSync(path.join(root, 'scripts/port-mothership-guides.py'), 'utf8');
assert(forumMobileCta.test(portScript), 'guide port template includes Join the Free Forum');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
