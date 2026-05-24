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

  /* ---------- Lead form -> GoHighLevel (contact + opportunity at New Lead) ---------- */
  (function () {
    var form = document.getElementById('lead-form');
    if (!form) return;
    var GHL = {
      token: 'pit-e04db58a-3dc4-4f5a-81f9-d1b583e7b8e1',
      loc: 'FjGUs5RjOkI5lKY2fxy1',
      pipeline: 'pT2d8fHSBLIFkHezD7OJ',
      stage: 'd119d2b6-5d78-4c03-aac3-07e7b195d57b'
    };
    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    var T = ({
      en: { sending: 'Sending…', err: 'Something went wrong — please call (787) 671-2771.' },
      es: { sending: 'Enviando…', err: 'Algo salió mal — llámanos al (787) 671-2771.' },
      pt: { sending: 'Enviando…', err: 'Algo deu errado — ligue para (787) 671-2771.' }
    })[lang] || { sending: 'Sending…', err: 'Something went wrong — please call (787) 671-2771.' };
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = val('lead-name'), phone = val('lead-phone');
      if (!name || !phone) { if (form.reportValidity) form.reportValidity(); return; }
      var email = val('lead-email'), city = val('lead-city'),
          service = val('lead-service'), message = val('lead-message');
      var parts = name.split(/\s+/), first = parts.shift(), last = parts.join(' ') || '-';
      var btn = form.querySelector('button[type="submit"]'), orig = btn.textContent;
      btn.disabled = true; btn.textContent = T.sending;
      var H = { 'Authorization': 'Bearer ' + GHL.token, 'Content-Type': 'application/json', 'Version': '2021-07-28' };
      if (window.fbq) fbq('track', 'Lead');

      var contactBody = {
        firstName: first, lastName: last, phone: phone, locationId: GHL.loc,
        source: 'Website ' + lang.toUpperCase() + ' — ' + location.hostname,
        tags: ['Website Lead', 'Lang: ' + lang.toUpperCase()]
      };
      if (email) contactBody.email = email;
      if (city) { contactBody.city = city; contactBody.tags.push('City: ' + city); }
      if (service) contactBody.tags.push('Service: ' + service);

      fetch('https://services.leadconnectorhq.com/contacts/', { method: 'POST', headers: H, body: JSON.stringify(contactBody) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var cid = d.contact && d.contact.id;
          if (!cid) throw new Error('no contact id');
          if (message) {
            fetch('https://services.leadconnectorhq.com/contacts/' + cid + '/notes',
              { method: 'POST', headers: H, body: JSON.stringify({ body: message }) }).catch(function () {});
          }
          return fetch('https://services.leadconnectorhq.com/opportunities/', {
            method: 'POST', headers: H, body: JSON.stringify({
              pipelineId: GHL.pipeline, locationId: GHL.loc, pipelineStageId: GHL.stage,
              status: 'open', contactId: cid, name: '[Web] ' + name + (service ? ' — ' + service : '')
            })
          });
        })
        .then(function () {
          form.style.display = 'none';
          var ok = document.getElementById('lead-success');
          if (ok) ok.style.display = 'block';
        })
        .catch(function () { btn.disabled = false; btn.textContent = orig; alert(T.err); });
    });
  })();

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
