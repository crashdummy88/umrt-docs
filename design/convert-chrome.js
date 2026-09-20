/* Convert chrome lock: Text Now / TEXT NOW must stay sms:+16166065277.
   Never remap sms: → tel:. If a Text Now control is on tel:, fix it.
   Also loads the shared Microsoft Clarity head snippet once when a page
   did not already include /design/clarity.js, and the shared JSON-LD /
   breadcrumb helper once when a page did not already include /design/jsonld.js. */
(function () {
  if (!document.querySelector('script[src="/design/clarity.js"]')) {
    var clarity = document.createElement('script');
    clarity.type = 'text/javascript';
    clarity.src = '/design/clarity.js';
    (document.head || document.documentElement).appendChild(clarity);
  }
  if (!document.querySelector('script[src="/design/jsonld.js"]')) {
    var jsonld = document.createElement('script');
    jsonld.type = 'text/javascript';
    jsonld.src = '/design/jsonld.js';
    (document.head || document.documentElement).appendChild(jsonld);
  }
})();
(function () {
  var SMS = 'sms:+16166065277';
  function isTextNow(el) {
    if (!el || el.tagName !== 'A') return false;
    if ((el.getAttribute('data-platform-link') || '') === 'text') return true;
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return t === 'text now';
  }
  function lockHref(a) {
    var href = a.getAttribute('href') || '';
    if (!/^sms:/i.test(href)) a.setAttribute('href', SMS);
  }
  function lockAll() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (isTextNow(links[i])) lockHref(links[i]);
    }
  }
  lockAll();
  document.addEventListener('click', function (e) {
    var n = e.target;
    while (n && n !== document) {
      if (isTextNow(n)) { lockHref(n); break; }
      n = n.parentNode;
    }
  }, true);
})();
