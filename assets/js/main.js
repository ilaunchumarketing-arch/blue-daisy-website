/* Blue Daisy Lawn Care — site JS
   - mobile nav toggle
   - language switcher (maps to /es/ and /pt/ mirror paths)
   - FAQ accordion
   - reveal-on-scroll
*/
(function () {
  'use strict';

  /* ---------- Promo / announcement bar (language-aware, all pages) ---------- */
  (function () {
    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    var promos = {
      en: { t: 'New Homeowner Special — <strong>50% off your first month.</strong> Cancel anytime, no contracts.', c: 'Get 50% Off', u: '/contact/' },
      es: { t: 'Especial para Nuevos Propietarios — <strong>50% de descuento en tu primer mes.</strong> Cancela cuando quieras, sin contratos.', c: 'Obtener 50%', u: '/es/contact/' },
      pt: { t: 'Oferta para Novos Proprietários — <strong>50% de desconto no primeiro mês.</strong> Cancele quando quiser, sem contrato.', c: 'Quero 50%', u: '/pt/contact/' }
    };
    var p = promos[lang] || promos.en;
    var bar = document.createElement('div');
    bar.className = 'promo-bar';
    bar.innerHTML = '<span>' + p.t + '</span><a class="promo-cta" href="' + p.u + '">' + p.c + ' →</a>';
    document.body.insertBefore(bar, document.body.firstChild);
  })();

  /* ---------- Translations gate ----------
     Set to true once /es/ and /pt/ pages are live. While false, hide the
     language switcher and footer language links so they don't 404. */
  var TRANSLATIONS_LIVE = true;
  if (!TRANSLATIONS_LIVE) {
    var langEl = document.querySelector('.lang');
    if (langEl) langEl.style.display = 'none';
    document.querySelectorAll('.footer-bottom a[href="/es/"], .footer-bottom a[href="/pt/"]').forEach(function (a) {
      a.style.display = 'none';
    });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
      var open = document.body.classList.contains('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a:not(.has-drop > a)').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  /* ---------- Language switcher ----------
     Mirror structure: EN at /path, ES at /es/path, PT at /pt/path.
     Compute the language-neutral base path, then build the target URL. */
  var LANGS = ['es', 'pt'];
  function basePath() {
    var p = location.pathname;
    for (var i = 0; i < LANGS.length; i++) {
      var pre = '/' + LANGS[i];
      if (p === pre || p === pre + '/') return '/';
      if (p.indexOf(pre + '/') === 0) return p.slice(pre.length);
    }
    return p || '/';
  }
  function urlFor(lang) {
    var base = basePath();
    if (lang === 'en') return base;
    var t = '/' + lang + (base === '/' ? '/' : base);
    return t;
  }
  var langWrap = document.querySelector('.lang');
  if (langWrap) {
    var btn = langWrap.querySelector('.lang__btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      langWrap.classList.toggle('open');
    });
    document.addEventListener('click', function () { langWrap.classList.remove('open'); });
    langWrap.querySelectorAll('[data-lang]').forEach(function (a) {
      a.setAttribute('href', urlFor(a.getAttribute('data-lang')));
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq__item');
      var ans = item.querySelector('.faq__a');
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open');
      q.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      ans.style.maxHeight = isOpen ? null : ans.scrollHeight + 'px';
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();
