// ==================== TRANG ĐƠN VỊ ĐỒNG HÀNH › BANNER KỂ CHUYỆN (4 cảnh theo cuộn) ====================
// Lấy từ bản Đồng hành khách hàng gửi (dh-storytelling.js › initHero). Lớp gốc trên <html>: dhc-hero-pin (ghim) · dhc-hero-pin-live · dhc-hero-ready (mở màn cảnh 01).
// Desktop / tablet ngang: một timeline scrub theo tiến trình section — crossfade ảnh, chữ theo cảnh, khung ảnh thu lại ở cuối.
// Mobile / tablet dọc: cảnh xếp chồng, hiện dần. Giảm chuyển động / không GSAP: xếp chồng tĩnh.
(function () {
  function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return () => {};
  
    const root = document.documentElement;
    const img = hero.querySelector('[data-hero-img]');
    let enterTimer = 0;
    let destroyed = false;
  
    /* ---------- Mở màn cảnh 01 (độc lập với GSAP) ---------- */
    const startEntrance = () => {
      window.clearTimeout(enterTimer);
      window.requestAnimationFrame(() => root.classList.add('dhc-hero-ready'));
    };
    if (!root.classList.contains('dhc-hero-js') || (img && img.complete && img.naturalWidth > 0)) {
      startEntrance();
    } else if (img) {
      img.addEventListener('load', startEntrance, { once: true });
      img.addEventListener('error', startEntrance, { once: true });
      enterTimer = window.setTimeout(startEntrance, 1200);
    }
  
    /* ---------- Không có GSAP → giữ bố cục xếp chồng đọc được ---------- */
    if (!window.gsap || !window.ScrollTrigger) {
      root.classList.remove('dhc-hero-pin');
      hero.dataset.heroMode = 'static';
      return () => {};
    }
  
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
  
    const scenes = gsap.utils.toArray('[data-scene]', hero);
    const pick = (sel) => scenes.map((s) => s.querySelector(sel));
    const media = pick('[data-scene-media]');
    const texts = pick('[data-scene-text]');
    const actions = pick('[data-scene-actions]');
    const frame = hero.querySelector('[data-hero-frame]');
    const progressUI = hero.querySelector('[data-hero-progress]');
    const ticks = progressUI ? Array.from(progressUI.querySelectorAll('li')) : [];
    const counter = progressUI ? progressUI.querySelector('[data-hero-progress-current]') : null;
  
    // Nhịp của timeline (đơn vị tương đối; ScrollTrigger ánh xạ toàn bộ vào quãng cuộn của section)
    const T = { lead: 0.6, change: 1, hold: 0.8, close: 1 };
    // Khung ảnh ở trạng thái kết: dưới header thu gọn (70px) + 16px, mép bên 16–48px, đáy 24px
    const FRAME_TOP = 86;
    const FRAME_BOTTOM = 24;
    const FRAME_RADIUS = 24;
    const frameSide = () => Math.min(48, Math.max(16, window.innerWidth * 0.025));
  
    const PIN_QUERY = '(min-width: 1024px), (min-width: 768px) and (orientation: landscape)';
    const mm = gsap.matchMedia();
  
    mm.add({
      pin: PIN_QUERY,
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { pin, motion, reduce } = ctx.conditions;
      if (reduce) return buildStatic();
      if (pin && motion) return buildPinned();
      return buildFlow();
    });
  
    /* ---------- Biến thể: tĩnh (giảm chuyển động) ---------- */
    function buildStatic() {
      root.classList.remove('dhc-hero-pin', 'dhc-hero-pin-live');
      root.classList.add('dhc-hero-ready');
      hero.dataset.heroMode = 'static';
      ScrollTrigger.refresh();
    }
  
    /* ---------- Biến thể: ghim + scrub (desktop / tablet ngang) ---------- */
    function buildPinned() {
      root.classList.add('dhc-hero-pin', 'dhc-hero-pin-live');
      hero.dataset.heroMode = 'pinned';
  
      let active = -1;
      const sceneStarts = [0];
      const setActive = (time) => {
        let idx = 0;
        for (let i = 0; i < sceneStarts.length; i += 1) if (time >= sceneStarts[i]) idx = i;
        if (idx === active) return;
        active = idx;
        hero.dataset.heroScene = String(idx + 1);
        if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
        ticks.forEach((li, i) => li.classList.toggle('is-active', i === idx));
      };
  
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',      // sân khấu là CSS sticky: không cần pin-spacer
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(self.progress * tl.duration()),
        },
      });
  
      // Cảnh 01: chuyển động máy quay rất nhẹ trong suốt thời gian hiện diện
      tl.fromTo(media[0], { scale: 1 }, { scale: 1.04, duration: T.lead + T.change }, 0);
  
      let t = T.lead;
      const last = scenes.length - 1;
      for (let i = 1; i <= last; i += 1) {
        // Chữ cũ rời đi trước (nhanh hơn chữ mới vào)
        // autoAlpha: chữ đã mờ hẳn cũng bị ẩn khỏi tab (không có phần tử ẩn mà vẫn nhận focus)
        tl.to(texts[i - 1], { autoAlpha: 0, y: -32, duration: T.change * 0.42, ease: 'power1.in' }, t);
        if (actions[i - 1]) tl.set(actions[i - 1], { visibility: 'hidden' }, t + T.change * 0.42);
  
        // Ảnh mới hòa lên TRÊN ảnh cũ (ảnh cũ vẫn hiện bên dưới → không lóe đen/trắng)
        tl.fromTo(media[i], { opacity: 0 }, { opacity: 1, duration: T.change, ease: 'power1.inOut' }, t);
        tl.fromTo(media[i], { scale: 1.08 }, {
          scale: 1,
          duration: T.change + T.hold + (i === last ? T.close : T.change),
        }, t);
  
        // Chữ mới vào ở nửa sau của chuyển cảnh, cùng mép trái
        tl.fromTo(texts[i], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: T.change * 0.5, ease: 'power2.out' }, t + T.change * 0.5);
        if (actions[i]) tl.set(actions[i], { visibility: 'visible' }, t + T.change * 0.5);
  
        sceneStarts.push(t + T.change * 0.5);
        t += T.change + T.hold;
      }
  
      // Kết: khung ảnh thu lại thành một bức ảnh trên nền trang trắng → nhả sang "Dấu ấn nhân đạo"
      tl.fromTo(frame,
        { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
        {
          clipPath: () => `inset(${FRAME_TOP}px ${frameSide()}px ${FRAME_BOTTOM}px ${frameSide()}px round ${FRAME_RADIUS}px)`,
          duration: T.close,
          ease: 'power1.inOut',
        }, t);
      if (progressUI) tl.to(progressUI, { opacity: 0, duration: T.close * 0.4 }, t);
  
      setActive(0);
  
      return () => {
        root.classList.remove('dhc-hero-pin', 'dhc-hero-pin-live');
        delete hero.dataset.heroScene;
        ticks.forEach((li, i) => li.classList.toggle('is-active', i === 0));
        if (counter) counter.textContent = '01';
      };
    }
  
    /* ---------- Biến thể: xếp chồng + hiện dần (mobile / tablet dọc) ---------- */
    function buildFlow() {
      root.classList.remove('dhc-hero-pin', 'dhc-hero-pin-live');
      hero.dataset.heroMode = 'flow';
  
      scenes.slice(1).forEach((scene) => {
        const sceneImg = scene.querySelector('.dhc-scene-img');
        const text = scene.querySelector('[data-scene-text]');
        gsap.from(sceneImg, {
          opacity: 0,
          scale: 1.04,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: scene, start: 'top 88%', once: true },
        });
        gsap.from(text, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: text, start: 'top 92%', once: true },
        });
      });
    }
  
    // Tính lại vị trí MỘT lần sau khi font sẵn sàng (ScrollTrigger tự làm khi load/resize)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!destroyed) ScrollTrigger.refresh(); });
    }
  
    return function destroy() {
      if (destroyed) return;
      destroyed = true;
      window.clearTimeout(enterTimer);
      mm.revert(); // hoàn nguyên timeline, ScrollTrigger và inline style của biến thể đang chạy
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHero);
  else initHero();
})();
