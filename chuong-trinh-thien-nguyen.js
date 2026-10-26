// ==================== TRANG DANH SÁCH CHƯƠNG TRÌNH THIỆN NGUYỆN ====================
// Dữ liệu minh họa — khi triển khai thật, lấy danh sách chương trình đang gây quỹ từ CMS/API.

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

// ==================== DATA: chương trình đang gây quỹ (minh họa) ====================
// id: mã trang chi tiết chuong-trinh.html?id= (chỉ một số chương trình có trang chi tiết minh họa)
// raised / goal: số tiền (đồng) hoặc số lượng theo unit (ví dụ đơn vị máu); days: số ngày còn lại (0 = đã kết thúc)
const IMG = 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/';
const PRIORITY = {
  urgent: { label: 'Khẩn cấp', cls: 'is-urgent' },
  medium: { label: 'Trung bình', cls: 'is-medium' },
  low: { label: 'Thấp', cls: 'is-low' },
};
const PROGRAMS = [
  { title: 'Chung tay xây trường vùng cao Hà Giang', place: 'Hà Giang', priority: 'medium', field: 'Giáo dục & Khuyến học', img: '3.-028ae9de1f.jpg', raised: 3.4e9, goal: 7e9, days: 8 },
  { title: 'Tiếp sức mùa mưa lũ miền Trung 2026', place: 'Quảng Ngãi', priority: 'urgent', field: 'Cứu trợ thiên tai', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 9.2e9, goal: 10e9, days: 12 },
  { title: 'Bữa cơm yêu thương cho bệnh nhân nghèo', place: 'Cao Bằng', priority: 'medium', field: 'Y tế - Sức khỏe', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 225e6, goal: 500e6, days: 20 },
  { title: 'Áo ấm mùa đông cho trẻ em vùng biên giới', place: 'Điện Biên', priority: 'urgent', field: 'Trẻ em - Biên giới', img: 'trao-qua-hoc-sinh.jpg', raised: 400e6, goal: 500e6, days: 5 },
  { title: 'Xây nhà tình thương cho hộ nghèo Bến Tre', place: 'Bến Tre', priority: 'medium', field: 'Sinh kế & Nhà ở', img: '1-1-3-9134.avif', raised: 600e6, goal: 2e9, days: 45 },
  { title: 'Tủ sách cộng đồng cho học sinh vùng sâu', place: 'Cao Bằng', priority: 'medium', field: 'Giáo dục & Khuyến học', img: '01%201.jpg', raised: 110e6, goal: 200e6, days: 18 },
  { title: 'Chuyến xe cứu thương 0 đồng — vững tâm nhân ái', place: 'Quảng Trị', priority: 'low', field: 'Y tế - Sức khỏe', img: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', raised: 275e6, goal: 375e6, days: 30 },
  { title: 'Gây quỹ mở 02 CLB Bảo tồn văn hóa Thái tại 02 điểm trường Mai Sơn', place: 'Sơn La', priority: 'low', field: 'Giáo dục & Khuyến học', img: '1358142_gen-h-235_1777566365.jpg', raised: 1.24e9, goal: 3e9, days: 60 },
  { id: 'lu-lut-mien-trung', title: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung', place: 'Quảng Trị', priority: 'urgent', field: 'Cứu trợ thiên tai', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 1.245e9, goal: 2e9, days: 18 },
  { id: 'nuoc-sach-han-man', title: 'Nước sạch cho người dân vùng hạn mặn', place: 'Vĩnh Long', priority: 'urgent', field: 'Nước sạch & Vệ sinh', img: '1358142_gen-h-235_1777566365.jpg', raised: 410e6, goal: 1.2e9, days: 25 },
  { id: 'tiep-suc-den-truong', title: 'Tiếp sức đến trường vùng cao', place: 'Cao Bằng', priority: 'medium', field: 'Giáo dục & Khuyến học', img: '3.-028ae9de1f.jpg', raised: 328.5e6, goal: 800e6, days: 34 },
  { id: 'hien-mau-mua-he', title: 'Giọt hồng yêu thương — tiếp sức kho máu mùa hè', place: 'Hà Nội', priority: 'medium', field: 'Hiến máu nhân đạo', img: 'z765570465791.jpg', raised: 3120, goal: 5000, unit: 'đơn vị máu', days: 12 },
  { id: 'mai-am-nhan-ai', title: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn', place: 'Tuyên Quang', priority: 'low', field: 'Sinh kế & Nhà ở', img: '1-1-3-9134.avif', raised: 860e6, goal: 1.5e9, days: 40 },
  { title: 'Sơ cấp cứu cộng đồng ven biển', place: 'Quảng Bình', priority: 'medium', field: 'Y tế - Sức khỏe', img: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', raised: 60e6, goal: 150e6, days: 70 },
  { title: 'Nước sạch cho điểm trường vùng cao', place: 'Lào Cai', priority: 'medium', field: 'Nước sạch & Vệ sinh', img: 'trao-qua-hoc-sinh.jpg', raised: 185e6, goal: 420e6, days: 26 },
  { title: 'Phẫu thuật tim cho trẻ em có hoàn cảnh khó khăn', place: 'TP. Hồ Chí Minh', priority: 'urgent', field: 'Y tế - Sức khỏe', img: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', raised: 1.86e9, goal: 3e9, days: 15 },
  { title: 'Học bổng tiếp bước đến trường cho học sinh nghèo vượt khó', place: 'Nghệ An', priority: 'low', field: 'Giáo dục & Khuyến học', img: '3.-028ae9de1f.jpg', raised: 342e6, goal: 600e6, days: 52 },
  { title: 'Xe lăn cho người khuyết tật', place: 'Thái Bình', priority: 'low', field: 'Trợ giúp nhân đạo', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 96e6, goal: 250e6, days: 38 },
  { title: 'Sinh kế cho phụ nữ đơn thân vùng núi', place: 'Nghệ An', priority: 'medium', field: 'Sinh kế & Nhà ở', img: '1358142_gen-h-235_1777566365.jpg', raised: 132e6, goal: 250e6, days: 41 },
  { title: 'Cầu dân sinh cho bà con vùng lũ', place: 'Đà Nẵng', priority: 'urgent', field: 'Cứu trợ thiên tai', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 720e6, goal: 1.8e9, days: 22 },
  { title: 'Bếp ăn 0 đồng tại bệnh viện tuyến tỉnh', place: 'Hà Tĩnh', priority: 'medium', field: 'Trợ giúp nhân đạo', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 210e6, goal: 360e6, days: 28 },
  { title: 'Trung thu cho em vùng cao', place: 'Lai Châu', priority: 'low', field: 'Trẻ em - Biên giới', img: 'trao-qua-hoc-sinh.jpg', raised: 78e6, goal: 120e6, days: 9 },
  { title: 'Giọt máu nghĩa tình mùa thu', place: 'Hà Nội', priority: 'medium', field: 'Hiến máu nhân đạo', img: 'z765570465791.jpg', raised: 1850, goal: 3000, unit: 'đơn vị máu', days: 16 },
  { title: 'Tết nhân ái 2027 cho hộ nghèo', place: 'Hà Tĩnh', priority: 'low', field: 'Trợ giúp nhân đạo', img: '01%201.jpg', raised: 95e6, goal: 400e6, days: 85 },
];
PROGRAMS.forEach((p, i) => { p.order = i; p.pct = Math.round((p.raised / p.goal) * 100); });

// ---------- Định dạng: tiền rút gọn (tỷ / triệu ₫), số lượng theo đơn vị ----------
const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const money = (n) => (n >= 1e9 ? `${nf.format(Math.round(n / 1e7) / 100)} tỷ ₫` : `${nf.format(Math.round(n / 1e6))} triệu ₫`);
const amount = (p, n) => (p.unit ? `${nf.format(n)} ${p.unit}` : money(n));
const fullAmount = (p, n) => (p.unit ? `${nf.format(n)} ${p.unit}` : `${nf.format(n)} ₫`);
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

// ==================== DANH SÁCH: thẻ chương trình · lọc · sắp xếp · phân trang ====================
const PER_PAGE = 8;
const $ = (s) => document.querySelector(s);
const grid = $('#cp-grid');
const pager = $('#cp-pager');
const state = { q: '', priority: '', field: '', place: '', sort: '', page: 1 };
[...new Set(PROGRAMS.map((p) => p.field))].sort((a, b) => a.localeCompare(b, 'vi')).forEach((v) => $('#cp-field').add(new Option(v, v)));
[...new Set(PROGRAMS.map((p) => p.place))].sort((a, b) => a.localeCompare(b, 'vi')).forEach((v) => $('#cp-place').add(new Option(v, v)));

// ---------- Thẻ: ảnh + nhãn mức độ ưu tiên · địa bàn · tên · đã đạt / mục tiêu · thanh tiến độ · Đạt % · Còn N ngày · Ủng hộ ngay ----------
const card = (p) => {
  const pr = PRIORITY[p.priority];
  const href = p.id ? `chuong-trinh.html?id=${p.id}` : '#';
  const panel = p.id ? '' : ` data-panel="${escapeHtml(p.title)}"`;
  const ended = p.days <= 0;
  return `<article class="cp-card">
    <div class="cp-card-media">
      <img src="${IMG}${p.img}" alt="" loading="lazy" />
      <span class="cp-priority ${pr.cls}"><span class="cp-dot" aria-hidden="true"></span>${pr.label}</span>
    </div>
    <div class="cp-card-body">
      <p class="cp-place">${icon('pin')}${escapeHtml(p.place)}</p>
      <h3 class="cp-card-title"><a class="stretched" href="${href}"${panel}>${escapeHtml(p.title)}</a></h3>
      <div class="cp-figures">
        <strong class="cp-raised" title="${fullAmount(p, p.raised)}">${amount(p, p.raised)}</strong>
        <span class="cp-goal" title="Mục tiêu ${fullAmount(p, p.goal)}">${amount(p, p.goal)}</span>
      </div>
      <div class="cp-bar" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(p.pct, 100)}" aria-valuetext="Đã đạt ${p.pct}% mục tiêu"><span style="width:${Math.min(p.pct, 100)}%"></span></div>
      <div class="cp-meta"><span>Đạt ${p.pct}%</span><span>${icon('clock')}${ended ? 'Đã kết thúc' : `Còn ${p.days} ngày`}</span></div>
      <a class="cp-donate" href="${href}"${p.id ? '' : ` data-panel="Ủng hộ chương trình ${escapeHtml(p.title)}"`}>Ủng hộ ngay</a>
    </div>
  </article>`;
};

// ---------- Phân trang: ‹ 1 2 3 4 5 … N › (trang hiện tại nền đỏ) ----------
const pageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
};
const renderPager = (total) => {
  if (total <= 1) { pager.innerHTML = ''; return; }
  const btn = (page, label, attrs = '', cls = '') => `<button class="cp-page-btn${cls}" type="button" data-page="${page}" ${attrs}>${label}</button>`;
  pager.innerHTML = `${btn(state.page - 1, icon('chevron-right'), `aria-label="Trang trước" ${state.page === 1 ? 'disabled' : ''}`, ' is-prev')}
    ${pageList(state.page, total).map((n) => (n === '…' ? '<span class="cp-page-gap" aria-hidden="true">…</span>' : btn(n, n, `aria-label="Trang ${n}" ${n === state.page ? 'aria-current="page"' : ''}`))).join('')}
    ${btn(state.page + 1, icon('chevron-right'), `aria-label="Trang sau" ${state.page === total ? 'disabled' : ''}`)}`;
};

const filtered = () => {
  const q = fold(state.q.trim());
  const rows = PROGRAMS.filter((p) => (!q || fold(`${p.title} ${p.place} ${p.field}`).includes(q))
    && (!state.priority || p.priority === state.priority) && (!state.field || p.field === state.field) && (!state.place || p.place === state.place));
  const sorters = { ending: (a, b) => a.days - b.days, progress: (a, b) => b.pct - a.pct, need: (a, b) => a.pct - b.pct };
  return rows.sort(sorters[state.sort] || ((a, b) => a.order - b.order));
};
const render = ({ scroll = false } = {}) => {
  const rows = filtered();
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  state.page = Math.min(Math.max(1, state.page), pages);
  const slice = rows.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
  grid.innerHTML = slice.map(card).join('');
  $('#cp-empty').hidden = rows.length > 0;
  renderPager(rows.length ? pages : 0);
  $('#cp-status').textContent = rows.length ? `${rows.length} chương trình, trang ${state.page}/${pages}` : 'Không tìm thấy chương trình phù hợp';
  const active = [state.priority, state.field, state.place, state.sort].filter(Boolean).length;
  $('#cp-filter-count').hidden = !active;
  $('#cp-filter-count').textContent = active;
  if (scroll) $('#cp-list-title').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};

// ---------- Tìm kiếm: lọc sau khi ngừng gõ 300 ms; Enter lọc ngay và cuộn tới danh sách ----------
let searchTimer;
$('#cp-search').addEventListener('input', (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.q = event.target.value; state.page = 1; render(); }, 300);
});
$('#cp-search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  state.q = $('#cp-search').value; state.page = 1; render({ scroll: true });
});

// ---------- Bộ lọc: mở / đóng bảng; đổi giá trị thì lọc ngay ----------
$('#cp-filter-toggle').addEventListener('click', () => {
  const open = $('#cp-filters').hidden;
  $('#cp-filters').hidden = !open;
  $('#cp-filter-toggle').setAttribute('aria-expanded', String(open));
});
[['#cp-priority', 'priority'], ['#cp-field', 'field'], ['#cp-place', 'place'], ['#cp-sort', 'sort']].forEach(([sel, key]) => {
  $(sel).addEventListener('change', (event) => { state[key] = event.target.value; state.page = 1; render(); });
});
$('#cp-clear').addEventListener('click', () => {
  Object.assign(state, { priority: '', field: '', place: '', sort: '', page: 1 });
  ['#cp-priority', '#cp-field', '#cp-place', '#cp-sort'].forEach((sel) => { $(sel).value = ''; });
  render();
});
pager.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');
  if (!button || button.disabled) return;
  state.page = Number(button.dataset.page);
  render({ scroll: true });
});

// Từ khóa trên URL (?q=) — ví dụ khi tìm từ trang khác
state.q = new URLSearchParams(location.search).get('q') || '';
$('#cp-search').value = state.q;
render();
