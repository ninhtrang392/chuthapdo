// ==================== DỮ LIỆU CHƯƠNG TRÌNH THIỆN NGUYỆN (dùng chung) ====================
// Dùng chung cho trang danh sách (chuong-trinh-thien-nguyen.js) và trang chi tiết (chuong-trinh.js).
// Dữ liệu minh họa — khi triển khai thật, lấy danh sách chương trình đang gây quỹ từ CMS/API.

// ==================== DATA: chương trình đang gây quỹ (minh họa) ====================
// id: mã trang chi tiết chuong-trinh.html?id= (giữ nguyên các mã đã dùng ở trang chủ, bản đồ số, hồ sơ)
// raised / goal: số tiền (đồng) hoặc số lượng theo unit (ví dụ đơn vị máu); days: số ngày còn lại (0 = đã kết thúc)
// banner (tùy chọn): ảnh banner riêng ở đầu trang chi tiết, trong Emages/Chương trình/ — không có thì banner dùng ảnh chương trình (img)
// photos (tùy chọn): ảnh riêng cho bộ ảnh trang chi tiết (sau ảnh img), trong Emages/ảnh minh họa/ — không có thì lấy ngẫu nhiên ảnh minh họa chung
const IMG = 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/';
const BANNER_IMG = 'Emages/Ch%C6%B0%C6%A1ng%20tr%C3%ACnh/';
const PRIORITY = {
  urgent: { label: 'Khẩn cấp', cls: 'is-urgent' },
  medium: { label: 'Trung bình', cls: 'is-medium' },
  low: { label: 'Thấp', cls: 'is-low' },
};
const PROGRAMS = [
  { id: 'xay-truong-ha-giang', title: 'Chung tay xây trường vùng cao Hà Giang', place: 'Hà Giang', priority: 'urgent', field: 'Giáo dục & Khuyến học', img: 'nu-cuoi-be-gai-vung-cao.jpg', banner: 'nu-cuoi-be-gai-vung-cao.jpg', photos: ['tre-em-vung-cao-nu-cuoi.jpg', 'tre-em-vung-cao-nhan-qua.jpg', 'tre-em-vung-cao-den-truong.jpg', 'tre-em-vung-cao-vui-choi.jpg'], raised: 3.4e9, goal: 7e9, days: 8 },
  { id: 'tiep-suc-mua-lu-2026', title: 'Tiếp sức mùa mưa lũ miền Trung 2026', place: 'Quảng Ngãi', priority: 'urgent', field: 'Cứu trợ thiên tai', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 9.2e9, goal: 10e9, days: 12 },
  { id: 'bua-com-yeu-thuong', title: 'Bữa cơm yêu thương cho bệnh nhân nghèo', place: 'Cao Bằng', priority: 'medium', field: 'Y tế - Sức khỏe', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 225e6, goal: 500e6, days: 20 },
  { id: 'ao-am-bien-gioi', title: 'Áo ấm mùa đông cho trẻ em vùng biên giới', place: 'Điện Biên', priority: 'urgent', field: 'Trẻ em - Biên giới', img: 'trao-qua-hoc-sinh.jpg', raised: 400e6, goal: 500e6, days: 5 },
  { id: 'nha-tinh-thuong-ben-tre', title: 'Xây nhà tình thương cho hộ nghèo Bến Tre', place: 'Bến Tre', priority: 'medium', field: 'Sinh kế & Nhà ở', img: '1-1-3-9134.avif', raised: 600e6, goal: 2e9, days: 45 },
  { id: 'tu-sach-cong-dong', title: 'Tủ sách cộng đồng cho học sinh vùng sâu', place: 'Cao Bằng', priority: 'medium', field: 'Giáo dục & Khuyến học', img: '01%201.jpg', raised: 110e6, goal: 200e6, days: 18 },
  { id: 'xe-cuu-thuong-0-dong', title: 'Chuyến xe cứu thương 0 đồng — vững tâm nhân ái', place: 'Quảng Trị', priority: 'low', field: 'Y tế - Sức khỏe', img: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', raised: 275e6, goal: 375e6, days: 30 },
  { id: 'clb-van-hoa-thai-mai-son', title: 'Gây quỹ mở 02 CLB Bảo tồn văn hóa Thái tại 02 điểm trường Mai Sơn', place: 'Sơn La', priority: 'low', field: 'Giáo dục & Khuyến học', img: '1358142_gen-h-235_1777566365.jpg', raised: 1.24e9, goal: 3e9, days: 60 },
  { id: 'lu-lut-mien-trung', title: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung', place: 'Quảng Trị', priority: 'urgent', field: 'Cứu trợ thiên tai', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 1.245e9, goal: 2e9, days: 18 },
  { id: 'nuoc-sach-han-man', title: 'Nước sạch cho người dân vùng hạn mặn', place: 'Vĩnh Long', priority: 'medium', field: 'Nước sạch & Vệ sinh', img: '1358142_gen-h-235_1777566365.jpg', raised: 410e6, goal: 1.2e9, days: 25 },
  { id: 'tiep-suc-den-truong', title: 'Tiếp sức đến trường vùng cao', place: 'Cao Bằng', priority: 'medium', field: 'Giáo dục & Khuyến học', img: '3.-028ae9de1f.jpg', raised: 328.5e6, goal: 800e6, days: 34 },
  { id: 'hien-mau-mua-he', title: 'Giọt hồng yêu thương — tiếp sức kho máu mùa hè', place: 'Hà Nội', priority: 'medium', field: 'Hiến máu nhân đạo', img: 'z765570465791.jpg', raised: 3120, goal: 5000, unit: 'đơn vị máu', days: 12 },
  { id: 'mai-am-nhan-ai', title: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn', place: 'Tuyên Quang', priority: 'low', field: 'Sinh kế & Nhà ở', img: '1-1-3-9134.avif', raised: 860e6, goal: 1.5e9, days: 40 },
  { id: 'so-cap-cuu-ven-bien', title: 'Sơ cấp cứu cộng đồng ven biển', place: 'Quảng Bình', priority: 'medium', field: 'Y tế - Sức khỏe', img: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', raised: 60e6, goal: 150e6, days: 70 },
  { id: 'nuoc-sach-diem-truong', title: 'Nước sạch cho điểm trường vùng cao', place: 'Lào Cai', priority: 'medium', field: 'Nước sạch & Vệ sinh', img: 'trao-qua-hoc-sinh.jpg', raised: 185e6, goal: 420e6, days: 26 },
  { id: 'phau-thuat-tim-tre-em', title: 'Phẫu thuật tim cho trẻ em có hoàn cảnh khó khăn', place: 'TP. Hồ Chí Minh', priority: 'medium', field: 'Y tế - Sức khỏe', img: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', raised: 1.86e9, goal: 3e9, days: 15 },
  { id: 'hoc-bong-tiep-buoc', title: 'Học bổng tiếp bước đến trường cho học sinh nghèo vượt khó', place: 'Nghệ An', priority: 'low', field: 'Giáo dục & Khuyến học', img: '3.-028ae9de1f.jpg', raised: 342e6, goal: 600e6, days: 52 },
  { id: 'xe-lan-nguoi-khuyet-tat', title: 'Xe lăn cho người khuyết tật', place: 'Thái Bình', priority: 'low', field: 'Trợ giúp nhân đạo', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 96e6, goal: 250e6, days: 38 },
  { id: 'sinh-ke-phu-nu-vung-nui', title: 'Sinh kế cho phụ nữ đơn thân vùng núi', place: 'Nghệ An', priority: 'medium', field: 'Sinh kế & Nhà ở', img: '1358142_gen-h-235_1777566365.jpg', raised: 132e6, goal: 250e6, days: 41 },
  { id: 'cau-dan-sinh-vung-lu', title: 'Cầu dân sinh cho bà con vùng lũ', place: 'Đà Nẵng', priority: 'low', field: 'Cứu trợ thiên tai', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 720e6, goal: 1.8e9, days: 22 },
  { id: 'bep-an-0-dong', title: 'Bếp ăn 0 đồng tại bệnh viện tuyến tỉnh', place: 'Hà Tĩnh', priority: 'medium', field: 'Trợ giúp nhân đạo', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 210e6, goal: 360e6, days: 28 },
  { id: 'trung-thu-vung-cao', title: 'Trung thu cho em vùng cao', place: 'Lai Châu', priority: 'low', field: 'Trẻ em - Biên giới', img: 'trao-qua-hoc-sinh.jpg', raised: 78e6, goal: 120e6, days: 9 },
  { id: 'giot-mau-mua-thu', title: 'Giọt máu nghĩa tình mùa thu', place: 'Hà Nội', priority: 'medium', field: 'Hiến máu nhân đạo', img: 'z765570465791.jpg', raised: 1850, goal: 3000, unit: 'đơn vị máu', days: 16 },
  { id: 'tet-nhan-ai-2027', title: 'Tết nhân ái 2027 cho hộ nghèo', place: 'Hà Tĩnh', priority: 'low', field: 'Trợ giúp nhân đạo', img: '01%201.jpg', raised: 95e6, goal: 400e6, days: 85 },
];
// ---------- Định dạng: tiền rút gọn (tỷ / triệu ₫), số lượng theo đơn vị ----------
const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const money = (n) => (n >= 1e9 ? `${nf.format(Math.round(n / 1e7) / 100)} tỷ ₫` : `${nf.format(Math.round(n / 1e6))} triệu ₫`);
const amount = (p, n) => (p.unit ? `${nf.format(n)} ${p.unit}` : money(n));
const fullAmount = (p, n) => (p.unit ? `${nf.format(n)} ${p.unit}` : `${nf.format(n)} ₫`);
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

// ---------- Mã chương trình (SRS: CT-2026-CB-001): CT-năm-viết tắt địa bàn-số thứ tự · tỷ lệ % đạt ----------
const placeCode = (place) => fold(place.replace(/^TP\.\s*/, '')).split(/\s+/).map((w) => w[0]).join('').toUpperCase();
PROGRAMS.forEach((p, i) => {
  p.order = i;
  p.pct = Math.round((p.raised / p.goal) * 100);
  p.code = `CT-2026-${placeCode(p.place)}-${String(i + 1).padStart(3, '0')}`;
});

// ==================== THẺ CHƯƠNG TRÌNH (dùng chung) ====================
// ---------- Thẻ: ảnh + nhãn mức độ ưu tiên + logo Hội (góc phải trên, như trang chủ) · địa bàn · tên · đã đạt / mục tiêu · thanh tiến độ · Đạt % · Còn N ngày · Ủng hộ ngay ----------
// heading: cấp tiêu đề thẻ (h3 ở trang danh sách, dưới tiêu đề h2 của khối)
const programCard = (p, heading = 'h3') => {
  const pr = PRIORITY[p.priority];
  const href = `chuong-trinh.html?id=${p.id}`;
  const ended = p.days <= 0;
  return `<article class="cp-card">
    <div class="cp-card-media">
      <img src="${IMG}${p.img}" alt="" loading="lazy" />
      <span class="cp-priority ${pr.cls}"><span class="cp-dot" aria-hidden="true"></span>${pr.label}</span>
      <img class="cp-card-mark" src="Emages/logo-hctd-mark.svg" alt="" width="36" height="36" />
    </div>
    <div class="cp-card-body">
      <p class="cp-place">${icon('pin')}${escapeHtml(p.place)}</p>
      <${heading} class="cp-card-title"><a class="stretched" href="${href}">${escapeHtml(p.title)}</a></${heading}>
      <div class="cp-figures">
        <strong class="cp-raised" title="${fullAmount(p, p.raised)}">${amount(p, p.raised)}</strong>
        <span class="cp-goal" title="Mục tiêu ${fullAmount(p, p.goal)}">${amount(p, p.goal)}</span>
      </div>
      <div class="cp-bar" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(p.pct, 100)}" aria-valuetext="Đã đạt ${p.pct}% mục tiêu"><span style="width:${Math.min(p.pct, 100)}%"></span></div>
      <div class="cp-meta"><span>Đạt ${p.pct}%</span><span>${icon('clock')}${ended ? 'Đã kết thúc' : `Còn ${p.days} ngày`}</span></div>
      <a class="button button-primary button-small cp-donate" href="${href}">Ủng hộ ngay</a>
    </div>
  </article>`;
};
