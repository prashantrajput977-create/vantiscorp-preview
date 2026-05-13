/* VantisCorp — subtle scroll animation system
   Uses IntersectionObserver. Adds .in-view to .fade-in and .stagger elements
   when they enter the viewport. Respects prefers-reduced-motion. */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function autoTag() {
    // Auto-add fade-in to common section parts so pages don't need to opt in everywhere
    const selectors = [
      'section .eyebrow',
      'section h1', 'section h2', 'section h3',
      'section .lead',
      'section > .container > p',
      'section .actions',
      'section .stat-row',
      'section .mock',
      'section .quote',
      'section .cta-banner'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('fade-in') && !el.closest('.stagger')) {
          el.classList.add('fade-in');
        }
      });
    });

    // Tag grids of cards as stagger containers
    document.querySelectorAll('.grid, .agent-features, .steps, .int-grid, .v5-grid, .brand-strip').forEach(el => {
      el.classList.add('stagger');
    });
  }

  function setupObserver() {
    if (reduce) {
      document.querySelectorAll('.fade-in, .stagger').forEach(el => el.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.fade-in, .stagger').forEach(el => io.observe(el));
  }

  function counters() {
    const els = document.querySelectorAll('.counter');
    if (!els.length) return;
    const speed = 60;
    const start = (el) => {
      const target = +el.getAttribute('data-target');
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      if (reduce) { el.innerText = prefix + target + suffix; return; }
      let count = 0;
      const step = () => {
        const inc = Math.max(1, target / speed);
        count += inc;
        if (count < target) {
          el.innerText = prefix + Math.ceil(count) + suffix;
          requestAnimationFrame(step);
        } else {
          el.innerText = prefix + target + suffix;
        }
      };
      step();
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = +e.target.getAttribute('data-delay') || 0;
          setTimeout(() => start(e.target), delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(c => obs.observe(c));
  }

  function notibar() {
    var bar = document.querySelector('.notibar');
    if (!bar) return;
    try {
      if (localStorage.getItem('vc_notibar_dismissed') === '1') {
        bar.classList.add('is-hidden');
        return;
      }
    } catch (e) {}
    var btn = bar.querySelector('.notibar-close');
    if (btn) {
      btn.addEventListener('click', function () {
        bar.classList.add('is-hidden');
        try { localStorage.setItem('vc_notibar_dismissed', '1'); } catch (e) {}
      });
    }
  }

  function mobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('header .nav');
    if (!toggle || !nav) return;
    var body = document.body;
    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('nav-open');
    }
    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
    }
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (nav.classList.contains('is-open')) { close(); } else { open(); }
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { close(); });
    });
    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });
    // Close on resize over breakpoint
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && nav.classList.contains('is-open')) close();
    });
  }

  function demoForm() {
    var form = document.getElementById('demoForm');
    if (!form) return;
    var status = document.getElementById('formStatus');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setStatus(msg, cls) {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove('is-success', 'is-error');
      if (cls) status.classList.add(cls);
    }
    function clearErrors() {
      form.querySelectorAll('.is-error').forEach(function (el) { el.classList.remove('is-error'); });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var name = form.elements['name'];
      var email = form.elements['email'];
      var company = form.elements['company'];
      var errs = [];
      if (!name.value.trim()) { name.classList.add('is-error'); errs.push('name'); }
      if (!email.value.trim() || !EMAIL_RE.test(email.value.trim())) { email.classList.add('is-error'); errs.push('email'); }
      if (!company.value.trim()) { company.classList.add('is-error'); errs.push('company'); }
      if (errs.length) {
        setStatus('Please fill in your name, a valid work email, and company.', 'is-error');
        return;
      }
      // PREVIEW ONLY — WordPress dev: replace this block with a real fetch/POST to your backend.
      // The form already POSTs all fields by name (name, email, company, phone, message).
      setStatus("Thanks " + name.value.trim().split(' ')[0] + " — we'll be in touch within 1 business day.", 'is-success');
      form.reset();
    });
  }

  function init() {
    autoTag();
    setupObserver();
    counters();
    notibar();
    mobileMenu();
    demoForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
