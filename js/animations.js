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
      let count = 0;
      const step = () => {
        const inc = Math.max(1, target / speed);
        count += inc;
        if (count < target) { el.innerText = Math.ceil(count); requestAnimationFrame(step); }
        else { el.innerText = target; }
      };
      step();
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { start(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(c => obs.observe(c));
  }

  function init() {
    autoTag();
    setupObserver();
    counters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
