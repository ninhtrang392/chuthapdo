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
// The homepage is a standalone preview. Replace these panels with real destinations
// when the remaining pages, CMS data and donation flow are available.
const dialog = document.querySelector('.info-dialog');
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-panel]');
  if (!trigger) return;
  event.preventDefault();
  const title = trigger.dataset.panel;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('.dialog-description').textContent =
    `Đây là bản xem trước giao diện trang chủ. Mục “${title}” sẽ được kết nối khi nội dung và chức năng chính thức được bổ sung.`;
  dialog.showModal();
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==================== FLOW: cuộn mượt (ScrollSmoother nếu có, ngược lại cuộn gốc) ====================
let smoother = null; // created in the MOTION block, before any other ScrollTrigger
const headerOffset = () => document.querySelector('.header').offsetHeight;
const scrollToY = (y) => {
  if (smoother) smoother.scrollTo(y, true);
  else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
};
const scrollToElement = (element) => {
  if (smoother) smoother.scrollTo(element, true, `top ${headerOffset()}px`);
  else element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
};
// Đến từ trang khác với #neo (vd. index.html#don-vi-dong-hanh): cuộn lại sau khi load,
// khi vùng ghim của Section 03 (pin spacer) đã có kích thước thật.
window.addEventListener('load', () => setTimeout(() => {
  const target = window.location.hash.length > 1 && document.querySelector(window.location.hash);
  if (target) scrollToElement(target);
}, 150));

// ==================== HERO: impact widget — đếm số ====================
const metricValues = document.querySelectorAll('.impact-card dd');
if (metricValues.length && !reduceMotion) {
  const countUp = (element) => {
    const target = Number(element.textContent.replace(/\D/g, ''));
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(target * eased).toLocaleString('vi-VN');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  metricValues.forEach((value) => observer.observe(value));
}

// ==================== SECTION 04: TOP GÂY QUỸ — tab Cá nhân / Tổ chức ====================
const tabs = [...document.querySelectorAll('.segmented [role="tab"]')];
const formatVnd = (value) => `${Math.round(value).toLocaleString('vi-VN')} ₫`;
// Swaps the visible panel. With GSAP (and motion allowed) it crossfades in ~0.35s total
// and only counts the amounts — the full podium entrance is not replayed on tab change.
const selectTab = (tab) => {
  const current = document.querySelector('.ranking-panel:not([hidden])');
  const next = document.getElementById(tab.getAttribute('aria-controls'));
  tabs.forEach((other) => {
    const selected = other === tab;
    other.setAttribute('aria-selected', String(selected));
    other.tabIndex = selected ? 0 : -1;
  });
  if (current === next) return;
  const swap = () => {
    current.hidden = true;
    next.hidden = false;
  };
  if (!window.gsap || reduceMotion) {
    swap();
    return;
  }
  gsap.timeline({ defaults: { ease: 'power2.out' } })
    .to(current.querySelectorAll('.podium-card'), { autoAlpha: 0, y: 12, duration: 0.15, stagger: 0.03 })
    .add(swap)
    .fromTo(next.querySelectorAll('.podium-card'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.05, clearProps: 'transform,opacity,visibility' })
    .add(() => next.querySelectorAll('.podium-total').forEach((total) => {
      const counter = { value: 0 };
      gsap.to(counter, { value: Number(total.dataset.value), duration: 0.6, ease: 'power3.out', onUpdate: () => { total.textContent = formatVnd(counter.value); } });
    }), '<');
};
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});


// ==================== SECTION 05: BẢN ĐỒ CỨU TRỢ — điểm trên ảnh & nút phóng to / thu nhỏ ====================
// Vị trí theo trung tâm hành chính (gần đúng). Mức độ và nhu cầu là DỮ LIỆU MINH HỌA:
// khi triển khai thật phải lấy từ hệ thống cảnh báo / điều phối chính thức.
// [tên, mức độ, vĩ độ, kinh độ, nhu cầu]
const reliefPoints = [
  ['Quảng Trị', 'urgent', 17.47, 106.62, 'Ngập sâu sau mưa lũ, nhiều hộ thiếu lương thực và nước sạch.'],
  ['Huế', 'urgent', 16.46, 107.59, 'Nhiều khu dân cư bị chia cắt, cần nhu yếu phẩm và thuốc men.'],
  ['Quảng Ngãi', 'urgent', 15.12, 108.8, 'Nhà ở hư hại sau lũ, cần hỗ trợ sửa chữa khẩn cấp.'],
  ['Cà Mau', 'urgent', 9.18, 105.15, 'Xâm nhập mặn sâu, thiếu nước sinh hoạt diện rộng.'],
  ['Vĩnh Long', 'urgent', 10.25, 105.97, 'Thiếu nước ngọt cho sinh hoạt tại nhiều xã ven biển.'],
  ['Hà Tĩnh', 'need', 18.34, 105.91, 'Khắc phục hậu quả mưa lũ, phục hồi sinh kế.'],
  ['Nghệ An', 'need', 18.68, 105.68, 'Hỗ trợ hộ dân vùng ven sông bị ảnh hưởng mưa lũ.'],
  ['Lai Châu', 'need', 22.4, 103.46, 'Học sinh vùng cao cần sách vở, áo ấm trước mùa đông.'],
  ['Điện Biên', 'need', 21.39, 103.02, 'Học sinh bán trú cần chăn ấm, đồ dùng học tập.'],
  ['Cao Bằng', 'need', 22.67, 106.26, 'Hỗ trợ học sinh có hoàn cảnh khó khăn đến trường.'],
  ['Sơn La', 'need', 21.33, 103.91, 'Nhà ở xuống cấp của hộ nghèo trước mùa mưa bão.'],
  ['Gia Lai', 'need', 13.78, 109.22, 'Người cao tuổi neo đơn cần mái ấm an toàn.'],
  ['An Giang', 'need', 10.01, 105.08, 'Thiếu nước sạch mùa khô tại các xã biên giới.'],
  ['TP. Hồ Chí Minh', 'need', 10.78, 106.7, 'Kho máu dự trữ giảm, cần người hiến máu tình nguyện.'],
];
// Kinh/vĩ độ → % trong khung ảnh map01-web.webp (hiệu chỉnh theo điểm cực Bắc, Nam, Đông, Tây của ảnh).
const mapPosition = (lat, lon) => ({
  x: ((277 + (lon - 102.14) * 60.8 - 273.5) / 452.5) * 100,
  y: ((30 + (23.39 - lat) * 63.4 - 26) / 948) * 100,
});

const reliefLayer = document.querySelector('.relief-points');
if (reliefLayer) {
  reliefPoints.forEach(([name, level, lat, lon, need], index) => {
    const { x, y } = mapPosition(lat, lon);
    const dot = document.createElement('span');
    dot.className = `relief-point is-${level}`;
    dot.style.cssText = `--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%;--d:${(index * 0.35).toFixed(2)}s`;
    const label = document.createElement('span');
    label.className = 'relief-point-label';
    const title = document.createElement('strong');
    title.textContent = name;
    label.append(title, need);
    dot.append(label);
    reliefLayer.append(dot);
  });
}

// ---------- Bản đồ: phóng to / thu nhỏ / về toàn cảnh ----------
const reliefFigure = document.querySelector('.relief-map-figure');
const reliefZoom = document.querySelector('.relief-zoom');
if (reliefFigure && reliefZoom) {
  const ZOOM_MIN = 1, ZOOM_MAX = 1.8, ZOOM_STEP = 0.4;
  let zoom = ZOOM_MIN;
  const buttons = Object.fromEntries([...reliefZoom.querySelectorAll('[data-zoom]')].map((button) => [button.dataset.zoom, button]));
  const applyZoom = (value) => {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 10) / 10));
    reliefFigure.style.setProperty('--map-zoom', zoom);
    buttons.in.disabled = zoom >= ZOOM_MAX;
    buttons.out.disabled = zoom <= ZOOM_MIN;
  };
  reliefZoom.addEventListener('click', (event) => {
    const action = event.target.closest('[data-zoom]')?.dataset.zoom;
    if (action === 'in') applyZoom(zoom + ZOOM_STEP);
    else if (action === 'out') applyZoom(zoom - ZOOM_STEP);
    else if (action === 'reset') applyZoom(ZOOM_MIN);
  });
  applyZoom(ZOOM_MIN);
}

// ==================== SECTION 03: CHƯƠNG TRÌNH — điều khiển track ngang ====================
const campaignSection = document.querySelector('.campaigns');
const campaignWrap = document.querySelector('.campaign-track-wrap');
const campaignTrack = document.querySelector('.campaign-track');
const campaignCards = [...document.querySelectorAll('.campaign-card')];
const campaignPrev = document.querySelector('.campaign-prev');
const campaignNext = document.querySelector('.campaign-next');
let campaignScroller = null; // ScrollTrigger of the pinned horizontal mode, when active

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const cardStep = () => campaignCards[1].offsetLeft - campaignCards[0].offsetLeft;
const updateCampaignUI = (progress) => {
  const value = clamp01(progress);
  campaignPrev.disabled = value <= 0.001;
  campaignNext.disabled = value >= 0.999;
};
const nativeProgress = () => {
  const max = campaignWrap.scrollWidth - campaignWrap.clientWidth;
  return max > 0 ? campaignWrap.scrollLeft / max : 0;
};
const moveCampaigns = (direction) => {
  const behavior = reduceMotion ? 'auto' : 'smooth';
  if (campaignScroller) {
    // Pinned mode: vertical scroll distance maps 1:1 to horizontal track movement.
    const { start, end } = campaignScroller;
    const target = Math.min(Math.max(Math.max(window.scrollY, start) + direction * cardStep(), start), end);
    scrollToY(target);
  } else {
    campaignWrap.scrollBy({ left: direction * cardStep(), behavior });
  }
};
campaignWrap.addEventListener('scroll', () => {
  if (!campaignScroller) updateCampaignUI(nativeProgress());
}, { passive: true });
campaignPrev.addEventListener('click', () => moveCampaigns(-1));
campaignNext.addEventListener('click', () => moveCampaigns(1));
campaignWrap.addEventListener('keydown', (event) => {
  if (!campaignScroller || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;
  event.preventDefault();
  moveCampaigns(event.key === 'ArrowRight' ? 1 : -1);
});
// Keep keyboard focus visible: bring a focused off-screen card into view in pinned mode.
campaignTrack.addEventListener('focusin', (event) => {
  if (!campaignScroller) return;
  const card = event.target.closest('.campaign-card');
  const { start, end } = campaignScroller;
  window.scrollTo({ top: Math.min(start + card.offsetLeft - campaignCards[0].offsetLeft, end) });
});
updateCampaignUI(0);

if (!window.gsap) document.documentElement.classList.remove('hero-intro');

// ==================== MOTION: GSAP / ScrollTrigger (tự tắt khi reduced motion) ====================
// Content stays visible if GSAP fails to load; CTAs are clickable throughout.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollSmoother) gsap.registerPlugin(ScrollSmoother);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  const mm = gsap.matchMedia();

  // ==================== FLOW: ScrollSmoother + link neo ====================
  // Momentum scroll on desktop (touch keeps native scroll). Fixed header, dialog and the page curtain
  // live outside #smooth-wrapper so position: fixed keeps working.
  if (window.ScrollSmoother && !reduceMotion && document.querySelector('#smooth-wrapper')) {
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, smoothTouch: false, effects: false });
    document.documentElement.classList.add('has-smoother');
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"], a[href^="index.html#"]');
      if (!link || link.dataset.panel !== undefined) return;
      const hash = link.getAttribute('href').replace(/^index.html/, '');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      scrollToElement(target);
      history.replaceState(null, '', hash);
    });
  }

  // ==================== HERO: intro + parallax ====================
  // Intro timeline: background settles 1.06 → 1, title is revealed left → right,
  // then lead, CTAs and the impact strip rise in. CTAs animate opacity/transform only, so they
  // stay clickable while the intro plays. Parallax: background and copy drift at different speeds.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Drop the pre-hide class first so .from() tweens read the real end values (same frame, no flash).
    document.documentElement.classList.remove('hero-intro');
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: window.flowEnterDelay || 0 })
      .addLabel('start')
      .from('.hero-bg', { scale: 1.06, duration: 2, ease: 'power2.out' }, 'start')
      .from('.header', { yPercent: -100, opacity: 0, duration: 0.7, clearProps: 'transform,opacity' }, 'start+=0.1')
      .fromTo('.hero-title', { clipPath: 'inset(-10% 100% -10% -10%)' }, { clipPath: 'inset(-10% -10% -10% -10%)', duration: 1.3, ease: 'power2.inOut', clearProps: 'clipPath' }, 'start+=0.2')
      .from('.hero-title', { y: 18, duration: 1.3 }, '<')
      .addLabel('copy', 'start+=0.8')
      .from('.hero-content p', { opacity: 0, y: 20, duration: 0.7 }, 'copy')
      .from('.hero-actions .button', { opacity: 0, y: 16, duration: 0.6, stagger: 0.1, clearProps: 'transform,opacity' }, 'copy+=0.12')
      .from('.impact-widget', { opacity: 0, y: 40, duration: 0.8, clearProps: 'transform,opacity' }, 'copy+=0.2')
      .from('.impact-card', { opacity: 0, y: 14, duration: 0.5, stagger: 0.08, clearProps: 'transform,opacity' }, 'copy+=0.45');

    const parallax = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-bg', { yPercent: 12, ease: 'none', scrollTrigger: parallax });
    gsap.to('.hero-content', { y: -70, ease: 'none', scrollTrigger: parallax });
  });

  // Section 02 pin + horizontal scroll. Created first so later triggers account for the pin spacing.
  mm.add('(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
    campaignSection.classList.add('is-horizontal');
    const headerHeight = () => document.querySelector('.header').offsetHeight;
    if (campaignSection.offsetHeight > window.innerHeight - headerHeight()) {
      // Title + cards must fit in the area below the header while pinned; otherwise keep native swipe.
      campaignSection.classList.remove('is-horizontal');
      return undefined;
    }
    const distance = () => Math.max(campaignTrack.offsetWidth - campaignWrap.clientWidth, 0);
    const tween = gsap.to(campaignTrack, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: campaignSection,
        // Pin the section vertically centred in the visible area below the fixed header.
        start: () => `top ${headerHeight() + Math.max((window.innerHeight - headerHeight() - campaignSection.offsetHeight) / 2, 0)}px`,
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => updateCampaignUI(self.progress),
      },
    });
    campaignScroller = tween.scrollTrigger;
    updateCampaignUI(0);
    return () => {
      campaignScroller = null;
      campaignSection.classList.remove('is-horizontal');
      updateCampaignUI(nativeProgress());
    };
  });

  // Section 04 podium entrance: one timeline, one ScrollTrigger (on the timeline, not child tweens).
  // Order: bases rise 3 → 2 → 1, cards lift in, amounts count up to their real value.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const panel = document.querySelector('#panel-personal');
    const items = ['.rank-3', '.rank-2', '.rank-1'].map((rank) => panel.querySelector(`.podium-item${rank}`));
    const totals = [...panel.querySelectorAll('.podium-total')];
    const counters = totals.map(() => ({ value: 0 }));
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.podium', start: 'top 80%', once: true },
    });
    tl.addLabel('bases')
      .from(items.map((item) => item.querySelector('.podium-base')), { scaleY: 0, duration: 0.8, stagger: 0.14, ease: 'power4.out' }, 'bases')
      .from(items.map((item) => item.querySelector('.base-emblem')), { autoAlpha: 0, scale: 0.6, y: 20, duration: 0.6, stagger: 0.14, ease: 'back.out(1.8)' }, 'bases+=0.35')
      .addLabel('cards', 'bases+=0.35')
      .call(() => totals.forEach((total) => { total.textContent = formatVnd(0); }), null, 'cards')
      .from(items.map((item) => item.querySelector('.podium-card')), { autoAlpha: 0, y: 48, duration: 0.7, stagger: 0.12, clearProps: 'transform' }, 'cards')
      .to(counters, {
        value: (index) => Number(totals[index].dataset.value), duration: 1.2, ease: 'power2.out',
        onUpdate: () => counters.forEach((counter, index) => { totals[index].textContent = formatVnd(counter.value); }),
      }, 'cards+=0.3');

    // Floating background hearts: gentle, transform-only yoyo loops.
    gsap.utils.toArray('.rk-heart').forEach((heart, index) => {
      gsap.to(heart, { y: gsap.utils.random(-18, -8), rotation: gsap.utils.random(-12, 12), duration: gsap.utils.random(2.6, 4), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: index * 0.3 });
    });
  });

  // ==================== SECTION 06: TẠO QUỸ — panel mở màn, ảnh parallax, nút mũi tên hút theo con trỏ ====================
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const panels = gsap.utils.toArray('.create-panel');
    if (!panels.length) return undefined;

    // ---------- Mở màn: panel mở từ dưới (clip-path), nội dung trượt vào ----------
    gsap.timeline({ scrollTrigger: { trigger: '.create-panels', start: 'top 85%', once: true } })
      .from(panels, { clipPath: 'inset(100% 0% 0% 0% round 28px)', duration: 1.2, ease: 'power4.inOut', stagger: 0.15, clearProps: 'clipPath' })
      .from('.create-panel-media img', { scale: 1.3, duration: 1.6, ease: 'power3.out', stagger: 0.15, clearProps: 'scale' }, 0)
      .from('.create-panel-top, .create-panel-title, .create-panel-desc, .create-panel-list > span, .create-panel-foot', { autoAlpha: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.04, clearProps: 'transform,opacity,visibility' }, 0.55);

    // ---------- Parallax: ảnh trôi chậm hơn khi cuộn ----------
    panels.forEach((panel) => {
      gsap.fromTo(panel.querySelector('.create-panel-media img'), { yPercent: -6 }, {
        yPercent: 6, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // ---------- Nút mũi tên kiểu nam châm: lệch theo con trỏ trong panel, nhả về khi rời chuột ----------
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const cleanups = panels.map((panel) => {
      const arrow = panel.querySelector('.create-panel-arrow');
      const moveX = gsap.quickTo(arrow, 'x', { duration: 0.6, ease: 'power3.out' });
      const moveY = gsap.quickTo(arrow, 'y', { duration: 0.6, ease: 'power3.out' });
      const onMove = (event) => {
        const box = arrow.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2 - gsap.getProperty(arrow, 'x'));
        const dy = event.clientY - (box.top + box.height / 2 - gsap.getProperty(arrow, 'y'));
        moveX(gsap.utils.clamp(-40, 40, dx * 0.25));
        moveY(gsap.utils.clamp(-40, 40, dy * 0.25));
      };
      const onLeave = () => { moveX(0); moveY(0); };
      panel.addEventListener('pointermove', onMove);
      panel.addEventListener('pointerleave', onLeave);
      return () => { panel.removeEventListener('pointermove', onMove); panel.removeEventListener('pointerleave', onLeave); };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ==================== FLOW: tiêu đề section hiện theo dòng (SplitText) ====================
    if (window.SplitText) {
      gsap.utils.toArray('.section-title:not(.ranking-title)').forEach((title) => {
        title.classList.add('is-split');
        SplitText.create(title, {
          type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.09,
            scrollTrigger: { trigger: title, start: 'top 90%', once: true },
          }),
        });
      });
    }

    const revealStart = window.innerHeight * 0.88;
    const pending = gsap.utils.toArray('[data-reveal]').filter((element) => element.getBoundingClientRect().top > revealStart);
    gsap.set(pending, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(pending, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });

    gsap.from('.campaign-card', {
      autoAlpha: 0, y: 40, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.campaign-track', start: 'top 85%', once: true },
    });

    gsap.utils.toArray('.progress-bar span').forEach((bar) => {
      gsap.from(bar, { scaleX: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: bar, start: 'top 92%', once: true } });
    });

    gsap.utils.toArray('.news-feature .media').forEach((media) => {
      gsap.from(media, { clipPath: 'inset(0% 0% 100% 0% round 20px)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: media, start: 'top 85%', once: true } });
    });

    // ==================== SECTION 05: BẢN ĐỒ CỨU TRỢ — bản đồ hiện lên, điểm bật ra (khẩn cấp trước), số liệu đếm lên ====================
    gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: '.relief-map', start: 'top 75%', once: true } })
      .from('.relief-map-image', { autoAlpha: 0, y: 40, scale: 0.96, duration: 1.1, clearProps: 'transform,opacity,visibility' })
      .from('.relief-island', { autoAlpha: 0, duration: 0.6, stagger: 0.15, clearProps: 'opacity,visibility' }, '-=0.5')
      .from('.relief-point.is-urgent, .relief-point.is-need', { scale: 0, duration: 0.45, ease: 'back.out(2.4)', stagger: 0.05, clearProps: 'transform' }, '-=0.6');

    gsap.from('.relief-card', { autoAlpha: 0, y: 30, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.relief-card', start: 'top 90%', once: true } });
    const statValues = gsap.utils.toArray('.relief-stat strong[data-count-to]');
    const statFormat = new Intl.NumberFormat('vi-VN');
    statValues.forEach((value) => {
      const counter = { value: 0 };
      gsap.to(counter, {
        value: Number(value.dataset.countTo), duration: 1.6, ease: 'power2.out',
        onStart: () => { value.textContent = '0'; },
        onUpdate: () => { value.textContent = statFormat.format(Math.round(counter.value)); },
        scrollTrigger: { trigger: '.relief-card', start: 'top 90%', once: true },
      });
    });

    // ==================== SECTION 08: ĐỐI TÁC — 2 hàng logo trượt vào từ hai phía ====================
    gsap.from('.partner-row', {
      autoAlpha: 0, xPercent: (index) => (index ? 8 : -8), duration: 1.1, ease: 'power3.out', stagger: 0.12,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.partners-marquee', start: 'top 88%', once: true },
    });
  });
}
