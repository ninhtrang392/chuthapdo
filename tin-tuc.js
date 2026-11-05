// ==================== TRANG TIN TỨC ====================
// Một trang chia chuyên mục: Tin nổi bật (.news-grid trang chủ) + mỗi chuyên mục 1 lưới 4 thẻ (.cp-grid / .cp-card trang Chương trình).
// DỮ LIỆU MINH HỌA — bài viết, ảnh, ngày đăng lấy từ CMS khi có hệ thống chính thức.

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
  'hoat-dong': 'Hoạt động Hội',
  'cuu-tro': 'Cứu trợ thiên tai',
  'hien-mau': 'Hiến máu',
  'an-sinh': 'An sinh xã hội',
  'minh-bach': 'Minh bạch',
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

// hot: true → khối Tin nổi bật (bài đầu tiên là bài lớn), không lặp lại ở lưới chuyên mục
const ARTICLES = [
  { hot: true, cat: 'cuu-tro', date: '2026-11-03', img: 'cuuHoLu', focus: '60% 50%', alt: 'Lực lượng cứu hộ phát áo phao, nhu yếu phẩm cho người dân vùng ngập lũ',
    title: 'Hội Chữ thập đỏ Việt Nam khẩn cấp hỗ trợ người dân vùng lũ miền Trung',
    desc: 'Hơn 12.000 suất quà gồm nước uống, lương thực, áo phao và thuốc thiết yếu đã được chuyển tới các xã bị chia cắt chỉ trong 72 giờ đầu sau lũ.' },
  { hot: true, cat: 'hien-mau', date: '2026-11-01', img: 'hienMauSunHa', focus: '50% 35%', alt: 'Người dân tham gia ngày hội hiến máu tình nguyện',
    title: 'Ngày hội “Giọt hồng sẻ chia” tiếp nhận hơn 3.000 đơn vị máu',
    desc: 'Ngày hội có khu tư vấn sức khỏe, khám sàng lọc miễn phí và hướng dẫn chăm sóc sau hiến máu cho người tham gia.' },
  { hot: true, cat: 'minh-bach', date: '2026-10-30', img: 'traoQuaTanNha', focus: '50% 40%', alt: 'Cán bộ Chữ thập đỏ trao quà cho người dân tại nhà',
    title: 'Công khai sao kê đợt 3 chương trình khắc phục lũ lụt miền Trung',
    desc: 'Toàn bộ khoản thu, chi và danh sách hộ nhận hỗ trợ được công bố chi tiết theo từng xã để người dân và nhà hảo tâm cùng theo dõi.' },
  { hot: true, cat: 'an-sinh', date: '2026-10-28', img: 'denTruong', focus: '50% 40%', alt: 'Trẻ em vùng cao trên đường đến trường',
    title: 'Tiếp sức đến trường: 1.500 suất học bổng cho học sinh vùng cao',
    desc: 'Mỗi suất gồm cặp sách, áo ấm và học bổng, trao tận tay các em tại điểm trường trước mùa đông.' },

  // ---------- Hoạt động Hội ----------
  { cat: 'hoat-dong', date: '2026-10-27', img: 'traoBienDinhDuong', focus: '50% 40%', alt: 'Đại diện Hội Chữ thập đỏ và nhà tài trợ trao tặng biển hỗ trợ cho trường học',
    title: 'Ra mắt dự án “Chăm em đủ chất” tại các trường bán trú vùng cao',
    desc: 'Dự án hỗ trợ bữa ăn dinh dưỡng và tổ chức hoạt động vui học kiến thức dinh dưỡng cho học sinh bán trú.' },
  { cat: 'hoat-dong', date: '2026-10-22', img: 'choNhanDao', focus: '50% 45%', alt: 'Cán bộ Chữ thập đỏ trao gạo cho người dân tại gian hàng Chợ nhân đạo',
    title: '“Chợ nhân đạo” lan tỏa tại nhiều địa phương',
    desc: 'Người dân khó khăn được chọn nhu yếu phẩm miễn phí tại các gian hàng gạo, dầu ăn, nước mắm do hội viên vận động.' },
  { cat: 'hoat-dong', date: '2026-10-15', img: 'traoQuaBenh', focus: '50% 40%', alt: 'Tình nguyện viên Chữ thập đỏ trao quà cho hai em nhỏ',
    title: 'Tập huấn kỹ năng cho đội tình nguyện viên trẻ năm 2026',
    desc: 'Hơn 400 tình nguyện viên được trang bị kỹ năng sơ cấp cứu, tâm lý và tổ chức hoạt động cộng đồng.' },
  { cat: 'hoat-dong', date: '2026-10-08', img: 'thamBaChau', focus: '50% 40%', alt: 'Cán bộ Chữ thập đỏ thăm hỏi bà và cháu nhỏ tại nhà',
    title: 'Hội nghị tổng kết công tác nhân đạo quý III năm 2026',
    desc: 'Hội nghị đánh giá kết quả triển khai các chương trình trọng điểm và đề ra kế hoạch cho những tháng cuối năm.' },

  // ---------- Cứu trợ thiên tai ----------
  { cat: 'cuu-tro', date: '2026-10-31', img: 'langNu', focus: '50% 50%', alt: 'Người dân vùng sạt lở nhận đồ dùng thiết yếu',
    title: 'Trao đồ dùng thiết yếu cho người dân vùng sạt lở Làng Nủ',
    desc: 'Mỗi hộ được nhận chậu, xô, chăn màn và nhu yếu phẩm để sớm ổn định sinh hoạt sau thiên tai.' },
  { cat: 'cuu-tro', date: '2026-10-25', img: 'langNu2', focus: '50% 50%', alt: 'Khu vực bị sạt lở sau mưa lũ',
    title: 'Khảo sát hiện trường, lập kế hoạch tái thiết vùng sạt lở',
    desc: 'Đoàn công tác của Hội cùng chính quyền địa phương khảo sát, xác định vị trí an toàn để xây dựng khu dân cư mới.' },
  { cat: 'cuu-tro', date: '2026-10-19', img: 'cuuHoLu', focus: '30% 50%', alt: 'Lực lượng cứu hộ hỗ trợ người dân vùng ngập',
    title: 'Diễn tập ứng phó thiên tai cho đội ứng phó khẩn cấp cấp tỉnh',
    desc: 'Buổi diễn tập mô phỏng tình huống lũ quét, sơ tán dân và cấp phát hàng cứu trợ tại điểm tập kết.' },
  { cat: 'cuu-tro', date: '2026-10-11', img: 'choNhanDao', focus: '70% 50%', alt: 'Người dân nhận gạo cứu trợ',
    title: 'Chuẩn bị sẵn 50 tấn hàng dự phòng cho mùa mưa bão',
    desc: 'Kho hàng dự phòng tại các khu vực trọng điểm luôn sẵn sàng xuất cấp trong vòng 24 giờ khi có thiên tai.' },

  // ---------- Hiến máu tình nguyện ----------
  { cat: 'hien-mau', date: '2026-10-29', img: 'hienMauXuan', focus: '50% 40%', alt: 'Cán bộ Hội tham gia hiến máu tình nguyện',
    title: 'Cán bộ Hội gương mẫu tham gia hiến máu cứu người',
    desc: 'Phong trào được lan tỏa tới các cơ quan, doanh nghiệp, góp phần bổ sung nguồn máu dự trữ cuối năm.' },
  { cat: 'hien-mau', date: '2026-10-20', img: 'hienMauSunHa', focus: '30% 40%', alt: 'Người hiến máu tại điểm tiếp nhận',
    title: 'Lịch hiến máu tình nguyện tháng 11 tại các điểm cố định',
    desc: 'Danh sách điểm tiếp nhận, khung giờ và lưu ý trước khi hiến máu để người dân chủ động sắp xếp thời gian.' },
  { cat: 'hien-mau', date: '2026-10-12', img: 'hienMauXuan', focus: '80% 50%', alt: 'Người hiến máu đang được nhân viên y tế hỗ trợ',
    title: 'Hiến máu đúng cách: những điều cần biết trước và sau khi hiến',
    desc: 'Ăn nhẹ, ngủ đủ giấc, uống nhiều nước và nghỉ ngơi tại chỗ ít nhất 10 phút sau khi hiến là những lưu ý quan trọng.' },
  { cat: 'hien-mau', date: '2026-10-05', img: 'hienMauSunHa', focus: '70% 35%', alt: 'Ngày hội hiến máu đông người tham gia',
    title: 'Tôn vinh 100 gương mặt hiến máu tiêu biểu năm 2026',
    desc: 'Nhiều người đã hiến máu trên 30 lần, trở thành tấm gương lan tỏa tinh thần sẻ chia trong cộng đồng.' },

  // ---------- An sinh xã hội ----------
  { cat: 'an-sinh', date: '2026-10-26', img: 'nhanQua', focus: '50% 40%', alt: 'Trẻ em vùng cao nhận quà',
    title: 'Trao áo ấm cho học sinh vùng cao trước mùa đông',
    desc: 'Hơn 3.000 chiếc áo ấm, chăn và mũ len được trao tận tay học sinh tại các điểm trường xa trung tâm.' },
  { cat: 'an-sinh', date: '2026-10-18', img: 'thamBaChau', focus: '60% 40%', alt: 'Cán bộ Chữ thập đỏ thăm hỏi gia đình khó khăn',
    title: 'Trao quà, nhu yếu phẩm tận nhà cho các hộ neo đơn',
    desc: 'Mỗi suất quà gồm gạo, nhu yếu phẩm và tiền mặt, được cán bộ Hội trao tận tay từng gia đình neo đơn.' },
  { cat: 'an-sinh', date: '2026-10-09', img: 'traoQuaHocSinh', focus: '50% 40%', alt: 'Trao quà cho học sinh',
    title: 'Khai giảng lớp học tình thương cho trẻ em có hoàn cảnh đặc biệt',
    desc: 'Lớp học do tình nguyện viên đứng lớp, giúp các em được học chữ, học kỹ năng sống miễn phí.' },
  { cat: 'an-sinh', date: '2026-10-02', img: 'vuiChoi', focus: '50% 40%', alt: 'Trẻ em vùng cao vui chơi',
    title: 'Sân chơi mới cho trẻ em vùng cao từ nguồn đóng góp cộng đồng',
    desc: 'Sân chơi gồm cầu trượt, xích đu và góc đọc sách, phục vụ hơn 200 em nhỏ trong bản.' },

  // ---------- Công khai – Minh bạch ----------
  { cat: 'minh-bach', date: '2026-10-24', img: 'nuCuoi', focus: '50% 40%', alt: 'Nụ cười của trẻ em vùng cao',
    title: 'Báo cáo thu chi chương trình “Tiếp sức đến trường” tháng 10',
    desc: 'Chi tiết các khoản tiếp nhận, giải ngân và danh sách điểm trường được hỗ trợ trong tháng.' },
  { cat: 'minh-bach', date: '2026-10-16', img: 'traoQuaTanNha', focus: '40% 40%', alt: 'Trao quà hỗ trợ tại nhà dân',
    title: 'Kết quả kiểm tra, giám sát việc sử dụng nguồn đóng góp quý III',
    desc: 'Đoàn kiểm tra đã làm việc tại các địa phương, đối chiếu chứng từ và gặp gỡ trực tiếp người nhận hỗ trợ.' },
  { cat: 'minh-bach', date: '2026-10-10', img: 'traoBienDinhDuong', focus: '60% 40%', alt: 'Lễ trao tặng kinh phí hỗ trợ trường học',
    title: 'Công bố danh sách nhà hảo tâm, đơn vị đồng hành tháng 9',
    desc: 'Danh sách được cập nhật công khai trên nền tảng để mọi người có thể tra cứu khoản đóng góp của mình.' },
  { cat: 'minh-bach', date: '2026-10-03', img: 'langNu', focus: '30% 50%', alt: 'Người dân nhận đồ dùng cứu trợ sau thiên tai',
    title: 'Quyết toán kinh phí xây dựng khu tái định cư giai đoạn 1',
    desc: 'Toàn bộ hạng mục, chi phí và nhà tài trợ của giai đoạn 1 được công bố kèm hồ sơ nghiệm thu.' },
];

// ==================== DỰNG BÀI: Tin nổi bật · thẻ chuyên mục ====================
const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const viDate = (iso) => iso.split('-').reverse().join('/');
const byNewest = (a, b) => b.date.localeCompare(a.date);

// ---------- Phần dùng chung: ảnh · dòng meta (chuyên mục · ngày) · tiêu đề phủ cả bài (.stretched) · tóm tắt ----------
const media = (a, cls) => `<div class="${cls}"${cls.includes('media-photo') ? ` style="--focus:${a.focus}"` : ''}><img src="${imgSrc(a.img)}" alt="${escapeHtml(a.alt)}" loading="lazy" style="object-position:${a.focus}" /></div>`;
const meta = (a, withCat = true) => `<p class="news-meta">${withCat ? `<span class="news-cat">${CATEGORIES[a.cat]}</span>` : ''}<time datetime="${a.date}">${viDate(a.date)}</time></p>`;
const titleLink = (a) => `<a class="stretched" href="#" data-panel="Bài viết">${escapeHtml(a.title)}</a>`;

// ---------- Tin nổi bật: bài lớn (ảnh phủ kín, chữ trắng) + danh sách 3 bài — cùng HTML khối tin tức trang chủ ----------
const renderHot = (list) => {
  const [lead, ...rest] = list;
  $('#nw-hot').innerHTML = lead ? `
    <article class="news-item news-feature">
      ${media(lead, 'media media-photo')}
      <div class="news-body">${meta(lead)}<h3 class="news-title">${titleLink(lead)}</h3><p class="news-desc">${escapeHtml(lead.desc)}</p></div>
    </article>
    <div class="news-list">${rest.map((a) => `
      <article class="news-item news-row">
        ${media(a, 'media media-photo')}
        <div class="news-body">${meta(a)}<h3 class="news-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p></div>
      </article>`).join('')}
    </div>` : '';
};

// ---------- Thẻ chuyên mục: .cp-card (ảnh trên · ngày · tiêu đề 2 dòng · tóm tắt 2 dòng) ----------
const card = (a) => `
  <article class="cp-card nw-card">
    ${media(a, 'cp-card-media')}
    <div class="cp-card-body">${meta(a, false)}<h3 class="cp-card-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p></div>
  </article>`;

// ==================== TÌM KIẾM: lọc trên toàn trang ====================
// Có từ khóa → ẩn Tin nổi bật, mỗi chuyên mục chỉ giữ bài khớp (kể cả bài nổi bật), chuyên mục không còn bài thì ẩn; xóa từ khóa → về như cũ
const sections = [...document.querySelectorAll('.nw-section[data-cat]')];
const render = (q = '') => {
  const key = fold(q.trim());
  const match = (a) => !key || fold(`${a.title} ${a.desc} ${CATEGORIES[a.cat]}`).includes(key);
  renderHot(ARTICLES.filter((a) => a.hot).sort(byNewest));
  $('#nw-noi-bat').hidden = Boolean(key);
  let total = 0;
  sections.forEach((section) => {
    const list = ARTICLES.filter((a) => a.cat === section.dataset.cat && (key ? match(a) : !a.hot)).sort(byNewest).slice(0, key ? undefined : 4);
    section.querySelector('.nw-grid').innerHTML = list.map(card).join('');
    section.hidden = !list.length;
    total += list.length;
  });
  $('#nw-empty').hidden = total > 0;
  $('#nw-status').textContent = key ? (total ? `Tìm thấy ${total} bài viết cho “${q.trim()}”` : 'Không tìm thấy bài viết phù hợp') : '';
  // Nút chuyên mục: ẩn theo chuyên mục đang ẩn
  tabs.forEach((tab) => { tab.hidden = document.getElementById(tab.dataset.target).hidden; });
  updateActive();
};

let searchTimer;
$('#nw-search').addEventListener('input', (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => render(event.target.value), 300);
});
$('#nw-search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  render($('#nw-search').value);
  const first = document.querySelector('.nw-section:not([hidden])');
  (first || $('#nw-empty')).scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
});

// ==================== THANH CHUYÊN MỤC: bấm cuộn tới · tô chuyên mục đang xem khi cuộn ====================
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const tabs = [...document.querySelectorAll('.nw-tabs [data-target]')];
const tabsBar = $('.nw-tabs-bar');
const setActive = (id) => tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.target === id)));
// Chuyên mục đang xem: section cuối cùng có mép trên đã qua đáy thanh chuyên mục (+ 1/3 màn hình)
const updateActive = () => {
  const line = tabsBar.getBoundingClientRect().bottom + innerHeight / 3;
  const shown = tabs.filter((tab) => !tab.hidden);
  let current = shown[0];
  shown.forEach((tab) => { if (document.getElementById(tab.dataset.target).getBoundingClientRect().top <= line) current = tab; });
  // Cuộn chạm đáy trang → chuyên mục cuối
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = shown[shown.length - 1];
  if (current) setActive(current.dataset.target);
};
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateActive(); ticking = false; });
}, { passive: true });
tabs.forEach((tab) => tab.addEventListener('click', () => {
  const target = document.getElementById(tab.dataset.target);
  const top = target.getBoundingClientRect().top + scrollY - tabsBar.getBoundingClientRect().bottom + 8;
  scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
  setActive(tab.dataset.target);
}));
// Màn hẹp: thanh chuyên mục cuộn ngang → giữ nút đang tô trong tầm nhìn (chỉ cuộn ngang thanh, không cuộn trang)
const switcher = $('.nw-tabs');
new MutationObserver(() => {
  const tab = tabs.find((t) => t.getAttribute('aria-pressed') === 'true');
  if (tab && switcher.scrollWidth > switcher.clientWidth) switcher.scrollTo({ left: tab.offsetLeft - switcher.clientWidth / 2 + tab.offsetWidth / 2, behavior: 'smooth' });
}).observe(switcher, { subtree: true, attributeFilter: ['aria-pressed'] });

// Từ khóa trên URL (?q=) — ví dụ khi tìm từ trang khác
const initialQ = new URLSearchParams(location.search).get('q') || '';
$('#nw-search').value = initialQ;
render(initialQ);
