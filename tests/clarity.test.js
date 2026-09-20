'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const clarity = fs.readFileSync(path.join(root, 'design/clarity.js'), 'utf8');
const chrome = fs.readFileSync(path.join(root, 'design/convert-chrome.js'), 'utf8');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok', msg);
  }
}

assert(clarity.includes('yl6ovtkj2p'), 'shared snippet has exact project ID yl6ovtkj2p');
assert(clarity.includes('https://www.clarity.ms/tag/'), 'shared snippet loads official Clarity tag');
assert(
  /"clarity",\s*"script",\s*"yl6ovtkj2p"/.test(clarity),
  'shared snippet passes project ID as the official 5th IIFE argument'
);
assert(
  (clarity.match(/"yl6ovtkj2p"/g) || []).length === 1,
  'project ID is passed once to the official Clarity IIFE'
);

assert(chrome.includes('/design/clarity.js'), 'convert-chrome injects the shared Clarity file');
assert(chrome.includes('/design/jsonld.js'), 'convert-chrome also injects the shared JSON-LD helper');
assert(!chrome.includes('yl6ovtkj2p'), 'convert-chrome does not duplicate the project ID');

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
let inlineSnippet = 0;
let headIncludes = 0;
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('clarity.ms/tag') || /"clarity",\s*"script"/.test(text)) {
    inlineSnippet += 1;
    console.error('FAIL inlined Clarity snippet in', path.relative(root, file));
  }
  if (text.includes('src="/design/clarity.js"')) headIncludes += 1;
  const square = (text.match(/https:\/\/united-mobile-rv-llc\.square\.site\//g) || []).length;
  const bookStar = (text.match(/https:\/\/book\.unitedmobilerv\.com/g) || []).length;
  if (bookStar) {
    failed += 1;
    console.error('FAIL Book chrome retargeted away from Square in', path.relative(root, file));
  }
  void square;
}

assert(inlineSnippet === 0, 'Clarity IIFE is not duplicated into HTML pages');
assert(headIncludes >= 4, 'shared Clarity file is referenced from site-wide heads');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const head = index.slice(0, index.toLowerCase().indexOf('</head>'));
assert(head.includes('src="/design/clarity.js"'), 'homepage <head> loads shared Clarity');
assert(index.includes('data-platform-link="book"'), 'homepage Book platform lock stays');
assert(
  index.includes('https://united-mobile-rv-llc.square.site/'),
  'homepage Book still points at Square'
);

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
