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

// ==================== DANH SÁCH: thẻ chương trình · lọc · sắp xếp · cuộn tải thêm ====================
// Hiện 8 thẻ đầu; cuộn tới cuối lưới thì nạp thêm 8 thẻ (đổi tìm kiếm / bộ lọc thì về lại 8 thẻ đầu)
const PER_LOAD = 8;
// Bản demo: chỉ hiện 8 thẻ, tắt cuộn tải thêm — đổi LOAD_MORE thành true để bật lại
const LOAD_MORE = false;
const $ = (s) => document.querySelector(s);
const grid = $('#cp-grid');
const more = $('#cp-more');
const state = { q: '', priority: '', field: '', place: '', sort: '', shown: 0 };
let rows = [];
[...new Set(PROGRAMS.map((p) => p.field))].sort((a, b) => a.localeCompare(b, 'vi')).forEach((v) => $('#cp-field').add(new Option(v, v)));
[...new Set(PROGRAMS.map((p) => p.place))].sort((a, b) => a.localeCompare(b, 'vi')).forEach((v) => $('#cp-place').add(new Option(v, v)));

const filtered = () => {
  const q = fold(state.q.trim());
  const list = PROGRAMS.filter((p) => (!q || fold(`${p.title} ${p.place} ${p.field}`).includes(q))
    && (!state.priority || p.priority === state.priority) && (!state.field || p.field === state.field) && (!state.place || p.place === state.place));
  const sorters = { ending: (a, b) => a.days - b.days, progress: (a, b) => b.pct - a.pct, need: (a, b) => a.pct - b.pct };
  // Thứ tự mặc định: chương trình Khẩn cấp lên đầu, sau đó theo thứ tự gốc
  const urgentFirst = (a, b) => (b.priority === 'urgent') - (a.priority === 'urgent') || a.order - b.order;
  return list.sort(sorters[state.sort] || urgentFirst);
};

// ---------- Cuộn tải thêm: nối 8 thẻ tiếp theo vào cuối lưới; còn thẻ thì theo dõi lại điểm mốc #cp-more ----------
const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) loadMore();
}, { rootMargin: '0px 0px 300px 0px' });
const loadMore = () => {
  const next = rows.slice(state.shown, state.shown + PER_LOAD);
  if (!next.length) return;
  grid.insertAdjacentHTML('beforeend', next.map((p) => programCard(p)).join(''));
  state.shown += next.length;
  $('#cp-status').textContent = `Đang hiển thị ${state.shown}/${rows.length} chương trình`;
  // Theo dõi lại để màn hình cao (điểm mốc vẫn trong khung nhìn) tiếp tục nạp cho tới khi hết
  observer.unobserve(more);
  if (LOAD_MORE && state.shown < rows.length) observer.observe(more);
};

const render = ({ scroll = false } = {}) => {
  rows = filtered();
  state.shown = 0;
  grid.innerHTML = '';
  $('#cp-empty').hidden = rows.length > 0;
  $('#cp-status').textContent = 'Không tìm thấy chương trình phù hợp';
  loadMore();
  if (scroll) $('#cp-list-title').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};

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

// ---------- Bộ lọc (luôn hiện dưới ô tìm kiếm): đổi giá trị thì lọc ngay ----------
[['#cp-priority', 'priority'], ['#cp-field', 'field'], ['#cp-place', 'place'], ['#cp-sort', 'sort']].forEach(([sel, key]) => {
  $(sel).addEventListener('change', (event) => { state[key] = event.target.value; render(); });
});

// Từ khóa trên URL (?q=) — ví dụ khi tìm từ trang khác
state.q = new URLSearchParams(location.search).get('q') || '';
$('#cp-search').value = state.q;
render();
