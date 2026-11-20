/* fx.js: the second motion layer. Loads after site.js.
   1. [data-field]     live WebGL contour field (topographic lines that drift; lines near the pointer warm to orange)
   2. [data-scramble]  text decodes from random glyphs when it enters view; data-scramble="hover" also replays on hover
   3. [data-skew]      container leans with scroll velocity
   4. [data-tilt]      card media tilts toward the pointer (fine pointers only)
   5. .p-progress      reading progress line at the top of the page
   Everything respects prefers-reduced-motion and exits cleanly without WebGL. */
(function () {
  var d = document, h = d.documentElement, w = window;
  if (!d.querySelector('.p-page')) return;
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var lerp = function (a, b, n) { return a + (b - a) * n; };
  /* ---------- 1. contour field ---------- */
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    '#extension GL_OES_standard_derivatives : enable',
    'precision mediump float;',
    'uniform vec2 r;uniform float t;uniform vec2 m;uniform float mi;uniform float amt;',
    'uniform vec3 cBg;uniform vec3 cLine;uniform vec3 cMajor;uniform vec3 cHot;',
    'float h2(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}',
    'float vn(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);',
    ' return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 q){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(q);q=q*2.03+vec2(1.7,9.2);a*=.5;}return s;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r.y;',
    ' vec2 wp=vec2(fbm(uv*1.1+t*.012),fbm(uv*1.1-t*.01+4.3));',
    ' float n=fbm(uv*1.35+wp*.9+vec2(t*.018,-t*.012));',
    ' vec2 mp=m/r.y;float dm=distance(uv,mp);',
    ' n+=exp(-dm*dm*14.)*.22*mi;',
    ' float k=n*18.;float fw=max(fwidth(k),1e-4);',
    ' float dl=abs(fract(k+.5)-.5)/fw;',
    ' float line=1.-smoothstep(.0,1.15,dl);',
    ' float major=1.-step(.5,mod(floor(k+.5),5.));',
    ' vec3 lc=mix(cLine,cMajor,major*.55);',
    ' float hot=exp(-dm*dm*9.)*mi;',
    ' lc=mix(lc,cHot,hot*.9);',
    ' gl_FragColor=vec4(mix(cBg,lc,line*amt*(.75+.25*major+hot*.4)),1.);',
    '}'
  ].join('\n');

  function hex(v) {
    v = (v || '').trim().replace('#', '');
    if (v.length !== 6) return [0, 0, 0];
    return [0, 2, 4].map(function (i) { return parseInt(v.substr(i, 2), 16) / 255; });
  }
  var css = getComputedStyle(h);
  var tok = function (n) { return hex(css.getPropertyValue(n)); };

  function field(host) {
    var cv = d.createElement('canvas');
    cv.className = 'p-field-canvas'; cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl || !gl.getExtension('OES_standard_derivatives')) return;
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['r', 't', 'm', 'mi', 'amt', 'cBg', 'cLine', 'cMajor', 'cHot'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform3fv(U.cBg, tok('--color-bg'));
    gl.uniform3fv(U.cLine, tok('--color-border'));
    gl.uniform3fv(U.cMajor, tok('--color-text-muted'));
    gl.uniform3fv(U.cHot, tok('--color-primary'));
    gl.uniform1f(U.amt, parseFloat(host.getAttribute('data-field')) || 1);
    host.insertBefore(cv, host.firstChild);
    host.classList.add('p-has-field');

    var dpr = Math.min(w.devicePixelRatio || 1, FINE ? 1.5 : 1), W = 0, H = 0;
    function size() {
      var rc = host.getBoundingClientRect();
      W = Math.max(1, Math.round(rc.width * dpr)); H = Math.max(1, Math.round(rc.height * dpr));
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
      gl.uniform2f(U.r, W, H);
    }
    var tx = -9999, ty = -9999, px = tx, py = ty, inten = 0, want = 0;
    function point(x, y) {
      var rc = host.getBoundingClientRect();
      tx = (x - rc.left) * dpr; ty = (rc.bottom - y) * dpr;
      if (px < -9000) { px = tx; py = ty; }
      want = 1;
    }
    host.addEventListener('pointermove', function (e) { point(e.clientX, e.clientY); }, { passive: true });
    host.addEventListener('pointerleave', function () { want = 0; });
    host.addEventListener('touchmove', function (e) { var t = e.touches[0]; point(t.clientX, t.clientY); }, { passive: true });
    host.addEventListener('touchend', function () { want = 0; }, { passive: true });

    var t0 = performance.now(), seed = Math.random() * 200, visible = true, raf = 0;
    function draw(now) {
      raf = 0;
      if (!visible || d.hidden || !cv.offsetWidth) return;
      px = lerp(px, tx, 0.08); py = lerp(py, ty, 0.08); inten = lerp(inten, want, 0.05);
      gl.uniform1f(U.t, seed + (now - t0) / 1000);
      gl.uniform2f(U.m, px, py); gl.uniform1f(U.mi, inten);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!RM) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf && visible && !d.hidden) raf = requestAnimationFrame(draw); }
    size();
    if (RM) { draw(t0); cv.classList.add('is-on'); }
    else kick();
    requestAnimationFrame(function () { cv.classList.add('is-on'); });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);
    d.addEventListener('visibilitychange', kick);
    var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (RM) draw(performance.now()); else kick(); }, 120); });
    /* a canvas hidden by CSS (the hero on phones) stops drawing; kick() restarts it if the window grows */
    if (RM) host.addEventListener('pointermove', function () { if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
  }
  $$('[data-field]').forEach(field);

  /* ---------- 2. scramble text ---------- */
  var GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789×/#+*';
  function scramble(el) {
    if (el._sc) return;
    var final = el._final || (el._final = el.textContent);
    if (RM || !final.trim()) { el.textContent = final; return; }
    el._sc = true;
    var len = final.length, start = performance.now(), dur = Math.min(900, 280 + len * 32);
    (function step(now) {
      var p = Math.min(1, (now - start) / dur), out = '';
      for (var i = 0; i < len; i++) {
        var c = final.charAt(i);
        if (c === ' ' || p >= (i + 1) / len * 0.85 + 0.15 * p) out += c;
        else out += GL.charAt((Math.random() * GL.length) | 0);
      }
      el.textContent = p < 1 ? out : final;
      if (p < 1) requestAnimationFrame(step); else el._sc = false;
    })(start);
  }
  var scEls = $$('[data-scramble]').filter(function (el) { return !el.children.length; });
  scEls.forEach(function (el) { el.setAttribute('aria-label', el.textContent.trim()); });
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      sio.unobserve(e.target);
      var delay = h.classList.contains('p-loaded') ? 120 : 900;
      setTimeout(function () { scramble(e.target); }, delay);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  scEls.forEach(function (el) { sio.observe(el); });
  if (FINE && !RM) scEls.forEach(function (el) {
    var trigger = el.closest('[data-scramble-host]') || (el.getAttribute('data-scramble') === 'hover' ? el : null);
    if (trigger) trigger.addEventListener('pointerenter', function () { scramble(el); });
  });

  /* ---------- 3–5. scroll skew, progress, tilt ---------- */
  var skews = RM ? [] : $$('[data-skew]');
  var bar = d.querySelector('.p-progress');
  var lastY = w.scrollY, sk = 0;
  function loop() {
    var y = w.scrollY, dy = y - lastY; lastY = y;
    if (skews.length) {
      sk = lerp(sk, Math.max(-3, Math.min(3, dy * -0.12)), 0.12);
      if (Math.abs(sk) < 0.01) sk = 0;
      var v = 'skewY(' + sk.toFixed(3) + 'deg)';
      skews.forEach(function (el) { el.style.transform = sk ? v : ''; });
    }
    if (bar) {
      var max = d.documentElement.scrollHeight - w.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  if (FINE && !RM) $$('[data-tilt]').forEach(function (el) {
    var media = el.querySelector('.p-card-media') || el;
    el.addEventListener('pointermove', function (e) {
      var rc = media.getBoundingClientRect();
      var x = (e.clientX - rc.left) / rc.width - 0.5, y = (e.clientY - rc.top) / rc.height - 0.5;
      media.style.transition = 'transform .2s ease-out';
      media.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
    });
    el.addEventListener('pointerleave', function () {
      media.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
      media.style.transform = '';
    });
  });
})();
