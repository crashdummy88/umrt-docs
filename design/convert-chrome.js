/* Convert chrome lock:
   Text Now / TEXT NOW must stay sms:+16166065277. Never remap sms: → tel:.
   Book must stay https://book.unitedmobilerv.com/ (Square embed host).
   Never leave Book on bare united-mobile-rv-llc.square.site. */
(function () {
  var SMS = 'sms:+16166065277';
  var BOOK = 'https://book.unitedmobilerv.com/';

  function isTextNow(el) {
    if (!el || el.tagName !== 'A') return false;
    if ((el.getAttribute('data-platform-link') || '') === 'text') return true;
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return t === 'text now';
  }

  function isBook(el) {
    if (!el || el.tagName !== 'A') return false;
    if ((el.getAttribute('data-platform-link') || '') === 'book') return true;
    var href = el.getAttribute('href') || '';
    if (/united-mobile-rv-llc\.square\.site/i.test(href)) return true;
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return t === 'book';
  }

  function lockTextNow(a) {
    var href = a.getAttribute('href') || '';
    if (!/^sms:/i.test(href)) a.setAttribute('href', SMS);
  }

  function lockBook(a) {
    var href = a.getAttribute('href') || '';
    if (!/^https:\/\/book\.unitedmobilerv\.com\/?$/i.test(href)) {
      a.setAttribute('href', BOOK);
    }
  }

  function lockAll() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (isTextNow(links[i])) lockTextNow(links[i]);
      else if (isBook(links[i])) lockBook(links[i]);
    }
  }

  lockAll();
  document.addEventListener('click', function (e) {
    var n = e.target;
    while (n && n !== document) {
      if (isTextNow(n)) { lockTextNow(n); break; }
      if (isBook(n)) { lockBook(n); break; }
      n = n.parentNode;
    }
  }, true);
})();
