document.getElementById('year').textContent = new Date().getFullYear();
window.EnigmaticaI18n.apply();

/* barra: linha quando a página rola */
(function () {
  var bar = document.querySelector('.bar');
  var tick = function () { bar.classList.toggle('is-stuck', scrollY > 8); };
  tick();
  addEventListener('scroll', tick, { passive: true });
})();

/* lente: revela a cor da imagem sob o cursor; sem cursor, passeia sozinha */
(function () {
  var frame = document.querySelector('[data-lens]');
  if (!frame) return;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pos = { x: 0.4, y: 0.45 }, goal = { x: 0.4, y: 0.45 };
  var radius = 0, radiusGoal = 0, hovering = false, lastMove = 0, t0 = performance.now();

  function size() { return frame.getBoundingClientRect(); }

  function render() {
    var r = size();
    var px = pos.x * r.width, py = pos.y * r.height;
    var img = frame.querySelector('.frame-color');
    frame.style.setProperty('--x', (px - img.offsetLeft).toFixed(1) + 'px');
    frame.style.setProperty('--y', (py - img.offsetTop).toFixed(1) + 'px');
    frame.style.setProperty('--px', px.toFixed(1) + 'px');
    frame.style.setProperty('--py', py.toFixed(1) + 'px');
    frame.style.setProperty('--r', radius.toFixed(1) + 'px');
  }

  function baseRadius() {
    var r = size();
    return Math.max(70, Math.min(r.width, r.height) * (hovering ? 0.3 : 0.24));
  }

  if (still) {
    radius = baseRadius();
    render();
    addEventListener('resize', function () { radius = baseRadius(); render(); });
    return;
  }

  frame.addEventListener('pointermove', function (e) {
    var r = size();
    goal.x = (e.clientX - r.left) / r.width;
    goal.y = (e.clientY - r.top) / r.height;
    hovering = true;
    lastMove = performance.now();
  });
  frame.addEventListener('pointerleave', function () { hovering = false; });

  function loop(now) {
    if (!hovering && now - lastMove > 600) {
      var t = (now - t0) / 1000;
      goal.x = (innerWidth > 760 ? 0.34 : 0.5) + Math.sin(t * 0.23) * (innerWidth > 760 ? 0.22 : 0.3);
      goal.y = (innerWidth > 760 ? 0.45 : 0.5) + Math.sin(t * 0.37 + 1.2) * 0.25;
    }
    radiusGoal = baseRadius();
    pos.x += (goal.x - pos.x) * (hovering ? 0.18 : 0.04);
    pos.y += (goal.y - pos.y) * (hovering ? 0.18 : 0.04);
    radius += (radiusGoal - radius) * 0.06;
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* galeria: botões anterior / próxima */
(function () {
  var track = document.querySelector('[data-track]');
  if (!track) return;
  document.querySelectorAll('[data-reel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = track.querySelector('li');
      var step = item ? item.getBoundingClientRect().width + 20 : 400;
      track.scrollBy({ left: step * Number(btn.getAttribute('data-reel')), behavior: 'smooth' });
    });
  });
})();
