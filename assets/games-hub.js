(function () {
  var I = window.EnigmaticaI18n;
  var games = window.GAMES || [];
  var grid = document.getElementById('grid');
  var filtersEl = document.getElementById('filters');
  var countEl = document.getElementById('count');
  var filter = 'all';
  var STATUSES = ['released', 'development', 'announced'];

  document.getElementById('year').textContent = new Date().getFullYear();

  function tx(key, vars) {
    var s = I.t(key) || key;
    Object.keys(vars || {}).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function loc(obj) { return obj ? (obj[I.lang] || obj.en || obj.pt || '') : ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- capa gerada: um selo único por jogo, derivado do id ---- */
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
  function hex(cx, cy, r, rot) {
    var p = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i + rot - Math.PI / 2;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  function cover(g) {
    var R = rng(g.id), hue = g.hue == null ? 28 : g.hue;
    var c1 = 'hsl(' + hue + ' 92% 60%)', c2 = 'hsl(' + (hue + 14) + ' 85% 72%)', c3 = 'hsl(' + (hue - 10) + ' 70% 40%)';
    var cx = 200, cy = 236, rings = 3 + Math.floor(R() * 4), twist = (R() - .5) * .9;
    var s = '';
    s += '<defs><radialGradient id="g-' + g.id + '" cx="50%" cy="46%" r="62%">' +
         '<stop offset="0" stop-color="hsl(' + hue + ' 70% 22%)"/><stop offset="1" stop-color="hsl(' + hue + ' 40% 6%)"/></radialGradient></defs>';
    s += '<rect width="400" height="480" fill="url(#g-' + g.id + ')"/>';
    for (var y = 24; y < 480; y += 24) for (var x = 24; x < 400; x += 24) {
      if (R() < .55) s += '<circle cx="' + x + '" cy="' + y + '" r=".9" fill="' + c2 + '" opacity=".16"/>';
    }
    s += '<g class="sigil">';
    for (var i = 0; i < rings; i++) {
      var r = 150 - i * (110 / rings);
      s += '<polygon points="' + hex(cx, cy, r, i * twist) + '" fill="none" stroke="' + (i % 2 ? c2 : c1) + '" stroke-width="' + (i === 0 ? 2.4 : 1.2) + '" opacity="' + (1 - i * .12).toFixed(2) + '"/>';
    }
    // as três arestas do cubo, como na marca
    var inner = 150 - (rings - 1) * (110 / rings);
    [Math.PI / 6, Math.PI * 5 / 6, Math.PI * 1.5].forEach(function (a) {
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + 150 * Math.cos(a)).toFixed(1) + '" y2="' + (cy + 150 * Math.sin(a)).toFixed(1) + '" stroke="' + c1 + '" stroke-width="1.6" opacity=".75"/>';
    });
    var cuts = 2 + Math.floor(R() * 3);
    for (var k = 0; k < cuts; k++) {
      var a1 = R() * Math.PI * 2, a2 = a1 + (R() * 2 - 1) * 1.6, rr = 40 + R() * 110;
      s += '<line x1="' + (cx + rr * Math.cos(a1)).toFixed(1) + '" y1="' + (cy + rr * Math.sin(a1)).toFixed(1) +
           '" x2="' + (cx + rr * Math.cos(a2)).toFixed(1) + '" y2="' + (cy + rr * Math.sin(a2)).toFixed(1) +
           '" stroke="' + c3 + '" stroke-width="1" stroke-dasharray="3 5"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(6, inner * .22).toFixed(1) + '" fill="' + c2 + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(14, inner * .5).toFixed(1) + '" fill="none" stroke="' + c2 + '" stroke-width="1" opacity=".5"/>';
    s += '</g>';
    return '<svg class="cover-art" viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(tx('coverAlt', { t: g.title })) + '">' + s + '</svg>';
  }

  function linkBtn(href, label, primary) {
    var ext = /^https?:/.test(href);
    return '<a class="pill' + (primary ? ' pill-solid' : '') + '" href="' + esc(href) + '"' +
      (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(label) +
      (ext ? '<span class="sr-only"> ' + esc(tx('newTab')) + '</span>' : '') + '</a>';
  }

  function card(g, n) {
    var links = '';
    if (g.links && g.links.site) links += linkBtn(g.links.site, tx('link.site'), true);
    if (g.links && g.links.itch) links += linkBtn(g.links.itch, tx('link.itch'));
    if (g.links && 'steam' in g.links) {
      links += g.links.steam ? linkBtn(g.links.steam, tx('link.steam'))
        : '<span class="pill pill-off" aria-disabled="true">' + esc(tx('link.steam')) + ' · ' + esc(tx('link.soon')) + '</span>';
    }
    var main = g.links && (g.links.site || g.links.itch || g.links.steam);
    var meta = [loc(g.genre)].concat(g.platforms || []).concat(g.year ? [g.year] : []).filter(Boolean).join(' · ');
    return '<li class="card" style="--h:' + (g.hue == null ? 28 : g.hue) + '"><div class="card-in">' +
      (main ? '<a class="cover" href="' + esc(main) + '" tabindex="-1" aria-hidden="true"' + (/^https?:/.test(main) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' : '<div class="cover">') +
        cover(g) +
        '<span class="cover-no">' + String(n).padStart(2, '0') + '</span>' +
      (main ? '</a>' : '</div>') +
      '<div class="card-body">' +
        '<p class="status status-' + g.status + '">' + esc(tx('status.' + g.status)) + '</p>' +
        '<h3 class="card-title">' + esc(g.title) + '</h3>' +
        '<p class="card-text">' + esc(loc(g.tagline)) + '</p>' +
        '<p class="card-meta">' + esc(meta) + '</p>' +
        '<div class="card-links">' + links + '</div>' +
      '</div></div></li>';
  }

  function nextCard() {
    return '<li class="card card-next"><div class="card-in">' +
      '<div class="cover cover-next" aria-hidden="true"><svg viewBox="70 120 260 260"><polygon points="' + hex(200, 236, 120, 0) + '"/><polyline points="96,176 200,236 304,176"/><line x1="200" y1="236" x2="200" y2="356"/></svg></div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">' + esc(tx('next.title')) + '</h3>' +
        '<p class="card-text">' + esc(tx('next.text')) + '</p>' +
        '<div class="card-links">' + linkBtn('https://discord.gg/URapb2bbFA', tx('next.cta')) + '</div>' +
      '</div></div></li>';
  }

  function render() {
    var list = games.filter(function (g) { return filter === 'all' || g.status === filter; });
    grid.innerHTML = list.map(function (g) { return card(g, games.indexOf(g) + 1); }).join('') + (filter === 'all' ? nextCard() : '');
    countEl.textContent = tx(games.length === 1 ? 'count.one' : 'count.many', { n: games.length });

    var used = STATUSES.filter(function (s) { return games.some(function (g) { return g.status === s; }); });
    if (games.length >= 4 && used.length > 1) {
      filtersEl.hidden = false;
      filtersEl.innerHTML = ['all'].concat(used).map(function (s) {
        return '<button type="button" data-filter="' + s + '" aria-pressed="' + (s === filter) + '">' + esc(tx(s === 'all' ? 'filter.all' : 'status.' + s)) + '</button>';
      }).join('');
    } else {
      filtersEl.hidden = true;
    }
  }

  filtersEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.getAttribute('data-filter');
    render();
  });

  I.onChange(render);
  I.apply();
})();
