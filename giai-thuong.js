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

// ==================== HERO: trạng thái kỳ giải — nhận đề cử 01/01 – 30/11 hằng năm (theo mục Đề cử) ====================
// Trong hạn: "Đang nhận đề cử · Kỳ giải <năm> · Còn N ngày"; hết hạn (01/12 – 31/12): "Đã đóng đề cử · Kỳ giải <năm sau> mở từ 01/01"
(() => {
  const badge = document.querySelector('[data-award-badge]');
  const text = document.querySelector('[data-award-text]');
  if (!badge || !text) return;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = today.getFullYear();
  const deadline = new Date(year, 10, 30); // 30/11
  if (today <= deadline) {
    const days = Math.round((deadline - today) / 86400000);
    text.textContent = days === 0 ? `Kỳ giải ${year} · Hôm nay là ngày cuối gửi đề cử` : `Kỳ giải ${year} · Còn ${days} ngày để gửi đề cử`;
  } else {
    badge.textContent = 'Đã đóng đề cử';
    badge.classList.replace('is-green', 'is-orange');
    text.textContent = `Kỳ giải ${year + 1} mở nhận đề cử từ 01/01`;
  }
})();

// ==================== HERO: "NGỌN ĐÈN" giãn đúng bằng 2 mép container ====================
// Đo nét chữ thật bằng canvas (actualBoundingBox, bỏ lề trong của font) → đặt --t (cỡ chữ, số nguyên px) cho .gt-hero
// để mép trái chữ N đầu và mép phải chữ N cuối chạm 2 mép container; bù lệch lề trong bằng translate.
// Màn ≤600px: giữ cỡ chữ CSS (tên xuống 2 dòng).
(() => {
  const hero = document.querySelector('.gt-hero');
  const title = hero && hero.querySelector('.gt-hero-title');
  const name = title && title.querySelector('.gt-hero-name');
  if (!name) return;
  const ctx = document.createElement('canvas').getContext('2d');
  const wide = window.matchMedia('(min-width: 601px)');
  const fit = () => {
    if (!wide.matches) {
      hero.style.removeProperty('--t');
      name.style.translate = '';
      return;
    }
    const style = getComputedStyle(name);
    const text = name.textContent.trim().toLocaleUpperCase('vi');
    ctx.font = `${style.fontWeight} 100px ${style.fontFamily}`;
    const m = ctx.measureText(text);
    const ink = m.actualBoundingBoxLeft + m.actualBoundingBoxRight; // bề rộng nét chữ ở cỡ 100px
    const width = title.clientWidth;
    const size = Math.floor((width / ink) * 100);
    const k = size / 100;
    const inkLeft = (width - m.width * k) / 2 - m.actualBoundingBoxLeft * k; // chữ căn giữa → vị trí mép nét trái
    const inkRight = inkLeft + ink * k;
    hero.style.setProperty('--t', `${size}px`);
    name.style.translate = `${Math.round(-(inkLeft + inkRight - width) / 2)}px 0`; // canh nét chữ vào giữa 2 mép
  };
  let frame = 0;
  const refit = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  };
  fit();
  if (document.fonts) document.fonts.ready.then(fit);
  window.addEventListener('resize', refit);
})();

// ==================== CHUYỂN ĐỘNG (GSAP + ScrollTrigger) ====================
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  // html{scroll-behavior:smooth} làm lệch phép đo của ScrollTrigger: khi refresh (tải lại giữa trang, đổi cỡ cửa sổ, font tải xong)
  // nó cuộn tạm về đầu trang để đo, cuộn mượt khiến lệch đúng bằng vị trí đang cuộn → section 3 bị ghim sớm, đè lên section 2.
  // → Trang có ScrollTrigger: tắt hẳn cuộn mượt của CSS (giống html.has-smoother); nút lên đầu trang vẫn cuộn mượt bằng JS.
  document.documentElement.style.scrollBehavior = 'auto';
  // Font web tải xong làm đổi chiều cao chữ (section 2…) → tính lại vị trí ghim/trigger, tránh ghim lệch gây đè
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ==================== HERO: vào trang — cúp nở ra, "NGỌN ĐÈN" trồi lên, chữ viết tay "Nhân ái" hiện dần từ trái sang ====================
    // Cuộn: tên giải và cúp đứng yên đúng vị trí (cúp luôn ở chân banner, luôn hiển thị).
    const hero = document.querySelector('.gt-hero');
    if (hero) {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.gt-hero-name', { yPercent: 18, autoAlpha: 0, duration: 1.3 }, 0.1)
        .from('.gt-hero-cup', { y: 80, scale: 0.85, autoAlpha: 0, duration: 1.5 }, 0.3)
        .fromTo('.gt-hero-script', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' }, 0.8)
        .from('.gt-hero-side > *', { y: 32, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.9);
    }

    // ==================== ĐỐI TƯỢNG · HẠNG MỤC: khối trồi lên lần lượt ====================
    ['.gt-audience-grid', '.gt-categories .event-cards'].forEach((selector) => {
      const grid = document.querySelector(selector);
      if (!grid) return;
      gsap.from(grid.children, {
        y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1, clearProps: 'transform,opacity,visibility', // ≤ 40px: không chạm section kế tiếp khi máy giật
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      });
    });

    // ==================== TIÊU ĐỀ & KHỐI CÒN TĨNH: trồi lên khi cuộn tới (section 3 · 4 · 5 · 6 · 7) ====================
    // y ≤ 24/40px (< khoảng cách section 64px) → không đè section kế bên khi máy giật
    const reveal = (targets, trigger, extra = {}) => gsap.from(targets, {
      y: 24, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity,visibility', ...extra,
      scrollTrigger: { trigger, start: 'top 85%', once: true },
    });
    document.querySelectorAll('.gt-meaning-head, .gt-audience-copy, .gt-categories .section-head, .gt-process .section-head, .gt-info .section-head')
      .forEach((head) => reveal(head.children, head));
    const meaningLayout = document.querySelector('.gt-meaning-layout');
    if (meaningLayout) reveal(meaningLayout.children, meaningLayout, { y: 40, duration: 1.1, stagger: 0.15 });
    const steps = document.querySelector('.gt-steps');
    if (steps) reveal(steps.children, steps, { stagger: 0.1 });
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

  // ==================== SECTION 2 · 3 · 7 · 8: chuyển động kiểu Awwwards (chỉ khi không giảm chuyển động) ====================
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanups = [];

    // ---------- Section 2 · Giới thiệu: tách chữ câu dẫn (giữ span tô đỏ), cuộn tới đâu chữ rõ lên tới đó ----------
    const story = document.querySelector('.gt-story');
    const storyText = story && story.querySelector('.gt-story-text');
    if (storyText) {
      const original = storyText.innerHTML;
      storyText.setAttribute('aria-label', storyText.textContent.trim());
      const wrapWords = (node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const span = document.createElement('span');
              span.className = 'gt-word';
              span.setAttribute('aria-hidden', 'true');
              span.textContent = part;
              frag.appendChild(span);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            wrapWords(child);
          }
        });
      };
      wrapWords(storyText);
      const words = storyText.querySelectorAll('.gt-word');
      gsap.fromTo(words, { opacity: 0.12, y: 12 }, {
        opacity: 1, y: 0, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: storyText, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 },
      });
      gsap.from(story.querySelector('.gt-story-rule'), {
        scaleX: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: storyText, start: 'bottom 70%', once: true },
      });
      gsap.from(story.querySelector('.gt-story-lead'), {
        y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: storyText, start: 'bottom 70%', once: true },
      });
      gsap.from('.gt-pillars-title', {
        y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.gt-pillars', start: 'top 85%', once: true },
      });
      gsap.from('.gt-pillar', {
        y: 40, rotateX: -12, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'expo.out', stagger: 0.12, // trồi ≤ 40px (< khoảng cách 64px tới section 3) → không đè tiêu đề section 3 khi máy giật
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.gt-pillar-grid', start: 'top 88%', once: true },
      });
      gsap.from('.gt-pillar .gt-icon', {
        scale: 0, rotate: -90, duration: 1, ease: 'back.out(1.8)', stagger: 0.12, delay: 0.25,
        clearProps: 'transform',
        scrollTrigger: { trigger: '.gt-pillar-grid', start: 'top 88%', once: true },
      });
      cleanups.push(() => { storyText.innerHTML = original; storyText.removeAttribute('aria-label'); });
    }

    // ---------- Section 7 · Xét chọn: ảnh mở dần từ dưới lên + phóng nhẹ theo cuộn; 3 mục trồi lên lần lượt ----------
    const infoMedia = document.querySelector('.gt-info-media');
    if (infoMedia) {
      gsap.fromTo(infoMedia, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: infoMedia, start: 'top 80%', once: true },
      });
      gsap.fromTo(infoMedia.querySelector('img'), { scale: 1.2, yPercent: -5 }, {
        scale: 1.12, yPercent: 5, ease: 'none', // luôn phóng ≥ 12% → ảnh không hở mép khi trượt
        scrollTrigger: { trigger: infoMedia, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from('.gt-info-card', {
        x: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.gt-info-grid', start: 'top 80%', once: true },
      });
    }

    // ---------- Section 8 · Đề cử: dải đỏ nở ra khi cuộn tới, chữ trồi lên + quầng sáng theo chuột (nền ảnh bàn tay nâng trái tim) ----------
    const contact = document.querySelector('.gt-contact-card');
    if (contact) {
      gsap.fromTo(contact, { scale: 0.92, borderRadius: 48 }, {
        scale: 1, borderRadius: 24, ease: 'none',
        scrollTrigger: { trigger: contact, start: 'top bottom', end: 'top 55%', scrub: true },
      });
      gsap.from(contact.querySelectorAll('.gt-contact-copy > *'), {
        y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: contact, start: 'top 70%', once: true },
      });
      const onMove = (event) => {
        const box = contact.getBoundingClientRect();
        contact.style.setProperty('--mx', `${Math.round(event.clientX - box.left)}px`);
        contact.style.setProperty('--my', `${Math.round(event.clientY - box.top)}px`);
      };
      contact.addEventListener('pointermove', onMove);
      cleanups.push(() => { contact.removeEventListener('pointermove', onMove); contact.style.removeProperty('--mx'); contact.style.removeProperty('--my'); });
    }

    return () => cleanups.forEach((fn) => fn());
  });

  // Lấy từ bản Giải thưởng khách hàng gửi: desktop ghim section, quầng sáng tỏa rộng + biểu trưng bừng sáng theo cuộn, ý đang xem sáng lên; mobile cuộn tự nhiên
  const MOTION = { fast: 0.2, base: 0.45, slow: 0.8, ease: 'power3.out' };
  // ==================== Ý NGHĨA BIỂU TƯỢNG (desktop): Khoảnh khắc đặc trưng "Thắp đèn" (E-1 phương án A) ====================
  mm.add('(min-width: 1101px) and (prefers-reduced-motion: no-preference)', () => {
    const section = document.querySelector('.gt-meaning');
    if (!section) return undefined;
    const items = [...section.querySelectorAll('.gt-meaning-item')];
    const railBar = section.querySelector('.gt-meaning-rail-bar');
    const halo = section.querySelector('.gt-meaning-halo');
    section.classList.add('is-live');

    let currentStep = -1;

    const activateStep = (idx, smooth = true) => {
      if (idx === currentStep) return;
      currentStep = idx;

      items.forEach((it, i) => {
        const isActive = i === idx;
        it.classList.toggle('is-active', isActive);
        const btn = it.querySelector('.gt-meaning-btn');
        if (btn) {
          if (isActive) btn.setAttribute('aria-current', 'step');
          else btn.removeAttribute('aria-current');
        }
      });

      if (railBar) {
        const pct = items.length > 1 ? idx / (items.length - 1) : 0;
        gsap.to(railBar, { scaleY: pct, transformOrigin: 'top', duration: smooth ? MOTION.base : 0, ease: 'power2.out' });
      }
    };

    // Khởi tạo bước đầu tiên
    activateStep(0, false);

    // Chiều dài ghim 1.2x viewport
    const pinDistance = () => window.innerHeight * 1.2;
    // Ghim ngay dưới header cố định (section chỉ đệm --space-section, không chừa chỗ cho header nữa)
    const pinTop = () => (document.querySelector('.header')?.offsetHeight || 0);

    // E-1 Phương án A: Timeline scrub đổi nền ấm #f3e3dc khi ghim, vầng sáng mở rộng và lớp sáng is-lit bừng sáng
    const lightTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: () => `top ${pinTop()}px`,
        end: () => `+=${pinDistance()}`,
        pin: true,
        scrub: true,
        // Tính vị trí ghim TRƯỚC các trigger khác: các hiệu ứng phía dưới được tạo trước pin, nếu không ưu tiên
        // thì chúng không cộng khoảng ghim (1.2 màn hình) → kích hoạt sớm khi còn bị section 3 che → nhìn như không có animation
        refreshPriority: 1,
        // Không dùng anticipatePin: khi máy giật, tốc độ cuộn đo được vọt lên → ghim sớm, section 3 nhảy lên đè section 2
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const step = gsap.utils.clamp(0, items.length - 1, Math.floor(self.progress * items.length));
          activateStep(step);
        },
      },
    });

    lightTl
      .fromTo(halo, { scale: 0.55, autoAlpha: 0.35 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'none' }) // tỏa tới vừa khít thẻ, không bị cắt
      .to('.gt-meaning-mark img.is-lit', { autoAlpha: 1, duration: 0.7, ease: 'none' }, '<');

    const st = lightTl.scrollTrigger;

    // Cho phép click và hover (chỉ hover khi không đang cuộn ghim - N-4)
    items.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        if (st) {
          const targetProgress = (index + 0.15) / items.length;
          const targetScroll = st.start + targetProgress * pinDistance();
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
        activateStep(index);
      });

      item.addEventListener('mouseenter', () => {
        if (!st || !st.isActive) {
          activateStep(index);
        }
      });
    });

    return () => {
      section.classList.remove('is-live');
      if (st) st.kill();
      items.forEach((item) => {
        item.classList.remove('is-active');
        const btn = item.querySelector('.gt-meaning-btn');
        if (btn) btn.removeAttribute('aria-current');
      });
    };
  });

  // ==================== Ý NGHĨA BIỂU TƯỢNG (mobile / tablet): cuộn tự nhiên ====================
  mm.add('(max-width: 1100px)', () => {
    const section = document.querySelector('.gt-meaning');
    if (!section) return undefined;
    const items = [...section.querySelectorAll('.gt-meaning-item')];
    const railBar = section.querySelector('.gt-meaning-rail-bar');
    section.classList.add('is-live');

    const activateMobileStep = (idx) => {
      items.forEach((it, i) => {
        const isActive = i === idx;
        it.classList.toggle('is-active', isActive);
        const btn = it.querySelector('.gt-meaning-btn');
        if (btn) {
          if (isActive) btn.setAttribute('aria-current', 'step');
          else btn.removeAttribute('aria-current');
        }
      });
      if (railBar && items.length > 1) {
        railBar.style.transform = `scaleY(${idx / (items.length - 1)})`;
      }
    };

    items.forEach((item, index) => {
      item.addEventListener('click', () => activateMobileStep(index));
      ScrollTrigger.create({
        trigger: item,
        start: 'top 75%',
        end: 'bottom 45%',
        onEnter: () => activateMobileStep(index),
        onEnterBack: () => activateMobileStep(index),
      });
    });

    activateMobileStep(0);
    return () => section.classList.remove('is-live');
  });

  // ==================== SECTION 7 · XÉT CHỌN: rê chuột vào mục nào → mục đó tự mở (không cần bấm), chỉ mở 1 mục một lúc; màn cảm ứng / bàn phím vẫn bấm để mở ====================
  const infoGrid = document.querySelector('.gt-info-grid');
  const infoCards = infoGrid ? [...infoGrid.querySelectorAll('.gt-info-card')] : [];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const closeCard = (card) => {
    if (!card.open) return;
    if (reduce.matches) { card.open = false; return; }
    gsap.fromTo(card, { height: card.offsetHeight }, {
      height: card.querySelector('summary').offsetHeight, duration: 0.5, ease: 'power3.inOut', overwrite: true,
      onComplete: () => { card.open = false; gsap.set(card, { clearProps: 'height' }); },
    });
  };
  const openCard = (card) => {
    infoCards.forEach((other) => { if (other !== card) closeCard(other); });
    if (card.open && !gsap.isTweening(card)) return;
    if (reduce.matches) { card.open = true; return; }
    const from = card.open ? card.offsetHeight : card.querySelector('summary').offsetHeight;
    card.open = true;
    gsap.set(card, { clearProps: 'height' });
    const full = card.offsetHeight;
    busy = true;
    gsap.fromTo(card, { height: from }, { height: full, duration: 0.5, ease: 'power3.inOut', overwrite: true, onComplete: () => { gsap.set(card, { clearProps: 'height' }); busy = false; flush(); } });
    // fromTo (không dùng from): bị ngắt giữa chừng vẫn về đúng trạng thái hiện rõ, không kẹt mờ
    gsap.fromTo(card.querySelectorAll('summary ~ * li, .gt-org-col'), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', stagger: 0.04, delay: 0.12, overwrite: true, clearProps: 'transform,opacity,visibility' });
  };
  // Chống giật khi rê chuột: chỉ mở theo chuyển động chuột thật (bỏ qua sự kiện giả khi các thẻ co giãn trượt dưới con trỏ),
  // chờ 1 nhịp ngắn (hover intent), đang chạy hiệu ứng thì xếp hàng, chạy xong mới mở mục cuối cùng được trỏ tới.
  let busy = false;
  let pending = null;
  let timer = 0;
  function flush() {
    if (busy || !pending) return;
    const next = pending;
    pending = null;
    if (!next.open) openCard(next);
  }
  const requestOpen = (card) => {
    if (card.open && !pending) return;
    pending = card;
    clearTimeout(timer);
    timer = setTimeout(flush, 90);
  };
  // Cột mở/gập giữ chiều cao cố định = trạng thái cao nhất → ảnh bên trái (cao bằng cột này) không co giãn khi đổi mục
  const lockGridHeight = () => {
    if (!infoGrid) return;
    infoGrid.style.minHeight = '';
    const opened = infoCards.map((card) => card.open);
    let tallest = 0;
    infoCards.forEach((card, i) => {
      infoCards.forEach((other, j) => { other.open = i === j; });
      tallest = Math.max(tallest, infoGrid.offsetHeight);
    });
    infoCards.forEach((card, i) => { card.open = opened[i]; });
    infoGrid.style.minHeight = `${tallest}px`;
  };
  if (infoGrid) {
    lockGridHeight();
    if (document.fonts) document.fonts.ready.then(lockGridHeight);
    window.addEventListener('resize', lockGridHeight);
  }
  infoCards.forEach((card) => {
    const summary = card.querySelector('summary');
    if (!summary) return;
    card.addEventListener('pointermove', (event) => {
      if (!hoverable.matches || event.pointerType !== 'mouse') return;
      if (!event.movementX && !event.movementY) return; // sự kiện giả do bố cục dịch chuyển
      requestOpen(card);
    });
    card.addEventListener('pointerleave', () => { if (pending === card) { pending = null; clearTimeout(timer); } });
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (card.open && !hoverable.matches) closeCard(card); else openCard(card);
    });
  });
}
