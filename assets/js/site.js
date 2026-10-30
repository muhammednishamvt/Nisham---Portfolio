(function () {
  var d = document, h = d.documentElement, w = window;
  if (!d.querySelector('.p-page')) return;
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (FINE) h.classList.add('p-fine');
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var lerp = function (a, b, n) { return a + (b - a) * n; };

  /* current page */
  var here = location.pathname.replace(/\/$/, '') || '/';
  $$('.p-nav-link,.p-menu-link').forEach(function (a) {
    var p = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (p === here) a.setAttribute('aria-current', 'page');
  });

  /* rolling text */
  $$('[data-roll]').forEach(function (el) {
    if (el.querySelector('.p-roll') || el.children.length) return;
    var t = el.textContent;
    el.textContent = '';
    var r = d.createElement('span'), a = d.createElement('span'), b = d.createElement('span');
    r.className = 'p-roll'; a.className = 'p-roll-a'; b.className = 'p-roll-b';
    a.textContent = b.textContent = t;
    b.setAttribute('aria-hidden', 'true');
    r.appendChild(a); r.appendChild(b); el.appendChild(r);
  });

  /* word split, with an accessible copy */
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent.trim(), words = text.split(/\s+/);
    el.textContent = '';
    var sr = d.createElement('span'); sr.className = 'p-sr'; sr.textContent = text; el.appendChild(sr);
    words.forEach(function (wd, i) {
      var o = d.createElement('span'), n = d.createElement('span');
      o.className = 'p-w'; o.setAttribute('aria-hidden', 'true');
      n.className = 'p-w-i'; n.style.transitionDelay = (i * 0.035) + 's'; n.textContent = wd;
      o.appendChild(n); el.appendChild(o); el.appendChild(d.createTextNode(' '));
    });
  });

  /* reveal on scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal],[data-split],[data-clip]').forEach(function (el, i) {
    if (el.matches('.p-service,[data-reveal].p-body')) el.style.transitionDelay = ((i % 3) * 0.08) + 's';
    io.observe(el);
  });

  /* curtain: greeting on first home visit, page name otherwise */
  var word = d.querySelector('.p-curtain-word');
  var lift = function () { h.classList.add('p-loaded'); };
  var first = true;
  try { first = !sessionStorage.getItem('p-seen'); sessionStorage.setItem('p-seen', '1'); } catch (e) {}
  if (word) {
    if (d.querySelector('.p-hero') && first && !RM) {
      var g = ['Hello', 'നമസ്കാരം', 'Hola', 'Bonjour', 'Ciao', 'Hallo', 'こんにちは', 'Hello'], gi = 0;
      word.textContent = g[0];
      var iv = setInterval(function () {
        gi++;
        if (gi >= g.length) { clearInterval(iv); setTimeout(lift, 120); return; }
        word.textContent = g[gi];
      }, 150);
    } else {
      word.textContent = d.title.split(' — ')[0];
      setTimeout(lift, RM ? 0 : 380);
    }
  } else lift();
  w.addEventListener('pageshow', function (e) { if (e.persisted) { h.classList.remove('p-leave-start'); lift(); } });

  /* page-leave transition */
  var labelOf = function (a) { var r = a.querySelector('.p-roll-a,.p-btn-label'); return (r ? r.textContent : a.textContent).replace(/©/g, '').trim(); };
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel):/i.test(href)) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault();
    closeMenu(true);
    if (word) word.textContent = labelOf(a) || 'Nisham';
    if (RM) { location.href = a.href; return; }
    h.classList.remove('p-loaded'); h.classList.add('p-leave-start');
    void d.querySelector('.p-curtain').offsetHeight;
    h.classList.remove('p-leave-start');
    setTimeout(function () { location.href = a.href; }, 760);
  });

  /* menu */
  var btn = d.querySelector('.p-menu-btn'), menu = d.querySelector('.p-menu'), scrim = d.querySelector('.p-menu-scrim');
  var lenis = null;
  function openMenu() {
    h.classList.add('p-menu-open'); btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false'); menu.removeAttribute('inert');
    if (lenis) lenis.stop();
    var f = menu.querySelector('a'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350);
  }
  function closeMenu(silent) {
    if (!h.classList.contains('p-menu-open')) return;
    h.classList.remove('p-menu-open'); btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true'); menu.setAttribute('inert', '');
    if (lenis) lenis.start();
    if (!silent) btn.focus({ preventScroll: true });
  }
  if (btn && menu) {
    menu.setAttribute('inert', '');
    $$('.p-menu-link', menu).forEach(function (a, i) { a.style.transitionDelay = (0.18 + i * 0.07) + 's'; });
    btn.addEventListener('click', function () { h.classList.contains('p-menu-open') ? closeMenu() : openMenu(); });
    if (scrim) scrim.addEventListener('click', function () { closeMenu(); });
    d.addEventListener('keydown', function (e) {
      if (!h.classList.contains('p-menu-open')) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {
        var f = [btn].concat($$('a', menu)), i = f.indexOf(d.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* magnetic */
  if (FINE && !RM) $$('[data-magnetic]').forEach(function (el) {
    var inner = el.querySelector('.p-btn-label,.p-roll,.p-menu-lines');
    var s = el.matches('.p-btn-circle,.p-menu-btn') ? 0.35 : 0.22;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transition = 'translate .25s ease-out';
      el.style.translate = (x * s) + 'px ' + (y * s) + 'px';
      if (inner) { inner.style.transition = 'translate .25s ease-out'; inner.style.translate = (x * s * 0.5) + 'px ' + (y * s * 0.5) + 'px'; }
    });
    el.addEventListener('pointerleave', function () {
      el.style.transition = 'translate 1s cubic-bezier(.2,1.8,.4,1)'; el.style.translate = '0px 0px';
      if (inner) { inner.style.transition = el.style.transition; inner.style.translate = '0px 0px'; }
    });
  });

  /* cursor + preview + marquee + parallax loop */
  /* previews: each .p-preview has data-preview="name" (default "work"); triggers carry
     data-preview-index and optionally data-preview-for="name" and data-cursor="label" */
  var cur = d.querySelector('.p-cursor'), curLabel = cur && cur.querySelector('.p-cursor-label');
  var pvs = $$('.p-preview').map(function (el) { return { el: el, name: el.getAttribute('data-preview') || 'work', track: el.querySelector('.p-preview-track'), x: -400, y: -400 }; });
  var pvByName = {}; pvs.forEach(function (p) { pvByName[p.name] = p; });
  var mx = -200, my = -200, cx = mx, cy = my;
  if (FINE) {
    w.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; if (cur) cur.classList.remove('is-hidden'); }, { passive: true });
    d.addEventListener('pointerleave', function () { if (cur) cur.classList.add('is-hidden'); });
    d.addEventListener('pointerover', function (e) {
      if (!cur) return; var t = e.target;
      var trigger = t.closest('.p-work-row,.p-card,[data-preview-for]');
      cur.classList.toggle('is-view', !!trigger);
      if (curLabel) curLabel.textContent = (trigger && trigger.getAttribute('data-cursor')) || 'View';
      cur.classList.toggle('is-hover', !trigger && !!t.closest('a,button,input,textarea,label,[data-magnetic]'));
    });
    $$('[data-preview-index]').forEach(function (row) {
      var p = pvByName[row.getAttribute('data-preview-for') || 'work']; if (!p) return;
      row.addEventListener('pointerenter', function () {
        if (p.x < -300) { p.x = mx; p.y = my; }
        p.el.classList.add('is-on');
        if (p.track) p.track.style.transform = 'translateY(' + (-100 * +row.getAttribute('data-preview-index')) + '%)';
      });
      row.addEventListener('pointerleave', function () { p.el.classList.remove('is-on'); });
    });
  }
  /* touch: [data-preview-touch] shows its preview above the finger while touching, then fades out */
  var touchPv = null, touchHide = 0;
  $$('[data-preview-touch]').forEach(function (el) {
    var p = pvByName[el.getAttribute('data-preview-for') || 'work']; if (!p) return;
    function at(t) { mx = t.clientX; my = t.clientY - p.el.offsetHeight / 2 - 28; }
    el.addEventListener('touchstart', function (e) {
      clearTimeout(touchHide); touchPv = p; at(e.touches[0]);
      if (!p.el.classList.contains('is-on')) { p.x = mx; p.y = my; }
      p.el.classList.add('is-on');
      if (p.track) p.track.style.transform = 'translateY(' + (-100 * +el.getAttribute('data-preview-index')) + '%)';
    }, { passive: true });
    el.addEventListener('touchmove', function (e) { at(e.touches[0]); }, { passive: true });
    function end() { clearTimeout(touchHide); touchHide = setTimeout(function () { p.el.classList.remove('is-on'); touchPv = null; }, 900); }
    el.addEventListener('touchend', end, { passive: true });
    el.addEventListener('touchcancel', end, { passive: true });
  });
  var mq = d.querySelector('[data-marquee] .p-marquee-track'), mqx = 0, dir = -1, vel = 0, lastY = w.scrollY;
  var plx = $$('[data-parallax]');
  if (!RM && w.Lenis) { lenis = new w.Lenis({ lerp: 0.1, wheelMultiplier: 1 }); }
  function frame(t) {
    if (lenis) lenis.raf(t);
    var y = w.scrollY, dy = y - lastY; lastY = y;
    if (dy) { dir = dy > 0 ? -1 : 1; h.classList.toggle('p-scroll-up', dy < 0); }
    vel = lerp(vel, Math.min(Math.abs(dy), 60), 0.1);
    h.classList.toggle('p-scrolled', y > w.innerHeight * 0.3);
    if (FINE && cur && !RM) { cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22); cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)'; }
    pvs.forEach(function (p) {
      if (!FINE && p !== touchPv) return;
      var hw = p.el.offsetWidth / 2, hh = p.el.offsetHeight / 2;
      var tx = Math.min(Math.max(mx, hw + 16), w.innerWidth - hw - 16), ty = Math.min(Math.max(my, hh + 96), w.innerHeight - hh - 16);
      p.x = lerp(p.x, tx, RM ? 1 : 0.12); p.y = lerp(p.y, ty, RM ? 1 : 0.12);
      p.el.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0) translate(-50%,-50%)';
    });
    if (mq && !RM) {
      var half = mq.scrollWidth / 2; mqx += dir * (1.1 + vel * 0.25);
      if (mqx <= -half) mqx += half; if (mqx > 0) mqx -= half;
      mq.style.transform = 'translate3d(' + mqx + 'px,0,0)';
    }
    if (!RM) plx.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > w.innerHeight) return;
      var p = (r.top + r.height / 2 - w.innerHeight / 2) / w.innerHeight;
      el.style.translate = '0 ' + (p * -parseFloat(el.getAttribute('data-parallax')) * r.height) + 'px';
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* work filters + layout toggle */
  $$('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      $$('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('[data-cat]').forEach(function (it) { it.classList.toggle('p-is-out', f !== 'all' && it.getAttribute('data-cat') !== f); });
    });
  });
  $$('[data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view');
      $$('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      h.classList.toggle('p-view-grid', v === 'grid');
    });
  });


  /* contact form -> mail app (swap for a form service later) */
  var form = d.getElementById('contact-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var f = new FormData(form), to = form.getAttribute('data-mailto');
    var name = f.get('Name') || '', lines = [];
    f.forEach(function (v, k) { if (v) lines.push(k + ': ' + v); });
    location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Project enquiry from ' + name) + '&body=' + encodeURIComponent(lines.join('\n'));
    var done = d.querySelector('.p-form-done');
    if (done) { done.hidden = false; done.focus(); }
  });

  /* live Kochi clock */
  var ck = $$('[data-clock]');
  function tick() {
    var t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    ck.forEach(function (e) { e.textContent = t + ' IST'; });
  }
  if (ck.length) { tick(); setInterval(tick, 10000); }
})();
