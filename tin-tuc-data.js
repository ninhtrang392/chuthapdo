// ==================== DỮ LIỆU TIN TỨC (dùng chung tin-tuc.html · tin-tuc-chi-tiet.html) ====================
// DỮ LIỆU MINH HỌA — chuyên mục, bài viết, ảnh, ngày đăng, lượt xem lấy từ Web nội bộ Hội khi có hệ thống chính thức.
// Nạp TRƯỚC tin-tuc.js / tin-tuc-chi-tiet.js (các hằng ở đây là biến chung của trang).

// ==================== DỮ LIỆU: chuyên mục · bài viết (minh họa) ====================
// SRS Tin tức: 4 chuyên mục, mỗi bài thuộc đúng 1 chuyên mục
const CATEGORIES = {
  'noi-bat': 'Hoạt động nổi bật',
  'chien-dich': 'Chiến dịch nhân đạo',
  'nguoi-tot': 'Người tốt việc thiện',
  'doi-tac': 'Đối tác & Đồng hành',
};
// Ảnh minh họa: [tên file, mô tả ảnh, thư mục] — mặc định Emages/ảnh minh họa/; ảnh có thư mục "Chương trình" lấy từ Emages/Chương trình/
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
  // Ảnh mục Chương trình (Emages/Chương trình/) — dùng cho Tin tức nổi bật · Tin mới nhất
  ctTraoQuaTre: ['5f7c45a6-e2a9-48f8-8a3f-8d3cbd503375.png', 'Tình nguyện viên Chữ thập đỏ trao quà cho trẻ em vùng cao', 'Chương trình'],
  ctDenTruong: ['72ad1836-57d6-41e3-aad3-6638cbc4c87e.png', 'Học sinh vùng cao trên đường đến trường', 'Chương trình'],
  ctTraoSach: ['image(20261029-093040).png', 'Tình nguyện viên trao sách vở cho học sinh vùng cao', 'Chương trình'],
  ctDiuCuBa: ['image.png', 'Đoàn viên thanh niên tình nguyện dìu cụ bà về nhà', 'Chương trình'],
  ctTraoGui: ['Khoảnh Khắc Trao Gửi Yêu Thương.png', 'Tình nguyện viên trao nhu yếu phẩm cho bà và cháu nhỏ', 'Chương trình'],
  ctNuCuoi: ['Nụ Cười Bé Gái Vùng Cao.png', 'Nụ cười bé gái vùng cao trên đường đến lớp', 'Chương trình'],
  ctAoAm: ['photo-1-1672203155158881380269.png', 'Trẻ em vùng cao mặc áo ấm trước điểm trường', 'Chương trình'],
  ctEmBe: ['photo-bo-anh-nhung-em-be-vung-cao-17.jpg', 'Những em bé vùng cao rạng rỡ nụ cười', 'Chương trình'],
  ctDiBo: ['tre-em-vung-cao 1.jpg', 'Trẻ em vùng cao đi bộ trên con đường đất', 'Chương trình'],
  ctVuiChoi: ['trẻ-em-vùng-cao-ảnh-bùi-tuấn-hải-copy.jpg', 'Trẻ em vùng cao vui chơi trên cánh đồng', 'Chương trình'],
};
const imgSrc = (key) => encodeURI(`Emages/${IMG[key][2] || 'ảnh minh họa'}/${IMG[key][0]}`); // [tên file, mô tả, thư mục (mặc định: ảnh minh họa)]

// hot: thứ tự trong Tin tức nổi bật (cờ "Nổi bật" + thứ tự cấu hình tại Web nội bộ Hội) · at: ngày + giờ xuất bản · views: lượt xem · read: số phút, hiển thị "N phút trước"
const A = (cat, at, views, read, img, focus, title, desc, hot) => ({ cat, at, views, read, img, focus, title, desc, hot });
const ARTICLES = [
  // ---------- Hoạt động nổi bật ----------
  A('noi-bat', '2026-11-12 08:30', 18420, 4, 'ctTraoQuaTre', '50% 45%', 'Hội Chữ thập đỏ Việt Nam khẩn cấp hỗ trợ người dân vùng lũ miền Trung', 'Hơn 12.000 suất quà gồm nước uống, lương thực, áo phao và thuốc thiết yếu đã được chuyển tới các xã bị chia cắt chỉ trong 72 giờ đầu sau lũ.', 1),
  A('noi-bat', '2026-11-10 15:10', 7260, 3, 'ctTraoSach', '50% 45%', 'Tập huấn kỹ năng sơ cấp cứu cho đội tình nguyện viên trẻ năm 2026', 'Hơn 400 tình nguyện viên được trang bị kỹ năng sơ cấp cứu, tâm lý và tổ chức hoạt động cộng đồng tại 12 tỉnh, thành phố.'),
  A('noi-bat', '2026-11-06 09:00', 11950, 4, 'ctAoAm', '50% 45%', '“Chợ nhân đạo” lan tỏa tại nhiều địa phương', 'Người dân khó khăn được chọn nhu yếu phẩm miễn phí tại các gian hàng gạo, dầu ăn, nước mắm do hội viên vận động.', 4),
  A('noi-bat', '2026-10-30 14:20', 5180, 5, 'traoQuaTanNha', '50% 40%', 'Hội nghị sơ kết công tác nhân đạo 10 tháng đầu năm 2026, triển khai nhiệm vụ trọng tâm những tháng cuối năm', 'Hội nghị đánh giá kết quả triển khai các chương trình trọng điểm, biểu dương các tập thể, cá nhân tiêu biểu và đề ra nhiệm vụ cho những tháng cuối năm, tập trung chăm lo Tết cho người nghèo và nạn nhân thiên tai.'),
  A('noi-bat', '2026-10-24 10:05', 4390, 3, 'thamBaChau', '50% 40%', 'Thăm hỏi, tặng quà người cao tuổi neo đơn nhân Tháng hành động vì người cao tuổi', 'Hơn 2.000 suất quà được trao tận nhà cho người cao tuổi neo đơn, khuyết tật trên địa bàn các xã vùng sâu.'),
  A('noi-bat', '2026-10-18 08:45', 3520, 2, 'hienMauSunHa', '30% 40%', 'Ra mắt Câu lạc bộ hiến máu tình nguyện dự bị tại các trường đại học', 'Câu lạc bộ là nơi kết nối sinh viên sẵn sàng hiến máu khi các bệnh viện cần nhóm máu hiếm.'),
  A('noi-bat', '2026-10-10 16:30', 2870, 3, 'langNu2', '50% 50%', 'Diễn tập ứng phó thiên tai cho đội ứng phó khẩn cấp cấp tỉnh', 'Buổi diễn tập mô phỏng tình huống lũ quét, sơ tán dân và cấp phát hàng cứu trợ tại điểm tập kết.'),
  A('noi-bat', '2026-10-03 09:15', 2410, 2, 'nuCuoi', '50% 40%', 'Công bố kết quả vận động Quỹ nhân đạo quý III năm 2026', 'Toàn bộ khoản thu, chi được công khai theo từng chương trình để người dân và nhà hảo tâm cùng theo dõi.'),

  // ---------- Chiến dịch nhân đạo ----------
  A('chien-dich', '2026-11-11 10:00', 9310, 3, 'ctDiuCuBa', '50% 45%', 'Ngày hội “Giọt hồng sẻ chia” tiếp nhận hơn 3.000 đơn vị máu', 'Ngày hội có khu tư vấn sức khỏe, khám sàng lọc miễn phí và hướng dẫn chăm sóc sau hiến máu cho người tham gia.', 2),
  A('chien-dich', '2026-11-09 08:15', 12870, 4, 'ctDenTruong', '50% 45%', 'Tiếp sức đến trường: 1.500 suất học bổng cho học sinh vùng cao', 'Mỗi suất gồm cặp sách, áo ấm và học bổng, trao tận tay các em tại điểm trường trước mùa đông.'),
  A('chien-dich', '2026-11-07 14:40', 7260, 3, 'ctDiBo', '50% 45%', 'Trao đồ dùng thiết yếu cho người dân vùng sạt lở Làng Nủ', 'Mỗi hộ được nhận chậu, xô, chăn màn và nhu yếu phẩm để sớm ổn định sinh hoạt sau thiên tai.'),
  A('chien-dich', '2026-11-02 09:30', 6540, 3, 'nhanQua', '50% 40%', 'Chiến dịch “Áo ấm mùa đông” trao 3.000 áo ấm cho học sinh vùng cao', 'Áo ấm, chăn và mũ len được trao tận tay học sinh tại các điểm trường xa trung tâm trước đợt rét đầu mùa.'),
  A('chien-dich', '2026-10-27 15:00', 4180, 4, 'langNu2', '30% 50%', 'Khảo sát hiện trường, lập kế hoạch tái thiết vùng sạt lở và di dời các hộ dân đến nơi ở mới an toàn hơn', 'Đoàn công tác của Hội cùng chính quyền địa phương khảo sát, xác định vị trí an toàn để xây dựng khu dân cư mới, đồng thời lên phương án hỗ trợ vật liệu, nhân công và sinh kế lâu dài cho các hộ bị ảnh hưởng.'),
  A('chien-dich', '2026-10-21 08:20', 3610, 2, 'cuuHoLu', '30% 50%', 'Chuẩn bị sẵn 50 tấn hàng dự phòng cho mùa mưa bão', 'Kho hàng dự phòng tại các khu vực trọng điểm luôn sẵn sàng xuất cấp trong vòng 24 giờ khi có thiên tai.'),
  A('chien-dich', '2026-10-14 10:10', 2980, 3, 'choNhanDao', '70% 50%', 'Phát động chiến dịch “Tết nhân ái 2027” trên toàn quốc', 'Chiến dịch hướng tới 100.000 suất quà Tết cho hộ nghèo, người khuyết tật và nạn nhân chất độc da cam.'),
  A('chien-dich', '2026-10-06 14:45', 2240, 2, 'traoQuaHocSinh', '50% 40%', 'Trao 500 xe đạp cho học sinh nghèo vượt khó', 'Những chiếc xe đạp giúp các em ở bản xa rút ngắn quãng đường đến trường mỗi ngày.'),

  // ---------- Người tốt việc thiện ----------
  A('nguoi-tot', '2026-11-12 14:00', 8720, 5, 'ctTraoGui', '50% 45%', 'Những tình nguyện viên ở lại Làng Nủ giúp bà con dựng lại nhà', 'Suốt ba tuần, nhóm tình nguyện viên trẻ cùng người dân dọn bùn đất, dựng lại nhà tạm và lớp học cho các em nhỏ.', 3),
  A('nguoi-tot', '2026-11-08 07:50', 14360, 4, 'ctNuCuoi', '50% 45%', 'Thầy giáo cắm bản 15 năm “cõng chữ” lên non', 'Không chỉ dạy chữ, thầy còn vận động áo ấm, sách vở và bữa trưa cho học trò ở điểm trường xa nhất xã.'),
  A('nguoi-tot', '2026-11-04 16:15', 11240, 3, 'thamBaChau', '60% 40%', 'Nữ tình nguyện viên 10 năm chăm sóc người già neo đơn', 'Mỗi tuần, chị dành hai buổi đến thăm, nấu cơm và trò chuyện cùng các cụ già neo đơn trong xã.'),
  A('nguoi-tot', '2026-10-29 09:40', 9870, 3, 'hienMauSunHa', '70% 35%', 'Tôn vinh 100 gương mặt hiến máu tiêu biểu năm 2026', 'Nhiều người đã hiến máu trên 30 lần, trở thành tấm gương lan tỏa tinh thần sẻ chia trong cộng đồng.'),
  A('nguoi-tot', '2026-10-22 11:25', 5630, 2, 'hienMauXuan', '80% 50%', 'Cụ bà 80 tuổi vẫn đều đặn ủng hộ Quỹ nhân đạo', 'Từ khoản lương hưu ít ỏi, bà dành dụm mỗi tháng một phần để góp vào Quỹ nhân đạo của phường.'),
  A('nguoi-tot', '2026-10-16 15:35', 4410, 3, 'vuiChoi', '50% 40%', 'Người dân góp công xây sân chơi cho trẻ em vùng cao', 'Sân chơi gồm cầu trượt, xích đu và góc đọc sách, phục vụ hơn 200 em nhỏ trong bản.'),
  A('nguoi-tot', '2026-10-09 08:05', 3170, 2, 'nhanQua', '30% 40%', 'Nhóm sinh viên mở lớp học tình thương miễn phí', 'Lớp học do sinh viên tình nguyện đứng lớp, giúp các em có hoàn cảnh đặc biệt được học chữ, học kỹ năng sống.'),
  A('nguoi-tot', '2026-10-02 13:50', 2650, 2, 'traoQuaBenh', '30% 40%', 'Người lái xe ôm miễn phí chở bệnh nhân nghèo đi chạy thận', 'Gần 5 năm nay, anh dành buổi sáng chở miễn phí các bệnh nhân nghèo từ làng lên bệnh viện tỉnh.'),

  // ---------- Đối tác & Đồng hành ----------
  A('doi-tac', '2026-11-11 15:30', 5280, 3, 'ctEmBe', '50% 45%', 'Doanh nghiệp tổ chức ngày hội hiến máu cùng Hội Chữ thập đỏ', 'Hơn 600 cán bộ, người lao động đăng ký hiến máu, nhiều người lần đầu tham gia sau khi được tư vấn tại chỗ.', 5),
  A('doi-tac', '2026-11-05 10:45', 6120, 4, 'ctVuiChoi', '50% 45%', 'Ra mắt dự án “Chăm em đủ chất” cùng nhà tài trợ', 'Dự án hỗ trợ bữa ăn dinh dưỡng và tổ chức hoạt động vui học kiến thức dinh dưỡng cho học sinh bán trú.'),
  A('doi-tac', '2026-11-01 09:20', 3460, 3, 'traoQuaBenh', '50% 40%', 'Nhà tài trợ đồng hành hỗ trợ trẻ em mắc bệnh tan máu bẩm sinh tiếp tục điều trị và đến trường trong năm học mới', 'Mỗi em được hỗ trợ chi phí điều trị, quà và học bổng trong suốt năm học 2026 – 2027; gia đình các em được tư vấn chăm sóc dinh dưỡng và kết nối với các bệnh viện tuyến trên khi cần truyền máu định kỳ.'),
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

// ---------- Phần dùng chung: ảnh (không nhãn chuyên mục) · dòng ngày | N phút trước (BR-DS-05) · tiêu đề phủ cả thẻ (.stretched, BR-DS-06) ----------
const media = (a, cls, eager = false) => `<div class="media media-photo ${cls}" style="--focus:${a.focus}"><img src="${imgSrc(a.img)}" alt="${escapeHtml(a.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" /></div>`;
const meta = (a, withRead = true) => `<p class="nw-meta">${icon('clock')}<time datetime="${a.at.replace(' ', 'T')}">${viDate(a.at)}</time>${withRead ? `<span aria-hidden="true">|</span><span>${a.read} phút trước</span>` : ''}</p>`;
const titleLink = (a) => `<a class="stretched" href="tin-tuc-chi-tiet.html?id=${a.id}">${escapeHtml(a.title)}</a>`;
// Tin mới nhất (lưới 2×2 trang Tin tức · cột phải trang chi tiết): ảnh trái · tiêu đề tối đa 2 dòng · ngày đăng
const latestCard = (a) => `
  <article class="news-item nw-latest-item">
    ${media(a, 'nw-latest-media')}
    <div class="nw-latest-body"><h3 class="news-title">${titleLink(a)}</h3>${meta(a, false)}</div>
  </article>`;
// Tin tức khác / kết quả tìm kiếm: thẻ dọc (4 thẻ / hàng) — ảnh trên (không nhãn chuyên mục) · tiêu đề 2 dòng · mô tả 2 dòng · ngày | N phút trước
const otherCard = (a) => `
  <article class="cp-card nw-card nw-other">
    ${media(a, 'nw-other-media')}
    <div class="nw-other-body"><h3 class="cp-card-title">${titleLink(a)}</h3><p class="news-desc nw-other-desc">${escapeHtml(a.desc)}</p><div class="nw-other-foot">${meta(a)}</div></div>
  </article>`;
