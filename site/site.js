/* ===========================================================================
   LineUp marketing — shared behavior
   - mobile menu, FAQ accordion, scroll reveal, live ticker jitter
   - vanilla Tweaks panel (accent color + hero direction) wired to host protocol
   =========================================================================== */
(function () {
  'use strict';

  /* ---- persisted prefs (shared across pages, same origin) ---- */
  var ACCENTS = [
    { k: 'indigo', c: '#5B4BD6' },
    { k: 'violet', c: '#7C4DE0' },
    { k: 'electric', c: '#4F46E5' },
    { k: 'magenta', c: '#C13BB0' }
  ];
  function getPref(key, def) { try { return localStorage.getItem(key) || def; } catch (e) { return def; } }
  function setPref(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  var accent = getPref('lu_site_accent', 'indigo');
  var hero = getPref('lu_site_hero', 'a');

  function applyAccent(a) { document.documentElement.setAttribute('data-accent', a); }
  function applyHero(h) { document.body.setAttribute('data-hero', h); }
  applyAccent(accent);

  document.addEventListener('DOMContentLoaded', function () {
    applyHero(hero);

    /* ---- mobile menu ---- */
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { menu.classList.remove('open'); });
      });
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q');
      var a = item.querySelector('.faq-a');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var open = item.classList.contains('open');
        // close siblings in same .faq
        var faq = item.closest('.faq');
        if (faq) faq.querySelectorAll('.faq-item.open').forEach(function (it) {
          if (it !== item) { it.classList.remove('open'); var aa = it.querySelector('.faq-a'); if (aa) aa.style.maxHeight = '0px'; }
        });
        if (open) { item.classList.remove('open'); a.style.maxHeight = '0px'; }
        else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });

    /* ---- scroll reveal ---- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (r) { io.observe(r); });
      // failsafe: never leave content hidden if the observer doesn't fire
      setTimeout(function () { reveals.forEach(function (r) { r.classList.add('in'); }); }, 1400);
    } else {
      reveals.forEach(function (r) { r.classList.add('in'); });
    }

    /* ---- live ticker jitter (subtle, keeps it feeling alive) ---- */
    var jitterEls = document.querySelectorAll('[data-jitter]');
    if (jitterEls.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(function () {
        jitterEls.forEach(function (el) {
          if (Math.random() > 0.4) return;
          var base = parseFloat(el.getAttribute('data-jitter'));
          var v = base + (Math.random() - 0.5) * base * 0.01;
          el.textContent = '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
          el.style.color = v >= base ? 'var(--up)' : 'var(--down)';
          setTimeout(function () { el.style.color = ''; }, 600);
        });
      }, 1800);
    }

    /* ---- contact form (demo) ---- */
    var form = document.querySelector('form[data-demo]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = form.querySelector('.form-note');
        if (note) { note.classList.add('show'); }
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.textContent = 'Message sent ✓'; btn.disabled = true; btn.style.opacity = '.7'; }
      });
    }

    buildRail();
    buildTweaks();
  });

  /* ---- Trading players rail (shared, every page) ---- */
  function buildRail() {
    var host = document.getElementById('players-rail');
    if (!host) return;
    // [short, fullName, team, role, c1, c2, price, chg, skinTone]
    var P = [
      ['VK', 'V. Kohli', 'IND', 'BAT', '#2A6FDB', '#1B4F9E', 2847.5, 3.42, 'm'],
      ['JB', 'J. Bumrah', 'IND', 'BWL', '#2A6FDB', '#1B4F9E', 2615.8, 5.10, 'md'],
      ['SKY', 'Suryakumar', 'IND', 'BAT', '#2A6FDB', '#1B4F9E', 1820.3, 4.21, 'm'],
      ['GM', 'G. Maxwell', 'AUS', 'AR', '#1FAA6E', '#127a4c', 1612.2, 6.33, 'l'],
      ['RK', 'R. Khan', 'AFG', 'BWL', '#3B6FB0', '#264a78', 1925.9, 5.67, 'lm'],
      ['BA', 'B. Azam', 'PAK', 'BAT', '#0F8A4A', '#0a5e32', 2190.0, -3.05, 'm'],
      ['PC', 'P. Cummins', 'AUS', 'BWL', '#1FAA6E', '#127a4c', 1990.4, 2.58, 'l'],
      ['TH', 'T. Head', 'AUS', 'BAT', '#1FAA6E', '#127a4c', 1730.9, 3.11, 'l'],
      ['RS', 'R. Sharma', 'IND', 'BAT', '#2A6FDB', '#1B4F9E', 2410.0, -1.18, 'm'],
      ['BS', 'B. Stokes', 'ENG', 'AR', '#4257C7', '#2c3a8f', 1845.7, 1.47, 'l']
    ];
    function inr(n) { return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
    function avatarURI(initials, c1, c2, id) {
      var fs = initials.length > 2 ? 32 : 42;
      var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='112' height='112'>" +
        "<defs><linearGradient id='g" + id + "' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='" + c1 + "'/><stop offset='1' stop-color='" + c2 + "'/></linearGradient></defs>" +
        "<rect width='112' height='112' rx='30' fill='url(#g" + id + ")'/>" +
        "<text x='56' y='56' dy='.35em' text-anchor='middle' font-family='Plus Jakarta Sans, sans-serif' font-size='" + fs + "' font-weight='800' fill='white'>" + initials + "</text></svg>";
      return "data:image/svg+xml," + encodeURIComponent(svg);
    }
    function slug(p) { return p[1].toLowerCase().replace(/[^a-z]/g, ''); }
    function chip(p, i, suffix) {
      var up = p[7] >= 0;
      var uri = window.LU_CRICKETER
        ? window.LU_CRICKETER(p[0], p[4], p[5], (suffix ? 'rb' : 'ra') + i)
        : avatarURI(p[0], p[4], p[5], i + (suffix ? 100 : 0));
      return '<div class="pchip">' +
        '<image-slot id="pl-' + slug(p) + suffix + '" class="pc-img" shape="rounded" radius="9" src="' + uri + '" placeholder="' + p[0] + '"></image-slot>' +
        '<span class="pc-name">' + p[1] + '</span>' +
        '<span class="pc-price">' + inr(p[6]) + '</span>' +
        '<span class="pc-chg ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + p[7].toFixed(2) + '%</span>' +
        '</div>';
    }
    // two identical sets so the -50% loop is seamless
    var setA = P.map(function (p, i) { return chip(p, i, ''); }).join('');
    var setB = P.map(function (p, i) { return chip(p, i, '-b'); }).join('');
    host.innerHTML = '<div class="rail-track" aria-label="Live player prices">' + setA + setB + '</div>';

    // mirror a dropped cartoon from the primary chip onto its marquee twin
    function syncTwins() {
      P.forEach(function (p) {
        var a = document.getElementById('pl-' + slug(p));
        var b = document.getElementById('pl-' + slug(p) + '-b');
        if (!a || !b || !a.shadowRoot || !b.shadowRoot) return;
        var ia = a.shadowRoot.querySelector('img'), ib = b.shadowRoot.querySelector('img');
        if (ia && ib && ia.src && ia.src !== ib.src) b.setAttribute('src', ia.src);
      });
    }
    setInterval(syncTwins, 1500);
  }

  /* ---- Tweaks panel ---- */
  function buildTweaks() {
    var panel = document.createElement('div');
    panel.className = 'twk';
    var isHome = document.body.getAttribute('data-page') === 'home';

    panel.innerHTML =
      '<div class="twk-hd">' +
        '<span class="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>Tweaks</span>' +
        '<button class="twk-x" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="twk-body">' +
        '<div class="twk-grp">' +
          '<div class="lab">Accent color</div>' +
          '<div class="twk-chips" id="twkAccent"></div>' +
        '</div>' +
        (isHome ?
        '<div class="twk-grp">' +
          '<div class="lab">Hero direction</div>' +
          '<div class="twk-seg" id="twkHero">' +
            '<button data-v="a">Split + phone</button>' +
            '<button data-v="b">Centered</button>' +
          '</div>' +
        '</div>' : '') +
      '</div>';

    document.body.appendChild(panel);

    // accent chips
    var chipWrap = panel.querySelector('#twkAccent');
    ACCENTS.forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'twk-chip';
      b.style.background = a.c;
      b.setAttribute('data-on', accent === a.k ? '1' : '0');
      b.setAttribute('aria-label', a.k);
      b.innerHTML = '<svg viewBox="0 0 14 14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"' + (accent === a.k ? '' : ' style="display:none"') + '><path d="M3 7.2 5.8 10 11 4.2"/></svg>';
      b.addEventListener('click', function () {
        accent = a.k; setPref('lu_site_accent', a.k); applyAccent(a.k);
        chipWrap.querySelectorAll('.twk-chip').forEach(function (c, i) {
          var on = ACCENTS[i].k === a.k;
          c.setAttribute('data-on', on ? '1' : '0');
          var sv = c.querySelector('svg'); if (sv) sv.style.display = on ? '' : 'none';
        });
      });
      chipWrap.appendChild(b);
    });

    // hero seg
    var heroSeg = panel.querySelector('#twkHero');
    if (heroSeg) {
      heroSeg.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('data-on', hero === b.getAttribute('data-v') ? '1' : '0');
        b.addEventListener('click', function () {
          hero = b.getAttribute('data-v'); setPref('lu_site_hero', hero); applyHero(hero);
          heroSeg.querySelectorAll('button').forEach(function (x) { x.setAttribute('data-on', x === b ? '1' : '0'); });
        });
      });
    }

    // drag
    dragify(panel, panel.querySelector('.twk-hd'));

    // host protocol
    var closeBtn = panel.querySelector('.twk-x');
    closeBtn.addEventListener('click', function () {
      panel.classList.remove('show');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });
    window.addEventListener('message', function (e) {
      var t = e && e.data && e.data.type;
      if (t === '__activate_edit_mode') panel.classList.add('show');
      else if (t === '__deactivate_edit_mode') panel.classList.remove('show');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }

  function dragify(panel, handle) {
    if (!handle) return;
    var sx, sy, ox, oy, dragging = false;
    handle.addEventListener('mousedown', function (e) {
      if (e.target.closest('.twk-x')) return;
      dragging = true; var r = panel.getBoundingClientRect();
      ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      panel.style.left = ox + 'px'; panel.style.top = oy + 'px';
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      panel.style.left = Math.max(6, ox + e.clientX - sx) + 'px';
      panel.style.top = Math.max(6, oy + e.clientY - sy) + 'px';
    });
    window.addEventListener('mouseup', function () { dragging = false; });
  }
})();
