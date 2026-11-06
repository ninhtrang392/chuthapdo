// ==================== TRANG GIẢI THƯỞNG NGỌN ĐÈN NHÂN ÁI ====================
// Nội dung theo tài liệu giới thiệu Giải thưởng do khách hàng cung cấp. Chuyển động GSAP + ScrollTrigger (bỏ qua khi giảm chuyển động / CDN lỗi).

// ==================== HEADER: menu mobile ====================
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  navigation.classList.toggle('is-open', open);
};
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    setMenu(false);
    menuButton.focus();
  }
});

// ==================== DIALOG: thông báo xem trước ====================
const dialog = document.querySelector('.info-dialog');
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-panel]');
  if (!trigger) return;
  event.preventDefault();
  const title = trigger.dataset.panel;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('.dialog-description').textContent =
    `Đây là bản xem trước giao diện. Mục “${title}” sẽ được kết nối khi nội dung và chức năng chính thức được bổ sung.`;
  dialog.showModal();
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});

// ==================== CHUYỂN ĐỘNG (GSAP + ScrollTrigger) ====================
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // Tách đoạn văn thành từng chữ (.chapter-word) để sáng dần theo cuộn
  const splitWords = (element) => {
    const fragment = document.createDocumentFragment();
    element.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { fragment.append(part); return; }
      const word = document.createElement('span');
      word.className = 'chapter-word';
      word.textContent = part;
      fragment.append(word);
    });
    element.replaceChildren(fragment);
    return [...element.querySelectorAll('.chapter-word')];
  };

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ==================== HERO: biểu trưng nở ra · chữ trồi lên; cuộn xuống → biểu trưng phóng to, mờ dần ====================
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.gt-hero-mark', { scale: 0.4, autoAlpha: 0, duration: 1.4 })
      .from('.gt-hero-eyebrow, .gt-hero-title, .gt-hero-lead, .gt-hero-actions', { y: 48, autoAlpha: 0, duration: 1.1, stagger: 0.1 }, 0.35);
    gsap.to('.gt-hero-mark', {
      scale: 1.6, autoAlpha: 0, ease: 'none',
      scrollTrigger: { trigger: '.gt-hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.gt-hero-bg img', {
      yPercent: 20, ease: 'none',
      scrollTrigger: { trigger: '.gt-hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // ==================== GIỚI THIỆU: đoạn văn lớn sáng dần từng chữ theo cuộn ====================
    const introText = document.querySelector('.gt-intro-text');
    if (introText) {
      gsap.fromTo(splitWords(introText), { opacity: 0.12 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: introText, start: 'top 80%', end: 'bottom 40%', scrub: true },
      });
    }

    // ==================== MỘT NGỌN ĐÈN · ĐỐI TƯỢNG · THÔNG TIN: khối trồi lên lần lượt ====================
    ['.gt-pillar-grid', '.gt-audience-grid', '.gt-info-grid'].forEach((selector) => {
      const grid = document.querySelector(selector);
      if (!grid) return;
      gsap.from(grid.children, {
        y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1, clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      });
    });

    // ==================== BĂNG CHỮ CHẠY: chạy vô tận khi đang trong khung nhìn ====================
    const loop = gsap.to('.gt-marquee .marquee-track', { xPercent: -50, duration: 24, ease: 'none', repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: '.gt-marquee', start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? loop.play() : loop.pause()) });
  });

  // ==================== Ý NGHĨA BIỂU TƯỢNG (desktop): ý đang ở giữa màn hình sáng lên; biểu trưng xoay nhẹ theo cuộn ====================
  mm.add('(min-width: 1101px) and (prefers-reduced-motion: no-preference)', () => {
    const section = document.querySelector('.gt-meaning');
    if (!section) return undefined;
    const items = [...section.querySelectorAll('.gt-meaning-item')];
    section.classList.add('is-live');
    items.forEach((item) => {
      ScrollTrigger.create({ trigger: item, start: 'top 60%', end: 'bottom 60%', toggleClass: 'is-active' });
    });
    gsap.fromTo('.gt-meaning-mark img', { rotation: -6, scale: 0.92 }, {
      rotation: 6, scale: 1.04, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => section.classList.remove('is-live');
  });

  // ==================== HẠNG MỤC GIẢI THƯỞNG (desktop): ghim section, cuộn dọc → dải 5 thẻ trượt ngang ====================
  mm.add('(min-width: 1101px) and (prefers-reduced-motion: no-preference)', () => {
    const section = document.querySelector('.gt-categories');
    const viewport = section && section.querySelector('.gt-categories-viewport');
    const track = section && section.querySelector('.gt-categories-track');
    if (!track) return undefined;
    section.classList.add('is-pinned');
    viewport.scrollLeft = 0;
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
    });
    return () => section.classList.remove('is-pinned');
  });

  // ==================== QUY TRÌNH TỔ CHỨC (desktop): đường nối vẽ theo cuộn, bước tới đâu sáng tới đó ====================
  mm.add('(min-width: 1101px) and (prefers-reduced-motion: no-preference)', () => {
    const section = document.querySelector('.gt-process');
    const line = section && section.querySelector('.gt-steps-line span');
    if (!line) return undefined;
    const steps = [...section.querySelectorAll('.gt-step')];
    section.classList.add('is-live');
    gsap.fromTo(line, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: section.querySelector('.gt-steps-wrap'), start: 'top 75%', end: 'bottom 45%', scrub: true,
        onUpdate: (self) => steps.forEach((step, i) => step.classList.toggle('is-done', self.progress >= i / (steps.length - 1) - 0.001)),
      },
    });
    return () => { section.classList.remove('is-live'); steps.forEach((step) => step.classList.remove('is-done')); };
  });
}
