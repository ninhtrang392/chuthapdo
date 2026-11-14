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

// ==================== DỮ LIỆU: chuyên mục · bài viết (minh họa) ====================
// SRS Tin tức: 4 chuyên mục, mỗi bài thuộc đúng 1 chuyên mục; nhãn chuyên mục dùng màu .pf-badge
const CATEGORIES = {
  'noi-bat': 'Hoạt động nổi bật',
  'chien-dich': 'Chiến dịch nhân đạo',
  'nguoi-tot': 'Người tốt việc thiện',
  'doi-tac': 'Đối tác & Đồng hành',
};
const CAT_BADGE = { 'noi-bat': 'is-red', 'chien-dich': 'is-orange', 'nguoi-tot': 'is-green', 'doi-tac': 'is-blue' };
// Ảnh minh họa: Emages/ảnh minh họa/ — [tên file, mô tả ảnh]
const IMG = {
  traoQuaBenh: ['2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', 'Tình nguyện viên Chữ thập đỏ trao quà cho hai em nhỏ'],
  hienMauSunHa: ['Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', 'Người dân tham gia ngày hội hiến máu tình nguyện'],
  hienMauXuan: ['z765570465791.jpg', 'Cán bộ Hội tham gia hiến máu tình nguyện'],
  cuuHoLu: ['z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', 'Lực lượng cứu hộ phát áo phao, nhu yếu phẩm cho người dân vùng ngập lũ'],
  thamBaChau: ['bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', 'Cán bộ Chữ thập đỏ thăm hỏi bà và cháu nhỏ tại nhà'],
  traoQuaTanNha: ['1358142_gen-h-235_1777566365.jpg', 'Cán bộ Chữ thập đỏ trao quà cho người dân tại nhà'],
  choNhanDao: ['01 1.jpg', 'Cán bộ Chữ thập đỏ trao gạo cho người dân tại gian hàng Chợ nhân đạo'],
  traoBienDinhDuong: ['3.-028ae9de1f.jpg', 'Đại diện Hội Chữ thập đỏ và nhà tài trợ trao tặng biển hỗ trợ cho trường học'],
  traoQuaHocSinh: ['trao-qua-hoc-sinh.jpg', 'Trao quà cho học sinh'],
  denTruong: ['tre-em-vung-cao-den-truong.jpg', 'Trẻ em vùng cao trên đường đến trường'],
  nhanQua: ['tre-em-vung-cao-nhan-qua.jpg', 'Trẻ em vùng cao nhận quà'],
  nuCuoi: ['tre-em-vung-cao-nu-cuoi.jpg', 'Nụ cười của trẻ em vùng cao'],
  vuiChoi: ['tre-em-vung-cao-vui-choi.jpg', 'Trẻ em vùng cao vui chơi'],
  langNu: ['Làng nủ 3.jpg', 'Người dân vùng sạt lở nhận đồ dùng thiết yếu'],
  langNu2: ['Làng nủ 2.webp', 'Khu vực bị sạt lở sau mưa lũ'],
};
const imgSrc = (key) => encodeURI(`Emages/ảnh minh họa/${IMG[key][0]}`);

// hot: thứ tự trong Tin tức nổi bật (cờ "Nổi bật" + thứ tự cấu hình tại Web nội bộ Hội) · at: ngày + giờ xuất bản · views: lượt xem · read: phút đọc
const A = (cat, at, views, read, img, focus, title, desc, hot) => ({ cat, at, views, read, img, focus, title, desc, hot });
const ARTICLES = [
  // ---------- Hoạt động nổi bật ----------
  A('noi-bat', '2026-11-12 08:30', 18420, 4, 'cuuHoLu', '60% 50%', 'Hội Chữ thập đỏ Việt Nam khẩn cấp hỗ trợ người dân vùng lũ miền Trung', 'Hơn 12.000 suất quà gồm nước uống, lương thực, áo phao và thuốc thiết yếu đã được chuyển tới các xã bị chia cắt chỉ trong 72 giờ đầu sau lũ.', 1),
  A('noi-bat', '2026-11-10 15:10', 7260, 3, 'traoQuaBenh', '50% 40%', 'Tập huấn kỹ năng sơ cấp cứu cho đội tình nguyện viên trẻ năm 2026', 'Hơn 400 tình nguyện viên được trang bị kỹ năng sơ cấp cứu, tâm lý và tổ chức hoạt động cộng đồng tại 12 tỉnh, thành phố.'),
  A('noi-bat', '2026-11-06 09:00', 11950, 4, 'choNhanDao', '50% 45%', '“Chợ nhân đạo” lan tỏa tại nhiều địa phương', 'Người dân khó khăn được chọn nhu yếu phẩm miễn phí tại các gian hàng gạo, dầu ăn, nước mắm do hội viên vận động.', 4),
  A('noi-bat', '2026-10-30 14:20', 5180, 5, 'traoQuaTanNha', '50% 40%', 'Hội nghị sơ kết công tác nhân đạo 10 tháng đầu năm 2026', 'Hội nghị đánh giá kết quả triển khai các chương trình trọng điểm và đề ra nhiệm vụ cho những tháng cuối năm.'),
  A('noi-bat', '2026-10-24 10:05', 4390, 3, 'thamBaChau', '50% 40%', 'Thăm hỏi, tặng quà người cao tuổi neo đơn nhân Tháng hành động vì người cao tuổi', 'Hơn 2.000 suất quà được trao tận nhà cho người cao tuổi neo đơn, khuyết tật trên địa bàn các xã vùng sâu.'),
  A('noi-bat', '2026-10-18 08:45', 3520, 2, 'hienMauSunHa', '30% 40%', 'Ra mắt Câu lạc bộ hiến máu tình nguyện dự bị tại các trường đại học', 'Câu lạc bộ là nơi kết nối sinh viên sẵn sàng hiến máu khi các bệnh viện cần nhóm máu hiếm.'),
  A('noi-bat', '2026-10-10 16:30', 2870, 3, 'langNu2', '50% 50%', 'Diễn tập ứng phó thiên tai cho đội ứng phó khẩn cấp cấp tỉnh', 'Buổi diễn tập mô phỏng tình huống lũ quét, sơ tán dân và cấp phát hàng cứu trợ tại điểm tập kết.'),
  A('noi-bat', '2026-10-03 09:15', 2410, 2, 'nuCuoi', '50% 40%', 'Công bố kết quả vận động Quỹ nhân đạo quý III năm 2026', 'Toàn bộ khoản thu, chi được công khai theo từng chương trình để người dân và nhà hảo tâm cùng theo dõi.'),

  // ---------- Chiến dịch nhân đạo ----------
  A('chien-dich', '2026-11-11 10:00', 9310, 3, 'hienMauXuan', '50% 40%', 'Ngày hội “Giọt hồng sẻ chia” tiếp nhận hơn 3.000 đơn vị máu', 'Ngày hội có khu tư vấn sức khỏe, khám sàng lọc miễn phí và hướng dẫn chăm sóc sau hiến máu cho người tham gia.', 2),
  A('chien-dich', '2026-11-09 08:15', 12870, 4, 'denTruong', '50% 40%', 'Tiếp sức đến trường: 1.500 suất học bổng cho học sinh vùng cao', 'Mỗi suất gồm cặp sách, áo ấm và học bổng, trao tận tay các em tại điểm trường trước mùa đông.'),
  A('chien-dich', '2026-11-07 14:40', 7260, 3, 'langNu', '50% 50%', 'Trao đồ dùng thiết yếu cho người dân vùng sạt lở Làng Nủ', 'Mỗi hộ được nhận chậu, xô, chăn màn và nhu yếu phẩm để sớm ổn định sinh hoạt sau thiên tai.'),
  A('chien-dich', '2026-11-02 09:30', 6540, 3, 'nhanQua', '50% 40%', 'Chiến dịch “Áo ấm mùa đông” trao 3.000 áo ấm cho học sinh vùng cao', 'Áo ấm, chăn và mũ len được trao tận tay học sinh tại các điểm trường xa trung tâm trước đợt rét đầu mùa.'),
  A('chien-dich', '2026-10-27 15:00', 4180, 4, 'langNu2', '30% 50%', 'Khảo sát hiện trường, lập kế hoạch tái thiết vùng sạt lở', 'Đoàn công tác của Hội cùng chính quyền địa phương khảo sát, xác định vị trí an toàn để xây dựng khu dân cư mới.'),
  A('chien-dich', '2026-10-21 08:20', 3610, 2, 'cuuHoLu', '30% 50%', 'Chuẩn bị sẵn 50 tấn hàng dự phòng cho mùa mưa bão', 'Kho hàng dự phòng tại các khu vực trọng điểm luôn sẵn sàng xuất cấp trong vòng 24 giờ khi có thiên tai.'),
  A('chien-dich', '2026-10-14 10:10', 2980, 3, 'choNhanDao', '70% 50%', 'Phát động chiến dịch “Tết nhân ái 2027” trên toàn quốc', 'Chiến dịch hướng tới 100.000 suất quà Tết cho hộ nghèo, người khuyết tật và nạn nhân chất độc da cam.'),
  A('chien-dich', '2026-10-06 14:45', 2240, 2, 'traoQuaHocSinh', '50% 40%', 'Trao 500 xe đạp cho học sinh nghèo vượt khó', 'Những chiếc xe đạp giúp các em ở bản xa rút ngắn quãng đường đến trường mỗi ngày.'),

  // ---------- Người tốt việc thiện ----------
  A('nguoi-tot', '2026-11-12 14:00', 8720, 5, 'langNu2', '70% 50%', 'Những tình nguyện viên ở lại Làng Nủ giúp bà con dựng lại nhà', 'Suốt ba tuần, nhóm tình nguyện viên trẻ cùng người dân dọn bùn đất, dựng lại nhà tạm và lớp học cho các em nhỏ.', 3),
  A('nguoi-tot', '2026-11-08 07:50', 14360, 4, 'traoQuaHocSinh', '50% 40%', 'Thầy giáo cắm bản 15 năm “cõng chữ” lên non', 'Không chỉ dạy chữ, thầy còn vận động áo ấm, sách vở và bữa trưa cho học trò ở điểm trường xa nhất xã.'),
  A('nguoi-tot', '2026-11-04 16:15', 11240, 3, 'thamBaChau', '60% 40%', 'Nữ tình nguyện viên 10 năm chăm sóc người già neo đơn', 'Mỗi tuần, chị dành hai buổi đến thăm, nấu cơm và trò chuyện cùng các cụ già neo đơn trong xã.'),
  A('nguoi-tot', '2026-10-29 09:40', 9870, 3, 'hienMauSunHa', '70% 35%', 'Tôn vinh 100 gương mặt hiến máu tiêu biểu năm 2026', 'Nhiều người đã hiến máu trên 30 lần, trở thành tấm gương lan tỏa tinh thần sẻ chia trong cộng đồng.'),
  A('nguoi-tot', '2026-10-22 11:25', 5630, 2, 'hienMauXuan', '80% 50%', 'Cụ bà 80 tuổi vẫn đều đặn ủng hộ Quỹ nhân đạo', 'Từ khoản lương hưu ít ỏi, bà dành dụm mỗi tháng một phần để góp vào Quỹ nhân đạo của phường.'),
  A('nguoi-tot', '2026-10-16 15:35', 4410, 3, 'vuiChoi', '50% 40%', 'Người dân góp công xây sân chơi cho trẻ em vùng cao', 'Sân chơi gồm cầu trượt, xích đu và góc đọc sách, phục vụ hơn 200 em nhỏ trong bản.'),
  A('nguoi-tot', '2026-10-09 08:05', 3170, 2, 'nhanQua', '30% 40%', 'Nhóm sinh viên mở lớp học tình thương miễn phí', 'Lớp học do sinh viên tình nguyện đứng lớp, giúp các em có hoàn cảnh đặc biệt được học chữ, học kỹ năng sống.'),
  A('nguoi-tot', '2026-10-02 13:50', 2650, 2, 'traoQuaBenh', '30% 40%', 'Người lái xe ôm miễn phí chở bệnh nhân nghèo đi chạy thận', 'Gần 5 năm nay, anh dành buổi sáng chở miễn phí các bệnh nhân nghèo từ làng lên bệnh viện tỉnh.'),

  // ---------- Đối tác & Đồng hành ----------
  A('doi-tac', '2026-11-11 15:30', 5280, 3, 'hienMauXuan', '30% 40%', 'Doanh nghiệp tổ chức ngày hội hiến máu cùng Hội Chữ thập đỏ', 'Hơn 600 cán bộ, người lao động đăng ký hiến máu, nhiều người lần đầu tham gia sau khi được tư vấn tại chỗ.', 5),
  A('doi-tac', '2026-11-05 10:45', 6120, 4, 'traoBienDinhDuong', '50% 40%', 'Ra mắt dự án “Chăm em đủ chất” cùng nhà tài trợ', 'Dự án hỗ trợ bữa ăn dinh dưỡng và tổ chức hoạt động vui học kiến thức dinh dưỡng cho học sinh bán trú.'),
  A('doi-tac', '2026-11-01 09:20', 3460, 3, 'traoQuaBenh', '50% 40%', 'Nhà tài trợ đồng hành hỗ trợ trẻ em mắc bệnh tan máu bẩm sinh', 'Mỗi em được hỗ trợ chi phí điều trị, quà và học bổng trong suốt năm học 2026 – 2027.'),
  A('doi-tac', '2026-10-26 14:10', 2970, 3, 'traoQuaHocSinh', '50% 40%', 'Doanh nghiệp đồng hành trao 500 suất quà cho học sinh vượt khó', 'Mỗi suất quà gồm sách vở, đồ dùng học tập và học bổng, trao tại các trường trên địa bàn khó khăn.'),
  A('doi-tac', '2026-10-19 16:00', 7740, 2, 'nuCuoi', '60% 40%', 'Công bố danh sách nhà hảo tâm, đơn vị đồng hành tháng 9', 'Danh sách được cập nhật công khai trên nền tảng để mọi người có thể tra cứu khoản đóng góp của mình.'),
  A('doi-tac', '2026-10-12 09:55', 3150, 3, 'traoQuaTanNha', '40% 40%', 'Gặp mặt tri ân các đơn vị đồng hành năm 2026', 'Hội cảm ơn hơn 120 doanh nghiệp, tổ chức đã đồng hành cùng các chương trình nhân đạo trong năm.'),
  A('doi-tac', '2026-10-07 10:30', 2560, 4, 'traoBienDinhDuong', '60% 40%', 'Ký kết hợp tác hỗ trợ bữa ăn bán trú với các tổ chức quốc tế', 'Thỏa thuận giúp hơn 5.000 học sinh bán trú có thêm bữa ăn đủ chất trong năm học mới.'),
  A('doi-tac', '2026-10-01 15:15', 1980, 2, 'vuiChoi', '30% 40%', 'Ngân hàng đồng hành xây 10 sân chơi cho trẻ em vùng cao', 'Các sân chơi được xây tại điểm trường mầm non vùng cao, có góc đọc sách và khu vận động.'),
].map((a, i) => ({ ...a, id: i + 1, alt: IMG[a.img][1] }));

// ==================== DỰNG THẺ BÀI ====================
const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const viDate = (at) => at.slice(0, 10).split('-').reverse().join('/');
const byNewest = (a, b) => b.at.localeCompare(a.at);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

// ---------- Phần dùng chung: nhãn chuyên mục · ảnh · dòng ngày | phút đọc (BR-DS-05) · tiêu đề phủ cả thẻ (.stretched, BR-DS-06) ----------
const badge = (a, extra = '') => `<span class="pf-badge ${CAT_BADGE[a.cat]} nw-badge${extra}">${escapeHtml(CATEGORIES[a.cat])}</span>`;
const media = (a, cls, eager = false, withBadge = true) => `<div class="media media-photo ${cls}" style="--focus:${a.focus}"><img src="${imgSrc(a.img)}" alt="${escapeHtml(a.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" />${withBadge ? badge(a, ' is-on-photo') : ''}</div>`;
const meta = (a, withRead = true) => `<p class="nw-meta">${icon('clock')}<time datetime="${a.at.replace(' ', 'T')}">${viDate(a.at)}</time>${withRead ? `<span aria-hidden="true">|</span><span>${a.read} phút đọc</span>` : ''}</p>`;
const titleLink = (a) => `<a class="stretched" href="#" data-panel="Chi tiết tin tức">${escapeHtml(a.title)}</a>`;

// Tin tức nổi bật: 1 slide = ảnh lớn (không nhãn) · tiêu đề (2 dòng) · sapo (3 dòng) · ngày đăng
const slide = (a, i, n) => `
  <article class="news-item nw-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${n}">
    ${media(a, 'nw-slide-media', i === 0, false)}
    <div class="nw-slide-body">
      <h3 class="news-title nw-slide-title">${titleLink(a)}</h3>
      <p class="news-desc nw-slide-desc">${escapeHtml(a.desc)}</p>
      <div class="nw-slide-foot">${meta(a, false)}</div>
    </div>
  </article>`;
// Tin mới nhất: bài 1 = thẻ ngang lớn (ảnh không nhãn · tiêu đề · sapo · ngày đăng); bài 2 – 5 = lưới 2×2 bài nhỏ (ảnh không nhãn · tiêu đề tối đa 2 dòng · ngày đăng = tối đa 3 dòng)
const latestLead = (a) => `
  <article class="news-item nw-latest-lead">
    ${media(a, 'nw-latest-lead-media', false, false)}
    <div class="nw-latest-body"><h3 class="news-title">${titleLink(a)}</h3><p class="news-desc">${escapeHtml(a.desc)}</p>${meta(a, false)}</div>
  </article>`;
const latestCard = (a) => `
  <article class="news-item nw-latest-item">
    ${media(a, 'nw-latest-media', false, false)}
    <div class="nw-latest-body"><h3 class="news-title">${titleLink(a)}</h3>${meta(a, false)}</div>
  </article>`;
const latestBlock = (list) => {
  if (!list.length) return '<p class="nw-block-empty">Hiện chưa có tin tức nào.</p>';
  const [lead, ...rest] = list;
  return latestLead(lead) + (rest.length ? `<div class="nw-latest-grid">${rest.map(latestCard).join('')}</div>` : '');
};
// Tin đọc nhiều: thẻ dọc — ảnh đứng phủ cả thẻ, không nhãn chuyên mục · tiêu đề tối đa 3 dòng chữ trắng nằm trên đáy ảnh (CSS .nw-pop-card)
const popularCard = (a) => `
  <article class="cp-card nw-card nw-pop-card">
    ${media(a, 'cp-card-media', false, false)}
    <div class="cp-card-body"><h3 class="cp-card-title">${titleLink(a)}</h3></div>
  </article>`;
// Tin tức khác / kết quả tìm kiếm: thẻ dọc (4 thẻ / hàng) — ảnh trên, nhãn chuyên mục ở góc trên trái ảnh · tiêu đề 2 dòng · mô tả 2 dòng · ngày | phút đọc
const otherCard = (a) => `
  <article class="cp-card nw-card nw-other">
    ${media(a, 'nw-other-media')}
    <div class="nw-other-body"><h3 class="cp-card-title">${titleLink(a)}</h3><p class="news-desc nw-other-desc">${escapeHtml(a.desc)}</p><div class="nw-other-foot">${meta(a)}</div></div>
  </article>`;

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
  const others = newest.filter((a) => !used.has(a)).slice(0, 16);
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
const render = () => {
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === state.cat)));
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
  $('#nw-others').innerHTML = data.others.map(otherCard).join('');
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
