'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const text = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
const sitemapExists = fs.existsSync(path.join(root, 'sitemap.xml'));

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok', msg);
  }
}

const STAFF_DISALLOW = [
  '/work-orders/',
  '/account/',
  '/api/',
  '/sop/internal/',
  '/sop/estimate/'
];

const AI_AGENTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'Applebot-Extended'
];

function parseGroups(src) {
  const groups = [];
  const sitemaps = [];
  let current = null;
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim();
    if (/^user-agent$/i.test(key)) {
      current = { userAgent: value, allow: [], disallow: [] };
      groups.push(current);
    } else if (/^allow$/i.test(key) && current) {
      current.allow.push(value);
    } else if (/^disallow$/i.test(key) && current) {
      current.disallow.push(value);
    } else if (/^sitemap$/i.test(key)) {
      sitemaps.push(value);
    }
  }
  return { groups, sitemaps };
}

const { groups, sitemaps } = parseGroups(text);

function findGroup(name) {
  return groups.find((g) => g.userAgent === name);
}

for (const name of ['*', ...AI_AGENTS]) {
  const g = findGroup(name);
  assert(!!g, 'has User-agent: ' + name);
  if (!g) continue;
  assert(g.allow.includes('/'), name + ' Allow: /');
  assert(
    !g.disallow.some((p) => p === '/' || p === '/guides/' || p === '/policies/'),
    name + ' does not blanket-block customer land'
  );
  assert(
    STAFF_DISALLOW.every((p) => g.disallow.includes(p)),
    name + ' keeps staff Disallows (named groups replace *)'
  );
}

assert(
  !/\bDisallow:\s*\/\s*$/m.test(
    text
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n')
  ),
  'no Disallow: / anywhere'
);

if (sitemapExists) {
  assert(
    sitemaps.includes('https://docs.unitedmobilerv.com/sitemap.xml'),
    'Sitemap points at the existing custom-domain sitemap.xml'
  );
} else {
  assert(sitemaps.length === 0, 'no invented Sitemap when sitemap.xml is missing');
}

assert(!sitemaps.some((s) => /pages\.dev/.test(s)), 'Sitemap is not a pages.dev host');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
