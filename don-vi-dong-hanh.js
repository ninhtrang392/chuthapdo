// ==================== TRANG ĐƠN VỊ ĐỒNG HÀNH (SRS Đối tác đồng hành — Web công dân) ====================
// Dữ liệu minh họa — khi triển khai thật, lấy số liệu, đối tác tài trợ, người đồng hành nổi bật từ Web nội bộ Hội / API.

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

const $ = (s) => document.querySelector(s);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ==================== SECTION: SỐ LIỆU ĐỒNG HÀNH — định dạng BR-05 ====================
// Số lượng: dấu "." phân cách hàng nghìn · Số tiền: < 1 triệu đầy đủ; 1 triệu – < 1 tỷ chia 10⁶ "triệu"; ≥ 1 tỷ chia 10⁹ "tỷ";
// tối đa 1 chữ số thập phân, cắt bỏ (không làm tròn), dấu thập phân ","; kèm "đồng". Chưa có dữ liệu → 0 (NL02).
const formatCount = (n) => Math.trunc(Number(n) || 0).toLocaleString('vi-VN');
const formatMoney = (n) => {
  const value = Number(n) || 0;
  const cut = (x) => String(Math.trunc(x * 10) / 10).replace('.', ',');
  if (value >= 1e9) return `${cut(value / 1e9)} tỷ đồng`;
  if (value >= 1e6) return `${cut(value / 1e6)} triệu đồng`;
  return `${formatCount(value)} đồng`;
};
// Số liệu (cạnh tiêu đề section Đối tác tài trợ): chỉ thay chữ số trong <span>, kèm hậu tố "+" nếu có; khối MOTION cho đếm lên từ 0 khi cuộn tới
const miniStats = [...document.querySelectorAll('.dh-mini-stats dd')];
const miniTarget = (dd) => Number(dd.dataset.money ?? dd.dataset.count) || 0;
const setMiniStat = (dd, value) => {
  dd.querySelector('span').textContent = dd.dataset.money !== undefined ? formatMoney(value) : formatCount(value) + (dd.dataset.suffix || '');
};
miniStats.forEach((dd) => setMiniStat(dd, miniTarget(dd)));

// ==================== SECTION: ĐỐI TÁC TÀI TRỢ — 2 mục: đơn vị tiêu biểu (thẻ lớn) · đơn vị khác (thẻ nhỏ), mỗi mục 1 hàng chạy ngang (BR-03, BR-07, NL02, NL03) ====================
// Thứ tự theo cấu hình Web nội bộ Hội (BR-03). Mỗi hàng = danh sách + bản sao (aria-hidden) để chạy vòng liền mạch; thời gian chạy tỷ lệ số logo → tốc độ đều.
// Logo lỗi → ô chữ tên đối tác (NL03). Không có đối tác → TB02.
const LOGO_DIR = 'Emages/%C4%90%E1%BB%91i%20t%C3%A1c/';
// Đơn vị tiêu biểu: [tên, file logo, vai trò, màu vạch đáy thẻ theo thương hiệu] — DỮ LIỆU MINH HỌA
const SPONSORS_FEATURED = [
  ['PetroVietnam', 'PETROVIETNAM.png', 'Nhà tài trợ chiến lược', '#e3262c'], ['BIDV', 'BIDV.jpg', 'Đối tác chiến lược', '#00796b'],
  ['Coca-Cola', 'COCACOLA.png', 'Nhà tài trợ đồng hành', '#e41e2b'], ['P&G', 'PG.png', 'Nhà tài trợ đồng hành', '#1f4fa3'],
  ['Nutifood', 'NUTRIFOOD.png', 'Đối tác đồng hành', '#2e9a3e'], ['Heineken', 'HEINEKEN.png', 'Đối tác đồng hành', '#1b7a3a'],
];
const SPONSORS_OTHERS = [
  ['MB Bank', 'Logo-MB-1.png'], ['Masan', 'MSG-1.png'], ['Sipco', 'SIPCO.png'], ['Prudential', 'PRUDENTIAL.png'], ['Sun Life', 'SUNLIFE.png'], ['Carefor', 'carefor-1.png'],
  ['Samten Hills Dalat', 'SAMTEN-HILL-DALAT.png'], ['Vinasoy', 'VINASOY.png'], ['Saigon Co.op', 'SAIGON-COOP.png'], ['Quỹ Khuyến học', 'QUY-KHUYEN-HOC.png'],
  ['Long Thành Golf Club', 'LONG-THANH-GOLF-CLUB.png'], ['Wan Hai Lines', 'WAN-HAI-LINES-LTD.png'],
];
const SECONDS_PER_LOGO = 5;
const MIN_PER_ROW = 12; // ít logo → lặp lại trong hàng cho đủ phủ khung (bản lặp ẩn với trình đọc màn hình)
const logoFallback = (img) => {
  const box = img.parentElement;
  box.classList.add('is-text');
  box.textContent = img.alt || img.dataset.name;
};
const logoImg = (name, file, shown) => `<img src="${LOGO_DIR}${file}" alt="${shown ? escapeHtml(name) : ''}" data-name="${escapeHtml(name)}" width="400" height="333" loading="lazy" decoding="async" />`;
const hide = (shown) => (shown ? '' : ' aria-hidden="true"');
// Thẻ nhỏ: chỉ logo · Thẻ tiêu biểu: logo · tên đậm · vai trò · vạch màu đáy thẻ
const logoItems = (list, shown) => list
  .map(([name, file, role, color], i) => (role
    ? `<li class="partner-logo dh-feat" style="--dh-bar:${color}"${hide(i < shown)}><span class="dh-feat-logo">${logoImg(name, file, i < shown)}</span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(role)}</small></li>`
    : `<li class="partner-logo"${hide(i < shown)}>${logoImg(name, file, i < shown)}</li>`)).join('');
const buildMarquee = (box, list, label, reverse) => {
  if (!box) return;
  if (!list.length) { box.hidden = true; return; }
  const filled = Array.from({ length: Math.max(list.length, MIN_PER_ROW) }, (_, i) => list[i % list.length]);
  box.innerHTML = `<div class="partner-row${reverse ? ' is-reverse' : ''}">
      <div class="partner-track" style="--dh-dur:${filled.length * SECONDS_PER_LOGO}s">
        <ul class="partner-list" aria-label="${label}">${logoItems(filled, list.length)}</ul>
        <ul class="partner-list" aria-hidden="true">${logoItems(filled, 0)}</ul>
      </div>
    </div>`;
  box.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => logoFallback(img), { once: true }));
};
if (!SPONSORS_FEATURED.length && !SPONSORS_OTHERS.length) {
  $('#dh-sponsor-empty').hidden = false;
  $('#dh-sponsor-tiers').hidden = true;
} else {
  buildMarquee($('#dh-sponsor-featured'), SPONSORS_FEATURED, 'Các đơn vị đồng hành tiêu biểu', false);
  buildMarquee($('#dh-sponsor-others'), SPONSORS_OTHERS, 'Các đơn vị đồng hành khác', true);
}
// Logo tĩnh trong banner và khối Xây dựng & phát triển: lỗi tải → ô chữ tên đơn vị (NL03)
document.querySelectorAll('.dh-founder-logo img, .dh-builders-logos img').forEach((img) => img.addEventListener('error', () => logoFallback(img), { once: true }));

// ==================== SECTION: NGƯỜI ĐỒNG HÀNH NỔI BẬT — tối đa 4 thẻ (BR-04, NL02, NL03) ====================
// Thẻ: ảnh chân dung · khung trắng (tên · danh xưng · nút tròn biểu tượng theo dõi). Trích dẫn giữ trong dữ liệu cho trang chi tiết.
// pos (tuỳ chọn): object-position riêng để đầu các thẻ ngang nhau. Ảnh chân dung dùng PNG đã tách nền (*-tach-nen.png) đặt trên nền hồng chung của khung ảnh (CSS .dh-person-avatar). Ảnh lỗi → ảnh đại diện mặc định (chữ cái đầu). Không có người → TB03.
const PEOPLE = [
  { name: 'Trần Thu Hà', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/tran-thu-ha-tach-nen.png', quote: 'Lan tỏa yêu thương không chỉ là hành động, mà là trách nhiệm của mỗi chúng ta.' },
  { name: 'Phạm Gia Huy', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/le-quoc-bao-tach-nen.png', pos: '50% 43%', quote: 'Dù là điều nhỏ bé nhất, chúng ta vẫn có thể tạo nên thay đổi lớn lao.' },
  { name: 'Hoàng Mai Linh', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/hoang-mai-linh-tach-nen.png', quote: 'Sẻ chia là một hành trình dài, và tôi mong được cùng mọi người lan tỏa điều tốt đẹp.' },
  { name: 'Lê Quốc Bảo', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/le-quoc-bao-tach-nen.png', pos: '50% 43%', quote: 'Hạnh phúc thật sự là khi mình có thể giúp đỡ người khác vượt qua khó khăn.' },
];
const initials = (name) => { const w = name.trim().split(/\s+/); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
const peopleGrid = $('#dh-people-grid');
const PEOPLE_MAX = 4;
const people = PEOPLE.slice(0, PEOPLE_MAX);
if (!people.length) $('#dh-people-empty').hidden = false;
peopleGrid.innerHTML = people.map((p) => `<li class="cp-card dh-person">
    <span class="dh-person-avatar" data-initials="${escapeHtml(initials(p.name))}"><img src="${p.avatar}" alt="" width="400" height="480" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ''} /></span>
    <div class="dh-person-info">
      <h3 class="dh-person-name">${escapeHtml(p.name)}</h3>
      <p class="dh-person-role">${escapeHtml(p.role)}</p>
      <a class="dh-person-more" href="#" data-panel="Theo dõi người đồng hành" aria-label="Theo dõi ${escapeHtml(p.name)}"><svg class="icon" aria-hidden="true"><use href="#user-plus"/></svg></a>
    </div>
  </li>`).join('');
peopleGrid.querySelectorAll('.dh-person-avatar img').forEach((img) => img.addEventListener('error', () => {
  const box = img.parentElement;
  box.textContent = box.dataset.initials;
}, { once: true }));

// ==================== SECTION: HÌNH THỨC HỢP TÁC & ĐỒNG HÀNH — accordion ====================
// Rê chuột (thiết bị có chuột), focus bàn phím hoặc bấm vào dòng nào thì dòng đó mở chi tiết, các dòng khác thu lại; luôn giữ 1 dòng mở.
const coopList = $('#dh-coop-list');
if (coopList) {
  const coopRows = [...coopList.querySelectorAll('.dh-coop-row')];
  const openCoop = (row) => coopRows.forEach((item) => {
    const open = item === row;
    item.classList.toggle('is-open', open);
    item.querySelector('.dh-coop-toggle').setAttribute('aria-expanded', String(open));
  });
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  coopRows.forEach((row) => {
    if (canHover) row.addEventListener('mouseenter', () => openCoop(row));
    row.addEventListener('click', () => openCoop(row));
    row.querySelector('.dh-coop-toggle').addEventListener('focus', () => openCoop(row));
  });
}

// ==================== MOTION: GSAP / ScrollTrigger — các section từ Đối tác tài trợ đến Kêu gọi đồng hành ====================
// Chỉ chạy khi không bật giảm chuyển động; GSAP lỗi tải → nội dung vẫn hiện đủ. Nút nam châm (data-magnetic) do flow.js xử lý.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ---------- Tiêu đề: hiện theo dòng, trồi lên trong khung (SplitText, cùng kiểu trang chủ) ----------
    if (window.SplitText) {
      gsap.utils.toArray('.dh-sponsors .dh-section-title, .dh-people .dh-section-title, .dh-coop .dh-section-title').forEach((title) => {
        title.classList.add('is-split');
        SplitText.create(title, {
          type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.1,
            scrollTrigger: { trigger: title, start: 'top 88%', once: true },
          }),
        });
      });
    }

    // ---------- Mô tả, nút: trồi lên mờ dần theo lượt ----------
    const reveals = gsap.utils.toArray('[data-dh-reveal]');
    gsap.set(reveals, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(reveals, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.2, overwrite: true }),
    });

    // ---------- Số liệu đồng hành (section Đối tác tài trợ): từng ô trượt vào, số đếm lên · Đối tác tài trợ: hàng logo trượt vào ----------
    gsap.from('.dh-mini-stats > div', {
      autoAlpha: 0, x: -24, duration: 0.8, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.dh-mini-stats', start: 'top 90%', once: true },
    });
    miniStats.forEach((dd) => {
      const counter = { value: 0 };
      gsap.to(counter, {
        value: miniTarget(dd), duration: 1.8, ease: 'power2.out',
        onStart: () => setMiniStat(dd, 0),
        onUpdate: () => setMiniStat(dd, counter.value),
        onComplete: () => setMiniStat(dd, miniTarget(dd)),
        scrollTrigger: { trigger: '.dh-mini-stats', start: 'top 90%', once: true },
      });
    });
    // Hàng logo trượt vào từ hai phía xen kẽ (cùng kiểu dải đối tác trang chủ)
    gsap.from('.dh-sponsor-marquee .partner-row', {
      autoAlpha: 0, xPercent: (index) => (index % 2 ? 8 : -8), duration: 1.1, ease: 'power3.out', stagger: 0.12,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '#dh-sponsor-tiers', start: 'top 88%', once: true },
    });

    // ---------- Người đồng hành: ảnh mở từ dưới lên + thu từ phóng to về, khung tên trồi lên (xong thì trả transform cho hiệu ứng rê chuột của CSS) ----------
    gsap.utils.toArray('.dh-person').forEach((card, index) => {
      const avatar = card.querySelector('.dh-person-avatar');
      const img = avatar.querySelector('img');
      gsap.timeline({ delay: index * 0.12, defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
        .fromTo(avatar, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, clearProps: 'clipPath' })
        .from(img, { scale: 1.3, duration: 1.6, clearProps: 'transform' }, 0)
        .from(card.querySelector('.dh-person-info'), { autoAlpha: 0, y: 32, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0.5);
    });

    // ---------- Hình thức hợp tác: từng dòng trượt lên, số thứ tự nhảy vào ----------
    gsap.from('.dh-coop-row', {
      autoAlpha: 0, y: 48, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.dh-coop-list', start: 'top 85%', once: true },
    });

    // ---------- Kêu gọi: thẻ đỏ nở ra khi cuộn tới (scrub) ----------
    gsap.fromTo('.dh-cta-card', { scale: 0.88, yPercent: 6 }, {
      scale: 1, yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.dh-cta-card', start: 'top bottom', end: 'top 55%', scrub: true },
    });
  });
}
