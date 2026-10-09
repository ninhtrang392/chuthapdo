// ==================== FLOW: chuyển trang & nút hút chuột (dùng chung index.html + chuong-trinh.html) ====================
// Requires gsap (loaded before this file). Everything here is skipped when the user prefers reduced motion.
(() => {
  const root = document.documentElement;
  const allowMotion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = document.querySelector('.page-transition');
  const panel = overlay && overlay.querySelector('.pt-panel');
  const logo = overlay && overlay.querySelector('.pt-logo');

  // ---------- Page transition: reveal on enter ----------
  const reveal = () => {
    if (!overlay || !window.gsap || !allowMotion) {
      root.classList.remove('pt-enter');
      return;
    }
    // Pin the curtain in place with GSAP first, then drop the CSS class (otherwise GSAP would read the
    // CSS translateY(100%) as pixels and the curtain would start off-screen).
    gsap.set(panel, { y: 0, yPercent: 0 });
    root.classList.remove('pt-enter');
    gsap.timeline()
      .to(logo, { opacity: 0, y: -16, duration: 0.3, ease: 'power2.in' })
      .to(panel, { yPercent: -100, duration: 0.75, ease: 'power3.inOut' }, '<0.1')
      .set(panel, { yPercent: 100 });
  };
  // Deferred script → DOM is parsed; don't wait for heavy images. Other intros can read this delay.
  window.flowEnterDelay = overlay && window.gsap && allowMotion ? 0.55 : 0;
  requestAnimationFrame(reveal);
  // Back/forward cache: make sure the curtain is not left covering the page.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && window.gsap && panel) gsap.set(panel, { y: 0, yPercent: 100 });
  });

  // ---------- Page transition: cover on leave (same-site page links only) ----------
  const isPageLink = (link) => {
    if (!link || link.target === '_blank' || link.hasAttribute('download') || link.dataset.panel !== undefined) return false;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin && url.protocol !== 'file:') return false;
    if (url.protocol === 'file:' && window.location.protocol !== 'file:') return false;
    const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
    return !samePage && /\.html$/.test(url.pathname);
  };
  document.addEventListener('click', (event) => {
    if (!allowMotion || !overlay || !window.gsap || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const link = event.target.closest('a[href]');
    if (!isPageLink(link)) return;
    event.preventDefault();
    gsap.timeline({ onComplete: () => { window.location.href = link.href; } })
      .set(panel, { y: 0, yPercent: 100 })
      .set(logo, { opacity: 0, y: 16 })
      .to(panel, { yPercent: 0, duration: 0.6, ease: 'power3.inOut' })
      .to(logo, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.15');
  });

  // ---------- Footer: lên đầu trang (qua ScrollSmoother nếu trang có) ----------
  const toTop = document.querySelector('.footer-top');
  if (toTop) {
    toTop.addEventListener('click', (event) => {
      event.preventDefault();
      const smoother = window.ScrollSmoother && ScrollSmoother.get();
      if (smoother) smoother.scrollTo(0, true);
      else window.scrollTo({ top: 0, behavior: allowMotion ? 'smooth' : 'auto' });
    });
  }

  // ---------- Footer: wordmark trồi lên theo scroll ----------
  // Next frame: script.js (deferred, runs after this file) creates ScrollSmoother first, as ScrollTrigger expects.
  if (allowMotion && window.gsap && window.ScrollTrigger && document.querySelector('.footer-wordmark')) {
    requestAnimationFrame(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.footer-wordmark span', { yPercent: 70 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '.footer-wordmark', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      });
    });
  }

  // ---------- Magnetic buttons (fine pointers only; transform-only via quickTo) ----------
  if (!allowMotion || !window.gsap || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach((button) => {
    const xTo = gsap.quickTo(button, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(button, 'y', { duration: 0.4, ease: 'power3' });
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect();
      xTo((event.clientX - (box.left + box.width / 2)) * 0.25);
      yTo((event.clientY - (box.top + box.height / 2)) * 0.35);
    });
    button.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
})();
