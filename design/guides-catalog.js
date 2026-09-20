/* Searchable Field Guide index — guides + troubleshooting in one catalog.
   Categories match unitedmobilerv.com/guide/ (services/guide) system list. */
(function () {
  var CATS = [
    { id: 'electrical', label: 'Electrical & Power' },
    { id: 'solar', label: 'Lithium & Solar' },
    { id: 'appliances', label: 'Appliances' },
    { id: 'generator', label: 'Generator' },
    { id: 'seasonal', label: 'Maintenance & Seasonal' }
  ];

  var GUIDES = [
    {
      id: 'best-inverters-guide',
      href: '/guides/best-inverters-guide/',
      title: 'Best inverter/chargers',
      blurb: 'Pure sine vs modified, inverter/charger vs inverter-only, and what we actually install.',
      kind: 'Guide',
      cat: 'electrical',
      keys: 'inverter charger victron multiplus pure sine modified shore power ac'
    },
    {
      id: 'inverter-sizing-guide',
      href: '/guides/inverter-sizing-guide/',
      title: 'Inverter sizing',
      blurb: 'Continuous vs surge watts, standby draw, and how to size to what you actually run.',
      kind: 'Guide',
      cat: 'electrical',
      keys: 'inverter sizing watts surge microwave fridge cpap standby idle'
    },
    {
      id: 'starlink-rv-guide',
      href: '/guides/starlink-rv-guide/',
      title: 'Starlink for RVs',
      blurb: 'Residential vs Roam, roof vs portable, Mini vs Flat HP power. Installs only — never Certified.',
      kind: 'Guide',
      cat: 'electrical',
      keys: 'starlink satellite roam residential mini flat hp internet wifi peplink'
    },
    {
      id: 'weboost-install-guide',
      href: '/guides/weboost-install-guide/',
      title: 'weBoost install',
      blurb: 'Authorized Installer notes: donor vs indoor antennas, AGC, oscillation, and when a booster cannot help.',
      kind: 'Guide',
      cat: 'electrical',
      keys: 'weboost cell booster agc oscillation antenna signal bars cellular'
    },
    {
      id: 'best-solar-panels-guide',
      href: '/guides/best-solar-panels-guide/',
      title: 'Best solar panels',
      blurb: 'Rigid vs flexible vs portable — pick by roof, weight, and how the coach actually sits.',
      kind: 'Guide',
      cat: 'solar',
      keys: 'solar panel rigid flexible portable renogy roof array watts'
    },
    {
      id: 'solar-sizing-installation-guide',
      href: '/guides/solar-sizing-installation-guide/',
      title: 'Solar sizing & installation',
      blurb: 'Size from daily watt-hours, then bank, controller, wire, and sealed roof mounts.',
      kind: 'Guide',
      cat: 'solar',
      keys: 'solar sizing watt hours battery bank mppt roof mount voltage drop'
    },
    {
      id: 'mppt-vs-pwm-charge-controller-guide',
      href: '/guides/mppt-vs-pwm-charge-controller-guide/',
      title: 'MPPT vs PWM controllers',
      blurb: 'Why MPPT usually wins on RV roofs, cold-weather voltage, and when PWM is still fine.',
      kind: 'Guide',
      cat: 'solar',
      keys: 'mppt pwm charge controller victron smartsolar series voltage cold'
    },
    {
      id: 'rv-furnace-troubleshooting-guide',
      href: '/guides/rv-furnace-troubleshooting-guide/',
      title: 'Furnace troubleshooting',
      blurb: 'Suburban & Atwood forced-air: blower no heat, no-start, sail switch, 12V, and uneven ducts.',
      kind: 'Troubleshooting',
      cat: 'appliances',
      keys: 'furnace suburban atwood sail switch igniter blower lp heat thermostat'
    },
    {
      id: 'generator-troubleshooting',
      href: '/guides/generator-troubleshooting/',
      title: 'Generator troubleshooting',
      blurb: 'No-start, stall, no-power, and the maintenance that prevents most of it. Service starts at $150.',
      kind: 'Troubleshooting',
      cat: 'generator',
      keys: 'generator onan honda no start carb stale fuel avr brushes oil'
    },
    {
      id: 'winterization-guide',
      href: '/guides/winterization-guide/',
      title: 'Winterization',
      blurb: 'Blow-out vs RV antifreeze, bypass rules, traps, and storage beyond the plumbing.',
      kind: 'Guide',
      cat: 'seasonal',
      keys: 'winterize freeze antifreeze blow out pex water heater bypass storage'
    },
    {
      id: 'spring-dewinterization-checklist',
      href: '/guides/spring-dewinterization-checklist/',
      title: 'Spring de-winterize',
      blurb: 'Flush pink, change bypass, sanitize, and walk the freeze-thaw damage before the first trip.',
      kind: 'Guide',
      cat: 'seasonal',
      keys: 'dewinterize spring flush sanitize bleach roof seals battery tires'
    }
  ];

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9+\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function matches(g, q) {
    if (!q) return true;
    var hay = norm(g.title + ' ' + g.blurb + ' ' + g.keys + ' ' + g.kind);
    var parts = q.split(' ');
    for (var i = 0; i < parts.length; i++) {
      if (hay.indexOf(parts[i]) === -1) return false;
    }
    return true;
  }

  function render(root, query, catId) {
    var q = norm(query);
    var shown = 0;
    var html = '';

    CATS.forEach(function (cat) {
      if (catId && cat.id !== catId) return;
      var items = GUIDES.filter(function (g) {
        return g.cat === cat.id && matches(g, q);
      });
      if (!items.length) return;
      html += '<section class="cat-block" data-cat="' + cat.id + '">';
      html += '<h2>' + cat.label + '</h2>';
      html += '<div class="guide-grid">';
      items.forEach(function (g) {
        shown += 1;
        html += '<a class="guide-card" href="' + g.href + '">';
        html += '<span class="kind">' + g.kind + '</span>';
        html += '<h3>' + g.title + '</h3>';
        html += '<p>' + g.blurb + '</p>';
        html += '</a>';
      });
      html += '</div></section>';
    });

    var empty = root.querySelector('[data-index-empty]');
    var count = root.querySelector('[data-index-count]');
    var list = root.querySelector('[data-index-list]');
    if (list) list.innerHTML = html;
    if (empty) empty.hidden = shown > 0;
    if (count) {
      count.textContent = shown === GUIDES.length && !q && !catId
        ? shown + ' field guides'
        : shown + (shown === 1 ? ' match' : ' matches');
    }
  }

  function mount(root) {
    if (!root) return;
    var search = root.querySelector('[data-index-search]');
    var chips = root.querySelector('[data-index-chips]');
    var catId = '';

    if (chips) {
      var chipHtml = '<button type="button" data-cat="" class="is-on">All</button>';
      CATS.forEach(function (c) {
        chipHtml += '<button type="button" data-cat="' + c.id + '">' + c.label + '</button>';
      });
      chips.innerHTML = chipHtml;
      chips.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-cat]');
        if (!btn) return;
        catId = btn.getAttribute('data-cat') || '';
        var all = chips.querySelectorAll('button');
        for (var i = 0; i < all.length; i++) {
          all[i].classList.toggle('is-on', all[i] === btn);
        }
        render(root, search ? search.value : '', catId);
      });
    }

    if (search) {
      search.addEventListener('input', function () {
        render(root, search.value, catId);
      });
    }

    var params = new URLSearchParams(location.search);
    if (search && params.get('q')) {
      search.value = params.get('q');
    }
    render(root, search ? search.value : '', catId);
  }

  window.UMRTGuidesIndex = { CATS: CATS, GUIDES: GUIDES, mount: mount };
  document.addEventListener('DOMContentLoaded', function () {
    mount(document.querySelector('[data-guides-index]'));
  });
})();
