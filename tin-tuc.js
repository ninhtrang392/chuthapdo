// ==================== TRANG TIN TỨC ====================
// Đầu trang: tìm kiếm + tab Tất cả · Chiến dịch nhân đạo · Người tốt việc thiện · Đối tác & Đồng hành.
// Tab Tất cả: Tin nổi bật | Tin mới nhất (.news-grid trang chủ) · Tin đọc nhiều (dải ngang .pv-track) · các tin khác theo chuyên mục (.cp-grid / .cp-card trang Chương trình).
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

// ==================== DỮ LIỆU: chuyên mục · bài viết (minh họa) ====================
const CATEGORIES = {
  'chien-dich': 'Chiến dịch nhân đạo',
  'nguoi-tot': 'Người tốt việc thiện',
  'doi-tac': 'Đối tác & Đồng hành',
};
// Ảnh minh họa: Emages/ảnh minh họa/ — focus: điểm giữ khi cắt ảnh
const IMG = {
  traoQuaBenh: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg',
  hienMauSunHa: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg',
  hienMauXuan: 'z765570465791.jpg',
  cuuHoLu: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg',
  thamBaChau: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg',
  traoQuaTanNha: '1358142_gen-h-235_1777566365.jpg',
  choNhanDao: '01 1.jpg',
  traoBienDinhDuong: '3.-028ae9de1f.jpg',
  traoQuaHocSinh: 'trao-qua-hoc-sinh.jpg',
  denTruong: 'tre-em-vung-cao-den-truong.jpg',
  nhanQua: 'tre-em-vung-cao-nhan-qua.jpg',
  nuCuoi: 'tre-em-vung-cao-nu-cuoi.jpg',
  vuiChoi: 'tre-em-vung-cao-vui-choi.jpg',
  langNu: 'Làng nủ 3.jpg',
  langNu2: 'Làng nủ 2.webp',
};
const imgSrc = (key) => encodeURI(`Emages/ảnh minh họa/${IMG[key]}`);

// hot: true → Tin nổi bật (bài mới nhất có hot là bài lớn) · views → xếp hạng Tin đọc nhiều
const ARTICLES = [
  // ---------- Chiến dịch nhân đạo ----------
  { id: 1, hot: true, cat: 'chien-dich', date: '2026-11-03', views: 18420, img: 'cuuHoLu', focus: '60% 50%', alt: 'Lực lượng cứu hộ phát áo phao, nhu yếu phẩm cho người dân vùng ngập lũ',
    title: 'Hội Chữ thập đỏ Việt Nam khẩn cấp hỗ trợ người dân vùng lũ miền Trung',
    desc: 'Hơn 12.000 suất quà gồm nước uống, lương thực, áo phao và thuốc thiết yếu đã được chuyển tới các xã bị chia cắt chỉ trong 72 giờ đầu sau lũ.' },
  { id: 2, cat: 'chien-dich', date: '2026-11-01', views: 9310, img: 'hienMauSunHa', focus: '50% 35%', alt: 'Người dân tham gia ngày hội hiến máu tình nguyện',
    title: 'Ngày hội “Giọt hồng sẻ chia” tiếp nhận hơn 3.000 đơn vị máu',
    desc: 'Ngày hội có khu tư vấn sức khỏe, khám sàng lọc miễn phí và hướng dẫn chăm sóc sau hiến máu cho người tham gia.' },
  { id: 3, cat: 'chien-dich', date: '2026-10-31', views: 7260, img: 'langNu', focus: '50% 50%', alt: 'Người dân vùng sạt lở nhận đồ dùng thiết yếu',
    title: 'Trao đồ dùng thiết yếu cho người dân vùng sạt lở Làng Nủ',
    desc: 'Mỗi hộ được nhận chậu, xô, chăn màn và nhu yếu phẩm để sớm ổn định sinh hoạt sau thiên tai.' },
  { id: 4, cat: 'chien-dich', date: '2026-10-28', views: 12870, img: 'denTruong', focus: '50% 40%', alt: 'Trẻ em vùng cao trên đường đến trường',
    title: 'Tiếp sức đến trường: 1.500 suất học bổng cho học sinh vùng cao',
    desc: 'Mỗi suất gồm cặp sách, áo ấm và học bổng, trao tận tay các em tại điểm trường trước mùa đông.' },
  { id: 5, cat: 'chien-dich', date: '2026-10-26', views: 6540, img: 'nhanQua', focus: '50% 40%', alt: 'Trẻ em vùng cao nhận quà',
    title: 'Trao áo ấm cho học sinh vùng cao trước mùa đông',
    desc: 'Hơn 3.000 chiếc áo ấm, chăn và mũ len được trao tận tay học sinh tại các điểm trường xa trung tâm.' },
  { id: 6, cat: 'chien-dich', date: '2026-10-25', views: 4180, img: 'langNu2', focus: '50% 50%', alt: 'Khu vực bị sạt lở sau mưa lũ',
    title: 'Khảo sát hiện trường, lập kế hoạch tái thiết vùng sạt lở',
    desc: 'Đoàn công tác của Hội cùng chính quyền địa phương khảo sát, xác định vị trí an toàn để xây dựng khu dân cư mới.' },
  { id: 7, cat: 'chien-dich', date: '2026-10-22', views: 10950, img: 'choNhanDao', focus: '50% 45%', alt: 'Cán bộ Chữ thập đỏ trao gạo cho người dân tại gian hàng Chợ nhân đạo',
    title: '“Chợ nhân đạo” lan tỏa tại nhiều địa phương',
    desc: 'Người dân khó khăn được chọn nhu yếu phẩm miễn phí tại các gian hàng gạo, dầu ăn, nước mắm do hội viên vận động.' },

  // ---------- Người tốt việc thiện ----------
  { id: 8, cat: 'nguoi-tot', date: '2026-11-02', views: 8720, img: 'langNu2', focus: '70% 50%', alt: 'Tình nguyện viên giúp người dân dựng lại nhà sau sạt lở',
    title: 'Những tình nguyện viên ở lại Làng Nủ giúp bà con dựng lại nhà',
    desc: 'Suốt ba tuần, nhóm tình nguyện viên trẻ cùng người dân dọn bùn đất, dựng lại nhà tạm và lớp học cho các em nhỏ.' },
  { id: 9, cat: 'nguoi-tot', date: '2026-10-29', views: 5630, img: 'hienMauXuan', focus: '50% 40%', alt: 'Cán bộ Hội tham gia hiến máu tình nguyện',
    title: 'Cán bộ Hội gương mẫu tham gia hiến máu cứu người',
    desc: 'Phong trào được lan tỏa tới các cơ quan, doanh nghiệp, góp phần bổ sung nguồn máu dự trữ cuối năm.' },
  { id: 10, cat: 'nguoi-tot', date: '2026-10-24', views: 14360, img: 'traoQuaHocSinh', focus: '50% 40%', alt: 'Thầy giáo cùng học trò vùng cao',
    title: 'Thầy giáo cắm bản 15 năm “cõng chữ” lên non',
    desc: 'Không chỉ dạy chữ, thầy còn vận động áo ấm, sách vở và bữa trưa cho học trò ở điểm trường xa nhất xã.' },
  { id: 11, cat: 'nguoi-tot', date: '2026-10-18', views: 11240, img: 'thamBaChau', focus: '60% 40%', alt: 'Tình nguyện viên Chữ thập đỏ thăm hỏi bà và cháu nhỏ tại nhà',
    title: 'Nữ tình nguyện viên 10 năm chăm sóc người già neo đơn',
    desc: 'Mỗi tuần, chị dành hai buổi đến thăm, nấu cơm và trò chuyện cùng các cụ già neo đơn trong xã.' },
  { id: 12, cat: 'nguoi-tot', date: '2026-10-15', views: 3920, img: 'traoQuaBenh', focus: '50% 40%', alt: 'Tình nguyện viên Chữ thập đỏ trao quà cho hai em nhỏ',
    title: 'Tập huấn kỹ năng cho đội tình nguyện viên trẻ năm 2026',
    desc: 'Hơn 400 tình nguyện viên được trang bị kỹ năng sơ cấp cứu, tâm lý và tổ chức hoạt động cộng đồng.' },
  { id: 13, cat: 'nguoi-tot', date: '2026-10-05', views: 9870, img: 'hienMauSunHa', focus: '70% 35%', alt: 'Ngày hội hiến máu đông người tham gia',
    title: 'Tôn vinh 100 gương mặt hiến máu tiêu biểu năm 2026',
    desc: 'Nhiều người đã hiến máu trên 30 lần, trở thành tấm gương lan tỏa tinh thần sẻ chia trong cộng đồng.' },
  { id: 14, cat: 'nguoi-tot', date: '2026-10-02', views: 4410, img: 'vuiChoi', focus: '50% 40%', alt: 'Trẻ em vùng cao vui chơi',
    title: 'Người dân góp công xây sân chơi cho trẻ em vùng cao',
    desc: 'Sân chơi gồm cầu trượt, xích đu và góc đọc sách, phục vụ hơn 200 em nhỏ trong bản.' },

  // ---------- Đối tác & Đồng hành ----------
  { id: 15, cat: 'doi-tac', date: '2026-11-02', views: 5280, img: 'hienMauXuan', focus: '80% 50%', alt: 'Người lao động doanh nghiệp tham gia hiến máu',
    title: 'Doanh nghiệp tổ chức ngày hội hiến máu cùng Hội Chữ thập đỏ',
    desc: 'Hơn 600 cán bộ, người lao động đăng ký hiến máu, nhiều người lần đầu tham gia sau khi được tư vấn tại chỗ.' },
  { id: 16, cat: 'doi-tac', date: '2026-10-30', views: 3460, img: 'traoQuaBenh', focus: '30% 40%', alt: 'Trao quà cho trẻ em mắc bệnh tan máu bẩm sinh',
    title: 'Nhà tài trợ đồng hành hỗ trợ trẻ em mắc bệnh tan máu bẩm sinh',
    desc: 'Mỗi em được hỗ trợ chi phí điều trị, quà và học bổng trong suốt năm học 2026 – 2027.' },
  { id: 17, cat: 'doi-tac', date: '2026-10-27', views: 6120, img: 'traoBienDinhDuong', focus: '50% 40%', alt: 'Đại diện Hội Chữ thập đỏ và nhà tài trợ trao tặng biển hỗ trợ cho trường học',
    title: 'Ra mắt dự án “Chăm em đủ chất” cùng nhà tài trợ',
    desc: 'Dự án hỗ trợ bữa ăn dinh dưỡng và tổ chức hoạt động vui học kiến thức dinh dưỡng cho học sinh bán trú.' },
  { id: 18, cat: 'doi-tac', date: '2026-10-20', views: 2970, img: 'traoQuaHocSinh', focus: '50% 40%', alt: 'Doanh nghiệp đồng hành trao quà cho học sinh',
    title: 'Doanh nghiệp đồng hành trao 500 suất quà cho học sinh vượt khó',
    desc: 'Mỗi suất quà gồm sách vở, đồ dùng học tập và học bổng, trao tại các trường trên địa bàn khó khăn.' },
  { id: 19, cat: 'doi-tac', date: '2026-10-10', views: 7740, img: 'nuCuoi', focus: '50% 40%', alt: 'Nụ cười của trẻ em vùng cao',
    title: 'Công bố danh sách nhà hảo tâm, đơn vị đồng hành tháng 9',
    desc: 'Danh sách được cập nhật công khai trên nền tảng để mọi người có thể tra cứu khoản đóng góp của mình.' },
  { id: 20, cat: 'doi-tac', date: '2026-10-08', views: 3150, img: 'traoQuaTanNha', focus: '50% 40%', alt: 'Cán bộ Chữ thập đỏ cùng đơn vị đồng hành trao quà tại nhà dân',
    title: 'Gặp mặt tri ân các đơn vị đồng hành năm 2026',
    desc: 'Hội cảm ơn hơn 120 doanh nghiệp, tổ chức đã đồng hành cùng các chương trình nhân đạo trong năm.' },
];

// ==================== DỰNG BÀI: Tin nổi bật · Tin mới nhất · thẻ bài ====================
const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const viDate = (iso) => iso.split('-').reverse().join('/');
const byNewest = (a, b) => b.date.localeCompare(a.date);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Phần dùng chung: ảnh · dòng meta (chuyên mục · ngày · lượt xem — tùy chọn) · tiêu đề phủ cả bài (.stretched) · tóm tắt ----------
const media = (a, cls) => `<div class="${cls}"${cls.includes('media-photo') ? ` style="--focus:${a.focus}"` : ''}><img src="${imgSrc(a.img)}" alt="${escapeHtml(a.alt)}" loading="lazy" style="object-position:${a.focus}" /></div>`;
const meta = (a, { cat = true, date = true, views = false } = {}) => `<p class="news-meta">${cat ? `<span class="news-cat">${escapeHtml(CATEGORIES[a.cat])}</span>` : ''}${date ? `<time datetime="${a.date}">${viDate(a.date)}</time>` : ''}${views ? `<span>${a.views.toLocaleString('vi-VN')} lượt xem</span>` : ''}</p>`;
const titleLink = (a) => `<a class="stretched" href="#" data-panel="Bài viết">${escapeHtml(a.title)}</a>`;

// ---------- Tin nổi bật: bài lớn (ảnh phủ kín, chữ trắng) — cùng HTML bài lớn khối tin tức trang chủ ----------
const feature = (a) => `
  <article class="news-item news-feature">
    ${media(a, 'media media-photo')}
    <div class="news-body">${meta(a)}<h3 class="news-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p></div>
  </article>`;
// ---------- Tin mới nhất: ảnh nhỏ trái, chữ phải — cùng HTML danh sách khối tin tức trang chủ ----------
const row = (a) => `
  <article class="news-item news-row">
    ${media(a, 'media media-photo')}
    <div class="news-body">${meta(a)}<h3 class="news-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p></div>
  </article>`;
// ---------- Thẻ bài: .cp-card (ảnh trên · ngày · tiêu đề 2 dòng · tóm tắt 2 dòng); Tin đọc nhiều: chuyên mục · lượt xem (không ngày) ----------
const card = (a, opts = { cat: false }) => `
  <article class="cp-card nw-card">
    ${media(a, 'cp-card-media')}
    <div class="cp-card-body">${meta(a, opts)}<h3 class="cp-card-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p></div>
  </article>`;

// ==================== DỰNG TAB + TÌM KIẾM ====================
// Tab Tất cả: Tin nổi bật (1 bài) | Tin mới nhất (4 bài) · Tin đọc nhiều (8 bài nhiều lượt xem nhất) · mỗi chuyên mục 4 bài mới nhất chưa hiện ở trên
// Tab chuyên mục: toàn bộ bài của chuyên mục, mới nhất trước
// Có từ khóa → ẩn Tin nổi bật / Tin mới nhất / Tin đọc nhiều; mỗi chuyên mục chỉ giữ bài khớp (tiêu đề, tóm tắt, tên chuyên mục), mục không còn bài thì ẩn
const LATEST_COUNT = 4;
const POPULAR_COUNT = 8;
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
let query = '';
const render = () => {
  const key = fold(query.trim());
  const match = (a) => !key || fold(`${a.title} ${a.desc} ${CATEGORIES[a.cat]}`).includes(key);
  const sorted = [...ARTICLES].sort(byNewest);
  const hot = sorted.find((a) => a.hot) || sorted[0];
  const latest = sorted.filter((a) => a !== hot).slice(0, LATEST_COUNT);
  const shownTop = new Set([hot, ...latest]);
  $('#nw-hot').innerHTML = feature(hot);
  $('#nw-latest').innerHTML = latest.map(row).join('');
  $('#nw-popular').innerHTML = [...ARTICLES].sort((a, b) => b.views - a.views).slice(0, POPULAR_COUNT).map((a) => card(a, { cat: true, date: false, views: true })).join('');
  $('#nw-top').hidden = Boolean(key);
  $('#nw-popular-section').hidden = Boolean(key);
  document.querySelectorAll('.nw-section[data-cat]').forEach((section) => {
    const full = section.hasAttribute('data-full');
    let list = sorted.filter((a) => a.cat === section.dataset.cat && match(a));
    if (!key && !full) list = list.filter((a) => !shownTop.has(a)).slice(0, 4);
    section.querySelector('.nw-grid').innerHTML = list.map((a) => card(a)).join('');
    section.hidden = !list.length;
  });
  renderPopularDots();
  updateEmpty();
};
// Thông báo kết quả / không có kết quả theo tab đang xem
const updateEmpty = () => {
  const panel = document.querySelector('.nw-panel:not([hidden])');
  const total = panel.querySelectorAll('.nw-section:not([hidden]) article').length;
  const q = query.trim();
  $('#nw-empty').hidden = !q || total > 0;
  $('#nw-status').textContent = q ? (total ? `Tìm thấy ${total} bài viết cho “${q}”` : 'Không tìm thấy bài viết phù hợp') : '';
};

// ---------- Gõ → lọc sau 300ms · bấm Tìm kiếm → lọc ngay và cuộn tới kết quả đầu ----------
let searchTimer;
$('#nw-search').addEventListener('input', (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { query = event.target.value; render(); }, 300);
});
$('#nw-search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  query = $('#nw-search').value;
  render();
  const first = document.querySelector('.nw-panel:not([hidden]) .nw-section:not([hidden])') || $('#nw-empty');
  first.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
});

// ==================== TAB CHUYÊN MỤC: bấm / phím mũi tên đổi tab · Xem tất cả → mở tab chuyên mục · #chien-dich trên URL mở sẵn tab ====================
const tabs = [...document.querySelectorAll('.nw-tabs [role="tab"]')];
const selectTab = (tab, focus = false) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
  const id = tab.id.replace('nw-tab-', '');
  history.replaceState(null, '', id === 'all' ? location.pathname + location.search : `#${id}`);
  renderPopularDots();
  updateEmpty();
};
tabs.forEach((tab) => tab.addEventListener('click', () => selectTab(tab)));
$('.nw-tabs').addEventListener('keydown', (event) => {
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  selectTab(tabs[(next + tabs.length) % tabs.length], true);
});
document.addEventListener('click', (event) => {
  const go = event.target.closest('[data-goto]');
  if (!go) return;
  event.preventDefault();
  selectTab($(`#nw-tab-${go.dataset.goto}`));
  $('.nw-tabs').scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
});

// ==================== TIN ĐỌC NHIỀU: dải thẻ chạy ngang — nút ‹ › · chấm chuyển · tự cuộn 1 thẻ mỗi 10 giây (cách làm của "Các chiến dịch khác" trang chi tiết chương trình) ====================
const AUTO_MS = 10000;
const popular = $('#nw-popular');
const popularDots = $('#nw-popular-dots');
const trackStep = (track) => track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
// Dịch 1 thẻ; hết thì quay về đầu / cuối
const stepTrack = (track, dir) => {
  if (!track.firstElementChild) return;
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  const atStart = track.scrollLeft <= 2;
  const left = dir > 0 ? (atEnd ? 0 : track.scrollLeft + trackStep(track)) : (atStart ? track.scrollWidth : track.scrollLeft - trackStep(track));
  track.scrollTo({ left, behavior: reduced() ? 'auto' : 'smooth' });
};
// Chấm: số chấm = số thẻ − số thẻ trong khung + 1 (đổi theo cỡ màn hình); cuộn → tô chấm; bấm chấm → cuộn tới
const syncPopularDots = () => {
  if (!popular.firstElementChild || !popular.clientWidth) return;
  const i = Math.round(popular.scrollLeft / trackStep(popular));
  [...popularDots.children].forEach((dot, k) => dot.setAttribute('aria-current', String(k === Math.min(i, popularDots.children.length - 1))));
};
function renderPopularDots() {
  if (!popular.firstElementChild || !popular.clientWidth) return;
  const perView = Math.max(1, Math.round(popular.clientWidth / trackStep(popular)));
  const count = Math.max(1, popular.children.length - perView + 1);
  popularDots.hidden = count <= 1;
  if (popularDots.children.length !== count) {
    popularDots.innerHTML = Array.from({ length: count }, (_, k) => `<button class="founders-dot" type="button" data-popular-dot="${k}" aria-controls="nw-popular" aria-label="Vị trí ${k + 1} / ${count}"></button>`).join('');
  }
  syncPopularDots();
}
let popularRaf = 0;
popular.addEventListener('scroll', () => {
  if (popularRaf) return;
  popularRaf = requestAnimationFrame(() => { popularRaf = 0; syncPopularDots(); });
}, { passive: true });
addEventListener('resize', () => renderPopularDots());
document.addEventListener('click', (event) => {
  const carBtn = event.target.closest('[data-car]');
  if (carBtn) stepTrack(document.getElementById(carBtn.dataset.car), Number(carBtn.dataset.carStep));
  const dot = event.target.closest('[data-popular-dot]');
  if (dot) popular.scrollTo({ left: Number(dot.dataset.popularDot) * trackStep(popular), behavior: reduced() ? 'auto' : 'smooth' });
});
// Tự cuộn: dừng khi rê chuột / đang focus trong dải, khi dải đang ẩn (tab khác / đang tìm), tắt khi giảm chuyển động
if (!reduced()) {
  setInterval(() => {
    if (popular.clientWidth && !popular.matches(':hover, :focus-within')) stepTrack(popular, 1);
  }, AUTO_MS);
}

// ==================== KHỞI TẠO: từ khóa trên URL (?q=) · tab theo #chuyên-mục ====================
query = new URLSearchParams(location.search).get('q') || '';
$('#nw-search').value = query;
render();
const startTab = $(`#nw-tab-${location.hash.slice(1)}`);
if (startTab && tabs.includes(startTab)) selectTab(startTab);
