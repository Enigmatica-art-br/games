(function () {
  var header = document.querySelector('[data-header]');
  var tick = function () { header.classList.toggle('is-scrolled', scrollY > 30); };
  tick();
  addEventListener('scroll', tick, { passive: true });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* entrada única por seção */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* galeria: abre a imagem ampliada */
  var lb = document.querySelector('[data-lightbox]');
  var lbImg = lb.querySelector('img');
  document.querySelectorAll('.shot').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      lbImg.src = btn.getAttribute('data-full');
      lbImg.alt = img.alt;
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-close')) lb.close(); });
})();
