// ==================== TRANG DANH SÁCH TIN TỨC (tin-tuc-danh-sach.html) ====================
// Mở từ các nút "Xem tất cả" của trang Tin tức / chi tiết bài. Dữ liệu chung: tin-tuc-data.js (CATEGORIES, ARTICLES, byNewest, otherCard…).
// Đường dẫn: ?chuyen-muc= · ?thoi-gian= (&tu= &den=) · ?q= · ?sap-xep=moi-nhat (mặc định) | cu-nhat | xem-nhieu · ?so-tin=16 · ?trang=

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

// ==================== DANH SÁCH: bộ lọc · sắp xếp · số tin / trang · phân trang (SRS 3.3 · BR-DL-01 → 10) ====================
// Phạm vi (BR-DL-01): mọi bài đã đăng (ngày đăng ≤ hôm nay), kể cả bài đang là Tin tức nổi bật.
// Chuyên mục · Thời gian đăng · Từ khóa kết hợp VÀ; đổi điều kiện / sắp xếp / số tin thì về trang 1, không tải lại trang (BR-DL-02)
const TITLES = { 'moi-nhat': 'Tin mới nhất', 'cu-nhat': 'Tin cũ nhất', 'xem-nhieu': 'Tin đọc nhiều' }; // tiêu đề khối theo cách sắp xếp
const SORTS = {
  'moi-nhat': byNewest,
  'cu-nhat': (a, b) => a.at.localeCompare(b.at),
  'xem-nhieu': (a, b) => b.views - a.views || byNewest(a, b),
};
const SORT_ALIAS = { 'doc-nhieu': 'xem-nhieu' }; // đường dẫn cũ
const PER_PAGES = [16]; // BR-DL-06: hiện chỉ 16 (mặc định)
const TIMES = ['7-ngay', '30-ngay', '3-thang', 'nam-nay', 'khac'];
const DEFAULTS = { cat: '', time: '', from: '', to: '', q: '', sort: 'moi-nhat', per: 16, page: 1 };
const state = { ...DEFAULTS };
const list = $('#nw-list');
const pager = $('#nw-pager');
const catButtons = [...document.querySelectorAll('.nw-chip')];
const timeSelect = $('#nw-time');
const fromInput = $('#nw-from');
const toInput = $('#nw-to');
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

// ---------- Ngày: chuỗi yyyy-mm-dd theo giờ máy ----------
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const TODAY = ymd(new Date());
const isYmd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
fromInput.max = TODAY;
toInput.max = TODAY;

// ---------- Thời gian đăng → khoảng ngày [từ, đến] (BR-DL-03); "Khác" sai khoảng → NL13 (không lọc theo ngày) ----------
const dateRange = () => {
  const now = new Date();
  const back = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return ymd(d); };
  switch (state.time) {
    case '7-ngay': return [back(6), TODAY];
    case '30-ngay': return [back(29), TODAY];
    case '3-thang': { const d = new Date(now); d.setMonth(d.getMonth() - 3); return [ymd(d), TODAY]; }
    case 'nam-nay': return [`${now.getFullYear()}-01-01`, TODAY];
    case 'khac': return state.from && state.to && !rangeError() ? [state.from, state.to] : null;
    default: return null;
  }
};
const rangeError = () => {
  if (state.time !== 'khac' || !state.from || !state.to) return '';
  if (state.to < state.from) return 'Đến ngày phải bằng hoặc sau Từ ngày.';
  if (state.to > TODAY || state.from > TODAY) return 'Không chọn ngày sau hôm nay.';
  return '';
};

// ---------- Lọc + sắp xếp ----------
const filtered = () => {
  const range = dateRange();
  const key = fold(state.q);
  return ARTICLES
    .filter((a) => a.at.slice(0, 10) <= TODAY) // BR-DL-01: không hiện bài hẹn giờ đăng sau hôm nay
    .filter((a) => !state.cat || a.cat === state.cat)
    .filter((a) => !range || (a.at.slice(0, 10) >= range[0] && a.at.slice(0, 10) <= range[1]))
    .filter((a) => !key || fold(a.title).includes(key))
    .sort(SORTS[state.sort]);
};

// ---------- Phân trang: chỉ số trang 1 2 3 … (giống trang danh sách Ủng hộ) — 1 trang thì ẩn ----------
const pagerHtml = (current, pages) => {
  if (pages <= 1) return '';
  const numbers = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - current) <= 1) numbers.push(i);
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
  }
  return `<div class="pf-pages">
    ${numbers.map((n) => (n === '…' ? '<span aria-hidden="true">…</span>'
      : `<button class="pf-page-btn" type="button" data-page="${n}" ${n === current ? 'aria-current="page"' : ''} aria-label="Trang ${n}">${n}</button>`)).join('')}
  </div>`;
};

// ---------- Vẽ: đồng bộ ô điều khiển với state · thẻ của trang · số kết quả · phân trang ----------
const render = ({ scroll = false } = {}) => {
  const rows = filtered();
  const pages = Math.max(1, Math.ceil(rows.length / state.per));
  if (state.page > pages || state.page < 1) state.page = 1; // BR-DL-10: trang vượt quá → mặc định
  const start = (state.page - 1) * state.per;
  catButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)));
  const title = TITLES[state.sort];
  $('#nw-list-title').textContent = state.cat ? `${title} · ${CATEGORIES[state.cat]}` : title;
  document.title = `${title} | Hội Chữ thập đỏ Việt Nam`;
  timeSelect.value = state.time;
  const custom = state.time === 'khac';
  fromInput.disabled = !custom;
  toInput.disabled = !custom;
  fromInput.value = custom ? state.from : '';
  toInput.value = custom ? state.to : '';
  $('#nw-date-range').classList.toggle('is-disabled', !custom);
  const err = rangeError();
  $('#nw-date-error').textContent = err;
  $('#nw-date-error').hidden = !err;
  $('#nw-q').value = state.q;
  $('#nw-sort').value = state.sort;
  list.innerHTML = rows.slice(start, start + state.per).map(otherCard).join('');
  $('#nw-list-empty').hidden = rows.length > 0;
  $('#nw-list-count').textContent = `Tìm thấy ${rows.length.toLocaleString('vi-VN')} tin tức`;
  pager.innerHTML = pagerHtml(state.page, pages);
  if (scroll) $('#nw-list-title').scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
};

// ---------- Đường dẫn (BR-DL-09, 10): ghi mọi điều kiện; mở link / Back / Forward đọc lại; giá trị lạ → mặc định ----------
const urlFor = () => {
  const p = new URLSearchParams();
  if (state.cat) p.set('chuyen-muc', state.cat);
  if (state.time) p.set('thoi-gian', state.time);
  if (state.time === 'khac' && state.from) p.set('tu', state.from);
  if (state.time === 'khac' && state.to) p.set('den', state.to);
  if (state.q) p.set('q', state.q);
  if (state.sort !== DEFAULTS.sort) p.set('sap-xep', state.sort);
  if (state.per !== DEFAULTS.per) p.set('so-tin', state.per);
  if (state.page > 1) p.set('trang', state.page);
  const qs = p.toString();
  return location.pathname + (qs ? `?${qs}` : '');
};
const readUrl = () => {
  const p = new URLSearchParams(location.search);
  const pick = (value, ok, fallback) => (ok(value) ? value : fallback);
  const sort = SORT_ALIAS[p.get('sap-xep')] || p.get('sap-xep');
  const q = (p.get('q') || '').trim().slice(0, 100);
  Object.assign(state, {
    cat: pick(p.get('chuyen-muc'), (v) => v in CATEGORIES, ''),
    time: pick(p.get('thoi-gian'), (v) => TIMES.includes(v), ''),
    from: pick(p.get('tu'), isYmd, ''),
    to: pick(p.get('den'), isYmd, ''),
    q: q.length >= 2 ? q : '',
    sort: pick(sort, (v) => v in SORTS, DEFAULTS.sort),
    per: pick(Number(p.get('so-tin')), (v) => PER_PAGES.includes(v), DEFAULTS.per),
    page: Number.parseInt(p.get('trang'), 10) || 1,
  });
};
const go = (patch, opts) => {
  Object.assign(state, patch);
  render(opts);
  history.pushState(null, '', urlFor());
};

// ---------- Sự kiện bộ lọc ----------
catButtons.forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.cat !== state.cat) go({ cat: b.dataset.cat, page: 1 });
}));
// Thời gian đăng: đổi từ "Khác" sang mục khác thì xóa khoảng ngày đã chọn
timeSelect.addEventListener('change', () => go({ time: timeSelect.value, from: '', to: '', page: 1 }));
// Khác: lọc khi đã chọn đủ Từ ngày + Đến ngày; sai khoảng → báo lỗi (NL13), chưa lọc theo ngày
const onDate = () => go({ from: fromInput.value, to: toInput.value, page: 1 });
fromInput.addEventListener('change', onDate);
toInput.addEventListener('change', onDate);
// Tìm kiếm: bấm kính lúp / Enter; < 2 ký tự → báo (NL14); xóa hết rồi tìm → bỏ điều kiện từ khóa
$('#nw-list-search').addEventListener('submit', (event) => {
  event.preventDefault();
  const q = $('#nw-q').value.trim().slice(0, 100);
  $('#nw-q').value = q;
  const short = q.length === 1;
  $('#nw-q-error').textContent = short ? 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.' : '';
  $('#nw-q-error').hidden = !short;
  if (!short) go({ q, page: 1 });
});
$('#nw-q').addEventListener('input', () => { $('#nw-q-error').hidden = true; });
$('#nw-sort').addEventListener('change', (event) => go({ sort: event.target.value, page: 1 }));
// Phân trang: đổi trang → cuộn về đầu danh sách, giữ nguyên bộ lọc
pager.addEventListener('click', (event) => {
  const button = event.target.closest('.pf-page-btn');
  if (button && !button.disabled) go({ page: Number(button.dataset.page) }, { scroll: true });
});
window.addEventListener('popstate', () => { readUrl(); render(); });

readUrl();
render();
history.replaceState(null, '', urlFor());
