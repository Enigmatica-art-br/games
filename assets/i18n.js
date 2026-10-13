/*
 * Enigmática — troca de idioma (pt-BR / en)
 * O idioma escolhido vale para enigmatica.art.br e todos os subdomínios
 * (cookie em .enigmatica.art.br), com localStorage como reserva.
 *
 * Marcação:
 *   data-i18n="chave"            -> textContent
 *   data-i18n-html="chave"       -> innerHTML (só textos nossos, com <br>)
 *   data-i18n-attr="alt:chave;aria-label:outra"
 *   [data-lang] em botões        -> troca o idioma
 * Dicionário: window.I18N = { pt: {...}, en: {...} }
 * Chaves especiais: "meta.title", "meta.description".
 */
(function () {
  var LANGS = { pt: 'pt-BR', en: 'en' };
  var KEY = 'enigmatica-lang';
  var listeners = [];

  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)enigmatica-lang=(pt|en)/);
    return m ? m[1] : null;
  }

  function save(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    var domain = /(^|\.)enigmatica\.art\.br$/.test(location.hostname) ? '; domain=.enigmatica.art.br' : '';
    document.cookie = KEY + '=' + lang + '; path=/; max-age=31536000; SameSite=Lax' + domain;
  }

  function initial() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'pt' || q === 'en') return q;
    var c = readCookie();
    if (c) return c;
    try {
      var s = localStorage.getItem(KEY);
      if (s === 'pt' || s === 'en') return s;
    } catch (e) {}
    return 'en'; // padrão: inglês
  }

  function t(key, lang) {
    var dict = (window.I18N || {})[lang || current] || {};
    return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null;
  }

  var current = initial();

  function apply(lang) {
    current = lang;
    var root = document.documentElement;
    root.lang = LANGS[lang];

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length < 2) return;
        var v = t(p[1].trim());
        if (v !== null) el.setAttribute(p[0].trim(), v);
      });
    });

    var title = t('meta.title');
    if (title) document.title = title;
    var desc = t('meta.description');
    var meta = document.querySelector('meta[name="description"]');
    if (desc && meta) meta.setAttribute('content', desc);

    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });

    listeners.forEach(function (fn) { fn(lang); });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (!b) return;
    var lang = b.getAttribute('data-lang');
    if (lang === current) return;
    save(lang);
    apply(lang);
  });

  window.EnigmaticaI18n = {
    get lang() { return current; },
    t: t,
    apply: function () { apply(current); },
    onChange: function (fn) { listeners.push(fn); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(current); });
  } else {
    apply(current);
  }
})();
