'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'design/jsonld.js'), 'utf8');
const chrome = fs.readFileSync(path.join(root, 'design/convert-chrome.js'), 'utf8');

const ctx = { window: {}, globalThis: {} };
ctx.window = ctx;
vm.runInNewContext(src, ctx);
const api = ctx.UMRT_DOCS_JSONLD;

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok', msg);
  }
}

assert(!!api, 'helper exports UMRT_DOCS_JSONLD');
assert(api.HOME === 'https://unitedmobilerv.com/', 'Home points at the WP apex');
assert(api.DOCS === 'https://docs.unitedmobilerv.com/', 'Docs canonical host');
assert(api.ORG_NAME === 'United Mobile RV LLC', 'publisher is United Mobile RV LLC');
assert(!/book\.unitedmobilerv\.com/.test(src), 'helper never mentions book.*');
assert(!/portal\.unitedmobilerv\.com/.test(src), 'helper never mentions portal');
assert(!/status\.unitedmobilerv\.com/.test(src), 'helper never mentions status');
assert(chrome.includes('/design/jsonld.js'), 'convert-chrome injects the shared JSON-LD helper');
assert(chrome.includes('united-mobile-rv-llc.square.site') === false, 'convert-chrome does not rewrite Book URLs');

assert(api.normalizePath('/guides/ppi-guide/') === '/guides/ppi-guide', 'normalize trailing slash');
assert(api.normalizePath('/guides/ppi-guide/index.html') === '/guides/ppi-guide', 'normalize index.html');
assert(api.normalizePath('/') === '/', 'normalize root');

assert(api.shouldSkip('/account'), 'skip /account');
assert(api.shouldSkip('/work-orders/edit'), 'skip /work-orders');
assert(api.shouldSkip('/sop/internal'), 'skip /sop');
assert(!api.shouldSkip('/'), 'do not skip docs home');
assert(!api.shouldSkip('/guides/ppi-guide/'), 'do not skip a public guide');
assert(!api.shouldSkip('/policies/'), 'do not skip policies');

assert(api.decodeEntities('RV Owner&#8217;s Field Guide') === 'RV Owner\u2019s Field Guide', 'decodes &#8217; to a real apostrophe');
assert(api.decodeEntities('Victron Fault Code &#038; Diagnostics') === 'Victron Fault Code & Diagnostics', 'decodes &#038; to &');
assert(api.decodeEntities('Guides &amp; troubleshooting') === 'Guides & troubleshooting', 'decodes &amp;');
assert(!/&#/.test(api.decodeEntities('Owner&#8217;s &#038; more')), 'decoded string has no leftover entities');

const homeCrumbs = api.crumbsFor('/');
assert(homeCrumbs.length === 2, 'docs home crumbs are Home → Docs');
assert(homeCrumbs[0].name === 'Home' && homeCrumbs[0].item === 'https://unitedmobilerv.com/', 'first crumb is WP Home');
assert(homeCrumbs[1].name === 'Docs' && homeCrumbs[1].item === 'https://docs.unitedmobilerv.com/', 'second crumb is Docs');

const guidesCrumbs = api.crumbsFor('/guides/');
assert(guidesCrumbs.length === 3, 'guides index is Home → Docs → section');
assert(guidesCrumbs[2].name === 'Guides & troubleshooting', 'guides section uses the catalog title');
assert(guidesCrumbs[2].item === 'https://docs.unitedmobilerv.com/guides/', 'guides section URL');

assert(api.navHref('https://unitedmobilerv.com/') === 'https://unitedmobilerv.com/', 'Home crumb stays on the WP apex');
assert(api.navHref('https://docs.unitedmobilerv.com/') === '/', 'Docs crumb is same-origin /');
assert(api.navHref('https://docs.unitedmobilerv.com/guides/') === '/guides/', 'Guides crumb is same-origin /guides/');
assert(api.navHref('https://docs.unitedmobilerv.com/guides/ppi-guide/') === '/guides/ppi-guide/', 'article crumb is same-origin');

const articleCrumbs = api.crumbsFor('/guides/ppi-guide/', {
  title: 'Pre-purchase RV inspection (PPI) guide'
});
assert(articleCrumbs.length === 4, 'guide article is Home → Docs → Section → title');
assert(articleCrumbs[2].name === 'Guides & troubleshooting', 'article keeps the Guides section');
assert(articleCrumbs[3].name === 'Pre-purchase RV inspection (PPI) guide', 'article uses the page title');
assert(articleCrumbs[3].item === 'https://docs.unitedmobilerv.com/guides/ppi-guide/', 'article item is the docs URL');

const entityTitle = api.crumbsFor('/guides/victron-fault-code-guide/', {
  title: 'Victron Fault Code &#038; Diagnostics Guide'
});
assert(entityTitle[3].name === 'Victron Fault Code & Diagnostics Guide', 'article names are decoded before schema');
assert(!/&#/.test(entityTitle[3].name), 'article crumb has no HTML entities');

const policiesCrumbs = api.crumbsFor('/policies/');
assert(policiesCrumbs.length === 3 && policiesCrumbs[2].name === 'Policies', 'policies section crumb');

const homeGraph = api.graphsFor('/');
const homeJson = api.stringifyGraph(homeGraph);
assert(homeGraph['@context'] === 'https://schema.org', 'graph uses schema.org');
assert(Array.isArray(homeGraph['@graph']), 'home uses @graph');
const homeTypes = homeGraph['@graph'].map((n) => n['@type']);
assert(homeTypes.includes('WebSite'), 'docs home includes WebSite');
assert(homeTypes.includes('Organization'), 'docs home includes Organization');
assert(homeTypes.includes('BreadcrumbList'), 'docs home includes BreadcrumbList');
const org = homeGraph['@graph'].find((n) => n['@type'] === 'Organization');
assert(org && org.url === 'https://unitedmobilerv.com/', 'Organization publisher is the WP apex');
const site = homeGraph['@graph'].find((n) => n['@type'] === 'WebSite');
assert(site && site.url === 'https://docs.unitedmobilerv.com/', 'WebSite url is docs home');
assert(site && site.publisher && site.publisher['@id'] === 'https://unitedmobilerv.com/#organization', 'WebSite publisher points at Organization');
assert(!/&#/.test(homeJson), 'home JSON-LD has no HTML entities');

const articleGraph = api.graphsFor('/guides/ppi-guide/', {
  title: 'Pre-purchase RV inspection (PPI) guide'
});
const articleTypes = articleGraph['@graph'].map((n) => n['@type']);
assert(articleTypes.includes('BreadcrumbList'), 'article includes BreadcrumbList');
assert(!articleTypes.includes('WebSite'), 'nested guide does not repeat WebSite');
const articleList = articleGraph['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
assert(articleList.itemListElement.length === 4, 'article BreadcrumbList has four positions');
assert(articleList.itemListElement[0].position === 1, 'positions start at 1');
assert(articleList.itemListElement[3].name === 'Pre-purchase RV inspection (PPI) guide', 'last item is the page title');
assert(!/&#/.test(api.stringifyGraph(articleGraph)), 'article JSON-LD has no HTML entities');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const guides = fs.readFileSync(path.join(root, 'guides/index.html'), 'utf8');
const policies = fs.readFileSync(path.join(root, 'policies/index.html'), 'utf8');
assert(index.includes('src="/design/jsonld.js"'), 'docs home head loads the helper');
assert(guides.includes('src="/design/jsonld.js"'), 'guides index head loads the helper');
assert(policies.includes('src="/design/jsonld.js"'), 'policies index head loads the helper');

function walkHtml(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const htmlFiles = walkHtml(root, []);
for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  if (/book\.unitedmobilerv\.com/.test(text)) {
    failed += 1;
    console.error('FAIL Book chrome retargeted away from Square in', rel);
  }
  if (/data-platform-link="portal"|data-platform-link="status"/.test(text)) {
    failed += 1;
    console.error('FAIL portal/status reintroduced in', rel);
  }
  if (/umrt-platform-bar/.test(text) && !/(^|\/)(account|work-orders|sop)(\/|$)/.test(rel)) {
    const hasHelper = text.includes('src="/design/jsonld.js"') || text.includes('src="/design/convert-chrome.js"');
    if (!hasHelper) {
      failed += 1;
      console.error('FAIL public chrome page has no JSON-LD helper path', rel);
    }
  }
}

assert(
  index.includes('https://united-mobile-rv-llc.square.site/') &&
    /data-platform-link="book"/.test(index),
  'homepage Book lock stays Square'
);
assert(/data-platform-link="hub">Home</.test(index), 'homepage Home chrome stays');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
