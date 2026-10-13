(function () {
  var I = window.EnigmaticaI18n;
  var games = window.GAMES || [];
  var root = document.getElementById('exhibits');
  var countEl = document.getElementById('count');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  function tx(key, vars) {
    var s = I.t(key) || key;
    Object.keys(vars || {}).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function loc(o) { return o ? (o[I.lang] || o.en || o.pt || '') : ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ext(u) { return /^https?:/.test(u); }

  /* ---------- arte gerada a partir do id do jogo ---------- */
  function rng(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5; var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function poly(cx, cy, r, rot, n) {
    var p = [];
    for (var i = 0; i < n; i++) {
      var a = (Math.PI * 2 / n) * i + rot - Math.PI / 2;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  function art(g, uid, flip) {
    var R = rng(g.id), hue = g.hue == null ? 28 : g.hue;
    var W = 1400, H = 600, cx = (flip ? 930 : 470) + (R() - .5) * 160, cy = 300;
    var a = 'hsl(' + hue + ' 95% 58%)', b = 'hsl(' + (hue + 16) + ' 90% 72%)', c = 'hsl(' + (hue - 12) + ' 75% 42%)';
    var s = '<defs><radialGradient id="bg' + uid + '" cx="' + (cx / W * 100).toFixed(0) + '%" cy="50%" r="70%">' +
      '<stop offset="0" stop-color="hsl(' + hue + ' 65% 24%)"/><stop offset=".55" stop-color="hsl(' + hue + ' 45% 11%)"/><stop offset="1" stop-color="hsl(' + hue + ' 30% 5%)"/></radialGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#bg' + uid + ')"/>';
    // linhas de contorno que atravessam a moldura
    var waves = 9 + Math.floor(R() * 6), amp = 18 + R() * 30, freq = .004 + R() * .004, ph = R() * 6;
    for (var w = 0; w < waves; w++) {
      var y0 = 40 + w * (H - 80) / (waves - 1), d = 'M0 ' + y0.toFixed(1);
      for (var x = 20; x <= W; x += 20) {
        var dist = Math.hypot(x - cx, y0 - cy), bend = Math.exp(-dist * dist / 90000) * 70 * (y0 < cy ? -1 : 1);
        d += ' L' + x + ' ' + (y0 + Math.sin(x * freq + ph + w * .6) * amp * .4 + bend).toFixed(1);
      }
      s += '<path d="' + d + '" fill="none" stroke="' + (w % 3 ? c : a) + '" stroke-width="1" opacity="' + (w % 3 ? .45 : .7) + '"/>';
    }
    // selo: hexágonos aninhados com as arestas do cubo
    var sides = R() < .7 ? 6 : 3 + Math.floor(R() * 2) * 2 + 2, rings = 4 + Math.floor(R() * 4), twist = (R() - .5) * .8;
    s += '<g class="sigil" style="transform-origin:' + cx.toFixed(0) + 'px ' + cy + 'px">';
    for (var i = 0; i < rings; i++) {
      var r = 230 - i * (170 / rings);
      s += '<polygon points="' + poly(cx, cy, r, i * twist, i === 0 ? 6 : sides) + '" fill="' + (i === 0 ? 'hsl(' + hue + ' 40% 8% / .55)' : 'none') + '" stroke="' + (i % 2 ? b : a) + '" stroke-width="' + (i === 0 ? 3 : 1.4) + '"/>';
    }
    [Math.PI / 6, Math.PI * 5 / 6, Math.PI * 1.5].forEach(function (t) {
      s += '<line x1="' + cx.toFixed(1) + '" y1="' + cy + '" x2="' + (cx + 230 * Math.cos(t)).toFixed(1) + '" y2="' + (cy + 230 * Math.sin(t)).toFixed(1) + '" stroke="' + a + '" stroke-width="2"/>';
    });
    s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="16" fill="' + b + '"/>';
    s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="40" fill="none" stroke="' + b + '" stroke-width="1.2" opacity=".6"/>';
    s += '</g>';
    // estrelas/poeira
    for (var k = 0; k < 70; k++) {
      s += '<circle cx="' + (R() * W).toFixed(0) + '" cy="' + (R() * H).toFixed(0) + '" r="' + (R() * 1.6 + .4).toFixed(1) + '" fill="' + b + '" opacity="' + (R() * .5 + .15).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s + '</svg>';
  }

  function splitTitle(t) {
    var i = t.indexOf(':');
    return i > 0 ? '<span class="pre">' + esc(t.slice(0, i + 1)) + '</span> ' + esc(t.slice(i + 1).trim()) : esc(t);
  }

  function btn(href, label, solid) {
    return '<a class="btn' + (solid ? ' btn-solid' : '') + '" href="' + esc(href) + '"' + (ext(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
      esc(label) + (ext(href) ? '<span class="sr-only"> ' + esc(tx('newTab')) + '</span>' : '') + '</a>';
  }

  function exhibit(g, n) {
    var L = g.links || {}, main = L.site || L.itch || L.steam;
    var actions = '';
    if (L.site) actions += btn(L.site, tx('link.site'), true);
    if (L.itch) actions += btn(L.itch, tx('link.itch'), !L.site);
    if ('steam' in L) actions += L.steam ? btn(L.steam, tx('link.steam')) : '<span class="btn btn-off" aria-disabled="true">' + esc(tx('link.steamSoon')) + '</span>';
    var facts = '<div><dt>' + esc(tx('facts.genre')) + '</dt><dd>' + esc(loc(g.genre)) + '</dd></div>' +
      '<div><dt>' + esc(tx('facts.platform')) + '</dt><dd>' + esc((g.platforms || []).join(', ')) + '</dd></div>' +
      (g.year ? '<div><dt>' + esc(tx('facts.year')) + '</dt><dd>' + esc(g.year) + '</dd></div>'
              : '<div><dt>' + esc(tx('facts.studio')) + '</dt><dd>Enigmática</dd></div>');
    var uid = 'g' + n;
    var frameOpen = main ? '<a class="frame" data-lens href="' + esc(main) + '"' + (ext(main) ? ' target="_blank" rel="noopener noreferrer"' : '') + ' aria-label="' + esc(tx('frameLabel', { t: g.title })) + '">' : '<div class="frame" data-lens>';
    return '<article class="exhibit' + (n % 2 === 0 ? ' is-flip' : '') + '" style="--h:' + (g.hue == null ? 28 : g.hue) + '" aria-labelledby="t-' + uid + '">' +
      frameOpen +
        (g.cover
          ? '<div class="frame-art frame-base"><img src="' + esc(g.cover) + '" alt="" loading="' + (n === 1 ? 'eager' : 'lazy') + '"></div>' +
            '<div class="frame-art frame-color"><img src="' + esc(g.cover) + '" alt="' + esc(loc(g.coverAlt) || tx('coverAlt', { t: g.title })) + '" loading="' + (n === 1 ? 'eager' : 'lazy') + '"></div>'
          : '<div class="frame-art frame-base">' + art(g, uid + 'a', n % 2 === 0) + '</div>' +
            '<div class="frame-art frame-color" role="img" aria-label="' + esc(tx('coverAlt', { t: g.title })) + '">' + art(g, uid + 'b', n % 2 === 0) + '</div>') +
        '<span class="frame-ring" aria-hidden="true"></span>' +
      (main ? '</a>' : '</div>') +
      '<div class="placard">' +
        '<p class="placard-no"><span>' + esc(tx('gameNo', { n: n })) + '</span><span class="status status-' + g.status + '">' + esc(tx('status.' + g.status)) + '</span></p>' +
        '<h3 id="t-' + uid + '">' + splitTitle(g.title) + '</h3>' +
        '<p class="placard-text">' + esc(loc(g.tagline)) + '</p>' +
        '<dl class="facts">' + facts + '</dl>' +
        '<div class="actions">' + actions + '</div>' +
      '</div>' +
    '</article>';
  }

  var lenses = [];
  function render() {
    root.innerHTML = games.map(function (g, i) { return exhibit(g, i + 1); }).join('');
    countEl.textContent = tx(games.length === 1 ? 'count.one' : 'count.many', { n: games.length });
    lenses = Array.prototype.map.call(root.querySelectorAll('[data-lens]'), makeLens);
  }

  /* ---------- lente: revela a cor sob o cursor; sem cursor, passeia ---------- */
  function makeLens(frame, idx) {
    var flip = !!frame.closest('.is-flip');
    var st = { flip: flip, x: flip ? .66 : .34, y: .5, gx: .5, gy: .5, r: 0, hover: false, last: 0, seed: idx * 1.7 };
    frame.addEventListener('pointermove', function (e) {
      var b = frame.getBoundingClientRect();
      st.gx = (e.clientX - b.left) / b.width; st.gy = (e.clientY - b.top) / b.height;
      st.hover = true; st.last = performance.now();
    });
    frame.addEventListener('pointerleave', function () { st.hover = false; });
    st.el = frame;
    return st;
  }
  function draw(st, now) {
    var f = st.el, b = f.getBoundingClientRect();
    if (b.bottom < 0 || b.top > innerHeight) return;
    if (!still && !st.hover && now - st.last > 600) {
      var t = now / 1000 + st.seed;
      var wide = innerWidth > 760;
      st.gx = (wide ? (st.flip ? .68 : .32) : .55) + Math.sin(t * .23) * (wide ? .2 : .25); st.gy = .5 + Math.sin(t * .37 + 1.2) * .24;
    }
    var k = still ? 1 : (st.hover ? .18 : .04);
    st.x += (st.gx - st.x) * k; st.y += (st.gy - st.y) * k;
    var goal = Math.max(70, Math.min(b.width, b.height) * (st.hover ? .34 : .28));
    st.r += (goal - st.r) * (still ? 1 : .06);
    var art = f.querySelector('.frame-color');
    var px = st.x * b.width, py = st.y * b.height;
    f.style.setProperty('--x', (px - art.offsetLeft).toFixed(1) + 'px');
    f.style.setProperty('--y', (py - art.offsetTop).toFixed(1) + 'px');
    f.style.setProperty('--px', px.toFixed(1) + 'px');
    f.style.setProperty('--py', py.toFixed(1) + 'px');
    f.style.setProperty('--r', st.r.toFixed(1) + 'px');
  }
  function loop(now) {
    lenses.forEach(function (st) { draw(st, now); });
    if (!still) requestAnimationFrame(loop);
  }

  I.onChange(render);
  I.apply();
  if (still) { loop(0); addEventListener('resize', function () { loop(0); }); }
  else requestAnimationFrame(loop);
})();

/* barra: linha quando a página rola */
(function () {
  var bar = document.querySelector('.bar');
  var tick = function () { bar.classList.toggle('is-stuck', scrollY > 8); };
  tick();
  addEventListener('scroll', tick, { passive: true });
})();
