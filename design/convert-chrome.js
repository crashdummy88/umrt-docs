/* Remap sms: → tel: when the client cannot open a composer (desktop / older phones). */
(function () {
  var ua = navigator.userAgent || '';
  var smsOk = /iPhone|iPad|iPod|Android|Windows Phone|IEMobile/i.test(ua);
  if (smsOk) return;
  var links = document.querySelectorAll('a[href^="sms:"]');
  for (var i = 0; i < links.length; i++) {
    links[i].setAttribute('href', links[i].getAttribute('href').replace(/^sms:/i, 'tel:'));
  }
})();
