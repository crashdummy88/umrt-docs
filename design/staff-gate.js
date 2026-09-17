/* Client backup for SOP/ESTIMATE pages. Server middleware is the real gate. */
(function () {
  var loading = document.getElementById('loading');
  var signedOut = document.getElementById('signed-out');
  var noAccess = document.getElementById('no-access');
  var body = document.getElementById('staff-body');
  if (!loading || !signedOut || !noAccess || !body) return;

  fetch('/api/auth/me', { credentials: 'include' })
    .then(function (r) { return r.status === 200 ? r.json() : null; })
    .then(function (data) {
      loading.hidden = true;
      if (!data || !data.user || data.user.ssoOnly) {
        signedOut.hidden = false;
        return;
      }
      if (!data.staff) {
        noAccess.hidden = false;
        return;
      }
      body.hidden = false;
    })
    .catch(function () {
      loading.hidden = true;
      signedOut.hidden = false;
    });
})();
