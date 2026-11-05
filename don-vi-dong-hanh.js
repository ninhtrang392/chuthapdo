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

// ==================== SECTION: THÔNG ĐIỆP — trượt ngang 2 slide (Bà Đỗ Thị Thu Thảo · Đại tướng Trịnh Văn Quyết) ====================
// Dải .dh-quote-track cuộn ngang bắt theo slide (vuốt trên cảm ứng). Chấm: bấm → cuộn tới slide; cuộn → tô chấm.
// Tự chuyển QUOTE_INTERVAL ms (hết thì về slide 1), dừng khi rê chuột / focus / tab ẩn; giảm chuyển động → không tự chuyển.
// Máy tính: giữ chuột trái kéo qua lại, thả → kéo quá 80px thì sang slide kế bên, ít hơn thì bật về. Tải trang luôn ở slide 1.
const QUOTE_INTERVAL = 8000;
const quoteTrack = $('#dh-quote-track');
const quoteDots = [...document.querySelectorAll('#dh-quote-dots [data-quote-slide]')];
if (quoteTrack && quoteDots.length) {
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slideW = () => quoteTrack.clientWidth;
  const current = () => Math.round(quoteTrack.scrollLeft / slideW());
  const goTo = (i) => quoteTrack.scrollTo({ left: ((i + quoteDots.length) % quoteDots.length) * slideW(), behavior: reduceMotion() ? 'auto' : 'smooth' });
  const syncDots = () => { const i = current(); quoteDots.forEach((dot, k) => dot.setAttribute('aria-current', String(k === i))); };
  quoteTrack.scrollLeft = 0; // tải trang luôn ở slide 1
  syncDots();
  let raf = 0;
  quoteTrack.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; syncDots(); }); }, { passive: true });
  quoteDots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.quoteSlide))));
  addEventListener('resize', () => { quoteTrack.scrollLeft = current() * slideW(); });
  // ---------- Tự chuyển ----------
  const section = quoteTrack.closest('.dh-quote');
  setInterval(() => {
    if (reduceMotion() || document.hidden || section.matches(':hover, :focus-within') || drag) return;
    goTo(current() + 1);
  }, QUOTE_INTERVAL);
  // ---------- Kéo chuột qua lại ----------
  let drag = null;
  quoteTrack.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: quoteTrack.scrollLeft, start: current(), dx: 0, moved: false };
  });
  addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    drag.dx = dx;
    if (!drag.moved && Math.abs(dx) < 5) return;
    if (!drag.moved) { drag.moved = true; quoteTrack.classList.add('is-dragging'); }
    quoteTrack.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    const { moved, dx, start } = drag;
    drag = null;
    if (!moved) return;
    quoteTrack.classList.remove('is-dragging');
    // Kéo quá 80px → sang slide kế bên theo hướng kéo; ít hơn → bật về slide cũ
    const last = quoteDots.length - 1;
    goTo(Math.abs(dx) > 80 ? Math.min(last, Math.max(0, start + (dx < 0 ? 1 : -1))) : start);
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  quoteTrack.addEventListener('dragstart', (event) => event.preventDefault());
}

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
const miniStats = [...document.querySelectorAll('.dh-mini-stats dd, .dh-showcase-stat-list dd')];
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

// ==================== THẺ ĐỒNG HÀNH: hơn 4 thẻ → tự chạy ngang vòng lặp + chấm chuyển thẻ ====================
// Số thẻ hiển thị lấy từ biến CSS --dh-per (4; màn ≤900px: 2). Danh sách hơn FOUNDER_MAX thẻ → bọc khung .dh-founders-carousel + dải chấm
// (dùng lại .founders-dot trang chủ). Cứ FOUNDER_INTERVAL ms trượt 1 thẻ sang trái (GSAP tween --dh-slide-x trên danh sách): thẻ đầu mờ đi,
// thẻ kế tiếp ngoài khung hiện dần; xong đưa thẻ đầu xuống cuối, đặt lại 0 → vòng lặp liền mạch, không cắt mép thẻ.
// Bấm chấm → mờ cả lượt, đổi thứ tự cho thẻ được chọn lên đầu, hiện lại. Dừng khi rê chuột / focus / tab ẩn.
// Không GSAP hoặc giảm chuyển động → giữ lưới, thẻ dư xuống hàng, không có chấm.
const FOUNDER_MAX = 4;
const FOUNDER_INTERVAL = 3500;
document.querySelectorAll('.dh-founders').forEach((list, listIndex) => {
  if (list.children.length <= FOUNDER_MAX || !window.gsap) return;
  const items = [...list.children];
  items.forEach((li, i) => { li.dataset.slide = String(i); });
  if (!list.id) list.id = `dh-founders-${listIndex + 1}`;
  // ---------- Khung bọc + dải chấm ----------
  const wrap = document.createElement('div');
  wrap.className = 'dh-founders-carousel';
  list.before(wrap);
  wrap.append(list);
  const dots = document.createElement('div');
  dots.className = 'founders-dots';
  dots.innerHTML = items.map((li, i) => {
    const name = li.querySelector('.dh-founder-logo img')?.alt || `Thẻ ${i + 1}`;
    return `<button class="founders-dot" type="button" data-slide="${i}" aria-controls="${list.id}" aria-label="Hiện ${escapeHtml(name)} đầu tiên"></button>`;
  }).join('');
  wrap.append(dots);

  const card = (li) => li.querySelector('.dh-founder-card');
  const perView = () => parseInt(getComputedStyle(list).getPropertyValue('--dh-per'), 10) || FOUNDER_MAX;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null;
  let paused = false;
  let busy = false;
  const syncDots = () => {
    const current = list.firstElementChild.dataset.slide;
    dots.querySelectorAll('.founders-dot').forEach((dot) => dot.setAttribute('aria-current', String(dot.dataset.slide === current)));
  };
  // So le theo VỊ TRÍ trong khung (cao · thấp · cao · thấp), không theo thẻ → vòng lặp số thẻ lẻ vẫn xen kẽ đều; độ thấp lấy từ biến CSS --dh-low
  const lowAt = (pos) => (pos % 2 === 1 ? getComputedStyle(list).getPropertyValue('--dh-low').trim() || '0px' : '0px');
  // Thẻ trong khung hiện, ngoài khung ẩn (mờ trên .dh-founder-card — độ mờ của <li> do hiệu ứng chuyển từ GTINX quản lý)
  const applyVisibility = () => {
    const per = perView();
    [...list.children].forEach((li, i) => {
      const off = i >= per;
      li.classList.toggle('is-off', off);
      li.setAttribute('aria-hidden', String(off));
      gsap.set(card(li), { opacity: off ? 0 : 1 });
      gsap.set(li, { marginTop: lowAt(i) });
    });
  };
  const step = () => {
    if (paused || busy || document.hidden) return;
    const children = [...list.children];
    const first = children[0];
    const incoming = children[perView()];
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    busy = true;
    incoming.classList.remove('is-off');
    incoming.setAttribute('aria-hidden', 'false');
    gsap.timeline({
      onComplete: () => {
        list.append(first);
        gsap.set(list, { '--dh-slide-x': '0px' });
        gsap.set(first, { marginTop: lowAt(list.children.length - 1) }); // thẻ vừa xuống cuối: nhận độ cao của vị trí mới
        first.classList.add('is-off');
        first.setAttribute('aria-hidden', 'true');
        busy = false;
        syncDots();
      },
    })
      .to(list, { '--dh-slide-x': `${-(first.offsetWidth + gap)}px`, duration: 0.9, ease: 'power3.inOut' }, 0)
      .to(card(first), { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
      .fromTo(card(incoming), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
      // Mỗi thẻ lùi 1 vị trí → vừa trượt ngang vừa lên/xuống đúng nhịp so le của vị trí mới
      .to(children.slice(1, perView() + 1), { marginTop: (k) => lowAt(k), duration: 0.9, ease: 'power3.inOut' }, 0);
  };
  const restart = () => {
    clearInterval(timer);
    timer = setInterval(step, FOUNDER_INTERVAL);
  };
  const goTo = (target) => {
    if (busy || list.firstElementChild.dataset.slide === target) return;
    busy = true;
    const visible = [...list.children].slice(0, perView()).map(card);
    gsap.to(visible, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        while (list.firstElementChild.dataset.slide !== target) list.append(list.firstElementChild);
        applyVisibility();
        const shown = [...list.children].slice(0, perView()).map(card);
        gsap.fromTo(shown, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08, onComplete: () => { busy = false; } });
        syncDots();
      },
    });
    restart();
  };
  const update = () => {
    const on = !reduced.matches && list.children.length > perView();
    list.classList.toggle('is-carousel', on);
    dots.hidden = !on;
    clearInterval(timer);
    timer = null;
    if (on) {
      gsap.set(list, { '--dh-slide-x': '0px' });
      applyVisibility();
      syncDots();
      restart();
    } else {
      [...list.children].forEach((li) => {
        li.classList.remove('is-off');
        li.removeAttribute('aria-hidden');
        gsap.set(card(li), { clearProps: 'opacity' });
        gsap.set(li, { clearProps: 'marginTop' }); // trả so le về CSS (.is-low)
      });
    }
  };
  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('.founders-dot');
    if (dot) goTo(dot.dataset.slide);
  });
  wrap.addEventListener('mouseenter', () => { paused = true; });
  wrap.addEventListener('mouseleave', () => { paused = false; });
  wrap.addEventListener('focusin', () => { paused = true; });
  wrap.addEventListener('focusout', () => { paused = false; });
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(update, 200); });
  reduced.addEventListener('change', update);
  update();
});

// ==================== SECTION: NGƯỜI ĐỒNG HÀNH NỔI BẬT — tối đa 4 thẻ (BR-04, NL02, NL03) ====================
// Thẻ (nền ảnh hồng mờ): ảnh chân dung tròn viền trắng · tên chữ đen · danh xưng · nút UI KIT viền xanh "Theo dõi" · đường kẻ · trích dẫn nghiêng có dấu ngoặc xanh.
// pos (tuỳ chọn): object-position riêng để đầu các thẻ ngang nhau; zoom (tuỳ chọn): phóng ảnh đứng xa cho khuôn mặt cân với thẻ khác. Ảnh chân dung dùng ảnh gốc có nền (không tách nền), cắt tròn bằng CSS .dh-person-avatar. Ảnh lỗi → ảnh đại diện mặc định (chữ cái đầu). Không có người → TB03.
const PEOPLE = [
  { name: 'Trần Thu Hà', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/b4f3cc87d25f00c95859daf33b3c5e40.jpg', quote: 'Lan tỏa yêu thương không chỉ là hành động, mà là trách nhiệm của mỗi chúng ta.' },
  { name: 'Phạm Gia Huy', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/0cbea7d214cc6acf1054334e41d9d945.jpg', pos: '50% 6%', zoom: 1.2, quote: 'Dù là điều nhỏ bé nhất, chúng ta vẫn có thể tạo nên thay đổi lớn lao.' },
  { name: 'Hoàng Mai Linh', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/2b175da1066d5f3ef635d4980e47f6a4.jpg', zoom: 1.4, quote: 'Sẻ chia là một hành trình dài, và tôi mong được cùng mọi người lan tỏa điều tốt đẹp.' },
  { name: 'Lê Quốc Bảo', role: 'Đại sứ nhân ái', avatar: 'Emages/avatar/396c741c3d37ad0199ac220d16169e3e.jpg', pos: '50% 12%', zoom: 1.45, quote: 'Hạnh phúc thật sự là khi mình có thể giúp đỡ người khác vượt qua khó khăn.' },
];
const initials = (name) => { const w = name.trim().split(/\s+/); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
const peopleGrid = $('#dh-people-grid');
const PEOPLE_MAX = 4;
const people = PEOPLE.slice(0, PEOPLE_MAX);
if (!people.length) $('#dh-people-empty').hidden = false;
peopleGrid.innerHTML = people.map((p) => `<li class="cp-card dh-person">
    <span class="dh-person-avatar" data-initials="${escapeHtml(initials(p.name))}"><img src="${p.avatar}" alt="" width="400" height="480" loading="lazy"${p.pos || p.zoom ? ` style="${p.pos ? `object-position:${p.pos};` : ''}${p.zoom ? `--zoom:${p.zoom}` : ''}"` : ''} /></span>
    <div class="dh-person-info">
      <h3 class="dh-person-name">${escapeHtml(p.name)}</h3>
      <p class="dh-person-role">${escapeHtml(p.role)}</p>
      <a class="button button-outline button-small dh-person-follow" href="#" data-panel="Theo dõi người đồng hành" aria-label="Theo dõi ${escapeHtml(p.name)}"><svg class="icon" aria-hidden="true"><use href="#user-plus"/></svg>Theo dõi</a>
      <blockquote class="dh-person-quote"><p>${escapeHtml(p.quote)}</p></blockquote>
    </div>
  </li>`).join('');
peopleGrid.querySelectorAll('.dh-person-avatar img').forEach((img) => img.addEventListener('error', () => {
  const box = img.parentElement;
  box.textContent = box.dataset.initials;
}, { once: true }));

// ==================== SECTION: HÌNH THỨC HỢP TÁC & ĐỒNG HÀNH — accordion ====================
// Rê chuột (thiết bị có chuột, trễ 180ms), focus bàn phím hoặc bấm vào dòng nào thì dòng đó mở chi tiết, các dòng khác thu lại; luôn giữ 1 dòng mở.
const coopList = $('#dh-coop-list');
if (coopList) {
  const coopRows = [...coopList.querySelectorAll('.dh-coop-row')];
  const openCoop = (row) => coopRows.forEach((item) => {
    const open = item === row;
    item.classList.toggle('is-open', open);
    item.querySelector('.dh-coop-toggle').setAttribute('aria-expanded', String(open));
  });
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Rê chuột: chờ HOVER_DELAY ms mới mở (lướt nhanh qua các dòng không mở / đóng liên tục → đỡ giật)
  const HOVER_DELAY = 180;
  let hoverTimer = 0;
  coopRows.forEach((row) => {
    if (canHover) {
      row.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => openCoop(row), HOVER_DELAY); });
      row.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
    }
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
      gsap.utils.toArray('.dh-showcase .dh-section-title, .dh-sponsors .dh-section-title, .dh-people .dh-section-title, .dh-coop .dh-section-title').forEach((title) => {
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
        scrollTrigger: { trigger: dd.closest('dl'), start: 'top 90%', once: true }, // mỗi dải số liệu (banner / Giới thiệu đồng hành) đếm khi chính nó cuộn tới
      });
    });

    // ---------- Giới thiệu đồng hành: thẻ GTINX nổi lên · dải số liệu trồi lên (mô tả dùng data-dh-reveal) ----------
    gsap.from('.dh-showcase-stage', {
      autoAlpha: 0, y: 48, scale: 0.97, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.dh-showcase-stage', start: 'top 85%', once: true },
    });
    gsap.from('.dh-showcase-stat-list > div', {
      autoAlpha: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.dh-showcase-stat-list', start: 'top 92%', once: true },
    });
    // Hàng logo trượt vào từ hai phía xen kẽ (cùng kiểu dải đối tác trang chủ)
    gsap.from('.dh-sponsor-marquee .partner-row', {
      autoAlpha: 0, xPercent: (index) => (index % 2 ? 8 : -8), duration: 1.1, ease: 'power3.out', stagger: 0.12,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '#dh-sponsor-tiers', start: 'top 88%', once: true },
    });

    // ---------- Người đồng hành: ảnh tròn nở từ tâm + thu từ phóng to về, phần chữ trồi lên (xong thì trả transform cho hiệu ứng rê chuột của CSS) ----------
    gsap.utils.toArray('.dh-person').forEach((card, index) => {
      const avatar = card.querySelector('.dh-person-avatar');
      const img = avatar.querySelector('img');
      gsap.timeline({ delay: index * 0.12, defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
        .fromTo(avatar, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.4, clearProps: 'clipPath' })
        .from(img, { scale: 1.3, duration: 1.6, clearProps: 'transform' }, 0)
        .from(card.querySelector('.dh-person-info'), { autoAlpha: 0, y: 32, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0.5);
    });

    // ---------- Hình thức hợp tác: từng dòng hiện dần, trượt lên nhẹ ----------
    gsap.from('.dh-coop-row', {
      autoAlpha: 0, y: 20, duration: 0.8, ease: 'power2.out', stagger: 0.06, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.dh-coop-list', start: 'top 85%', once: true },
    });

    // ---------- Kêu gọi: thẻ đỏ nở ra khi cuộn tới (scrub) ----------
    gsap.fromTo('.dh-cta-card', { scale: 0.88, yPercent: 6 }, {
      scale: 1, yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.dh-cta-card', start: 'top bottom', end: 'top 55%', scrub: true },
    });
  });
}

// ==================== MOTION: THẺ GTINX → 4 THẺ ĐỒNG HÀNH khi lăn chuột — dùng chung cho section Giới thiệu đồng hành và Banner (GSAP ScrollTrigger: ghim section, scrub) ====================
// Cuộn tới section: hiện thẻ GTINX. Lăn chuột tiếp: section đứng yên (pin); đoạn đầu (GTINX_HOLD) GTINX đứng yên — lăn vài nấc vẫn còn GTINX;
// qua hết đoạn giữ, GTINX thu nhỏ + mờ dần lùi ra, 4 thẻ lần lượt trồi lên vào chỗ. scrub 1 → bám bánh xe nhưng có độ trễ mượt;
// snap (chỉ trong đoạn chuyển) → thả chuột giữa chừng thì tự chạy hết theo hướng đang cuộn (xuống → 4 thẻ, lên → về GTINX).
// Chỉ màn ≥1101px (section vừa 1 màn hình) và không bật giảm chuyển động; còn lại 4 thẻ xếp dưới GTINX (CSS mặc định).
const GTINX_HOLD = 1; // thời lượng giữ GTINX (đơn vị timeline; tăng để giữ lâu hơn, nhớ tăng end tương ứng)
// copyOut / copyIn (tuỳ chọn): nội dung cột chữ đổi cùng lúc với thẻ (section 2: "GTINX — Đơn vị phát triển" → "Đơn vị đồng hành").
// introBg (tuỳ chọn): section có lớp nền riêng cho trạng thái GTINX (biến CSS --dh-gx-bg), mờ đi khi chuyển.
const setupGtinxSwap = ({ section, stage, intro, priority, copyOut, copyIn, introBg }) => {
  const stageEl = $(stage);
  const sectionEl = $(section);
  if (!stageEl || !sectionEl || sectionEl.hidden) return null; // section đang ẩn (thuộc tính hidden) → không ghim
  const header = $('.header');
  stageEl.classList.add('is-swap');
  sectionEl.classList.add('has-swap');
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: () => `top ${header ? header.offsetHeight : 0}px`, // ghim ngay dưới header cố định
      end: '+=180%',
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      refreshPriority: priority, // section ghim ở trên tính trước → các trigger phía dưới cộng đúng khoảng ghim
      snap: {
        snapTo: () => {
          const hold = tl.labels.swap / tl.duration();
          const progress = tl.scrollTrigger.progress; // vị trí thật (không dùng đích dự đoán theo vận tốc — lăn chuột luôn dự đoán vượt đoạn giữ)
          if (progress < hold) return progress; // đang trong đoạn giữ GTINX → không kéo trang
          return tl.scrollTrigger.direction > 0 ? 1 : hold;
        },
        duration: { min: 0.3, max: 0.8 }, delay: 0.1, ease: 'power2.inOut',
        // html{scroll-behavior:smooth} làm snap của GSAP trượt quá đích → tắt tạm trong lúc snap chạy
        onStart: () => { document.documentElement.style.scrollBehavior = 'auto'; },
        onComplete: () => { document.documentElement.style.scrollBehavior = ''; },
        onInterrupt: () => { document.documentElement.style.scrollBehavior = ''; },
      },
    },
  });
  tl.addLabel('swap', GTINX_HOLD)
    .to(`${stage} ${intro}`, { autoAlpha: 0, scale: 0.86, yPercent: -10, duration: 1, ease: 'power2.in' }, 'swap')
    .fromTo(`${stage} .dh-founder`, { autoAlpha: 0, '--dh-in-y': '160px' }, { autoAlpha: 1, '--dh-in-y': '0px', duration: 1, ease: 'power3.out', stagger: 0.15 }, 'swap+=0.45')
    .to({}, { duration: 0.2 }); // giữ 4 thẻ một nhịp trước khi nhả ghim
  // Dải chấm chuyển thẻ (chỉ có khi hơn 4 thẻ): ẩn lúc đang hiện GTINX, hiện cùng các thẻ — chỉ thuộc trạng thái "Đơn vị đồng hành"
  const dots = stageEl.querySelector('.founders-dots');
  if (dots) tl.fromTo(dots, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 'swap+=1');
  if (copyOut && copyIn) {
    // Cột chữ: nội dung cũ trượt lên mờ đi, nội dung mới trồi lên — cùng nhịp GTINX lùi ra / 4 thẻ trồi vào
    tl.to(copyOut, { autoAlpha: 0, y: -24, duration: 0.6, ease: 'power2.in' }, 'swap')
      .fromTo(copyIn, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 'swap+=0.45');
  }
  // Nền trạng thái GTINX (section 2: ảnh xanh ngọc gợn sóng ở .dh-showcase::before) mờ dần → lộ nền sóng đỏ trên nền hồng khi sang "Đơn vị đồng hành"
  if (introBg) tl.fromTo(sectionEl, { '--dh-gx-bg': 1 }, { '--dh-gx-bg': 0, duration: 1, ease: 'power2.inOut' }, 'swap');
  return () => {
    stageEl.classList.remove('is-swap');
    sectionEl.classList.remove('has-swap');
    sectionEl.style.removeProperty('--dh-gx-bg');
  };
};
if (window.gsap && window.ScrollTrigger) {
  gsap.matchMedia().add('(min-width: 1101px) and (prefers-reduced-motion: no-preference)', () => {
    const cleanups = [
      setupGtinxSwap({ // section 2: thẻ GTINX → 4 thẻ; chữ trái "GTINX — Đơn vị phát triển" → "Đơn vị đồng hành"
        section: '.dh-showcase', stage: '.dh-showcase-stage', intro: '.dh-gx-card', priority: 2,
        copyOut: '.dh-showcase-copy.is-gtinx', copyIn: '.dh-showcase-copy.is-partners', introBg: true,
      }),
      setupGtinxSwap({ section: '.dh-banner', stage: '.dh-banner-stage', intro: '.dh-gtinx-intro', priority: 1 }), // banner: thẻ GTINX dọc → 4 thẻ
    ];
    return () => cleanups.forEach((fn) => fn && fn());
  });
}
