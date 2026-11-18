// ==================== FLOW: nút lên đầu trang & nút hút chuột (dùng chung các trang) ====================
// Requires gsap (loaded before this file). Chuyển động được bỏ qua khi người dùng chọn giảm chuyển động.
(() => {
  const allowMotion = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Footer: lên đầu trang (qua ScrollSmoother nếu trang có) ----------
  const toTop = document.querySelector('.footer-top');
  if (toTop) {
    toTop.addEventListener('click', (event) => {
      event.preventDefault();
      const smoother = window.ScrollSmoother && ScrollSmoother.get();
      if (smoother) smoother.scrollTo(0, true);
      else window.scrollTo({ top: 0, behavior: allowMotion ? 'smooth' : 'auto' });
    });
    // Chỉ hiện khi người dùng đã bắt đầu cuộn (ScrollSmoother vẫn cuộn trang gốc nên scrollY dùng được cho mọi trang)
    const syncToTop = () => toTop.classList.toggle('is-visible', window.scrollY > 80);
    window.addEventListener('scroll', syncToTop, { passive: true });
    syncToTop();
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
