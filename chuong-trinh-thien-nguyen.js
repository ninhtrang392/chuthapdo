// ==================== TRANG DANH SÁCH CHƯƠNG TRÌNH THIỆN NGUYỆN ====================
// Dữ liệu minh họa dùng chung với trang chi tiết (chuong-trinh-data.js).

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

// Dữ liệu chương trình (PROGRAMS), định dạng và thẻ chương trình (programCard): chuong-trinh-data.js

// ==================== DANH SÁCH: thẻ chương trình · lọc · sắp xếp · phân trang ====================
// Mỗi trang PER_PAGE thẻ; đổi tìm kiếm / bộ lọc thì về trang 1. Phân trang dùng lại .pf-pager / .pf-page-btn (bảng danh sách), quá nhiều trang thì rút gọn “…”
const PER_PAGE = 8;
const $ = (s) => document.querySelector(s);
const grid = $('#cp-grid');
const pager = $('#cp-pager');
// Bộ lọc chọn nhiều: mỗi ô là 1 mảng giá trị (rỗng = tất cả)
const state = { q: '', priority: [], field: [], place: [], owner: [], sort: '', page: 1 };
let rows = [];
[...new Set(PROGRAMS.map((p) => p.field))].sort((a, b) => a.localeCompare(b, 'vi')).forEach((v) => $('#cp-field').add(new Option(v, v)));
[...new Set(PROGRAMS.map((p) => p.place))].sort((a, b) => a.localeCompare(b, 'vi')).forEach((v) => $('#cp-place').add(new Option(v, v)));

const filtered = () => {
  const q = fold(state.q.trim());
  const list = PROGRAMS.filter((p) => (!q || fold(`${p.title} ${p.place} ${p.field}`).includes(q))
    && (!state.priority.length || state.priority.includes(p.priority)) && (!state.field.length || state.field.includes(p.field))
    && (!state.place.length || state.place.includes(p.place)) && (!state.owner.length || state.owner.includes(p.owner.group)));
  const sorters = { ending: (a, b) => a.days - b.days, progress: (a, b) => b.pct - a.pct, need: (a, b) => a.pct - b.pct };
  // Thứ tự mặc định: chương trình Khẩn cấp lên đầu, sau đó theo thứ tự gốc
  const urgentFirst = (a, b) => (b.priority === 'urgent') - (a.priority === 'urgent') || a.order - b.order;
  return list.sort(sorters[state.sort] || urgentFirst);
};

// ---------- Phân trang: chỉ số trang 1 2 3 … (không mũi tên) — 1 trang thì ẩn ----------
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

// ---------- Vẽ trang hiện tại: thẻ của trang + thanh phân trang; reset = lọc lại từ đầu (về trang 1) ----------
const render = ({ scroll = false, reset = true } = {}) => {
  if (reset) { rows = filtered(); state.page = 1; }
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  state.page = Math.min(Math.max(state.page, 1), pages);
  const start = (state.page - 1) * PER_PAGE;
  const shown = rows.slice(start, start + PER_PAGE);
  grid.innerHTML = shown.map((p) => programCard(p)).join('');
  pager.innerHTML = pagerHtml(state.page, pages);
  $('#cp-empty').hidden = rows.length > 0;
  $('#cp-status').textContent = rows.length
    ? `Trang ${state.page}/${pages} — hiển thị ${start + 1}–${start + shown.length} trong ${rows.length} chương trình`
    : 'Không tìm thấy chương trình phù hợp';
  if (scroll) $('#cp-list-title').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};
pager.addEventListener('click', (event) => {
  const button = event.target.closest('.pf-page-btn');
  if (!button || button.disabled) return;
  state.page = Number(button.dataset.page);
  render({ scroll: true, reset: false });
});

// ---------- Tìm kiếm: lọc sau khi ngừng gõ 300 ms; Enter lọc ngay và cuộn tới danh sách ----------
let searchTimer;
$('#cp-search').addEventListener('input', (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.q = event.target.value; render(); }, 300);
});
$('#cp-search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  state.q = $('#cp-search').value; render({ scroll: true });
});

// ---------- Bộ lọc chọn nhiều (dưới ô tìm kiếm: mức độ · lĩnh vực · địa bàn · đối tượng) ----------
// Mỗi <select> trong HTML được thay bằng nút (dùng lại .pf-input) + danh sách ô tích (dùng lại .pf-multi-list của hồ sơ):
// mục đầu "Tất cả …" = bỏ chọn hết; tích / bỏ tích là lọc ngay. Nút hiện: chưa chọn → "Tất cả …" · 1 mục → tên mục · nhiều → "tên đầu +N".
// Bàn phím: Enter / Space / ↓ mở · ↑ ↓ di chuyển · Enter / Space tích · Esc đóng. Bấm ra ngoài → đóng.
let openMulti = null;
const multiFilter = (select, key) => {
  const label = select.closest('.cp-field').querySelector('.visually-hidden').textContent;
  const allText = select.options[0].text;
  const items = [...select.options].slice(1).map((o) => ({ value: o.value, text: o.text }));
  const id = `${select.id}-list`;
  const wrap = document.createElement('div');
  wrap.className = 'cp-field cp-multi';
  wrap.innerHTML = `<button class="pf-input cp-multi-btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}" aria-label="${escapeHtml(label)}: ${escapeHtml(allText)}"><span class="cp-multi-text">${escapeHtml(allText)}</span>${icon('chevron-down', 'icon pf-caret')}</button>
    <ul class="pf-multi-list cp-multi-list" id="${id}" role="listbox" aria-multiselectable="true" aria-label="${escapeHtml(label)}" hidden>
      <li role="option" tabindex="-1" data-value="" aria-selected="true">${escapeHtml(allText)}</li>
      ${items.map((it) => `<li role="option" tabindex="-1" data-value="${escapeHtml(it.value)}" aria-selected="false">${escapeHtml(it.text)}</li>`).join('')}
    </ul>`;
  select.closest('.cp-field').replaceWith(wrap);
  const btn = wrap.querySelector('.cp-multi-btn');
  const list = wrap.querySelector('.cp-multi-list');
  const options = [...list.children];
  const sync = () => {
    const picked = state[key];
    options.forEach((li) => li.setAttribute('aria-selected', String(li.dataset.value ? picked.includes(li.dataset.value) : !picked.length)));
    const names = items.filter((it) => picked.includes(it.value)).map((it) => it.text);
    const text = !names.length ? allText : names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
    wrap.querySelector('.cp-multi-text').textContent = text;
    btn.classList.toggle('is-picked', names.length > 0);
    btn.setAttribute('aria-label', `${label}: ${names.length ? names.join(', ') : allText}`);
  };
  const close = (focusBtn) => {
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (openMulti === close) openMulti = null;
    if (focusBtn) btn.focus();
  };
  const open = () => {
    if (openMulti && openMulti !== close) openMulti();
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    openMulti = close;
    (options.find((li) => li.getAttribute('aria-selected') === 'true') || options[0]).focus();
  };
  const toggle = (li) => {
    const v = li.dataset.value;
    state[key] = !v ? [] : state[key].includes(v) ? state[key].filter((x) => x !== v) : [...state[key], v];
    sync();
    render();
  };
  btn.addEventListener('click', () => (list.hidden ? open() : close()));
  btn.addEventListener('keydown', (event) => { if (event.key === 'ArrowDown') { event.preventDefault(); open(); } });
  list.addEventListener('click', (event) => { const li = event.target.closest('li'); if (li) toggle(li); });
  list.addEventListener('keydown', (event) => {
    const i = options.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); options[(i + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus(); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (i >= 0) toggle(options[i]); }
    else if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (event.key === 'Tab') close();
  });
  sync();
};
[['#cp-priority', 'priority'], ['#cp-field', 'field'], ['#cp-place', 'place'], ['#cp-owner', 'owner']].forEach(([sel, key]) => multiFilter($(sel), key));
document.addEventListener('click', (event) => { if (openMulti && !event.target.closest('.cp-multi')) openMulti(); });

// ---------- Sắp xếp (đầu danh sách, chọn 1): đổi là sắp xếp lại ngay ----------
$('#cp-sort').addEventListener('change', (event) => { state.sort = event.target.value; render(); });

// Từ khóa trên URL (?q=) — ví dụ khi tìm từ trang khác
state.q = new URLSearchParams(location.search).get('q') || '';
$('#cp-search').value = state.q;
render();
