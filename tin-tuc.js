// ==================== TRANG TIN TỨC ====================
// Theo SRS Trang Tin tức (mục 3.1): banner (tiêu đề · mô tả · tìm kiếm) · 5 nhãn chuyên mục · Tin tức nổi bật (tự chuyển bài) | Tin mới nhất ·
// banner truyền thông · Tin đọc nhiều (dải ngang) · Tin tức khác. Bố cục dàn trang tham khảo trang chủ báo Nhân Dân.
// DỮ LIỆU MINH HỌA — bài viết, ảnh, ngày đăng, lượt xem lấy từ CMS khi có hệ thống chính thức.

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

// ==================== DỰNG THẺ BÀI (dữ liệu + thẻ dùng chung: tin-tuc-data.js) ====================
// Tin tức nổi bật: 1 slide = ảnh lớn (không nhãn) · tiêu đề (2 dòng) · sapo (3 dòng) · ngày đăng
const slide = (a, i, n) => `
  <article class="news-item nw-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${n}">
    ${media(a, 'nw-slide-media', i === 0)}
    <div class="nw-slide-body">
      <h3 class="news-title nw-slide-title">${titleLink(a)}</h3>
      <p class="news-desc nw-slide-desc">${escapeHtml(a.desc)}</p>
      <div class="nw-slide-foot">${meta(a, false)}</div>
    </div>
  </article>`;
// latestCard, otherCard, media, meta, titleLink: tin-tuc-data.js
// Tin mới nhất: bài 1 = thẻ ngang lớn (ảnh không nhãn · tiêu đề · sapo · ngày đăng); bài 2 – 5 = lưới 2×2 bài nhỏ (ảnh không nhãn · tiêu đề tối đa 2 dòng · ngày đăng = tối đa 3 dòng)
const latestLead = (a) => `
  <article class="news-item nw-latest-lead">
    ${media(a, 'nw-latest-lead-media')}
    <div class="nw-latest-body"><h3 class="news-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p>${meta(a, false)}</div>
  </article>`;
const latestBlock = (list) => {
  if (!list.length) return '<p class="nw-block-empty">Hiện chưa có tin tức nào.</p>';
  const [lead, ...rest] = list;
  return latestLead(lead) + (rest.length ? `<div class="nw-latest-grid">${rest.map(latestCard).join('')}</div>` : '');
};
// Tin đọc nhiều: thẻ dọc — ảnh đứng phủ cả thẻ, không nhãn chuyên mục · tiêu đề tối đa 3 dòng chữ trắng nằm trên đáy ảnh (CSS .nw-pop-card)
const popularCard = (a) => `
  <article class="cp-card nw-card nw-pop-card">
    ${media(a, 'cp-card-media')}
    <div class="cp-card-body"><h3 class="cp-card-title">${titleLink(a)}</h3></div>
  </article>`;
// Tin tức khác: bố cục y như "Tin tức và bài viết nhân đạo" trang chủ (.news-grid) — trái 1 bài lớn .news-feature (ảnh phủ kín · ngày · tiêu đề · sapo trên đáy ảnh);
// phải .news-list 3 bài .news-row (ảnh trái · ngày · tiêu đề · sapo 2 dòng), kẻ mảnh ngăn cách. Không nhãn chuyên mục
const othersItem = (a, cls) => `
  <article class="news-item ${cls}">
    ${media(a, '')}
    <div class="news-body"><p class="news-meta"><time datetime="${a.at.replace(' ', 'T')}">${viDate(a.at)}</time></p><h3 class="news-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p></div>
  </article>`;
const othersBlock = (list) => {
  const [lead, ...rest] = list;
  return lead ? othersItem(lead, 'news-feature') + (rest.length ? `<div class="news-list">${rest.map((a) => othersItem(a, 'news-row')).join('')}</div>` : '') : '';
};

// ==================== QUY TẮC LẤY BÀI THEO CHUYÊN MỤC (BR-NB-01, BR-DS-01 → 04, NL02) ====================
const pick = (cat) => {
  const pool = ARTICLES.filter((a) => !cat || a.cat === cat);
  const newest = [...pool].sort(byNewest);
  // Nổi bật: tối đa 5 bài có cờ, theo thứ tự cấu hình; không có bài gắn cờ → bài mới nhất (hiển thị như 1 bài đơn)
  let featured = pool.filter((a) => a.hot).sort((a, b) => a.hot - b.hot).slice(0, 5);
  if (!featured.length && newest.length) featured = [newest[0]];
  const latest = newest.filter((a) => !featured.includes(a)).slice(0, 5); // 1 bài lớn + lưới 2×2
  // Đọc nhiều: tối đa 10 bài lượt xem cao nhất (bằng nhau thì bài mới hơn trước), không loại trừ khối khác
  // (hệ thống chính thức chỉ tính lượt xem trong 30 ngày gần nhất)
  const popular = [...pool].sort((a, b) => b.views - a.views || byNewest(a, b)).slice(0, 10);
  const used = new Set([...featured, ...latest, ...popular]);
  const others = newest.filter((a) => !used.has(a)).slice(0, 4); // Tin tức khác: 1 bài lớn + 3 bài danh sách (như trang chủ); xem thêm qua Xem tất cả
  return { pool, featured, latest, popular, others };
};

// ==================== TIN TỨC NỔI BẬT: tự chuyển 10 giây, vòng lặp; không nút ‹ › / Tạm dừng; tạm dừng khi rê chuột / focus / chạm giữ / tab ẩn (BR-NB-02 → 07) ====================
const AUTO_MS = 10000;
const featuredEl = $('#nw-featured');
const slidesEl = $('#nw-slides');
const dotsEl = $('#nw-dots');
const car = { n: 0, i: 0, timer: 0, holds: new Set() };
const slideEls = () => [...slidesEl.children];
// Dừng bộ đếm + xóa thanh tiến trình của chấm đang chọn
const stopCycle = () => {
  clearTimeout(car.timer);
  car.timer = 0;
  dotsEl.querySelectorAll('.is-running').forEach((d) => d.classList.remove('is-running'));
};
// Chạy lại bộ đếm từ đầu chu kỳ (chỉ khi đủ điều kiện); bộ đếm bắt đầu khi ảnh bài đang hiện đã tải xong
const startCycle = () => {
  stopCycle();
  if (car.n < 2 || reduced() || car.holds.size) return;
  const img = slideEls()[car.i]?.querySelector('img');
  if (img && !img.complete) { img.addEventListener('load', startCycle, { once: true }); img.addEventListener('error', startCycle, { once: true }); return; }
  const dot = dotsEl.children[car.i];
  if (dot) { void dot.offsetWidth; dot.classList.add('is-running'); }
  car.timer = setTimeout(() => go(car.i + 1), AUTO_MS);
};
// Chuyển tới bài i (vòng: sau bài cuối về bài 1, trước bài 1 là bài cuối); tải trước ảnh bài kế tiếp
const go = (i) => {
  if (!car.n) return;
  car.i = (i + car.n) % car.n;
  slideEls().forEach((s, k) => {
    const on = k === car.i;
    s.classList.toggle('is-active', on);
    s.setAttribute('aria-hidden', String(!on));
    s.inert = !on;
  });
  [...dotsEl.children].forEach((d, k) => d.setAttribute('aria-current', String(k === car.i)));
  const next = slideEls()[(car.i + 1) % car.n]?.querySelector('img');
  if (next) next.loading = 'eager';
  startCycle();
};
const renderFeatured = (list) => {
  car.n = list.length;
  car.i = 0;
  slidesEl.innerHTML = list.map((a, i) => slide(a, i, list.length)).join('');
  dotsEl.innerHTML = list.map((a, k) => `<button class="nw-dot" type="button" data-slide="${k}" aria-label="Bài nổi bật ${k + 1}"><span></span></button>`).join('');
  featuredEl.querySelectorAll('[data-car-ctrl]').forEach((c) => { c.hidden = car.n < 2; });
  $('#nw-featured-empty').hidden = car.n > 0;
  go(0);
};
// Bấm chấm chỉ báo: chuyển tới bài tương ứng
featuredEl.addEventListener('click', (event) => {
  const dot = event.target.closest('[data-slide]');
  if (dot) go(Number(dot.dataset.slide));
});
// Tạm dừng: rê chuột · focus bàn phím · chạm giữ · tab ẩn — hết điều kiện thì chạy lại từ đầu chu kỳ
const hold = (key, on) => { if (on) car.holds.add(key); else car.holds.delete(key); startCycle(); };
featuredEl.addEventListener('mouseenter', () => hold('hover', true));
featuredEl.addEventListener('mouseleave', () => hold('hover', false));
featuredEl.addEventListener('focusin', () => hold('focus', true));
featuredEl.addEventListener('focusout', (event) => { if (!featuredEl.contains(event.relatedTarget)) hold('focus', false); });
document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));
// Vuốt ngang trên màn cảm ứng: chuyển bài; chạm giữ: tạm dừng
let touchX = null;
featuredEl.addEventListener('pointerdown', (event) => { if (event.pointerType !== 'mouse') { touchX = event.clientX; hold('touch', true); } });
const endTouch = (event) => {
  if (touchX === null) return;
  const dx = event.clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 40) { car.holds.delete('touch'); go(car.i + (dx < 0 ? 1 : -1)); } else hold('touch', false);
};
featuredEl.addEventListener('pointerup', endTouch);
featuredEl.addEventListener('pointercancel', endTouch);
// Bàn phím: mũi tên trái / phải khi focus trong khối
featuredEl.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') { event.preventDefault(); go(car.i + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(car.i - 1); }
});

// ==================== TIN ĐỌC NHIỀU: không nút ‹ ›; tự chạy liên tục (vẫn vuốt / cuộn tay được) ====================
const popular = $('#nw-popular');
const popularStrip = popular.parentElement;
const stripStep = () => popular.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(popular).columnGap || 0);
const atStripEnd = () => popular.scrollLeft + popular.clientWidth >= popular.scrollWidth - 2;
// ---------- Tự chạy: mỗi 4 giây dịch 1 thẻ, tới cuối dải thì quay về đầu; tạm dừng khi rê chuột / focus / chạm / tab ẩn / giảm chuyển động ----------
const STRIP_MS = 4000;
const strip = { timer: 0, holds: new Set() };
const startStrip = () => {
  clearInterval(strip.timer);
  strip.timer = 0;
  if (reduced() || strip.holds.size) return;
  strip.timer = setInterval(() => {
    if (!popular.firstElementChild || !popular.offsetParent || popular.scrollWidth <= popular.clientWidth + 2) return;
    if (atStripEnd()) popular.scrollTo({ left: 0, behavior: 'smooth' });
    else popular.scrollBy({ left: stripStep(), behavior: 'smooth' });
  }, STRIP_MS);
};
const holdStrip = (key, on) => { if (on) strip.holds.add(key); else strip.holds.delete(key); startStrip(); };
popularStrip.addEventListener('mouseenter', () => holdStrip('hover', true));
popularStrip.addEventListener('mouseleave', () => holdStrip('hover', false));
popularStrip.addEventListener('focusin', () => holdStrip('focus', true));
popularStrip.addEventListener('focusout', (event) => { if (!popularStrip.contains(event.relatedTarget)) holdStrip('focus', false); });
popularStrip.addEventListener('touchstart', () => holdStrip('touch', true), { passive: true });
popularStrip.addEventListener('touchend', () => holdStrip('touch', false), { passive: true });
document.addEventListener('visibilitychange', () => holdStrip('hidden', document.hidden));
startStrip();

// ==================== ĐẦU TRANG: ngày hôm nay ====================
// ---------- Ngày hôm nay: "Thứ Sáu, 13/11/2026" ----------
const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
$('#nw-today').textContent = today.charAt(0).toUpperCase() + today.slice(1);

// ==================== LỌC CHUYÊN MỤC + TÌM KIẾM ====================
// Chọn nhãn: chỉ dựng lại các khối (banner truyền thông giữ nguyên), Nổi bật về bài 1, ghi ?chuyen-muc= vào đường dẫn (chia sẻ / nút Back)
// Tìm kiếm: theo tên bài trong chuyên mục đang chọn, bấm Tìm kiếm / Enter; 2 – 100 ký tự, không phân biệt hoa thường / có dấu
const chips = [...document.querySelectorAll('.nw-chip')];
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const state = { cat: '', q: '' };
const show = (id, on) => { $(id).hidden = !on; };
// Nút Xem tất cả (Tin mới nhất · Tin đọc nhiều · Tin tức khác) → trang danh sách, giữ chuyên mục đang chọn
const listLinks = [...document.querySelectorAll('[data-list-sort]')];
const listUrl = (sort) => {
  const p = new URLSearchParams();
  if (sort !== 'moi-nhat') p.set('sap-xep', sort);
  if (state.cat) p.set('chuyen-muc', state.cat);
  const qs = p.toString();
  return `tin-tuc-danh-sach.html${qs ? `?${qs}` : ''}`;
};
const render = () => {
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === state.cat)));
  listLinks.forEach((link) => { link.href = listUrl(link.dataset.listSort); });
  const data = pick(state.cat);
  const key = fold(state.q.trim());
  const searching = key.length >= 2;
  const noPosts = !data.pool.length;
  // Không có bài trong chuyên mục (NL03a): ẩn từ Nổi bật đến Tin tức khác, hiện TB03; banner truyền thông vẫn hiện
  $('#nw-empty').textContent = noPosts ? 'Chưa có tin tức trong chuyên mục này.' : '';
  show('#nw-empty', noPosts);
  show('#nw-top', !noPosts && !searching);
  show('#nw-popular-section', !noPosts && !searching);
  show('#nw-others-section', !noPosts && !searching);
  show('#nw-results', searching);
  if (searching) {
    stopCycle();
    const found = data.pool.filter((a) => fold(a.title).includes(key)).sort(byNewest);
    $('#nw-results-count').textContent = found.length ? `Tìm thấy ${found.length.toLocaleString('vi-VN')} tin tức cho “${state.q.trim()}”` : `Không tìm thấy tin tức phù hợp với “${state.q.trim()}”. Hãy thử từ khóa khác.`;
    $('#nw-results-list').innerHTML = found.map(otherCard).join('');
    $('#nw-status').textContent = $('#nw-results-count').textContent;
    return;
  }
  $('#nw-status').textContent = '';
  if (noPosts) { stopCycle(); return; }
  renderFeatured(data.featured);
  $('#nw-latest').innerHTML = latestBlock(data.latest);
  popular.innerHTML = data.popular.map(popularCard).join('');
  popular.scrollLeft = 0;
  startStrip();
  show('#nw-popular-empty', !data.popular.length);
  popular.parentElement.hidden = !data.popular.length;
  $('#nw-others').innerHTML = othersBlock(data.others);
  show('#nw-others-empty', !data.others.length);
};
const urlFor = () => {
  const p = new URLSearchParams(location.search);
  if (state.cat) p.set('chuyen-muc', state.cat); else p.delete('chuyen-muc');
  if (state.q.trim().length >= 2) p.set('q', state.q.trim()); else p.delete('q');
  const qs = p.toString();
  return location.pathname + (qs ? `?${qs}` : '');
};
chips.forEach((chip) => chip.addEventListener('click', () => {
  if (chip.dataset.cat === state.cat) return;
  state.cat = chip.dataset.cat;
  history.pushState(null, '', urlFor());
  render();
}));
const hint = $('#nw-status');
$('#nw-search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const q = $('#nw-search').value.trim();
  $('#nw-search').value = q;
  if (q.length === 1) { hint.textContent = 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.'; $('#nw-search').setCustomValidity('Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.'); $('#nw-search').reportValidity(); return; }
  state.q = q;
  history.pushState(null, '', urlFor());
  render();
  if (q) $('#nw-results').scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
});
$('#nw-search').addEventListener('input', () => $('#nw-search').setCustomValidity(''));
$('#nw-clear').addEventListener('click', () => {
  state.q = '';
  $('#nw-search').value = '';
  history.pushState(null, '', urlFor());
  render();
});
// Đọc chuyên mục / từ khóa từ đường dẫn (mở link chia sẻ, nút Back / Forward); giá trị lạ → mặc định
const readUrl = () => {
  const p = new URLSearchParams(location.search);
  const cat = p.get('chuyen-muc') || '';
  state.cat = cat in CATEGORIES ? cat : '';
  state.q = (p.get('q') || '').slice(0, 100);
  $('#nw-search').value = state.q;
};
addEventListener('popstate', () => { readUrl(); render(); });
readUrl();
render();
