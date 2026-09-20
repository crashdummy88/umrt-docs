/* Docs JSON-LD + breadcrumb chrome.
   Shared helper — do not copy schema into each HTML page.
   Emits schema.org BreadcrumbList on public docs routes, plus
   WebSite + Organization on the docs root. Names are plain UTF-8
   (never HTML entities like &#8217;). Load once from <head> or
   via convert-chrome.js. */
(function (root) {
  var HOME = 'https://unitedmobilerv.com/';
  var DOCS = 'https://docs.unitedmobilerv.com/';
  var ORG_ID = HOME + '#organization';
  var SITE_ID = DOCS + '#website';
  var ORG_NAME = 'United Mobile RV LLC';
  var DOCS_NAME = 'Docs';
  var GUIDES_NAME = 'Guides & troubleshooting';
  var POLICIES_NAME = 'Policies';

  var SKIP_PREFIXES = [
    '/account',
    '/work-orders',
    '/sop',
    '/api',
    '/r2'
  ];

  function decodeEntities(str) {
    if (str == null) return '';
    var out = String(str);
    out = out.replace(/&amp;/g, '&');
    out = out.replace(/&lt;/g, '<');
    out = out.replace(/&gt;/g, '>');
    out = out.replace(/&quot;/g, '"');
    out = out.replace(/&apos;/g, "'");
    out = out.replace(/&#8217;/g, '\u2019');
    out = out.replace(/&#8216;/g, '\u2018');
    out = out.replace(/&#8220;/g, '\u201C');
    out = out.replace(/&#8221;/g, '\u201D');
    out = out.replace(/&#038;/g, '&');
    out = out.replace(/&#039;/g, "'");
    out = out.replace(/&#39;/g, "'");
    out = out.replace(/&#x([0-9a-f]+);/gi, function (_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
    out = out.replace(/&#(\d+);/g, function (_, n) {
      return String.fromCharCode(parseInt(n, 10));
    });
    return out.replace(/\s+/g, ' ').trim();
  }

  function normalizePath(pathname) {
    var p = String(pathname == null ? '/' : pathname).split('?')[0].split('#')[0];
    if (!p) p = '/';
    if (p.charAt(0) !== '/') p = '/' + p;
    p = p.replace(/\/index\.html$/i, '/');
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p || '/';
  }

  function shouldSkip(pathname) {
    var p = normalizePath(pathname);
    for (var i = 0; i < SKIP_PREFIXES.length; i++) {
      var pre = SKIP_PREFIXES[i];
      if (p === pre || p.indexOf(pre + '/') === 0) return true;
    }
    return false;
  }

  function docsUrl(pathname) {
    var p = normalizePath(pathname);
    if (p === '/') return DOCS;
    return DOCS.replace(/\/$/, '') + p + '/';
  }

  /* JSON-LD item stays the public docs URL. Visible nav uses a same-origin
     path for docs crumbs so local/preview hosts do not bounce to production. */
  function navHref(item) {
    if (!item) return '/';
    var origin = DOCS.replace(/\/$/, '');
    if (item === origin || item === DOCS || item.indexOf(origin + '/') === 0) {
      var path = item.slice(origin.length) || '/';
      if (path.charAt(0) !== '/') path = '/' + path;
      return path;
    }
    return item;
  }

  function crumbsFor(pathname, opts) {
    opts = opts || {};
    var p = normalizePath(pathname);
    var title = decodeEntities(opts.title || '');
    var home = { name: 'Home', item: HOME };
    var docs = { name: DOCS_NAME, item: DOCS };

    if (p === '/') {
      return [home, docs];
    }
    if (p === '/guides') {
      return [home, docs, { name: GUIDES_NAME, item: docsUrl('/guides') }];
    }
    if (p === '/policies') {
      return [home, docs, { name: POLICIES_NAME, item: docsUrl('/policies') }];
    }
    if (p.indexOf('/guides/') === 0) {
      var slug = p.slice('/guides/'.length);
      return [
        home,
        docs,
        { name: GUIDES_NAME, item: docsUrl('/guides') },
        { name: title || slug, item: docsUrl(p) }
      ];
    }
    if (title) {
      return [home, docs, { name: title, item: opts.url || docsUrl(p) }];
    }
    return [home, docs];
  }

  function breadcrumbList(crumbs) {
    var items = [];
    for (var i = 0; i < crumbs.length; i++) {
      items.push({
        '@type': 'ListItem',
        position: i + 1,
        name: decodeEntities(crumbs[i].name),
        item: crumbs[i].item
      });
    }
    return {
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  }

  function organizationNode() {
    return {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: ORG_NAME,
      url: HOME
    };
  }

  function websiteNode() {
    return {
      '@type': 'WebSite',
      '@id': SITE_ID,
      name: 'United Mobile RV Docs',
      alternateName: GUIDES_NAME,
      url: DOCS,
      publisher: { '@id': ORG_ID }
    };
  }

  function graphsFor(pathname, opts) {
    opts = opts || {};
    var p = normalizePath(pathname);
    var crumbs = crumbsFor(p, opts);
    var graph = [breadcrumbList(crumbs)];
    if (p === '/') {
      graph.unshift(websiteNode(), organizationNode());
    }
    return {
      '@context': 'https://schema.org',
      '@graph': graph
    };
  }

  function stringifyGraph(graph) {
    return JSON.stringify(graph);
  }

  function pageTitleFromDoc(doc) {
    if (!doc) return '';
    var h1 = doc.querySelector('h1');
    if (h1 && (h1.textContent || '').trim()) {
      return decodeEntities(h1.textContent);
    }
    var raw = doc.title || '';
    raw = raw.replace(/\s*[·•|].*$/, '');
    return decodeEntities(raw);
  }

  function canonicalFromDoc(doc, pathname) {
    if (doc) {
      var link = doc.querySelector('link[rel="canonical"]');
      var href = link && link.getAttribute('href');
      if (href) return href;
    }
    return docsUrl(pathname);
  }

  function hasNoindex(doc) {
    if (!doc) return false;
    var metas = doc.querySelectorAll('meta[name="robots"]');
    for (var i = 0; i < metas.length; i++) {
      var c = (metas[i].getAttribute('content') || '').toLowerCase();
      if (c.indexOf('noindex') !== -1) return true;
    }
    return false;
  }

  function hasExistingBreadcrumbNav(doc) {
    if (!doc) return false;
    if (doc.querySelector('.umrt-breadcrumbs, nav[aria-label="Breadcrumb"]')) return true;
    return false;
  }

  function hasExistingJsonLdType(doc, typeName) {
    if (!doc) return false;
    var nodes = doc.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < nodes.length; i++) {
      var text = nodes[i].textContent || '';
      if (text.indexOf('"' + typeName + '"') !== -1) return true;
    }
    return false;
  }

  function injectJsonLd(doc, graph) {
    if (!doc || !doc.head) return null;
    var script = doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-umrt-jsonld', '1');
    script.textContent = stringifyGraph(graph);
    doc.head.appendChild(script);
    return script;
  }

  function injectNav(doc, crumbs) {
    if (!doc || !doc.body || hasExistingBreadcrumbNav(doc)) return null;
    var nav = doc.createElement('nav');
    nav.className = 'umrt-breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');
    var ol = doc.createElement('ol');
    for (var i = 0; i < crumbs.length; i++) {
      var li = doc.createElement('li');
      var last = i === crumbs.length - 1;
      if (last) {
        var span = doc.createElement('span');
        span.setAttribute('aria-current', 'page');
        span.textContent = crumbs[i].name;
        li.appendChild(span);
      } else {
        var a = doc.createElement('a');
        a.href = crumbs[i].href || navHref(crumbs[i].item);
        a.textContent = crumbs[i].name;
        li.appendChild(a);
      }
      ol.appendChild(li);
    }
    nav.appendChild(ol);
    var bar = doc.querySelector('.umrt-platform-bar');
    if (bar && bar.parentNode) {
      if (bar.nextSibling) bar.parentNode.insertBefore(nav, bar.nextSibling);
      else bar.parentNode.appendChild(nav);
    } else {
      doc.body.insertBefore(nav, doc.body.firstChild);
    }
    return nav;
  }

  function mount(doc, pathname) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return null;
    if (doc.documentElement && doc.documentElement.getAttribute('data-umrt-jsonld') === '1') {
      return null;
    }
    var path = normalizePath(pathname || (doc.defaultView && doc.defaultView.location
      ? doc.defaultView.location.pathname
      : (typeof location !== 'undefined' ? location.pathname : '/')));
    if (shouldSkip(path) || hasNoindex(doc)) return null;
    var opts = {
      title: pageTitleFromDoc(doc),
      url: canonicalFromDoc(doc, path)
    };
    var crumbs = crumbsFor(path, opts);
    if (!hasExistingJsonLdType(doc, 'BreadcrumbList')) {
      injectJsonLd(doc, graphsFor(path, opts));
    }
    injectNav(doc, crumbs);
    if (doc.documentElement) doc.documentElement.setAttribute('data-umrt-jsonld', '1');
    return { crumbs: crumbs, graph: graphsFor(path, opts) };
  }

  function boot() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { mount(document); });
    } else {
      mount(document);
    }
  }

  var api = {
    HOME: HOME,
    DOCS: DOCS,
    ORG_NAME: ORG_NAME,
    DOCS_NAME: DOCS_NAME,
    GUIDES_NAME: GUIDES_NAME,
    decodeEntities: decodeEntities,
    normalizePath: normalizePath,
    shouldSkip: shouldSkip,
    crumbsFor: crumbsFor,
    navHref: navHref,
    graphsFor: graphsFor,
    stringifyGraph: stringifyGraph,
    mount: mount
  };

  root.UMRT_DOCS_JSONLD = api;
  boot();
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
