// ==================== DỮ LIỆU CHƯƠNG TRÌNH THIỆN NGUYỆN (dùng chung) ====================
// Dùng chung cho trang danh sách (chuong-trinh-thien-nguyen.js) và trang chi tiết (chuong-trinh.js).
// Dữ liệu minh họa — khi triển khai thật, lấy danh sách chương trình đang gây quỹ từ CMS/API.

// ==================== DATA: chương trình đang gây quỹ (minh họa) ====================
// id: mã trang chi tiết chuong-trinh.html?id= (giữ nguyên các mã đã dùng ở trang chủ, bản đồ số, hồ sơ)
// raised / goal: số tiền (đồng) hoặc số lượng theo unit (ví dụ đơn vị máu); days: số ngày còn lại (0 = đã kết thúc)
// startIn (tùy chọn): chương trình SẮP DIỄN RA — còn startIn ngày nữa mới mở nhận ủng hộ (raised 0); thẻ hiện "Sắp diễn ra" thay "Còn N ngày"
// banner (tùy chọn): ảnh banner riêng ở đầu trang chi tiết, trong Emages/Chương trình/ — không có thì banner dùng ảnh chương trình (img)
// img / photos (tùy chọn): ảnh thẻ và ảnh riêng cho bộ ảnh trang chi tiết (sau ảnh img), trong Emages/Chương trình/ (PIMG) — không có photos thì xoay vòng PROGRAM_PHOTOS
const IMG = 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/';
const BANNER_IMG = 'Emages/Ch%C6%B0%C6%A1ng%20tr%C3%ACnh/';
// Ảnh chương trình (thẻ danh sách, bộ ảnh trang chi tiết, thiệp cảm ơn): lấy từ Emages/Chương trình/. Các nơi dùng ghép IMG + p.img,
// nên PIMG là đường dẫn tương đối tính từ thư mục IMG (../Chương trình/) — trình duyệt tự rút gọn thành Emages/Chương trình/<tệp>
const PIMG = '../Ch%C6%B0%C6%A1ng%20tr%C3%ACnh/';
// 9 ảnh chương trình — dùng cho bộ ảnh trang chi tiết (chuong-trinh.js: PV_PHOTOS)
const PROGRAM_PHOTOS = [PIMG + '5f7c45a6-e2a9-48f8-8a3f-8d3cbd503375.png', PIMG + '72ad1836-57d6-41e3-aad3-6638cbc4c87e.png', PIMG + 'Kho%E1%BA%A3nh%20Kh%E1%BA%AFc%20Trao%20G%E1%BB%ADi%20Y%C3%AAu%20Th%C6%B0%C6%A1ng.png', PIMG + 'image(20261029-093040).png', PIMG + 'image.png', PIMG + 'nu-cuoi-be-gai-vung-cao.jpg', PIMG + 'photo-1-1672203155158881380269.png', PIMG + 'photo-3-16722031623611945449954.png', PIMG + 'tr%E1%BA%BB-em-v%C3%B9ng-cao-%E1%BA%A3nh-b%C3%B9i-tu%E1%BA%A5n-h%E1%BA%A3i-copy.jpg'];
const PRIORITY = {
  urgent: { label: 'Khẩn cấp', cls: 'is-urgent' },
  medium: { label: 'Trung bình', cls: 'is-medium' },
  low: { label: 'Thấp', cls: 'is-low' },
};
const PROGRAMS = [
  { id: 'xay-truong-ha-giang', title: 'Chung tay xây trường vùng cao Hà Giang', place: 'Hà Giang', priority: 'urgent', field: 'Giáo dục & Khuyến học', img: PIMG + 'nu-cuoi-be-gai-vung-cao.jpg', banner: 'nu-cuoi-be-gai-vung-cao.jpg', photos: [PIMG + '72ad1836-57d6-41e3-aad3-6638cbc4c87e.png', PIMG + 'photo-1-1672203155158881380269.png', PIMG + 'tr%E1%BA%BB-em-v%C3%B9ng-cao-%E1%BA%A3nh-b%C3%B9i-tu%E1%BA%A5n-h%E1%BA%A3i-copy.jpg', PIMG + 'image(20261029-093040).png'], raised: 3.4e9, goal: 7e9, days: 8 },
  { id: 'tiep-suc-mua-lu-2026', title: 'Tiếp sức mùa mưa lũ miền Trung 2026', place: 'Quảng Ngãi', priority: 'urgent', field: 'Cứu trợ thiên tai', img: PIMG + '5f7c45a6-e2a9-48f8-8a3f-8d3cbd503375.png', raised: 9.2e9, goal: 10e9, days: 12 },
  { id: 'bua-com-yeu-thuong', title: 'Bữa cơm yêu thương cho bệnh nhân nghèo', place: 'Cao Bằng', priority: 'medium', field: 'Y tế - Sức khỏe', img: PIMG + 'Kho%E1%BA%A3nh%20Kh%E1%BA%AFc%20Trao%20G%E1%BB%ADi%20Y%C3%AAu%20Th%C6%B0%C6%A1ng.png', raised: 225e6, goal: 500e6, days: 20 },
  { id: 'ao-am-bien-gioi', title: 'Áo ấm mùa đông cho trẻ em vùng biên giới', place: 'Điện Biên', priority: 'urgent', field: 'Trẻ em - Biên giới', img: PIMG + 'photo-1-1672203155158881380269.png', raised: 400e6, goal: 500e6, days: 5 },
  { id: 'nha-tinh-thuong-ben-tre', title: 'Xây nhà tình thương cho hộ nghèo Bến Tre', place: 'Bến Tre', priority: 'medium', field: 'Sinh kế & Nhà ở', img: PIMG + 'tr%E1%BA%BB-em-v%C3%B9ng-cao-%E1%BA%A3nh-b%C3%B9i-tu%E1%BA%A5n-h%E1%BA%A3i-copy.jpg', raised: 600e6, goal: 2e9, days: 45 },
  { id: 'tu-sach-cong-dong', title: 'Tủ sách cộng đồng cho học sinh vùng sâu', place: 'Cao Bằng', priority: 'medium', field: 'Giáo dục & Khuyến học', img: PIMG + 'image(20261029-093040).png', startIn: 3, raised: 0, goal: 200e6, days: 18 },
  { id: 'xe-cuu-thuong-0-dong', title: 'Chuyến xe cứu thương 0 đồng — vững tâm nhân ái', place: 'Quảng Trị', priority: 'low', field: 'Y tế - Sức khỏe', img: PIMG + 'image.png', raised: 275e6, goal: 375e6, days: 30 },
  { id: 'clb-van-hoa-thai-mai-son', title: 'Gây quỹ mở 02 CLB Bảo tồn văn hóa Thái tại 02 điểm trường Mai Sơn', place: 'Sơn La', priority: 'low', field: 'Giáo dục & Khuyến học', img: PIMG + 'tr%E1%BA%BB-em-v%C3%B9ng-cao-%E1%BA%A3nh-b%C3%B9i-tu%E1%BA%A5n-h%E1%BA%A3i-copy.jpg', raised: 1.24e9, goal: 3e9, days: 60 },
  { id: 'lu-lut-mien-trung', owner: 'tran-thu-ha', title: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung', place: 'Quảng Trị', priority: 'urgent', field: 'Cứu trợ thiên tai', img: PIMG + 'photo-3-16722031623611945449954.png', raised: 1.245e9, goal: 2e9, days: 18 },
  { id: 'nuoc-sach-han-man', title: 'Nước sạch cho người dân vùng hạn mặn', place: 'Vĩnh Long', priority: 'medium', field: 'Nước sạch & Vệ sinh', img: PIMG + 'Kho%E1%BA%A3nh%20Kh%E1%BA%AFc%20Trao%20G%E1%BB%ADi%20Y%C3%AAu%20Th%C6%B0%C6%A1ng.png', raised: 410e6, goal: 1.2e9, days: 25 },
  { id: 'tiep-suc-den-truong', title: 'Tiếp sức đến trường vùng cao', place: 'Cao Bằng', priority: 'medium', field: 'Giáo dục & Khuyến học', img: PIMG + '72ad1836-57d6-41e3-aad3-6638cbc4c87e.png', raised: 328.5e6, goal: 800e6, days: 34 },
  { id: 'hien-mau-mua-he', title: 'Giọt hồng yêu thương — tiếp sức kho máu mùa hè', place: 'Hà Nội', priority: 'medium', field: 'Hiến máu nhân đạo', img: PIMG + 'image.png', raised: 3120, goal: 5000, unit: 'đơn vị máu', days: 12 },
  { id: 'mai-am-nhan-ai', title: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn', place: 'Tuyên Quang', priority: 'low', field: 'Sinh kế & Nhà ở', img: PIMG + '5f7c45a6-e2a9-48f8-8a3f-8d3cbd503375.png', raised: 860e6, goal: 1.5e9, days: 40 },
  { id: 'so-cap-cuu-ven-bien', title: 'Sơ cấp cứu cộng đồng ven biển', place: 'Quảng Bình', priority: 'medium', field: 'Y tế - Sức khỏe', img: PIMG + 'photo-3-16722031623611945449954.png', raised: 60e6, goal: 150e6, days: 70 },
  { id: 'nuoc-sach-diem-truong', title: 'Nước sạch cho điểm trường vùng cao', place: 'Lào Cai', priority: 'medium', field: 'Nước sạch & Vệ sinh', img: PIMG + 'photo-1-1672203155158881380269.png', raised: 185e6, goal: 420e6, days: 26 },
  { id: 'phau-thuat-tim-tre-em', title: 'Phẫu thuật tim cho trẻ em có hoàn cảnh khó khăn', place: 'TP. Hồ Chí Minh', priority: 'medium', field: 'Y tế - Sức khỏe', img: PIMG + 'nu-cuoi-be-gai-vung-cao.jpg', raised: 1.86e9, goal: 3e9, days: 15 },
  { id: 'hoc-bong-tiep-buoc', title: 'Học bổng tiếp bước đến trường cho học sinh nghèo vượt khó', place: 'Nghệ An', priority: 'low', field: 'Giáo dục & Khuyến học', img: PIMG + 'image(20261029-093040).png', raised: 342e6, goal: 600e6, days: 52 },
  { id: 'xe-lan-nguoi-khuyet-tat', title: 'Xe lăn cho người khuyết tật', place: 'Thái Bình', priority: 'low', field: 'Trợ giúp nhân đạo', img: PIMG + 'image.png', raised: 96e6, goal: 250e6, days: 38 },
  { id: 'sinh-ke-phu-nu-vung-nui', title: 'Sinh kế cho phụ nữ đơn thân vùng núi', place: 'Nghệ An', priority: 'medium', field: 'Sinh kế & Nhà ở', img: PIMG + 'Kho%E1%BA%A3nh%20Kh%E1%BA%AFc%20Trao%20G%E1%BB%ADi%20Y%C3%AAu%20Th%C6%B0%C6%A1ng.png', raised: 132e6, goal: 250e6, days: 41 },
  { id: 'cau-dan-sinh-vung-lu', title: 'Cầu dân sinh cho bà con vùng lũ', place: 'Đà Nẵng', priority: 'low', field: 'Cứu trợ thiên tai', img: PIMG + '5f7c45a6-e2a9-48f8-8a3f-8d3cbd503375.png', raised: 720e6, goal: 1.8e9, days: 22 },
  { id: 'bep-an-0-dong', title: 'Bếp ăn 0 đồng tại bệnh viện tuyến tỉnh', place: 'Hà Tĩnh', priority: 'medium', field: 'Trợ giúp nhân đạo', img: PIMG + 'photo-3-16722031623611945449954.png', raised: 210e6, goal: 360e6, days: 28 },
  { id: 'trung-thu-vung-cao', title: 'Trung thu cho em vùng cao', place: 'Lai Châu', priority: 'low', field: 'Trẻ em - Biên giới', img: PIMG + '72ad1836-57d6-41e3-aad3-6638cbc4c87e.png', raised: 78e6, goal: 120e6, days: 9 },
  { id: 'giot-mau-mua-thu', title: 'Giọt máu nghĩa tình mùa thu', place: 'Hà Nội', priority: 'medium', field: 'Hiến máu nhân đạo', img: PIMG + 'tr%E1%BA%BB-em-v%C3%B9ng-cao-%E1%BA%A3nh-b%C3%B9i-tu%E1%BA%A5n-h%E1%BA%A3i-copy.jpg', raised: 1850, goal: 3000, unit: 'đơn vị máu', days: 16 },
  { id: 'tet-nhan-ai-2027', title: 'Tết nhân ái 2027 cho hộ nghèo', place: 'Hà Tĩnh', priority: 'low', field: 'Trợ giúp nhân đạo', img: PIMG + 'photo-1-1672203155158881380269.png', startIn: 15, raised: 0, goal: 400e6, days: 85 },
];
// ==================== DATA: người vận động (avatar góc phải ảnh thẻ) — MINH HỌA ====================
// kind: hctd (Hội Chữ thập đỏ — logo Hội) · person (cá nhân vận động — ảnh chân dung, Emages/avatar/) · org (tổ chức, doanh nghiệp — logo vuông/tròn, Emages/logo-demo/)
// group: nhóm đối tượng cho bộ lọc "Tất cả đối tượng" trang danh sách — Cá nhân · Tổ chức · Quỹ nhân đạo (Hội và các quỹ)
// Khi triển khai: lấy từ tài khoản tạo chiến dịch. Chương trình không gán owner → mặc định Hội Chữ thập đỏ.
const OWNERS = {
  hctd: { name: 'Hội Chữ thập đỏ Việt Nam', kind: 'hctd', group: 'Quỹ nhân đạo', avatar: 'Emages/logo-hctd-mark.svg' },
  'tran-thu-ha': { name: 'Trần Thu Hà', kind: 'person', group: 'Cá nhân', avatar: 'Emages/avatar/tran-thu-ha.jpg' },
  'pham-gia-huy': { name: 'Phạm Gia Huy', kind: 'person', group: 'Cá nhân', avatar: 'Emages/avatar/pham-gia-huy.jpg' },
  'nguyen-minh-anh': { name: 'Nguyễn Minh Anh', kind: 'person', group: 'Cá nhân', avatar: 'Emages/avatar/nguyen-minh-anh.jpg' },
  'hoang-mai-linh': { name: 'Hoàng Mai Linh', kind: 'person', group: 'Cá nhân', avatar: 'Emages/avatar/hoang-mai-linh.jpg' },
  'le-quoc-bao': { name: 'Lê Quốc Bảo', kind: 'person', group: 'Cá nhân', avatar: 'Emages/avatar/le-quoc-bao.jpg' },
  'an-phat': { name: 'Công ty Cổ phần An Phát', kind: 'org', group: 'Tổ chức', avatar: 'Emages/logo-demo/an-phat.svg' },
  'hy-vong-xanh': { name: 'Quỹ Hy vọng Xanh', kind: 'org', group: 'Quỹ nhân đạo', avatar: 'Emages/logo-demo/hy-vong-xanh.svg' },
  'doanh-nghiep-tre': { name: 'Hội Doanh nghiệp trẻ', kind: 'org', group: 'Tổ chức', avatar: 'Emages/logo-demo/doanh-nghiep-tre.svg' },
};
// Gán minh họa theo thứ tự chương trình (xen kẽ Hội · cá nhân · tổ chức) — chương trình có owner riêng thì dùng owner đó
const OWNER_DEMO = ['hctd', 'tran-thu-ha', 'an-phat', 'hctd', 'pham-gia-huy', 'hy-vong-xanh', 'nguyen-minh-anh', 'doanh-nghiep-tre', 'hctd', 'hoang-mai-linh', 'an-phat', 'le-quoc-bao', 'hy-vong-xanh'];

// ---------- Định dạng: tiền rút gọn (tỷ / triệu ₫), số lượng theo đơn vị ----------
const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const money = (n) => (!n ? '0 ₫' : n >= 1e9 ? `${nf.format(Math.round(n / 1e7) / 100)} tỷ ₫` : `${nf.format(Math.round(n / 1e6))} triệu ₫`);
const amount = (p, n) => (p.unit ? `${nf.format(n)} ${p.unit}` : money(n));
const fullAmount = (p, n) => (p.unit ? `${nf.format(n)} ${p.unit}` : `${nf.format(n)} ₫`);
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
// Trạng thái thời gian: sắp diễn ra (startIn > 0) → chữ xanh "Sắp diễn ra" · sắp kết thúc (còn dưới 1 tuần, 1–6 ngày) → "Còn N ngày" chữ vàng cảnh báo
const DAYS_WARN = 7;
const upcoming = (p) => p.startIn > 0;
const endingSoon = (p) => !upcoming(p) && p.days > 0 && p.days < DAYS_WARN;
// Nội dung ô thời gian trên thẻ: [class trạng thái, biểu tượng, chữ]
const daysInfo = (p) => (upcoming(p) ? ['is-upcoming', 'calendar', 'Sắp diễn ra']
  : p.days <= 0 ? ['', 'clock', 'Đã kết thúc'] : [endingSoon(p) ? 'is-warning' : '', 'clock', `Còn ${p.days} ngày`]);
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

// ---------- Mã chương trình (SRS: CT-2026-CB-001): CT-năm-viết tắt địa bàn-số thứ tự · tỷ lệ % đạt ----------
const placeCode = (place) => fold(place.replace(/^TP\.\s*/, '')).split(/\s+/).map((w) => w[0]).join('').toUpperCase();
PROGRAMS.forEach((p, i) => {
  p.order = i;
  p.pct = Math.round((p.raised / p.goal) * 100);
  p.code = `CT-2026-${placeCode(p.place)}-${String(i + 1).padStart(3, '0')}`;
  p.owner = OWNERS[p.owner] || OWNERS[OWNER_DEMO[i % OWNER_DEMO.length]] || OWNERS.hctd;
});

// ==================== THẺ CHƯƠNG TRÌNH (dùng chung) ====================
// ---------- Thẻ: ảnh + nhãn mức độ ưu tiên + avatar người vận động (góc phải trên: logo Hội / ảnh cá nhân / logo tổ chức) · địa bàn · tên · đã đạt / mục tiêu · thanh tiến độ · Đạt % · Còn N ngày · Ủng hộ ngay ----------
// heading: cấp tiêu đề thẻ (h3 ở trang danh sách, dưới tiêu đề h2 của khối)
const programCard = (p, heading = 'h3') => {
  const pr = PRIORITY[p.priority];
  const href = `chuong-trinh.html?id=${p.id}`;
  const ended = p.days <= 0;
  return `<article class="cp-card">
    <div class="cp-card-media">
      <img src="${IMG}${p.img}" alt="" loading="lazy" />
      <span class="cp-priority ${pr.cls}"><span class="cp-dot" aria-hidden="true"></span>${pr.label}</span>
      <img class="cp-card-mark is-${p.owner.kind}" src="${p.owner.avatar}" alt="Người vận động: ${escapeHtml(p.owner.name)}" title="Người vận động: ${escapeHtml(p.owner.name)}" width="36" height="36" loading="lazy" />
    </div>
    <div class="cp-card-body">
      <p class="cp-place">${icon('pin')}${escapeHtml(p.place)}</p>
      <${heading} class="cp-card-title"><a class="stretched" href="${href}">${escapeHtml(p.title)}</a></${heading}>
      <div class="cp-figures">
        <strong class="cp-raised" title="${fullAmount(p, p.raised)}">${amount(p, p.raised)}</strong>
        <span class="cp-goal" title="Mục tiêu ${fullAmount(p, p.goal)}">${amount(p, p.goal)}</span>
      </div>
      <div class="cp-bar" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(p.pct, 100)}" aria-valuetext="Đã đạt ${p.pct}% mục tiêu"><span style="width:${Math.min(p.pct, 100)}%"></span></div>
      <div class="cp-meta"><span>Đạt ${p.pct}%</span><span class="cp-days ${daysInfo(p)[0]}"${upcoming(p) ? ` title="Mở nhận ủng hộ sau ${p.startIn} ngày"` : ''}>${icon(daysInfo(p)[1])}${daysInfo(p)[2]}</span></div>
      <a class="button button-primary button-small cp-donate" href="${href}">${icon('heart-solid')}Ủng hộ ngay</a>
    </div>
  </article>`;
};
