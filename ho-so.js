// ==================== TRANG QUẢN LÝ HỒ SƠ ====================
// Dữ liệu minh họa — khi triển khai thật, lấy từ tài khoản người dùng đã đăng nhập.

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

// ==================== TOAST: thông báo ngắn ====================
// Loại (UI KIT Toast): success (mặc định) · info · warning · error — icon tròn theo loại, vòng đếm ngược quanh nút đóng chạy hết khi toast tự ẩn
const toast = document.querySelector('.pf-toast');
const TOAST_TIME = 2800;
const TOAST_GLYPH = { success: '<svg class="icon" aria-hidden="true"><use href="#check"/></svg>', info: 'i', warning: '!', error: '!' };
let toastTimer;
const hideToast = () => { clearTimeout(toastTimer); toast.hidden = true; };
const showToast = (message, type = 'success') => {
  toast.className = `pf-toast is-${type}`;
  toast.querySelector('.pf-toast-icon').innerHTML = TOAST_GLYPH[type];
  toast.querySelector('.pf-toast-text').textContent = message;
  toast.style.setProperty('--toast-time', `${TOAST_TIME}ms`);
  // Chạy lại vòng đếm ngược từ đầu cho mỗi thông báo
  const ring = toast.querySelector('.pf-toast-ring circle');
  ring.style.animation = 'none'; void ring.getBoundingClientRect(); ring.style.animation = '';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, TOAST_TIME);
};
toast.querySelector('.pf-toast-close').addEventListener('click', hideToast);

// ==================== HELPERS ====================
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Bỏ dấu để tìm "ha tinh" vẫn ra "Hà Tĩnh"
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const viDate = (iso) => iso.split('-').reverse().join('/');
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const fillOptions = (select, values) => values.forEach((value) => select.add(new Option(value, value)));
const kv = (rows) => `<dl class="pf-kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
// Bước chưa có ngày (đang chờ xử lý): hiện chữ "Đang chờ" thay cho ngày
const timeline = (items) => `<ol class="pf-timeline">${items.map((i) => `<li class="${i.cls || ''}">${i.date ? `<time datetime="${i.date}">${viDate(i.date)}</time>` : '<span>Đang chờ</span>'}<strong>${escapeHtml(i.title)}</strong>${i.meta ? `<span>${escapeHtml(i.meta)}</span>` : ''}</li>`).join('')}</ol>`;

// ==================== DATA: chương trình & hồ sơ người yếu thế (minh họa) ====================
// Bảng “Chương trình của tôi” hiện đủ trường như mẫu datatable (mã, ảnh, tên + mô tả, lĩnh vực, đơn vị, người phụ trách,
// địa bàn, mục tiêu, thời gian triển khai, trạng thái, ngày tạo); màn chi tiết thêm tiến độ, số đã nhận và lịch sử xử lý.
const IMG = 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/';
// Ảnh minh họa (tên tệp trong IMG) hoặc ảnh người dùng vừa tải lên trong phiên (blob:)
const imgSrc = (src) => (/^(blob|data):/.test(src) ? src : `${IMG}${src}`);
// 6 trạng thái theo SRS (mục 3.1 — Quy tắc trạng thái); thứ tự khai báo = thứ tự tab: Nháp · Chờ phê duyệt · Từ chối · Sắp diễn ra · Đang gây quỹ · Hoàn thành
const PROGRAM_STATUS = {
  draft: { label: 'Nháp', tone: 'neutral', slug: 'ban-nhap' },
  pending: { label: 'Chờ phê duyệt', tone: 'orange', slug: 'cho-duyet' },
  rejected: { label: 'Từ chối', tone: 'red', slug: 'tu-choi' },
  upcoming: { label: 'Sắp diễn ra', tone: 'purple', slug: 'sap-dien-ra' },
  active: { label: 'Đang gây quỹ', tone: 'green', slug: 'dang-gay-quy' },
  done: { label: 'Hoàn thành', tone: 'blue', slug: 'hoan-thanh' },
};
const PROGRAMS = [
  { code: 'CT-2026-040', img: '3.-028ae9de1f.jpg', name: 'Tiếp sức đến trường vùng cao', desc: 'Học bổng, sách vở và áo ấm cho 1.200 học sinh các điểm trường vùng cao huyện Đồng Văn trước mùa đông.', field: 'Giáo dục & Khuyến học', tone: 'blue', unit: 'Hội CTĐ Huyện Đồng Văn', owner: 'Vàng Seo Sùng', area: 'Hà Giang', goal: '800 triệu ₫', raised: '680 triệu ₫', pct: 85, period: '28/09/2026 – 20/11/2026', note: 'Đạt 85% mục tiêu', status: 'active', created: '2026-09-28', updated: '2026-10-12', detail: 'tiep-suc-den-truong' },
  { code: 'CT-2026-039', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', name: 'Bữa cơm yêu thương bệnh viện', desc: 'Cung cấp 30.000 suất ăn miễn phí cho bệnh nhân nghèo và người nhà tại 3 bệnh viện tuyến tỉnh.', field: 'Y tế - Sức khỏe', tone: 'orange', unit: 'Hội CTĐ TP. Hồ Chí Minh', owner: 'Trần Mỹ Linh', area: 'TP. Hồ Chí Minh', goal: '500 triệu ₫', raised: '0 ₫', pct: 0, period: '01/11/2026 – 01/05/2027', note: 'Chờ duyệt hồ sơ, chưa mở vận động', status: 'pending', created: '2026-09-25', updated: '2026-10-08' },
  { code: 'CT-2026-038', img: '1358142_gen-h-235_1777566365.jpg', name: 'Tết ấm cho người vô gia cư 2027', desc: 'Tặng 2.000 suất quà Tết và chăn ấm cho người vô gia cư, lao động nghèo tại TP. Hồ Chí Minh.', field: 'Trợ giúp nhân đạo', tone: 'red', unit: 'Hội CTĐ TP. Hồ Chí Minh', owner: 'Trần Mỹ Linh', area: 'TP. Hồ Chí Minh', goal: '600 triệu ₫', raised: '0 ₫', pct: 0, period: '15/11/2026 – 15/02/2027', note: 'Đã được Hội phê duyệt, chưa đến thời gian tiếp nhận đóng góp', status: 'upcoming', created: '2026-09-22', updated: '2026-10-20' },
  { code: 'CT-2026-037', img: 'trao-qua-hoc-sinh.jpg', name: 'Áo ấm mùa đông trẻ em biên giới', desc: 'May và tặng 3.500 áo ấm cho trẻ em các xã biên giới tỉnh Lào Cai.', field: 'Trẻ em - Biên giới', tone: 'green', unit: 'Hội CTĐ Tỉnh Lào Cai', owner: 'Đỗ Thu Hà', area: 'Lào Cai', goal: '500 triệu ₫', raised: '460 triệu ₫', pct: 92, period: '18/09/2026 – 15/12/2026', note: 'Đạt 92% mục tiêu', status: 'active', created: '2026-09-18', updated: '2026-10-11' },
  { code: 'CT-2026-035', img: '01%201.jpg', name: 'Tủ sách cộng đồng vùng sâu', desc: 'Xây dựng 20 tủ sách cộng đồng tại các thôn đặc biệt khó khăn.', field: 'Giáo dục & Khuyến học', tone: 'blue', unit: 'Hội CTĐ Tỉnh Đắk Lắk', owner: 'Đặng Minh Tuấn', area: 'Đắk Lắk', goal: '200 triệu ₫', raised: '0 ₫', pct: 0, period: 'Chưa kích hoạt', note: 'Hồ sơ chưa đáp ứng tiêu chí minh bạch tài chính', status: 'rejected', created: '2026-09-05', updated: '2026-09-15' },
  { code: 'CT-2026-031', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', name: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung', desc: 'Nhu yếu phẩm, nước sạch và hỗ trợ sửa chữa nhà cửa cho các hộ dân bị ảnh hưởng nặng sau lũ.', field: 'Cứu trợ thiên tai', tone: 'red', unit: 'Hội CTĐ Tỉnh Quảng Trị', owner: 'Lê Văn Hải', area: 'Quảng Trị', goal: '2 tỷ ₫', raised: '1,24 tỷ ₫', pct: 62, period: '02/09/2026 – 30/11/2026', note: 'Đạt 62% mục tiêu', status: 'active', created: '2026-09-02', updated: '2026-10-13', detail: 'lu-lut-mien-trung' },
  { code: 'CT-2026-028', img: '1358142_gen-h-235_1777566365.jpg', name: 'Nước sạch cho người dân vùng hạn mặn', desc: 'Lắp 120 bồn chứa và máy lọc nước cho hộ dân vùng hạn mặn.', field: 'Nước sạch & Vệ sinh', tone: 'blue', unit: 'Hội CTĐ Tỉnh Bến Tre', owner: 'Nguyễn Thị Lan', area: 'Bến Tre', goal: '500 triệu ₫', raised: '0 ₫', pct: 0, period: '15/10/2026 – 15/01/2027', note: 'Cần bổ sung kế hoạch giải ngân', status: 'pending', created: '2026-08-20', updated: '2026-10-05', detail: 'nuoc-sach-han-man' },
  { code: 'CT-2026-019', img: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', name: 'Khám bệnh, cấp thuốc miễn phí cho người cao tuổi', desc: 'Khám sức khỏe và cấp thuốc miễn phí cho 2.000 người cao tuổi.', field: 'Y tế - Sức khỏe', tone: 'orange', unit: 'Hội CTĐ Tỉnh Hà Tĩnh', owner: 'Nguyễn Ngọc Trâm', area: 'Hà Tĩnh', goal: '300 triệu ₫', raised: '320 triệu ₫', pct: 107, period: '01/06/2026 – 30/08/2026', note: 'Hoàn thành, đã công khai sao kê', status: 'done', created: '2026-05-28', updated: '2026-09-02', detail: 'kham-benh-nguoi-cao-tuoi' },
  { code: 'CT-2026-012', img: 'z765570465791.jpg', name: 'Giọt hồng yêu thương — tiếp sức kho máu mùa hè', desc: 'Ngày hội hiến máu tại 6 điểm trong tỉnh, bổ sung kho máu mùa hè.', field: 'Hiến máu nhân đạo', tone: 'red', unit: 'Hội CTĐ Tỉnh Hà Tĩnh', owner: 'Nguyễn Ngọc Trâm', area: 'Hà Tĩnh', goal: '100 đơn vị máu', raised: '120 đơn vị máu', pct: 120, period: '01/06/2026 – 15/07/2026', note: 'Hoàn thành, đã công khai kết quả', status: 'done', created: '2026-05-20', updated: '2026-07-20', detail: 'hien-mau-mua-he' },
  { code: 'CT-2026-008', img: '1-1-3-9134.avif', name: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn', desc: 'Xây mới 3 căn nhà nhân ái cho hộ nghèo, người cao tuổi neo đơn.', field: 'Sinh kế & Nhà ở', tone: 'green', unit: 'Hội CTĐ Tỉnh Nghệ An', owner: 'Phan Văn Đức', area: 'Nghệ An', goal: '300 triệu ₫', raised: '315 triệu ₫', pct: 105, period: '10/03/2026 – 30/05/2026', note: 'Hoàn thành, đã bàn giao 3 căn nhà', status: 'done', created: '2026-03-10', updated: '2026-06-05', detail: 'mai-am-nhan-ai' },
  { code: 'CT-2026-005', img: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', name: 'Sơ cấp cứu cộng đồng ven biển', desc: 'Tập huấn sơ cấp cứu và trang bị túi cứu thương cho 40 thôn ven biển.', field: 'Y tế - Sức khỏe', tone: 'orange', unit: 'Hội CTĐ Tỉnh Quảng Bình', owner: 'Hoàng Thị Mai', area: 'Quảng Bình', goal: '150 triệu ₫', raised: '60 triệu ₫', pct: 40, period: '15/02/2026 – 31/12/2026', note: 'Đạt 40% mục tiêu', status: 'active', created: '2026-02-15', updated: '2026-10-01' },
  { code: 'NHAP-1', img: 'trao-qua-hoc-sinh.jpg', name: 'Sinh kế cho phụ nữ đơn thân', desc: 'Hỗ trợ vốn chăn nuôi và tập huấn kỹ thuật cho 50 hộ phụ nữ đơn thân.', field: 'Sinh kế & Nhà ở', tone: 'green', unit: 'Hội CTĐ Huyện Kỳ Sơn', owner: 'Lô Thị Hương', area: 'Nghệ An', goal: '250 triệu ₫', raised: '0 ₫', pct: null, period: 'Chưa xác định', note: 'Bản nháp, chưa gửi duyệt', status: 'draft', created: '2026-01-22', updated: '2026-01-25' },
  { code: 'CT-2026-001', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', name: 'Tết nhân ái 2026', desc: 'Tặng 1.500 suất quà Tết cho hộ nghèo, hộ khó khăn trong tỉnh.', field: 'Trợ giúp nhân đạo', tone: 'red', unit: 'Hội CTĐ Tỉnh Hà Tĩnh', owner: 'Nguyễn Ngọc Trâm', area: 'Hà Tĩnh', goal: '400 triệu ₫', raised: '448 triệu ₫', pct: 112, period: '05/01/2026 – 15/02/2026', note: 'Hoàn thành, đã công khai sao kê', status: 'done', created: '2026-01-05', updated: '2026-02-20' },
];
// Đối tượng tạo · mục tiêu quy ra triệu đồng (để lọc “Mục tiêu quyên góp”; null = mục tiêu không tính bằng tiền)
// · Thời gian tiếp nhận vận động đóng góp [ngày bắt đầu, ngày kết thúc] (null = bản nháp chưa nhập)
const PROGRAM_EXTRA = {
  'CT-2026-040': ['Tổ chức', 800, ['2026-10-01', '2026-11-20']], 'CT-2026-039': ['Cá nhân', 500, ['2026-11-01', '2026-12-25']],
  'CT-2026-038': ['Tổ chức', 600, ['2026-11-15', '2027-01-10']], 'CT-2026-037': ['Tổ chức', 500, ['2026-10-15', '2026-12-10']],
  'CT-2026-035': ['Tổ chức', 200, ['2026-09-20', '2026-11-10']], 'CT-2026-031': ['Tổ chức', 2000, ['2026-09-10', '2026-11-05']],
  'CT-2026-028': ['Tổ chức', 500, ['2026-11-01', '2026-12-20']], 'CT-2026-019': ['Cá nhân', 300, ['2026-06-01', '2026-07-30']],
  'CT-2026-012': ['Cá nhân', null, ['2026-06-01', '2026-07-15']], 'CT-2026-008': ['Tổ chức', 300, ['2026-03-10', '2026-05-08']],
  'CT-2026-005': ['Cá nhân', 150, ['2026-10-05', '2026-11-30']], 'NHAP-1': ['Cá nhân', 250, null],
  'CT-2026-001': ['Tổ chức', 400, ['2026-01-05', '2026-02-15']],
};
PROGRAMS.forEach((p) => { [p.creator, p.goalValue, p.raise] = PROGRAM_EXTRA[p.code]; });
// Sau khi Hội duyệt, trạng thái theo Thời gian tiếp nhận (SRS 2.1, NL07, NL08): trước Ngày bắt đầu — Sắp diễn ra;
// từ Ngày bắt đầu đến Ngày kết thúc — Đang gây quỹ; sau Ngày kết thúc — Hoàn thành. Tính lại mỗi lần tải trang (tự chuyển trạng thái).
const APPROVED_STATUS = ['upcoming', 'active', 'done'];
const statusByRaise = ([from, to], today = new Date().toLocaleDateString('sv-SE')) => (today < from ? 'upcoming' : today > to ? 'done' : 'active');
PROGRAMS.forEach((p) => { if (APPROVED_STATUS.includes(p.status) && p.raise) p.status = statusByRaise(p.raise); });
const VULNERABLE_STATUS = {
  done: { label: 'Đã xác minh', tone: 'green', slug: 'da-xac-minh' },
  wait: { label: 'Chờ xác minh', tone: 'orange', slug: 'cho-xac-minh' },
  need: { label: 'Cần bổ sung', tone: 'red', slug: 'can-bo-sung' },
};
const VULNERABLE = [
  { code: 'HS-0231', initials: 'TB', name: 'Trần Văn Bình', age: 78, gender: 'Nam', type: 'Người cao tuổi neo đơn', area: 'Hương Khê, Hà Tĩnh', need: 'Thuốc men, chăm sóc y tế định kỳ', situation: 'Sống một mình, mắc bệnh tim mạn tính, không có lương hưu.', officer: 'Phan Thị Hạnh', status: 'done', created: '2026-09-20', updated: '2026-10-02' },
  { code: 'HS-0228', initials: 'LH', name: 'Lê Thị Hoa', age: 9, gender: 'Nữ', type: 'Trẻ em mồ côi', area: 'Hải Lăng, Quảng Trị', need: 'Học phí, đồ dùng học tập', situation: 'Mồ côi cả cha mẹ sau lũ, đang ở với bà ngoại 70 tuổi.', officer: 'Lê Văn Hải', status: 'done', created: '2026-09-10', updated: '2026-09-28' },
  { code: 'HS-0225', initials: 'NS', name: 'Nguyễn Văn Sáu', age: 45, gender: 'Nam', type: 'Người khuyết tật', area: 'Quảng Điền, Huế', need: 'Xe lăn, hỗ trợ sinh kế', situation: 'Liệt hai chân sau tai nạn lao động, là lao động chính trong gia đình.', officer: 'Trần Đức Minh', status: 'wait', created: '2026-09-25', updated: '2026-09-25' },
  { code: 'HS-0219', initials: 'PM', name: 'Phạm Thị Mai', age: 62, gender: 'Nữ', type: 'Hộ nghèo', area: 'Kỳ Sơn, Nghệ An', need: 'Sửa nhà, lương thực', situation: 'Nhà tạm bị hư hỏng nặng sau bão, nuôi hai cháu nhỏ.', officer: 'Lô Thị Hương', status: 'need', created: '2026-09-12', updated: '2026-09-20', missing: ['Ảnh hiện trạng nhà ở', 'Xác nhận hộ nghèo năm 2026 của UBND xã'] },
  { code: 'HS-0214', initials: 'HN', name: 'Hoàng Văn Nam', age: 15, gender: 'Nam', type: 'Trẻ em có hoàn cảnh khó khăn', area: 'Bát Xát, Lào Cai', need: 'Áo ấm, học bổng', situation: 'Bố mất, mẹ đi làm xa, học lực khá, đi bộ 7 km đến trường.', officer: 'Đỗ Thu Hà', status: 'done', created: '2026-09-01', updated: '2026-09-12' },
  { code: 'HS-0209', initials: 'VT', name: 'Võ Thị Tám', age: 81, gender: 'Nữ', type: 'Người cao tuổi neo đơn', area: 'Lệ Thủy, Quảng Bình', need: 'Lương thực, thăm hỏi định kỳ', situation: 'Không có con cái, sống bằng trợ cấp xã hội.', officer: 'Hoàng Thị Mai', status: 'wait', created: '2026-09-08', updated: '2026-09-08' },
  { code: 'HS-0203', initials: 'ĐK', name: 'Đinh Văn Khánh', age: 38, gender: 'Nam', type: 'Người khuyết tật', area: 'Mường Lát, Thanh Hóa', need: 'Dụng cụ chỉnh hình', situation: 'Khuyết tật vận động bẩm sinh, cần chân giả để đi lại.', officer: 'Lò Văn Pắng', status: 'done', created: '2026-08-15', updated: '2026-08-30' },
  { code: 'HS-0198', initials: 'LA', name: 'Lò Thị Ánh', age: 6, gender: 'Nữ', type: 'Trẻ em mồ côi', area: 'Mường Nhé, Điện Biên', need: 'Sữa, dinh dưỡng', situation: 'Suy dinh dưỡng độ 2, mồ côi mẹ, bố làm nương xa nhà.', officer: 'Quàng Văn Dũng', status: 'need', created: '2026-08-20', updated: '2026-08-26', missing: ['Giấy khai sinh (bản sao)', 'Phiếu khám dinh dưỡng của trạm y tế xã'] },
];
const findProgram = (code) => PROGRAMS.find((p) => p.code === code);
// Bản nháp chưa được cấp Mã CT (cấp khi gửi phê duyệt); p.code của bản nháp là khóa nội bộ NHAP-n, không hiển thị
const programCodeText = (p) => (p.status === 'draft' ? 'Chưa có mã' : p.code);
// Dữ liệu biểu mẫu Đăng ký của chương trình tạo / lưu nháp trong phiên (mã CT → dữ liệu form): mở lại khi Sửa bản nháp, dựng màn Xem chi tiết
const programRegCache = new Map();
const findVulnerable = (code) => VULNERABLE.find((v) => v.code === code);

// ==================== MENU THAO TÁC ⋮: một menu dùng chung, đặt cạnh nút được bấm ====================
const rowMenu = document.createElement('div');
rowMenu.className = 'pf-menu';
rowMenu.setAttribute('role', 'menu');
rowMenu.hidden = true;
document.body.append(rowMenu);
let menuOwner = null;
const closeRowMenu = ({ focus = false } = {}) => {
  if (rowMenu.hidden) return;
  rowMenu.hidden = true;
  menuOwner?.setAttribute('aria-expanded', 'false');
  if (focus) menuOwner?.focus();
  menuOwner = null;
};
const menuItems = {
  // Sửa, Xóa chỉ cho chương trình Bản nháp (SRS #8.13, NL02, NL03)
  program: (p) => [
    { label: 'Xem chi tiết', icon: 'eye', href: `#chuong-trinh/xem/${p.code}` },
    ...(p.status === 'draft' ? [
      { label: 'Chỉnh sửa', icon: 'pencil', action: () => editProgram(p.code, menuOwner) },
      { label: 'Xóa', icon: 'trash', action: () => deleteProgram(p.code) },
    ] : []),
    ...(p.detail ? [{ label: 'Xem trang công khai', icon: 'arrow', href: `chuong-trinh.html?id=${p.detail}` }] : []),
    { label: 'Xuất báo cáo', icon: 'download', action: () => exportPrograms([p], `${p.code}.csv`) },
  ],
  vulnerable: (v) => [
    { label: 'Xem chi tiết', icon: 'eye', href: `#nguoi-yeu-the/xem/${v.code}` },
    { label: 'Cập nhật hồ sơ', icon: 'pencil', panel: `Cập nhật hồ sơ ${v.code}` },
    ...(v.status !== 'done' ? [{ label: 'Gửi yêu cầu xác minh', icon: 'shield', panel: `Gửi yêu cầu xác minh ${v.code}` }] : []),
  ],
};
const MENU_FIND = { program: (id) => findProgram(id), vulnerable: (id) => findVulnerable(id) };
const openRowMenu = (button) => {
  const record = MENU_FIND[button.dataset.menu]?.(button.dataset.id);
  const items = menuItems[button.dataset.menu](record);
  rowMenu.innerHTML = items.map((item, i) => (item.href
    ? `<a role="menuitem" href="${item.href}">${icon(item.icon)}${item.label}</a>`
    : `<button type="button" role="menuitem" data-index="${i}"${item.panel ? ` data-panel="${escapeHtml(item.panel)}"` : ''}>${icon(item.icon)}${item.label}</button>`)).join('');
  rowMenu._items = items;
  rowMenu.hidden = false;
  menuOwner = button;
  button.setAttribute('aria-expanded', 'true');
  const rect = button.getBoundingClientRect();
  const below = rect.bottom + 4 + rowMenu.offsetHeight < window.innerHeight;
  rowMenu.style.top = `${Math.round(below ? rect.bottom + 4 : rect.top - 4 - rowMenu.offsetHeight)}px`;
  rowMenu.style.left = `${Math.round(Math.max(8, rect.right - rowMenu.offsetWidth))}px`;
  rowMenu.querySelector('[role="menuitem"]').focus();
};
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-menu]');
  if (trigger) {
    const reopen = menuOwner !== trigger;
    closeRowMenu();
    if (reopen) openRowMenu(trigger);
    return;
  }
  const item = event.target.closest('.pf-menu [role="menuitem"]');
  if (item) {
    const def = rowMenu._items[item.dataset.index];
    if (def?.action) def.action();
    closeRowMenu();
    return;
  }
  if (!rowMenu.contains(event.target)) closeRowMenu();
});
rowMenu.addEventListener('keydown', (event) => {
  const items = [...rowMenu.querySelectorAll('[role="menuitem"]')];
  const index = items.indexOf(document.activeElement);
  if (event.key === 'Escape') { event.preventDefault(); closeRowMenu({ focus: true }); }
  else if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length].focus(); }
  else if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length].focus(); }
  else if (event.key === 'Tab') closeRowMenu();
});
window.addEventListener('scroll', () => closeRowMenu(), { passive: true, capture: true });
window.addEventListener('resize', () => closeRowMenu());

// ==================== TOOLTIP: hiện toàn bộ nội dung khi chữ bị cắt “…” ====================
// Gắn data-tip cho phần tử có thể bị cắt (pf-clamp-1 / pf-clamp-2); data-tip có giá trị thì dùng giá trị đó (vd. kèm nhãn).
const tooltip = document.querySelector('#pf-tooltip');
const isTruncated = (el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
const hideTip = () => { tooltip.hidden = true; };
const showTip = (el) => {
  if (!isTruncated(el)) return;
  tooltip.textContent = el.dataset.tip || el.textContent.trim();
  tooltip.hidden = false;
  const r = el.getBoundingClientRect();
  const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
  const top = r.top - h - 8 >= 8 ? r.top - h - 8 : r.bottom + 8;
  tooltip.style.top = `${Math.round(top)}px`;
  tooltip.style.left = `${Math.round(Math.min(Math.max(8, r.left), window.innerWidth - w - 8))}px`;
};
document.addEventListener('mouseover', (event) => { const el = event.target.closest('[data-tip]'); if (el) showTip(el); });
document.addEventListener('mouseout', (event) => { if (event.target.closest('[data-tip]')) hideTip(); });
document.addEventListener('focusin', (event) => { const el = event.target.closest('[data-tip]'); if (el) showTip(el); else hideTip(); });
window.addEventListener('scroll', hideTip, { passive: true, capture: true });

// ==================== BẢNG DỮ LIỆU: lọc, đánh số thứ tự, phân trang (dùng chung các danh sách & bảng thành viên ở Xem chi tiết hồ sơ đội, CLB) ====================
const createTable = ({ rows, body, empty, pager, range, renderRow, perPage = 10, perPageOptions = [10, 20, 50] }) => {
  const state = { filter: () => true, page: 1, perPage, shown: rows };
  const pageCount = () => Math.max(1, Math.ceil(state.shown.length / state.perPage));
  const render = () => {
    state.shown = rows.filter(state.filter);
    state.page = Math.min(state.page, pageCount());
    const start = (state.page - 1) * state.perPage;
    const pageRows = state.shown.slice(start, start + state.perPage);
    body.innerHTML = pageRows.map((r, i) => renderRow(r, start + i + 1)).join('');
    empty.hidden = state.shown.length > 0;
    body.closest('table').hidden = state.shown.length === 0;
    range.textContent = `Tổng: ${state.shown.length}`;
    const pages = pageCount();
    const numbers = [];
    for (let i = 1; i <= pages; i += 1) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) numbers.push(i);
      else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
    }
    pager.innerHTML = state.shown.length ? `
      <div class="pf-pages">
        <button class="pf-page-btn is-prev" type="button" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''} aria-label="Trang trước">${icon('page-arrow')}</button>
        ${numbers.map((n) => (n === '…' ? '<span aria-hidden="true">…</span>'
          : `<button class="pf-page-btn" type="button" data-page="${n}" ${n === state.page ? 'aria-current="page"' : ''} aria-label="Trang ${n}">${n}</button>`)).join('')}
        <button class="pf-page-btn" type="button" data-page="${state.page + 1}" ${state.page === pages ? 'disabled' : ''} aria-label="Trang sau">${icon('page-arrow')}</button>
      </div>
      <span class="pf-input is-select pf-per-page"><select data-per-page aria-label="Số dòng mỗi trang">${perPageOptions.map((n) => `<option value="${n}" ${n === state.perPage ? 'selected' : ''}>${n} / Trang</option>`).join('')}</select>${icon('chevron-down', 'icon pf-caret')}</span>` : '';
  };
  pager.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page);
    render();
    body.closest('.pf-table-card, .pf-view-card').scrollIntoView({ block: 'nearest' });
  });
  pager.addEventListener('change', (event) => {
    if (!event.target.matches('[data-per-page]')) return;
    state.perPage = Number(event.target.value);
    state.page = 1;
    render();
  });
  return {
    setFilter(fn) { state.filter = fn; state.page = 1; render(); },
    shownRows: () => state.shown,
  };
};

// ---------- Ô bảng: mỗi trường 1 dòng (cắt “…”), trường đứng riêng tối đa 2 dòng; có tooltip khi bị cắt ----------
const line = (value, { label = '', iconId = '', cls = '', tip = '' } = {}) => `<span class="pf-cell-line${cls ? ` ${cls}` : ''}">${iconId ? icon(iconId) : ''}${label ? `<span class="visually-hidden">${label}: </span>` : ''}<span class="pf-clamp-1" data-tip="${escapeHtml(tip || (label ? `${label}: ${value}` : value))}">${escapeHtml(value)}</span></span>`;
const rowIndex = (n) => `<td class="pf-col-index">${n}</td>`;
const rowMenuButton = (kind, code) => `<button class="pf-icon-btn" type="button" data-menu="${kind}" data-id="${code}" aria-haspopup="menu" aria-expanded="false" aria-label="Thao tác cho ${code}">${icon('dots-vertical')}</button>`;
const rowActions = (view, kind, code) => `<td class="pf-col-actions"><div class="pf-row-actions"><a class="pf-icon-btn" href="${view}" aria-label="Xem chi tiết ${code}">${icon('eye')}</a>${rowMenuButton(kind, code)}</div></td>`;

// ---------- Bộ lọc nâng cao: mở / đóng panel & đếm số điều kiện đang áp dụng ----------
const setupFilterPanel = (panelId, fields) => {
  const toggle = document.querySelector(`[aria-controls="${panelId}"]`);
  const panel = document.getElementById(panelId);
  const count = toggle.querySelector('.pf-filter-count');
  const setOpen = (open) => { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  return () => {
    const active = fields.filter((f) => f.value).length;
    count.hidden = active === 0;
    count.textContent = active;
  };
};

// ==================== SECTION: CHƯƠNG TRÌNH CỦA TÔI — tab trạng thái, bộ lọc, bảng, kết xuất ====================
// Cột: STT · [tên (1 dòng) · mã] · lĩnh vực (nhãn, 2 dòng) · người chịu trách nhiệm (2 dòng) · địa bàn (2 dòng)
// · [mục tiêu · thanh tiến độ + %] · [thời gian triển khai: từ · đến] · ngày tạo · thao tác. Trạng thái xem theo tab.
// Trạng thái lấy từ tab (#chuong-trinh/<trạng thái>), không có ô chọn riêng.
const ct = {
  status: null, // null: chưa mở danh sách · '': tab Tất cả · khóa PROGRAM_STATUS: tab trạng thái
  search: document.querySelector('#ct-search'),
  field: document.querySelector('#ct-field'),
  creator: document.querySelector('#ct-creator'),
  from: document.querySelector('#ct-from'),
  to: document.querySelector('#ct-to'),
  budget: document.querySelector('#ct-budget'),
  statusSel: document.querySelector('#ct-status-filter'), // lọc trạng thái — chỉ hiện ở tab Tất cả
};
const ctFilters = [ct.statusSel, ct.field, ct.creator, ct.from, ct.to, ct.budget];
Object.entries(PROGRAM_STATUS).forEach(([key, st]) => ct.statusSel.add(new Option(st.label, key)));
fillOptions(ct.field, [...new Set(PROGRAMS.map((p) => p.field))]);
fillOptions(ct.creator, [...new Set(PROGRAMS.map((p) => p.creator))].sort((a, b) => a.localeCompare(b, 'vi')));
// Khoảng Từ – Đến tính là 1 điều kiện khi đếm số bộ lọc đang áp dụng
const countProgramFilters = setupFilterPanel('ct-filters', [ct.statusSel, ct.field, ct.creator, { get value() { return ct.from.value || ct.to.value; } }, ct.budget]);

// ---------- Tab Tất cả: STT · tên + “Mã: …” · lĩnh vực · địa bàn · mục tiêu quyên góp · thời gian triển khai (tiến độ · đã đạt/mục tiêu · BĐ · KT) · ngày tạo · trạng thái · thao tác ----------
// Tab trạng thái: STT · tên + mã · lĩnh vực · người chịu trách nhiệm · địa bàn · mục tiêu quyên góp · thời gian triển khai · ngày tạo · thao tác
// Cột Thời gian triển khai giống nhau ở mọi tab (programTimeCell)
const PROGRAM_HEADS = {
  all: ['Tên và mã chương trình', 'Lĩnh vực', 'Địa bàn', 'Mục tiêu quyên góp', 'Thời gian triển khai', 'Ngày tạo', 'Trạng thái'],
  status: ['Tên và mã chương trình', 'Lĩnh vực', 'Người chịu trách nhiệm', 'Địa bàn', 'Mục tiêu quyên góp', 'Thời gian triển khai', 'Ngày tạo'],
};
const renderProgramHead = () => {
  const isAll = ct.status === '';
  document.querySelector('#ct-head').innerHTML = `<th scope="col" class="pf-col-index">STT</th>${PROGRAM_HEADS[isAll ? 'all' : 'status'].map((h) => `<th scope="col">${h}</th>`).join('')}<th scope="col" class="pf-col-actions"><span class="visually-hidden">Thao tác</span></th>`;
  document.querySelector('#ct-head').closest('table').classList.toggle('is-all', isAll);
};
// Tiến độ 2 dòng theo trạng thái (SRS #8.9): [dòng chính (màu), dòng phụ (xám), màu]; không có mục tiêu quyên góp — “—”
const programStageLines = (p) => {
  if (p.goal === '—') return ['—', '', 'neutral'];
  const zero = `0 / ${p.goal}`;
  return {
    draft: ['Chưa gửi duyệt', zero, 'neutral'],
    pending: ['Chờ duyệt hồ sơ', 'Chưa mở vận động', 'orange'],
    rejected: ['Không phê duyệt', zero, 'red'],
    upcoming: ['Chưa mở vận động', zero, 'purple'],
    active: [`Đạt ${p.pct}%`, `${p.raised} / ${p.goal}`, 'green'],
    done: ['Đã quyết toán 100%', `${p.raised} / ${p.goal}`, 'green'],
  }[p.status];
};
// Ô Thời gian triển khai (mọi tab): dòng tiến độ (màu theo trạng thái) · dòng phụ · BĐ · KT; Từ chối — “Chưa kích hoạt” (SRS #8.10), chưa nhập — “Chưa xác định”
const programTimeCell = (p) => {
  const [main, sub, tone] = programStageLines(p);
  const [from, to] = p.period.split(' – ');
  return `<td>
      <div class="pf-cell-stack">
        ${line(main, { label: 'Tiến độ', cls: `is-small is-${tone}` })}
        ${sub ? line(sub, { label: sub.includes(' / ') ? 'Đã đạt / mục tiêu' : 'Tình trạng vận động', cls: 'is-muted' }) : ''}
        ${to ? line(`BĐ: ${from}`, { label: 'Bắt đầu', cls: 'is-small' }) + line(`KT: ${to}`, { label: 'Kết thúc', cls: 'is-small' }) : line(p.period, { label: 'Thời gian triển khai', cls: 'is-muted' })}
      </div>
    </td>`;
};
// Cột Thao tác (mọi tab): Nháp — Xem · Sửa · Xóa; trạng thái khác — chỉ Xem (menu ⋮ đã bỏ; menuItems.program giữ lại để dùng khi cần)
const programActions = (p) => `<td class="pf-col-actions"><div class="pf-row-actions"><a class="pf-icon-btn" href="#chuong-trinh/xem/${p.code}" aria-label="Xem chi tiết ${escapeHtml(p.name)}">${icon('eye')}</a>${p.status === 'draft'
  ? `<button class="pf-icon-btn" type="button" data-edit-program="${p.code}" aria-label="Chỉnh sửa ${escapeHtml(p.name)}">${icon('pencil')}</button><button class="pf-icon-btn is-danger" type="button" data-delete-program="${p.code}" aria-label="Xóa ${escapeHtml(p.name)}">${icon('trash')}</button>`
  : ''}</div></td>`;
const programRowAll = (p, index) => {
  const view = `#chuong-trinh/xem/${p.code}`;
  const st = PROGRAM_STATUS[p.status];
  return `<tr>
    ${rowIndex(index)}
    <td>
      <div class="pf-cell-stack">
        <a class="pf-cell-title" href="${view}"><span class="pf-clamp-1" data-tip>${escapeHtml(p.name)}</span></a>
        <span class="pf-cell-line is-muted">Mã: ${programCodeText(p)}</span>
      </div>
    </td>
    <td><span class="pf-tag is-blue pf-cell-tag"><span class="pf-clamp-2" data-tip>${escapeHtml(p.field)}</span></span></td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(p.area)}</span></td>
    <td>${line(p.goal, { label: 'Mục tiêu quyên góp', cls: 'is-strong' })}</td>
    ${programTimeCell(p)}
    <td class="pf-col-date">${viDate(p.created)}</td>
    <td><span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span></td>
    ${programActions(p)}
  </tr>`;
};
const programRow = (p, index) => {
  if (ct.status === '') return programRowAll(p, index);
  const view = `#chuong-trinh/xem/${p.code}`;
  return `<tr>
    ${rowIndex(index)}
    <td>
      <div class="pf-cell-stack">
        <a class="pf-cell-title" href="${view}"><span class="pf-clamp-1" data-tip>${escapeHtml(p.name)}</span></a>
        <span class="pf-cell-line is-code"><span class="visually-hidden">Mã chương trình: </span><span>${programCodeText(p)}</span></span>
      </div>
    </td>
    <td><span class="pf-tag is-blue pf-cell-tag"><span class="pf-clamp-2" data-tip>${escapeHtml(p.field)}</span></span></td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(p.owner)}</span></td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(p.area)}</span></td>
    <td>${line(p.goal, { label: 'Mục tiêu quyên góp', cls: 'is-strong' })}</td>
    ${programTimeCell(p)}
    <td class="pf-col-date">${viDate(p.created)}</td>
    ${programActions(p)}
  </tr>`;
};
// Sắp xếp (SRS #8): Tiến độ < 100% xếp trước, ≥ 100% xuống cuối; trong mỗi nhóm Ngày tạo giảm dần, cùng ngày thì thời điểm tạo giảm dần
const sortPrograms = () => PROGRAMS.sort((a, b) => Number((a.pct || 0) >= 100) - Number((b.pct || 0) >= 100)
  || b.created.localeCompare(a.created) || (b.createdAt || 0) - (a.createdAt || 0));
sortPrograms();
const programTable = createTable({
  rows: PROGRAMS,
  body: document.querySelector('#ct-rows'),
  empty: document.querySelector('#ct-empty'),
  pager: document.querySelector('#ct-pager'),
  range: document.querySelector('#ct-range'),
  renderRow: programRow,
});

// Thời gian triển khai “dd/mm/yyyy – dd/mm/yyyy” → [yyyy-mm-dd, yyyy-mm-dd]; chưa xác định → null (bị loại khi lọc theo ngày)
const periodRange = (period) => {
  const parts = period.split(' – ');
  return parts.length === 2 ? parts.map((d) => d.split('/').reverse().join('-')) : null;
};
const matchPeriod = (p) => {
  if (!ct.from.value && !ct.to.value) return true;
  const range = periodRange(p.period);
  return Boolean(range) && (!ct.from.value || range[1] >= ct.from.value) && (!ct.to.value || range[0] <= ct.to.value);
};
const BUDGET_MATCH = {
  small: (p) => p.goalValue !== null && p.goalValue < 300,
  medium: (p) => p.goalValue !== null && p.goalValue >= 300 && p.goalValue <= 800,
  large: (p) => p.goalValue !== null && p.goalValue > 800,
};
const applyProgramFilter = () => {
  renderProgramHead();
  // Bộ lọc Trạng thái chỉ ở tab Tất cả; tab trạng thái khác thì ẩn và bỏ giá trị
  const isAll = ct.status === '';
  document.querySelector('#ct-status-field').hidden = !isAll;
  if (!isAll) ct.statusSel.value = '';
  const query = fold(ct.search.value.trim());
  programTable.setFilter((p) => (!query || fold(`${p.status === 'draft' ? '' : p.code} ${p.name}`).includes(query))
    && (!ct.status || p.status === ct.status)
    && (!ct.statusSel.value || p.status === ct.statusSel.value)
    && (!ct.field.value || p.field === ct.field.value)
    && (!ct.creator.value || p.creator === ct.creator.value)
    && matchPeriod(p)
    && (!ct.budget.value || BUDGET_MATCH[ct.budget.value](p)));
  // TB01: tài khoản chưa có chương trình nào
  document.querySelector('#ct-empty').textContent = PROGRAMS.length ? 'Không có chương trình phù hợp với bộ lọc.' : 'Bạn chưa có chương trình nào.';
  countProgramFilters();
};
ct.search.addEventListener('input', applyProgramFilter);
ctFilters.forEach((el) => el.addEventListener('change', applyProgramFilter));
document.querySelector('#ct-reset').addEventListener('click', () => {
  ctFilters.forEach((el) => { el.value = ''; });
  document.querySelectorAll('#ct-filters [data-vi-date] input[type="text"]').forEach((el) => { el.value = ''; });
  applyProgramFilter();
});

// ---------- Kết xuất: CSV đầy đủ trường của toàn bộ kết quả đang lọc ----------
const downloadCsv = (head, lines, filename) => {
  const cell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const blob = new Blob(['﻿' + [head, ...lines].map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
function exportPrograms(rows, filename = 'chuong-trinh-cua-toi.csv') {
  downloadCsv(
    ['Mã CT', 'Tên chương trình', 'Mô tả', 'Đối tượng tạo', 'Lĩnh vực', 'Đơn vị chủ trì', 'Người chịu trách nhiệm', 'Địa bàn', 'Mục tiêu', 'Đã nhận', 'Tiến độ', 'Thời gian triển khai', 'Trạng thái', 'Ngày tạo', 'Ngày cập nhật'],
    rows.map((p) => [programCodeText(p), p.name, p.desc, p.creator, p.field, p.unit, p.owner, p.area, p.goal, p.raised, p.pct === null ? '' : `${p.pct}%`, p.period, PROGRAM_STATUS[p.status].label, viDate(p.created), viDate(p.updated)]),
    filename,
  );
  showToast(`Đã kết xuất ${rows.length} chương trình ra tệp CSV.`);
}
document.querySelector('#ct-export').addEventListener('click', () => exportPrograms(programTable.shownRows()));

// ==================== SECTION: XEM CHI TIẾT CHƯƠNG TRÌNH — modal phải (cùng cỡ Đăng ký), theo SRS mục 3.3: ảnh · gây quỹ · kê khai chi · tab Câu chuyện / Hoạt động (bản tin + đăng cập nhật) / Danh sách ủng hộ (Hồ sơ chương trình đang ẩn) · Cập nhật · Top 5 · Các chiến dịch khác ====================
// ---------- Dữ liệu hồ sơ đăng ký (minh họa): suy từ PROGRAMS, bổ sung riêng cho chương trình có hồ sơ đầy đủ ----------
// Mức độ ưu tiên (SRS #10a): Khẩn cấp · Trung bình · Thấp
const PRIORITY = {
  urgent: ['Khẩn cấp', 'is-urgent'],
  medium: ['Trung bình', 'is-medium'],
  low: ['Thấp', 'is-low'],
};
// Lĩnh vực → [loại hình hỗ trợ (SRS #15: Cứu trợ khẩn cấp / Trợ giúp nhân đạo), nhóm đối tượng người yếu thế (#18)]
const FIELD_PRESET = {
  'Cứu trợ thiên tai': ['Cứu trợ khẩn cấp', ['Bị ảnh hưởng thiên tai/bão lũ', 'Hộ nghèo']],
  'Giáo dục & Khuyến học': ['Trợ giúp nhân đạo', ['Trẻ mồ côi', 'Hộ nghèo', 'Người khuyết tật']],
  'Trẻ em - Biên giới': ['Trợ giúp nhân đạo', ['Trẻ mồ côi', 'Hộ nghèo', 'Hộ cận nghèo']],
  'Y tế - Sức khỏe': ['Trợ giúp nhân đạo', ['Người già neo đơn', 'Bệnh hiểm nghèo']],
  'Hiến máu nhân đạo': ['Trợ giúp nhân đạo', ['Bệnh hiểm nghèo']],
  'Nước sạch & Vệ sinh': ['Trợ giúp nhân đạo', ['Hộ nghèo', 'Hộ cận nghèo']],
  'Sinh kế & Nhà ở': ['Trợ giúp nhân đạo', ['Hộ nghèo', 'Người già neo đơn']],
  'Trợ giúp nhân đạo': ['Trợ giúp nhân đạo', ['Hộ nghèo', 'Hộ cận nghèo']],
};
// Lĩnh vực → hàng hóa nhận minh họa: [tên, mô tả, số lượng, quy cách, đơn giá, hạn sử dụng, đối tượng sử dụng, chứng từ]
const GOODS_PRESET = {
  'Cứu trợ thiên tai': [
    ['Gạo tẻ ST25', 'Gạo sạch hữu cơ', '10.000 kg', '10 tấn', '25.000 đ/kg', '31/12/2027', 'Nạn nhân thiên tai', 'Văn bản kiểm định VSATTP số 24/KĐ'],
    ['Nước khoáng đóng chai 500ml', 'Nước tinh khiết Lavie', '1.500 thùng', '18 tấn', '95.000 đ/thùng', '31/10/2028', 'Nạn nhân thiên tai', 'Giấy chứng nhận số 09/CN'],
    ['Túi thuốc gia đình khẩn cấp', 'Kháng sinh & Sơ cứu', '800 túi', '250 kg', '120.000 đ/túi', '30/06/2027', 'Cơ sở y tế', 'Giấy phép lưu hành Bộ Y Tế'],
    ['Chăn ấm', 'Chăn bông 2 lớp', '1.000 chiếc', '1,5 tấn', '150.000 đ/chiếc', 'Không thời hạn', 'Nạn nhân thiên tai', 'Hóa đơn GTGT số 0458'],
    ['Áo phao cứu sinh', 'Tiêu chuẩn SOLAS', '500 chiếc', '200 kg', '180.000 đ/chiếc', 'Không thời hạn', 'Lực lượng cứu hộ', 'Chứng nhận CO/CQ số 188/HQ'],
  ],
  'Giáo dục & Khuyến học': [
    ['Vở học sinh', 'Vở ô li 96 trang', '12.000 quyển', '1,2 tấn', '8.000 đ/quyển', 'Không thời hạn', 'Học sinh, sinh viên', 'Hóa đơn GTGT số 0012'],
    ['Áo ấm học sinh', 'Áo phao lót bông', '1.200 chiếc', '600 kg', '150.000 đ/chiếc', 'Không thời hạn', 'Học sinh, sinh viên', 'Chứng nhận hợp quy QCVN 01'],
    ['Cặp sách chống gù', 'Cỡ tiểu học', '1.200 chiếc', '720 kg', '120.000 đ/chiếc', 'Không thời hạn', 'Học sinh, sinh viên', 'Phiếu kiểm định số 15/KĐ'],
    ['Bộ sách giáo khoa', 'Lớp 1 – lớp 5', '1.200 bộ', '2,4 tấn', '180.000 đ/bộ', 'Không thời hạn', 'Học sinh, sinh viên', 'Hóa đơn GTGT số 0019'],
    ['Bút bi, bút chì', 'Bộ 10 chiếc', '1.200 bộ', '120 kg', '25.000 đ/bộ', 'Không thời hạn', 'Trẻ em có hoàn cảnh khó khăn', 'Phiếu xuất kho số 11/PX'],
  ],
  'Trẻ em - Biên giới': [
    ['Áo ấm trẻ em', 'Áo khoác lót lông cừu', '3.500 chiếc', '1,4 tấn', '120.000 đ/chiếc', 'Không thời hạn', 'Trẻ em có hoàn cảnh khó khăn', 'Chứng nhận hợp quy QCVN 01'],
    ['Chăn bông', 'Chăn 2 lớp 1,8 × 2 m', '1.000 chiếc', '2,5 tấn', '250.000 đ/chiếc', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Hóa đơn GTGT số 0045'],
    ['Mũ len, tất len', 'Bộ giữ ấm', '3.500 bộ', '350 kg', '40.000 đ/bộ', 'Không thời hạn', 'Trẻ em có hoàn cảnh khó khăn', 'Phiếu xuất kho số 07/PX'],
    ['Ủng cao su trẻ em', 'Cỡ 28 – 35', '2.000 đôi', '800 kg', '60.000 đ/đôi', 'Không thời hạn', 'Trẻ em có hoàn cảnh khó khăn', 'Hóa đơn GTGT số 0051'],
    ['Sữa bột dinh dưỡng', 'Hộp 900 g', '1.000 hộp', '900 kg', '320.000 đ/hộp', '31/08/2027', 'Trẻ em có hoàn cảnh khó khăn', 'Giấy chứng nhận ATTP số 44/CN'],
  ],
  'Y tế - Sức khỏe': [
    ['Túi thuốc gia đình', 'Thuốc thông dụng & sơ cứu', '2.000 túi', '600 kg', '120.000 đ/túi', '30/06/2027', 'Người cao tuổi neo đơn', 'Giấy phép lưu hành Bộ Y Tế'],
    ['Máy đo huyết áp điện tử', 'Omron HEM-7121', '200 chiếc', '100 kg', '650.000 đ/chiếc', 'Không thời hạn', 'Cơ sở y tế', 'Chứng nhận CO/CQ số 210/HQ'],
    ['Khẩu trang y tế', 'Hộp 50 chiếc', '5.000 hộp', '500 kg', '35.000 đ/hộp', '31/12/2028', 'Người bệnh', 'Giấy phép lưu hành số 112/BYT'],
    ['Máy đo đường huyết', 'Kèm 50 que thử', '150 bộ', '45 kg', '850.000 đ/bộ', 'Không thời hạn', 'Cơ sở y tế', 'Chứng nhận CO/CQ số 215/HQ'],
    ['Xe lăn', 'Khung thép gấp gọn', '50 chiếc', '750 kg', '1.800.000 đ/chiếc', 'Không thời hạn', 'Người khuyết tật', 'Giấy phép lưu hành số 118/BYT'],
  ],
  'Hiến máu nhân đạo': [
    ['Sữa tươi tiệt trùng', 'Hộp 180 ml', '6.000 hộp', '1,1 tấn', '8.000 đ/hộp', '31/03/2027', 'Người hiến máu', 'Văn bản kiểm định VSATTP số 31/KĐ'],
    ['Bánh quy dinh dưỡng', 'Gói 100 g', '6.000 gói', '600 kg', '12.000 đ/gói', '31/05/2027', 'Người hiến máu', 'Giấy chứng nhận ATTP số 18/CN'],
    ['Túi quà tặng', 'Áo phông & móc khóa', '1.500 túi', '450 kg', '60.000 đ/túi', 'Không thời hạn', 'Tình nguyện viên', 'Phiếu xuất kho số 03/PX'],
    ['Nước uống đóng chai', 'Chai 350 ml', '6.000 chai', '2,1 tấn', '5.000 đ/chai', '30/06/2027', 'Người hiến máu', 'Giấy chứng nhận số 12/CN'],
    ['Băng dán y tế', 'Hộp 100 miếng', '300 hộp', '30 kg', '45.000 đ/hộp', '31/12/2028', 'Cơ sở y tế', 'Giấy phép lưu hành Bộ Y Tế'],
  ],
  'Nước sạch & Vệ sinh': [
    ['Bồn chứa nước inox', 'Dung tích 1.000 lít', '120 bồn', '3,6 tấn', '2.800.000 đ/bồn', 'Không thời hạn', 'Nạn nhân thiên tai', 'Chứng nhận hợp quy số 08/HQ'],
    ['Máy lọc nước RO', '9 lõi lọc', '120 máy', '1,8 tấn', '4.500.000 đ/máy', 'Không thời hạn', 'Nạn nhân thiên tai', 'Chứng nhận CO/CQ số 77/HQ'],
    ['Viên lọc nước', 'Aquatabs 67 mg', '20.000 viên', '20 kg', '1.500 đ/viên', '30/09/2028', 'Nạn nhân thiên tai', 'Giấy phép lưu hành Bộ Y Tế'],
    ['Ống nước HDPE', 'Phi 25 mm, cuộn 100 m', '60 cuộn', '1,2 tấn', '1.200.000 đ/cuộn', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Chứng nhận hợp quy số 15/HQ'],
    ['Xà phòng diệt khuẩn', 'Bánh 90 g', '3.000 bánh', '270 kg', '12.000 đ/bánh', '30/09/2028', 'Hộ nghèo, cận nghèo', 'Phiếu công bố số 12/CB'],
  ],
  'Sinh kế & Nhà ở': [
    ['Xi măng PCB40', 'Bao 50 kg', '600 bao', '30 tấn', '90.000 đ/bao', '31/12/2026', 'Hộ nghèo, cận nghèo', 'Hóa đơn GTGT số 0103'],
    ['Tôn lợp mái', 'Tôn lạnh 0,45 mm', '900 m²', '4 tấn', '110.000 đ/m²', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Phiếu kiểm định số 22/KĐ'],
    ['Giống gà ri', 'Gà con 1 tuần tuổi', '2.500 con', '250 kg', '18.000 đ/con', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Giấy chứng nhận kiểm dịch số 05/KD'],
    ['Thép xây dựng', 'Phi 10, cây 11,7 m', '400 cây', '3 tấn', '160.000 đ/cây', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Chứng nhận CO/CQ số 96/HQ'],
    ['Thức ăn chăn nuôi', 'Bao 25 kg', '200 bao', '5 tấn', '320.000 đ/bao', '31/03/2027', 'Hộ nghèo, cận nghèo', 'Giấy chứng nhận hợp quy số 33/HQ'],
  ],
  'Trợ giúp nhân đạo': [
    ['Gạo tẻ', 'Bao 10 kg', '1.500 bao', '15 tấn', '180.000 đ/bao', '31/12/2026', 'Hộ nghèo, cận nghèo', 'Văn bản kiểm định VSATTP số 40/KĐ'],
    ['Dầu ăn', 'Chai 1 lít', '1.500 chai', '1,5 tấn', '45.000 đ/chai', '31/10/2027', 'Hộ nghèo, cận nghèo', 'Giấy chứng nhận ATTP số 26/CN'],
    ['Mì ăn liền', 'Thùng 30 gói', '1.500 thùng', '4,5 tấn', '110.000 đ/thùng', '30/04/2027', 'Hộ nghèo, cận nghèo', 'Giấy chứng nhận ATTP số 27/CN'],
    ['Nước mắm', 'Chai 500 ml', '1.500 chai', '900 kg', '35.000 đ/chai', '31/12/2027', 'Hộ nghèo, cận nghèo', 'Giấy chứng nhận ATTP số 29/CN'],
    ['Bánh chưng', 'Cặp 2 chiếc', '1.500 cặp', '3 tấn', '120.000 đ/cặp', '15/02/2026', 'Người cao tuổi neo đơn', 'Phiếu xuất kho số 02/PX'],
  ],
};
const FORM_DOCS = [
  { name: 'De_an_van_dong_cuu_tro_so_128_CTD.pdf', size: '4.2 MB', state: 'Đã ký số' },
  { name: 'Quyet_dinh_mo_cuoc_van_dong.pdf', size: '1.9 MB', state: 'Đã duyệt' },
];
const FORM_EXTRA = {
  'CT-2026-031': {
    priority: 'urgent',
    goal: 'Hỗ trợ khẩn cấp lương thực, nước sạch và sinh kế hồi phục sản xuất cho người dân chịu ảnh hưởng thiên tai lũ lụt tại miền Trung.',
    target: '- Cấp phát 1.500 túi cứu trợ khẩn cấp; Sửa chữa 25 căn nhà an toàn; Khám và phát thuốc miễn phí cho 3.000 lượt người.',
    groups: ['Hộ nghèo', 'Hộ cận nghèo', 'Trẻ mồ côi', 'Bị ảnh hưởng thiên tai/bão lũ'],
    people: 2000,
    resources: ['Tiền mặt/chuyển khoản', 'Hàng hóa', 'Vật tư'],
    funding: ['Ngân sách hội', 'Vận động'],
    goods: [
      ['Gạo tẻ ST25', 'Gạo sạch hữu cơ', '10.000 kg', '10 tấn', '25.000 đ/kg', '31/12/2027', 'Nạn nhân thiên tai', 'Văn bản kiểm định VSATTP số 24/KĐ'],
      ['Áo phao cứu sinh loại 1', 'Tiêu chuẩn SOLAS', '2.000 chiếc', '800 kg', '180.000 đ/chiếc', 'Không thời hạn', 'Lực lượng cứu hộ', 'Chứng nhận CO/CQ số 188/HQ'],
      ['Nước khoáng đóng chai 500ml', 'Nước tinh khiết Lavie', '1.500 thùng', '18 tấn', '95.000 đ/thùng', '31/10/2028', 'Nạn nhân thiên tai', 'Giấy chứng nhận số 09/CN'],
      ['Túi thuốc gia đình khẩn cấp', 'Kháng sinh & Sơ cứu', '800 túi', '250 kg', '120.000 đ/túi', '30/06/2027', 'Cơ sở y tế', 'Giấy phép lưu hành Bộ Y Tế'],
      ['Mì ăn liền', 'Thùng 30 gói', '1.200 thùng', '3,6 tấn', '110.000 đ/thùng', '30/04/2027', 'Nạn nhân thiên tai', 'Giấy chứng nhận ATTP số 27/CN'],
      ['Sữa hộp tiệt trùng', 'Hộp 180 ml', '5.000 hộp', '0,9 tấn', '8.000 đ/hộp', '31/03/2027', 'Trẻ em có hoàn cảnh khó khăn', 'Giấy chứng nhận ATTP số 31/CN'],
      ['Chăn ấm', 'Chăn bông 2 lớp', '1.000 chiếc', '1,5 tấn', '150.000 đ/chiếc', 'Không thời hạn', 'Nạn nhân thiên tai', 'Hóa đơn GTGT số 0458'],
      ['Màn chống muỗi', 'Màn tẩm hóa chất', '1.000 chiếc', '300 kg', '60.000 đ/chiếc', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Hóa đơn GTGT số 0459'],
      ['Viên lọc nước', 'Hộp 50 viên', '2.000 hộp', '100 kg', '45.000 đ/hộp', '31/12/2028', 'Nạn nhân thiên tai', 'Giấy phép lưu hành Bộ Y Tế'],
      ['Đèn pin sạc', 'Pin 2.000 mAh', '800 chiếc', '240 kg', '95.000 đ/chiếc', 'Không thời hạn', 'Nạn nhân thiên tai', 'Chứng nhận hợp quy QCVN 19'],
      ['Bạt che mưa', 'Khổ 4 × 6 m', '600 tấm', '1,2 tấn', '120.000 đ/tấm', 'Không thời hạn', 'Hộ nghèo, cận nghèo', 'Hóa đơn GTGT số 0460'],
      ['Áo mưa người lớn', 'Áo mưa bộ', '1.500 bộ', '450 kg', '55.000 đ/bộ', 'Không thời hạn', 'Lực lượng cứu hộ', 'Hóa đơn GTGT số 0461'],
      ['Xà phòng diệt khuẩn', 'Bánh 90 g', '3.000 bánh', '270 kg', '12.000 đ/bánh', '30/09/2028', 'Hộ nghèo, cận nghèo', 'Phiếu công bố số 12/CB'],
      ['Cloramin B', 'Gói 25 g', '2.000 gói', '50 kg', '15.000 đ/gói', '31/12/2027', 'Cơ sở y tế', 'Giấy phép lưu hành Bộ Y Tế'],
      ['Bếp gas mini', 'Kèm 4 bình gas', '300 bộ', '900 kg', '350.000 đ/bộ', 'Không thời hạn', 'Nạn nhân thiên tai', 'Chứng nhận hợp quy QCVN 05'],
      ['Áo phao trẻ em', 'Cỡ 15 – 40 kg', '500 chiếc', '150 kg', '120.000 đ/chiếc', 'Không thời hạn', 'Trẻ em có hoàn cảnh khó khăn', 'Chứng nhận CO/CQ số 190/HQ'],
    ],
    assign: [
      ['Hội Chữ thập đỏ TP Hà Nội', 'Ông Nguyễn Văn Nam', 'Chủ trì vận động & tiếp nhận nguồn lực', '20/10/2026'],
      ['Tỉnh Đoàn Quảng Trị', 'Bà Lê Thị Mai', 'Phối hợp điều phối TNV & phân phát hàng', '15/11/2026'],
      ['Hội Chữ thập đỏ tỉnh Quảng Trị', 'Ông Lê Văn Hải', 'Tiếp nhận & quản lý kho hàng cứu trợ', '30/10/2026'],
      ['Trạm y tế xã Hải Lăng', 'Bác sĩ Trần Minh Đức', 'Khám, phát thuốc miễn phí cho người dân', '30/11/2026'],
    ],
    depot: 'Đông Anh, Hà Nội',
  },
};
const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const programForm = (p) => {
  const [support, groups] = FIELD_PRESET[p.field] || ['Cứu trợ nhân đạo', ['Hộ nghèo, cận nghèo']];
  const [runFrom, runTo] = p.period.includes('–') ? p.period.split('–').map((s) => s.trim()) : ['', ''];
  const firstNumber = (p.desc.match(/\d[\d.]*/) || [''])[0].replace(/\./g, '');
  return {
    priority: p.field === 'Cứu trợ thiên tai' ? 'urgent' : 'medium',
    creatorName: p.creator === 'Tổ chức' ? p.unit : p.owner,
    phone: '0912 345 678',
    email: 'lienhe@hoichuthapdo.vn',
    goal: `Huy động nguồn lực xã hội cho chương trình “${p.name}”, hỗ trợ kịp thời ${groups.join(', ').toLowerCase()} tại ${p.area}.`,
    target: `- ${p.desc}\n- Tiếp nhận, phân phối nguồn lực đúng đối tượng và công khai kết quả, sao kê trên nền tảng.`,
    support,
    groups,
    runFrom,
    runTo,
    people: Number(firstNumber) || null,
    resources: ['Tiền mặt/chuyển khoản', 'Hàng hóa'],
    transport: 'Yêu cầu hỗ trợ vận chuyển',
    funding: ['Vận động'],
    campaign: ['Nền tảng số', 'Trực tiếp'],
    money: p.goalValue ? p.goalValue * 1000000 : null,
    raiseFrom: viDate(p.raise ? p.raise[0] : p.created),
    raiseTo: viDate(p.raise ? p.raise[1] : addDays(p.created, 45)),
    goods: GOODS_PRESET[p.field] || [],
    assign: [
      [p.unit, p.owner, 'Chủ trì vận động & tiếp nhận nguồn lực', runTo || viDate(addDays(p.created, 45))],
      [`Tỉnh Đoàn ${p.area}`, 'Bà Lê Thị Mai', 'Phối hợp điều phối TNV & phân phát hàng', runTo || viDate(addDays(p.created, 60))],
      [`Hội Liên hiệp Phụ nữ ${p.area}`, 'Bà Nguyễn Thị Hòa', 'Rà soát danh sách đối tượng hưởng lợi', viDate(addDays(p.created, 20))],
      [`UBND xã điểm tại ${p.area}`, 'Ông Phạm Văn Tuấn', 'Bố trí địa điểm & xác nhận tiếp nhận', runTo || viDate(addDays(p.created, 60))],
    ],
    depot: `Trụ sở ${p.unit}`,
    volunteers: 20,
    docs: p.status === 'draft' ? [] : FORM_DOCS,
    ...FORM_EXTRA[p.code],
    ...regViewData(programRegCache.get(p.code)),
  };
};
// Dữ liệu biểu mẫu Đăng ký (programRegCache) → dạng dữ liệu màn Xem chi tiết; chương trình minh họa (không có trong cache) giữ dữ liệu suy ra ở trên
const regViewData = (d) => {
  if (!d) return {};
  const hasMoney = d.resources.includes('Tiền mặt/chuyển khoản') && d.money;
  const byList = d.mode === 'Theo nhóm người yếu thế cụ thể';
  return {
    priority: d.priority, creatorName: d.creatorName, phone: d.phone, email: d.email,
    goal: d.goal, target: d.target, support: d.support,
    groups: byList ? [...new Set(d.people.map((r) => r.need).filter(Boolean))] : d.groups,
    people: byList ? d.people.length : null,
    runFrom: d.runFrom, runTo: d.runTo,
    resources: d.resources, transport: d.transport, funding: d.funding, campaign: d.campaign,
    money: hasMoney ? d.money : null, raiseFrom: d.raiseFrom, raiseTo: d.raiseTo, depot: d.depot,
    goods: d.goods.map((g) => [g.name, g.group, `${g.qty} ${g.qtyUnit}`, `${g.spec} ${g.specUnit}`, `${g.price} đ`, g.exp, g.to, g.docs.join(', ')]),
    assign: d.assign.map((a) => [a.unit, a.person, a.task, a.date]),
    volunteers: Number(d.volunteers) || 0,
    docs: d.docs.map((f) => ({ name: f.name, size: fileSize(f.size), state: 'Đã tải lên' })),
  };
};

// ---------- Khối hiển thị chỉ đọc: ô số liệu, thẻ (tiêu đề + số lượng), lưới ô nhãn – giá trị, bảng, tài liệu ----------
const vEmpty = '<span class="pf-view-empty">Chưa cập nhật</span>';
const vText = (text) => (text ? escapeHtml(text) : '');
const vVnd = (n) => n.toLocaleString('vi-VN');
// Dòng nhãn (trái, xám) – giá trị (phải), kẻ ngang giữa các dòng — kiểu thẻ thông tin Metronic
const vKv = (label, value) => `<div class="pf-view-kv"><dt>${label}</dt><dd>${value || vEmpty}</dd></div>`;
const vKvs = (rows) => `<dl class="pf-view-kvs">${rows.join('')}</dl>`;
const vCard = (id, title, body, count = '') => `<section class="pf-view-card" id="${id}" aria-labelledby="${id}-title">
  <header class="pf-view-card-head"><h3 id="${id}-title">${title}</h3>${count ? `<span class="pf-view-count">${count}</span>` : ''}</header>${body}</section>`;
// start: số thứ tự của dòng đầu (dùng khi bảng có phân trang)
const vTable = (cls, heads, rows, emptyText, start = 1) => (rows.length
  ? `<div class="pf-view-table"><table class="pf-reg-table is-view ${cls}"><thead><tr><th scope="col" class="pf-col-index">#</th>${heads.map((t) => `<th scope="col">${t}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((cells, i) => `<tr><td class="pf-col-index">${start + i}</td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
  : `<p class="pf-view-none">${emptyText}</p>`);

// ---------- Phân trang trong modal (hàng hóa nhận, danh sách ủng hộ): kiểu nút của bảng danh sách, quá nhiều trang thì rút gọn “…” ----------
const vPager = (attr, current, pages) => {
  const numbers = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - current) <= 1) numbers.push(i);
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
  }
  return `<div class="pf-pager"><div class="pf-pages">
    <button class="pf-page-btn is-prev" type="button" ${attr}="${current - 1}" ${current === 1 ? 'disabled' : ''} aria-label="Trang trước">${icon('page-arrow')}</button>
    ${numbers.map((n) => (n === '…' ? '<span aria-hidden="true">…</span>'
      : `<button class="pf-page-btn" type="button" ${attr}="${n}" ${n === current ? 'aria-current="page"' : ''} aria-label="Trang ${n}">${n}</button>`)).join('')}
    <button class="pf-page-btn" type="button" ${attr}="${current + 1}" ${current === pages ? 'disabled' : ''} aria-label="Trang sau">${icon('page-arrow')}</button>
  </div></div>`;
};

// ---------- Danh sách hàng hóa nhận: quá 10 mặt hàng thì phân trang (10 dòng/trang), dùng kiểu phân trang của bảng danh sách ----------
const VIEW_GOODS_PER_PAGE = 10;
let pfViewGoods = [];
const renderViewGoods = (page = 1) => {
  const box = document.querySelector('#pf-v-goods-body');
  if (!box) return;
  const pages = Math.max(1, Math.ceil(pfViewGoods.length / VIEW_GOODS_PER_PAGE));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * VIEW_GOODS_PER_PAGE;
  const rows = pfViewGoods.slice(start, start + VIEW_GOODS_PER_PAGE);
  const table = vTable('is-v-goods', ['Tên hàng hóa', 'Số lượng', 'Quy cách/Trọng lượng', 'Đơn giá ước tính', 'Hạn sử dụng', 'Đối tượng sử dụng', 'Chứng từ/Tiêu chuẩn kèm theo'],
    rows.map(([name, , qty, spec, price, exp, to, doc]) => [`<b>${escapeHtml(name)}</b>`, `<b>${escapeHtml(qty)}</b>`, escapeHtml(spec), `<b>${escapeHtml(price)}</b>`, escapeHtml(exp), escapeHtml(to), `<span class="pf-tag">${escapeHtml(doc)}</span>`]),
    'Chương trình chưa đăng ký hàng hóa nhận.', start + 1);
  const foot = pages > 1 ? `<div class="pf-table-foot">
    <p class="pf-muted" aria-live="polite">Hiển thị ${start + 1}–${start + rows.length} / ${pfViewGoods.length} mặt hàng</p>
    ${vPager('data-goods-page', current, pages)}
  </div>` : '';
  box.innerHTML = table + foot;
};
const vTags = (list) => (list.length ? `<span class="pf-view-tags">${list.map((x) => `<span class="pf-tag is-blue">${escapeHtml(x)}</span>`).join('')}</span>` : '');
// Ô đánh dấu: chỉ hiện các mục người dùng đã tích, nối bằng dấu phẩy
const vChecked = (on) => vText((on || []).join(', '));
const vRange = (from, to) => (from && to ? `${from} – ${to}` : '');
// Ô số liệu đầu trang: biểu tượng màu info · nhãn · giá trị
const vStat = (ic, label, value, cls = '') => `<div class="pf-view-stat${cls ? ` ${cls}` : ''}"><span class="pf-view-stat-icon" aria-hidden="true">${icon(ic)}</span><div class="pf-view-stat-text"><p class="pf-view-stat-label">${label}</p><p class="pf-view-stat-value">${value || vEmpty}</p></div></div>`;
const vDocs = (docs) => (docs.length ? `<ul class="pf-view-docs">${docs.map((d) => `<li class="pf-view-doc">
  <span class="pf-view-doc-icon" aria-hidden="true">${icon('document')}</span>
  <div class="pf-view-doc-text"><p class="pf-view-doc-name">${escapeHtml(d.name)}</p><p class="pf-view-doc-meta">${d.size}<span aria-hidden="true">·</span><span class="is-ok"><span class="pf-dot" aria-hidden="true"></span>${d.state}</span></p></div>
  <div class="pf-view-doc-actions">
    <button class="pf-btn pf-btn-ghost pf-btn-sm" type="button" data-preview aria-label="Xem ${escapeHtml(d.name)}">${icon('eye')}Xem</button>
    <button class="pf-btn pf-btn-ghost pf-btn-sm" type="button" data-download aria-label="Tải xuống ${escapeHtml(d.name)}">${icon('download')}Tải xuống</button>
  </div>
</li>`).join('')}</ul>` : '<p class="pf-view-none">Chưa có tài liệu đính kèm.</p>');

// ---------- Trang chiến dịch (bố cục như trang gây quỹ công khai): ảnh · gây quỹ · kê khai chi · tab · cập nhật · top ủng hộ · chiến dịch khác ----------
// Ảnh minh họa xoay vòng theo mã chương trình (ảnh đầu = ảnh banner của chương trình)
const PV_PHOTOS = ['3.-028ae9de1f.jpg', 'trao-qua-hoc-sinh.jpg', 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', '1358142_gen-h-235_1777566365.jpg', 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', '01%201.jpg', 'z765570465791.jpg', 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg'];
const pvVnd = (n) => `${vVnd(Math.round(n))} VNĐ`;
const pvMoney = (n) => `${vVnd(Math.round(n))}đ`;
// pad2, seededRandom (số ngẫu nhiên cố định theo mã): khai báo ở XEM CHI TIẾT HỒ SƠ THÀNH LẬP / GIA NHẬP ĐỘI, CLB — chỉ gọi khi mở modal
const localIso = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
// Thời gian ủng hộ: dd/MM/yyyy HH:mm
const pvDateTime = (ms) => { const d = new Date(ms); return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
// Số liệu gây quỹ minh họa theo trạng thái: chỉ Đang gây quỹ / Hoàn thành mới có tiền đã nhận, lượt ủng hộ, khoản chi
const programFund = (p, f) => {
  const open = ['active', 'done'].includes(p.status);
  const money = f.money || 0;
  const raised = open && money ? Math.round((money * p.pct) / 100 + (Number(p.code.slice(-3)) * 1018)) : 0;
  const donors = open ? Math.max(12, Math.round((raised || p.pct * 1e6) / 2.6e6)) : 0;
  const end = f.runTo ? new Date(f.runTo.split('/').reverse().join('-')) : null;
  const days = end ? Math.ceil((end - new Date()) / 86400000) : null;
  const spent = p.status === 'done' ? raised * 0.97 : raised * 0.36;
  const proven = p.status === 'done' ? spent : spent * 0.78;
  return { open, money, raised, donors, days, spent, proven, unproven: spent - proven, left: raised - spent };
};
// ---------- Danh sách ủng hộ minh họa: đủ số lượt ủng hộ, rải trong Thời gian tiếp nhận, mới nhất lên đầu; Top 5 = 5 khoản lớn nhất ----------
// Cùng người ủng hộ lớn với trang công khai (chuong-trinh.js): [tên, loại, ảnh đại diện / logo]
const PV_TOP_DONORS = [['Công ty Cổ phần An Phát', 'org', 'Emages/logo-demo/an-phat.svg'], ['Trần Thu Hà', 'user', 'Emages/avatar/tran-thu-ha.jpg'], ['Quỹ Hy vọng Xanh', 'org', 'Emages/logo-demo/hy-vong-xanh.svg'], ['Phạm Gia Huy', 'user', 'Emages/avatar/pham-gia-huy.jpg'], ['Nguyễn Minh Anh', 'user', 'Emages/avatar/nguyen-minh-anh.jpg']];
const PV_TOP_RATIOS = [0.071, 0.052, 0.037, 0.024, 0.016];
const PV_NAMES = ['Lê Hoàng Nam', 'Phạm Thu Hằng', 'Đỗ Quang Huy', 'Vũ Ngọc Lan', 'Hoàng Minh Đức', 'Bùi Thị Thảo', 'Đặng Văn Định', 'Ngô Thanh Tùng', 'Dương Thị Hà', 'Lý Quốc Bảo', 'Phan Thị Ngọc', 'Trịnh Văn Long', 'Mai Anh Thư', 'Tạ Minh Khôi', 'Đinh Thị Yến'];
const PV_SMALL = [20000, 50000, 50000, 100000, 100000, 200000, 200000, 300000, 500000, 500000, 1000000, 2000000, 5000000];
const programDonations = (p, fund, f) => {
  if (!fund.open) return [];
  const rand = seededRandom(p.code);
  const from = new Date(`${f.raiseFrom.split('/').reverse().join('-')}T07:00:00`).getTime();
  const to = Math.max(from, Math.min(Date.now(), new Date(`${f.raiseTo.split('/').reverse().join('-')}T21:00:00`).getTime()));
  const base = fund.raised || 2e8;
  return Array.from({ length: fund.donors }, (_, i) => {
    const time = from + rand() * (to - from);
    if (i < PV_TOP_DONORS.length) {
      const [name, kind, avatar] = PV_TOP_DONORS[i];
      return { name, kind, avatar, time, amount: Math.max(Math.round((base * PV_TOP_RATIOS[i]) / 100000) * 100000, (10 - i) * 1e6) };
    }
    const anonymous = rand() < 0.18;
    return { name: anonymous ? 'Người ủng hộ ẩn danh' : PV_NAMES[Math.floor(rand() * PV_NAMES.length)], kind: anonymous ? 'heart' : 'user', time, amount: PV_SMALL[Math.floor(rand() * PV_SMALL.length)] };
  }).map((d) => ({ ...d, date: pvDateTime(d.time).slice(0, 10) })).sort((a, b) => b.time - a.time);
};
const pvAvatar = (kind, cls = 'pf-pv-avatar') => `<span class="${cls}${kind === 'org' ? ' is-org' : ''}" aria-hidden="true">${icon(kind === 'org' ? 'building' : kind)}</span>`;
// ---------- Avatar (như trang công khai): có ảnh → ảnh · ẩn danh → icon tim · còn lại → chữ cái đầu họ và tên, màu theo người ----------
const pvInitials = (name) => { const w = name.trim().split(/\s+/); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
// Màu avatar: người xuất hiện lần đầu nhận tông kế tiếp trong vòng 5 tông (.pv-cm-initials.tone-0…4), sau đó giữ nguyên
const pvTones = new Map();
const pvTone = (name) => { if (!pvTones.has(name)) pvTones.set(name, pvTones.size % 5); return pvTones.get(name); };
const pvDonorAvatar = (x) => {
  if (x.avatar) return `<img class="pf-pv-avatar pv-donor-photo${x.kind === 'org' ? ' is-logo' : ''}" src="${escapeHtml(x.avatar)}" alt="" width="32" height="32" loading="lazy" />`;
  if (x.kind === 'heart') return pvAvatar('heart');
  return `<span class="pf-pv-avatar pv-cm-initials tone-${pvTone(x.name)}" aria-hidden="true">${escapeHtml(pvInitials(x.name))}</span>`;
};
// Top 5 (như trang công khai): hạng · avatar · tên · số tiền
const pvTop5 = (top) => `<ol class="pf-pv-top5-list">${top.map((d, i) => `<li class="pf-pv-top5-item is-rank-${i + 1}">
  <span class="pf-pv-rank" aria-label="Hạng ${i + 1}">${i + 1}</span>
  ${pvDonorAvatar(d)}
  <span class="pf-pv-top5-info"><span class="pf-pv-top5-name">${escapeHtml(d.name)}</span></span>
  <b class="pf-pv-top5-amount">${pvMoney(d.amount)}</b>
</li>`).join('')}</ol>`;
// ---------- Người đồng hành (minh họa, như trang công khai): người / tổ chức đứng ra kêu gọi gây quỹ — số tiền và lượt ủng hộ kêu gọi được ----------
const PV_COMPANION_RATIOS = [0.052, 0.034, 0.021, 0.013, 0.008];
const pvCompanions = (p, fund) => {
  const rand = seededRandom(`${p.code}-companions`);
  const names = [`Đoàn Thanh niên ${p.area}`, 'CLB Thiện nguyện Ánh Dương', 'Nguyễn Thu Hà', 'Nhóm Tình nguyện Sắc Xanh', 'Lê Minh Quân'];
  const base = fund.raised || 2e8;
  return names.map((name, i) => ({ name, amount: Math.max(Math.round((base * PV_COMPANION_RATIOS[i]) / 100000) * 100000, 1e6), count: 20 + Math.floor(rand() * 180) })).sort((a, b) => b.amount - a.amount);
};
const pvCompanionList = (list) => `<ol class="pf-pv-top5-list">${list.map((x, i) => `<li class="pf-pv-top5-item is-rank-${i + 1}">
  <span class="pf-pv-rank" aria-label="Hạng ${i + 1}">${i + 1}</span>
  ${pvDonorAvatar(x)}
  <span class="pf-pv-top5-info"><span class="pf-pv-top5-name">${escapeHtml(x.name)}</span><span class="pf-pv-top5-date">Kêu gọi ${vVnd(x.count)} lượt ủng hộ</span></span>
  <b class="pf-pv-top5-amount">${pvMoney(x.amount)}</b>
</li>`).join('')}</ol>`;

// ---------- Bình luận (như trang công khai): Bình luận (N) · sắp xếp · ô viết (Enter gửi) · Thích, Trả lời (1 cấp); hiện 3, Xem thêm mở thêm 3 ----------
// Người đang đăng nhập (minh họa, cùng account-menu.js)
const PV_ME = 'Nguyễn Ngọc Trâm';
// Khối Hoạt động (trích đoạn bản tin mới nhất) trong modal Xem chi tiết đang ẩn — xem ở tab Hoạt động; đổi thành true để hiện lại
const PV_SHOW_LATEST = false;
// Khối Bình luận trong modal Xem chi tiết đang ẩn — đổi thành true để hiện lại
const PV_SHOW_COMMENTS = false;
const PV_COMMENT_STEP = 3;
const PV_COMMENT_MAX = 500;
const PV_SORT_LABEL = { relevant: 'Phù hợp nhất', newest: 'Mới nhất' };
// Mỗi mục: [nội dung, ...trả lời]; trả lời: ['org', nội dung] = Ban tổ chức (người vận động) · ['user', nội dung] = người dùng khác
const PV_COMMENT_POOL = [
  ['Chúc chương trình sớm về đích, mong bà con sớm ổn định cuộc sống.'],
  ['Mình vừa chuyển khoản ủng hộ, cảm ơn Hội đã công khai sao kê rất rõ ràng.', ['user', 'Mình cũng vừa tra sao kê, thấy giao dịch của mình hiện ngay sau vài phút. Rất minh bạch!']],
  ['Đã chia sẻ cho nhóm bạn cùng công ty, mong lan tỏa thêm nhiều tấm lòng.'],
  ['Cảm ơn các tình nguyện viên đã vất vả đi trao quà tận nơi.', ['user', 'Mình là tình nguyện viên đợt vừa rồi, bà con đón đoàn rất xúc động. Cảm ơn mọi người đã đồng hành!']],
  ['Hình ảnh cập nhật rất cụ thể, mình yên tâm khi đóng góp qua nền tảng này.'],
  ['Chương trình có tuyển tình nguyện viên tham gia trao quà không ạ?', ['org', 'Chào bạn, bạn có thể đăng ký tình nguyện viên tại mục Hồ sơ tình nguyện viên trên trang cá nhân. Ban tổ chức sẽ liên hệ khi có đợt trao quà tiếp theo.']],
  ['Lớp mình góp được một ít tiền quỹ lớp, vừa chuyển khoản xong. Chúc chương trình thành công!'],
  ['Mong ban tổ chức tiếp tục cập nhật hình ảnh sau khi trao hỗ trợ để mọi người cùng theo dõi.', ['org', 'Cảm ơn bạn đã quan tâm. Ban tổ chức sẽ đăng bản tin kèm hình ảnh sau mỗi đợt trao hỗ trợ tại tab Hoạt động.']],
  ['Đọc câu chuyện mà rưng rưng. Đã ủng hộ và chia sẻ lên trang cá nhân.'],
  ['Chương trình ý nghĩa quá, chúc ban tổ chức nhiều sức khỏe!'],
];
const PV_COMMENT_NAMES = ['Dương Thị Hà', 'Kiều Văn Phúc', 'Cao Minh Tuấn', 'Lý Quốc Bảo', 'Vũ Ngọc Lan', 'Chu Thanh Hương', 'Hoàng Minh Đức', 'Tô Ngọc Ánh', 'Lương Thị Hồng', 'Võ Đức Thắng', 'Hồ Thị Lan Anh', 'Mai Anh Thư', 'Nhóm thiện nguyện Sẻ Chia'];
let pvCommentSeq = 0;
const programComments = (p, f, unit) => {
  const rand = seededRandom(`${p.code}-comments`);
  const shuffle = (list) => [...list].sort(() => rand() - 0.5);
  const names = shuffle(PV_COMMENT_NAMES);
  let nameIndex = 0;
  const nextName = () => { nameIndex += 1; return names[(nameIndex - 1) % names.length]; };
  const from = new Date(`${f.raiseFrom.split('/').reverse().join('-')}T08:00:00`).getTime();
  const span = Math.max(86400000, Date.now() - from);
  return shuffle(PV_COMMENT_POOL).slice(0, 8 + Math.floor(rand() * 3)).map(([text, ...replies]) => {
    const time = from + rand() * span * 0.85;
    pvCommentSeq += 1;
    let at = time;
    const name = nextName();
    return {
      id: pvCommentSeq, name, kind: name.startsWith('Nhóm') ? 'people' : 'user', time, text, likes: Math.floor(rand() * 40), liked: false,
      replies: replies.map(([who, reply]) => {
        pvCommentSeq += 1;
        at = Math.min(Date.now() - 600000, at + (1 + rand() * 18) * 3600000);
        return { id: pvCommentSeq, name: who === 'org' ? unit : nextName(), kind: who === 'org' ? 'org' : 'user', time: at, text: reply, likes: Math.floor(rand() * 10), liked: false };
      }),
    };
  }).sort((a, b) => b.time - a.time);
};
const pvCommentWhen = (ms) => (Date.now() - ms < 60000 ? 'Vừa xong' : pvDateTime(ms));
const pvCmAvatar = (name, kind = 'user') => (kind === 'org' ? '<img class="pf-pv-avatar pv-cm-logo" src="Emages/logo-hctd-mark.svg" alt="" width="40" height="40" />' : `<span class="pf-pv-avatar pv-cm-initials tone-${pvTone(name)}" aria-hidden="true">${escapeHtml(pvInitials(name))}</span>`);
const pvReplyForm = (c) => `<div class="pf-field pv-reply-form" id="pv-reply-field">
    <div class="pv-cm-box">
      <label class="visually-hidden" for="pv-reply-text">Gửi trả lời ${escapeHtml(c.name)}</label>
      <textarea id="pv-reply-text" rows="1" maxlength="${PV_COMMENT_MAX}" placeholder="Trả lời ${escapeHtml(c.name)}…" data-cm-input="reply">${escapeHtml(pvCtx.replyDraft)}</textarea>
      <button class="pv-cm-send" type="button" data-cm-send="${c.id}" aria-label="Gửi trả lời ${escapeHtml(c.name)}">${icon('send')}</button>
    </div>
    <p class="pf-field-error">${icon('alert')}Vui lòng nhập nội dung trả lời.</p>
    <p class="pv-cm-hint">Nhấn Enter để gửi · <button class="pf-link-btn" type="button" data-cm-cancel>Hủy</button></p>
  </div>`;
const pvCommentItem = (c, isReply = false) => `<li class="pv-comment${isReply ? ' is-reply' : ''}">
  ${pvCmAvatar(c.name, c.kind)}
  <div class="pv-comment-main">
    <article class="pf-pv-update is-full">
      <p class="pf-pv-update-meta"><b>${escapeHtml(c.name)}</b>${c.kind === 'org' ? `<span class="pf-badge is-green">${icon('check')}Ban tổ chức</span>` : ''}<span aria-hidden="true">•</span><time datetime="${new Date(c.time).toISOString()}">${pvCommentWhen(c.time)}</time></p>
      <p class="pf-pv-update-text">${escapeHtml(c.text)}</p>
    </article>
    <div class="pv-comment-actions">
      <button class="pf-link-btn" type="button" data-cm-like="${c.id}" aria-pressed="${c.liked}" aria-label="Thích bình luận của ${escapeHtml(c.name)}${c.likes ? `, ${c.likes} lượt thích` : ''}">${icon(c.liked ? 'heart-solid' : 'heart')}Thích${c.likes ? ` (${c.likes})` : ''}</button>
      ${isReply ? '' : `<button class="pf-link-btn" type="button" data-cm-reply="${c.id}" aria-expanded="${pvCtx.replyTo === c.id}">Trả lời</button>`}
    </div>
    ${isReply ? '' : `${c.replies.length ? `<ol class="pv-comments">${c.replies.map((r) => pvCommentItem(r, true)).join('')}</ol>` : ''}${pvCtx.replyTo === c.id ? pvReplyForm(c) : ''}`}
  </div>
</li>`;
const pvGrowBox = (area) => { area.style.height = 'auto'; area.style.height = `${area.scrollHeight}px`; };
const renderComments = () => {
  const list = document.querySelector('#pv-comments');
  if (!list) return;
  const { comments, commentLimit } = pvCtx;
  const score = (c) => c.likes + c.replies.length * 3;
  const sorted = [...comments].sort((a, b) => (b.mine || 0) - (a.mine || 0) || (pvCtx.sort === 'newest' ? b.time - a.time : score(b) - score(a) || b.time - a.time));
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);
  list.innerHTML = comments.length ? sorted.slice(0, commentLimit).map((c) => pvCommentItem(c)).join('') : '<li><p class="pf-view-none">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ.</p></li>';
  document.querySelector('[data-cm-more]').hidden = comments.length <= commentLimit;
  document.querySelector('#pv-cm-list-title').textContent = `Bình luận (${vVnd(total)})`;
  const sort = document.querySelector('[data-cm-sort]');
  sort.querySelector('span').textContent = PV_SORT_LABEL[pvCtx.sort];
  sort.setAttribute('aria-label', `Sắp xếp bình luận: ${PV_SORT_LABEL[pvCtx.sort]}`);
  const reply = document.querySelector('#pv-reply-text');
  if (reply) pvGrowBox(reply);
};
const pvFindComment = (cid) => pvCtx.comments.flatMap((c) => [c, ...c.replies]).find((c) => c.id === cid);
const postComment = () => {
  const text = document.querySelector('#pv-cm-text');
  const value = text.value.trim();
  document.querySelector('#pv-cm-field').classList.toggle('is-invalid', !value);
  if (!value) { text.focus(); return; }
  pvCommentSeq += 1;
  pvCtx.comments.push({ id: pvCommentSeq, name: PV_ME, kind: 'user', time: Date.now(), text: value, likes: 0, liked: false, replies: [], mine: pvCommentSeq });
  text.value = '';
  pvGrowBox(text);
  renderComments();
  showToast('Đã gửi bình luận.');
};
const postReply = (cid) => {
  const text = document.querySelector('#pv-reply-text');
  const value = text.value.trim();
  document.querySelector('#pv-reply-field').classList.toggle('is-invalid', !value);
  if (!value) { text.focus(); return; }
  pvCommentSeq += 1;
  pvCtx.comments.find((c) => c.id === cid).replies.push({ id: pvCommentSeq, name: PV_ME, kind: 'user', time: Date.now(), text: value, likes: 0, liked: false });
  pvCtx.replyTo = null;
  pvCtx.replyDraft = '';
  renderComments();
  showToast('Đã gửi trả lời.');
};

// ---------- Bản tin cập nhật (tab Hoạt động): bản tin minh họa của chương trình đã duyệt + bản tin người đề xuất vừa đăng (giữ trong phiên) ----------
const pvBulletins = new Map();
const programBulletins = (p, f, unit, photos) => {
  if (!pvBulletins.has(p.code)) {
    const media = (list) => list.map((src) => ({ type: 'image', src: imgSrc(src) }));
    const open = ['active', 'done'].includes(p.status);
    pvBulletins.set(p.code, !open ? [] : [
      ...(p.status === 'done' ? [{ date: p.updated, unit, title: `Tổng kết chương trình ${p.name}`, text: `${p.note}. Chương trình đã hoàn thành mục tiêu đề ra tại ${p.area}; báo cáo kết quả và chứng từ chi được công khai đầy đủ trên trang chương trình. Ban tổ chức trân trọng cảm ơn các nhà hảo tâm, tình nguyện viên đã đồng hành.`, media: media(photos.slice(0, 3)) }] : []),
      { date: p.status === 'done' ? addDays(p.created, 30) : p.updated, unit, title: `${p.name} — cập nhật tiến độ`, text: `${p.note}. ${p.desc} Ban tổ chức xin gửi lời cảm ơn chân thành tới các nhà hảo tâm, tình nguyện viên đã đồng hành cùng chương trình trong thời gian qua. Hình ảnh, tiến độ triển khai tại ${p.area} sẽ tiếp tục được cập nhật trong các bản tin tiếp theo.`, media: media([...photos.slice(1), ...PV_PHOTOS].slice(0, 8)) },
      { date: addDays(p.created, 5), unit, title: `Khởi động chương trình ${p.name}`, text: `Chương trình “${p.name}” đã được Hội phê duyệt và chính thức mở tiếp nhận ủng hộ từ ngày ${f.raiseFrom}. Mọi đóng góp được ${p.unit} tiếp nhận, sử dụng đúng mục đích và công khai sao kê trên nền tảng.`, media: media(photos.slice(0, 3)) },
    ]);
  }
  return pvBulletins.get(p.code);
};
// Tối đa 4 ảnh/video; còn lại hiện “+n” trên ô thứ 4
const pvMedia = (media) => {
  if (!media.length) return '';
  const more = media.length - 4;
  return `<div class="pf-pv-update-photos">${media.slice(0, 4).map((m, i) => `<figure class="pf-pv-update-photo">${m.type === 'video'
    ? `<video src="${m.src}" muted preload="metadata"></video><span class="pf-pv-play" aria-hidden="true">${icon('play')}</span>`
    : `<img src="${m.src}" alt="" loading="lazy" />`}${i === 3 && more > 0 ? `<span class="pf-pv-photo-more" aria-label="Còn ${more} ảnh, video">+${more}</span>` : ''}</figure>`).join('')}</div>`;
};
// Bản tin: ngày (dd/MM/yyyy) • đơn vị đăng · tiêu đề · nội dung (tối đa 1000 ký tự; khối Hoạt động trích đoạn chỉ hiện trích đoạn, bấm tiêu đề mở tab Hoạt động) · ảnh
// dateless: ngày đã hiện ở cột trái của dòng thời gian (tab Hoạt động)
const pvBulletin = (b, { excerpt = false, dateless = false } = {}) => `<article class="pf-pv-update${excerpt ? '' : ' is-full'}">
  <p class="pf-pv-update-meta">${dateless ? '' : `<time datetime="${b.date}">${viDate(b.date)}</time><span aria-hidden="true">•</span>`}<b>${escapeHtml(b.unit)}</b></p>
  <h4 class="pf-pv-update-title">${excerpt ? `<button class="pf-pv-update-link" type="button" data-pv-open-acts>${escapeHtml(b.title)}</button>` : escapeHtml(b.title)}</h4>
  ${b.html && !excerpt ? `<div class="pf-pv-update-text is-rich">${b.html}</div>` : `<p class="pf-pv-update-text">${escapeHtml(b.text.slice(0, RTE_MAX))}</p>`}
  ${pvMedia(b.media)}
</article>`;

// ---------- Các chiến dịch khác: 9 chương trình công khai mới nhất (minh họa, cùng dữ liệu trang Chương trình thiện nguyện) ----------
const OC_PRIORITY = { urgent: ['Khẩn cấp', 'is-urgent'], medium: ['Trung bình', 'is-medium'], low: ['Thấp', 'is-low'] };
const OTHER_CAMPAIGNS = [
  { id: 'lu-lut-mien-trung', title: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung', place: 'Quảng Trị', priority: 'urgent', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 1.245e9, goal: 2e9, days: 18 },
  { id: 'nuoc-sach-han-man', title: 'Nước sạch cho người dân vùng hạn mặn', place: 'Vĩnh Long', priority: 'medium', img: '1358142_gen-h-235_1777566365.jpg', raised: 410e6, goal: 1.2e9, days: 25 },
  { title: 'Tiếp sức mùa mưa lũ miền Trung 2026', place: 'Quảng Ngãi', priority: 'urgent', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 9.2e9, goal: 10e9, days: 12 },
  { id: 'tiep-suc-den-truong', title: 'Tiếp sức đến trường vùng cao', place: 'Cao Bằng', priority: 'medium', img: '3.-028ae9de1f.jpg', raised: 328.5e6, goal: 800e6, days: 34 },
  { title: 'Bữa cơm yêu thương cho bệnh nhân nghèo', place: 'Cao Bằng', priority: 'medium', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', raised: 225e6, goal: 500e6, days: 20 },
  { title: 'Áo ấm mùa đông cho trẻ em vùng biên giới', place: 'Điện Biên', priority: 'urgent', img: 'trao-qua-hoc-sinh.jpg', raised: 400e6, goal: 500e6, days: 5 },
  { id: 'mai-am-nhan-ai', title: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn', place: 'Tuyên Quang', priority: 'low', img: '1-1-3-9134.avif', raised: 860e6, goal: 1.5e9, days: 40 },
  { title: 'Phẫu thuật tim cho trẻ em có hoàn cảnh khó khăn', place: 'TP. Hồ Chí Minh', priority: 'medium', img: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', raised: 1.86e9, goal: 3e9, days: 15 },
  { title: 'Chung tay xây trường vùng cao Hà Giang', place: 'Hà Giang', priority: 'urgent', img: '3.-028ae9de1f.jpg', raised: 3.4e9, goal: 7e9, days: 8 },
  { title: 'Cầu dân sinh cho bà con vùng lũ', place: 'Đà Nẵng', priority: 'low', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', raised: 720e6, goal: 1.8e9, days: 22 },
];
const ocMoney = (n) => (n >= 1e9 ? `${(Math.round(n / 1e7) / 100).toLocaleString('vi-VN')} tỷ ₫` : `${Math.round(n / 1e6).toLocaleString('vi-VN')} triệu ₫`);
// Thẻ dùng chung kiểu .cp-card của trang Chương trình thiện nguyện
const ocCard = (c) => {
  const [label, cls] = OC_PRIORITY[c.priority];
  const pct = Math.round((c.raised / c.goal) * 100);
  const href = c.id ? `chuong-trinh.html?id=${c.id}` : '#';
  const panel = c.id ? '' : ` data-panel="${escapeHtml(c.title)}"`;
  return `<article class="cp-card">
    <div class="cp-card-media"><img src="${IMG}${c.img}" alt="" loading="lazy" /><span class="cp-priority ${cls}"><span class="cp-dot" aria-hidden="true"></span>${label}</span></div>
    <div class="cp-card-body">
      <p class="cp-place">${icon('pin')}${escapeHtml(c.place)}</p>
      <h4 class="cp-card-title"><a class="stretched" href="${href}"${panel}>${escapeHtml(c.title)}</a></h4>
      <div class="cp-figures"><strong class="cp-raised">${ocMoney(c.raised)}</strong><span class="cp-goal">${ocMoney(c.goal)}</span></div>
      <div class="cp-bar" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(pct, 100)}"><span style="width:${Math.min(pct, 100)}%"></span></div>
      <div class="cp-meta"><span>Đạt ${pct}%</span><span>${icon('clock')}Còn ${c.days} ngày</span></div>
    </div>
  </article>`;
};

// ---------- Dựng nội dung modal (SRS 3.3), bố cục như trang công khai: cột trái bộ ảnh · tab Câu chuyện / Hoạt động (+ Đăng cập nhật) / Danh sách ủng hộ (Hoạt động trích đoạn đang ẩn — PV_SHOW_LATEST) | cột phải gây quỹ · Vinh danh (Top 5 · Người đồng hành) · Bình luận ----------
// pvCtx: chương trình đang xem — dùng khi đăng bản tin, lọc danh sách ủng hộ, xuất sao kê, chia sẻ
let pvCtx = null;
// Tab Hồ sơ chương trình (thông tin đăng ký: 3 ô thống kê · Tổng quan · Đơn vị & liên hệ · Nguồn lực · Hàng hóa · Phân công · Hồ sơ pháp lý): đang ẩn — đổi true để hiện lại
const PV_SHOW_PROFILE = false;
// Khối Các chiến dịch khác (cuối modal, tự cuộn mỗi 10 giây): đang ẩn — đổi true để hiện lại
const PV_SHOW_OTHERS = false;
const renderProgramView = (p) => {
  const f = programForm(p);
  const st = PROGRAM_STATUS[p.status];
  const [priorityLabel, priorityCls] = PRIORITY[f.priority] || ['', ''];
  const reasons = p.status === 'rejected' ? p.note.split(/;\s*/) : [];
  const note = document.querySelector('#pf-view-note');
  const dot = '<span aria-hidden="true">•</span>';
  document.querySelector('#pf-view-title').textContent = p.name;
  // Dưới tiêu đề: Mã chương trình • trạng thái • Ngày tạo
  document.querySelector('#pf-view-sub').innerHTML = `<span>Mã chương trình: ${p.status === 'draft' ? programCodeText(p) : `<b>${p.code}</b>`}</span>${dot}<span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span>${dot}<span>Ngày tạo: ${viDate(p.created)}</span>`;
  // Lý do từ chối / ghi chú duyệt: thông tin của hồ sơ → hiển thị ở đầu modal
  note.hidden = !(reasons.length || ['pending', 'upcoming'].includes(p.status));
  note.className = `pf-view-note${reasons.length ? ' is-red' : ''}`;
  note.innerHTML = reasons.length ? `<b>Lý do từ chối:</b> ${reasons.map(escapeHtml).join('; ')}` : `<b>Ghi chú:</b> ${vText(p.note)}`;
  // Chân modal: Trang công khai chỉ hiện khi chương trình Đang gây quỹ; Chỉnh sửa chỉ khi Bản nháp (mã QR ủng hộ = nút Quyên góp trong khối gây quỹ)
  const isActive = p.status === 'active';
  const publicLink = document.querySelector('#pf-view-public');
  // Bản nháp: thêm nút Chỉnh sửa
  const editBtn = document.querySelector('#pf-view-edit');
  editBtn.hidden = p.status !== 'draft';
  editBtn.dataset.editProgram = p.code;
  publicLink.hidden = !isActive;
  if (p.detail) {
    publicLink.href = `chuong-trinh.html?id=${p.detail}`;
    delete publicLink.dataset.panel;
  } else {
    // Chưa có trang công khai minh họa → hiện thông báo xem trước
    publicLink.href = '#';
    publicLink.dataset.panel = `Trang công khai chương trình ${p.code}`;
  }
  const fund = programFund(p, f);
  const donations = programDonations(p, fund, f);
  const top = [...donations].sort((a, b) => b.amount - a.amount).slice(0, 5);
  // Thư viện ảnh (#3): Ảnh/Banner + Hình ảnh đính kèm của màn Đăng ký, thiếu thì bù ảnh minh họa
  const photos = [p.img, ...(p.photos || []), ...PV_PHOTOS.filter((x) => x !== p.img)].slice(0, 5);
  const shift = (Number(p.code.replace(/D/g, '').slice(-2)) || 0) % 4;
  photos.splice(1, 4, ...photos.slice(1).slice(shift), ...photos.slice(1).slice(0, shift));
  const isMoney = Boolean(fund.money);
  const pct = fund.open ? p.pct : 0;
  // Ô "Thời gian còn lại" của khung gây quỹ
  const daysValue = p.status === 'done' ? 'Đã kết thúc' : !fund.open ? 'Chưa mở' : fund.days > 0 ? `${fund.days} ngày` : 'Hết hạn';
  const toIso = (vi) => vi.split('/').reverse().join('-');
  const isOrg = p.creator === 'Tổ chức';
  // Đơn vị đăng bản tin = người tạo chương trình (Người vận động)
  const unit = f.creatorName;
  // Đăng bản tin cập nhật: chỉ khi đã mở vận động (Đang gây quỹ / Hoàn thành)
  const canPost = fund.open;
  pvCtx = { p, unit, donations, bulletins: programBulletins(p, f, unit, photos), comments: fund.open && PV_SHOW_COMMENTS ? programComments(p, f, unit) : [], commentLimit: PV_COMMENT_STEP, sort: 'relevant', replyTo: null, replyDraft: '' };
  pvPostMedia.forEach((m) => URL.revokeObjectURL(m.src));
  pvPostMedia = [];
  pvFeedLimit = PV_FEED_STEP;
  const goalText = isMoney ? pvVnd(fund.money) : vText(p.goal);
  // Câu chuyện (#9, như trang công khai): tên in hoa · dòng tóm tắt (thời gian tiếp nhận – mục tiêu – loại hình – đối tượng) · Mục tiêu tổng quát · Mục tiêu cụ thể/chỉ tiêu; thu gọn, Xem thêm
  const heart = icon('heart-solid');
  const raiseDays = f.raiseFrom && f.raiseTo ? Math.max(1, Math.round((new Date(toIso(f.raiseTo)) - new Date(toIso(f.raiseFrom))) / 86400000) + 1) : 0;
  const lead = [raiseDays ? `${raiseDays} ngày` : '', goalText, vText(f.support), f.people ? `Khoảng ${vVnd(f.people)} người` : ''].filter(Boolean).join(' – ');
  const story = `<div class="pf-pv-story-text pv-story is-collapsed" id="pf-pv-story-text">
      <h3 class="pv-story-title">${heart}${escapeHtml(p.name.toUpperCase())}${heart}</h3>
      ${lead ? `<p class="pv-story-lead">${lead}</p>` : ''}
      <p>${vText(f.goal)}</p>
      <p class="pf-pv-pre">${vText(f.target)}</p>
    </div>
    <button class="pf-pv-link" type="button" data-pv-more aria-expanded="false" aria-controls="pf-pv-story-text"><span>Xem thêm</span>${icon('chevron-down')}</button>`;
  // Đăng cập nhật tiến độ mới (#11): nội dung · kéo thả ảnh/video (JPG, PNG, MP4 ≤ 50MB) · Đăng bản tin (ảnh/video chỉ thêm qua vùng kéo thả)
  const postForm = canPost ? `<section class="pf-pv-post" aria-labelledby="pf-pv-post-title">
      <header class="pf-pv-post-head">${pvAvatar(isOrg ? 'org' : 'user')}<div><h3 id="pf-pv-post-title">Đăng cập nhật tiến độ mới</h3><p>Chia sẻ tiến độ, hình ảnh, video thực tế của chương trình tới các nhà hảo tâm</p></div></header>
      <div class="pf-field" id="pf-pv-post-field">
        <span class="visually-hidden" id="pf-pv-post-label">Nội dung bản tin</span>
        <!-- Ô soạn thảo có định dạng như Word: In đậm · In nghiêng · Danh sách dấu chấm · Danh sách đánh số (Ctrl+B / I) -->
        <div class="pf-control pf-rte">
          <div class="pf-rte-bar" role="toolbar" aria-label="Định dạng chữ" aria-controls="pf-pv-post-text">
            <button class="pf-rte-btn" type="button" data-rte="bold" aria-pressed="false" aria-label="In đậm" title="In đậm (Ctrl+B)"><b>B</b></button>
            <button class="pf-rte-btn" type="button" data-rte="italic" aria-pressed="false" aria-label="In nghiêng" title="In nghiêng (Ctrl+I)"><i>I</i></button>
            <button class="pf-rte-btn" type="button" data-rte="insertUnorderedList" aria-pressed="false" aria-label="Danh sách dấu chấm" title="Danh sách dấu chấm">${icon('list-bullet')}</button>
            <button class="pf-rte-btn" type="button" data-rte="insertOrderedList" aria-pressed="false" aria-label="Danh sách đánh số" title="Danh sách đánh số">${icon('list-number')}</button>
          </div>
          <div class="pf-rte-area" id="pf-pv-post-text" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="pf-pv-post-label" aria-describedby="pf-pv-post-count" data-placeholder="Viết nội dung cập nhật hoạt động, tiến độ chiến dịch…"></div>
          <!-- Số ký tự đã nhập / tối đa (nằm trong khung, góc dưới bên phải) -->
          <p class="pf-pv-post-count" id="pf-pv-post-count">0/${RTE_MAX}</p>
        </div>
        <p class="pf-field-error">${icon('alert')}Vui lòng nhập nội dung bản tin.</p>
      </div>
      <label class="pf-dropzone" data-pv-drop>
        <input type="file" accept="image/png, image/jpeg, video/mp4" multiple data-pv-add aria-describedby="pf-pv-post-hint" />
        <span class="pf-dropzone-icon" aria-hidden="true">${icon('upload')}</span>
        <span class="pf-dropzone-text">Kéo thả ảnh hoặc video vào đây, hoặc <b>Bấm để tải lên</b></span>
        <span class="pf-dropzone-hint" id="pf-pv-post-hint">(JPG, PNG, MP4 · Dung lượng tối đa: 50 MB)</span>
      </label>
      <ul class="pf-pv-post-media" id="pf-pv-post-media" aria-label="Ảnh, video đính kèm"></ul>
      <div class="pf-pv-post-actions">
        <button class="pf-btn pf-btn-primary" type="button" data-pv-post>Đăng bản tin</button>
      </div>
    </section>` : '';
  // Danh sách ủng hộ (#12): Tìm kiếm người ủng hộ · Tìm kiếm nâng cao (số tiền, thời gian) · bảng 10 dòng/trang · Hiển thị x – y/N
  const donorDate = (id, label) => `<div class="pf-control pf-date" data-vi-date><input type="text" inputmode="numeric" maxlength="10" placeholder="dd/mm/yyyy" autocomplete="off" aria-label="${label}" /><input class="pf-date-native" type="date" id="${id}" tabindex="-1" aria-hidden="true" /><button class="pf-date-btn" type="button" aria-label="Chọn ngày — ${label.toLowerCase()}">${icon('calendar')}</button></div>`;
  const donorsPanel = fund.open ? `<div class="pf-view-card pf-pv-donors">
      <div class="pf-pv-donors-tools">
        <label class="pf-input is-search">${icon('search')}<span class="visually-hidden">Tìm kiếm người ủng hộ</span><input type="search" id="pf-pv-donor-q" placeholder="Tìm kiếm người ủng hộ" autocomplete="off" /></label>
        <button class="pf-btn pf-btn-ghost pf-adv-toggle" type="button" aria-expanded="false" aria-controls="pf-pv-donor-adv" data-pv-adv>${icon('filter')}Tìm kiếm nâng cao<span class="pf-filter-count" hidden></span></button>
      </div>
      <div class="pf-pv-donor-adv" id="pf-pv-donor-adv" role="region" aria-label="Tìm kiếm nâng cao" hidden>
        <div class="pf-adv-grid is-donors">
          <div class="pf-adv-field" role="group" aria-labelledby="pf-pv-donor-money"><span id="pf-pv-donor-money">Số tiền ủng hộ</span>
            <div class="pf-reg-range">${donorMoney('pf-pv-donor-min', 'Từ')}${donorMoney('pf-pv-donor-max', 'Đến')}</div>
          </div>
          <div class="pf-adv-field" role="group" aria-labelledby="pf-pv-donor-time"><span id="pf-pv-donor-time">Thời gian ủng hộ</span>
            <div class="pf-reg-range">${donorDate('pf-pv-donor-from', 'Từ ngày')}${donorDate('pf-pv-donor-to', 'Đến ngày')}</div>
          </div>
        </div>
        <div class="pf-adv-foot"><button class="pf-link-btn" type="button" data-pv-donor-reset>${icon('close')}Xóa bộ lọc</button></div>
      </div>
      <div id="pf-pv-donor-list"></div>
    </div>` : '<p class="pf-view-none">Chương trình chưa mở tiếp nhận ủng hộ.</p>';
  const others = OTHER_CAMPAIGNS.filter((c) => c.id !== p.detail).slice(0, 9);
  const tab = (id, label, selected) => `<button type="button" role="tab" id="pf-pv-tab-${id}" aria-controls="pf-pv-panel-${id}" aria-selected="${selected}" ${selected ? '' : 'tabindex="-1"'}>${label}</button>`;
  // Tab Hồ sơ chương trình (thông tin đăng ký) — đang ẩn (PV_SHOW_PROFILE)
  const profilePanel = PV_SHOW_PROFILE ? `
    <!-- Số liệu chính -->
    <div class="pf-view-stats" id="pf-v-overview">
      ${vStat('layers', 'Mục tiêu quyên góp (VNĐ)', f.money ? `${vVnd(f.money)} VNĐ` : vText(p.goal))}
      ${vStat('people', 'Số người/hộ hưởng lợi dự kiến', f.people ? `${vVnd(f.people)} người` : '')}
      ${vStat('user', 'Số lượng TNV dự kiến', f.volunteers ? `${vVnd(f.volunteers)} người` : '')}
    </div>

    <!-- Tổng quan chương trình (4 : 6): trái — ảnh banner + lĩnh vực, mức độ ưu tiên · phải — dòng nhãn – giá trị (mục tiêu, phạm vi, thời gian) -->
    ${vCard('pf-v-summary', 'Tổng quan chương trình', `<div class="pf-view-overview">
      <div class="pf-view-overview-side">
        <figure class="pf-view-banner"><img src="${imgSrc(p.img)}" alt="Ảnh banner chương trình ${escapeHtml(p.name)}" loading="lazy" /></figure>
        ${vKvs([
          vKv('Lĩnh vực thiện nguyện trọng tâm', vText(p.field)),
          vKv('Mức độ ưu tiên', `<span class="pf-view-priority"><span class="pf-reg-dot ${priorityCls}" aria-hidden="true"></span>${priorityLabel}</span>`),
        ])}
      </div>
      ${vKvs([
        vKv('Mục tiêu tổng quát', vText(f.goal)),
        vKv('Mục tiêu cụ thể/chỉ tiêu', `<span class="pf-pv-pre">${vText(f.target)}</span>`),
        vKv('Địa bàn triển khai', vText(p.area)),
        vKv('Loại hình hỗ trợ', vText(f.support)),
        vKv('Nhóm đối tượng hưởng lợi', vTags(f.groups)),
        vKv('Thời gian triển khai thực hiện', vRange(f.runFrom, f.runTo)),
        vKv('Thời gian tiếp nhận vận động đóng góp', vRange(f.raiseFrom, f.raiseTo)),
      ])}
    </div>`)}

    <!-- Đơn vị tổ chức & liên hệ · Nguồn lực & Kế hoạch tài chính: 2 thẻ cạnh nhau, mỗi dòng nhãn (trái) – giá trị (phải) -->
    <div class="pf-view-pair">
      ${vCard('pf-v-org', 'Đơn vị tổ chức &amp; liên hệ', vKvs([
        vKv('Đối tượng tạo chương trình', vText(p.creator)),
        vKv('Tên đối tượng tạo', vText(f.creatorName)),
        vKv('Số điện thoại', vText(f.phone)),
        vKv('Email', vText(f.email)),
        vKv('Đơn vị chủ trì tiếp nhận', vText(p.unit)),
        vKv('Người chịu trách nhiệm chung', vText(p.owner)),
      ]))}
      ${vCard('pf-v-resources', 'Nguồn lực &amp; Kế hoạch tài chính', vKvs([
        vKv('Loại nguồn lực cần huy động', vTags(f.resources)),
        vKv('Hỗ trợ vận chuyển đến nơi quy định', vText(f.transport)),
        vKv('Nguồn lực kinh phí', vChecked(f.funding)),
        vKv('Hình thức vận động', vChecked(f.campaign)),
        vKv('Mục tiêu quyên góp (VNĐ)', f.money ? `${vVnd(f.money)} VNĐ` : vText(p.goal)),
        vKv('Địa điểm hàng hóa tập kết', vText(f.depot)),
      ]))}
    </div>

    ${vCard('pf-v-goods', 'Danh sách hàng hóa nhận', '<div id="pf-v-goods-body"></div>', `${f.goods.length} mặt hàng`)}

    ${vCard('pf-v-assign', 'Phân công đầu mối trách nhiệm thực thi', vTable('is-v-assign', ['Đơn vị/Tổ chức', 'Người phụ trách', 'Nhiệm vụ chính', 'Thời hạn hoàn thành'],
      f.assign.map(([unitName, person, task, date]) => [`<b>${escapeHtml(unitName)}</b>`, escapeHtml(person), escapeHtml(task), escapeHtml(date || '—')]),
      'Chưa phân công đầu mối.'), `${f.assign.length} đầu mối`)}

    ${vCard('pf-v-docs', 'Hồ sơ đề án &amp; Văn bản pháp lý đính kèm', vDocs(f.docs), `${f.docs.length} tệp`)}
  ` : '';
  document.querySelector('#pf-view-body').innerHTML = `
    <!-- Bố cục như trang công khai (chuong-trinh.html): id pv-root + .pv-page dùng chung CSS trang chi tiết — .pv-embed bỏ khoảng đệm đầu trang -->
    <div class="pv-page pv-embed" id="pv-root">
      <div class="pf-pv-split">
        <div class="pf-pv-split-main">
          <!-- Bộ ảnh: ảnh lớn, nút ‹ › hai bên, dải ảnh nhỏ -->
          <section class="pf-pv-card pv-photos" aria-label="Hình ảnh chương trình">
            <div class="pf-pv-gallery">
              <figure class="pf-pv-main">
                <img id="pf-pv-main-img" src="${imgSrc(photos[0])}" alt="Ảnh chương trình ${escapeHtml(p.name)}" />
                <div class="pf-pv-nav"><button class="pf-pv-nav-btn is-prev" type="button" data-pv-step="-1" aria-label="Ảnh trước">${icon('chevron-right')}</button><button class="pf-pv-nav-btn" type="button" data-pv-step="1" aria-label="Ảnh sau">${icon('chevron-right')}</button></div>
              </figure>
              <div class="pf-pv-thumbs" role="group" aria-label="Ảnh chương trình">${photos.map((src, i) => `<button class="pf-pv-thumb" type="button" data-pv-photo="${i}" aria-pressed="${i === 0}" aria-label="Ảnh ${i + 1}"><img src="${imgSrc(src)}" alt="" loading="lazy" /></button>`).join('')}</div>
            </div>
          </section>

          <!-- Tab nội dung: Câu chuyện · Hoạt động (bản tin + Đăng cập nhật tiến độ của người đề xuất) · Danh sách ủng hộ · (Hồ sơ chương trình — đang ẩn, PV_SHOW_PROFILE) -->
          <section class="pf-pv-card pv-content" aria-label="Nội dung chương trình">
            <div class="pf-pv-tabs" role="tablist" aria-label="Nội dung chương trình">
              ${tab('story', 'Câu chuyện', true)}${tab('acts', 'Hoạt động (0)', false)}${tab('donors', `Danh sách ủng hộ (${vVnd(fund.donors)})`, false)}${PV_SHOW_PROFILE ? tab('profile', 'Hồ sơ chương trình', false) : ''}
            </div>
            <div class="pf-pv-panel" id="pf-pv-panel-story" role="tabpanel" aria-labelledby="pf-pv-tab-story" tabindex="0">${story}</div>
            <div class="pf-pv-panel pf-pv-acts" id="pf-pv-panel-acts" role="tabpanel" aria-labelledby="pf-pv-tab-acts" tabindex="0" hidden>
              <ol class="pf-pv-timeline" id="pf-pv-feed"></ol>
              <button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-pv-feed-more hidden>Xem thêm hoạt động${icon('arrow')}</button>
              ${postForm}
            </div>
            <div class="pf-pv-panel" id="pf-pv-panel-donors" role="tabpanel" aria-labelledby="pf-pv-tab-donors" tabindex="0" hidden>${donorsPanel}</div>
            ${PV_SHOW_PROFILE ? `<div class="pf-pv-panel pf-pv-profile" id="pf-pv-panel-profile" role="tabpanel" aria-labelledby="pf-pv-tab-profile" hidden>${profilePanel}</div>` : ''}
          </section>

          ${PV_SHOW_LATEST ? `<!-- Hoạt động (trích đoạn, đang ẩn — PV_SHOW_LATEST): bản tin mới nhất, bấm tiêu đề mở tab Hoạt động — ẩn khi đang xem tab Hoạt động -->
          <section class="pf-pv-card pf-pv-updates" aria-labelledby="pf-pv-updates-title">
            <h3 id="pf-pv-updates-title">Hoạt động (0)</h3>
            <div id="pf-pv-latest"></div>
          </section>` : ''}
        </div>

        <!-- Cột phải: gây quỹ · Vinh danh (Top 5 ủng hộ · Người đồng hành, Xem danh sách) — Bình luận (PV_SHOW_COMMENTS) và Kê khai khoản chi đang ẩn -->
        <aside class="pf-pv-split-side" aria-label="Quyên góp và vinh danh">
          <!-- Gây quỹ (nền hồng nhạt): người vận động · khối trắng: mục tiêu, thời gian còn lại · khối trắng: số đã đạt + % · tiến độ · lượt ủng hộ · Xuất sao kê, Chia sẻ (không có nút Ủng hộ — màn quản lý của người tạo) -->
          <section class="pf-pv-card pf-pv-fund pv-fund" aria-label="Tiến độ gây quỹ">
            <div class="pf-pv-org pv-fund-org">
              ${isOrg ? '<img class="pv-fund-logo" src="Emages/logo-hctd-mark.svg" alt="" width="44" height="44" />' : `<span class="pf-pv-avatar pv-cm-initials pv-fund-logo tone-${pvTone(unit)}" aria-hidden="true">${escapeHtml(pvInitials(unit))}</span>`}
              <div class="pf-pv-org-text"><p class="pf-pv-cap">Người vận động</p><p class="pf-pv-org-name">${escapeHtml(unit)}</p></div>
              <span class="pf-badge is-green">${icon('check')}Đã xác minh</span>
            </div>
            <ul class="pv-fund-facts">
              <li><span class="pv-fact-icon">${icon('target')}</span><span><small>Mục tiêu chiến dịch</small><b>${goalText}</b></span></li>
              <li><span class="pv-fact-icon">${icon('clock')}</span><span><small>Thời gian còn lại</small><b>${daysValue}</b></span></li>
            </ul>
            <div class="pv-fund-panel">
              <div class="pv-fund-raised"><p><span class="visually-hidden">Đã đạt được</span><b>${isMoney ? pvVnd(fund.raised) : (fund.open ? vText(p.raised) : '0')}</b></p><b>${pct}%</b></div>
              <span class="pf-pv-bar" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(pct, 100)}" aria-valuetext="Đã đạt ${pct}% mục tiêu"><span style="width:${Math.min(pct, 100)}%"></span></span>
              <p class="pv-fund-count">Lượt ủng hộ: <b>${vVnd(fund.donors)}</b></p>
              ${fund.open ? `<div class="pf-pv-actions">
                <button class="pf-btn pf-btn-ghost" type="button" data-pv-statement>${icon('document')}Xuất sao kê</button>
                ${isActive ? `<button class="pf-btn pf-btn-ghost" type="button" data-pv-share>${icon('share')}Chia sẻ</button>` : ''}
              </div>` : ''}
            </div>
          </section>
          ${fund.open ? `<!-- Vinh danh: Top 5 người ủng hộ nhiều nhất · Người đồng hành — cuối mỗi tab có Xem danh sách -->
          <section class="pf-pv-card pf-pv-top5" aria-label="Vinh danh">
            <div class="pf-pv-tabs pv-top5-tabs" role="tablist" aria-label="Vinh danh">${tab('top', 'Top 5 ủng hộ', true)}${tab('companions', 'Người đồng hành', false)}</div>
            <div class="pv-top5-panel" id="pf-pv-panel-top" role="tabpanel" aria-labelledby="pf-pv-tab-top">${top.length ? pvTop5(top) : '<p class="pf-view-none">Chương trình chưa có người ủng hộ.</p>'}${top.length ? `<button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-pv-donor-list>Xem danh sách${icon('arrow')}</button>` : ''}</div>
            <div class="pv-top5-panel" id="pf-pv-panel-companions" role="tabpanel" aria-labelledby="pf-pv-tab-companions" hidden>${pvCompanionList(pvCompanions(p, fund))}<button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-panel="${escapeHtml(`Danh sách người đồng hành — ${p.name}`)}">Xem danh sách${icon('arrow')}</button></div>
          </section>
          ${PV_SHOW_COMMENTS ? `<!-- Bình luận (đang ẩn — PV_SHOW_COMMENTS): Bình luận (N) · sắp xếp · ô viết (Enter gửi) · Thích, Trả lời (1 cấp); hiện 3, Xem thêm mở thêm 3 -->
          <section class="pf-pv-card pv-cm-card" aria-labelledby="pv-cm-list-title">
            <header class="pv-cm-head">
              <h3 id="pv-cm-list-title">Bình luận (0)</h3>
              <button class="pf-link-btn" type="button" data-cm-sort aria-label="Sắp xếp bình luận: Phù hợp nhất">${icon('sliders')}<span>Phù hợp nhất</span></button>
            </header>
            <div class="pf-field pv-cm-compose" id="pv-cm-field">
              ${pvCmAvatar(PV_ME)}
              <div class="pv-cm-box">
                <label class="visually-hidden" for="pv-cm-text">Viết bình luận với tên ${PV_ME}</label>
                <textarea id="pv-cm-text" rows="1" maxlength="${PV_COMMENT_MAX}" placeholder="Viết bình luận…" data-cm-input="post"></textarea>
                <button class="pv-cm-send" type="button" data-cm-post aria-label="Gửi bình luận">${icon('send')}</button>
              </div>
              <p class="pf-field-error">${icon('alert')}Vui lòng nhập nội dung bình luận.</p>
            </div>
            <ol class="pv-comments" id="pv-comments"></ol>
            <button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-cm-more hidden>Xem thêm bình luận${icon('arrow')}</button>
          </section>` : ''}` : ''}
        </aside>
      </div>

      <!-- Các chiến dịch khác (#14): 9 chương trình công khai mới nhất, tự cuộn 1 thẻ mỗi 10 giây — đang ẩn (PV_SHOW_OTHERS) -->
      ${PV_SHOW_OTHERS ? `<section class="pf-pv-others" aria-labelledby="pf-pv-others-title">
        <div class="pf-pv-others-head"><h3 id="pf-pv-others-title">Các chiến dịch khác</h3><a class="pf-pv-link" href="chuong-trinh-thien-nguyen.html"><span>Xem tất cả</span>${icon('arrow')}</a></div>
        <div class="pf-pv-others-track" id="pf-pv-others-track" role="group" aria-label="Các chiến dịch khác — tự cuộn mỗi 10 giây, dừng khi rê chuột">${others.map(ocCard).join('')}</div>
      </section>` : ''}
    </div>`;
  pfViewGoods = f.goods;
  pfViewPhotos = photos;
  pfViewPhoto = 0;
  renderViewGoods(1);
  renderBulletins();
  renderDonors(1);
  renderComments();
};

// ---------- Tab Hoạt động · khối Cập nhật: dựng lại sau mỗi lần đăng bản tin ----------
// Tab Hoạt động dạng dòng thời gian: ngày (cột trái, chấm đỏ trên trục) · bản tin; hiện 3 bản tin, "Xem thêm hoạt động" mở thêm 3
const PV_FEED_STEP = 3;
let pvFeedLimit = PV_FEED_STEP;
const renderBulletins = () => {
  const { bulletins } = pvCtx;
  const none = '<p class="pf-view-none">Chương trình chưa có bản tin cập nhật.</p>';
  document.querySelector('#pf-pv-feed').innerHTML = bulletins.length
    ? bulletins.slice(0, pvFeedLimit).map((b) => `<li class="pf-pv-tl-item"><time class="pf-pv-tl-date" datetime="${b.date}">${viDate(b.date)}</time>${pvBulletin(b, { dateless: true })}</li>`).join('')
    : `<li>${none}</li>`;
  document.querySelector('[data-pv-feed-more]').hidden = bulletins.length <= pvFeedLimit;
  document.querySelector('#pf-pv-tab-acts').textContent = `Hoạt động (${bulletins.length})`;
  if (!PV_SHOW_LATEST) return;
  document.querySelector('#pf-pv-updates-title').textContent = `Hoạt động (${bulletins.length})`;
  document.querySelector('#pf-pv-latest').innerHTML = bulletins.length ? pvBulletin(bulletins[0], { excerpt: true }) : none;
};

// ---------- Danh sách ủng hộ: lọc theo tên, số tiền, thời gian · 10 dòng/trang · “Hiển thị x – y/N” ----------
const PV_DONORS_PER_PAGE = 10;
// Ô số tiền (lọc danh sách ủng hộ): dùng lại .pf-control.has-suffix — chỉ nhận chữ số, tự thêm dấu chấm hàng nghìn, đuôi VNĐ
const donorMoney = (id, label) => `<div class="pf-control has-suffix"><input type="text" inputmode="numeric" id="${id}" placeholder="${label}" autocomplete="off" aria-label="Số tiền ủng hộ — ${label.toLowerCase()}" /><span class="pf-suffix" aria-hidden="true">VNĐ</span></div>`;
const moneyValue = (el) => Number((el?.value || '').replace(/\D/g, '')) || 0;
const formatMoneyInput = (el) => { const n = moneyValue(el); el.value = n ? n.toLocaleString('vi-VN') : ''; };
let pvDonorPage = 1;
const renderDonors = (page = pvDonorPage) => {
  const box = document.querySelector('#pf-pv-donor-list');
  if (!box) return;
  const q = fold(document.querySelector('#pf-pv-donor-q').value.trim());
  // Số tiền Từ – Đến (bỏ trống = không giới hạn; nhập ngược thì tự đổi chỗ)
  let min = moneyValue(document.querySelector('#pf-pv-donor-min'));
  let max = moneyValue(document.querySelector('#pf-pv-donor-max'));
  if (min && max && min > max) [min, max] = [max, min];
  const from = document.querySelector('#pf-pv-donor-from').value;
  const to = document.querySelector('#pf-pv-donor-to').value;
  const rows = pvCtx.donations.filter((d) => {
    const day = localIso(new Date(d.time));
    return (!q || fold(d.name).includes(q)) && (!min || d.amount >= min) && (!max || d.amount <= max) && (!from || day >= from) && (!to || day <= to);
  });
  const active = [min || max, from || to].filter(Boolean).length;
  const count = document.querySelector('[data-pv-adv] .pf-filter-count');
  count.hidden = active === 0;
  count.textContent = active;
  const pages = Math.max(1, Math.ceil(rows.length / PV_DONORS_PER_PAGE));
  pvDonorPage = Math.min(Math.max(1, page), pages);
  const start = (pvDonorPage - 1) * PV_DONORS_PER_PAGE;
  const slice = rows.slice(start, start + PV_DONORS_PER_PAGE);
  box.innerHTML = rows.length ? `${vTable('is-v-donors', ['Người ủng hộ', 'Số tiền ủng hộ', 'Thời gian ủng hộ'],
    slice.map((d) => [`<span class="pf-pv-donor">${pvDonorAvatar(d)}<b>${escapeHtml(d.name)}</b></span>`, `<b class="pf-pv-amount">${pvMoney(d.amount)}</b>`, pvDateTime(d.time)]), '', start + 1)}
    <div class="pf-table-foot">
      <p class="pf-muted" aria-live="polite">Hiển thị ${start + 1} – ${start + slice.length}/${vVnd(rows.length)}</p>
      ${pages > 1 ? vPager('data-donor-page', pvDonorPage, pages) : ''}
    </div>` : '<p class="pf-view-none">Không tìm thấy người ủng hộ phù hợp.</p>';
};

// ---------- Đăng bản tin cập nhật (NL10): kiểm tra nội dung, ảnh/video sai định dạng hoặc quá 50MB → TB10; đăng lên đầu danh sách → TB11 ----------
const PV_POST_TYPES = { '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.mp4': 'video' };
let pvPostMedia = [];
const renderPostMedia = () => {
  document.querySelector('#pf-pv-post-media').innerHTML = pvPostMedia.map((m, i) => `<li class="pf-pv-post-item">
    ${m.type === 'video' ? `<video src="${m.src}" muted preload="metadata"></video><span class="pf-pv-play" aria-hidden="true">${icon('play')}</span>` : `<img src="${m.src}" alt="" />`}
    <button class="pf-pv-post-remove" type="button" data-pv-remove="${i}" aria-label="Xóa ${escapeHtml(m.name)}">${icon('close')}</button>
  </li>`).join('');
};
const addPostMedia = (files) => {
  let invalid = 0;
  files.forEach((file) => {
    const type = PV_POST_TYPES[(file.name.match(/\.[^.]+$/) || [''])[0].toLowerCase()];
    if (!type || file.size > 50 * 1048576) { invalid += 1; return; }
    pvPostMedia.push({ type, src: URL.createObjectURL(file), name: file.name });
  });
  renderPostMedia();
  if (invalid) showToast('File không hợp lệ. Vui lòng kiểm tra định dạng và dung lượng.', 'error');
};
// ---------- Ô soạn thảo có định dạng: chỉ giữ thẻ định dạng an toàn (đậm, nghiêng, danh sách, xuống dòng), bỏ mọi thuộc tính ----------
const RTE_TAGS = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', UL: 'ul', OL: 'ol', LI: 'li', BR: 'br', DIV: 'div', P: 'div' };
const cleanRichText = (html) => {
  const box = document.createElement('template');
  box.innerHTML = html;
  const walk = (node) => [...node.childNodes].map((n) => {
    if (n.nodeType === 3) return escapeHtml(n.textContent);
    if (n.nodeType !== 1) return '';
    const tag = RTE_TAGS[n.tagName];
    if (!tag) return walk(n);
    return tag === 'br' ? '<br>' : `<${tag}>${walk(n)}</${tag}>`;
  }).join('');
  return walk(box.content);
};
// Số ký tự (chữ thuần, tối đa 1000) · trạng thái nút định dạng theo vị trí con trỏ
const RTE_MAX = 1000;
const rteLength = (area) => area.textContent.length;
const syncRteBar = () => {
  const area = document.querySelector('#pf-pv-post-text');
  if (!area) return;
  const inside = area.contains(document.getSelection().anchorNode);
  pfViewBody.querySelectorAll('[data-rte]').forEach((b) => { let on = false; try { on = inside && document.queryCommandState(b.dataset.rte); } catch (e) { on = false; } b.setAttribute('aria-pressed', String(on)); });
};
const postBulletin = () => {
  const text = document.querySelector('#pf-pv-post-text');
  const value = text.textContent.trim();
  document.querySelector('#pf-pv-post-field').classList.toggle('is-invalid', !value);
  if (!value) { text.focus(); return; }
  pvCtx.bulletins.unshift({ date: localIso(), unit: pvCtx.unit, title: pvCtx.p.name, text: value.slice(0, RTE_MAX), html: cleanRichText(text.innerHTML), media: pvPostMedia });
  pvPostMedia = [];
  text.innerHTML = '';
  syncRteBar();
  document.querySelector('#pf-pv-post-count').textContent = `0/${RTE_MAX}`;
  renderPostMedia();
  renderBulletins();
  document.querySelector('#pf-pv-feed').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  showToast('Đã đăng bản tin cập nhật.');
};

// ---------- Chia sẻ (icon chia sẻ, Chia sẻ & Lan tỏa): sao chép URL chương trình · Xuất sao kê: tệp CSV toàn bộ lượt ủng hộ ----------
const programUrl = (p) => new URL(p.detail ? `chuong-trinh.html?id=${p.detail}` : `ho-so.html#chuong-trinh/xem/${p.code}`, window.location.href).href;
const copyProgramUrl = async () => {
  if (!pvCtx) return;
  const url = programUrl(pvCtx.p);
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    const area = Object.assign(document.createElement('textarea'), { value: url });
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  showToast('Đã sao chép liên kết chương trình.');
};
const exportStatement = () => {
  const { p, donations } = pvCtx;
  downloadCsv(['STT', 'Thời gian ủng hộ', 'Người ủng hộ', 'Số tiền ủng hộ (VNĐ)'],
    donations.map((d, i) => [i + 1, pvDateTime(d.time), d.name, d.amount]), `sao-ke-${p.code}.csv`);
  showToast(`Đã xuất sao kê ${vVnd(donations.length)} lượt ủng hộ.`);
};

// ---------- Mở / đóng modal: theo #chuong-trinh/xem/<mã>; đóng thì trả đường dẫn về tab đang xem ----------
const pfView = document.querySelector('#pf-view');
const pfViewPanel = pfView.querySelector('.pf-reg-panel');
const pfViewBody = document.querySelector('#pf-view-body');
const viewReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let pfViewCode = null;
let pfViewTrigger = null;
let pfViewTimer;
pfViewPanel.tabIndex = -1;
const openProgramView = (code) => {
  const p = findProgram(code);
  if (!p) {
    showToast(`Không tìm thấy chương trình “${code}”.`, 'error');
    closeProgramView();
    return;
  }
  if (pfView.hidden) pfViewTrigger = document.activeElement;
  pfViewCode = code;
  renderProgramView(p);
  clearTimeout(pfViewTimer);
  pfView.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  pfViewBody.scrollTop = 0;
  void pfView.offsetWidth; // tính lại bố cục để hiệu ứng trượt chạy
  pfView.classList.add('is-open');
  pfViewPanel.focus({ preventScroll: true });
  syncStoryMore();
  syncSideSticky();
  startOthersAuto();
};
function closeProgramView(updateHash = true) {
  if (pfView.hidden) return;
  clearInterval(pvOthersTimer);
  pfView.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  pfViewTimer = setTimeout(() => { pfView.hidden = true; }, viewReduced() ? 0 : 300);
  pfViewCode = null;
  if (updateHash && window.location.hash.startsWith('#chuong-trinh/xem/')) {
    const slug = ct.status ? `/${PROGRAM_STATUS[ct.status].slug}` : '';
    history.replaceState(null, '', `#chuong-trinh${slug}`);
  }
  if (pfViewTrigger && document.contains(pfViewTrigger)) pfViewTrigger.focus();
}
pfView.querySelectorAll('[data-close-view]').forEach((button) => button.addEventListener('click', () => closeProgramView()));
// ---------- Cột phải (gây quỹ · Vinh danh) dính khi cuộn thân modal: ngắn hơn khung nhìn → dính ở đầu (cách 16px);
// dài hơn → cuộn tới khi lộ hết đáy rồi dính ở đáy (top âm) — không để khoảng trống dưới cột phải ----------
const SIDE_GAP = 16;
function syncSideSticky() {
  const side = pfViewBody.querySelector('.pf-pv-split-side');
  if (!side) return;
  side.style.setProperty('--side-top', `${Math.min(SIDE_GAP, pfViewBody.clientHeight - side.offsetHeight - SIDE_GAP)}px`);
}
const sideObserver = new ResizeObserver(() => { if (!pfView.hidden) syncSideSticky(); });
sideObserver.observe(pfViewBody);
new MutationObserver(() => { const side = pfViewBody.querySelector('.pf-pv-split-side'); if (side) sideObserver.observe(side); }).observe(pfViewBody, { childList: true });
// ---------- Câu chuyện: chỉ hiện Xem thêm khi nội dung dài hơn khung thu gọn (đo sau khi modal hiện) ----------
function syncStoryMore() {
  const text = pfViewBody.querySelector('#pf-pv-story-text');
  const more = pfViewBody.querySelector('[data-pv-more]');
  const overflow = text.scrollHeight > text.clientHeight + 1;
  more.hidden = !overflow;
  if (!overflow) text.classList.remove('is-collapsed');
}
// ---------- Các chiến dịch khác: cứ 10 giây cuộn sang trái 1 thẻ, hết thì về đầu; dừng khi rê chuột / đang focus ----------
let pvOthersTimer;
function startOthersAuto() {
  clearInterval(pvOthersTimer);
  if (!PV_SHOW_OTHERS) return;
  pvOthersTimer = setInterval(() => {
    const track = pfViewBody.querySelector('#pf-pv-others-track');
    if (!track || !track.firstElementChild || track.matches(':hover, :focus-within')) return;
    const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: viewReduced() ? 'auto' : 'smooth' });
  }, 10000);
}
// ---------- Trang chiến dịch: đổi ảnh (ảnh nhỏ, nút trước/sau), tab nội dung, Xem thêm câu chuyện ----------
let pfViewPhotos = [];
let pfViewPhoto = 0;
const showViewPhoto = (index) => {
  if (!pfViewPhotos.length) return;
  pfViewPhoto = (index + pfViewPhotos.length) % pfViewPhotos.length;
  pfViewBody.querySelector('#pf-pv-main-img').src = imgSrc(pfViewPhotos[pfViewPhoto]);
  pfViewBody.querySelectorAll('.pf-pv-thumb').forEach((b, i) => b.setAttribute('aria-pressed', String(i === pfViewPhoto)));
};
// Mỗi thanh tab chỉ đổi tab của chính nó (tab nội dung · tab Vinh danh: Top 5 / Người đồng hành)
const selectViewTab = (button) => {
  const list = button.closest('[role="tablist"]');
  list.querySelectorAll('[role="tab"]').forEach((t) => {
    const on = t === button;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  // Khối Hoạt động trích đoạn (bản tin mới nhất) trùng nội dung tab Hoạt động → ẩn khi đang xem tab Hoạt động
  const latest = pfViewBody.querySelector('.pf-pv-updates');
  if (latest && !list.classList.contains('pv-top5-tabs')) latest.hidden = button.id === 'pf-pv-tab-acts';
};
pfViewBody.addEventListener('keydown', (event) => {
  // Ô viết bình luận / trả lời: Enter gửi · Shift+Enter xuống dòng · Esc đóng ô trả lời
  const input = event.target.closest('[data-cm-input]');
  if (input && event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (input.dataset.cmInput === 'post') postComment();
    else postReply(pvCtx.replyTo);
    return;
  }
  if (input && input.dataset.cmInput === 'reply' && event.key === 'Escape') {
    event.stopPropagation();
    const cid = pvCtx.replyTo;
    pvCtx.replyTo = null;
    pvCtx.replyDraft = '';
    renderComments();
    pfViewBody.querySelector(`[data-cm-reply="${cid}"]`).focus();
    return;
  }
  const tabBtn = event.target.closest('.pf-pv-tabs [role="tab"]');
  if (!tabBtn || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...tabBtn.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(tabBtn);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  selectViewTab(tabs[next]);
  tabs[next].focus();
});
pfViewBody.addEventListener('click', (event) => {
  const photoBtn = event.target.closest('[data-pv-photo]');
  if (photoBtn) showViewPhoto(Number(photoBtn.dataset.pvPhoto));
  const stepBtn = event.target.closest('[data-pv-step]');
  if (stepBtn) showViewPhoto(pfViewPhoto + Number(stepBtn.dataset.pvStep));
  const tabBtn = event.target.closest('.pf-pv-tabs [role="tab"]');
  if (tabBtn) selectViewTab(tabBtn);
  // Khối Hoạt động trích đoạn · bấm tiêu đề bản tin → tab Hoạt động · Top 5 · Xem danh sách → tab Danh sách ủng hộ (cuộn tới khung tab)
  const goTab = (id) => { selectViewTab(pfViewBody.querySelector(id)); pfViewBody.querySelector('.pv-content').scrollIntoView({ block: 'start', behavior: viewReduced() ? 'auto' : 'smooth' }); };
  if (event.target.closest('[data-pv-open-acts]')) goTab('#pf-pv-tab-acts');
  if (event.target.closest('[data-pv-donor-list]')) goTab('#pf-pv-tab-donors');
  // Bình luận: sắp xếp · gửi · Xem thêm · Thích (bấm lại để bỏ) · mở / đóng ô trả lời · gửi trả lời
  if (event.target.closest('[data-cm-sort]')) { pvCtx.sort = pvCtx.sort === 'relevant' ? 'newest' : 'relevant'; renderComments(); }
  if (event.target.closest('[data-cm-post]')) postComment();
  if (event.target.closest('[data-cm-more]')) { pvCtx.commentLimit += PV_COMMENT_STEP; renderComments(); }
  const likeBtn = event.target.closest('[data-cm-like]');
  if (likeBtn) {
    const c = pvFindComment(Number(likeBtn.dataset.cmLike));
    c.liked = !c.liked;
    c.likes += c.liked ? 1 : -1;
    renderComments();
    pfViewBody.querySelector(`[data-cm-like="${c.id}"]`).focus();
  }
  const replyBtn = event.target.closest('[data-cm-reply]');
  if (replyBtn) {
    const cid = Number(replyBtn.dataset.cmReply);
    pvCtx.replyTo = pvCtx.replyTo === cid ? null : cid;
    pvCtx.replyDraft = '';
    renderComments();
    if (pvCtx.replyTo) pfViewBody.querySelector('#pv-reply-text').focus();
  }
  if (event.target.closest('[data-cm-cancel]')) { pvCtx.replyTo = null; pvCtx.replyDraft = ''; renderComments(); }
  const sendBtn = event.target.closest('[data-cm-send]');
  if (sendBtn) postReply(Number(sendBtn.dataset.cmSend));
  const moreBtn = event.target.closest('[data-pv-more]');
  if (moreBtn) {
    const open = moreBtn.getAttribute('aria-expanded') !== 'true';
    moreBtn.setAttribute('aria-expanded', String(open));
    pfViewBody.querySelector('#pf-pv-story-text').classList.toggle('is-collapsed', !open);
    moreBtn.querySelector('span').textContent = open ? 'Thu gọn' : 'Xem thêm';
  }
  if (event.target.closest('[data-download], [data-preview]')) showToast('Bản xem trước — tệp chưa được tải từ hệ thống.', 'info');
  if (event.target.closest('[data-pv-share]')) copyProgramUrl();
  if (event.target.closest('[data-pv-statement]')) exportStatement();
  // Phân trang Danh sách hàng hóa nhận · Danh sách ủng hộ
  const pageBtn = event.target.closest('[data-goods-page]');
  if (pageBtn && !pageBtn.disabled) renderViewGoods(Number(pageBtn.dataset.goodsPage));
  const donorPageBtn = event.target.closest('[data-donor-page]');
  if (donorPageBtn && !donorPageBtn.disabled) {
    renderDonors(Number(donorPageBtn.dataset.donorPage));
    pfViewBody.querySelector('.pf-pv-donors').scrollIntoView({ block: 'nearest' });
  }
  // Tìm kiếm nâng cao người ủng hộ: mở / đóng · xóa điều kiện
  const advBtn = event.target.closest('[data-pv-adv]');
  if (advBtn) {
    const open = advBtn.getAttribute('aria-expanded') !== 'true';
    advBtn.setAttribute('aria-expanded', String(open));
    pfViewBody.querySelector('#pf-pv-donor-adv').hidden = !open;
  }
  if (event.target.closest('[data-pv-donor-reset]')) {
    pfViewBody.querySelectorAll('#pf-pv-donor-adv select, #pf-pv-donor-adv input').forEach((el) => { el.value = ''; });
    renderDonors(1);
  }
  // Đăng cập nhật tiến độ: bỏ ảnh/video đã chọn · đăng bản tin
  const removeBtn = event.target.closest('[data-pv-remove]');
  if (removeBtn) {
    const [m] = pvPostMedia.splice(Number(removeBtn.dataset.pvRemove), 1);
    URL.revokeObjectURL(m.src);
    renderPostMedia();
  }
  // Thanh định dạng: In đậm · In nghiêng · Gạch chân · danh sách (áp lên đoạn đang chọn trong ô soạn thảo)
  const rteBtn = event.target.closest('[data-rte]');
  if (rteBtn) {
    pfViewBody.querySelector('#pf-pv-post-text').focus();
    document.execCommand(rteBtn.dataset.rte);
    syncRteBar();
  }
  if (event.target.closest('[data-pv-post]')) postBulletin();
  if (event.target.closest('[data-pv-feed-more]')) { pvFeedLimit += PV_FEED_STEP; renderBulletins(); }
});
pfViewBody.addEventListener('input', (event) => {
  if (event.target.matches('#pf-pv-donor-q')) renderDonors(1);
  if (event.target.matches('#pf-pv-donor-min, #pf-pv-donor-max')) { formatMoneyInput(event.target); renderDonors(1); }
  // Ô bình luận: tự giãn, hết lỗi khi đã nhập · ô trả lời: giữ bản nháp khi danh sách dựng lại
  if (event.target.matches('[data-cm-input]')) pvGrowBox(event.target);
  if (event.target.matches('#pv-cm-text') && event.target.value.trim()) pfViewBody.querySelector('#pv-cm-field').classList.remove('is-invalid');
  if (event.target.matches('#pv-reply-text')) {
    pvCtx.replyDraft = event.target.value;
    if (event.target.value.trim()) pfViewBody.querySelector('#pv-reply-field').classList.remove('is-invalid');
  }
  if (event.target.matches('#pf-pv-post-text')) {
    // xóa hết chữ → làm trống hẳn để hiện lại gợi ý
    if (!event.target.textContent.trim() && !event.target.querySelector('li')) event.target.innerHTML = '';
    pfViewBody.querySelector('#pf-pv-post-count').textContent = `${rteLength(event.target)}/${RTE_MAX}`;
    syncRteBar();
    if (event.target.textContent.trim()) pfViewBody.querySelector('#pf-pv-post-field').classList.remove('is-invalid');
  }
});
pfViewBody.addEventListener('change', (event) => {
  if (event.target.matches('#pf-pv-donor-from, #pf-pv-donor-to')) renderDonors(1);
  if (event.target.matches('[data-pv-add]')) { addPostMedia([...event.target.files]); event.target.value = ''; }
});
// Ô soạn thảo bản tin: bấm nút định dạng không làm mất vùng chọn · tối đa 1000 ký tự · dán chỉ lấy chữ thường · nút sáng theo định dạng tại con trỏ
pfViewBody.addEventListener('mousedown', (event) => { if (event.target.closest('[data-rte]')) event.preventDefault(); });
pfViewBody.addEventListener('beforeinput', (event) => {
  if (!event.target.matches('#pf-pv-post-text')) return;
  const typing = /^insert(Text|CompositionText|FromPaste|FromDrop|ReplacementText)$/.test(event.inputType);
  const selected = document.getSelection().toString().length;
  if (typing && rteLength(event.target) - selected >= RTE_MAX) event.preventDefault();
});
pfViewBody.addEventListener('paste', (event) => {
  if (!event.target.closest('#pf-pv-post-text')) return;
  event.preventDefault();
  const area = pfViewBody.querySelector('#pf-pv-post-text');
  const room = RTE_MAX - rteLength(area) + document.getSelection().toString().length;
  const text = (event.clipboardData.getData('text/plain') || '').slice(0, Math.max(0, room));
  if (text) document.execCommand('insertText', false, text);
});
document.addEventListener('selectionchange', syncRteBar);
// Kéo thả ảnh/video vào vùng tải lên của khối Đăng cập nhật tiến độ mới
['dragenter', 'dragover'].forEach((type) => pfViewBody.addEventListener(type, (event) => {
  const zone = event.target.closest('[data-pv-drop]');
  if (!zone) return;
  event.preventDefault();
  zone.classList.add('is-dragover');
}));
['dragleave', 'drop'].forEach((type) => pfViewBody.addEventListener(type, (event) => {
  const zone = event.target.closest('[data-pv-drop]');
  if (!zone) return;
  zone.classList.remove('is-dragover');
  if (type === 'drop') { event.preventDefault(); addPostMedia([...event.dataTransfer.files]); }
}));
document.addEventListener('keydown', (event) => {
  if (pfView.hidden || dialog.open) return;
  if (event.key === 'Escape') { closeProgramView(); return; }
  if (event.key !== 'Tab') return;
  const items = [...pfViewPanel.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]), select, textarea')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === pfViewPanel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-export]');
  if (button) exportPrograms([findProgram(button.dataset.export)], `${button.dataset.export}.csv`);
});

// ==================== SECTION: HỒ SƠ NGƯỜI YẾU THẾ — tab trạng thái, bộ lọc, bảng, kết xuất ====================
// Cột gộp: [ảnh đại diện · họ tên (1 dòng) · mã + giới tính, tuổi] · đối tượng (2 dòng) · [địa bàn · cán bộ phụ trách]
// · nhu cầu chính (2 dòng) · [ngày cập nhật · ngày tạo] · trạng thái · thao tác.
const vul = {
  status: '',
  search: document.querySelector('#vul-search'),
  type: document.querySelector('#vul-type'),
};
fillOptions(vul.type, [...new Set(VULNERABLE.map((v) => v.type))]);

const vulnerableRow = (v) => {
  const st = VULNERABLE_STATUS[v.status];
  const view = `#nguoi-yeu-the/xem/${v.code}`;
  return `<tr>
    <td>
      <div class="pf-cell-media">
        <span class="pf-avatar" aria-hidden="true">${escapeHtml(v.initials)}</span>
        <div class="pf-cell-stack">
          <a class="pf-cell-title" href="${view}"><span class="pf-clamp-1" data-tip>${escapeHtml(v.name)}</span></a>
          <span class="pf-cell-line is-code"><span>${v.code}</span><span aria-hidden="true">·</span>${line(`${v.gender}, ${v.age} tuổi`, { label: 'Giới tính, tuổi' })}</span>
        </div>
      </div>
    </td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(v.type)}</span></td>
    <td><div class="pf-cell-stack">${line(v.area, { label: 'Địa bàn', iconId: 'pin' })}${line(v.officer, { label: 'Cán bộ phụ trách', iconId: 'shield' })}</div></td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(v.need)}</span></td>
    <td><div class="pf-cell-stack">${line(viDate(v.updated), { label: 'Ngày cập nhật', iconId: 'clock' })}${line(`Tạo ${viDate(v.created)}`, { label: 'Ngày tạo', cls: 'is-muted' })}</div></td>
    <td><span class="pf-badge is-${st.tone}">${st.label}</span></td>
    ${rowActions(view, 'vulnerable', v.code)}
  </tr>`;
};
const vulnerableTable = createTable({
  rows: VULNERABLE,
  body: document.querySelector('#vul-rows'),
  empty: document.querySelector('#vul-empty'),
  pager: document.querySelector('#vul-pager'),
  range: document.querySelector('#vul-range'),
  renderRow: vulnerableRow,
});
const applyVulnerableFilter = () => {
  const query = fold(vul.search.value.trim());
  vulnerableTable.setFilter((v) => (!query || fold(`${v.code} ${v.name} ${v.area}`).includes(query))
    && (!vul.status || v.status === vul.status)
    && (!vul.type.value || v.type === vul.type.value));
};
vul.search.addEventListener('input', applyVulnerableFilter);
vul.type.addEventListener('change', applyVulnerableFilter);
document.querySelector('#vul-export').addEventListener('click', () => {
  const rows = vulnerableTable.shownRows();
  downloadCsv(
    ['Mã hồ sơ', 'Họ tên', 'Giới tính', 'Tuổi', 'Đối tượng', 'Địa bàn', 'Cán bộ phụ trách', 'Nhu cầu chính', 'Trạng thái', 'Ngày tạo', 'Ngày cập nhật'],
    rows.map((v) => [v.code, v.name, v.gender, v.age, v.type, v.area, v.officer, v.need, VULNERABLE_STATUS[v.status].label, viDate(v.created), viDate(v.updated)]),
    'ho-so-nguoi-yeu-the.csv',
  );
  showToast(`Đã kết xuất ${rows.length} hồ sơ ra tệp CSV.`);
});

// ==================== SECTION: CHI TIẾT HỒ SƠ NGƯỜI YẾU THẾ ====================
const renderVulnerableDetail = (code) => {
  const v = findVulnerable(code);
  const title = document.querySelector('#vul-detail-title');
  const sub = document.querySelector('#vul-detail-sub');
  const actions = document.querySelector('#vul-detail-actions');
  const body = document.querySelector('#vul-detail-body');
  if (!v) {
    title.textContent = 'Không tìm thấy hồ sơ';
    sub.textContent = `Mã “${code}” không có trong danh sách của bạn.`;
    actions.innerHTML = '';
    body.innerHTML = '<div class="pf-card pf-empty">Hồ sơ có thể đã bị xóa hoặc bạn không còn quyền quản lý.</div>';
    return null;
  }
  const st = VULNERABLE_STATUS[v.status];
  title.textContent = v.name;
  sub.innerHTML = `<span>Mã: <b>${v.code}</b></span><span class="pf-badge is-${st.tone}">${st.label}</span>`;
  actions.innerHTML = `
    ${v.status !== 'done' ? `<button class="pf-btn pf-btn-ghost" type="button" data-panel="Gửi yêu cầu xác minh ${v.code}">${icon('shield')}Gửi yêu cầu xác minh</button>` : ''}
    <button class="pf-btn pf-btn-primary" type="button" data-panel="Cập nhật hồ sơ ${v.code}">${icon('pencil')}Cập nhật hồ sơ</button>`;
  const verify = {
    done: `<p class="pf-detail-text">Hồ sơ đã được cán bộ Hội xác minh và sẵn sàng kết nối nguồn lực.</p>`,
    wait: `<p class="pf-detail-text">Cán bộ ${escapeHtml(v.officer)} sẽ liên hệ xác minh trong 5 ngày làm việc kể từ ${viDate(v.created)}.</p>`,
    need: `<p class="pf-detail-text">Cần bổ sung các giấy tờ sau để Hội tiếp tục xác minh:</p><ul class="pf-checklist">${(v.missing || []).map((m) => `<li>${icon('alert')}${escapeHtml(m)}</li>`).join('')}</ul>`,
  }[v.status];
  const steps = [
    { date: v.created, title: 'Đăng ký hồ sơ', meta: 'Nguyễn Ngọc Trâm', cls: 'is-muted' },
    ...(v.status === 'done' ? [{ date: v.updated, title: 'Xác minh hoàn tất', meta: `Cán bộ ${v.officer}` }] : []),
    ...(v.status === 'wait' ? [{ date: v.updated, title: 'Đang chờ cán bộ xác minh', meta: `Cán bộ ${v.officer}`, cls: 'is-upcoming' }] : []),
    ...(v.status === 'need' ? [{ date: v.updated, title: 'Yêu cầu bổ sung giấy tờ', meta: `Cán bộ ${v.officer}`, cls: 'is-alert' }] : []),
  ].reverse();
  body.innerHTML = `
    <p class="pf-notice">${icon('shield')}Thông tin trên trang chỉ hiển thị cho bạn và cán bộ Hội phụ trách địa bàn.</p>
    <div class="pf-detail-grid">
      <div class="pf-detail-main">
        <div class="pf-card">
          <h2 class="pf-card-title">Thông tin người được hỗ trợ</h2>
          ${kv([
            ['Mã hồ sơ', v.code],
            ['Họ và tên', escapeHtml(v.name)],
            ['Tuổi', `${v.age} tuổi`],
            ['Giới tính', v.gender],
            ['Đối tượng', escapeHtml(v.type)],
            ['Địa bàn', escapeHtml(v.area)],
            ['Hoàn cảnh', escapeHtml(v.situation)],
            ['Nhu cầu chính', escapeHtml(v.need)],
          ])}
        </div>
        <div class="pf-card">
          <h2 class="pf-card-title">Quản lý hồ sơ</h2>
          ${kv([
            ['Người đăng ký', 'Nguyễn Ngọc Trâm'],
            ['Cán bộ phụ trách', escapeHtml(v.officer)],
            ['Ngày đăng ký', viDate(v.created)],
            ['Ngày cập nhật', viDate(v.updated)],
          ])}
        </div>
      </div>
      <aside class="pf-detail-side">
        <div class="pf-card">
          <h2 class="pf-card-title">Trạng thái xác minh <span class="pf-badge is-${st.tone}">${st.label}</span></h2>
          ${verify}
        </div>
        <div class="pf-card">
          <h2 class="pf-card-title">Lịch sử xử lý</h2>
          ${timeline(steps)}
        </div>
      </aside>
    </div>`;
  return v;
};

// ==================== SECTION: ĐĂNG KÝ HỒ SƠ — 4 loại: thành lập / gia nhập chi hội, thành lập / gia nhập đội, CLB (đặc tả CD-00) ====================
// Mỗi loại 1 mục ở menu cấp 2 (#<loại>[/<trạng thái>]), dùng chung 1 màn danh sách · trạng thái xem theo tab, bảng không có cột trạng thái / loại hồ sơ.
// Tìm theo mã hồ sơ, tên đơn vị · panel Bộ lọc: Thời gian tạo. Sắp xếp: bản nháp (chưa nộp) lên đầu, sau đó theo Ngày nộp giảm dần; phân trang 12 / 20 / 50 / 100 dòng (mặc định 50).
// Thao tác (hiện thẳng trên dòng): Bản nháp → Xem, Sửa, Xóa · trạng thái khác → Xem.
// Chưa có dữ liệu minh họa cho loại thành lập chi hội: danh sách trống. Gia nhập chi hội (đặc tả UC-GN-01, UC-GN-03) có dữ liệu, biểu mẫu, màn xem & thao tác như gia nhập đội, CLB.
const VOL_KINDS = {
  'thanh-lap-chi-hoi': { type: 'TC', label: 'Đăng ký thành lập chi hội', unit: 'chi hội', found: true },
  'gia-nhap-chi-hoi': { type: 'GN', label: 'Đăng ký gia nhập chi hội', unit: 'chi hội', found: false },
  'thanh-lap-doi': { type: 'DC', label: 'Đăng ký thành lập đội, câu lạc bộ tình nguyện viên', unit: 'đội, CLB', found: true },
  'gia-nhap-doi': { type: 'GC', label: 'Đăng ký gia nhập đội, câu lạc bộ tình nguyện viên', unit: 'đội, CLB', found: false },
};
const VOL_PLACE = { DC: 'Hội Chữ thập đỏ phường Thành Sen', GC: 'Chủ nhiệm, phó chủ nhiệm', GN: 'Chi hội trưởng, chi hội phó' };
// Hồ sơ gia nhập (đội, CLB · chi hội): bản nháp chỉ có Tiếp tục điền · Xóa nháp, có trạng thái Đã kết nạp
const VOL_JOIN_TYPES = ['GC', 'GN'];
// Loại hồ sơ có modal xem chi tiết → đường dẫn (#<loại>/xem/<mã>)
const VOL_VIEW_KIND = { DC: 'thanh-lap-doi', GC: 'gia-nhap-doi', GN: 'gia-nhap-chi-hoi' };
// only: 'found' → chỉ hồ sơ thành lập (Chờ người được đăng ký xác nhận, Đã tạo đơn vị) · 'join' → chỉ hồ sơ gia nhập (Đã kết nạp)
const VOL_STATUS = {
  draft: { label: 'Bản nháp', tone: 'neutral', slug: 'ban-nhap' },
  confirm: { label: 'Chờ người được đăng ký xác nhận', tab: 'Chờ xác nhận', tone: 'orange', slug: 'cho-xac-nhan', only: 'found' },
  new: { label: 'Mới', tone: 'blue', slug: 'moi' },
  received: { label: 'Đã tiếp nhận', tone: 'blue', slug: 'da-tiep-nhan' },
  eligible: { label: 'Đã đủ điều kiện', tone: 'green', slug: 'du-dieu-kien' },
  created: { label: 'Đã tạo đơn vị', tone: 'green', slug: 'da-tao-don-vi', only: 'found' },
  admitted: { label: 'Đã kết nạp', tone: 'green', slug: 'da-ket-nap', only: 'join' },
  returned: { label: 'Đã trả hồ sơ', tone: 'orange', slug: 'da-tra-ho-so' },
  rejected: { label: 'Đã từ chối', tone: 'red', slug: 'da-tu-choi' },
};
// [mã hồ sơ (null = bản nháp), loại, tên đội/CLB, trạng thái, ngày tạo, ngày nộp]
const VOL_REGS = [
  [null, 'DC', 'Đội tình nguyện viên sơ cấp cứu phường Thành Sen', 'draft', '2026-10-14', null],
  [null, 'GC', 'Câu lạc bộ Hiến máu tình nguyện Hà Tĩnh', 'draft', '2026-10-12', null],
  ['42.18073.DC.2026.0006', 'DC', 'Đội xung kích cứu hộ cứu nạn Thạch Hạ', 'confirm', '2026-10-11', '2026-10-11'],
  ['42.18073.GC.2026.0018', 'GC', 'Câu lạc bộ Sơ cấp cứu Trần Phú', 'new', '2026-10-09', '2026-10-09'],
  ['42.18073.DC.2026.0005', 'DC', 'Đội tình nguyện viên Bếp ăn 0 đồng Thành Sen', 'new', '2026-10-08', '2026-10-08'],
  ['42.00000.GC.2026.0009', 'GC', 'Đội phản ứng nhanh Chữ thập đỏ tỉnh Hà Tĩnh', 'received', '2026-10-02', '2026-10-02'],
  ['42.18073.GC.2026.0015', 'GC', 'Câu lạc bộ Truyền thông nhân đạo Hà Tĩnh', 'eligible', '2026-09-26', '2026-09-26'],
  ['42.18073.DC.2026.0003', 'DC', 'Câu lạc bộ Sơ cứu tâm lý Thành Sen', 'created', '2026-08-28', '2026-08-30'],
  ['42.18073.GC.2026.0011', 'GC', 'Câu lạc bộ Hiến máu Thạch Hạ', 'returned', '2026-07-22', '2026-07-22'],
  ['42.18073.DC.2026.0002', 'DC', 'Đội tình nguyện viên Môi trường xanh Trần Phú', 'returned', '2026-07-08', '2026-07-10'],
  ['42.18073.GC.2026.0007', 'GC', 'Câu lạc bộ Cứu hộ cứu nạn Thành Sen', 'rejected', '2026-06-02', '2026-06-02'],
  ['42.00000.GC.2024.0011', 'GC', 'Đội xung kích Hà Tĩnh', 'admitted', '2024-04-08', '2024-04-08'],
  // Thêm bản ghi minh họa: mỗi trạng thái có 2–3 hồ sơ
  [null, 'GC', 'Câu lạc bộ Kỹ năng sống Trần Phú', 'draft', '2026-10-15', null],
  ['42.18073.DC.2026.0007', 'DC', 'Câu lạc bộ Hiến máu tình nguyện phường Thành Sen', 'confirm', '2026-10-13', '2026-10-13'],
  ['42.18073.GC.2026.0019', 'GC', 'Đội tình nguyện viên Bếp ăn 0 đồng Thành Sen', 'new', '2026-10-10', '2026-10-10'],
  ['42.18073.GC.2026.0017', 'GC', 'Câu lạc bộ Sơ cấp cứu Thạch Hạ', 'received', '2026-10-05', '2026-10-05'],
  ['42.18073.DC.2026.0004', 'DC', 'Đội tình nguyện viên Hỗ trợ người cao tuổi Trần Phú', 'received', '2026-09-29', '2026-09-30'],
  ['42.00000.GC.2026.0008', 'GC', 'Câu lạc bộ Tình nguyện viên trẻ tỉnh Hà Tĩnh', 'eligible', '2026-09-22', '2026-09-22'],
  ['42.18073.DC.2026.0001', 'DC', 'Đội tình nguyện viên Cứu trợ thiên tai Thạch Hạ', 'eligible', '2026-09-18', '2026-09-18'],
  ['42.18073.DC.2025.0012', 'DC', 'Câu lạc bộ Hiến máu dự bị Thành Sen', 'created', '2025-11-03', '2025-11-05'],
  ['42.18073.GC.2026.0003', 'GC', 'Câu lạc bộ Sơ cứu tâm lý Thành Sen', 'admitted', '2026-09-05', '2026-09-05'],
  ['42.18073.GC.2025.0021', 'GC', 'Câu lạc bộ Hiến máu tình nguyện Hà Tĩnh', 'admitted', '2025-06-12', '2025-06-12'],
  ['42.00000.GC.2026.0005', 'GC', 'Đội phản ứng nhanh Chữ thập đỏ tỉnh Hà Tĩnh', 'returned', '2026-06-20', '2026-06-20'],
  ['42.18073.DC.2025.0015', 'DC', 'Câu lạc bộ Truyền thông nhân đạo Trần Phú', 'rejected', '2025-12-14', '2025-12-15'],
  // Thêm bản ghi minh họa cho hồ sơ thành lập đội, CLB: mỗi trạng thái có 4–5 hồ sơ
  [null, 'DC', 'Câu lạc bộ Sơ cấp cứu học đường Hà Huy Tập', 'draft', '2026-10-15', null],
  [null, 'DC', 'Đội tình nguyện viên Hiến máu khối cơ quan Thành Sen', 'draft', '2026-10-13', null],
  [null, 'DC', 'Câu lạc bộ Thanh niên tình nguyện Thạch Hạ', 'draft', '2026-10-10', null],
  ['42.18073.DC.2026.0030', 'DC', 'Đội tình nguyện viên Phòng chống thiên tai Trần Phú', 'confirm', '2026-10-15', '2026-10-15'],
  ['42.18073.DC.2026.0029', 'DC', 'Câu lạc bộ Sơ cứu ban đầu phường Hà Huy Tập', 'confirm', '2026-10-12', '2026-10-12'],
  ['42.18073.DC.2026.0028', 'DC', 'Đội tình nguyện viên Chăm sóc người khuyết tật Thành Sen', 'confirm', '2026-10-09', '2026-10-10'],
  ['42.18073.DC.2026.0027', 'DC', 'Câu lạc bộ Kỹ năng cứu hộ đuối nước Thạch Hạ', 'new', '2026-10-07', '2026-10-07'],
  ['42.18073.DC.2026.0026', 'DC', 'Đội tình nguyện viên Vì môi trường Hà Huy Tập', 'new', '2026-10-05', '2026-10-06'],
  ['42.18073.DC.2026.0025', 'DC', 'Câu lạc bộ Hiến máu tình nguyện khối trường học Trần Phú', 'new', '2026-10-03', '2026-10-04'],
  ['42.18073.DC.2026.0024', 'DC', 'Đội tình nguyện viên Hỗ trợ trẻ em khó khăn Thành Sen', 'received', '2026-09-27', '2026-09-28'],
  ['42.18073.DC.2026.0023', 'DC', 'Câu lạc bộ Phòng chống tai nạn thương tích Thạch Hạ', 'received', '2026-09-25', '2026-09-25'],
  ['42.18073.DC.2026.0022', 'DC', 'Đội tình nguyện viên Nhân đạo phường Hà Huy Tập', 'received', '2026-09-22', '2026-09-23'],
  ['42.18073.DC.2026.0021', 'DC', 'Câu lạc bộ Truyền thông hiến máu Trần Phú', 'received', '2026-09-20', '2026-09-20'],
  ['42.18073.DC.2026.0020', 'DC', 'Đội tình nguyện viên Ứng phó khẩn cấp Thành Sen', 'eligible', '2026-09-16', '2026-09-16'],
  ['42.18073.DC.2026.0019', 'DC', 'Câu lạc bộ Sơ cứu cộng đồng Hà Huy Tập', 'eligible', '2026-09-12', '2026-09-13'],
  ['42.18073.DC.2026.0018', 'DC', 'Đội tình nguyện viên Bữa cơm yêu thương Trần Phú', 'eligible', '2026-09-08', '2026-09-08'],
  ['42.18073.DC.2026.0017', 'DC', 'Đội tình nguyện viên Hiến máu cấp cứu Thạch Hạ', 'created', '2026-08-20', '2026-08-21'],
  ['42.18073.DC.2025.0020', 'DC', 'Câu lạc bộ Kỹ năng sơ cứu Trần Phú', 'created', '2025-12-02', '2025-12-03'],
  ['42.18073.DC.2025.0018', 'DC', 'Đội tình nguyện viên Chữ thập đỏ học đường Thành Sen', 'created', '2025-10-15', '2025-10-15'],
  ['42.18073.DC.2026.0016', 'DC', 'Câu lạc bộ Thiện nguyện trẻ Hà Huy Tập', 'returned', '2026-07-02', '2026-07-03'],
  ['42.18073.DC.2026.0015', 'DC', 'Đội tình nguyện viên Hỗ trợ người vô gia cư Thành Sen', 'returned', '2026-06-25', '2026-06-25'],
  ['42.18073.DC.2026.0014', 'DC', 'Câu lạc bộ Sơ cứu thể thao Thạch Hạ', 'returned', '2026-06-18', '2026-06-19'],
  ['42.18073.DC.2026.0013', 'DC', 'Đội tình nguyện viên Cứu hộ giao thông Trần Phú', 'rejected', '2026-06-10', '2026-06-10'],
  ['42.18073.DC.2025.0019', 'DC', 'Câu lạc bộ Hiến máu nhân đạo Hà Huy Tập', 'rejected', '2025-11-20', '2025-11-21'],
  ['42.18073.DC.2025.0017', 'DC', 'Đội tình nguyện viên Tiếp sức mùa thi Thạch Hạ', 'rejected', '2025-09-30', '2025-09-30'],
  // Hồ sơ gia nhập chi hội: mỗi trạng thái có 2–3 hồ sơ
  [null, 'GN', 'Chi hội Tổ dân phố số 3 phường Thành Sen', 'draft', '2026-10-16', null],
  [null, 'GN', 'Chi hội Trường THCS Thành Sen', 'draft', '2026-10-11', null],
  ['42.18073.GN.2026.0014', 'GN', 'Chi hội Tổ dân phố số 5 phường Thành Sen', 'new', '2026-10-14', '2026-10-14'],
  ['42.18073.GN.2026.0013', 'GN', 'Chi hội Khối cơ quan phường Trần Phú', 'new', '2026-10-08', '2026-10-09'],
  ['42.18073.GN.2026.0012', 'GN', 'Chi hội Thôn Đông Thạch Hạ', 'new', '2026-10-06', '2026-10-06'],
  ['42.18073.GN.2026.0011', 'GN', 'Chi hội Tổ dân phố Tân Học phường Hà Huy Tập', 'received', '2026-09-30', '2026-09-30'],
  ['42.18073.GN.2026.0010', 'GN', 'Chi hội Trạm Y tế phường Trần Phú', 'received', '2026-09-24', '2026-09-25'],
  ['42.18073.GN.2026.0009', 'GN', 'Chi hội Trường THPT Phan Đình Phùng', 'eligible', '2026-09-19', '2026-09-19'],
  ['42.18073.GN.2026.0008', 'GN', 'Chi hội Chợ Trần Phú', 'eligible', '2026-09-10', '2026-09-11'],
  ['42.18073.GN.2026.0006', 'GN', 'Chi hội Tổ dân phố số 1 phường Thành Sen', 'admitted', '2026-08-15', '2026-08-15'],
  ['42.18073.GN.2025.0019', 'GN', 'Chi hội Tổ dân phố số 2 phường Trần Phú', 'admitted', '2025-05-20', '2025-05-21'],
  ['42.18073.GN.2024.0008', 'GN', 'Chi hội Khối cơ quan phường Hà Huy Tập', 'admitted', '2024-03-12', '2024-03-12'],
  ['42.18073.GN.2026.0005', 'GN', 'Chi hội Thôn Trung Thạch Hạ', 'returned', '2026-07-18', '2026-07-18'],
  ['42.18073.GN.2026.0004', 'GN', 'Chi hội Trường Tiểu học Trần Phú', 'returned', '2026-06-27', '2026-06-28'],
  ['42.18073.GN.2026.0002', 'GN', 'Chi hội Tổ dân phố Đại Đồng phường Hà Huy Tập', 'rejected', '2026-05-09', '2026-05-09'],
  ['42.18073.GN.2025.0016', 'GN', 'Chi hội Khối doanh nghiệp phường Thành Sen', 'rejected', '2025-11-04', '2025-11-05'],
].map(([code, type, name, status, created, submitted], i) => ({ id: code || `NHAP-${i + 1}`, code, type, name, status, created, submitted }));
// Bản nháp (chưa nộp) lên đầu, sau đó theo ngày nộp giảm dần — dùng lại khi thêm hồ sơ từ biểu mẫu
const volSort = (a, b) => (Boolean(a.submitted) - Boolean(b.submitted)) || (b.submitted || b.created).localeCompare(a.submitted || a.created);
VOL_REGS.sort(volSort);
const findVolReg = (id) => VOL_REGS.find((r) => r.id === id);
const volf = {
  kind: 'thanh-lap-doi',
  status: '',
  search: document.querySelector('#vol-search'),
  time: document.querySelector('#vol-time'),
  statusSel: document.querySelector('#vol-status-filter'),
};
const volFilters = [volf.time, volf.statusSel];
const countVolFilters = setupFilterPanel('vol-filters', volFilters);
// Trạng thái áp dụng cho loại đang mở · hồ sơ của loại đang mở
const volStatuses = () => {
  const only = VOL_KINDS[volf.kind].found ? 'found' : 'join';
  return Object.fromEntries(Object.entries(VOL_STATUS).filter(([, s]) => !s.only || s.only === only));
};
const volKindRows = () => VOL_REGS.filter((r) => r.type === VOL_KINDS[volf.kind].type);
// Đổi màn theo loại: tiêu đề, gợi ý tìm kiếm, tên cột, nút Thêm mới
const setVolKind = (kind) => {
  volf.kind = kind;
  const k = VOL_KINDS[kind];
  document.querySelector('#vol-heading').textContent = k.label;
  volf.search.placeholder = `Tìm mã hồ sơ, tên ${k.unit}`;
  document.querySelector('#vol-name-col').textContent = `Tên ${k.unit} và mã hồ sơ`;
  // Thêm mới: thành lập đội, CLB / gia nhập đội, CLB / gia nhập chi hội mở biểu mẫu đăng ký; thành lập chi hội chưa có biểu mẫu → hộp thông báo xem trước
  const add = document.querySelector('#vol-add');
  const form = { 'thanh-lap-doi': 'data-open-team', 'gia-nhap-doi': 'data-open-join', 'gia-nhap-chi-hoi': 'data-open-branch' }[kind];
  ['data-open-team', 'data-open-join', 'data-open-branch'].forEach((attr) => add.removeAttribute(attr));
  if (form) add.setAttribute(form, '');
  add.setAttribute('aria-haspopup', form ? 'dialog' : 'false');
  if (form) delete add.dataset.panel; else add.dataset.panel = k.label;
};
const updateVolCounts = () => Object.entries(VOL_KINDS).forEach(([kind, k]) => {
  document.querySelector(`[data-count="${kind}"]`).textContent = VOL_REGS.filter((r) => r.type === k.type).length;
});

const volRow = (r, index) => {
  // Bản nháp: Xem · Sửa · Xóa hiện thẳng trên dòng; trạng thái khác: chỉ Xem
  // Hồ sơ thành lập / gia nhập đội, CLB, gia nhập chi hội: Xem / tên hồ sơ mở modal chi tiết (#<loại>/xem/<mã>); thành lập chi hội chưa có màn chi tiết → hộp thông báo xem trước
  // Hồ sơ gia nhập đội, CLB · chi hội (đặc tả CD-00): Bản nháp → Tiếp tục điền · Xóa nháp (không có màn xem); Đã trả hồ sơ → Xem hồ sơ · Tạo hồ sơ mới từ hồ sơ này
  const name = escapeHtml(r.name);
  const joinDraft = VOL_JOIN_TYPES.includes(r.type) && r.status === 'draft';
  const view = VOL_VIEW_KIND[r.type] && !joinDraft ? `#${VOL_VIEW_KIND[r.type]}/xem/${encodeURIComponent(r.id)}` : '';
  const viewLabel = r.status === 'draft' ? `Xem bản nháp ${name}` : `Xem hồ sơ ${r.code}`;
  const viewBtn = view
    ? `<a class="pf-icon-btn" href="${view}" aria-label="${viewLabel}">${icon('eye')}</a>`
    : `<button class="pf-icon-btn" type="button" data-panel="${viewLabel}" aria-label="${viewLabel}">${icon('eye')}</button>`;
  // Đã trả hồ sơ: thêm nút Tạo hồ sơ mới từ hồ sơ này (sao chép thông tin sang biểu mẫu Thêm mới để sửa và nộp lại)
  const copyBtn = `<button class="pf-icon-btn" type="button" ${['DC', 'GC', 'GN'].includes(r.type) ? `data-vol-copy="${r.id}"` : `data-panel="Tạo hồ sơ mới từ hồ sơ ${r.code}"`} aria-label="Tạo hồ sơ mới từ hồ sơ ${r.code}" title="Tạo hồ sơ mới từ hồ sơ này">${icon('plus-square')}</button>`;
  const actions = joinDraft
    ? `<button class="pf-icon-btn" type="button" data-vol-edit="${r.id}" aria-label="Tiếp tục điền ${name}" title="Tiếp tục điền">${icon('pencil')}</button><button class="pf-icon-btn is-danger" type="button" data-vol-delete="${r.id}" aria-label="Xóa nháp ${name}" title="Xóa nháp">${icon('trash')}</button>`
    : r.status === 'returned' ? `${viewBtn}${copyBtn}` : r.status === 'draft'
    ? `${viewBtn}<button class="pf-icon-btn" type="button" data-panel="Sửa bản nháp ${name}" aria-label="Sửa bản nháp ${name}">${icon('pencil')}</button><button class="pf-icon-btn is-danger" type="button" data-vol-delete="${r.id}" aria-label="Xóa bản nháp ${name}">${icon('trash')}</button>`
    : viewBtn;
  const title = `<span class="pf-clamp-1" data-tip>${name}</span>`;
  // Nơi xử lý: hồ sơ thành lập đội, CLB lấy theo Đơn vị quản lý của hồ sơ
  const place = r.type === 'DC' ? teamRegData(r).unit : VOL_PLACE[r.type];
  // Trạng thái: nhãn ngắn như tên tab (Chờ xác nhận), tên đầy đủ khi rê chuột
  const st = VOL_STATUS[r.status];
  return `<tr>
    ${rowIndex(index)}
    <td>
      <div class="pf-cell-stack">
        ${view ? `<a class="pf-cell-title" href="${view}">${title}</a>` : `<span class="pf-cell-title">${title}</span>`}
        <span class="pf-cell-line is-muted">Mã: ${r.code || 'Chưa có mã'}</span>
      </div>
    </td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(place || '')}</span></td>
    <td class="pf-col-status"><span class="pf-badge is-${st.tone}" title="${st.label}"><span class="pf-dot" aria-hidden="true"></span>${st.tab || st.label}</span></td>
    <td class="pf-col-date">${viDate(r.created)}</td>
    <td class="pf-col-date">${r.submitted ? viDate(r.submitted) : '<span class="pf-muted">Chưa nộp</span>'}</td>
    <td class="pf-col-actions"><div class="pf-row-actions">${actions}</div></td>
  </tr>`;
};
const volTable = createTable({
  rows: VOL_REGS,
  body: document.querySelector('#vol-rows'),
  empty: document.querySelector('#vol-empty'),
  pager: document.querySelector('#vol-pager'),
  range: document.querySelector('#vol-range'),
  renderRow: volRow,
  // Mặc định 50 dòng (đặc tả); thêm lựa chọn 12, 20 dòng / trang
  perPage: 50,
  perPageOptions: [12, 20, 50, 100],
});
// Thời gian tạo: 7 / 30 ngày qua hoặc năm hiện tại
const createdWithin = (iso, value) => {
  if (!value) return true;
  const created = new Date(`${iso}T00:00:00`);
  const now = new Date();
  if (value === 'year') return created.getFullYear() === now.getFullYear();
  return (now - created) / 86400000 <= Number(value);
};
// Bộ lọc Trạng thái: chỉ ở tab Tất cả; dựng lại lựa chọn theo loại hồ sơ (giữ giá trị nếu còn hợp lệ), tab trạng thái khác thì xóa giá trị
const syncVolStatusFilter = () => {
  const map = volStatuses();
  const keep = volf.status ? '' : (map[volf.statusSel.value] ? volf.statusSel.value : '');
  volf.statusSel.innerHTML = '<option value="">Tất cả trạng thái</option>' + Object.entries(map).map(([key, st]) => `<option value="${key}">${st.tab || st.label}</option>`).join('');
  volf.statusSel.value = keep;
  document.querySelector('#vol-status-field').hidden = Boolean(volf.status);
};
const applyVolFilter = () => {
  syncVolStatusFilter();
  // Tab trạng thái (Bản nháp … Đã từ chối): ẩn cột Trạng thái — chỉ tab Tất cả hiện cột này
  document.querySelector('.pf-table.is-volunteer').classList.toggle('is-status-tab', Boolean(volf.status));
  const query = fold(volf.search.value.trim());
  volTable.setFilter((r) => (!query || fold(`${r.code || ''} ${r.name}`).includes(query))
    && r.type === VOL_KINDS[volf.kind].type
    && (!volf.status || r.status === volf.status)
    && (!volf.statusSel.value || r.status === volf.statusSel.value)
    && createdWithin(r.created, volf.time.value));
  countVolFilters();
};
volf.search.addEventListener('input', applyVolFilter);
volFilters.forEach((el) => el.addEventListener('change', applyVolFilter));
document.querySelector('#vol-reset').addEventListener('click', () => {
  volFilters.forEach((el) => { el.value = ''; });
  applyVolFilter();
});
document.querySelector('#vol-rows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-vol-delete]');
  if (button) deleteVolDraft(findVolReg(button.dataset.volDelete));
  const copy = event.target.closest('[data-vol-copy]');
  if (copy) copyVolReg(findVolReg(copy.dataset.volCopy), copy);
  const edit = event.target.closest('[data-vol-edit]');
  if (edit) { const r = findVolReg(edit.dataset.volEdit); if (r.type === 'GN') editBranchDraft(r, edit); else editJoinDraft(r, edit); }
});
// Tạo hồ sơ mới từ hồ sơ đã trả: thành lập / gia nhập đội, CLB, gia nhập chi hội mở biểu mẫu Thêm mới đã điền sẵn (prefillTeam, prefillJoin, prefillBranch); thành lập chi hội chưa có biểu mẫu → hộp thông báo xem trước
const copyVolReg = (r, trigger) => {
  if (r.type === 'GC') { prefillJoin(r); openJoin(trigger); } else if (r.type === 'GN') { prefillBranch(r); openBranch(trigger); } else { prefillTeam(r); openTeam(trigger); }
  showToast(`Đã sao chép thông tin từ hồ sơ ${r.code}. Kiểm tra, chỉnh sửa rồi nộp lại.`, 'info');
};
// Xóa nháp: hỏi xác nhận bằng hộp xác nhận dùng chung (window.confirmAction), đồng ý mới xóa thật (bản nháp chưa có mã)
const deleteVolDraft = async (r) => {
  // Hồ sơ gia nhập (đội, CLB · chi hội) dùng câu hỏi theo đặc tả (Xóa nháp – xác nhận)
  const yes = await window.confirmAction(VOL_JOIN_TYPES.includes(r.type)
    ? { title: 'Xóa nháp', text: 'Bạn có chắc chắn muốn xóa bản nháp này?', ok: 'Xóa' }
    : { title: 'Xóa bản ghi', text: 'Bạn có chắc chắn muốn xóa bản ghi này không?', ok: 'Xóa' });
  if (!yes) return;
  VOL_REGS.splice(VOL_REGS.indexOf(r), 1);
  if (joinEditId === r.id) joinEditId = null;
  if (branchEditId === r.id) branchEditId = null;
  applyVolFilter();
  renderTabs('tinh-nguyen-vien', volf.status);
  updateVolCounts();
  showToast('Đã xóa bản nháp');
};

// ==================== SECTION: XEM CHI TIẾT HỒ SƠ THÀNH LẬP ĐỘI, CLB — modal phải cùng khung Xem chi tiết chương trình ====================
// Mở theo #thanh-lap-doi/xem/<mã hồ sơ> (bản nháp dùng mã tạm NHAP-n). Chỉ đọc, đủ trường như biểu mẫu Đăng ký thành lập đội, CLB,
// thẻ Quá trình xử lý theo trạng thái đang ẩn (TEAM_SHOW_STEPS). Xem phiếu PDF dùng chung trình xem PDF của biểu mẫu (openTeamPdf).
// ---------- Dữ liệu hồ sơ (minh họa): suy từ tên & trạng thái của dòng VOL_REGS, cố định theo mã hồ sơ ----------
const TEAM_ACCOUNT = { name: 'Nguyễn Ngọc Trâm', identity: '040196012345', dob: '12/05/1996', gender: 'Nữ', phone: '0912345678', email: 'tram.nguyen@gmail.com' };
const TEAM_WARDS = ['Phường Thành Sen', 'Phường Trần Phú', 'Phường Hà Huy Tập', 'Xã Thạch Hạ'];
const TEAM_BRANCHES = ['Không trực thuộc chi hội', 'Chi hội Tổ dân phố số 3', 'Chi hội Tổ dân phố số 5', 'Chi hội Trường THCS Thành Sen'];
// Từ khóa trong tên → lĩnh vực hoạt động · mẫu hoạt động tình nguyện đã thực hiện ({n}: số lượng)
const TEAM_FIELD_HINTS = [
  [/hiến máu/i, 'Hiến máu', 'Tổ chức ngày hội hiến máu tình nguyện, tiếp nhận {n} đơn vị máu'],
  [/sơ (cấp )?cứu|cấp cứu/i, 'Sơ cấp cứu', 'Tập huấn sơ cấp cứu ban đầu cho {n} người dân và học sinh'],
  [/cứu hộ|cứu nạn|đuối nước|phản ứng|ứng phó|xung kích|thiên tai/i, 'Cứu hộ cứu nạn', 'Ứng trực cứu hộ, hỗ trợ {n} hộ dân sơ tán trong mùa mưa bão'],
  [/bếp ăn|bữa cơm/i, 'Bếp ăn, Cơm cháo miễn phí', 'Duy trì bếp ăn 0 đồng, phát {n} suất cơm cho bệnh nhân và người nhà'],
  [/cứu trợ|nhân đạo|khó khăn|vô gia cư|khuyết tật|cao tuổi|trẻ em|yêu thương|thiện nguyện|mùa thi|môi trường/i, 'Cứu trợ xã hội và trợ giúp nhân đạo', 'Thăm hỏi, trao {n} suất quà cho hộ nghèo, người có hoàn cảnh khó khăn'],
  [/truyền thông|kỹ năng|thanh niên/i, 'Khác', 'Tổ chức {n} buổi truyền thông, sinh hoạt kỹ năng cho thanh thiếu niên'],
];
const TEAM_STREETS = ['Nguyễn Du', 'Phan Đình Phùng', 'Hà Huy Tập', 'Xuân Diệu', 'Trần Phú', 'Nguyễn Công Trứ'];
const TEAM_LAST = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Dương'];
const TEAM_MIDDLE = { Nam: ['Văn', 'Đức', 'Minh', 'Quang', 'Hữu'], Nữ: ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Hồng'] };
const TEAM_FIRST = { Nam: ['Hùng', 'Nam', 'Tuấn', 'Phúc', 'Long', 'Khánh', 'Sơn', 'Hải', 'Dũng', 'Thắng'], Nữ: ['Lan', 'Hoa', 'Mai', 'Hương', 'Linh', 'Trang', 'Hà', 'Yến', 'Nhung', 'Thảo'] };
const TEAM_SKILLS = ['Sơ cấp cứu', 'Vận chuyển bệnh nhân', 'Khám, chữa bệnh', 'Truyền thông', 'Hướng dẫn kỹ thuật sinh kế', 'Viết tin bài'];
const TEAM_RETURNED = ['Danh sách thành viên thiếu số định danh cá nhân của 2 thành viên; đề nghị bổ sung và nộp lại.', 'Địa chỉ sinh hoạt chưa ghi rõ tổ dân phố; đề nghị bổ sung và nộp lại.'];
const TEAM_REJECTED = ['Trùng tên và địa bàn hoạt động với đội, câu lạc bộ đã được thành lập trên hệ thống.', 'Hồ sơ đã quá hạn bổ sung theo thông báo trả hồ sơ.'];
// Số ngẫu nhiên cố định theo mã hồ sơ (cùng hồ sơ luôn ra cùng dữ liệu)
const seededRandom = (text) => {
  let seed = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 233280, 7);
  return () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
};
const teamRegCache = new Map();
// Trả về dữ liệu đủ trường như teamFormData() của biểu mẫu (dùng chung cho phiếu PDF) + thông tin xử lý
const teamRegData = (r) => {
  if (teamRegCache.has(r.id)) return teamRegCache.get(r.id);
  const rand = seededRandom(r.id + r.name);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const digits = (n) => Array.from({ length: n }, () => between(0, 9)).join('');
  const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);
  const ward = TEAM_WARDS.find((w) => r.name.includes(w.replace(/^(Phường|Xã) /, ''))) || TEAM_WARDS[0];
  const place = ward.replace(/^(Phường|Xã) /, '');
  const unit = /tỉnh/i.test(r.name) ? 'Hội Chữ thập đỏ tỉnh Hà Tĩnh' : `Hội Chữ thập đỏ ${lower(ward)}`;
  const hints = TEAM_FIELD_HINTS.filter(([re]) => re.test(r.name));
  if (!hints.length) hints.push(TEAM_FIELD_HINTS[4]);
  if (hints.length === 1 && hints[0][1] !== 'Sơ cấp cứu') hints.push(TEAM_FIELD_HINTS[1]); // đội, CLB nào cũng tập huấn sơ cấp cứu
  const fields = hints.map(([, field]) => field);
  // Cơ quan chủ quản: đội, CLB trường học / khối cơ quan có quyết định thành lập
  const school = /học đường|trường học/i.test(r.name);
  const office = /khối cơ quan/i.test(r.name);
  const parent = school ? `Trường THCS ${place}` : office ? `Văn phòng HĐND và UBND ${lower(ward)}` : '';
  const decision = parent ? `${between(10, 99)}/QĐ-${school ? 'THCS' : 'UBND'}` : '';
  // Hoạt động tình nguyện: 2–3 hoạt động trước ngày tạo hồ sơ (khoảng 1/5 hồ sơ chưa có hoạt động)
  const actsNone = rand() < 0.2;
  const acts = actsNone ? [] : hints.concat(hints).slice(0, between(2, 3)).map(([, , text], i) => {
    const from = addDays(r.created, -(i + 1) * between(40, 70));
    return [viDate(from), viDate(addDays(from, between(1, 20))), text.replace('{n}', between(3, 12) * 10)];
  }).reverse();
  // Thành viên: dòng đầu Chủ nhiệm (tài khoản đăng ký), 1–2 Phó Chủ nhiệm, còn lại Thành viên — tổng 8–20 người
  const total = between(8, 20);
  const deputies = between(1, 2);
  const member = (role, i) => {
    const gender = rand() < 0.5 ? 'Nam' : 'Nữ';
    const year = String(between(1975, 2006));
    return {
      name: `${pick(TEAM_LAST)} ${pick(TEAM_MIDDLE[gender])} ${pick(TEAM_FIRST[gender])}`,
      role, gender, year,
      identity: `040${gender === 'Nam' ? 0 : 1}${year.slice(2)}${digits(6)}`,
      phone: `09${digits(8)}`,
      blood: pick(['A', 'B', 'AB', 'O', 'O', 'Chưa rõ']),
      address: `Tổ dân phố số ${between(1, 12)}, ${ward}`,
      education: i % 4 === 3 ? '9/12' : '12/12',
      qualification: pick(['Trung cấp', 'Cao đẳng', 'Đại học', 'Đại học', 'Khác']),
      activity: pick(fields),
      skills: [...new Set([pick(TEAM_SKILLS), pick(TEAM_SKILLS)])].slice(0, between(1, 2)),
    };
  };
  const leader = {
    name: TEAM_ACCOUNT.name, role: 'Chủ nhiệm', gender: TEAM_ACCOUNT.gender, year: TEAM_ACCOUNT.dob.slice(-4), identity: TEAM_ACCOUNT.identity,
    phone: TEAM_ACCOUNT.phone, blood: 'O', address: `Tổ dân phố số 3, ${ward}`, education: '12/12', qualification: 'Đại học', activity: fields[0], skills: ['Sơ cấp cứu', 'Truyền thông'],
  };
  const members = [leader, ...Array.from({ length: total - 1 }, (_, i) => member(i < deputies ? 'Phó Chủ nhiệm' : 'Thành viên', i))];
  const draft = r.status === 'draft';
  const data = {
    name: r.name, unit, phone: TEAM_ACCOUNT.phone, email: TEAM_ACCOUNT.email,
    branch: ward === TEAM_WARDS[0] ? (school ? TEAM_BRANCHES[3] : pick(TEAM_BRANCHES.slice(0, 3))) : TEAM_BRANCHES[0],
    province: 'Tỉnh Hà Tĩnh', ward, address: `Số ${between(2, 120)}, đường ${pick(TEAM_STREETS)}`, parent, decision, fields,
    leader: { name: TEAM_ACCOUNT.name, identity: TEAM_ACCOUNT.identity, dob: TEAM_ACCOUNT.dob, gender: TEAM_ACCOUNT.gender },
    actsNone, acts, members,
    // Bản nháp có thể chưa tích cam kết; hồ sơ đã nộp luôn đã đồng ý
    agree: !draft || rand() < 0.5,
    signPlace: draft && rand() < 0.5 ? '' : place,
    signDate: viDate(r.submitted || r.created),
    signer: TEAM_ACCOUNT.name,
    confirmed: r.status === 'confirm' ? between(1, total - 2) : total - 1, // số thành viên (trừ Chủ nhiệm) đã xác nhận tham gia
    reason: r.status === 'returned' ? pick(TEAM_RETURNED) : r.status === 'rejected' ? pick(TEAM_REJECTED) : '',
  };
  data.privacy = data.agree;
  teamRegCache.set(r.id, data);
  return data;
};

// ---------- Quá trình xử lý: các bước theo trạng thái hồ sơ (bước đang chờ không có ngày) ----------
// Đang ẩn theo yêu cầu — đổi TEAM_SHOW_STEPS = true để hiện lại thẻ "Quá trình xử lý hồ sơ" cuối modal
const TEAM_SHOW_STEPS = false;
const teamRegSteps = (r, d) => {
  const others = d.members.length - 1;
  const steps = [{ date: r.created, title: 'Tạo hồ sơ', meta: `${d.leader.name} lưu bản nháp`, cls: 'is-muted' }];
  if (r.status === 'draft') return [...steps, { title: 'Chưa nộp hồ sơ', meta: 'Hoàn thiện thông tin và bấm Nộp hồ sơ để gửi đến đơn vị quản lý', cls: 'is-upcoming' }];
  steps.push({ date: r.submitted, title: 'Nộp hồ sơ', meta: `Gửi đến ${d.unit}` });
  if (r.status === 'confirm') return [...steps, { title: 'Chờ người được đăng ký xác nhận', meta: `${d.confirmed}/${others} thành viên đã xác nhận tham gia đội, câu lạc bộ`, cls: 'is-upcoming' }];
  steps.push({ date: addDays(r.submitted, 1), title: 'Các thành viên đã xác nhận tham gia', meta: `${others}/${others} thành viên đã xác nhận` });
  if (r.status === 'new') return [...steps, { title: 'Chờ tiếp nhận', meta: `${d.unit} tiếp nhận và kiểm tra hồ sơ`, cls: 'is-upcoming' }];
  const received = addDays(r.submitted, 2);
  if (r.status === 'rejected') return [...steps, { date: addDays(received, 3), title: 'Từ chối hồ sơ', meta: d.reason, cls: 'is-alert' }];
  steps.push({ date: received, title: 'Đã tiếp nhận hồ sơ', meta: `${d.unit} đang thẩm định hồ sơ` });
  if (r.status === 'received') return [...steps, { title: 'Chờ thẩm định điều kiện thành lập', meta: 'Kết quả sẽ được thông báo qua tài khoản và email liên lạc', cls: 'is-upcoming' }];
  if (r.status === 'returned') return [...steps, { date: addDays(received, 3), title: 'Trả hồ sơ', meta: d.reason, cls: 'is-alert' }];
  const eligible = addDays(received, 5);
  steps.push({ date: eligible, title: 'Hồ sơ đủ điều kiện thành lập' });
  if (r.status === 'eligible') return [...steps, { title: 'Chờ ra quyết định và tạo đơn vị', meta: `${d.unit} ra quyết định thành lập đội, câu lạc bộ`, cls: 'is-upcoming' }];
  return [...steps, { date: addDays(eligible, 3), title: 'Đã tạo đơn vị', meta: `Đội, câu lạc bộ được tạo trên hệ thống, trực thuộc ${d.unit}` }];
};

// ---------- Dựng nội dung modal: 3 ô thống kê · Thông tin chung | Chủ nhiệm · Địa chỉ & đơn vị quản lý | Cơ quan chủ quản · Hoạt động · Thành viên · Cam kết (· Quá trình xử lý — đang ẩn) ----------
const TEAM_ROLE_TONE = { 'Chủ nhiệm': 'is-red', 'Phó Chủ nhiệm': 'is-blue' };
// ---------- Danh sách thành viên: phân trang giống bảng danh sách bên ngoài (createTable): Tổng · nút trang · 10 / 20 / 50 dòng mỗi trang ----------
const TV_MEMBER_HEADS = ['Họ và tên', 'Chức vụ', 'Giới tính', 'Năm sinh', 'Số định danh', 'Điện thoại', 'Nhóm máu', 'Địa chỉ', 'Văn hóa', 'Chuyên môn', 'Lĩnh vực hoạt động', 'Kỹ năng'];
const tvMembersCard = `<div class="pf-view-table"><table class="pf-reg-table is-view is-v-members">
    <thead><tr><th scope="col" class="pf-col-index">#</th>${TV_MEMBER_HEADS.map((t) => `<th scope="col">${t}</th>`).join('')}</tr></thead>
    <tbody id="pf-tv-members-rows"></tbody>
  </table></div>
  <p class="pf-view-none" id="pf-tv-members-empty" hidden>Chưa có thành viên.</p>
  <div class="pf-table-foot"><p class="pf-muted" id="pf-tv-members-range" aria-live="polite"></p><div class="pf-pager" id="pf-tv-members-pager"></div></div>`;
const tvMemberRow = (m, index) => `<tr>${rowIndex(index)}${[
  `<b>${escapeHtml(m.name)}</b>`,
  `<span class="pf-tag ${TEAM_ROLE_TONE[m.role] || ''}">${m.role}</span>`,
  m.gender, m.year, m.identity, m.phone, m.blood, escapeHtml(m.address), m.education, m.qualification, escapeHtml(m.activity), escapeHtml(m.skills.join(', ')),
].map((c) => `<td>${c}</td>`).join('')}</tr>`;
// Gọi sau khi đã dựng thẻ (tvMembersCard) vào modal
const renderTeamMembers = (members) => createTable({
  rows: members,
  body: document.querySelector('#pf-tv-members-rows'),
  empty: document.querySelector('#pf-tv-members-empty'),
  pager: document.querySelector('#pf-tv-members-pager'),
  range: document.querySelector('#pf-tv-members-range'),
  renderRow: tvMemberRow,
}).setFilter(() => true);
const renderTeamView = (r) => {
  const d = teamRegData(r);
  const st = VOL_STATUS[r.status];
  const dot = '<span aria-hidden="true">•</span>';
  document.querySelector('#pf-tv-title').textContent = r.name;
  document.querySelector('#pf-tv-sub').innerHTML = `<span>Mã hồ sơ: ${r.code ? `<b>${r.code}</b>` : '<span class="pf-muted">Chưa có mã</span>'}</span>${dot}<span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span>${dot}<span>Ngày tạo: ${viDate(r.created)}</span>${r.submitted ? `${dot}<span>Ngày nộp: ${viDate(r.submitted)}</span>` : ''}`;
  // Ghi chú đầu modal: bản nháp · chờ xác nhận · lý do trả hồ sơ / từ chối
  const notes = {
    draft: '<b>Ghi chú:</b> Hồ sơ chưa được nộp. Bấm “Chỉnh sửa” để hoàn thiện thông tin và nộp hồ sơ.',
    confirm: `<b>Ghi chú:</b> Hồ sơ đang chờ các thành viên có tên trong danh sách xác nhận tham gia (${d.confirmed}/${d.members.length - 1} đã xác nhận).`,
    returned: `<b>Lý do trả hồ sơ:</b> ${escapeHtml(d.reason)}`,
    rejected: `<b>Lý do từ chối:</b> ${escapeHtml(d.reason)}`,
  };
  const note = document.querySelector('#pf-tv-note');
  note.hidden = !notes[r.status];
  note.className = `pf-view-note${r.status === 'rejected' ? ' is-red' : ''}`;
  note.innerHTML = notes[r.status] || '';
  // Chân modal: Chỉnh sửa (Bản nháp) · Chỉnh sửa và nộp lại (Đã trả hồ sơ); chưa nối biểu mẫu → hộp thông báo xem trước
  const edit = document.querySelector('#pf-tv-edit');
  const editLabel = { draft: 'Chỉnh sửa', returned: 'Chỉnh sửa và nộp lại' }[r.status];
  edit.hidden = !editLabel;
  edit.querySelector('use').setAttribute('href', '#pencil');
  delete edit.dataset.volCopy;
  if (editLabel) {
    edit.querySelector('span').textContent = editLabel;
    edit.dataset.panel = `${editLabel} hồ sơ ${r.name}`;
  }

  const fullAddress = [d.address, d.ward, d.province].join(', ');
  const check = (on, text) => `<li class="${on ? 'is-on' : ''}"><span class="pf-tv-check" aria-hidden="true"></span><span>${text}<span class="visually-hidden">${on ? ' — đã đồng ý' : ' — chưa đồng ý'}</span></span></li>`;
  document.querySelector('#pf-tv-body').innerHTML = `
    <!-- Số liệu chính -->
    <div class="pf-view-stats">
      ${vStat('people', 'Số lượng thành viên', `${d.members.length} người`)}
      ${vStat('calendar', 'Hoạt động tình nguyện đã thực hiện', d.acts.length ? `${d.acts.length} hoạt động` : 'Chưa có')}
      ${vStat('layers', 'Lĩnh vực hoạt động', `${d.fields.length} lĩnh vực`)}
    </div>

    <!-- Thông tin chung · Chủ nhiệm: 2 thẻ cạnh nhau -->
    <div class="pf-view-pair is-even">
      ${vCard('pf-tv-general', 'Thông tin đội, câu lạc bộ', vKvs([
        vKv('Tên đội, câu lạc bộ', vText(d.name)),
        vKv('Số lượng thành viên', `${d.members.length} người`),
        vKv('Lĩnh vực hoạt động', vTags(d.fields)),
        vKv('Điện thoại liên lạc', vText(d.phone)),
        vKv('Địa chỉ email', vText(d.email)),
      ]))}
      ${vCard('pf-tv-leader', 'Chủ nhiệm đội, câu lạc bộ', vKvs([
        vKv('Họ và tên', vText(d.leader.name)),
        vKv('Số định danh cá nhân', vText(d.leader.identity)),
        vKv('Ngày, tháng, năm sinh', vText(d.leader.dob)),
        vKv('Giới tính', vText(d.leader.gender)),
        vKv('Nguồn thông tin', `<span class="pf-reg-badge">${icon('shield')}Lấy từ tài khoản định danh</span>`),
      ]))}
    </div>

    <!-- Địa chỉ và đơn vị quản lý · Cơ quan chủ quản (nếu có) -->
    <div class="pf-view-pair is-even">
      ${vCard('pf-tv-address', 'Địa chỉ và đơn vị quản lý', vKvs([
        vKv('Địa chỉ sinh hoạt', vText(fullAddress)),
        vKv('Đơn vị quản lý', vText(d.unit)),
        vKv('Chi hội trực thuộc', vText(d.branch)),
      ]))}
      ${vCard('pf-tv-parent', 'Thông tin cơ quan chủ quản (nếu có)', vKvs([
        vKv('Cơ quan đội, CLB đang trực thuộc', d.parent ? vText(d.parent) : '<span class="pf-view-empty">Không có</span>'),
        vKv('Số QĐ thành lập đội, CLB', d.decision ? vText(d.decision) : '<span class="pf-view-empty">Không có</span>'),
      ]))}
    </div>

    ${vCard('pf-tv-acts', 'Hoạt động tình nguyện', vTable('is-v-acts', ['Từ ngày', 'Đến ngày', 'Nội dung hoạt động'],
      d.acts.map(([from, to, text]) => [from, to, escapeHtml(text)]),
      'Đội, câu lạc bộ chưa có hoạt động tình nguyện nào.'), d.acts.length ? `${d.acts.length} hoạt động` : '')}

    ${vCard('pf-tv-members', 'Danh sách các thành viên đội, câu lạc bộ', tvMembersCard, `${d.members.length} người`)}

    <!-- Cam kết · ký xác nhận -->
    ${vCard('pf-tv-commit', 'Cam kết', `<div class="pf-tv-commit">
      <p>Sau khi nghiên cứu Điều lệ Hội Chữ thập đỏ Việt Nam và Quy chế tổ chức và hoạt động của tình nguyện viên Chữ thập đỏ, chúng tôi tự nguyện đăng ký thành lập đội, câu lạc bộ nêu trên, chấp hành Điều lệ, Quy chế và sẵn sàng nhận nhiệm vụ do Hội giao.</p>
      <ul class="pf-tv-checks">
        ${check(d.agree, 'Tôi đã đọc Điều lệ, Quy chế và đồng ý với cam kết trên')}
        ${check(d.privacy, 'Tôi đồng ý để Hội xử lý dữ liệu cá nhân trong hồ sơ cho mục đích xét duyệt và quản lý tình nguyện viên')}
      </ul>
    </div>
    ${vKvs([
      vKv('Nơi ký', vText(d.signPlace)),
      vKv('Ngày ký', vText(d.signDate)),
      vKv('Người đăng ký (TM đội, câu lạc bộ)', vText(d.signer)),
    ])}`)}
    ${TEAM_SHOW_STEPS ? vCard('pf-tv-steps', 'Quá trình xử lý hồ sơ', `<div class="pf-tv-steps">${timeline(teamRegSteps(r, d))}</div>`) : ''}`;
  renderTeamMembers(d.members);
};

// ---------- Mở / đóng modal: theo #thanh-lap-doi/xem/<mã> hoặc #gia-nhap-doi/xem/<mã> (dùng chung modal, gia nhập dựng bằng renderJoinView); đóng thì trả đường dẫn về tab đang xem ----------
const teamView = document.querySelector('#pf-team-view');
const teamViewPanel = teamView.querySelector('.pf-reg-panel');
const teamViewBody = document.querySelector('#pf-tv-body');
let teamViewReg = null;
let teamViewTrigger = null;
let teamViewTimer;
teamViewPanel.tabIndex = -1;
const openTeamView = (id) => {
  const r = findVolReg(id);
  if (!r || r.type !== VOL_KINDS[volf.kind].type || !VOL_VIEW_KIND[r.type]) {
    showToast(`Không tìm thấy hồ sơ “${id}”.`, 'error');
    closeTeamView();
    return;
  }
  // Bản nháp gia nhập (đội, CLB · chi hội) không có màn xem → mở lại biểu mẫu (Tiếp tục điền); chờ script chạy xong vì biểu mẫu khai báo phía dưới
  if (VOL_JOIN_TYPES.includes(r.type) && r.status === 'draft') {
    closeTeamView();
    history.replaceState(null, '', `#${VOL_VIEW_KIND[r.type]}${volf.status ? `/${VOL_STATUS[volf.status].slug}` : ''}`);
    setTimeout(() => (r.type === 'GN' ? editBranchDraft : editJoinDraft)(r, null), 0);
    return;
  }
  if (teamView.hidden) teamViewTrigger = document.activeElement;
  teamViewReg = r;
  // Phiếu PDF chỉ có ở hồ sơ thành lập
  teamView.querySelector('[data-tv-pdf]').hidden = r.type !== 'DC';
  if (VOL_JOIN_TYPES.includes(r.type)) renderJoinView(r); else renderTeamView(r);
  clearTimeout(teamViewTimer);
  teamView.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  teamViewBody.scrollTop = 0;
  void teamView.offsetWidth; // tính lại bố cục để hiệu ứng trượt chạy
  teamView.classList.add('is-open');
  teamViewPanel.focus({ preventScroll: true });
};
function closeTeamView(updateHash = true) {
  if (teamView.hidden) return;
  teamView.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  teamViewTimer = setTimeout(() => { teamView.hidden = true; }, viewReduced() ? 0 : 300);
  teamViewReg = null;
  if (updateHash && /^#(thanh-lap-doi|gia-nhap-doi|gia-nhap-chi-hoi)\/xem\//.test(window.location.hash)) {
    history.replaceState(null, '', `#${volf.kind}${volf.status ? `/${VOL_STATUS[volf.status].slug}` : ''}`);
  }
  if (teamViewTrigger && document.contains(teamViewTrigger)) teamViewTrigger.focus();
}
teamView.querySelectorAll('[data-close-team-view]').forEach((button) => button.addEventListener('click', () => closeTeamView()));
teamView.querySelector('[data-tv-pdf]').addEventListener('click', () => { if (teamViewReg) openTeamPdf(teamRegData(teamViewReg)); });document.addEventListener('keydown', (event) => {
  if (teamView.hidden || dialog.open || teamPdf.open) return;
  if (event.key === 'Escape') { closeTeamView(); return; }
  if (event.key !== 'Tab') return;
  const items = [...teamViewPanel.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === teamViewPanel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
// ==================== END SECTION: XEM CHI TIẾT HỒ SƠ THÀNH LẬP ĐỘI, CLB ====================

// ==================== SECTION: XEM CHI TIẾT HỒ SƠ GIA NHẬP ĐỘI, CLB — dùng chung modal #pf-team-view (đặc tả CD-04a) ====================
// Mở theo #gia-nhap-doi/xem/<mã hồ sơ>; chỉ hồ sơ đã nộp (Bản nháp không có màn xem — mở lại biểu mẫu bằng Tiếp tục điền).
// Cùng khung Xem chi tiết hồ sơ thành lập: đầu modal (mã, trạng thái, ngày tạo, ngày nộp, lý do trả/từ chối) · 3 ô số liệu · Thông tin cá nhân | Thông tin tình nguyện viên + Đội, CLB · Cam kết · Trả lời từ đội, câu lạc bộ. Không có Tiến trình xử lý.
// Chân modal: Đã trả hồ sơ → Tạo hồ sơ mới từ hồ sơ này (như nút trên dòng danh sách).
// ---------- Đội, CLB → phường/xã, đơn vị quản lý (minh họa: suy theo tên; đội, CLB cấp tỉnh do Hội cấp tỉnh quản lý) ----------
const JOIN_PROVINCE_UNIT = 'Hội Chữ thập đỏ tỉnh Hà Tĩnh';
const clubWard = (name) => TEAM_WARDS.find((w) => name.includes(w.replace(/^(Phường|Xã) /, ''))) || TEAM_WARDS[0];
const clubUnit = (name) => {
  if (/tỉnh|Hà Tĩnh/i.test(name)) return JOIN_PROVINCE_UNIT;
  const ward = clubWard(name);
  return `Hội Chữ thập đỏ ${ward.charAt(0).toLowerCase()}${ward.slice(1)}`;
};

// ---------- Danh mục (đặc tả mục 3.1): Lĩnh vực hoạt động · Kỹ năng ----------
const JOIN_FIELDS = ['Hiến máu', 'Sơ cấp cứu', 'Cứu hộ cứu nạn', 'Bếp ăn, Cơm cháo miễn phí', 'Cứu trợ xã hội và trợ giúp nhân đạo', 'Hiến mô, tạng', 'Công nghệ thông tin', 'Khám chữa bệnh', 'Khác'];
const JOIN_SKILLS = ['Sơ cấp cứu', 'Sơ cứu tâm lý', 'Khám, chữa bệnh', 'Viết tin bài', 'Truyền thông số (TikTok, CapCut,…)', 'Xây dựng kênh truyền thông', 'Hướng dẫn kỹ thuật sinh kế theo nghề'];
// Nội dung cần bổ sung (Đã trả hồ sơ — bước xác minh) · lý do từ chối (Đã từ chối — bước kiểm tra dữ liệu)
const JOIN_RETURNED = ['số điện thoại liên lạc không liên hệ được để xác minh', 'kỹ năng đăng ký chưa phù hợp với lĩnh vực hoạt động của đội, câu lạc bộ'];
const JOIN_REJECTED = ['người nộp đã là thành viên đang sinh hoạt của đội, câu lạc bộ', 'đội, câu lạc bộ đã đủ số lượng thành viên theo kế hoạch năm'];
const pad2 = (n) => String(n).padStart(2, '0');
const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

// ---------- Dữ liệu hồ sơ (minh họa): cố định theo mã hồ sơ; hồ sơ tạo từ biểu mẫu lưu dữ liệu thật vào joinRegCache ----------
// Dùng chung cho màn xem, Tiếp tục điền (bản nháp) và Tạo hồ sơ mới từ hồ sơ đã trả (prefillJoin)
const joinRegCache = new Map();
const joinRegData = (r) => {
  if (joinRegCache.has(r.id)) return joinRegCache.get(r.id);
  const rand = seededRandom(r.id + r.name);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const draft = r.status === 'draft';
  const blood = pick(['A', 'B', 'AB', 'O', 'O']);
  // Mốc xử lý: nộp → tiếp nhận (0–2 ngày) → xác minh (1–3 ngày) → kết nạp (1–3 ngày); từ chối ở bước kiểm tra dữ liệu, trả hồ sơ ở bước xác minh
  const stamp = (iso) => `${viDate(iso)} ${pad2(between(7, 20))}:${pad2(between(0, 59))}`;
  const submitted = r.submitted || r.created;
  const received = addDays(submitted, between(0, 2));
  const verified = addDays(received, between(1, 3));
  const admitted = addDays(verified, between(1, 3));
  const data = {
    name: TEAM_ACCOUNT.name, identity: TEAM_ACCOUNT.identity, gender: TEAM_ACCOUNT.gender, year: TEAM_ACCOUNT.dob.slice(-4), phone: TEAM_ACCOUNT.phone,
    blood: draft && rand() < 0.5 ? '' : blood, // bản nháp có thể chưa chọn nhóm máu
    field: (TEAM_FIELD_HINTS.find(([re]) => re.test(r.name)) || [])[1] || pick(JOIN_FIELDS),
    skills: [...new Set([pick(JOIN_SKILLS), pick(JOIN_SKILLS), pick(JOIN_SKILLS)])].slice(0, between(1, 3)),
    province: 'Tỉnh Hà Tĩnh', ward: clubWard(r.name), unit: clubUnit(r.name), club: r.name,
    // Bản nháp có thể chưa tích cam kết; hồ sơ đã nộp luôn đã đồng ý
    agree: !draft || rand() < 0.5,
    reason: r.status === 'returned' ? pick(JOIN_RETURNED) : r.status === 'rejected' ? pick(JOIN_REJECTED) : '',
    times: {
      submitted: stamp(submitted), received: stamp(received), verified: stamp(verified), admitted: stamp(admitted),
      rejected: stamp(addDays(submitted, between(0, 2))), admittedDate: viDate(admitted),
    },
    card: `${(r.code || '42.18073').split('.').slice(0, 2).join('.')}.TNV.${String(between(20, 160)).padStart(3, '0')}.1`, // Số thẻ tình nguyện viên khi kết nạp
  };
  data.privacy = data.agree;
  joinRegCache.set(r.id, data);
  return data;
};

// ---------- Trả lời từ đội, câu lạc bộ: theo mẫu trả lời của từng bước (đặc tả 7.2, 8.1, 9.2), mới nhất lên đầu; danh xưng bà/ông theo giới tính ----------
const joinReplies = (r, d) => {
  const title = d.gender === 'Nữ' ? 'bà' : 'ông';
  const dear = `Kính gửi ${title} ${d.name},`;
  const kind = /^Đội/.test(d.club) ? 'Đội' : 'Câu lạc bộ';
  const t = d.times;
  const list = [];
  if (r.status === 'rejected') list.push([t.rejected, `${dear} Hồ sơ ${r.code} không được tiếp nhận vì: ${d.reason}.`]);
  if (['received', 'eligible', 'admitted', 'returned'].includes(r.status)) list.push([t.received, `${dear} ${d.club} đã tiếp nhận hồ sơ ${r.code}. Ban chủ nhiệm sẽ liên hệ để xác minh.`]);
  if (['eligible', 'admitted'].includes(r.status)) list.push([t.verified, `${dear} Hồ sơ ${r.code} đã được xác minh và đủ điều kiện gia nhập ${d.club}. ${kind} sẽ thông báo khi hoàn tất kết nạp.`]);
  if (r.status === 'returned') list.push([t.verified, `${dear} Hồ sơ ${r.code} chưa đáp ứng yêu cầu: ${d.reason}. Vui lòng hoàn thiện và nộp hồ sơ mới.`]);
  if (r.status === 'admitted') list.push([t.admitted, `${dear} ${title.charAt(0).toUpperCase()}${title.slice(1)} đã được kết nạp vào ${d.club} từ ngày ${t.admittedDate}, số thẻ tình nguyện viên ${d.card}.`]);
  return list.reverse();
};
// ---------- Hồ sơ gia nhập chi hội (GN): danh mục Loại chi hội · dữ liệu minh họa — khai báo ở đây để mở thẳng link #gia-nhap-chi-hoi/xem/<mã> khi tải trang ----------
// ---------- Danh mục Loại chi hội (đặc tả 3.1) → phân đoạn loại chi hội của Mã hội viên (Quy tắc sinh mã mục 3) ----------
const BRANCH_KINDS = {
  'Cộng đồng/Tổ dân phố': 'CĐ',
  'Trường học': 'TH',
  'Bệnh viện, phòng khám,…': 'BV',
  'Cơ quan dân chính đảng': 'CQ',
  'Tổ chức tôn giáo (nhà chùa, nhà thờ,…)': 'TG',
  'Loại hình khác': 'K',
};
// ---------- Loại chi hội suy theo từ khóa trong tên (minh họa) ----------
const branchKind = (name) => (/Trường/.test(name) ? 'Trường học'
  : /Bệnh viện|Trạm Y tế|phòng khám/i.test(name) ? 'Bệnh viện, phòng khám,…'
  : /cơ quan/i.test(name) ? 'Cơ quan dân chính đảng'
  : /Chùa|Giáo xứ|Giáo họ|Nhà thờ/i.test(name) ? 'Tổ chức tôn giáo (nhà chùa, nhà thờ,…)'
  : /Tổ dân phố|Thôn/.test(name) ? 'Cộng đồng/Tổ dân phố' : 'Loại hình khác');
// ---------- Dữ liệu hồ sơ (minh họa): cố định theo mã hồ sơ; hồ sơ tạo từ biểu mẫu lưu dữ liệu thật vào branchRegCache ----------
// Dùng chung cho màn xem (CD-02a), Tiếp tục điền (bản nháp) và Tạo hồ sơ mới từ hồ sơ đã trả (prefillBranch)
// Nội dung cần bổ sung (Đã trả hồ sơ — bước xác minh) · lý do từ chối (Đã từ chối — bước kiểm tra dữ liệu)
const BRANCH_RETURNED = ['số điện thoại liên lạc không liên hệ được để xác minh', 'chưa xác minh được nơi cư trú, học tập hoặc làm việc trên địa bàn của chi hội'];
const BRANCH_REJECTED = ['người nộp đã là hội viên đang sinh hoạt của chi hội', 'thông tin trong hồ sơ chưa khớp với dữ liệu định danh của người nộp'];
const branchRegCache = new Map();
const branchRegData = (r) => {
  if (branchRegCache.has(r.id)) return branchRegCache.get(r.id);
  const rand = seededRandom(r.id + r.name);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const draft = r.status === 'draft';
  // Mốc xử lý: nộp → tiếp nhận (0–2 ngày) → xác minh (1–3 ngày) → kết nạp (1–3 ngày); từ chối ở bước kiểm tra dữ liệu, trả hồ sơ ở bước xác minh
  const stamp = (iso) => `${viDate(iso)} ${pad2(between(7, 20))}:${pad2(between(0, 59))}`;
  const submitted = r.submitted || r.created;
  const received = addDays(submitted, between(0, 2));
  const verified = addDays(received, between(1, 3));
  const admitted = addDays(verified, between(1, 3));
  const data = {
    name: TEAM_ACCOUNT.name, identity: TEAM_ACCOUNT.identity, gender: TEAM_ACCOUNT.gender, year: TEAM_ACCOUNT.dob.slice(-4),
    phone: TEAM_ACCOUNT.phone,
    blood: draft && rand() < 0.5 ? '' : pick(['A', 'B', 'AB', 'O', 'O']),
    member: rand() < 0.85 ? 'Hội viên chính thức' : 'Hội viên danh dự',
    field: pick(JOIN_FIELDS.slice(0, 5)),
    skills: [...new Set([pick(JOIN_SKILLS), pick(JOIN_SKILLS)])],
    province: 'Tỉnh Hà Tĩnh', ward: clubWard(r.name), unit: clubUnit(r.name), kind: branchKind(r.name), branch: r.name,
    agree: !draft || rand() < 0.5,
    reason: r.status === 'returned' ? pick(BRANCH_RETURNED) : r.status === 'rejected' ? pick(BRANCH_REJECTED) : '',
    times: {
      submitted: stamp(submitted), received: stamp(received), verified: stamp(verified), admitted: stamp(admitted),
      rejected: stamp(addDays(submitted, between(0, 2))), admittedDate: viDate(admitted),
    },
  };
  data.privacy = data.agree;
  // Mã hội viên khi kết nạp: [Mã tỉnh].[Mã xã].[STT 3 số].[HVCT/HVDD].[Loại chi hội] (Quy tắc sinh mã mục 3)
  data.memberCode = `${(r.code || '42.18073').split('.').slice(0, 2).join('.')}.${String(between(20, 160)).padStart(3, '0')}.${data.member === 'Hội viên danh dự' ? 'HVDD' : 'HVCT'}.${BRANCH_KINDS[data.kind]}`;
  branchRegCache.set(r.id, data);
  return data;
};

// Trả lời từ chi hội (hồ sơ gia nhập chi hội — đặc tả 7.2, 8.1, 9.1): kết nạp nêu Mã hội viên và Ngày kết nạp
const branchReplies = (r, d) => {
  const title = d.gender === 'Nữ' ? 'bà' : 'ông';
  const dear = `Kính gửi ${title} ${d.name},`;
  const t = d.times;
  const list = [];
  if (r.status === 'rejected') list.push([t.rejected, `${dear} Hồ sơ ${r.code} không được tiếp nhận vì: ${d.reason}.`]);
  if (['received', 'eligible', 'admitted', 'returned'].includes(r.status)) list.push([t.received, `${dear} ${d.branch} đã tiếp nhận hồ sơ ${r.code}. Ban lãnh đạo chi hội sẽ liên hệ để xác minh.`]);
  if (['eligible', 'admitted'].includes(r.status)) list.push([t.verified, `${dear} Hồ sơ ${r.code} đã được xác minh và đủ điều kiện gia nhập ${d.branch}. Chi hội sẽ thông báo khi hoàn tất kết nạp.`]);
  if (r.status === 'returned') list.push([t.verified, `${dear} Hồ sơ ${r.code} chưa đáp ứng yêu cầu: ${d.reason}. Vui lòng hoàn thiện và nộp hồ sơ mới.`]);
  if (r.status === 'admitted') list.push([t.admitted, `${dear} ${title.charAt(0).toUpperCase()}${title.slice(1)} đã được kết nạp vào ${d.branch} từ ngày ${t.admittedDate} với mã hội viên ${d.memberCode}.`]);
  return list.reverse();
};
const joinRepliesHtml =(replies, club) => (replies.length
  ? `<ul class="pf-jv-replies">${replies.map(([time, text]) => `<li><p class="pf-jv-reply-from"><b>${escapeHtml(club)}</b><span>${time}</span></p><p>${escapeHtml(text)}</p></li>`).join('')}</ul>`
  : '<p class="pf-view-none">Chưa có trả lời</p>');

// ---------- Dựng nội dung modal — cùng khung Xem chi tiết hồ sơ thành lập (renderTeamView): đầu modal · 3 ô số liệu · cặp thẻ · Cam kết · Trả lời (không có Tiến trình xử lý) ----------
// Hồ sơ gia nhập chi hội (GN — đặc tả CD-02a): Thông tin hội viên (có Loại hội viên) · Chi hội muốn gia nhập (có Loại chi hội) · Cam kết theo Điều lệ · Trả lời từ chi hội
const renderJoinView = (r) => {
  const gn = r.type === 'GN';
  const d = gn ? branchRegData(r) : joinRegData(r);
  const st = VOL_STATUS[r.status];
  const dot = '<span aria-hidden="true">•</span>';
  document.querySelector('#pf-tv-title').textContent = r.name;
  document.querySelector('#pf-tv-sub').innerHTML = `<span>Mã hồ sơ: <b>${r.code}</b></span>${dot}<span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span>${dot}<span>Ngày tạo: ${viDate(r.created)}</span>${dot}<span>Ngày nộp: ${viDate(r.submitted)}</span>`;
  // Ghi chú đầu modal như hồ sơ thành lập: lý do trả hồ sơ / từ chối
  const notes = {
    returned: `<b>Lý do trả hồ sơ:</b> ${escapeHtml(d.reason.charAt(0).toUpperCase() + d.reason.slice(1))}.`,
    rejected: `<b>Lý do từ chối:</b> ${escapeHtml(d.reason.charAt(0).toUpperCase() + d.reason.slice(1))}.`,
  };
  const note = document.querySelector('#pf-tv-note');
  note.hidden = !notes[r.status];
  note.className = `pf-view-note${r.status === 'rejected' ? ' is-red' : ''}`;
  note.innerHTML = notes[r.status] || '';
  // Chân modal: chỉ Đã trả hồ sơ có nút chính — Tạo hồ sơ mới từ hồ sơ này (mở biểu mẫu Thêm mới đã điền sẵn)
  const edit = document.querySelector('#pf-tv-edit');
  edit.hidden = r.status !== 'returned';
  delete edit.dataset.panel;
  delete edit.dataset.volCopy;
  if (r.status === 'returned') {
    edit.querySelector('span').textContent = 'Tạo hồ sơ mới từ hồ sơ này';
    edit.querySelector('use').setAttribute('href', '#plus-square');
    edit.dataset.volCopy = r.id;
  }

  const check = (on, text) => `<li class="${on ? 'is-on' : ''}"><span class="pf-tv-check" aria-hidden="true"></span><span>${text}<span class="visually-hidden">${on ? ' — đã đồng ý' : ' — chưa đồng ý'}</span></span></li>`;
  const replies = gn ? branchReplies(r, d) : joinReplies(r, d);
  // Thẻ thông tin đăng ký · đơn vị muốn gia nhập · cam kết: theo loại hồ sơ
  const infoCard = gn
    ? vCard('pf-jv-volunteer', 'Thông tin hội viên', vKvs([
      vKv('Loại hội viên', vText(d.member)),
      vKv('Lĩnh vực hoạt động', vTags(d.field ? [d.field] : [])),
      vKv('Kỹ năng', vTags(d.skills)),
    ]))
    : vCard('pf-jv-volunteer', 'Thông tin tình nguyện viên', vKvs([
      vKv('Lĩnh vực hoạt động', vTags(d.field ? [d.field] : [])),
      vKv('Kỹ năng', vTags(d.skills)),
    ]));
  const unitCard = gn
    ? vCard('pf-jv-club', 'Chi hội muốn gia nhập', vKvs([
      vKv('Chi hội', vText(d.branch)),
      vKv('Loại chi hội', vText(d.kind)),
      vKv('Đơn vị quản lý', vText(d.unit)),
      vKv('Phường/xã', vText(d.ward)),
      vKv('Tỉnh/Thành phố', vText(d.province)),
    ]))
    : vCard('pf-jv-club', 'Đội, câu lạc bộ muốn gia nhập', vKvs([
      vKv('Đội, câu lạc bộ', vText(d.club)),
      vKv('Đơn vị quản lý', vText(d.unit)),
      vKv('Phường/xã', vText(d.ward)),
      vKv('Tỉnh/Thành phố', vText(d.province)),
    ]));
  const commit = gn
    ? ['Sau khi nghiên cứu Điều lệ Hội Chữ thập đỏ Việt Nam, tôi tự nguyện đăng ký gia nhập chi hội nêu trên, chấp hành Điều lệ và sẵn sàng nhận nhiệm vụ do Hội giao.',
      'Tôi đã đọc Điều lệ và đồng ý với cam kết trên', 'hội viên']
    : ['Sau khi nghiên cứu Điều lệ Hội Chữ thập đỏ Việt Nam và Quy chế tổ chức và hoạt động của tình nguyện viên Chữ thập đỏ, tôi tự nguyện đăng ký gia nhập đội, câu lạc bộ nêu trên, chấp hành Điều lệ, Quy chế và sẵn sàng nhận nhiệm vụ do Hội giao.',
      'Tôi đã đọc Điều lệ, Quy chế và đồng ý với cam kết trên', 'tình nguyện viên'];
  document.querySelector('#pf-tv-body').innerHTML = `
    <!-- Số liệu chính -->
    <div class="pf-view-stats">
      ${gn ? vStat('user', 'Loại hội viên', vText(d.member)) : vStat('layers', 'Lĩnh vực hoạt động', vText(d.field))}
      ${vStat('hand-heart', 'Kỹ năng đăng ký', d.skills.length ? `${d.skills.length} kỹ năng` : '')}
      ${vStat('calendar', 'Ngày nộp hồ sơ', viDate(r.submitted))}
    </div>

    <!-- Thông tin cá nhân | Thông tin tình nguyện viên (hội viên) + Đội, CLB (chi hội) muốn gia nhập (xếp chồng) -->
    <div class="pf-view-pair is-even">
      ${vCard('pf-jv-person', 'Thông tin cá nhân', vKvs([
        vKv('Họ và tên', vText(d.name)),
        vKv('Số định danh cá nhân', vText(d.identity)),
        vKv('Giới tính', vText(d.gender)),
        vKv('Năm sinh', vText(d.year)),
        vKv('Điện thoại', vText(d.phone)),
        vKv('Nhóm máu', vText(d.blood)),
        vKv('Nguồn thông tin', `<span class="pf-reg-badge">${icon('shield')}Lấy từ tài khoản định danh</span>`),
      ]))}
      <div class="pf-jv-stack">
        ${infoCard}
        ${unitCard}
      </div>
    </div>

    <!-- Cam kết · xác nhận nộp -->
    ${vCard('pf-jv-commit', 'Cam kết', `<div class="pf-tv-commit">
      <p>${commit[0]}</p>
      <ul class="pf-tv-checks">
        ${check(d.agree, commit[1])}
        ${check(d.privacy, `Tôi đồng ý để Hội xử lý dữ liệu cá nhân trong hồ sơ cho mục đích xét duyệt và quản lý ${commit[2]}`)}
      </ul>
    </div>
    ${vKvs([vKv('Xác nhận', `Bằng tài khoản định danh · ${d.times.submitted}`)])}`)}

    <!-- Trả lời từ đội, câu lạc bộ (chi hội) -->
    ${vCard('pf-jv-replies', gn ? 'Trả lời từ chi hội' : 'Trả lời từ đội, câu lạc bộ', joinRepliesHtml(replies, r.name), replies.length ? `${replies.length} trả lời` : '')}`;
};

// ---------- Nút Tạo hồ sơ mới từ hồ sơ này ở chân modal: đóng modal rồi mở biểu mẫu gia nhập đã điền sẵn (copyVolReg) ----------
document.querySelector('#pf-tv-edit').addEventListener('click', (event) => {
  const id = event.currentTarget.dataset.volCopy;
  if (!id) return;
  const trigger = teamViewTrigger;
  closeTeamView();
  copyVolReg(findVolReg(id), trigger);
});
// ==================== END SECTION: XEM CHI TIẾT HỒ SƠ GIA NHẬP ĐỘI, CLB ====================

// ==================== SECTION: ĐỘI, CÂU LẠC BỘ CỦA TÔI · CHI HỘI CỦA TÔI — Danh sách thành viên / hội viên (CD-04f, CD-02f) · Hồ sơ gia nhập (CD-04b, CD-02b) · Chuyển ngừng sinh hoạt (UC-GN-09) ====================
// Một màn dùng chung 2 chế độ (UNIT_MODES): #doi-clb — Chủ nhiệm, Phó Chủ nhiệm đội, CLB tài khoản đã thành lập (hồ sơ thành lập “Đã tạo đơn vị”)
// · #chi-hoi — Chi hội trưởng, Chi hội phó (minh họa: tài khoản là Chi hội trưởng 1 chi hội). Mỗi chế độ 1 đơn vị; nhãn cột, bộ lọc, mẫu trả lời đổi theo chế độ.
// Thanh tab chung: #doi-clb | #chi-hoi → Danh sách thành viên / hội viên · #<route>/<trạng thái> → hồ sơ gia nhập theo 5 trạng thái: Mới · Đã tiếp nhận · Đã đủ điều kiện · Đã kết nạp · Đã từ chối
// · #<route>/ho-so/<mã hồ sơ> → modal phải xử lý hồ sơ (Tiếp nhận → Xác minh → Phê duyệt kết nạp).
// Thành viên: ban chủ nhiệm lên đầu, sau đó theo Số thẻ tăng dần · Hồ sơ: Ngày nộp giảm dần · phân trang 50 / 100 dòng (BR-17).
const MEMBER_STATUS = {
  active: { label: 'Đang sinh hoạt', tone: 'green' },
  stopped: { label: 'Ngừng sinh hoạt', tone: 'neutral' },
};
// 5 trạng thái hồ sơ gia nhập (nhãn, màu theo VOL_STATUS), mỗi trạng thái 1 tab; xác minh Chưa phù hợp → Đã từ chối
const JOIN_STATUSES = ['new', 'received', 'eligible', 'admitted', 'rejected'];
const CLUB_JOIN_TABS = Object.fromEntries(JOIN_STATUSES.map((key) => [key, VOL_STATUS[key]]));
// Chi hội (đặc tả 2, 6.1): 6 trạng thái — xác minh Chưa phù hợp → Đã trả hồ sơ; Từ chối chỉ ở bước tiếp nhận
const BRANCH_JOIN_STATUSES = ['new', 'received', 'eligible', 'admitted', 'returned', 'rejected'];
const BRANCH_JOIN_TABS = Object.fromEntries(BRANCH_JOIN_STATUSES.map((key) => [key, VOL_STATUS[key]]));
const ROLE_RANK = { 'Chủ nhiệm': 0, 'Phó Chủ nhiệm': 1, 'Thành viên': 2, 'Chi hội trưởng': 0, 'Chi hội phó': 1, 'Hội viên': 2 };
const MEMBER_TYPES = ['Hội viên chính thức', 'Hội viên danh dự'];
// ---------- 2 chế độ: nhãn cột / bộ lọc / tên file xuất / người xử lý theo đặc tả (đội, CLB: CD-04 · chi hội: CD-02) ----------
const UNIT_MODES = {
  club: {
    route: 'doi-clb', title: 'Đội, câu lạc bộ của tôi', kindWord: 'đội, câu lạc bộ', person: 'thành viên', roles: ['Chủ nhiệm', 'Phó Chủ nhiệm', 'Thành viên'],
    codeLabel: 'Số thẻ tình nguyện viên', extraLabel: 'Nhóm máu', extraOptions: ['A', 'B', 'AB', 'O', 'Chưa rõ'], extraOf: (m) => m.blood, dateLabel: 'Ngày tham gia',
    joinExtraLabel: 'Lĩnh vực hoạt động', joinExtraOf: (a) => a.field, exportName: 'Danh-sach-thanh-vien', handlers: 'Chủ nhiệm, phó chủ nhiệm',
  },
  branch: {
    route: 'chi-hoi', title: 'Chi hội của tôi', kindWord: 'chi hội', person: 'hội viên', roles: ['Chi hội trưởng', 'Chi hội phó', 'Hội viên'],
    codeLabel: 'Mã hội viên', extraLabel: 'Loại hội viên', extraOptions: MEMBER_TYPES, extraOf: (m) => m.memberType, dateLabel: 'Ngày kết nạp',
    joinExtraLabel: 'Loại hội viên', joinExtraOf: (a) => a.memberType, exportName: 'Danh-sach-hoi-vien', handlers: 'Chi hội trưởng, chi hội phó',
  },
};
const UNIT_ROUTES = { 'doi-clb': 'club', 'chi-hoi': 'branch' };
const pad3 = (n) => String(n).padStart(3, '0');
// Số thẻ tình nguyện viên [Mã tỉnh].[Mã xã].TNV.[STT].[1 đang sinh hoạt trong đội, CLB | 0 ngừng sinh hoạt] (Quy tắc sinh mã mục 4)
const tnvCard = (unit, stt) => `${unit.prov}.${unit.ward}.TNV.${pad3(stt)}.1`;
const cardStt = (card) => Number(card.split('.')[3]);
// Thời điểm 'yyyy-mm-dd hh:mm' → “dd/mm/yyyy hh:mm”
const atText = (at) => `${viDate(at.slice(0, 10))} ${at.slice(11)}`;
const nowAt = () => { const d = new Date(); return `${isoToday()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const stopMember = (m, reason) => { m.status = 'stopped'; if (m.unit.kind !== 'branch') m.card = m.card.replace(/\.1$/, '.0'); m.reason = reason; };
const memberSort = (a, b) => (ROLE_RANK[a.role] - ROLE_RANK[b.role]) || a.card.localeCompare(b.card);
// Đội, CLB khác (minh họa) — Sinh hoạt hiện tại / hồ sơ gia nhập khác đang xử lý của người nộp
const OTHER_CLUBS = ['Đội sơ cấp cứu Tổ dân phố số 6', 'Câu lạc bộ Tình nguyện viên trẻ tỉnh Hà Tĩnh', 'Đội tình nguyện viên Nhân đạo phường Hà Huy Tập'];

// ---------- Dữ liệu minh họa: thành viên = danh sách trong hồ sơ thành lập (1–2 người ngừng sinh hoạt) + người được kết nạp qua hồ sơ gia nhập ----------
// Lịch sử xử lý của hồ sơ: { at: 'yyyy-mm-dd hh:mm', title, by, cls } (cls is-alert: từ chối / trả hồ sơ)
const CLUB_MEMBERS = [];
const CLUB_JOINS = [];
// Mỗi Chủ nhiệm quản lý 1 đội, CLB: lấy hồ sơ thành lập “Đã tạo đơn vị” gần nhất
const CLUB_UNITS = VOL_REGS.filter((r) => r.type === 'DC' && r.status === 'created').slice(0, 1).map((r, index) => {
  const d = teamRegData(r);
  const rand = seededRandom(`${r.id}-unit`);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const digits = (n) => Array.from({ length: n }, () => between(0, 9)).join('');
  const [prov, ward] = r.code.split('.');
  const founded = addDays(r.submitted, 7);
  const unit = {
    kind: 'club', id: r.id, name: r.name, manager: d.unit, wardName: d.ward, fields: d.fields, prov, ward, founded,
    code: `${prov}.${ward}.${/^Câu lạc bộ/.test(r.name) ? 'CLB' : 'DOI'}.${pad3(index + 1)}`,
  };
  let stt = between(10, 30);
  const members = d.members.map((m, i) => ({
    id: `${r.id}-M${i}`, unit, name: m.name, role: m.role, gender: m.gender, year: m.year, identity: m.identity, phone: m.phone, blood: m.blood,
    card: tnvCard(unit, stt++), joined: founded, status: 'active', self: i === 0,
  }));
  members.filter((m) => m.role === 'Thành viên').slice(-between(1, 2)).forEach((m) => stopMember(m, 'Chuyển nơi cư trú, không tiếp tục sinh hoạt'));
  const leaders = members.filter((m) => m.role !== 'Thành viên');
  // Hồ sơ gia nhập: mỗi trạng thái 4–5 hồ sơ; số ngày từ lúc nộp đến hôm nay theo trạng thái (hồ sơ Mới nộp gần đây nhất, hồ sơ đã xử lý xong nộp lâu hơn)
  // — mọi mốc xử lý không sau hôm nay; ngày nộp không trước ngày thành lập
  const JOIN_AGE = { new: [0, 12], received: [6, 18], eligible: [10, 24], admitted: [14, 45], rejected: [6, 40] };
  const plan = JOIN_STATUSES.flatMap((status) => Array.from({ length: between(4, 5) }, () => status));
  const joins = [];
  plan.forEach((status) => {
    const gender = rand() < 0.5 ? 'Nam' : 'Nữ';
    const year = String(between(1975, 2006));
    const [minAge, maxAge] = JOIN_AGE[status];
    const day = [addDays(isoToday(), -between(minAge, maxAge)), addDays(founded, 1)].sort().pop();
    const at = (iso) => `${iso} ${pad2(between(7, 20))}:${pad2(between(0, 59))}`;
    const times = { new: at(day) };
    const a = {
      code: '', unit, status,
      name: `${pick(TEAM_LAST)} ${pick(TEAM_MIDDLE[gender])} ${pick(TEAM_FIRST[gender])}`, gender, year,
      identity: `040${gender === 'Nam' ? 0 : 1}${year.slice(2)}${digits(6)}`, phone: `09${digits(8)}`, blood: pick(['A', 'B', 'AB', 'O', 'O', 'Chưa rõ']),
      field: pick(unit.fields), skills: [...new Set([pick(JOIN_SKILLS), pick(JOIN_SKILLS)])].slice(0, between(1, 2)),
      current: rand() < 0.35 ? { name: pick(OTHER_CLUBS), card: tnvCard(unit, between(100, 160)) } : null,
      other: status === 'new' && rand() < 0.4 ? { code: `${prov}.00000.GC.2026.${String(between(1, 30)).padStart(4, '0')}`, unit: pick(OTHER_CLUBS), status: 'Mới' } : null,
      times, handler: '', history: [],
    };
    a.history.push({ at: times.new, title: 'Nộp hồ sơ', by: a.name });
    // Mốc xử lý: tiếp nhận (1–2 ngày) → xác minh (1–3 ngày) → kết nạp (1–3 ngày); từ chối ở bước kiểm tra dữ liệu
    const step1 = addDays(day, between(1, 2));
    const step2 = addDays(step1, between(1, 3));
    const step3 = addDays(step2, between(1, 3));
    const log = (key, iso, title, cls = '') => {
      const h = pick(leaders);
      times[key] = at(iso);
      a.handler = h.name;
      a.history.push({ at: times[key], title, by: `${h.name} (${h.role})`, cls });
    };
    // Đã từ chối: ở bước kiểm tra dữ liệu, hoặc sau khi tiếp nhận — xác minh chưa phù hợp
    const rejectAfterVerify = status === 'rejected' && rand() < 0.4;
    if (status === 'rejected' && !rejectAfterVerify) log('closed', step1, 'Từ chối hồ sơ', 'is-alert');
    if (['received', 'eligible', 'admitted'].includes(status) || rejectAfterVerify) log('received', step1, 'Tiếp nhận hồ sơ');
    if (rejectAfterVerify) log('closed', step2, 'Xác minh: chưa phù hợp — từ chối hồ sơ', 'is-alert');
    if (['eligible', 'admitted'].includes(status)) log('eligible', step2, 'Xác minh: phù hợp');
    if (status === 'admitted') {
      log('admitted', step3, 'Phê duyệt kết nạp');
      a.admit = { date: step3, card: a.current ? tnvCard(unit, cardStt(a.current.card)) : tnvCard(unit, stt++) };
    }
    joins.push(a);
  });
  // Mã hồ sơ [Mã tỉnh].[Mã xã].GC.[Năm].[STT 4 số] tăng theo thời điểm nộp · người được kết nạp vào danh sách thành viên
  let seq = between(20, 40);
  joins.sort((a, b) => a.times.new.localeCompare(b.times.new)).forEach((a) => {
    a.code = `${prov}.${ward}.GC.${a.times.new.slice(0, 4)}.${String(seq++).padStart(4, '0')}`;
    if (a.admit) members.push({ id: `${a.code}-M`, unit, name: a.name, role: 'Thành viên', gender: a.gender, year: a.year, identity: a.identity, phone: a.phone, blood: a.blood, card: a.admit.card, joined: a.admit.date, status: 'active' });
  });
  CLUB_JOINS.push(...joins);
  CLUB_MEMBERS.push(...members);
  return unit;
});
// ---------- Chi hội của tôi (minh họa): tài khoản là Chi hội trưởng; hội viên + hồ sơ gia nhập chi hội (GN) ----------
// Mã hội viên [Mã tỉnh].[Mã xã].[STT 3 số].[HVCT|HVDD].[Loại chi hội] (Quy tắc sinh mã mục 3) — giữ nguyên khi Ngừng sinh hoạt
const memberCode = (u, stt, type) => `${u.prov}.${u.ward}.${pad3(stt)}.${type === 'Hội viên danh dự' ? 'HVDD' : 'HVCT'}.${u.kindCode}`;
const codeStt = (code) => Number(code.split('.')[2]);
// Kết nạp (BR-10): đang là hội viên chi hội khác cùng (tỉnh, xã) → giữ STT, cập nhật Loại hội viên / Loại chi hội; còn lại → STT tiếp theo của bộ đếm (tỉnh, xã)
const admitCode = (a, type) => {
  const u = a.unit;
  const prefix = `${u.prov}.${u.ward}.`;
  if (a.current && a.current.card.startsWith(prefix)) return memberCode(u, codeStt(a.current.card), type);
  return memberCode(u, Math.max(0, ...CLUB_MEMBERS.filter((m) => m.unit.kind === 'branch' && m.card.startsWith(prefix)).map((m) => codeStt(m.card))) + 1, type);
};
// Chi hội khác (minh họa) — Sinh hoạt hiện tại / hồ sơ gia nhập khác đang xử lý của người nộp
const OTHER_BRANCHES = [['Chi hội Trường THCS Thành Sen', 'TH'], ['Chi hội Tổ dân phố số 5 phường Thành Sen', 'CĐ'], ['Chi hội Khối cơ quan phường Trần Phú', 'CQ']];
const BRANCH_UNIT = (() => {
  const rand = seededRandom('chi-hoi-to-dan-pho-so-4');
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const digits = (n) => Array.from({ length: n }, () => between(0, 9)).join('');
  const unit = {
    kind: 'branch', id: 'CH-012', name: 'Chi hội Tổ dân phố số 4 phường Thành Sen', branchKind: 'Cộng đồng/Tổ dân phố', kindCode: 'CĐ',
    manager: 'Hội Chữ thập đỏ phường Thành Sen', wardName: 'Phường Thành Sen', prov: '42', ward: '18073', founded: '2026-07-25', code: '42.18073.CH.012',
  };
  // Hội viên: Chi hội trưởng (tài khoản) · 1 Chi hội phó · 22 hội viên (2 ngừng sinh hoạt); kết nạp ngày thành lập hoặc sau đó
  let stt = 1;
  const person = (role, o = {}) => {
    const gender = o.gender || (rand() < 0.5 ? 'Nam' : 'Nữ');
    const year = o.year || String(between(1965, 2004));
    const memberType = o.memberType || (rand() < 0.88 ? MEMBER_TYPES[0] : MEMBER_TYPES[1]);
    const n = stt++;
    return {
      id: `${unit.id}-M${n}`, unit, role, gender, year, memberType, card: memberCode(unit, n, memberType), status: 'active', self: Boolean(o.self),
      name: o.name || `${pick(TEAM_LAST)} ${pick(TEAM_MIDDLE[gender])} ${pick(TEAM_FIRST[gender])}`,
      identity: o.identity || `040${gender === 'Nam' ? 0 : 1}${year.slice(2)}${digits(6)}`, phone: o.phone || `09${digits(8)}`, blood: pick(['A', 'B', 'AB', 'O', 'O']),
      joined: o.joined || (rand() < 0.2 ? addDays(unit.founded, between(10, 60)) : unit.founded),
    };
  };
  const members = [
    person('Chi hội trưởng', { self: true, name: TEAM_ACCOUNT.name, gender: TEAM_ACCOUNT.gender, year: TEAM_ACCOUNT.dob.slice(-4), identity: TEAM_ACCOUNT.identity, phone: TEAM_ACCOUNT.phone, memberType: MEMBER_TYPES[0], joined: unit.founded }),
    person('Chi hội phó', { joined: unit.founded }),
    ...Array.from({ length: 22 }, () => person('Hội viên')),
  ];
  members.filter((m) => m.role === 'Hội viên').slice(-2).forEach((m) => stopMember(m, 'Chuyển nơi cư trú, không tiếp tục sinh hoạt'));
  const leaders = members.filter((m) => m.role !== 'Hội viên');
  // Hồ sơ gia nhập: mỗi trạng thái 3–4 hồ sơ, cùng cách sinh mốc xử lý như đội, CLB
  const JOIN_AGE = { new: [0, 12], received: [6, 18], eligible: [10, 24], admitted: [14, 45], returned: [8, 40], rejected: [6, 40] };
  const joins = [];
  BRANCH_JOIN_STATUSES.flatMap((status) => Array.from({ length: between(3, 4) }, () => status)).forEach((status) => {
    const gender = rand() < 0.5 ? 'Nam' : 'Nữ';
    const year = String(between(1970, 2006));
    const [minAge, maxAge] = JOIN_AGE[status];
    const day = [addDays(isoToday(), -between(minAge, maxAge)), addDays(unit.founded, 1)].sort().pop();
    const at = (iso) => `${iso} ${pad2(between(7, 20))}:${pad2(between(0, 59))}`;
    const times = { new: at(day) };
    const other = pick(OTHER_BRANCHES);
    const a = {
      code: '', unit, status,
      name: `${pick(TEAM_LAST)} ${pick(TEAM_MIDDLE[gender])} ${pick(TEAM_FIRST[gender])}`, gender, year,
      identity: `040${gender === 'Nam' ? 0 : 1}${year.slice(2)}${digits(6)}`, phone: `09${digits(8)}`, blood: pick(['A', 'B', 'AB', 'O', 'O', 'Chưa rõ']),
      memberType: rand() < 0.85 ? MEMBER_TYPES[0] : MEMBER_TYPES[1],
      field: pick(JOIN_FIELDS.slice(0, 5)), skills: [...new Set([pick(JOIN_SKILLS), pick(JOIN_SKILLS)])].slice(0, between(1, 2)),
      current: rand() < 0.35 ? { name: other[0], card: `${unit.prov}.${unit.ward}.${pad3(between(100, 160))}.HVCT.${other[1]}` } : null,
      other: status === 'new' && rand() < 0.4 ? { code: `${unit.prov}.${unit.ward}.GN.2026.${String(between(1, 30)).padStart(4, '0')}`, unit: pick(OTHER_BRANCHES)[0], status: 'Mới' } : null,
      times, handler: '', history: [],
    };
    a.history.push({ at: times.new, title: 'Nộp hồ sơ', by: a.name });
    const step1 = addDays(day, between(1, 2));
    const step2 = addDays(step1, between(1, 3));
    const step3 = addDays(step2, between(1, 3));
    const log = (key, iso, title, cls = '') => {
      const h = pick(leaders);
      times[key] = at(iso);
      a.handler = h.name;
      a.history.push({ at: times[key], title, by: `${h.name} (${h.role})`, cls });
    };
    // Từ chối: bước kiểm tra dữ liệu (trạng thái Mới) · Trả hồ sơ: bước xác minh (Chưa phù hợp)
    if (status === 'rejected') log('closed', step1, 'Từ chối hồ sơ', 'is-alert');
    if (['received', 'eligible', 'admitted', 'returned'].includes(status)) log('received', step1, 'Tiếp nhận hồ sơ');
    if (status === 'returned') log('closed', step2, 'Trả hồ sơ cho người nộp', 'is-alert');
    if (['eligible', 'admitted'].includes(status)) log('eligible', step2, 'Xác minh: phù hợp');
    if (status === 'admitted') { log('admitted', step3, 'Phê duyệt kết nạp'); a.admit = { date: step3 }; }
    joins.push(a);
  });
  // BR-04 (minh họa): 1 hồ sơ Mới của người đã được thêm vào chi hội qua kênh khác sau khi nộp → bước tiếp nhận chỉ cho Từ chối
  const added = members.find((m) => m.role === 'Hội viên' && m.status === 'active' && m.joined > unit.founded) || members[5];
  const dup = joins.filter((a) => a.status === 'new').pop();
  Object.assign(dup, { name: added.name, gender: added.gender, year: added.year, identity: added.identity, phone: added.phone, current: null, other: null });
  dup.history[0].by = added.name;
  CLUB_MEMBERS.push(...members);
  // Mã hồ sơ [Mã tỉnh].[Mã xã].GN.[Năm].[STT 4 số] tăng theo thời điểm nộp · người được kết nạp vào danh sách hội viên (Mã hội viên cấp theo admitCode)
  let seq = between(60, 80);
  joins.sort((a, b) => a.times.new.localeCompare(b.times.new)).forEach((a) => {
    a.code = `${unit.prov}.${unit.ward}.GN.${a.times.new.slice(0, 4)}.${String(seq++).padStart(4, '0')}`;
    if (!a.admit) return;
    a.admit.type = a.memberType;
    a.admit.card = admitCode(a, a.memberType);
    CLUB_MEMBERS.push({ id: `${a.code}-M`, unit, name: a.name, role: 'Hội viên', gender: a.gender, year: a.year, identity: a.identity, phone: a.phone, blood: a.blood, memberType: a.memberType, card: a.admit.card, joined: a.admit.date, status: 'active' });
  });
  CLUB_JOINS.push(...joins);
  return unit;
})();
const MY_UNITS = { club: CLUB_UNITS[0], branch: BRANCH_UNIT };
CLUB_MEMBERS.sort(memberSort);
CLUB_JOINS.sort((a, b) => b.times.new.localeCompare(a.times.new));
const findJoinApp = (code) => CLUB_JOINS.find((a) => a.code === code);

const club = {
  mode: 'club',
  unit: CLUB_UNITS[0],
  tab: 'members',
  jTab: 'new', // tab trạng thái hồ sơ gia nhập đang xem
  mSearch: document.querySelector('#cm-search'),
  mRole: document.querySelector('#cm-role'),
  mBlood: document.querySelector('#cm-blood'),
  mStatus: document.querySelector('#cm-status'),
  jSearch: document.querySelector('#cj-search'),
  jTime: document.querySelector('#cj-time'),
};
const unitMembers = () => CLUB_MEMBERS.filter((m) => m.unit === club.unit);
const unitJoins = () => CLUB_JOINS.filter((a) => a.unit === club.unit);
const memberFilters = [club.mRole, club.mBlood, club.mStatus];
const joinFilters = [club.jTime];
const countMemberFilters = setupFilterPanel('cm-filters', memberFilters);
const countJoinFilters = setupFilterPanel('cj-filters', joinFilters);
const unitMode = () => UNIT_MODES[club.mode];
const unitJoinTabs = () => (club.mode === 'branch' ? BRANCH_JOIN_TABS : CLUB_JOIN_TABS);
// Đổi chế độ (#doi-clb ↔ #chi-hoi): đơn vị, tiêu đề, nhãn cột, lựa chọn bộ lọc, câu hỏi Chuyển ngừng sinh hoạt; xóa điều kiện lọc của chế độ trước
const setUnitMode = (mode) => {
  if (club.mode === mode && club.ready) return;
  club.ready = true;
  club.mode = mode;
  club.unit = MY_UNITS[mode];
  const m = UNIT_MODES[mode];
  const set = (sel, text) => { document.querySelector(sel).textContent = text; };
  set('#club-heading', m.title);
  set('#cm-search-label', `Tìm ${m.person}`);
  document.querySelector('#cm-filters').setAttribute('aria-label', `Bộ lọc ${m.person}`);
  club.mRole.innerHTML = `<option value="">Tất cả</option>${m.roles.map((r) => `<option>${r}</option>`).join('')}`;
  set('#cm-extra-label', m.extraLabel);
  club.mBlood.innerHTML = `<option value="">Tất cả</option>${m.extraOptions.map((o) => `<option>${o}</option>`).join('')}`;
  set('#cm-th-code', m.codeLabel);
  set('#cm-th-extra', m.extraLabel);
  set('#cm-th-date', m.dateLabel);
  set('#cm-empty', `Không có ${m.person} phù hợp điều kiện tìm kiếm.`);
  set('#cj-th-extra', m.joinExtraLabel);
  set('#pf-stop-text', `Chuyển ${m.person} này sang trạng thái Ngừng sinh hoạt?`);
  document.querySelector('.pf-table.is-members').classList.toggle('is-branch', mode === 'branch');
  [club.mSearch, club.jSearch, ...memberFilters, ...joinFilters].forEach((el) => { el.value = ''; });
};
// ---------- 4 ô thống kê (mục 10.1): tổng số bản ghi của đơn vị · Đang sinh hoạt · Ngừng sinh hoạt · ban lãnh đạo đang sinh hoạt (không theo bộ lọc) ----------
const renderMemberStats = () => {
  const rows = unitMembers();
  const branch = club.mode === 'branch';
  const leaders = rows.filter((m) => m.status === 'active' && ROLE_RANK[m.role] < 2).length;
  document.querySelector('#cm-stats').innerHTML = [
    vStat('people', branch ? 'Tổng số hội viên' : 'Tổng số thành viên', String(rows.length)),
    vStat('check', 'Đang sinh hoạt', String(rows.filter((m) => m.status === 'active').length)),
    vStat('minus', 'Ngừng sinh hoạt', String(rows.filter((m) => m.status === 'stopped').length)),
    vStat('user', branch ? 'Ban lãnh đạo chi hội' : 'Ban chủ nhiệm', String(leaders)),
  ].join('');
};
// Số trên menu trái: số thành viên đội, CLB · số hội viên chi hội
const updateUnitCounts = () => {
  document.querySelector('[data-count="clubs"]').textContent = CLUB_MEMBERS.filter((m) => m.unit === MY_UNITS.club).length;
  document.querySelector('[data-count="branch"]').textContent = CLUB_MEMBERS.filter((m) => m.unit === MY_UNITS.branch).length;
};

// ---------- Thông tin đơn vị (thanh thông báo xanh), 2 dòng: tên (đậm) / Lĩnh vực hoạt động (đội, CLB) hoặc Loại chi hội · Đơn vị quản lý · Mã đơn vị · Ngày thành lập ----------
const renderClubInfo = () => {
  const u = club.unit;
  const first = u.kind === 'branch' ? ['Loại chi hội', u.branchKind] : ['Lĩnh vực hoạt động', u.fields.join(', ')];
  document.querySelector('#club-info').innerHTML = `<b>${escapeHtml(u.name)}</b><br />${[first, ['Đơn vị quản lý', u.manager], ['Mã đơn vị', u.code], ['Ngày thành lập', viDate(u.founded)]]
    .map(([k, v]) => `${k}: ${escapeHtml(v)}`).join(' · ')}`;
};
// Tab chung: Danh sách thành viên · Hồ sơ gia nhập
const setClubTab = (tab) => {
  club.tab = tab;
  document.querySelector('#club-members').hidden = tab !== 'members';
  document.querySelector('#club-joins').hidden = tab !== 'joins';
};

// ---------- Bảng thành viên: nút Chuyển ngừng sinh hoạt (kiểu nút thao tác trên dòng Đăng ký hồ sơ) chỉ trên dòng Đang sinh hoạt, không phải dòng của chính người dùng (BR-16) ----------
const memberRow = (m, index) => {
  const st = MEMBER_STATUS[m.status];
  return `<tr>
    ${rowIndex(index)}
    <td class="pf-col-date">${m.card}</td>
    <td>
      <div class="pf-cell-stack">
        <span class="pf-cell-title"><span class="pf-clamp-1" data-tip>${escapeHtml(m.name)}</span></span>
        <span class="pf-cell-line is-muted">${m.identity}</span>
      </div>
    </td>
    <td>${m.role}</td>
    <td>${m.gender}</td>
    <td class="pf-col-date">${m.year}</td>
    <td class="pf-col-date">${m.phone}</td>
    <td>${escapeHtml(unitMode().extraOf(m))}</td>
    <td class="pf-col-date">${viDate(m.joined)}</td>
    <td><span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span></td>
    <td class="pf-col-actions"><div class="pf-row-actions">${m.status === 'active' && !m.self ? `<button class="pf-icon-btn is-danger" type="button" data-stop="${m.id}" aria-label="Chuyển ngừng sinh hoạt ${escapeHtml(m.name)}" title="Chuyển ngừng sinh hoạt">${icon('minus')}</button>` : ''}</div></td>
  </tr>`;
};
const memberTable = createTable({
  rows: CLUB_MEMBERS,
  body: document.querySelector('#cm-rows'),
  empty: document.querySelector('#cm-empty'),
  pager: document.querySelector('#cm-pager'),
  range: document.querySelector('#cm-range'),
  renderRow: memberRow,
  perPage: 50,
  perPageOptions: [50, 100],
});
const applyMemberFilter = () => {
  const query = fold(club.mSearch.value.trim());
  memberTable.setFilter((m) => m.unit === club.unit
    && (!query || fold(`${m.name} ${m.card} ${m.identity} ${m.phone}`).includes(query))
    && (!club.mRole.value || m.role === club.mRole.value)
    && (!club.mBlood.value || unitMode().extraOf(m) === club.mBlood.value)
    && (!club.mStatus.value || m.status === club.mStatus.value));
  countMemberFilters();
};

// ---------- Bảng hồ sơ gia nhập: tên + “Mã: …” như bảng Đăng ký hồ sơ · tên / Xem mở trang xử lý · Người xử lý gần nhất (hồ sơ Mới: “—”) ----------
// Không có cột Trạng thái: bảng chỉ hiện trong tab trạng thái (Mới … Đã từ chối), mỗi tab 1 trạng thái
const joinRow = (a, index) => {
  const view = `#${unitMode().route}/ho-so/${encodeURIComponent(a.code)}`;
  return `<tr>
    ${rowIndex(index)}
    <td>
      <div class="pf-cell-stack">
        <a class="pf-cell-title" href="${view}"><span class="pf-clamp-1" data-tip>${escapeHtml(a.name)}</span></a>
        <span class="pf-cell-line is-muted">Mã: ${a.code}</span>
      </div>
    </td>
    <td class="pf-col-date">${a.identity}</td>
    <td class="pf-col-date">${a.year}</td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(unitMode().joinExtraOf(a))}</span></td>
    <td class="pf-col-date">${viDate(a.times.new.slice(0, 10))}</td>
    <td>${a.handler ? `<span class="pf-clamp-2" data-tip>${escapeHtml(a.handler)}</span>` : '—'}</td>
    <td class="pf-col-actions"><div class="pf-row-actions"><a class="pf-icon-btn" href="${view}" aria-label="Xem hồ sơ ${a.code}">${icon('eye')}</a></div></td>
  </tr>`;
};
const joinTable = createTable({
  rows: CLUB_JOINS,
  body: document.querySelector('#cj-rows'),
  empty: document.querySelector('#cj-empty'),
  pager: document.querySelector('#cj-pager'),
  range: document.querySelector('#cj-range'),
  renderRow: joinRow,
  perPage: 50,
  perPageOptions: [50, 100],
});
// Hồ sơ thuộc tab trạng thái đang xem
const inJoinTab = (a) => a.status === club.jTab;
const applyJoinFilter = () => {
  const query = fold(club.jSearch.value.trim());
  document.querySelector('#cj-empty').textContent = unitJoins().length ? 'Không có hồ sơ phù hợp điều kiện tìm kiếm.' : 'Chưa có hồ sơ gia nhập.';
  joinTable.setFilter((a) => a.unit === club.unit
    && (!query || fold(`${a.code} ${a.name} ${a.identity}`).includes(query))
    && inJoinTab(a)
    && createdWithin(a.times.new.slice(0, 10), club.jTime.value));
  countJoinFilters();
};
// Dựng lại màn (sau khi xử lý hồ sơ / chuyển ngừng sinh hoạt); số trên tab chung cập nhật khi màn đang mở
const renderClub = () => {
  renderClubInfo();
  applyMemberFilter();
  applyJoinFilter();
  setClubTab(club.tab);
  renderMemberStats();
  updateUnitCounts();
  if (!document.querySelector('#screen-doi-clb').hidden) renderTabs('doi-clb', club.tab === 'joins' ? club.jTab : '');
};
club.mSearch.addEventListener('input', applyMemberFilter);
memberFilters.forEach((el) => el.addEventListener('change', applyMemberFilter));
document.querySelector('#cm-reset').addEventListener('click', () => { memberFilters.forEach((el) => { el.value = ''; }); applyMemberFilter(); });
club.jSearch.addEventListener('input', applyJoinFilter);
joinFilters.forEach((el) => el.addEventListener('change', applyJoinFilter));
document.querySelector('#cj-reset').addEventListener('click', () => { joinFilters.forEach((el) => { el.value = ''; }); applyJoinFilter(); });

// ---------- Xuất danh sách: các dòng theo bộ lọc hiện tại, đủ cột của bảng (trừ Thao tác) — Danh-sach-thanh-vien_ / Danh-sach-hoi-vien_[Mã đơn vị]_[ddmmyyyy] ----------
document.querySelector('#club-export').addEventListener('click', () => {
  const rows = memberTable.shownRows();
  const d = new Date();
  const m = unitMode();
  downloadCsv(
    ['STT', m.codeLabel, 'Họ và tên', 'Chức vụ', 'Giới tính', 'Năm sinh', 'Số định danh cá nhân', 'Điện thoại', m.extraLabel, m.dateLabel, 'Trạng thái sinh hoạt'],
    rows.map((r, i) => [i + 1, r.card, r.name, r.role, r.gender, r.year, r.identity, r.phone, m.extraOf(r), viDate(r.joined), MEMBER_STATUS[r.status].label]),
    `${m.exportName}_${club.unit.code}_${pad2(d.getDate())}${pad2(d.getMonth() + 1)}${d.getFullYear()}.csv`,
  );
  showToast('Xuất danh sách thành công');
});

// ---------- Chuyển ngừng sinh hoạt (hộp xác nhận dùng chung kiểu .pf-confirm): Họ và tên · Số thẻ / Mã hội viên · Chức vụ · Lý do (bắt buộc, tối đa 500 ký tự) ----------
// Xác nhận → Ngừng sinh hoạt (đội, CLB: phân đoạn cuối Số thẻ thành 0 · chi hội: Mã hội viên giữ nguyên), cập nhật ô số liệu
const stopDialog = document.querySelector('#pf-stop');
const stopReason = document.querySelector('#pf-stop-reason');
const stopField = document.querySelector('#pf-stop-field');
let stopTarget = null;
const openStop = (m) => {
  stopTarget = m;
  document.querySelector('#pf-stop-kv').innerHTML = [['Họ và tên', `<b>${escapeHtml(m.name)}</b>`], [unitMode().codeLabel, m.card], ['Chức vụ', m.role]]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  stopReason.value = '';
  stopField.classList.remove('is-invalid');
  stopDialog.showModal();
  stopReason.focus();
};
document.querySelector('#cm-rows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-stop]');
  if (button) openStop(CLUB_MEMBERS.find((m) => m.id === button.dataset.stop));
});
stopDialog.querySelector('[data-stop-cancel]').addEventListener('click', () => stopDialog.close());
stopReason.addEventListener('input', () => { if (stopReason.value.trim()) stopField.classList.remove('is-invalid'); });
stopDialog.querySelector('[data-stop-ok]').addEventListener('click', () => {
  const reason = stopReason.value.trim();
  if (!reason) { stopField.classList.add('is-invalid'); stopReason.focus(); return; }
  stopMember(stopTarget, reason);
  stopDialog.close();
  CLUB_MEMBERS.sort(memberSort);
  renderClub();
  showToast(`Đã chuyển ${stopTarget.name} sang Ngừng sinh hoạt`);
});
// ==================== END SECTION: ĐỘI, CÂU LẠC BỘ CỦA TÔI ====================

// ==================== SECTION: XỬ LÝ HỒ SƠ GIA NHẬP ĐỘI, CLB — modal phải mở chồng lên Chi tiết đội, CLB: Tiếp nhận (CD-04c) · Xác minh (CD-04d) · Phê duyệt kết nạp (CD-04e) ====================
// Khung modal Xem chi tiết hồ sơ đội, CLB; thân: trái 4 khối nội dung (kiểu Xem chi tiết hồ sơ gia nhập)
// · phải khối thao tác theo trạng thái (kiểu phần biểu mẫu Đăng ký) + Tiến trình xử lý (dòng thời gian); trạng thái kết thúc → khối kết quả chỉ đọc.
// Mỗi lần chuyển trạng thái bắt buộc có Trả lời người nộp hồ sơ (mẫu điền sẵn theo lựa chọn; đã sửa nội dung thì hỏi trước khi thay mẫu).
const REASON_HOLE = '[nêu rõ lý do]';
const FIX_HOLE = '[nêu rõ nội dung cần bổ sung]';
const HS_SUBMIT = {
  accept: 'Tiếp nhận và gửi trả lời',
  reject: 'Từ chối và gửi trả lời',
  pass: 'Xác nhận đủ điều kiện và gửi trả lời',
  fail: 'Từ chối và gửi trả lời',
  admit: 'Phê duyệt kết nạp và gửi trả lời',
};
// Bước đang chờ (hiện đầu Tiến trình xử lý, chưa có ngày)
const HS_WAIT = { new: 'Chờ tiếp nhận', received: 'Chờ xác minh', eligible: 'Chờ phê duyệt kết nạp' };
const hs = { app: null, decision: '', template: '' };
// Người nộp đã là hội viên / thành viên Đang sinh hoạt của chính đơn vị (theo Số định danh cá nhân) — BR-04
const isUnitMember = (a) => CLUB_MEMBERS.some((m) => m.unit === a.unit && m.status === 'active' && m.identity === a.identity);
// Nhãn nút gửi theo loại đơn vị: chi hội — Chưa phù hợp là Trả hồ sơ (đặc tả 8)
const submitLabel = (decision) => (hs.app && hs.app.unit.kind === 'branch' && decision === 'fail' ? 'Trả hồ sơ và gửi trả lời' : HS_SUBMIT[decision]);
const clubKind = (u) => (u.kind === 'branch' ? 'Chi hội' : /^Câu lạc bộ/.test(u.name) ? 'Câu lạc bộ' : 'Đội');
// Số thẻ khi kết nạp: đã có số thẻ cùng (tỉnh, xã) → giữ STT; chưa có → STT tiếp theo của bộ đếm (BR-11)
const admitCard = (a) => {
  const u = a.unit;
  // Chi hội: Mã hội viên theo Loại hội viên đang chọn ở khối Phê duyệt (mặc định theo hồ sơ)
  if (u.kind === 'branch') return admitCode(a, (document.querySelector('#hs-type') || {}).value || a.memberType);
  const prefix = `${u.prov}.${u.ward}.TNV.`;
  if (a.current && a.current.card.startsWith(prefix)) return tnvCard(u, cardStt(a.current.card));
  return tnvCard(u, Math.max(0, ...CLUB_MEMBERS.filter((m) => m.card.startsWith(prefix)).map((m) => cardStt(m.card))) + 1);
};
// Mẫu trả lời (đặc tả 7.2, 8.1, 9.1 chi hội · 9.2 đội, CLB) — danh xưng bà/ông theo giới tính
const replyTemplate = (a, decision) => {
  const title = a.gender === 'Nữ' ? 'bà' : 'ông';
  const u = a.unit;
  const Title = `${title.charAt(0).toUpperCase()}${title.slice(1)}`;
  const branchBody = {
    accept: () => `${u.name} đã tiếp nhận hồ sơ ${a.code}. Ban lãnh đạo chi hội sẽ liên hệ để xác minh.`,
    pass: () => `Hồ sơ ${a.code} đã được xác minh và đủ điều kiện gia nhập ${u.name}. Chi hội sẽ thông báo khi hoàn tất kết nạp.`,
    admit: () => `${Title} đã được kết nạp vào ${u.name} từ ngày ${document.querySelector('#hs-date-text').value} với mã hội viên ${admitCard(a)}.${a.current ? ` Sinh hoạt tại ${a.current.name} đã được chuyển sang chi hội mới.` : ''}`,
  };
  if (u.kind === 'branch' && branchBody[decision]) return `Kính gửi ${title} ${a.name},\n${branchBody[decision]()}`;
  const body = {
    accept: () => `${u.name} đã tiếp nhận hồ sơ ${a.code}. Ban chủ nhiệm sẽ liên hệ để xác minh.`,
    reject: () => `Hồ sơ ${a.code} không được tiếp nhận vì: ${REASON_HOLE}.`,
    pass: () => `Hồ sơ ${a.code} đã được xác minh và đủ điều kiện gia nhập ${u.name}. ${clubKind(u)} sẽ thông báo khi hoàn tất kết nạp.`,
    fail: () => `Hồ sơ ${a.code} chưa đáp ứng yêu cầu: ${FIX_HOLE}. Vui lòng hoàn thiện và nộp hồ sơ mới.`,
    admit: () => `${title.charAt(0).toUpperCase()}${title.slice(1)} đã được kết nạp vào ${u.name} từ ngày ${document.querySelector('#hs-date-text').value}, số thẻ tình nguyện viên ${admitCard(a)}.${a.current ? ` Sinh hoạt tại ${a.current.name} đã được chuyển sang ${clubKind(u).toLowerCase()}.` : ''}`,
  }[decision];
  return `Kính gửi ${title} ${a.name},\n${body()}`;
};

// ---------- Ô nhập (kiểu biểu mẫu Đăng ký / Thông tin cá nhân): lựa chọn · ngày dd/mm/yyyy · ô khóa · Trả lời người nộp hồ sơ · nút gửi ----------
const hsSection = (id, title, body) => `<section class="pf-reg-section" id="${id}" aria-labelledby="${id}-title"><div class="pf-reg-section-head"><h3 id="${id}-title">${title}</h3></div><div class="pf-fields">${body}</div></section>`;
// options: [value, nhãn, khóa?] · checked: giá trị chọn sẵn (mặc định lựa chọn đầu)
const hsChoice = (label, options, checked = options[0][0]) => `<div class="pf-field is-wide" role="radiogroup" aria-labelledby="hs-choice-label"><span class="pf-label" id="hs-choice-label">${label}<span class="pf-req" aria-hidden="true">*</span></span>
  <div class="pf-radio-group">${options.map(([value, text, off]) => `<label class="pf-radio"><input type="radio" name="hs-decision" value="${value}"${value === checked ? ' checked' : ''}${off ? ' disabled' : ''} />${text}</label>`).join('')}</div></div>`;
const hsDate = (label) => `<div class="pf-field is-wide" id="hs-date-field"><label for="hs-date-text">${label}<span class="pf-req" aria-hidden="true">*</span></label>
  <div class="pf-control pf-date" data-vi-date><input type="text" id="hs-date-text" inputmode="numeric" maxlength="10" placeholder="dd/mm/yyyy" autocomplete="off" value="${viDate(isoToday())}" aria-describedby="hs-date-error" /><input class="pf-date-native" type="date" id="hs-date" tabindex="-1" aria-hidden="true" value="${isoToday()}" /><button class="pf-date-btn" type="button" aria-label="Chọn ngày — ${label.toLowerCase()}">${icon('calendar')}</button></div>
  <p class="pf-field-error" id="hs-date-error">${icon('alert')}<span></span></p></div>`;
const hsLocked = (id, label, value) => `<div class="pf-field is-wide"><label for="${id}">${label}</label><div class="pf-control is-locked"><input type="text" id="${id}" value="${escapeHtml(value)}" readonly />${icon('shield', 'icon pf-lock')}</div></div>`;
const hsReply = () => `<div class="pf-field is-wide" id="hs-reply-field"><label for="hs-reply">Trả lời người nộp hồ sơ<span class="pf-req" aria-hidden="true">*</span></label>
  <div class="pf-control"><textarea id="hs-reply" rows="7" maxlength="2000" aria-describedby="hs-reply-error"></textarea></div>
  <p class="pf-field-error" id="hs-reply-error">${icon('alert')}<span></span></p></div>`;
const hsSubmit = () => '<div class="pf-field is-wide"><button class="pf-btn pf-btn-green" type="button" data-hs-submit></button></div>';
const hsSelect = (id, label, options, value) => `<div class="pf-field is-wide"><label for="${id}">${label}<span class="pf-req" aria-hidden="true">*</span></label>
  <div class="pf-control is-select"><select id="${id}">${options.map((o) => `<option${o === value ? ' selected' : ''}>${o}</option>`).join('')}</select>${icon('chevron-down', 'icon pf-caret')}</div></div>`;
// Dòng kết quả: ✓ đạt (chữ xanh) · ⚠ cần lưu ý (không chặn tiếp nhận)
const hsCheck = (ok, text, fail = false) => `<p class="pf-help${ok ? ' is-ok' : fail ? ' is-fail' : ''}">${icon(ok ? 'check' : fail ? 'alert' : 'warning')}<span>${escapeHtml(text)}</span></p>`;

// ---------- Khối thao tác theo trạng thái ----------
const hsActionCard = (a) => {
  const u = a.unit;
  const branch = u.kind === 'branch';
  if (a.status === 'new') {
    // Kiểm tra dữ liệu tự động (đặc tả 7.1): Hội viên [chi hội] / Thành viên [đội, CLB] · Sinh hoạt hiện tại theo Mã hội viên / Số thẻ
    const role = branch ? 'hội viên' : 'thành viên';
    const member = isUnitMember(a);
    const checks = [
      hsCheck(true, 'Số định danh cá nhân: Đã định danh trên VNeID'),
      hsCheck(!a.other, `Hồ sơ gia nhập khác đang xử lý: ${a.other ? `Có: ${a.other.code} – ${a.other.unit} – ${a.other.status}` : 'Không có'}`),
      // BR-04: đã là hội viên / thành viên Đang sinh hoạt của chính đơn vị → ✗ đỏ, chỉ cho Từ chối
      hsCheck(!member, `${branch ? 'Hội viên' : 'Thành viên'} ${u.name}: ${member ? 'Đã' : 'Chưa'} là ${role} của ${u.name}`, member),
      hsCheck(!a.current, `Sinh hoạt hiện tại: ${a.current ? `Đang là ${role} ${a.current.name} · ${a.current.card}` : `Chưa sinh hoạt tại ${branch ? 'chi hội' : 'đội, câu lạc bộ'} nào`}`),
    ];
    return hsSection('hs-act', 'Tiếp nhận hồ sơ', `<div class="pf-field is-wide"><span class="pf-label">Kiểm tra dữ liệu</span>${checks.join('')}</div>
      ${hsChoice('Kết luận', [['accept', 'Tiếp nhận', member], ['reject', 'Từ chối']], member ? 'reject' : 'accept')}${hsReply()}${hsSubmit()}`);
  }
  if (a.status === 'received') {
    return hsSection('hs-act', 'Xác minh hồ sơ', `<div class="pf-field is-wide"><label for="hs-method">Hình thức xác minh<span class="pf-req" aria-hidden="true">*</span></label>
      <div class="pf-control is-select"><select id="hs-method"><option>Gặp trực tiếp</option><option>Gọi điện thoại</option><option>Tham gia sinh hoạt thử</option></select>${icon('chevron-down', 'icon pf-caret')}</div></div>
      ${hsDate('Ngày xác minh')}${hsChoice('Kết quả', [['pass', 'Phù hợp'], ['fail', 'Chưa phù hợp']])}${hsReply()}${hsSubmit()}`);
  }
  if (a.status === 'eligible' && branch) {
    // Chi hội (CD-02e): Loại hội viên (mặc định theo hồ sơ) · Ngày kết nạp · Mã hội viên hiện tại (khi đang là hội viên chi hội khác) · Mã hội viên tạm tính · Chuyển sinh hoạt
    return hsSection('hs-act', 'Phê duyệt kết nạp hội viên', `${hsSelect('hs-type', 'Loại hội viên', MEMBER_TYPES, a.memberType)}${hsDate('Ngày kết nạp')}
      ${a.current ? hsLocked('hs-card-now', 'Mã hội viên hiện tại', a.current.card) : ''}${hsLocked('hs-card', 'Mã hội viên', admitCard(a))}
      ${a.current ? `<div class="pf-field is-wide">${hsCheck(true, `Chuyển sinh hoạt: Từ ${a.current.name} sang ${u.name}`)}</div>` : ''}${hsReply()}${hsSubmit()}`);
  }
  if (a.status === 'eligible') {
    // Chỉ có Phê duyệt kết nạp (không có Từ chối); Chức vụ cố định Thành viên; Số thẻ tạm tính, cấp chính thức khi phê duyệt
    return hsSection('hs-act', 'Phê duyệt kết nạp thành viên', `${hsLocked('hs-role', 'Chức vụ trong đội, câu lạc bộ', 'Thành viên')}${hsDate('Ngày kết nạp')}
      ${a.current ? hsLocked('hs-card-now', 'Số thẻ tình nguyện viên hiện tại', a.current.card) : ''}${hsLocked('hs-card', 'Số thẻ tình nguyện viên', admitCard(a))}
      ${a.current ? `<div class="pf-field is-wide">${hsCheck(true, `Chuyển sinh hoạt: Từ ${a.current.name} sang ${u.name}`)}</div>` : ''}${hsReply()}${hsSubmit()}`);
  }
  const result = {
    admitted: hsCheck(true, branch ? `Đã kết nạp hội viên – Mã hội viên: ${a.admit?.card}` : `Đã kết nạp thành viên – Số thẻ tình nguyện viên: ${a.admit?.card}`),
    returned: hsCheck(false, 'Đã trả hồ sơ cho người nộp'),
    rejected: hsCheck(false, 'Đã từ chối hồ sơ'),
  }[a.status];
  return hsSection('hs-act', 'Kết quả xử lý', `<div class="pf-field is-wide">${result}<p class="pf-help">Trả lời đã được gửi đến người nộp qua hệ thống.</p></div>`);
};
// Đổi lựa chọn: nạp lại mẫu trả lời, đổi nhãn nút gửi (mọi nút gửi trong xử lý hồ sơ màu xanh lá .pf-btn-green)
const setHsDecision = (decision, { fill = true } = {}) => {
  hs.decision = decision;
  const button = document.querySelector('[data-hs-submit]');
  button.textContent = submitLabel(decision);
  if (!fill) return;
  hs.template = replyTemplate(hs.app, decision);
  document.querySelector('#hs-reply').value = hs.template;
  document.querySelector('#hs-reply-field').classList.remove('is-invalid');
};

// ---------- Dựng modal ----------
const renderJoinApp = (code) => {
  const a = findJoinApp(code);
  const title = document.querySelector('#hs-title');
  const sub = document.querySelector('#hs-sub');
  const body = document.querySelector('#hs-body');
  hs.app = a || null;
  if (!a) {
    title.textContent = 'Không tìm thấy hồ sơ';
    sub.textContent = `Mã “${code}” không thuộc ${unitMode().kindWord} bạn đang quản lý.`;
    body.innerHTML = '<div class="pf-card pf-empty">Hồ sơ có thể đã bị xóa hoặc bạn không còn quyền xử lý.</div>';
    return;
  }
  const u = a.unit;
  setUnitMode(u.kind === 'branch' ? 'branch' : 'club');
  const st = VOL_STATUS[a.status];
  title.textContent = `Hồ sơ gia nhập: ${a.name}`;
  const dot = '<span aria-hidden="true">•</span>';
  sub.innerHTML = `<span>Mã hồ sơ: <b>${a.code}</b></span>${dot}<span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span>${dot}<span>Nộp: ${atText(a.times.new)}</span>${dot}<span>Nơi xử lý: ${escapeHtml(`${unitMode().handlers} ${u.name}`)}</span>`;
  // Tiến trình xử lý: mới nhất lên đầu, bước đang chờ (chưa có ngày) ở trên cùng
  const steps = a.history.map((h) => ({ date: h.at.slice(0, 10), title: h.title, meta: `${h.at.slice(11)} · ${h.by}`, cls: h.cls }));
  if (HS_WAIT[a.status]) steps.push({ title: HS_WAIT[a.status], meta: `${unitMode().handlers} ${u.name}`, cls: 'is-upcoming' });
  // Khối 2 · 3 · 4 theo loại đơn vị: chi hội có Loại hội viên, Loại chi hội, Cam kết theo Điều lệ (CD-02c…e)
  const branch = u.kind === 'branch';
  const info = branch
    ? vCard('hs-volunteer', '2. Thông tin hội viên', vKvs([vKv('Loại hội viên', vText(a.memberType)), vKv('Lĩnh vực hoạt động', vText(a.field)), vKv('Kỹ năng', vTags(a.skills))]))
    : vCard('hs-volunteer', '2. Thông tin tình nguyện viên', vKvs([vKv('Lĩnh vực hoạt động', vText(a.field)), vKv('Kỹ năng', vTags(a.skills))]));
  const target = branch
    ? vCard('hs-club', '3. Chi hội đăng ký gia nhập', vKvs([vKv('Tỉnh/Thành phố', 'Tỉnh Hà Tĩnh'), vKv('Phường/xã', vText(u.wardName)), vKv('Đơn vị quản lý', vText(u.manager)), vKv('Loại chi hội', vText(u.branchKind)), vKv('Chi hội', vText(u.name))]))
    : vCard('hs-club', '3. Đội, câu lạc bộ đăng ký gia nhập', vKvs([vKv('Tỉnh/Thành phố', 'Tỉnh Hà Tĩnh'), vKv('Phường/xã', vText(u.wardName)), vKv('Đơn vị quản lý', vText(u.manager)), vKv('Đội, câu lạc bộ', vText(u.name))]));
  body.innerHTML = `
    <div class="pf-detail-grid">
      <div class="pf-detail-main">
        ${vCard('hs-person', '1. Thông tin cá nhân', vKvs([vKv('Họ và tên', vText(a.name)), vKv('Số định danh cá nhân', a.identity), vKv('Giới tính', a.gender), vKv('Năm sinh', a.year), vKv('Điện thoại', a.phone), vKv('Nhóm máu', a.blood)]))}
        ${info}
        ${target}
        ${vCard('hs-commit', '4. Cam kết', vKvs([vKv(branch ? 'Cam kết theo Điều lệ' : 'Cam kết theo Điều lệ, Quy chế', 'Đã đồng ý'), vKv('Xử lý dữ liệu cá nhân', 'Đã đồng ý'), vKv('Xác nhận', `Bằng tài khoản định danh · ${atText(a.times.new)}`)]))}
      </div>
      <aside class="pf-detail-side">
        ${hsActionCard(a)}
        ${hsSection('hs-progress', 'Tiến trình xử lý', `<div class="pf-field is-wide">${timeline(steps.reverse())}</div>`)}
      </aside>
    </div>`;
  const first = { new: isUnitMember(a) ? 'reject' : 'accept', received: 'pass', eligible: 'admit' }[a.status];
  if (first) setHsDecision(first);
};

// ---------- Đổi Kết luận / Kết quả: hỏi trước khi thay nội dung trả lời đã sửa · đổi Ngày kết nạp: cập nhật mẫu nếu chưa sửa ----------
const hsBody = document.querySelector('#hs-body');
hsBody.addEventListener('change', async (event) => {
  const reply = document.querySelector('#hs-reply');
  if (event.target.name === 'hs-decision') {
    const edited = reply.value.trim() !== hs.template.trim();
    const replace = !edited || await confirmAction({ title: 'Thay nội dung trả lời', text: 'Nội dung trả lời đã được chỉnh sửa. Bạn có muốn thay bằng mẫu trả lời mới?', ok: 'Thay mẫu' });
    setHsDecision(event.target.value, { fill: replace });
  }
  // Đổi Loại hội viên (chi hội): tính lại Mã hội viên tạm tính
  if (event.target.id === 'hs-type') document.querySelector('#hs-card').value = admitCard(hs.app);
  if (['hs-date', 'hs-type'].includes(event.target.id) && hs.decision === 'admit' && reply.value.trim() === hs.template.trim()) setHsDecision('admit');
});
hsBody.addEventListener('input', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.value.trim()) field.classList.remove('is-invalid');
});

// ---------- Gửi: kiểm tra dữ liệu · xác nhận (Từ chối, Phê duyệt kết nạp) · chuyển trạng thái, ghi Tiến trình, gửi trả lời ----------
const hsError = (fieldId, message) => {
  const field = document.getElementById(fieldId);
  field.classList.toggle('is-invalid', Boolean(message));
  if (message) field.querySelector('.pf-field-error span').textContent = message;
  return Boolean(message);
};
hsBody.addEventListener('click', async (event) => {
  if (!event.target.closest('[data-hs-submit]')) return;
  const a = hs.app;
  const u = a.unit;
  const d = hs.decision;
  const reply = document.querySelector('#hs-reply').value.trim();
  const invalid = [];
  // Ngày xác minh: từ ngày tiếp nhận đến hôm nay · Ngày kết nạp: từ ngày nộp đến hôm nay
  const dateText = document.querySelector('#hs-date-text');
  const dateIso = dateText ? viToIso(dateText.value) : '';
  const [from, dateMessage] = d === 'admit' ? [a.times.new, 'Ngày kết nạp phải từ ngày nộp hồ sơ đến ngày hiện tại'] : [a.times.received, 'Ngày xác minh phải từ ngày tiếp nhận đến ngày hiện tại'];
  if (dateText && hsError('hs-date-field', !dateIso || dateIso < from.slice(0, 10) || dateIso > isoToday() ? dateMessage : '')) invalid.push('#hs-date-text');
  if (hsError('hs-reply-field', !reply ? 'Vui lòng nhập nội dung trả lời người nộp hồ sơ'
    : (d === 'reject' && reply.includes(REASON_HOLE)) || (d === 'fail' && reply.includes(FIX_HOLE)) ? 'Vui lòng nêu rõ lý do trong nội dung trả lời' : '')) invalid.push('#hs-reply');
  if (invalid.length) { document.querySelector(invalid[0]).focus(); return; }
  // BR-04: người nộp đã là hội viên / thành viên Đang sinh hoạt của chính đơn vị → không tiếp nhận, không kết nạp (hồ sơ giữ trạng thái)
  if (['accept', 'admit'].includes(d) && isUnitMember(a)) { showToast(`${a.name} đã là ${u.kind === 'branch' ? 'hội viên' : 'thành viên'} của ${u.name}, không thể ${d === 'admit' ? 'kết nạp' : 'tiếp nhận'}`, 'error'); return; }
  const returnBranch = u.kind === 'branch' && d === 'fail';
  const ask = {
    reject: { title: 'Từ chối hồ sơ', text: `Bạn có chắc chắn muốn từ chối hồ sơ ${a.code}?`, ok: 'Từ chối' },
    fail: returnBranch ? { title: 'Trả hồ sơ', text: `Bạn có chắc chắn muốn trả hồ sơ ${a.code} cho người nộp?`, ok: 'Trả hồ sơ' } : { title: 'Từ chối hồ sơ', text: `Bạn có chắc chắn muốn từ chối hồ sơ ${a.code}?`, ok: 'Từ chối' },
    admit: { title: 'Phê duyệt kết nạp', text: `Xác nhận kết nạp ${a.name} vào ${u.name}?${a.current ? ` Sinh hoạt tại ${a.current.name} sẽ được chuyển sang Ngừng sinh hoạt.` : ''}`, ok: 'Xác nhận' },
  }[d];
  if (ask && !(await confirmAction(ask))) return;
  const me = CLUB_MEMBERS.find((m) => m.unit === u && m.self);
  const at = nowAt();
  const log = (status, key, title, cls = '') => {
    a.status = status;
    a.times[key] = at;
    a.handler = me.name;
    a.history.push({ at, title, by: `${me.name} (${me.role})`, cls });
  };
  if (d === 'accept') {
    log('received', 'received', 'Tiếp nhận hồ sơ');
    showToast('Đã tiếp nhận hồ sơ và gửi trả lời đến người nộp');
  } else if (d === 'reject') {
    log('rejected', 'closed', 'Từ chối hồ sơ', 'is-alert');
    showToast('Đã từ chối hồ sơ và gửi trả lời đến người nộp');
  } else if (d === 'pass') {
    a.verify = { method: document.querySelector('#hs-method').value, date: dateIso };
    log('eligible', 'eligible', 'Xác minh: phù hợp');
    showToast('Đã xác nhận hồ sơ đủ điều kiện và gửi trả lời đến người nộp');
  } else if (returnBranch) {
    a.verify = { method: document.querySelector('#hs-method').value, date: dateIso };
    log('returned', 'closed', 'Trả hồ sơ cho người nộp', 'is-alert');
    showToast('Đã trả hồ sơ và gửi trả lời đến người nộp');
  } else if (d === 'fail') {
    a.verify = { method: document.querySelector('#hs-method').value, date: dateIso };
    log('rejected', 'closed', 'Xác minh: chưa phù hợp — từ chối hồ sơ', 'is-alert');
    showToast('Đã từ chối hồ sơ và gửi trả lời đến người nộp');
  } else if (u.kind === 'branch') {
    // Kết nạp hội viên: cấp Mã hội viên, thêm vào danh sách hội viên (Hội viên · Loại hội viên · Ngày kết nạp · Đang sinh hoạt)
    const type = document.querySelector('#hs-type').value;
    const card = admitCard(a);
    a.admit = { date: dateIso, card, type };
    log('admitted', 'admitted', 'Phê duyệt kết nạp');
    CLUB_MEMBERS.push({ id: `${a.code}-M`, unit: u, name: a.name, role: 'Hội viên', gender: a.gender, year: a.year, identity: a.identity, phone: a.phone, blood: a.blood, memberType: type, card, joined: dateIso, status: 'active' });
    CLUB_MEMBERS.sort(memberSort);
    showToast(`Đã kết nạp hội viên. Mã hội viên: ${card}`);
  } else {
    // Kết nạp: cấp Số thẻ, thêm vào danh sách thành viên (Thành viên · Ngày tham gia = Ngày kết nạp · Đang sinh hoạt)
    const card = admitCard(a);
    a.admit = { date: dateIso, card };
    log('admitted', 'admitted', 'Phê duyệt kết nạp');
    CLUB_MEMBERS.push({ id: `${a.code}-M`, unit: u, name: a.name, role: 'Thành viên', gender: a.gender, year: a.year, identity: a.identity, phone: a.phone, blood: a.blood, card, joined: dateIso, status: 'active' });
    CLUB_MEMBERS.sort(memberSort);
    showToast(`Đã kết nạp thành viên. Số thẻ tình nguyện viên: ${card}`);
  }
  a.replies = [...(a.replies || []), { at, text: reply }];
  renderJoinApp(a.code);
  renderClub();
  document.querySelector('#hs-act').scrollIntoView({ block: 'nearest' });
});
// ---------- Mở / đóng modal xử lý hồ sơ (như modal Xem chi tiết hồ sơ đội, CLB): trượt vào, khóa cuộn trang, Esc đóng, Tab xoay vòng trong modal; đóng thì về tab Hồ sơ gia nhập ----------
const joinProcessEl = document.querySelector('#pf-join-process');
const slideTimers = new Map();
const isSlideOpen = (el) => !el.hidden && el.classList.contains('is-open');
const openSlide = (el) => {
  if (isSlideOpen(el)) return false;
  const panel = el.querySelector('.pf-reg-panel');
  clearTimeout(slideTimers.get(el));
  el.slideTrigger = document.activeElement;
  el.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  void el.offsetWidth; // tính lại bố cục để hiệu ứng trượt chạy
  el.classList.add('is-open');
  panel.tabIndex = -1;
  panel.focus({ preventScroll: true });
  return true;
};
const closeSlide = (el) => {
  if (el.hidden) return false;
  el.classList.remove('is-open');
  slideTimers.set(el, setTimeout(() => { el.hidden = true; }, viewReduced() ? 0 : 300));
  document.documentElement.classList.remove('pf-reg-lock');
  if (el.slideTrigger && document.contains(el.slideTrigger)) el.slideTrigger.focus();
  return true;
};
function openJoinProcess(code) {
  renderJoinApp(code);
  if (openSlide(joinProcessEl)) document.querySelector('#hs-body').scrollTop = 0;
}
function closeJoinProcess(updateHash = true) {
  if (closeSlide(joinProcessEl) && updateHash && hs.app) history.replaceState(null, '', `#${unitMode().route}/${VOL_STATUS[club.jTab].slug}`);
}
joinProcessEl.querySelectorAll('[data-close-join-process]').forEach((button) => button.addEventListener('click', () => closeJoinProcess()));
document.addEventListener('keydown', (event) => {
  const top = isSlideOpen(joinProcessEl) ? joinProcessEl : null;
  if (!top || document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape') { closeJoinProcess(); return; }
  if (event.key !== 'Tab') return;
  const panel = top.querySelector('.pf-reg-panel');
  const items = [...panel.querySelectorAll('a[href], button:not([disabled]), input:not(.pf-date-native), select, textarea')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
// ==================== END SECTION: XỬ LÝ HỒ SƠ GIA NHẬP ĐỘI, CLB ====================

// ==================== SECTION: CỘT TRÁI — số liệu tính từ dữ liệu ====================
// Dựng lại sau khi lưu / xóa chương trình (ĐĂNG KÝ CHƯƠNG TRÌNH)
const renderSideStats = () => {
  const raised = PROGRAMS.reduce((sum, p) => sum + (p.goalValue && p.pct ? Math.round((p.goalValue * p.pct) / 100) : 0), 0);
  const money = raised >= 1000 ? `${(raised / 1000).toFixed(2).replace('.', ',')} tỷ ₫` : `${raised} triệu ₫`;
  const STATS = [
    ['Chương trình đã tạo', PROGRAMS.length],
    ['Tổng đã gây quỹ', money],
    ['Lượt ủng hộ', '1.126'],
    ['Hồ sơ người yếu thế', VULNERABLE.length],
    ['Giờ tình nguyện', '128 giờ'],
  ];
  document.querySelector('#pf-stats').innerHTML = STATS.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  document.querySelector('[data-count="programs"]').textContent = PROGRAMS.length;
  document.querySelector('[data-count="vulnerable"]').textContent = VULNERABLE.length;
  updateUnitCounts();
  updateVolCounts();
};
renderSideStats();

// ---------- Module Thông tin cá nhân: bấm dòng tiêu đề để mở / thu gọn; tô đỏ khi đang ở màn #thong-tin ----------
{
  const toggle = document.querySelector('.pf-module-toggle');
  const body = document.getElementById(toggle.getAttribute('aria-controls'));
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    body.hidden = !open;
  });
}

// ==================== SECTION: TAB TRẠNG THÁI — dựng theo màn hình danh sách đang mở ====================
const TAB_SOURCES = {
  // Chương trình: tab đầu “Tất cả” (mặc định khi mở từ menu), sau đó 6 trạng thái theo SRS
  'chuong-trinh': { map: PROGRAM_STATUS, rows: PROGRAMS, all: 'Tất cả' },
  'nguoi-yeu-the': { map: VULNERABLE_STATUS, rows: VULNERABLE, all: 'Tất cả hồ sơ' },
  // Đội, CLB / Chi hội của tôi: Danh sách thành viên / hội viên [số] · 5 trạng thái hồ sơ gia nhập (count: số trên tab); đường dẫn theo chế độ
  'doi-clb': () => ({ map: unitJoinTabs(), rows: unitJoins(), href: unitMode().route, all: `Danh sách ${unitMode().person}`, count: (key, n) => (key ? n : unitMembers().length) }),
  // Đăng ký hồ sơ: tab đầu “Tất cả” (mặc định khi mở từ menu), sau đó các trạng thái; tab và số đếm theo loại hồ sơ đang mở
  'tinh-nguyen-vien': () => ({ map: volStatuses(), rows: volKindRows(), href: volf.kind, all: 'Tất cả' }),
};
const tabs = document.querySelector('#pf-tabs');
// ---------- Mũi tên cuộn tab: hiện khi tab tràn khung; tab đang chọn luôn được cuộn vào khung nhìn ----------
const tabArrows = { prev: document.querySelector('.pf-tabs-arrow.is-prev'), next: document.querySelector('.pf-tabs-arrow.is-next') };
const syncTabArrows = () => {
  const overflow = !tabs.hidden && tabs.scrollWidth > tabs.clientWidth + 1;
  tabArrows.prev.hidden = !overflow || tabs.scrollLeft <= 1;
  tabArrows.next.hidden = !overflow || tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 1;
};
tabArrows.prev.addEventListener('click', () => tabs.scrollBy({ left: -240, behavior: 'smooth' }));
tabArrows.next.addEventListener('click', () => tabs.scrollBy({ left: 240, behavior: 'smooth' }));
// Cuộn tab đang chọn vào giữa khung (tính lại khi font tải xong vì độ rộng chữ thay đổi)
const revealCurrentTab = () => {
  const current = tabs.querySelector('[aria-current="page"]');
  if (current) tabs.scrollLeft = Math.max(0, current.offsetLeft - tabs.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2);
  syncTabArrows();
};
document.fonts?.ready.then(revealCurrentTab);
tabs.addEventListener('scroll', syncTabArrows, { passive: true });
window.addEventListener('resize', syncTabArrows);
const renderTabs = (screen, status) => {
  const raw = TAB_SOURCES[screen];
  const source = typeof raw === 'function' ? raw() : raw;
  tabs.hidden = !source;
  if (!source) { syncTabArrows(); return; }
  const base = source.href || screen;
  const items = [...(source.all ? [['', source.all, source.rows.length]] : []), ...Object.entries(source.map).map(([key, s]) => [key, s.label, source.rows.filter((r) => r.status === key).length])].map(([key, label, n]) => [key, (key && source.map[key].tab) || label, source.count ? source.count(key, n) : n]);
  tabs.innerHTML = items.map(([key, label, n]) => {
    const href = key ? `#${base}/${source.map[key].slug}` : `#${base}`;
    return `<a href="${href}"${key === status ? ' aria-current="page"' : ''}>${label}<span class="pf-tab-count">${n}</span></a>`;
  }).join('');
  revealCurrentTab();
};

// ==================== SECTION: ĐIỀU HƯỚNG — menu trái & tab đồng bộ theo #hash ====================
// #chuong-trinh[/<trạng thái>|/xem/<mã> → modal xem chi tiết] · #nguoi-yeu-the[/<trạng thái>|/xem/<mã>] · #doi-clb | #chi-hoi [/<trạng thái hồ sơ gia nhập>|/ho-so/<mã> → modal xử lý] · #thong-tin
// Đăng ký hồ sơ: #thanh-lap-chi-hoi · #gia-nhap-chi-hoi · #thanh-lap-doi · #gia-nhap-doi [/<trạng thái>] (link cũ #tinh-nguyen-vien → #thanh-lap-doi)
const screens = [...document.querySelectorAll('[data-screen]')];
const navLinks = [...document.querySelectorAll('.pf-nav [data-route], .pf-module-toggle[data-route]')];
const findStatus = (map, slug) => Object.keys(map).find((k) => map[k].slug === slug) || '';
// ---------- Nhóm menu Đăng ký hồ sơ: bấm để mở / thu gọn; tự mở và tô đỏ khi đang xem 1 loại hồ sơ ----------
const navGroup = document.querySelector('.pf-nav-toggle');
const navSub = document.getElementById(navGroup.getAttribute('aria-controls'));
const setNavGroup = (open) => { navGroup.setAttribute('aria-expanded', String(open)); navSub.hidden = !open; };
navGroup.addEventListener('click', () => setNavGroup(navSub.hidden));

const showRoute = () => {
  closeRowMenu();
  hideTip();
  let [screen = 'chuong-trinh', sub, code] = window.location.hash.slice(1).split('/');
  if (screen === 'tinh-nguyen-vien') screen = 'thanh-lap-doi';
  const volKind = VOL_KINDS[screen] ? screen : '';
  // Đội, CLB của tôi (#doi-clb) và Chi hội của tôi (#chi-hoi) dùng chung màn doi-clb
  const unitRoute = UNIT_ROUTES[screen] ? screen : '';
  let target = volKind ? 'tinh-nguyen-vien' : unitRoute ? 'doi-clb' : (screens.some((s) => s.dataset.screen === screen) ? screen : 'chuong-trinh');
  const isView = sub === 'xem' && code && target === 'chuong-trinh';
  const isTeamView = sub === 'xem' && code && Object.values(VOL_VIEW_KIND).includes(volKind);
  const isDetail = sub === 'xem' && code && target === 'nguoi-yeu-the';
  if (isDetail) target = `${target}-xem`;
  screens.forEach((s) => { s.hidden = s.dataset.screen !== target; });
  const base = volKind || unitRoute || target.replace(/-xem$/, '');
  navLinks.forEach((link) => {
    const match = link.dataset.route === base;
    if (match && !isDetail) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    link.classList.toggle('is-parent', match && isDetail);
  });
  navGroup.classList.toggle('is-parent', Boolean(volKind));
  if (volKind) setNavGroup(true);
  if (target === 'chuong-trinh') {
    // Mở modal xem chi tiết: giữ tab đang xem; chỉ dựng bảng khi chưa có (giữ nút vừa bấm để trả focus khi đóng)
    if (!isView) ct.status = findStatus(PROGRAM_STATUS, sub);
    else if (ct.status === null) ct.status = (findProgram(decodeURIComponent(code)) || {}).status || 'active'; // mở thẳng link chi tiết: hiện tab theo trạng thái chương trình
    if (!isView || !document.querySelector('#ct-rows').children.length) applyProgramFilter();
  }
  if (target === 'nguoi-yeu-the') { vul.status = findStatus(VULNERABLE_STATUS, sub); applyVulnerableFilter(); }
  // Đội, CLB / Chi hội của tôi: tab Danh sách thành viên / hội viên · Hồ sơ gia nhập · modal xử lý hồ sơ #<route>/ho-so/<mã> (mở trên tab Hồ sơ gia nhập; chỉ hồ sơ của đơn vị đúng chế độ)
  const routeApp = target === 'doi-clb' && sub === 'ho-so' && code ? findJoinApp(decodeURIComponent(code)) : null;
  const clubApp = routeApp && (routeApp.unit.kind === 'branch') === (unitRoute === 'chi-hoi') ? routeApp : null;
  if (target === 'doi-clb') {
    setUnitMode(UNIT_ROUTES[unitRoute]);
    const joinTab = ['ho-so-gia-nhap', 'can-phe-duyet'].includes(sub) ? 'new' : findStatus(unitJoinTabs(), sub); // link cũ → tab Mới
    if (joinTab) { club.tab = 'joins'; club.jTab = joinTab; } else if (!clubApp) club.tab = 'members';
    else if (club.tab !== 'joins') { club.tab = 'joins'; club.jTab = clubApp.status; }
    renderClub();
  }
  if (clubApp) openJoinProcess(clubApp.code); else closeJoinProcess(false);
  if (target === 'tinh-nguyen-vien') {
    // Mở modal xem hồ sơ: giữ tab & bảng đang xem (giữ nút vừa bấm để trả focus khi đóng); mở thẳng link chi tiết thì hiện tab theo trạng thái hồ sơ
    const sameKind = volf.kind === volKind;
    setVolKind(volKind);
    if (!isTeamView) volf.status = findStatus(volStatuses(), sub);
    else if (!sameKind || (volf.status && !volStatuses()[volf.status])) volf.status = (findVolReg(decodeURIComponent(code)) || {}).status || 'draft';
    if (!isTeamView || !sameKind || !document.querySelector('#vol-rows').children.length) applyVolFilter();
  }
  renderTabs(target, { 'chuong-trinh': ct.status, 'tinh-nguyen-vien': volf.status, 'doi-clb': club.tab === 'joins' ? club.jTab : '' }[target] ?? vul.status);
  // Chờ script chạy xong (readVnd khai báo ở cuối file) rồi mới dựng modal
  if (isView) setTimeout(() => openProgramView(decodeURIComponent(code)), 0);
  else closeProgramView(false);
  if (isTeamView) openTeamView(decodeURIComponent(code));
  else closeTeamView(false);
  if (target === 'nguoi-yeu-the-xem') renderVulnerableDetail(decodeURIComponent(code));
  // #chuong-trinh/them-moi: mở thẳng màn Đăng ký (nút Tạo chiến dịch ở trang Chương trình công khai — SRS Mockup 1 #7); chờ script chạy xong
  if (target === 'chuong-trinh' && sub === 'them-moi') {
    history.replaceState(null, '', '#chuong-trinh');
    setTimeout(() => startRegister(null), 0);
  }
};
window.addEventListener('hashchange', () => {
  showRoute();
  if (/^#(chuong-trinh|thanh-lap-doi)\/xem\/|^#(doi-clb|chi-hoi)\/ho-so\//.test(window.location.hash)) return; // mở modal: không cuộn trang
  const top = document.querySelector('.pf-main').getBoundingClientRect().top + window.scrollY - 100;
  if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
});
showRoute();

// ==================== SECTION: THÔNG TIN CÁ NHÂN — ảnh đại diện, kiểm tra & lưu biểu mẫu ====================
const form = document.querySelector('#profile-form');
const photoInput = document.querySelector('#photo-input');
const photoPreview = document.querySelector('#photo-preview');

// ---------- Ảnh đại diện: xem trước (chưa tải lên máy chủ) ----------
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('Ảnh vượt quá 2MB, vui lòng chọn ảnh nhỏ hơn.', 'error');
    photoInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photoPreview.style.backgroundImage = `url("${reader.result}")`;
    photoPreview.textContent = '';
  };
  reader.readAsDataURL(file);
});

// ---------- Kiểm tra trường bắt buộc / định dạng ----------
const validateField = (input) => {
  const field = input.closest('.pf-field');
  const error = field.querySelector('.pf-error');
  const valid = input.checkValidity();
  field.classList.toggle('is-invalid', !valid);
  input.setAttribute('aria-invalid', String(!valid));
  if (error) error.hidden = valid;
  return valid;
};
const checkedInputs = [...form.querySelectorAll('input[required]')];
checkedInputs.forEach((input) => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => { if (input.closest('.is-invalid')) validateField(input); });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = checkedInputs.filter((input) => !validateField(input));
  if (invalid.length) {
    invalid[0].focus();
    return;
  }
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  document.querySelector('#profile-updated').textContent = `Lần cập nhật gần nhất: ${today}`;
  showToast('Đã lưu thay đổi (bản xem trước — chưa gửi lên hệ thống).');
});

form.addEventListener('reset', () => {
  // Chờ trình duyệt khôi phục giá trị rồi xóa trạng thái lỗi & ảnh xem trước
  requestAnimationFrame(() => {
    checkedInputs.forEach((input) => {
      const field = input.closest('.pf-field');
      field.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      const error = field.querySelector('.pf-error');
      if (error) error.hidden = true;
    });
    photoPreview.style.backgroundImage = '';
    photoPreview.textContent = 'NT';
  });
});

// ==================== SECTION: ĐĂNG KÝ CHƯƠNG TRÌNH — drawer phải, chiếm 88% màn hình ====================
// Theo SRS "Chương trình thiện nguyện của tôi" v2 (mục 3.2, 4.3, 5): Thêm mới (tài khoản phải đã xác minh — TB02) · Sửa bản nháp (NL02)
// · Tự động lưu nháp (NL05) · Lưu bản nháp → Nháp (TB04) · Lưu và tạo chương trình → Chờ phê duyệt (TB05) · Rời form khi chưa lưu (TB09).
// Dữ liệu chỉ giữ trong phiên (bản xem trước): PROGRAMS + programRegCache.
const reg = document.querySelector('#pf-reg');
const regPanel = reg.querySelector('.pf-reg-panel');
const regBody = reg.querySelector('.pf-reg-body');
const regForm = document.querySelector('#pf-reg-form');
const regStatus = document.querySelector('#pf-reg-status');
const regReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let regTrigger = null;
regPanel.tabIndex = -1;

// ---------- Danh mục (SRS mục 3.2) · tài khoản đang đăng nhập (minh họa) · câu thông báo (SRS mục 6) ----------
const RES_MONEY = 'Tiền mặt/chuyển khoản';
const MODE_GROUP = 'Theo nhóm đối tượng người yếu thế';
const MODE_LIST = 'Theo nhóm người yếu thế cụ thể';
const REG_PROVINCES = ['Thành phố Hà Nội', 'Tỉnh Cao Bằng', 'Tỉnh Tuyên Quang', 'Tỉnh Điện Biên', 'Tỉnh Lai Châu', 'Tỉnh Sơn La', 'Tỉnh Lào Cai', 'Tỉnh Thái Nguyên', 'Tỉnh Lạng Sơn', 'Tỉnh Quảng Ninh', 'Tỉnh Bắc Ninh', 'Tỉnh Phú Thọ', 'Thành phố Hải Phòng', 'Tỉnh Hưng Yên', 'Tỉnh Ninh Bình', 'Tỉnh Thanh Hóa', 'Tỉnh Nghệ An', 'Tỉnh Hà Tĩnh', 'Tỉnh Quảng Trị', 'Thành phố Huế', 'Thành phố Đà Nẵng', 'Tỉnh Quảng Ngãi', 'Tỉnh Gia Lai', 'Tỉnh Khánh Hòa', 'Tỉnh Đắk Lắk', 'Tỉnh Lâm Đồng', 'Tỉnh Đồng Nai', 'Thành phố Hồ Chí Minh', 'Tỉnh Tây Ninh', 'Tỉnh Đồng Tháp', 'Tỉnh Vĩnh Long', 'Tỉnh An Giang', 'Thành phố Cần Thơ', 'Tỉnh Cà Mau'];
// Nhóm đối tượng người yếu thế (#18) — cũng là danh mục cột Nhu cầu cần trợ giúp (#19.9)
const REG_GROUPS = ['Hộ nghèo', 'Hộ cận nghèo', 'Bị ảnh hưởng thiên tai/bão lũ', 'Người khuyết tật', 'Người già neo đơn', 'Trẻ mồ côi', 'Bệnh hiểm nghèo', 'Khác'];
const REG_KINDS = ['Cá nhân', 'Hộ gia đình', 'Cộng đồng – Mái ấm'];
const REG_GOODS_GROUPS = ['Lương thực', 'Thực phẩm và đồ uống', 'Nước sạch và xử lý nước', 'Thuốc', 'Vật tư y tế', 'Vật tư vệ sinh, khử khuẩn', 'Quần áo, chăn màn', 'Đồ dùng sinh hoạt gia đình', 'Thiết bị cứu hộ và an toàn', 'Vật liệu nơi ở', 'Đồ dùng học tập', 'Phương tiện sinh kế', 'Thiết bị hỗ trợ người khuyết tật và người cao tuổi', 'Hàng hóa khác'];
const REG_QTY_UNITS = ['Bao', 'Thùng', 'Hộp', 'Gói', 'Túi', 'Chai', 'Lon', 'Lọ', 'Can', 'Bình', 'Vỉ', 'Tuýp', 'Cuộn', 'Tấm', 'Cái', 'Chiếc', 'Bộ', 'Đôi', 'Cuốn', 'Suất', 'Kiện', 'Con', 'Cây'];
// Đơn vị quy cách/trọng lượng: hiển thị ký hiệu viết tắt, tên đầy đủ khi rê chuột
const REG_SPEC_UNITS = [['g', 'Gam'], ['kg', 'Ki-lô-gam'], ['tạ', 'Tạ'], ['tấn', 'Tấn'], ['yến', 'Yến'], ['ml', 'Mi-li-lít'], ['l', 'Lít']];
// type: loại tài khoản → Đối tượng tạo; verified: đã xác minh CCCD (cá nhân) / MST (tổ chức)
const REG_ACCOUNT = { type: 'Cá nhân', name: TEAM_ACCOUNT.name, phone: TEAM_ACCOUNT.phone, email: TEAM_ACCOUNT.email, verified: true };
const REG_MSG = {
  unverified: 'Vui lòng xác minh tài khoản (CCCD/MST) để sử dụng chức năng này.', // TB02
  invalid: 'Vui lòng kiểm tra lại thông tin.', // TB03
  draft: 'Đã lưu nháp.', // TB04
  sent: 'Đã gửi chương trình để Hội phê duyệt.', // TB05
  changed: 'Chương trình đã thay đổi trạng thái, không thể thực hiện.', // TB07
  deleted: 'Đã xóa chương trình.', // TB08
  badFile: 'File không hợp lệ. Vui lòng kiểm tra định dạng và dung lượng.', // TB10
};
fillOptions(document.querySelector('#rg-area'), REG_PROVINCES);

// ---------- Mở / đóng: khóa cuộn trang, đưa focus vào drawer, trả focus về nút đã bấm ----------
const openRegister = (trigger) => {
  regTrigger = trigger;
  regSaved = JSON.stringify(regFormData());
  reg.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  regBody.scrollTop = 0;
  requestAnimationFrame(() => {
    reg.classList.add('is-open');
    regPanel.focus({ preventScroll: true });
  });
};
const closeRegister = () => {
  clearTimeout(regAutoTimer);
  reg.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  regMultis.forEach((m) => m.setOpen(false));
  regSuggest.close();
  setTimeout(() => { reg.hidden = true; }, regReduced() ? 0 : 300);
  if (regTrigger && regTrigger.isConnected) regTrigger.focus();
};
// NL04: đóng (×, Esc, bấm nền) khi còn thay đổi chưa lưu → hỏi xác nhận (TB09)
const requestCloseRegister = async () => {
  if (regBusy) return;
  if (regDirty()) {
    const yes = await confirmAction({ title: 'Rời khỏi biểu mẫu', text: 'Dữ liệu chưa lưu sẽ bị mất. Bạn muốn rời trang?', ok: 'Đồng ý' });
    if (!yes) return;
  }
  closeRegister();
};
window.addEventListener('beforeunload', (event) => {
  if (reg.hidden || !regDirty()) return;
  event.preventDefault();
  event.returnValue = '';
});
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open-register]');
  if (trigger) startRegister(trigger);
  // Nút bút chì ở dòng Bản nháp · nút Chỉnh sửa ở modal Xem chi tiết (đóng modal trước)
  // Nút thùng rác ở dòng Bản nháp (tab Tất cả) — NL03
  const remove = event.target.closest('[data-delete-program]');
  if (remove) deleteProgram(remove.dataset.deleteProgram);
  const edit = event.target.closest('[data-edit-program]');
  if (edit) {
    const fromView = pfView.contains(edit);
    if (fromView) closeProgramView();
    editProgram(edit.dataset.editProgram, fromView ? null : edit);
  }
});
reg.querySelectorAll('[data-close-register]').forEach((button) => button.addEventListener('click', requestCloseRegister));

// ---------- Bàn phím: Esc đóng (ưu tiên đóng danh sách chọn / gợi ý địa chỉ), Tab xoay vòng trong drawer ----------
document.addEventListener('keydown', (event) => {
  if (reg.hidden || dialog.open || teamConfirm.open || regImport.open) return;
  if (event.key === 'Escape') {
    // Chặn mặc định: nếu không, chính lần Esc này đóng luôn hộp xác nhận TB09 vừa mở
    event.preventDefault();
    const openMulti = regMultis.find((m) => m.isOpen());
    if (openMulti) openMulti.setOpen(false, true);
    else if (regSuggest.isOpen()) regSuggest.close();
    else requestCloseRegister();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = [...regPanel.querySelectorAll('a[href], button:not([disabled]), input:not([type="file"]), select, textarea')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === regPanel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

// ---------- Mức độ ưu tiên: đổi màu chấm theo lựa chọn ----------
const regPriority = document.querySelector('#rg-priority');
const syncPriorityDot = () => { reg.querySelector('.pf-reg-dot').className = `pf-reg-dot is-${regPriority.value}`; };
regPriority.addEventListener('change', syncPriorityDot);

// ---------- Chọn nhiều: thẻ đỏ có nút ×, danh sách tích chọn, điều khiển bằng phím mũi tên ----------
// Mỗi lần đổi lựa chọn phát sự kiện "multi-change" (Đăng ký chương trình dùng để ẩn / hiện trường phụ thuộc)
const setupMulti = (root, index) => {
  const box = root.querySelector('.pf-multi-box');
  const chips = root.querySelector('.pf-multi-chips');
  const toggle = root.querySelector('.pf-multi-toggle');
  const list = root.querySelector('.pf-multi-list');
  const options = [...list.children];
  let active = -1;
  options.forEach((option, i) => { option.id = `pf-multi-${index}-${i}`; });
  const selected = () => options.filter((o) => o.getAttribute('aria-selected') === 'true');
  const chipHtml = (v) => `<span class="pf-multi-chip"><span class="pf-multi-chip-text" title="${escapeHtml(v)}">${escapeHtml(v)}</span><button type="button" data-value="${escapeHtml(v)}" aria-label="Bỏ ${escapeHtml(v)}">${icon('close')}</button></span>`;
  // ---------- data-one-line: thẻ chỉ hiện trên 1 dòng; tràn thì ẩn bớt, thay bằng nút "+N" — bấm mở khung xem đủ các mục đã chọn ----------
  const oneLine = root.hasAttribute('data-one-line');
  let pop = null;
  const closePop = () => { if (pop) { pop.remove(); pop = null; } };
  const openPop = () => {
    pop = document.createElement('div');
    pop.className = 'pf-multi-pop';
    pop.setAttribute('role', 'group');
    pop.setAttribute('aria-label', 'Các mục đã chọn');
    pop.innerHTML = selected().map((o) => chipHtml(o.textContent)).join('');
    root.append(pop);
  };
  const fitChips = () => {
    if (!oneLine || !chips.clientWidth) return;
    chips.querySelector('.pf-multi-more')?.remove();
    chips.classList.remove('is-clipped');
    const items = [...chips.querySelectorAll('.pf-multi-chip')];
    items.forEach((c) => { c.hidden = false; });
    if (chips.scrollWidth <= chips.clientWidth) return;
    if (items.length > 1) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'pf-multi-more';
      chips.append(more);
      for (let i = items.length - 1, n = 1; i > 0; i -= 1, n += 1) {
        items[i].hidden = true;
        more.textContent = `+${n}`;
        more.setAttribute('aria-label', `Xem thêm ${n} mục đã chọn`);
        if (chips.scrollWidth <= chips.clientWidth) break;
      }
    }
    // Chỉ còn thẻ đầu mà vẫn tràn: thẻ đầu co lại, chữ "…", để "+N" luôn hiện đủ
    if (chips.scrollWidth > chips.clientWidth) chips.classList.add('is-clipped');
  };
  const render = () => {
    const values = selected().map((o) => o.textContent);
    chips.innerHTML = values.length
      ? values.map(chipHtml).join('')
      : `<span class="pf-multi-empty">${escapeHtml(root.dataset.placeholder || 'Chọn một hoặc nhiều mục')}</span>`;
    if (values.length) root.closest('.pf-field').classList.remove('is-invalid');
    fitChips();
    if (pop) { closePop(); if (chips.querySelector('.pf-multi-more')) openPop(); }
    root.dispatchEvent(new CustomEvent('multi-change', { bubbles: true }));
  };
  const setActive = (i) => {
    active = (i + options.length) % options.length;
    options.forEach((o, n) => o.classList.toggle('is-active', n === active));
    toggle.setAttribute('aria-activedescendant', options[active].id);
  };
  const isOpen = () => !list.hidden;
  const setOpen = (open, refocus = false) => {
    list.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    box.classList.toggle('is-open', open);
    if (!open) {
      toggle.removeAttribute('aria-activedescendant');
      options.forEach((o) => o.classList.remove('is-active'));
      active = -1;
    }
    if (refocus) toggle.focus();
  };
  const flip = (option) => {
    option.setAttribute('aria-selected', String(option.getAttribute('aria-selected') !== 'true'));
    render();
  };
  box.addEventListener('click', (event) => {
    if (event.target.closest('.pf-multi-more')) {
      setOpen(false);
      if (pop) closePop(); else openPop();
      return;
    }
    const remove = event.target.closest('.pf-multi-chip button');
    if (remove) {
      const option = options.find((o) => o.textContent === remove.dataset.value);
      if (option) flip(option);
      toggle.focus();
      return;
    }
    closePop();
    regMultis.forEach((m) => { if (m.root !== root) m.setOpen(false); });
    setOpen(!isOpen());
  });
  // Khung "+N": bỏ chọn ngay trong khung; bấm ra ngoài thì đóng
  root.addEventListener('click', (event) => {
    const remove = event.target.closest('.pf-multi-pop .pf-multi-chip button');
    if (!remove) return;
    const option = options.find((o) => o.textContent === remove.dataset.value);
    if (option) flip(option);
  });
  if (oneLine) {
    // composedPath: nút × trong khung bị dựng lại ngay khi bấm (đã tách khỏi trang) nhưng vẫn tính là bấm bên trong
    document.addEventListener('click', (event) => { if (pop && !event.composedPath().includes(root)) closePop(); });
    window.addEventListener('resize', fitChips);
  }
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) flip(option);
  });
  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen()) setOpen(true);
      setActive(active < 0 ? 0 : active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if ((event.key === 'Enter' || event.key === ' ') && isOpen() && active >= 0) {
      event.preventDefault();
      flip(options[active]);
    }
  });
  render();
  // Chọn sẵn theo danh sách giá trị (nạp dữ liệu từ hồ sơ có sẵn)
  const setValues = (values) => { options.forEach((o) => o.setAttribute('aria-selected', String(values.includes(o.textContent)))); render(); };
  return { root, setOpen, isOpen, selected, setValues, refit: fitChips, closePop };
};
const regMultis = [...reg.querySelectorAll('[data-multi]')].map(setupMulti);
const regGroups = regMultis.find((m) => m.root.id === 'rg-groups');
const regResources = regMultis.find((m) => m.root.id === 'rg-resources');
const multiValues = (m) => m.selected().map((o) => o.textContent);
document.addEventListener('click', (event) => {
  regMultis.forEach((m) => { if (m.isOpen() && !m.root.contains(event.target)) m.setOpen(false); });
});

// ---------- Số: chỉ nhận chữ số; mục tiêu quyên góp tự thêm dấu phẩy và đọc bằng chữ ----------
const DIGIT_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const readTriple = (n, full) => {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const out = [];
  if (full || h) out.push(`${DIGIT_WORDS[h]} trăm`);
  if (t > 1) {
    out.push(`${DIGIT_WORDS[t]} mươi`);
    if (u === 1) out.push('mốt'); else if (u === 5) out.push('lăm'); else if (u) out.push(DIGIT_WORDS[u]);
  } else if (t === 1) {
    out.push('mười');
    if (u === 5) out.push('lăm'); else if (u) out.push(DIGIT_WORDS[u]);
  } else if (u) {
    if (full || h) out.push('lẻ');
    out.push(DIGIT_WORDS[u]);
  }
  return out.join(' ');
};
const readVnd = (amount) => {
  if (!amount) return '';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups = [];
  for (let x = amount; x > 0; x = Math.floor(x / 1000)) groups.push(x % 1000);
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i]) parts.push(`${readTriple(groups[i], i < groups.length - 1)}${units[i] ? ` ${units[i]}` : ''}`);
  }
  const text = parts.join(' ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} đồng${amount % 1000 === 0 ? ' chẵn' : ''}`;
};
const regMoney = document.querySelector('#rg-money');
const regWords = document.querySelector('#rg-money-words');
const setRegMoney = (amount) => {
  regMoney.value = amount ? amount.toLocaleString('en-US') : '';
  regWords.textContent = amount ? `Bằng chữ: ${readVnd(amount)}` : '';
};
regMoney.addEventListener('input', () => setRegMoney(Number(regMoney.value.replace(/\D/g, '').slice(0, 15))));
['#rg-volunteers', '#rg-phone'].forEach((id) => {
  const input = document.querySelector(id);
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); });
});

// ---------- Khoảng ngày: Đến ngày không trước Từ ngày (#16); tiếp nhận đóng góp bắt đầu từ hôm nay, không quá 60 ngày (#26, NĐ 93/2021) ----------
const dayDiff = (from, to) => (new Date(to) - new Date(from)) / 86400000;
const rangeError = (fromId, toId, raise) => {
  const from = document.querySelector(`#${fromId}`).value;
  const to = document.querySelector(`#${toId}`).value;
  if (raise && from && from < localIso()) return 'Ngày bắt đầu tiếp nhận phải từ ngày hiện tại trở đi.';
  if (from && to && to < from) return raise ? 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.' : 'Đến ngày phải sau hoặc bằng Từ ngày.';
  if (raise && from && to && dayDiff(from, to) > 60) return 'Thời gian tiếp nhận không quá 60 ngày.';
  return '';
};
const REG_RANGES = [['rg-run-from', 'rg-run-to', false], ['rg-raise-from', 'rg-raise-to', true]];
REG_RANGES.forEach(([from, to, raise]) => [from, to].forEach((id) => document.querySelector(`#${id}`).addEventListener('change', () => {
  const field = document.querySelector(`#${from}`).closest('.pf-field');
  const msg = rangeError(from, to, raise);
  field.classList.toggle('is-invalid', Boolean(msg));
  if (msg) syncFieldErrors(regForm, new Map([[field, msg]]));
})));

// ---------- Ô ngày dd/mm/yyyy: ô chữ luôn hiển thị ngày/tháng/năm (không phụ thuộc ngôn ngữ máy); nút lịch mở bộ chọn ngày gốc (ẩn) ----------
// Ô date gốc (.pf-date-native) giữ giá trị yyyy-mm-dd cho kiểm tra khoảng ngày; data-free: cho nhập chữ (vd. "Không thời hạn")
const isoToVi = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
const viToIso = (vi) => {
  const m = vi.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? '' : iso;
};
const maskVi = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
};
// Dùng chung cho mọi drawer biểu mẫu (.pf-reg): Đăng ký chương trình, Đăng ký thành lập đội, CLB · và bộ lọc Chương trình (Thời gian triển khai)
document.querySelectorAll('.pf-reg, #ct-filters').forEach((drawer) => {
  drawer.addEventListener('click', (event) => {
    const button = event.target.closest('.pf-date-btn');
    if (!button) return;
    const root = button.closest('[data-vi-date]');
    try { root.querySelector('.pf-date-native').showPicker(); } catch (error) { root.querySelector('input[type="text"]').focus(); }
  });
  drawer.addEventListener('input', (event) => {
    const text = event.target;
    const root = text.closest('[data-vi-date]');
    if (!root || text.type !== 'text') return;
    if (!(text.hasAttribute('data-free') && /[^\d/]/.test(text.value))) text.value = maskVi(text.value);
    const native = root.querySelector('.pf-date-native');
    const iso = viToIso(text.value);
    if (native.value !== iso) { native.value = iso; native.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  drawer.addEventListener('change', (event) => {
    if (!event.target.matches('.pf-date-native') || !event.target.value) return;
    event.target.closest('[data-vi-date]').querySelector('input[type="text"]').value = isoToVi(event.target.value);
  });
});

// ---------- Tệp: khung tải lên dùng chung (bấm hoặc kéo thả) — banner 1 ảnh ≤10MB (tải ảnh khác thì thay), hình ảnh đính kèm nhiều ảnh ≤10MB, hồ sơ pháp lý nhiều tệp ≤25MB ----------
// Tệp sai định dạng / quá dung lượng: TB10, không đính kèm tệp đó, giữ dữ liệu khác (NL09)
const regBannerList = document.querySelector('#rg-banner-list');
const regPhotoList = document.querySelector('#rg-photos-list');
const regDocs = document.querySelector('#rg-docs');
const fileSize = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
// replace: khung 1 tệp (Ảnh / Banner) — nút “Thay ảnh” thay cho nút xóa (SRS #10)
const fileItem = (file, iconId, replace = false) => `<li class="pf-file" data-name="${escapeHtml(file.name)}" data-size="${file.size}"${file.url ? ` data-url="${file.url}"` : ''}>
  <span class="pf-file-icon" aria-hidden="true">${icon(iconId)}</span>
  <div class="pf-file-text"><p class="pf-file-name"><span class="pf-clamp-1">${escapeHtml(file.name)}</span></p><p class="pf-file-meta">${fileSize(file.size)}<span aria-hidden="true">•</span><span class="is-ok">Đã tải</span></p></div>
  ${replace ? `<button class="pf-btn pf-btn-ghost pf-btn-sm" type="button" data-replace-file aria-label="Thay ảnh ${escapeHtml(file.name)}">${icon('upload')}Thay ảnh</button>`
    : `<button class="pf-icon-btn" type="button" data-remove-file aria-label="Xóa tệp ${escapeHtml(file.name)}">${icon('trash')}</button>`}
</li>`;
const REG_DROPS = new Map(); // danh sách tệp → { biểu tượng, chỉ 1 tệp, khung tải lên, ô chọn tệp } (dựng lại danh sách khi nạp bản nháp)
// Khung 1 tệp: đã có tệp thì ẩn khung kéo thả, chỉ còn dòng tệp + nút Thay ảnh
const renderFiles = (list, files) => {
  const { iconId, single, zone } = REG_DROPS.get(list);
  list.innerHTML = files.map((f) => fileItem(f, iconId, single)).join('');
  if (single) zone.hidden = files.length > 0;
};
const listFiles = (list) => [...list.children].map((li) => ({ name: li.dataset.name, size: Number(li.dataset.size), url: li.dataset.url || '' }));
const setupDropzone = (input, { list, iconId, maxMb, exts, multiple, preview = false }) => {
  const zone = input.closest('[data-dropzone]');
  REG_DROPS.set(list, { iconId, single: !multiple, zone, input });
  const take = (files) => {
    const ok = files.filter((f) => exts.some((ext) => f.name.toLowerCase().endsWith(ext)) && f.size <= maxMb * 1048576);
    // Ảnh: giữ địa chỉ xem trước (blob:) để màn Xem chi tiết hiện đúng ảnh vừa tải
    const chosen = (multiple ? ok : ok.slice(0, 1)).map((f) => ({ name: f.name, size: f.size, url: preview ? URL.createObjectURL(f) : '' }));
    if (chosen.length) {
      renderFiles(list, multiple ? [...listFiles(list), ...chosen] : chosen);
      list.closest('.pf-field').classList.remove('is-invalid');
      list.dispatchEvent(new Event('reg-change', { bubbles: true }));
    }
    if (files.length > ok.length) showToast(REG_MSG.badFile, 'error');
  };
  input.addEventListener('change', () => { take([...input.files]); input.value = ''; });
  ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => { event.preventDefault(); zone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, () => zone.classList.remove('is-dragover')));
  zone.addEventListener('drop', (event) => { event.preventDefault(); take([...event.dataTransfer.files]); });
};
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png'];
setupDropzone(document.querySelector('#rg-banner'), { list: regBannerList, iconId: 'image', maxMb: 10, exts: IMAGE_EXTS, multiple: false, preview: true });
setupDropzone(document.querySelector('#rg-photos'), { list: regPhotoList, iconId: 'image', maxMb: 10, exts: IMAGE_EXTS, multiple: true, preview: true });
setupDropzone(document.querySelector('#rg-docs-input'), { list: regDocs, iconId: 'document', maxMb: 25, exts: ['.pdf', '.docx'], multiple: true });
reg.addEventListener('click', (event) => {
  // Thay ảnh: mở chọn tệp của khung (khung đang ẩn); chọn xong thì ảnh mới thay ảnh cũ
  const replace = event.target.closest('[data-replace-file]');
  if (replace) { REG_DROPS.get(replace.closest('.pf-reg-files')).input.click(); return; }
  const button = event.target.closest('[data-remove-file]');
  if (!button) return;
  const list = button.closest('.pf-reg-files');
  button.closest('.pf-file').remove();
  list.dispatchEvent(new Event('reg-change', { bubbles: true }));
  showToast('Đã xóa tệp đính kèm.');
});

// ---------- Danh sách nhập theo dòng (hàng hóa, đầu mối): thêm mới, xóa dòng, chọn nhiều để xóa ----------
const setupRegList = (list) => {
  const body = list.querySelector('tbody');
  const template = list.querySelector('template');
  const empty = list.querySelector('.pf-reg-list-empty');
  const checkAll = list.querySelector('[data-check-all]');
  const addButton = list.querySelector('[data-list-add]');
  const removeSelected = list.querySelector('[data-list-remove]');
  const rows = () => [...body.rows];
  const isChecked = (row) => row.querySelector('.pf-col-check input').checked;
  const sync = () => {
    rows().forEach((row, i) => {
      row.querySelector('.pf-col-index').textContent = i + 1;
      row.querySelectorAll('[data-label]').forEach((el) => el.setAttribute('aria-label', `${el.dataset.label} dòng ${i + 1}`));
      row.classList.toggle('is-selected', isChecked(row));
    });
    const total = rows().length;
    const checked = rows().filter(isChecked).length;
    empty.hidden = total > 0;
    checkAll.disabled = total === 0;
    checkAll.checked = total > 0 && checked === total;
    checkAll.indeterminate = checked > 0 && checked < total;
    removeSelected.hidden = checked === 0;
    removeSelected.querySelector('span').textContent = checked;
  };
  const addRow = (focus) => {
    body.append(template.content.cloneNode(true));
    sync();
    if (focus) body.lastElementChild.querySelector('.pf-cell-input').focus();
  };
  addButton.addEventListener('click', () => addRow(true));
  body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-row-remove]');
    if (!button) return;
    button.closest('tr').remove();
    sync();
    addButton.focus();
    list.dispatchEvent(new Event('reg-change', { bubbles: true }));
  });
  body.addEventListener('change', (event) => {
    if (event.target.closest('.pf-col-check')) sync();
  });
  body.addEventListener('input', (event) => {
    // Ô chọn: chữ xám khi chưa có giá trị
    if (event.target.matches('select.pf-cell-input')) event.target.classList.toggle('is-empty', !event.target.value);
  });
  checkAll.addEventListener('change', () => {
    rows().forEach((row) => { row.querySelector('.pf-col-check input').checked = checkAll.checked; });
    sync();
  });
  removeSelected.addEventListener('click', () => {
    const count = rows().filter(isChecked).length;
    rows().filter(isChecked).forEach((row) => row.remove());
    sync();
    addButton.focus();
    list.dispatchEvent(new Event('reg-change', { bubbles: true }));
    showToast(`Đã xóa ${count} dòng.`);
  });
  addRow(false);
};
// Mẫu dòng hàng hóa: điền danh mục Nhóm hàng, Đơn vị số lượng, Đơn vị quy cách trước khi dựng dòng đầu
const goodsList = document.querySelector('#rg-goods');
const goodsBody = goodsList.querySelector('tbody');
const goodsTemplate = goodsList.querySelector('template').content;
fillOptions(goodsTemplate.querySelector('[data-key="group"]'), REG_GOODS_GROUPS);
fillOptions(goodsTemplate.querySelector('[data-key="qtyUnit"]'), REG_QTY_UNITS);
REG_SPEC_UNITS.forEach(([abbr, full]) => {
  const option = new Option(abbr, abbr);
  option.title = full;
  goodsTemplate.querySelector('[data-key="specUnit"]').add(option);
});
reg.querySelectorAll('[data-reg-list]').forEach(setupRegList);
const assignList = document.querySelector('#rg-assign');
const cell = (row, key) => row.querySelector(`[data-key="${key}"]`);
const setCell = (row, key, value) => {
  const el = cell(row, key);
  el.value = value || '';
  if (el.tagName === 'SELECT') el.classList.toggle('is-empty', !el.value);
};
// Nạp lại bảng nhập theo dòng: xóa hết, thêm từng dòng (luôn còn ít nhất 1 dòng trống) rồi điền giá trị
const loadRegList = (list, rows, fill) => {
  const body = list.querySelector('tbody');
  const add = list.querySelector('[data-list-add]');
  body.replaceChildren();
  (rows.length ? rows : [null]).forEach((data) => {
    add.click();
    if (data) fill(body.lastElementChild, data);
  });
};

// ---------- Danh sách hàng hóa nhận (#28): tất cả cột bắt buộc; Đối tượng sử dụng theo #18 (theo nhóm) hoặc cột Nhu cầu của #19 (cụ thể) ----------
const GOODS_KEYS = ['group', 'name', 'qty', 'qtyUnit', 'spec', 'specUnit', 'price', 'exp', 'to'];
const GOODS_DOC_EXTS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
const goodsRowData = (row) => ({ ...Object.fromEntries(GOODS_KEYS.map((k) => [k, cell(row, k).value.trim()])), docs: JSON.parse(cell(row, 'docs').dataset.files || '[]') });
const isBlankGoods = (g) => GOODS_KEYS.every((k) => !g[k]) && !g.docs.length;
// Cột lỗi của 1 dòng: số lượng nguyên > 0, quy cách > 0, giá ≥ 0, hạn sử dụng dd/mm/yyyy hoặc "Không thời hạn", có chứng từ
const goodsErrors = (g) => [
  !g.group && 'group', !g.name && 'name', !(Number(g.qty) > 0) && 'qty', !g.qtyUnit && 'qtyUnit',
  !(Number(g.spec.replace(',', '.')) > 0) && 'spec', !g.specUnit && 'specUnit', !g.price && 'price',
  !(viToIso(g.exp) || fold(g.exp) === 'khong thoi han') && 'exp', !g.to && 'to', !g.docs.length && 'docs',
].filter(Boolean);
const goodsTargets = () => {
  if (regMode.value === MODE_GROUP) return multiValues(regGroups);
  if (regMode.value === MODE_LIST) return [...new Set(regPeople.map((r) => r.need).filter(Boolean))];
  return [];
};
const syncGoodsTargets = () => {
  const values = goodsTargets();
  goodsBody.querySelectorAll('[data-key="to"]').forEach((select) => {
    const current = select.value;
    select.innerHTML = `<option value="">Chọn đối tượng</option>${values.map((v) => `<option>${escapeHtml(v)}</option>`).join('')}`;
    select.value = values.includes(current) ? current : '';
    select.classList.toggle('is-empty', !select.value);
  });
};
// Dòng mới (setupRegList đã thêm dòng trước) → nạp danh sách Đối tượng sử dụng
goodsList.querySelector('[data-list-add]').addEventListener('click', syncGoodsTargets);
const setGoodsDocs = (input, names) => {
  const label = input.closest('.pf-cell-file');
  input.dataset.files = JSON.stringify(names);
  label.querySelector('.pf-cell-file-text').textContent = names.length ? `${names.length} tệp` : 'Tải tệp';
  label.classList.toggle('has-files', names.length > 0);
  label.title = names.join('\n');
};
const fillGoodsRow = (row, g) => {
  GOODS_KEYS.forEach((k) => setCell(row, k, g[k]));
  row.querySelector('.pf-date-native').value = viToIso(g.exp);
  setGoodsDocs(cell(row, 'docs'), g.docs);
};
// Số lượng: số nguyên · Quy cách: số thập phân dấu "," · Giá tiền: phân cách hàng nghìn bằng "."
goodsBody.addEventListener('input', (event) => {
  const el = event.target;
  const key = el.dataset.key;
  if (key === 'qty') el.value = el.value.replace(/\D/g, '');
  if (key === 'spec') el.value = el.value.replace(/\./g, ',').replace(/[^\d,]/g, '').replace(/,(?=.*,)/g, '');
  if (key === 'price') { const digits = el.value.replace(/\D/g, '').slice(0, 15); el.value = digits ? Number(digits).toLocaleString('vi-VN') : ''; }
  el.classList.remove('is-invalid');
});
// Chứng từ/Tiêu chuẩn kèm theo: nhiều tệp (PDF, DOCX, JPG, PNG ≤ 25MB) — ô hiện số tệp, rê chuột xem tên tệp
goodsBody.addEventListener('change', (event) => {
  const input = event.target;
  if (input.dataset.key !== 'docs') return;
  const files = [...input.files];
  const ok = files.filter((f) => GOODS_DOC_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext)) && f.size <= 25 * 1048576);
  if (ok.length) setGoodsDocs(input, ok.map((f) => f.name));
  if (files.length > ok.length) showToast(REG_MSG.badFile, 'error');
  input.value = '';
  input.closest('.pf-cell-file').classList.remove('is-invalid');
});
const ASSIGN_KEYS = ['unit', 'person', 'task', 'date'];
const assignRows = () => [...assignList.querySelector('tbody').rows].map((row) => Object.fromEntries(ASSIGN_KEYS.map((k) => [k, cell(row, k).value.trim()])))
  .filter((a) => ASSIGN_KEYS.some((k) => a[k]));
const fillAssignRow = (row, a) => {
  ASSIGN_KEYS.forEach((k) => setCell(row, k, a[k]));
  row.querySelector('.pf-date-native').value = viToIso(a.date);
};

// ---------- Danh sách người yếu thế (#19): nhập tay theo dòng; Kết quả hệ thống đối chiếu danh sách Người yếu thế theo Số CCCD/QĐ thành lập (#19.11) ----------
// Danh sách Người yếu thế trên hệ thống (minh họa — chức năng Quản lý người yếu thế)
const VULNERABLE_REGISTRY = [
  { id: '001504022598', name: 'Nguyễn Văn A', phone: '0354888744', kind: 'Cá nhân', need: 'Hộ nghèo', province: 'Tỉnh Tuyên Quang' },
  { id: '001504022526', name: 'Nguyễn Văn B', phone: '0966354782', kind: 'Hộ gia đình', need: 'Hộ cận nghèo', province: 'Tỉnh Hưng Yên' },
  { id: '001504022522', name: 'Cộng đồng người khuyết tật Hòa An', phone: '0931579054', kind: 'Cộng đồng – Mái ấm', need: 'Người khuyết tật', province: 'Tỉnh Cao Bằng' },
  { id: '042196012345', name: 'Trần Văn Bình', phone: '0912004521', kind: 'Cá nhân', need: 'Người già neo đơn', province: 'Tỉnh Hà Tĩnh' },
  { id: '045215006789', name: 'Lê Thị Hoa', phone: '0935118206', kind: 'Cá nhân', need: 'Trẻ mồ côi', province: 'Tỉnh Quảng Trị' },
  { id: '040181003456', name: 'Phạm Thị Mai', phone: '0978223415', kind: 'Hộ gia đình', need: 'Hộ nghèo', province: 'Tỉnh Nghệ An' },
  { id: '046180007712', name: 'Nguyễn Văn Sáu', phone: '0905667123', kind: 'Cá nhân', need: 'Người khuyết tật', province: 'Thành phố Huế' },
  { id: '044176002233', name: 'Võ Thị Tám', phone: '0389554210', kind: 'Cá nhân', need: 'Người già neo đơn', province: 'Tỉnh Quảng Trị' },
];
const PEOPLE_COLS = [['id', 'Số CCCD/QĐ thành lập'], ['name', 'Người yếu thế'], ['phone', 'Số điện thoại'], ['kind', 'Loại hồ sơ'], ['need', 'Nhu cầu cần trợ giúp'], ['province', 'Tỉnh/thành phố']];
const PEOPLE_RESULT = { ok: ['Đã có trên hệ thống', 'green'], none: ['Chưa có trên hệ thống', 'orange'], diff: ['Thông tin lệch với hệ thống', 'red'] };
const normText = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
// Tìm theo số CCCD/QĐ rồi so các trường còn lại: Đã có (khớp hết) · Chưa có (không tìm thấy) · Lệch (≥ 1 trường không khớp)
const peopleLookup = (r) => {
  const found = VULNERABLE_REGISTRY.find((v) => v.id === r.id.trim());
  if (!found) return { state: 'none', diff: [] };
  const diff = PEOPLE_COLS.slice(1).filter(([key]) => normText(found[key]) !== normText(r[key])).map(([, label]) => label);
  return { state: diff.length ? 'diff' : 'ok', diff };
};
// Lỗi bắt buộc / định dạng của 1 dòng: { cột: câu báo } — CCCD 12 chữ số (Cộng đồng – Mái ấm nhập số QĐ thành lập), không trùng; điện thoại 10 số bắt đầu bằng 0
const peopleErrors = (r, rows) => {
  const e = {};
  const id = r.id.trim();
  if (!id) e.id = 'Vui lòng nhập Số CCCD/QĐ thành lập';
  else if (r.kind !== 'Cộng đồng – Mái ấm' && !/^\d{12}$/.test(id)) e.id = 'Số CCCD gồm 12 chữ số';
  else if (rows.filter((x) => x.id.trim() === id).length > 1) e.id = 'Trùng số CCCD/QĐ trong danh sách';
  if (!r.name.trim()) e.name = 'Vui lòng nhập Người yếu thế';
  if (!/^0\d{9}$/.test(r.phone.trim())) e.phone = r.phone.trim() ? 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0' : 'Vui lòng nhập Số điện thoại';
  if (!REG_KINDS.includes(r.kind)) e.kind = 'Vui lòng chọn Loại hồ sơ';
  if (!REG_GROUPS.includes(r.need)) e.need = 'Vui lòng chọn Nhu cầu cần trợ giúp';
  if (!REG_PROVINCES.includes(r.province)) e.province = 'Vui lòng chọn Tỉnh/thành phố';
  return e;
};
let regPeople = [];
const peopleChecked = new Set(); // các dòng đang tích chọn (theo đối tượng dòng trong regPeople)
const peopleRowErrors = new Map(); // dòng → { cột: câu báo } sau lần kiểm tra gần nhất (giữ ô đỏ khi chuyển trang)
const peopleBody = document.querySelector('#rg-people-rows');
const peopleAdd = document.querySelector('[data-people-add]');
const peopleCheckAll = document.querySelector('[data-people-check-all]');
const peopleRemoveChecked = document.querySelector('[data-people-remove-checked]');
const peopleRange = document.querySelector('#rg-people-range');
const peoplePager = document.querySelector('#rg-people-pager');
// Phân trang: 10 / 20 / 50 dòng mỗi trang, như bảng danh sách bên ngoài
const PEOPLE_PER_PAGE = [10, 20, 50];
let peoplePage = 1;
let peoplePerPage = PEOPLE_PER_PAGE[0];
const peoplePages = () => Math.max(1, Math.ceil(regPeople.length / peoplePerPage));
const pageOfPerson = (index) => Math.floor(index / peoplePerPage) + 1;
const peopleOnPage = () => regPeople.slice((peoplePage - 1) * peoplePerPage, peoplePage * peoplePerPage);
const blankPerson = () => ({ id: '', name: '', phone: '', kind: '', need: '', province: '' });
const peopleSelect = (key, label, values, value, errors) => `<span class="pf-cell-select"><select class="pf-cell-input${value ? '' : ' is-empty'}${errors[key] ? ' is-invalid' : ''}" data-key="${key}" aria-label="${label}"${errors[key] ? ` title="${escapeHtml(errors[key])}"` : ''}><option value="">Chọn</option>${values.map((v) => `<option${v === value ? ' selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select>${icon('chevron-down')}</span>`;
// Kết quả hệ thống (#19.11): chữ thường (không phải ô nhập), hiện đủ, tự xuống dòng, màu theo kết quả; lệch thì ghi thêm trường không khớp
const peopleResult = (r) => {
  if (!r.id.trim()) return '<span class="pf-cell-result is-empty">—</span>';
  const { state, diff } = peopleLookup(r);
  const [label, tone] = PEOPLE_RESULT[state];
  return `<span class="pf-cell-result is-${tone}">${label}${diff.length ? `<small>Không khớp: ${escapeHtml(diff.join(', '))}</small>` : ''}</span>`;
};
// i: vị trí trong toàn danh sách (số thứ tự liên tục qua các trang)
const peopleRow = (r, i) => {
  const n = i + 1;
  const checked = peopleChecked.has(r);
  const errors = peopleRowErrors.get(r) || {};
  const text = (key, attrs, label) => `<input class="pf-cell-input${errors[key] ? ' is-invalid' : ''}" type="text" ${attrs} value="${escapeHtml(r[key])}" data-key="${key}" aria-label="${label} dòng ${n}"${errors[key] ? ` title="${escapeHtml(errors[key])}"` : ''} />`;
  return `<tr data-index="${i}"${checked ? ' class="is-selected"' : ''}>
    <td class="pf-col-check"><input class="pf-check" type="checkbox" data-people-check aria-label="Chọn dòng ${n}"${checked ? ' checked' : ''} /></td>
    <td class="pf-col-index">${n}</td>
    <td>${text('id', 'maxlength="20" placeholder="12 chữ số"', 'Số CCCD/QĐ thành lập')}</td>
    <td>${text('name', 'maxlength="255" placeholder="Họ tên / tên cộng đồng"', 'Người yếu thế')}</td>
    <td>${text('phone', 'inputmode="numeric" maxlength="10" placeholder="0xxxxxxxxx"', 'Số điện thoại')}</td>
    <td>${peopleSelect('kind', `Loại hồ sơ dòng ${n}`, REG_KINDS, r.kind, errors)}</td>
    <td>${peopleSelect('need', `Nhu cầu cần trợ giúp dòng ${n}`, REG_GROUPS, r.need, errors)}</td>
    <td>${peopleSelect('province', `Tỉnh/thành phố dòng ${n}`, REG_PROVINCES, r.province, errors)}</td>
    <td class="pf-col-result">${peopleResult(r, n)}</td>
    <td class="pf-col-del is-actions"><div class="pf-cell-actions"><button class="pf-icon-btn" type="button" data-people-remove aria-label="Xóa dòng ${n}">${icon('trash')}</button><button class="pf-icon-btn" type="button" data-people-insert aria-label="Thêm dòng sau dòng ${n}">${icon('plus-square')}</button></div></td>
  </tr>`;
};
// Ô chọn tất cả: theo các dòng của trang đang xem · nút Xóa đã chọn (n): đếm các dòng đã tích ở mọi trang
const syncPeopleChecks = () => {
  const rows = peopleOnPage();
  const onPage = rows.filter((r) => peopleChecked.has(r)).length;
  const checked = regPeople.filter((r) => peopleChecked.has(r)).length;
  peopleCheckAll.disabled = rows.length === 0;
  peopleCheckAll.checked = rows.length > 0 && onPage === rows.length;
  peopleCheckAll.indeterminate = onPage > 0 && onPage < rows.length;
  peopleRemoveChecked.hidden = checked === 0;
  peopleRemoveChecked.querySelector('span').textContent = checked;
};
// Chân bảng: “Tổng: n” · nút trang (rút gọn “…”) · số dòng mỗi trang; ẩn khi bảng trống
const renderPeoplePager = () => {
  peopleRange.textContent = `Tổng: ${regPeople.length}`;
  peoplePager.innerHTML = `${vPager('data-people-page', peoplePage, peoplePages())}
    <span class="pf-input is-select pf-per-page"><select data-people-per-page aria-label="Số dòng mỗi trang">${PEOPLE_PER_PAGE.map((n) => `<option value="${n}"${n === peoplePerPage ? ' selected' : ''}>${n} / Trang</option>`).join('')}</select>${icon('chevron-down', 'icon pf-caret')}</span>`;
  peopleRange.closest('.pf-table-foot').hidden = regPeople.length === 0;
};
// Tiêu đề "Danh sách người yếu thế (n)", n = số dòng; chỉ dựng các dòng của trang đang xem
const renderPeople = () => {
  [...peopleChecked].forEach((r) => { if (!regPeople.includes(r)) peopleChecked.delete(r); });
  peoplePage = Math.min(Math.max(1, peoplePage), peoplePages());
  const start = (peoplePage - 1) * peoplePerPage;
  peopleBody.innerHTML = peopleOnPage().map((r, i) => peopleRow(r, start + i)).join('');
  document.querySelector('#rg-people-count').textContent = regPeople.length;
  document.querySelector('#rg-people-empty').hidden = regPeople.length > 0;
  peopleBody.closest('.pf-reg-list-scroll').hidden = regPeople.length === 0; // trống: ẩn cả khung bảng (không để dải trống / viền đôi)
  renderPeoplePager();
  syncPeopleChecks();
  syncGoodsTargets();
};
// Thêm mới: dòng trống cuối bảng · nút + ở dòng: chèn dòng trống ngay bên dưới — chuyển tới trang có dòng mới, đặt con trỏ vào ô đầu
const addPerson = (index) => {
  regPeople.splice(index, 0, blankPerson());
  peoplePage = pageOfPerson(index);
  renderPeople();
  peopleBody.querySelector(`tr[data-index="${index}"] [data-key="id"]`).focus();
  regChanged();
};
peopleAdd.addEventListener('click', () => addPerson(regPeople.length));
peopleBody.addEventListener('click', (event) => {
  const insert = event.target.closest('[data-people-insert]');
  if (insert) { addPerson(Number(insert.closest('tr').dataset.index) + 1); return; }
  const button = event.target.closest('[data-people-remove]');
  if (!button) return;
  regPeople.splice(Number(button.closest('tr').dataset.index), 1);
  renderPeople(); // trang hiện tại hết dòng thì lùi về trang trước
  peopleAdd.focus();
  regChanged();
});
peoplePager.addEventListener('click', (event) => {
  const button = event.target.closest('[data-people-page]');
  if (!button || button.disabled) return;
  peoplePage = Number(button.dataset.peoplePage);
  renderPeople();
  peopleBody.closest('.pf-reg-list').scrollIntoView({ block: 'nearest' });
});
peoplePager.addEventListener('change', (event) => {
  if (!event.target.matches('[data-people-per-page]')) return;
  peoplePerPage = Number(event.target.value);
  peoplePage = 1;
  renderPeople();
});
peopleBody.addEventListener('change', (event) => {
  if (!event.target.matches('[data-people-check]')) return;
  const row = event.target.closest('tr');
  const r = regPeople[Number(row.dataset.index)];
  if (event.target.checked) peopleChecked.add(r); else peopleChecked.delete(r);
  row.classList.toggle('is-selected', event.target.checked);
  syncPeopleChecks();
});
peopleCheckAll.addEventListener('change', () => {
  peopleOnPage().forEach((r) => { if (peopleCheckAll.checked) peopleChecked.add(r); else peopleChecked.delete(r); });
  renderPeople();
});
peopleRemoveChecked.addEventListener('click', () => {
  const count = regPeople.filter((r) => peopleChecked.has(r)).length;
  regPeople = regPeople.filter((r) => !peopleChecked.has(r));
  renderPeople();
  peopleAdd.focus();
  regChanged();
  showToast(`Đã xóa ${count} dòng.`);
});
peopleBody.addEventListener('input', (event) => {
  const el = event.target;
  if (!el.dataset.key) return; // ô tích chọn dòng: xử lý ở change
  const row = el.closest('tr');
  const r = regPeople[Number(row.dataset.index)];
  if (el.dataset.key === 'phone') el.value = el.value.replace(/\D/g, '');
  r[el.dataset.key] = el.value;
  el.classList.remove('is-invalid');
  el.removeAttribute('title');
  delete (peopleRowErrors.get(r) || {})[el.dataset.key];
  if (el.tagName === 'SELECT') el.classList.toggle('is-empty', !el.value);
  row.querySelector('.pf-col-result').innerHTML = peopleResult(r, Number(row.dataset.index) + 1);
  if (el.dataset.key === 'need') syncGoodsTargets();
});
// Tải file Excel mẫu (#19.1): sheet dữ liệu (tiêu đề + 1 dòng ví dụ) và sheet hướng dẫn kèm danh mục giá trị
const requireXlsx = () => {
  if (window.XLSX) return true;
  showToast('Không tải được công cụ Excel. Vui lòng tải lại trang.', 'error');
  return false;
};
document.querySelector('[data-people-template]').addEventListener('click', () => {
  if (!requireXlsx()) return;
  const sample = VULNERABLE_REGISTRY[0];
  const ws = XLSX.utils.aoa_to_sheet([PEOPLE_COLS.map(([, label]) => label), PEOPLE_COLS.map(([key]) => sample[key])]);
  ws['!cols'] = PEOPLE_COLS.map(() => ({ wch: 28 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nguoi yeu the');
  const guide = XLSX.utils.aoa_to_sheet([
    ['Hướng dẫn'],
    ['Điền dữ liệu từ dòng 2 của sheet Nguoi yeu the (dòng 2 là ví dụ). Giữ nguyên dòng tiêu đề.'],
    ['Tối đa 1.000 dòng dữ liệu, không tính dòng tiêu đề. Tất cả các cột đều bắt buộc.'],
    ['Số CCCD gồm 12 chữ số (Cộng đồng – Mái ấm nhập số QĐ thành lập), không trùng trong file. Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.'],
    ['Đặt định dạng Text cho cột Số CCCD/QĐ thành lập và Số điện thoại để giữ số 0 đầu.'],
    [`Loại hồ sơ: ${REG_KINDS.join('; ')}`],
    [`Nhu cầu cần trợ giúp: ${REG_GROUPS.join('; ')}`],
    [`Tỉnh/thành phố: ${REG_PROVINCES.join('; ')}`],
    ['Chỉ các dòng khớp hoàn toàn với danh sách Người yếu thế trên hệ thống được nhập vào chương trình.'],
  ]);
  guide['!cols'] = [{ wch: 120 }];
  XLSX.utils.book_append_sheet(wb, guide, 'Huong dan');
  XLSX.writeFile(wb, 'mau-danh-sach-nguoi-yeu-the.xlsx');
});

// ---------- Ẩn / hiện theo lựa chọn: Hình thức chọn người hưởng lợi (#17) → #18 / #19 · Loại nguồn lực (#21) → #25 (tiền) · #27, #28 (hàng hóa, vật tư) ----------
// Trường đang ẩn không bắt buộc, không kiểm tra
const regMode = document.querySelector('#rg-mode');
const syncRegVisibility = () => {
  document.querySelector('#rg-groups-field').hidden = regMode.value !== MODE_GROUP;
  document.querySelector('#rg-people-field').hidden = regMode.value !== MODE_LIST;
  const resources = multiValues(regResources);
  document.querySelector('#rg-money-field').hidden = !resources.includes(RES_MONEY);
  const goods = resources.includes('Hàng hóa') || resources.includes('Vật tư');
  ['#rg-goods-field', '#rg-depot-field'].forEach((id) => { document.querySelector(id).hidden = !goods; });
  syncGoodsTargets();
  regGroups.refit();
  fillRegRows();
};
// ---------- Lưới 2 cột không để ô trống: sau khi ẩn / hiện trường, ô nửa cột nào đứng lẻ 1 mình trên hàng thì giãn hết hàng (.is-fill) ----------
// VD bỏ Tiền mặt → ẩn Mục tiêu quyên góp: Thời gian tiếp nhận | Địa điểm tập kết; có cả tiền và hàng hóa: Địa điểm tập kết giãn hết hàng
const fillRegRows = () => {
  reg.querySelectorAll('.pf-reg-section .pf-fields').forEach((grid) => {
    let alone = null; // ô nửa cột đang chờ ghép cặp trên hàng hiện tại
    [...grid.children].forEach((cell) => {
      cell.classList.remove('is-fill');
      if (cell.hidden) return;
      if (cell.classList.contains('is-wide')) { alone?.classList.add('is-fill'); alone = null; return; }
      alone = alone ? null : cell;
    });
    alone?.classList.add('is-fill');
  });
};
regMode.addEventListener('change', syncRegVisibility);
reg.addEventListener('multi-change', (event) => { if (event.target === regResources.root || event.target === regGroups.root) syncRegVisibility(); });

// ---------- Địa điểm hàng hóa tập kết (#27): gợi ý địa chỉ theo chữ đang nhập (không cần dấu), ↑ ↓ chọn, Enter điền; vẫn giữ được địa chỉ tự nhập ----------
// Gợi ý minh họa — khi triển khai thật nối dịch vụ tìm địa chỉ (kiểu Google Maps)
const REG_DEPOTS = [
  'Kho Hội Chữ thập đỏ thành phố Hà Nội, xã Đông Anh, Hà Nội',
  'Trung tâm cứu trợ khẩn cấp, phường Long Biên, Hà Nội',
  'Kho hàng cứu trợ, phường Đông Hà, tỉnh Quảng Trị',
  'Nhà văn hóa xã Hải Lăng, tỉnh Quảng Trị',
  'Kho Hội Chữ thập đỏ tỉnh Hà Tĩnh, phường Thành Sen, Hà Tĩnh',
  'Trường THCS xã Hương Khê, tỉnh Hà Tĩnh',
  'Kho hàng cứu trợ, phường Vinh Phú, tỉnh Nghệ An',
  'Nhà văn hóa xã Kỳ Sơn, tỉnh Nghệ An',
  'Kho Hội Chữ thập đỏ tỉnh Cao Bằng, phường Thục Phán, Cao Bằng',
  'Kho Hội Chữ thập đỏ thành phố Huế, phường Thuận Hóa, Huế',
  'Kho Hội Chữ thập đỏ thành phố Hồ Chí Minh, phường Sài Gòn, TP. Hồ Chí Minh',
  ...REG_PROVINCES.map((name) => `Trụ sở Hội Chữ thập đỏ ${name.charAt(0).toLowerCase()}${name.slice(1)}`),
];
const regSuggest = (() => {
  const input = document.querySelector('#rg-depot');
  const list = document.querySelector('#rg-depot-list');
  let items = [];
  let active = -1;
  const isOpen = () => !list.hidden;
  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const setActive = (i) => {
    active = (i + items.length) % items.length;
    [...list.children].forEach((li, n) => li.classList.toggle('is-active', n === active));
    input.setAttribute('aria-activedescendant', `rg-depot-opt-${active}`);
  };
  const pick = (value) => {
    input.value = value;
    close();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  input.addEventListener('input', (event) => {
    if (!event.isTrusted) return;
    const words = fold(input.value.trim()).split(/[\s,]+/).filter(Boolean);
    items = words.length ? REG_DEPOTS.filter((a) => words.every((w) => fold(a).includes(w))).slice(0, 6) : [];
    list.innerHTML = items.map((a, i) => `<li role="option" id="rg-depot-opt-${i}" aria-selected="false">${escapeHtml(a)}</li>`).join('');
    list.hidden = !items.length;
    input.setAttribute('aria-expanded', String(!list.hidden));
    active = -1;
  });
  input.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(active < 0 ? 0 : active + (event.key === 'ArrowDown' ? 1 : -1)); }
    else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); pick(items[active]); }
  });
  // mousedown: chọn trước khi ô nhập mất focus (blur đóng danh sách)
  list.addEventListener('mousedown', (event) => {
    const li = event.target.closest('li');
    if (!li) return;
    event.preventDefault();
    pick(items[[...list.children].indexOf(li)]);
  });
  input.addEventListener('blur', close);
  return { isOpen, close };
})();

// ---------- Thẻ phần mở / thu gọn: bấm thanh tiêu đề; đang chạy hiệu ứng thì cắt tràn, mở xong bỏ cắt để danh sách chọn nhiều không bị che ----------
const setRegSection = (section, open, animate = true) => {
  const toggle = section.querySelector('.pf-reg-section-toggle');
  if ((toggle.getAttribute('aria-expanded') === 'true') === open) return;
  if (!open) regMultis.forEach((m) => { if (section.contains(m.root)) m.setOpen(false); });
  toggle.setAttribute('aria-expanded', String(open));
  section.classList.toggle('is-animating', animate && !regReduced());
  section.classList.toggle('is-instant', !animate);
  section.classList.toggle('is-collapsed', !open);
  if (!animate) { void section.offsetHeight; section.classList.remove('is-instant'); }
};
reg.querySelectorAll('.pf-reg-section.is-collapsible').forEach((section) => {
  const body = section.querySelector('.pf-reg-section-body');
  section.querySelector('.pf-reg-section-toggle').addEventListener('click', (event) => {
    setRegSection(section, event.currentTarget.getAttribute('aria-expanded') !== 'true');
  });
  body.addEventListener('transitionend', (event) => {
    if (event.target === body && event.propertyName === 'grid-template-rows') section.classList.remove('is-animating');
  });
});

// ---------- Đọc / nạp dữ liệu biểu mẫu ----------
const regValue = (id) => document.querySelector(`#${id}`).value.trim();
const regDateText = (id) => document.querySelector(`#${id}`).closest('[data-vi-date]').querySelector('input[type="text"]').value.trim();
const regChecked = (name) => [...regForm.querySelectorAll(`input[name="${name}"]:checked`)].map((c) => c.value);
const regFormData = () => ({
  name: regValue('rg-name'), field: regValue('rg-field'), priority: regValue('rg-priority'),
  creator: regValue('rg-creator'), creatorName: regValue('rg-creator-name'), phone: regValue('rg-phone'), email: regValue('rg-email'),
  unit: regValue('rg-unit'), owner: regValue('rg-owner'), banner: listFiles(regBannerList)[0] || null, photos: listFiles(regPhotoList),
  goal: regValue('rg-goal'), target: regValue('rg-target'), area: regValue('rg-area'), support: regValue('rg-support'),
  runFrom: regDateText('rg-run-from'), runTo: regDateText('rg-run-to'),
  mode: regMode.value, groups: multiValues(regGroups), people: regPeople.map((r) => ({ ...r })),
  resources: multiValues(regResources), transport: regValue('rg-transport'), funding: regChecked('rg-funding'), campaign: regChecked('rg-campaign'),
  money: Number(regMoney.value.replace(/\D/g, '')) || null, raiseFrom: regDateText('rg-raise-from'), raiseTo: regDateText('rg-raise-to'),
  goods: [...goodsBody.rows].map(goodsRowData).filter((g) => !isBlankGoods(g)), depot: regValue('rg-depot'),
  assign: assignRows(), volunteers: regValue('rg-volunteers'), docs: listFiles(regDocs),
});
let regSaved = ''; // dữ liệu lúc mở / lưu gần nhất — khác thì có thay đổi chưa lưu
const regDirty = () => JSON.stringify(regFormData()) !== regSaved;
// Thêm mới: Đối tượng tạo, Tên đối tượng tạo (chỉ đọc), Số điện thoại, Email (cho sửa) lấy theo tài khoản
const regBlank = () => ({
  name: '', field: '', priority: '', creator: REG_ACCOUNT.type, creatorName: REG_ACCOUNT.name, phone: REG_ACCOUNT.phone, email: REG_ACCOUNT.email,
  unit: '', owner: '', banner: null, photos: [], goal: '', target: '', area: '', support: '', runFrom: '', runTo: '',
  mode: '', groups: [], people: [], resources: [], transport: '', funding: [], campaign: [], money: null, raiseFrom: '', raiseTo: '',
  goods: [], depot: '', assign: [], volunteers: '', docs: [],
});
const loadRegister = (d) => {
  const set = (id, value) => { document.querySelector(`#${id}`).value = value ?? ''; };
  const setDate = (id, vi) => {
    const native = document.querySelector(`#${id}`);
    native.value = viToIso(vi || '');
    native.closest('[data-vi-date]').querySelector('input[type="text"]').value = vi || '';
  };
  set('rg-name', d.name); set('rg-field', d.field); set('rg-priority', d.priority); syncPriorityDot();
  set('rg-creator', d.creator); set('rg-creator-name', d.creatorName); set('rg-phone', d.phone); set('rg-email', d.email);
  set('rg-unit', d.unit); set('rg-owner', d.owner);
  renderFiles(regBannerList, d.banner ? [d.banner] : []);
  renderFiles(regPhotoList, d.photos);
  set('rg-goal', d.goal); set('rg-target', d.target); set('rg-area', d.area); set('rg-support', d.support);
  setDate('rg-run-from', d.runFrom); setDate('rg-run-to', d.runTo);
  // Hình thức, nhóm đối tượng, danh sách người yếu thế nạp trước bảng hàng hóa (danh sách Đối tượng sử dụng phụ thuộc)
  regMode.value = d.mode;
  regGroups.setValues(d.groups);
  regPeople = d.people.map((r) => ({ ...r }));
  renderPeople();
  regResources.setValues(d.resources);
  set('rg-transport', d.transport);
  regForm.querySelectorAll('input[name="rg-funding"], input[name="rg-campaign"]').forEach((c) => { c.checked = (c.name === 'rg-funding' ? d.funding : d.campaign).includes(c.value); });
  setRegMoney(d.money);
  setDate('rg-raise-from', d.raiseFrom); setDate('rg-raise-to', d.raiseTo);
  syncRegVisibility();
  loadRegList(goodsList, d.goods, fillGoodsRow);
  set('rg-depot', d.depot);
  loadRegList(assignList, d.assign, fillAssignRow);
  set('rg-volunteers', d.volunteers);
  renderFiles(regDocs, d.docs);
  regForm.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  reg.querySelectorAll('.pf-reg-section.is-collapsible').forEach((section) => setRegSection(section, true, false));
};
// Bản nháp minh họa (chưa có dữ liệu biểu mẫu trong phiên): điền lại phần suy ra được, phần còn lại người dùng nhập tiếp
const regDataFromProgram = (p) => {
  const f = programForm(p);
  return {
    ...regBlank(), name: p.name, field: p.field, priority: PRIORITY[f.priority] ? f.priority : '', unit: p.unit, owner: p.owner,
    goal: f.goal, target: f.target, area: REG_PROVINCES.find((name) => name.endsWith(p.area)) || '', support: f.support,
    runFrom: f.runFrom, runTo: f.runTo, mode: MODE_GROUP, groups: f.groups.filter((g) => REG_GROUPS.includes(g)),
    resources: f.resources.filter((r) => [RES_MONEY, 'Hàng hóa', 'Vật tư'].includes(r)), transport: f.transport,
    funding: f.funding, campaign: f.campaign, money: f.money, depot: f.depot,
    assign: f.assign.map(([unit, person, task, date]) => ({ unit, person, task, date })), volunteers: String(f.volunteers ?? ''),
  };
};

// ---------- Mã CT · ghi chương trình vào danh sách ----------
// Mã CT-<năm>-<STT 3 số>: chỉ cấp khi gửi phê duyệt (Lưu và tạo chương trình); bản nháp chưa có mã; không dùng lại mã đã cấp
let regEditCode = null; // mã chương trình đang sửa — null: chương trình mới, chưa cấp mã
let regCodeSeq = Math.max(0, ...PROGRAMS.filter((p) => p.code.startsWith('CT-')).map((p) => Number(p.code.split('-').pop()) || 0));
let regDraftSeq = Math.max(0, ...PROGRAMS.filter((p) => p.code.startsWith('NHAP-')).map((p) => Number(p.code.split('-').pop()) || 0));
const programCode = (seq) => `CT-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
// Mục tiêu rút gọn (SRS #8.8): < 1 triệu đủ số; triệu / tỷ giữ tối đa 1 chữ số thập phân, cắt bỏ (không làm tròn), dấu thập phân ","
const shortVnd = (n) => {
  if (n < 1e6) return `${n.toLocaleString('vi-VN')} ₫`;
  const [div, unit] = n < 1e9 ? [1e6, 'triệu'] : [1e9, 'tỷ'];
  return `${String(Math.floor((n * 10) / div) / 10).replace('.', ',')} ${unit} ₫`;
};
const programFromForm = (d, status) => {
  const money = d.resources.includes(RES_MONEY) ? d.money : null;
  return {
    img: d.banner?.url || PV_PHOTOS[0], photos: d.photos.map((f) => f.url).filter(Boolean),
    name: d.name || 'Chương trình chưa đặt tên', desc: d.goal || d.target, field: d.field || 'Chưa chọn lĩnh vực', tone: 'blue',
    unit: d.unit || 'Chưa chọn đơn vị chủ trì', owner: d.owner || 'Chưa cập nhật', area: d.area || 'Chưa chọn địa bàn',
    goal: money ? shortVnd(money) : '—', raised: '0 ₫', pct: status === 'draft' ? null : 0,
    period: viToIso(d.runFrom) && viToIso(d.runTo) ? `${d.runFrom} – ${d.runTo}` : 'Chưa xác định',
    note: status === 'draft' ? 'Bản nháp, chưa gửi duyệt' : 'Chờ duyệt hồ sơ, chưa mở vận động',
    status, updated: localIso(), creator: d.creator, goalValue: money ? money / 1e6 : null,
  };
};
const refillSelect = (select, values) => {
  const current = select.value;
  select.length = 1;
  fillOptions(select, values);
  select.value = values.includes(current) ? current : '';
};
// Dựng lại bảng, tab, bộ lọc Lĩnh vực, số liệu cột trái sau khi lưu / xóa
const refreshPrograms = () => {
  sortPrograms();
  refillSelect(ct.field, [...new Set(PROGRAMS.map((p) => p.field))]);
  applyProgramFilter();
  if (!document.querySelector('#screen-chuong-trinh').hidden) renderTabs('chuong-trinh', ct.status);
  renderSideStats();
};
const saveProgram = (status) => {
  const d = regFormData();
  let p = regEditCode && findProgram(regEditCode);
  // Nháp: chưa cấp Mã CT (khóa nội bộ NHAP-n) · gửi phê duyệt: cấp Mã CT chính thức (bản nháp đổi khóa sang mã mới)
  const issueCode = () => { regCodeSeq += 1; return programCode(regCodeSeq); };
  if (!p) {
    p = { code: status === 'draft' ? `NHAP-${(regDraftSeq += 1)}` : issueCode(), created: localIso(), createdAt: Date.now() };
    PROGRAMS.push(p);
  } else if (status !== 'draft' && p.code.startsWith('NHAP-')) {
    programRegCache.delete(p.code);
    p.code = issueCode();
  }
  regEditCode = p.code;
  document.querySelector('#rg-code').value = status === 'draft' ? '' : p.code;
  Object.assign(p, programFromForm(d, status));
  programRegCache.set(p.code, d);
  regSaved = JSON.stringify(d);
  refreshPrograms();
  return p;
};
// Quay về danh sách, mở tab theo trạng thái vừa lưu (bước 11)
const goProgramTab = (status) => {
  const hash = `#chuong-trinh/${PROGRAM_STATUS[status].slug}`;
  if (window.location.hash === hash) showRoute(); else window.location.hash = hash;
};

// ---------- Tự động lưu nháp (NL05): 30 giây không thao tác, chỉ lưu khi có thay đổi; không áp dụng với chương trình đã gửi ----------
const REG_AUTOSAVE_MS = 30000;
let regAutoTimer;
let regBusy = false;
const autoSaveRegister = () => {
  if (reg.hidden || regBusy || !regDirty()) return;
  if (regEditCode && findProgram(regEditCode)?.status !== 'draft') return;
  saveProgram('draft');
  regStatus.textContent = `Tự động lưu nháp ${nowTime()}`;
};
const regChanged = () => {
  clearTimeout(regAutoTimer);
  if (!reg.hidden) regAutoTimer = setTimeout(autoSaveRegister, REG_AUTOSAVE_MS);
};
['input', 'change', 'multi-change', 'reg-change'].forEach((type) => regForm.addEventListener(type, regChanged));

// ---------- Kiểm tra dữ liệu (bước 8): Lưu bản nháp — chỉ định dạng các trường đã nhập · Lưu và tạo chương trình — đủ trường bắt buộc và ràng buộc ----------
const nowTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
regForm.addEventListener('input', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.value && event.target.value.trim()) field.classList.remove('is-invalid');
});
const validateRegister = (full) => {
  // Map ô lỗi → câu báo (giữ câu đầu tiên của mỗi ô)
  const invalid = new Map();
  const bad = (field, msg) => { if (field && !invalid.has(field)) invalid.set(field, msg); };
  const shown = (el) => !el.closest('[hidden]');
  regForm.querySelectorAll('.pf-cell-input.is-invalid, .pf-cell-file.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  if (full) {
    regForm.querySelectorAll('input[required], select[required], textarea[required]').forEach((el) => {
      if (!shown(el) || el.value.trim()) return;
      const field = el.closest('.pf-field');
      bad(field, `Vui lòng ${el.tagName === 'SELECT' ? 'chọn' : 'nhập'} ${fieldName(field)}.`);
    });
    [regGroups, regResources].forEach((m) => {
      if (!shown(m.root) || m.selected().length) return;
      const field = m.root.closest('.pf-field');
      bad(field, `Vui lòng chọn ${fieldName(field)}.`);
    });
    regForm.querySelectorAll('[data-required-checks]').forEach((field) => {
      if (!regChecked(field.dataset.requiredChecks).length) bad(field, `Vui lòng chọn ${fieldName(field)}.`);
    });
    if (!regBannerList.children.length) bad(regBannerList.closest('.pf-field'), 'Vui lòng tải lên ảnh / banner chiến dịch.');
    if (!regDocs.children.length) bad(regDocs.closest('.pf-field'), 'Vui lòng tải lên hồ sơ đề án và văn bản pháp lý.');
    if (shown(regMoney) && regMoney.value && !(Number(regMoney.value.replace(/\D/g, '')) > 0)) bad(regMoney.closest('.pf-field'), 'Mục tiêu quyên góp phải lớn hơn 0.');
    // Danh sách người yếu thế: ít nhất 1 dòng, mỗi dòng đủ và đúng định dạng (ô lỗi tô đỏ, rê chuột xem lý do)
    const peopleField = document.querySelector('#rg-people-field');
    if (shown(peopleField)) {
      if (!regPeople.length) bad(peopleField, 'Vui lòng thêm ít nhất 1 người yếu thế.');
      // Lỗi từng dòng giữ trong peopleRowErrors (ô đỏ vẫn còn khi chuyển trang); mở trang có dòng lỗi đầu tiên
      let first = 0;
      peopleRowErrors.clear();
      regPeople.forEach((r, i) => {
        const errors = peopleErrors(r, regPeople);
        if (!Object.keys(errors).length) return;
        peopleRowErrors.set(r, errors);
        if (!first) first = i + 1;
      });
      if (first) peoplePage = pageOfPerson(first - 1);
      renderPeople();
      if (first) bad(peopleField, `Thông tin người yếu thế chưa hợp lệ (dòng ${first}). Rê chuột vào ô tô đỏ để xem lý do.`);
    }
    // Danh sách hàng hóa nhận: ít nhất 1 dòng có dữ liệu, dòng đã nhập phải đủ tất cả cột (dòng trống bỏ qua)
    const goodsField = document.querySelector('#rg-goods-field');
    if (shown(goodsField)) {
      const filled = [...goodsBody.rows].filter((row) => !isBlankGoods(goodsRowData(row)));
      if (!filled.length) bad(goodsField, 'Vui lòng nhập ít nhất 1 hàng hóa.');
      let first = 0;
      filled.forEach((row) => {
        const errors = goodsErrors(goodsRowData(row));
        errors.forEach((key) => (key === 'docs' ? cell(row, key).closest('.pf-cell-file') : cell(row, key)).classList.add('is-invalid'));
        if (!first && errors.length) first = row.sectionRowIndex + 1;
      });
      if (first) bad(goodsField, `Vui lòng nhập đầy đủ, đúng định dạng thông tin hàng hóa (dòng ${first}).`);
    }
  }
  const phone = document.querySelector('#rg-phone');
  if (phone.value && !/^0\d{9}$/.test(phone.value)) bad(phone.closest('.pf-field'), 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0).');
  const email = document.querySelector('#rg-email');
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad(email.closest('.pf-field'), 'Địa chỉ email không hợp lệ.');
  REG_RANGES.forEach(([from, to, raise]) => {
    const msg = rangeError(from, to, raise);
    if (msg) bad(document.querySelector(`#${from}`).closest('.pf-field'), msg);
  });
  regForm.querySelectorAll('.pf-field').forEach((field) => field.classList.toggle('is-invalid', invalid.has(field)));
  syncFieldErrors(regForm, invalid);
  return [...regForm.querySelectorAll('.pf-field.is-invalid')];
};
// Dữ liệu lỗi (8a): mở thẻ đang thu gọn có trường lỗi (không hiệu ứng), cuộn đến trường lỗi đầu tiên, giữ dữ liệu
const focusRegInvalid = (invalid) => {
  invalid.forEach((field) => { const section = field.closest('.pf-reg-section.is-collapsible'); if (section) setRegSection(section, true, false); });
  invalid[0].scrollIntoView({ behavior: regReduced() ? 'auto' : 'smooth', block: 'center' });
  const focusable = invalid[0].querySelector('.is-invalid, input:not([type="file"]):not([readonly]):not(.pf-date-native), select, textarea, button');
  if (focusable) focusable.focus({ preventScroll: true });
  showToast(REG_MSG.invalid, 'error');
};

// ---------- Lưu bản nháp (9a — TB04) · Lưu và tạo chương trình (9b — Chờ phê duyệt, TB05; đưa vào màn phê duyệt của Đơn vị chủ trì, gửi TB12 cho Web quản trị) ----------
// Dữ liệu hợp lệ (8b): khóa nút trong lúc xử lý để tránh gửi trùng; bước 10 ghi nhật ký (người, thời gian, hành động, trạng thái) thực hiện phía máy chủ
const regActions = [...reg.querySelectorAll('[data-save-draft], [type="submit"]')];
const setRegBusy = (busy) => {
  regBusy = busy;
  regActions.forEach((button) => { button.disabled = busy; });
  regForm.setAttribute('aria-busy', String(busy));
};
const commitRegister = (status) => {
  if (regEditCode && findProgram(regEditCode)?.status !== 'draft') { showToast(REG_MSG.changed, 'warning'); return; }
  clearTimeout(regAutoTimer);
  setRegBusy(true);
  setTimeout(() => {
    saveProgram(status);
    setRegBusy(false);
    closeRegister();
    goProgramTab(status);
    showToast(status === 'draft' ? REG_MSG.draft : REG_MSG.sent);
  }, regReduced() ? 0 : 500);
};
reg.querySelector('[data-save-draft]').addEventListener('click', () => {
  const invalid = validateRegister(false);
  if (invalid.length) { focusRegInvalid(invalid); return; }
  commitRegister('draft');
});
regForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (regBusy) return;
  const invalid = validateRegister(true);
  if (invalid.length) { focusRegInvalid(invalid); return; }
  commitRegister('pending');
});

// ---------- Thêm mới (kiểm tra tài khoản đã xác minh — bước 2, NL01) · Sửa bản nháp (NL02) · Xóa bản nháp (NL03) ----------
const startRegister = (trigger) => {
  if (!REG_ACCOUNT.verified) { showToast(REG_MSG.unverified, 'warning'); return; }
  loadRegister(regBlank());
  regEditCode = null;
  document.querySelector('#rg-code').value = '';
  document.querySelector('#pf-reg-title').textContent = 'Đăng ký chương trình';
  regStatus.textContent = '';
  openRegister(trigger);
};
const editProgram = (code, trigger) => {
  const p = findProgram(code);
  if (!p || p.status !== 'draft') { showToast(REG_MSG.changed, 'warning'); return; }
  loadRegister(programRegCache.get(code) || regDataFromProgram(p));
  regEditCode = code;
  document.querySelector('#rg-code').value = ''; // bản nháp chưa có mã
  document.querySelector('#pf-reg-title').textContent = 'Chỉnh sửa bản nháp chương trình';
  regStatus.textContent = `Lưu nháp gần nhất: ${viDate(p.updated)}`;
  openRegister(trigger);
};
const deleteProgram = async (code) => {
  if (findProgram(code)?.status !== 'draft') { showToast(REG_MSG.changed, 'warning'); return; }
  const yes = await confirmAction({ title: 'Xóa chương trình', text: 'Bạn chắc chắn muốn xóa chương trình này?', ok: 'Xóa' }); // TB06
  if (!yes) return;
  const index = PROGRAMS.findIndex((p) => p.code === code);
  if (index < 0 || PROGRAMS[index].status !== 'draft') { showToast(REG_MSG.changed, 'warning'); return; }
  PROGRAMS.splice(index, 1); // xóa mềm phía máy chủ
  programRegCache.delete(code);
  refreshPrograms();
  showToast(REG_MSG.deleted);
};

// ==================== SECTION: NHẬP DANH SÁCH NGƯỜI YẾU THẾ TỪ EXCEL — popup "Tải tệp đính kèm" (SRS Mockup 2a, NL11) ====================
// Nhập từ Excel: bảng #19 đã có dữ liệu thì hỏi ghi đè (TB13) → chọn 1 tệp xlsx/xls (sai: TB14) → Kiểm tra dữ liệu (quá 1.000 dòng: TB16)
// → chia Danh sách hợp lệ / KHÔNG hợp lệ → Lưu: thay toàn bộ bảng #19 bằng các dòng hợp lệ (TB15).
const regImport = document.querySelector('#pf-import');
const importFile = document.querySelector('#pf-import-file');
const importZone = document.querySelector('#pf-import-zone');
const importFiles = document.querySelector('#pf-import-files');
const importError = document.querySelector('#pf-import-error');
const importCheck = document.querySelector('#pf-import-check');
const importSave = document.querySelector('#pf-import-save');
const importResult = document.querySelector('#pf-import-result');
const IMPORT_MAX_ROWS = 1000;
let importState = { file: null, valid: [] };
const importMessage = (text) => {
  importError.hidden = !text;
  importError.innerHTML = text ? `${icon('alert')}<span>${escapeHtml(text)}</span>` : '';
};
// Xóa tệp thì xóa luôn kết quả kiểm tra
const resetImport = () => {
  importState = { file: null, valid: [] };
  importFiles.innerHTML = '';
  importZone.hidden = false;
  importResult.innerHTML = '';
  importMessage('');
  importCheck.disabled = true;
  importSave.disabled = true;
};
const takeImport = (files) => {
  if (files.length !== 1 || !/\.(xlsx|xls)$/i.test(files[0].name)) { importMessage('Chỉ được tải lên 1 file định dạng xlsx hoặc xls.'); return; } // TB14
  const [file] = files;
  resetImport();
  importState.file = file;
  importZone.hidden = true;
  importFiles.innerHTML = `<li class="pf-file">
    <span class="pf-file-icon" aria-hidden="true">${icon('document')}</span>
    <div class="pf-file-text"><p class="pf-file-name"><span class="pf-clamp-1">${escapeHtml(file.name)}</span></p><p class="pf-file-meta">${fileSize(file.size)}<span aria-hidden="true">•</span>${viDate(localIso())}</p></div>
    <button class="pf-icon-btn" type="button" data-import-remove aria-label="Xóa tệp ${escapeHtml(file.name)}">${icon('trash')}</button>
  </li>`;
  importCheck.disabled = false;
};
importFile.addEventListener('change', () => { takeImport([...importFile.files]); importFile.value = ''; });
['dragenter', 'dragover'].forEach((type) => importZone.addEventListener(type, (event) => { event.preventDefault(); importZone.classList.add('is-dragover'); }));
['dragleave', 'drop'].forEach((type) => importZone.addEventListener(type, () => importZone.classList.remove('is-dragover')));
importZone.addEventListener('drop', (event) => { event.preventDefault(); takeImport([...event.dataTransfer.files]); });
importFiles.addEventListener('click', (event) => {
  if (!event.target.closest('[data-import-remove]')) return;
  resetImport();
  importFile.focus();
});
// Bảng kết quả: cột giống bảng #19; cột Kết quả hệ thống ghi rõ lý do (trường lệch / sai định dạng)
const importTable = (title, items) => `<section class="pf-import-group" aria-label="${title}">
  <h3 class="pf-import-group-title">${title} (${items.length} Người)</h3>
  ${items.length ? `<div class="pf-reg-list-scroll pf-import-scroll"><table class="pf-reg-table is-import">
    <thead><tr><th scope="col" class="pf-col-index">#</th>${PEOPLE_COLS.map(([, label]) => `<th scope="col">${label}</th>`).join('')}<th scope="col">Kết quả hệ thống</th></tr></thead>
    <tbody>${items.map(({ r, label, tone }, i) => `<tr><td class="pf-col-index">${i + 1}</td>${PEOPLE_COLS.map(([key]) => `<td>${r[key] ? escapeHtml(r[key]) : '<span class="pf-muted">—</span>'}</td>`).join('')}<td><span class="pf-badge pf-badge-sm pf-import-reason is-${tone}">${escapeHtml(label)}</span></td></tr>`).join('')}</tbody>
  </table></div>` : '<p class="pf-reg-list-empty">Không có bản ghi.</p>'}
</section>`;
importCheck.addEventListener('click', async () => {
  if (!importState.file || !requireXlsx()) return;
  importMessage('');
  importResult.innerHTML = '';
  importSave.disabled = true;
  try {
    const wb = XLSX.read(await importState.file.arrayBuffer(), { type: 'array' });
    const sheet = wb.Sheets['Nguoi yeu the'] || wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    const header = (data.shift() || []).map((v) => String(v).trim());
    const rows = data.filter((row) => row.some((v) => String(v).trim()));
    if (rows.length > IMPORT_MAX_ROWS) { importMessage('File vượt quá 1.000 dòng dữ liệu. Vui lòng chia nhỏ file và thử lại.'); return; } // TB16: không kiểm tra, Lưu giữ khóa
    const cols = PEOPLE_COLS.map(([key, label]) => [key, header.indexOf(label)]);
    if (cols.some(([, i]) => i < 0)) { importMessage('File thiếu cột. Vui lòng dùng file Excel mẫu.'); return; }
    const records = rows.map((row) => {
      const r = Object.fromEntries(cols.map(([key, i]) => [key, String(row[i] ?? '').trim()]));
      // Excel đổi ô số thành số: bù số 0 đầu bị mất (CCCD 12 chữ số, điện thoại 10 chữ số)
      if (/^\d{9,11}$/.test(r.id)) r.id = r.id.padStart(12, '0');
      if (/^\d{9}$/.test(r.phone)) r.phone = `0${r.phone}`;
      return r;
    });
    // Hợp lệ: đủ, đúng định dạng và "Đã có trên hệ thống"; còn lại vào KHÔNG hợp lệ
    const valid = [];
    const invalid = [];
    records.forEach((r) => {
      const errors = Object.values(peopleErrors(r, records));
      if (errors.length) { invalid.push({ r, label: `Sai định dạng/thiếu trường: ${errors.join('; ')}`, tone: 'red' }); return; }
      const { state, diff } = peopleLookup(r);
      if (state === 'ok') valid.push({ r, label: PEOPLE_RESULT.ok[0], tone: 'green' });
      else invalid.push({ r, label: state === 'diff' ? `${PEOPLE_RESULT.diff[0]}: ${diff.join(', ')}` : PEOPLE_RESULT.none[0], tone: PEOPLE_RESULT[state][1] });
    });
    importState.valid = valid.map(({ r }) => r);
    importResult.innerHTML = importTable('Danh sách hợp lệ', valid) + importTable('Danh sách KHÔNG hợp lệ', invalid);
    importSave.disabled = !valid.length;
    if (!valid.length) importMessage('Không có bản ghi hợp lệ để lưu.');
  } catch (error) {
    importMessage('Không đọc được file. Vui lòng dùng file Excel mẫu.');
  }
});
importSave.addEventListener('click', () => {
  const count = importState.valid.length;
  regPeople = importState.valid.map((r) => ({ ...r }));
  renderPeople();
  document.querySelector('#rg-people-field').classList.remove('is-invalid');
  regImport.close();
  regChanged();
  showToast(`Đã nhập ${count} người yếu thế hợp lệ vào danh sách.`); // TB15
});
document.querySelector('[data-people-import]').addEventListener('click', async () => {
  if (regPeople.length) {
    const yes = await confirmAction({ title: 'Nhập danh sách mới', text: 'Danh sách người yếu thế hiện đã có dữ liệu. Nếu nhập danh sách mới, toàn bộ dữ liệu cũ sẽ bị xóa và thay bằng dữ liệu mới. Bạn có chắc chắn muốn tiếp tục không?', ok: 'Xác nhận' }); // TB13
    if (!yes) return;
  }
  resetImport();
  regImport.showModal();
});
// Hủy / × / Esc / bấm nền: đóng, không đổi bảng #19
regImport.querySelectorAll('[data-import-close]').forEach((button) => button.addEventListener('click', () => regImport.close()));
regImport.addEventListener('click', (event) => { if (event.target === regImport) regImport.close(); });
regImport.addEventListener('close', () => document.querySelector('[data-people-import]').focus());
// ==================== END SECTION: NHẬP DANH SÁCH NGƯỜI YẾU THẾ TỪ EXCEL ====================

// ==================== SECTION: ĐĂNG KÝ THÀNH LẬP ĐỘI, CLB — drawer cùng khung Đăng ký chương trình ====================
// Mở từ nút Thêm mới của danh sách #thanh-lap-doi. Trường theo màn CD-00b (đặc tả 04 mục 5) đổi sang đội, CLB; Cam kết theo CD-04.
const team = document.querySelector('#pf-team');
const teamPanel = team.querySelector('.pf-reg-panel');
const teamBody = team.querySelector('.pf-reg-body');
const teamForm = document.querySelector('#pf-team-form');
const teamStatus = document.querySelector('#pf-team-status');
let teamTrigger = null;
teamPanel.tabIndex = -1;

// ---------- Mở / đóng: như drawer Đăng ký chương trình ----------
const openTeam = (trigger) => {
  teamTrigger = trigger;
  team.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  teamBody.scrollTop = 0;
  // Ngày ký: ngày mở biểu mẫu (dd/mm/yyyy), khóa
  const now = new Date();
  document.querySelector('#tm-sign-date').value = isoToVi(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  requestAnimationFrame(() => {
    team.classList.add('is-open');
    teamPanel.focus({ preventScroll: true });
    teamMultis.forEach((m) => m.refit()); // lúc drawer còn ẩn chưa đo được bề rộng ô
  });
};
const closeTeam = () => {
  team.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  setTimeout(() => { team.hidden = true; }, regReduced() ? 0 : 300);
  if (teamTrigger) teamTrigger.focus();
};
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open-team]');
  if (trigger) openTeam(trigger);
});
team.querySelectorAll('[data-close-team]').forEach((button) => button.addEventListener('click', closeTeam));
document.addEventListener('keydown', (event) => {
  if (team.hidden || dialog.open || teamPdf.open || teamConfirm.open) return;
  if (event.key === 'Escape') {
    const openMulti = teamMultis.find((m) => m.isOpen());
    if (openMulti) openMulti.setOpen(false, true); else closeTeam();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = [...teamPanel.querySelectorAll('a[href], button:not([disabled]), input, select, textarea')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === teamPanel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

// ---------- Phường/xã → Đơn vị quản lý: tự chọn Hội Chữ thập đỏ cấp xã; vẫn chọn được Hội cấp tỉnh (đội, CLB có thể do Hội cấp tỉnh quản lý) ----------
const teamWard = document.querySelector('#tm-ward');
const teamUnit = document.querySelector('#tm-unit');
teamWard.addEventListener('change', () => {
  const ward = teamWard.value;
  teamUnit.innerHTML = '<option value="">Chọn đơn vị quản lý</option>'
    + (ward ? `<option selected>Hội Chữ thập đỏ ${ward.charAt(0).toLowerCase()}${ward.slice(1)}</option>` : '')
    + '<option>Hội Chữ thập đỏ tỉnh Hà Tĩnh</option>';
  teamUnit.closest('.pf-field').classList.remove('is-invalid');
});

// ---------- Bảng nhập: hoạt động nhân đạo, danh sách thành viên (dòng đầu là Chủ nhiệm — người đăng ký); số lượng thành viên tự tính ----------
team.querySelectorAll('[data-reg-list]').forEach(setupRegList);
const memberEditor = createTeamMembers(document.querySelector('#team-members-editor'), document.querySelector('#tm-count'));
// ---------- Lĩnh vực hoạt động: chọn nhiều (dùng chung bộ chọn nhiều của drawer Đăng ký chương trình) ----------
const teamMultis = [...team.querySelectorAll('[data-multi]')].map((root, i) => setupMulti(root, 50 + i));
document.addEventListener('click', (event) => {
  teamMultis.forEach((m) => { if (m.isOpen() && !m.root.contains(event.target)) m.setOpen(false); });
});

// ---------- Hoạt động tình nguyện: tích "chưa có hoạt động" thì ẩn bảng; không tích thì phải có ít nhất 1 hoạt động có nội dung ----------
const actsNone = document.querySelector('#tm-acts-none');
const actsSection = actsNone.closest('.pf-reg-section');
const actsError = document.querySelector('#tm-acts-error');
const hasActivity = () => [...actsSection.querySelectorAll('tbody tr')].some((row) => row.querySelector('[data-label="Nội dung hoạt động"]').value.trim());
const clearActsError = () => { actsError.hidden = true; actsNone.closest('.pf-field').classList.remove('is-invalid'); };
actsNone.addEventListener('change', () => {
  actsSection.classList.toggle('is-none', actsNone.checked);
  clearActsError();
});
actsSection.addEventListener('input', (event) => {
  if (event.target.matches('[data-label="Nội dung hoạt động"]') && event.target.value.trim()) clearActsError();
});
// Từ ngày · Đến ngày: chọn trên lịch hoặc tự nhập dd/mm/yyyy; đến ngày không được trước từ ngày (tô đỏ ô Đến ngày)
const ACTS_RANGE_MSG = 'Thời gian kết thúc không được trước thời gian bắt đầu.';
const checkActRow = (row) => {
  const [from, to] = [...row.querySelectorAll('.pf-date-native')].map((d) => d.value);
  const bad = Boolean(from && to && to < from);
  const toInput = row.querySelector('[data-label="Đến ngày"]');
  toInput.classList.toggle('is-invalid', bad);
  toInput.title = bad ? ACTS_RANGE_MSG : '';
  return !bad;
};
actsSection.addEventListener('change', (event) => {
  if (!event.target.matches('.pf-date-native')) return;
  const row = event.target.closest('tr');
  if (checkActRow(row)) { if (![...actsSection.querySelectorAll('tbody tr')].some((r) => !checkActRow(r))) clearActsError(); }
  else showToast(ACTS_RANGE_MSG, 'error');
});

// ---------- Chủ nhiệm: mặc định lấy từ tài khoản định danh (khóa); tích "đăng ký thay" thì mở khóa, nhập thông tin người khác ----------
// Thông tin chủ nhiệm luôn đồng bộ sang dòng Chủ nhiệm (dòng đầu) của danh sách thành viên
const teamLeader = team.querySelector('[data-team-leader]');
const leaderInputs = [...teamLeader.querySelectorAll('input[data-account]')];
const leaderGender = document.querySelector('#tm-leader-gender');
const leaderRadios = [...leaderGender.querySelectorAll('input')];
const syncLeaderRow = () => {
  memberEditor.syncLeader({
    name: document.querySelector('#tm-leader-name').value.trim(),
    identity: document.querySelector('#tm-leader-id').value.trim(),
    year: (document.querySelector('#tm-leader-dob').value.match(/\d{4}$/) || [''])[0],
    gender: (leaderRadios.find((r) => r.checked) || {}).value || ''
  });
};
document.querySelector('#tm-proxy').addEventListener('change', (event) => {
  const proxy = event.target.checked;
  leaderInputs.forEach((input) => {
    input.readOnly = !proxy;
    input.required = proxy;
    input.value = proxy ? '' : input.dataset.account;
    input.closest('.pf-control').classList.toggle('is-locked', !proxy);
  });
  leaderGender.classList.toggle('is-locked', !proxy);
  leaderRadios.forEach((radio) => {
    radio.disabled = !proxy;
    radio.checked = !proxy && radio.value === leaderGender.dataset.account;
  });
  document.querySelector('#tm-leader-badge').hidden = proxy;
  // Đăng ký thay: 4 trường Chủ nhiệm thành bắt buộc → hiện dấu *
  teamLeader.querySelectorAll('[data-proxy-req]').forEach((star) => { star.hidden = !proxy; });
  teamLeader.querySelectorAll('.pf-field').forEach((field) => field.classList.remove('is-invalid'));
  syncLeaderRow();
  if (proxy) leaderInputs[0].focus();
});
teamLeader.addEventListener('input', (event) => {
  if (event.target.id === 'tm-leader-id') event.target.value = event.target.value.replace(/\D/g, '');
  if (event.target.id === 'tm-leader-dob') event.target.value = maskVi(event.target.value);
  syncLeaderRow();
});
teamLeader.addEventListener('change', (event) => {
  if (event.target.name === 'tm-leader-gender') { leaderGender.closest('.pf-field').classList.remove('is-invalid'); syncLeaderRow(); }
});
syncLeaderRow();

// ---------- Tạo hồ sơ mới từ hồ sơ đã trả: điền sẵn biểu mẫu bằng thông tin hồ sơ cũ (Chủ nhiệm vẫn lấy theo tài khoản, cam kết phải tích lại) ----------
const prefillTeam = (r) => {
  const d = teamRegData(r);
  const set = (id, value) => { const el = document.querySelector(`#${id}`); el.value = value || ''; };
  teamForm.querySelectorAll('.pf-field.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  set('tm-name', d.name); set('tm-phone', d.phone); set('tm-email', d.email); set('tm-province', d.province);
  set('tm-ward', d.ward);
  teamWard.dispatchEvent(new Event('change')); // dựng lại danh sách Đơn vị quản lý theo phường/xã
  set('tm-unit', d.unit); set('tm-branch', d.branch); set('tm-address', d.address); set('tm-parent', d.parent); set('tm-decision', d.decision);
  teamMultis[0].setValues(d.fields);
  // Hoạt động tình nguyện: xóa dòng cũ, thêm lại từng hoạt động
  actsNone.checked = d.actsNone;
  actsSection.classList.toggle('is-none', d.actsNone);
  const actsBody = actsSection.querySelector('tbody');
  actsBody.replaceChildren();
  d.acts.forEach(([from, to, text]) => {
    actsSection.querySelector('[data-list-add]').click();
    const row = actsBody.lastElementChild;
    row.querySelector('[data-label="Từ ngày"]').value = from;
    row.querySelector('[data-label="Đến ngày"]').value = to;
    const natives = row.querySelectorAll('.pf-date-native');
    if (natives[0]) natives[0].value = viToIso(from);
    if (natives[1]) natives[1].value = viToIso(to);
    row.querySelector('[data-label="Nội dung hoạt động"]').value = text;
  });
  memberEditor.load(d.members);
  syncLeaderRow();
  // Hồ sơ mới: cam kết chưa tích, nơi ký để trống
  ['tm-agree', 'tm-privacy'].forEach((id) => { document.querySelector(`#${id}`).checked = false; });
  set('tm-sign-place', '');
  teamStatus.textContent = `Tạo mới từ hồ sơ ${r.code}`;
};
document.querySelector('#tm-phone').addEventListener('input', (event) => { event.target.value = event.target.value.replace(/\D/g, ''); });

// ---------- Lưu nháp · Nộp hồ sơ (kiểm tra trường bắt buộc, điện thoại 10 số bắt đầu bằng 0, cam kết) ----------
team.querySelector('[data-team-draft]').addEventListener('click', () => {
  teamStatus.textContent = `Đã lưu nháp lúc ${nowTime()}`;
  showToast('Đã lưu nháp hồ sơ');
});
teamForm.addEventListener('input', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.value && event.target.value.trim()) field.classList.remove('is-invalid');
});
teamForm.addEventListener('change', (event) => {
  if (event.target.matches('#tm-agree, #tm-privacy') && document.querySelector('#tm-agree').checked && document.querySelector('#tm-privacy').checked) {
    document.querySelector('#tm-commit-error').hidden = true;
    event.target.closest('.pf-field').classList.remove('is-invalid');
  }
});
// Tên trường cho câu báo lỗi: nhãn bỏ dấu * và ghi chú (…), chữ đầu viết thường
const fieldName = (field) => {
  const label = field.querySelector(':scope > label, :scope > .pf-label, :scope > legend');
  if (!label) return 'thông tin này';
  const copy = label.cloneNode(true);
  copy.querySelectorAll('.pf-req, .pf-label-note').forEach((n) => n.remove());
  const text = copy.textContent.trim();
  return text.charAt(0).toLocaleLowerCase('vi') + text.slice(1);
};
// ---------- Helper lỗi dưới ô (theo UI KIT Input · Error): icon alert 14 + câu báo 13px đỏ; tự ẩn khi ô hết lỗi (CSS) ----------
const syncFieldErrors = (form, messages) => {
  messages.forEach((msg, field) => {
    if (!msg || field.querySelector('.pf-error, .tm-notice')) return; // ô đã có câu báo riêng (hoạt động, danh sách thành viên, cam kết)
    let help = field.querySelector(':scope > .pf-field-error');
    if (!help) { help = document.createElement('p'); help.className = 'pf-field-error'; field.append(help); }
    help.innerHTML = `${icon('alert')}<span>${escapeHtml(msg)}</span>`;
  });
};
const validateTeam = () => {
  // Map ô lỗi → câu báo (giữ thứ tự ô đầu tiên lỗi để cuộn tới)
  const invalid = new Map();
  const bad = (field, msg) => { if (field && !invalid.has(field)) invalid.set(field, msg); };
  teamForm.querySelectorAll('input[required]:not([type="checkbox"]):not([type="radio"]), select[required]').forEach((el) => {
    const field = el.closest('.pf-field');
    if (!el.value.trim()) bad(field, `Vui lòng ${el.tagName === 'SELECT' ? 'chọn' : 'nhập'} ${fieldName(field)}.`);
  });
  // Điện thoại, email không bắt buộc nhưng có nhập thì phải đúng định dạng; số định danh 12 chữ số; ngày sinh dd/mm/yyyy
  const phone = document.querySelector('#tm-phone');
  if (phone.value && !/^0\d{9}$/.test(phone.value)) bad(phone.closest('.pf-field'), 'Điện thoại phải có 10 chữ số, bắt đầu bằng 0.');
  const email = document.querySelector('#tm-email');
  if (email.value && !email.checkValidity()) bad(email.closest('.pf-field'), 'Địa chỉ email không hợp lệ.');
  if (document.querySelector('#tm-proxy').checked) {
    const id = document.querySelector('#tm-leader-id');
    if (!/^\d{12}$/.test(id.value)) bad(id.closest('.pf-field'), 'Số định danh cá nhân phải có đúng 12 chữ số.');
    const dob = document.querySelector('#tm-leader-dob');
    if (!viToIso(dob.value)) bad(dob.closest('.pf-field'), 'Ngày sinh không hợp lệ (dd/mm/yyyy).');
    if (!leaderRadios.some((r) => r.checked)) bad(leaderGender.closest('.pf-field'), 'Vui lòng chọn giới tính.');
  }
  teamMultis.forEach((m) => { if (m.root.hasAttribute('data-required') && !m.selected().length) { const field = m.root.closest('.pf-field'); bad(field, `Vui lòng chọn ${fieldName(field)}.`); } });
  const actsMissing = !actsNone.checked && !hasActivity();
  const actsBadRange = !actsNone.checked && [...actsSection.querySelectorAll('tbody tr')].map(checkActRow).includes(false);
  actsError.textContent = actsBadRange ? ACTS_RANGE_MSG : 'Vui lòng nhập ít nhất 1 hoạt động hoặc tích “Đội, câu lạc bộ chưa có hoạt động tình nguyện nào”.';
  actsError.hidden = !(actsMissing || actsBadRange);
  actsNone.closest('.pf-field').classList.toggle('is-range', actsBadRange && !actsMissing);
  if (actsMissing || actsBadRange) bad(actsNone.closest('.pf-field'));
  if (!memberEditor.validate()) bad(document.querySelector('#team-members-editor'));
  const agreed = document.querySelector('#tm-agree').checked && document.querySelector('#tm-privacy').checked;
  document.querySelector('#tm-commit-error').hidden = agreed;
  if (!agreed) bad(document.querySelector('#tm-agree').closest('.pf-field'));
  teamForm.querySelectorAll('.pf-field').forEach((field) => field.classList.toggle('is-invalid', invalid.has(field)));
  syncFieldErrors(teamForm, invalid);
  return [...teamForm.querySelectorAll('.pf-field.is-invalid')];
};
teamForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = validateTeam();
  if (invalid.length) {
    invalid[0].scrollIntoView({ behavior: regReduced() ? 'auto' : 'smooth', block: 'center' });
    const focusable = invalid[0].querySelector('input:not([type="file"]), select, textarea, button');
    if (focusable) focusable.focus({ preventScroll: true });
    showToast(`Còn ${invalid.length} trường cần kiểm tra lại.`, 'error');
    return;
  }
  confirmAction({ title: 'Xác nhận nộp hồ sơ', text: 'Bạn có chắc chắn muốn nộp hồ sơ không?', ok: 'Nộp hồ sơ' }).then((yes) => {
    if (!yes) return;
    closeTeam();
    showToast('Nộp hồ sơ thành công (bản xem trước — chưa gửi lên hệ thống).');
  });
});

// ==================== SECTION: ĐĂNG KÝ GIA NHẬP ĐỘI, CLB — drawer cùng khung Đăng ký thành lập đội, CLB (đặc tả CD-04) ====================
// Mở từ: Thêm mới (form trống) · Tiếp tục điền (bản nháp) · Tạo hồ sơ mới từ hồ sơ đã trả (điền sẵn, cam kết tích lại).
// Thông tin cá nhân lấy từ tài khoản định danh (TEAM_ACCOUNT). Lưu nháp → dòng Bản nháp trên danh sách; Nộp hồ sơ → cấp mã, trạng thái Mới, mở màn xem hồ sơ.
const join = document.querySelector('#pf-join');
const joinPanel = join.querySelector('.pf-reg-panel');
const joinBody = join.querySelector('.pf-reg-body');
const joinForm = document.querySelector('#pf-join-form');
const joinStatus = document.querySelector('#pf-join-status');
const joinSubmit = joinForm.querySelector('[type="submit"]');
const joinSkills = setupMulti(join.querySelector('[data-multi]'), 90);
let joinTrigger = null;
let joinEditId = null; // bản nháp đang sửa (Tiếp tục điền / sau lần Lưu nháp đầu tiên)
let joinSaved = ''; // dữ liệu lúc mở / lưu gần nhất — khác thì hỏi trước khi rời form
joinPanel.tabIndex = -1;

// ---------- Đội, CLB đang hoạt động (minh họa): đội, CLB đã thành lập + đội, CLB trong các hồ sơ gia nhập; đơn vị quản lý suy theo tên (clubUnit — XEM CHI TIẾT HỒ SƠ GIA NHẬP) ----------
const JOIN_CLUBS = [...new Set(VOL_REGS.filter((r) => r.type === 'GC' || r.status === 'created').map((r) => r.name))]
  .map((name) => ({ name, unit: clubUnit(name) }))
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
// Đội, CLB người nộp đang sinh hoạt (minh họa): đã kết nạp qua hồ sơ gia nhập · đội, CLB do mình thành lập (Chủ nhiệm)
const joinMemberOf = (club) => VOL_REGS.some((r) => r.name === club && ((r.type === 'GC' && r.status === 'admitted') || (r.type === 'DC' && r.status === 'created')));
// Hồ sơ gia nhập khác đang xử lý (Mới, Đã tiếp nhận, Đã đủ điều kiện) với cùng đội, CLB (BR-03)
const joinPending = (club) => VOL_REGS.find((r) => r.type === 'GC' && r.name === club && ['new', 'received', 'eligible'].includes(r.status));

// ---------- Tỉnh/Thành phố → Phường/xã → Đơn vị quản lý (tự chọn Hội cấp xã, vẫn chọn được Hội cấp tỉnh) → Đội, CLB; đổi cấp trên thì xóa các cấp dưới ----------
const joinProvince = document.querySelector('#jn-province');
const joinWard = document.querySelector('#jn-ward');
const joinUnit = document.querySelector('#jn-unit');
const joinClub = document.querySelector('#jn-club');
const fillJoinClubs = () => {
  const clubs = JOIN_CLUBS.filter((c) => c.unit === joinUnit.value);
  joinClub.disabled = !joinUnit.value;
  joinClub.innerHTML = `<option value="">${joinUnit.value ? (clubs.length ? 'Chọn đội, câu lạc bộ' : 'Đơn vị chưa có đội, câu lạc bộ') : 'Chọn đơn vị quản lý trước'}</option>`
    + clubs.map((c) => `<option>${escapeHtml(c.name)}</option>`).join('');
  checkJoinClub();
};
// Chọn đội, CLB mình đang là thành viên: tô đỏ, báo dưới trường, khóa Nộp hồ sơ (BR-04)
const checkJoinClub = () => {
  const field = joinClub.closest('.pf-field');
  const member = Boolean(joinClub.value) && joinMemberOf(joinClub.value);
  field.classList.toggle('is-invalid', member);
  if (member) syncFieldErrors(joinForm, new Map([[field, `Bạn đã là thành viên của ${joinClub.value}`]]));
  joinSubmit.disabled = member;
};
joinProvince.addEventListener('change', () => {
  joinWard.value = '';
  joinWard.disabled = !joinProvince.value;
  joinWard.dispatchEvent(new Event('change'));
});
joinWard.addEventListener('change', () => {
  const ward = joinWard.value;
  joinUnit.innerHTML = '<option value="">Chọn đơn vị quản lý</option>'
    + (ward ? `<option selected>Hội Chữ thập đỏ ${ward.charAt(0).toLowerCase()}${ward.slice(1)}</option>` : '')
    + (joinProvince.value ? `<option>${JOIN_PROVINCE_UNIT}</option>` : '');
  joinUnit.closest('.pf-field').classList.remove('is-invalid');
  fillJoinClubs();
});
joinUnit.addEventListener('change', fillJoinClubs);
joinClub.addEventListener('change', checkJoinClub);
document.querySelector('#jn-phone').addEventListener('input', (event) => { event.target.value = event.target.value.replace(/\D/g, ''); });

// ---------- Đọc / điền dữ liệu biểu mẫu ----------
const joinFormData = () => ({
  name: TEAM_ACCOUNT.name, identity: TEAM_ACCOUNT.identity, gender: TEAM_ACCOUNT.gender, year: TEAM_ACCOUNT.dob.slice(-4),
  phone: document.querySelector('#jn-phone').value.trim(),
  blood: document.querySelector('#jn-blood').value,
  field: document.querySelector('#jn-field').value,
  skills: joinSkills.selected().map((o) => o.textContent),
  province: joinProvince.value, ward: joinWard.value, unit: joinUnit.value, club: joinClub.value,
  agree: document.querySelector('#jn-agree').checked,
  privacy: document.querySelector('#jn-privacy').checked,
});
const loadJoin = (d) => {
  joinForm.querySelectorAll('.pf-field.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  document.querySelector('#jn-commit-error').hidden = true;
  document.querySelector('#jn-phone').value = d.phone;
  document.querySelector('#jn-blood').value = d.blood;
  document.querySelector('#jn-field').value = d.field;
  joinSkills.setValues(d.skills);
  joinProvince.value = d.province;
  joinWard.disabled = !d.province;
  joinWard.value = d.ward;
  joinWard.dispatchEvent(new Event('change'));
  if (d.unit) { joinUnit.value = d.unit; fillJoinClubs(); }
  joinClub.value = d.club;
  checkJoinClub();
  document.querySelector('#jn-agree').checked = d.agree;
  document.querySelector('#jn-privacy').checked = d.privacy;
};
// Thêm mới: form trống — tỉnh mặc định theo địa chỉ thường trú của tài khoản, điện thoại lấy từ tài khoản
const resetJoin = () => {
  joinEditId = null;
  loadJoin({ phone: TEAM_ACCOUNT.phone, blood: '', field: '', skills: [], province: 'Tỉnh Hà Tĩnh', ward: '', unit: '', club: '', agree: false, privacy: false });
  joinStatus.textContent = '';
};
// Tiếp tục điền bản nháp: mở lại đủ dữ liệu đã lưu
const editJoinDraft = (r, trigger) => {
  loadJoin(joinRegData(r));
  joinEditId = r.id;
  joinStatus.textContent = 'Đang sửa bản nháp';
  openJoin(trigger);
};
// Tạo hồ sơ mới từ hồ sơ gia nhập đã trả: điền lại dữ liệu hồ sơ cũ, trừ Cam kết phải tích lại; nộp thì cấp mã mới, hồ sơ cũ giữ nguyên
const prefillJoin = (r) => {
  loadJoin({ ...joinRegData(r), agree: false, privacy: false });
  joinEditId = null;
  joinStatus.textContent = `Tạo mới từ hồ sơ ${r.code}`;
};

// ---------- Mở / đóng: như drawer Đăng ký thành lập; rời form khi còn dữ liệu chưa lưu thì hỏi xác nhận ----------
const openJoin = (trigger) => {
  joinTrigger = trigger;
  joinSaved = JSON.stringify(joinFormData());
  join.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  joinBody.scrollTop = 0;
  requestAnimationFrame(() => {
    join.classList.add('is-open');
    joinPanel.focus({ preventScroll: true });
    joinSkills.refit();
  });
};
const closeJoin = () => {
  join.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  setTimeout(() => { join.hidden = true; }, regReduced() ? 0 : 300);
  if (joinTrigger && document.contains(joinTrigger)) joinTrigger.focus();
};
const requestCloseJoin = async () => {
  if (JSON.stringify(joinFormData()) !== joinSaved) {
    const yes = await confirmAction({ title: 'Rời khỏi biểu mẫu', text: 'Dữ liệu chưa được lưu. Bạn có muốn rời khỏi trang?', ok: 'Đồng ý' });
    if (!yes) return;
  }
  closeJoin();
};
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open-join]');
  if (trigger) { resetJoin(); openJoin(trigger); }
  if (joinSkills.isOpen() && !joinSkills.root.contains(event.target)) joinSkills.setOpen(false);
});
join.querySelectorAll('[data-close-join]').forEach((button) => button.addEventListener('click', requestCloseJoin));
document.addEventListener('keydown', (event) => {
  if (join.hidden || dialog.open || teamConfirm.open) return;
  if (event.key === 'Escape') {
    if (joinSkills.isOpen()) joinSkills.setOpen(false, true); else requestCloseJoin();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = [...joinPanel.querySelectorAll('a[href], button:not([disabled]), input:not([readonly]), select:not([disabled])')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === joinPanel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

// ---------- Ghi hồ sơ vào danh sách: Lưu nháp (Bản nháp, chưa có mã) · Nộp hồ sơ (cấp mã [Mã tỉnh].[Mã xã].GC.[Năm].[STT 4 số], Hội cấp tỉnh dùng Mã xã 00000) ----------
const refreshVolList = () => {
  VOL_REGS.sort(volSort);
  applyVolFilter();
  renderTabs('tinh-nguyen-vien', volf.status);
  updateVolCounts();
};
const nextJoinCode = (unit) => {
  const prefix = `42.${unit === JOIN_PROVINCE_UNIT ? '00000' : '18073'}.GC.${new Date().getFullYear()}.`;
  const last = Math.max(0, ...VOL_REGS.filter((r) => r.code && r.code.startsWith(prefix)).map((r) => Number(r.code.slice(prefix.length))));
  return `${prefix}${String(last + 1).padStart(4, '0')}`;
};
const nextDraftId = () => `NHAP-${Math.max(0, ...VOL_REGS.map((r) => (/^NHAP-(\d+)$/.exec(r.id) || [0, 0])[1]).map(Number)) + 1}`;
join.querySelector('[data-join-draft]').addEventListener('click', () => {
  const d = joinFormData();
  let r = joinEditId && findVolReg(joinEditId);
  if (!r) {
    r = { id: nextDraftId(), code: null, type: 'GC', status: 'draft', created: isoToday(), submitted: null };
    VOL_REGS.push(r);
    joinEditId = r.id;
  }
  r.name = d.club || 'Chưa chọn đội, câu lạc bộ';
  joinRegCache.set(r.id, { ...d, reason: '', times: {} });
  refreshVolList();
  joinSaved = JSON.stringify(d);
  joinStatus.textContent = `Đã lưu nháp lúc ${nowTime()}`;
  showToast('Đã lưu nháp hồ sơ');
});
joinForm.addEventListener('input', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.value && event.target.value.trim()) field.classList.remove('is-invalid');
});
joinForm.addEventListener('change', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.matches('select:not(#jn-club)') && event.target.value) field.classList.remove('is-invalid');
  if (event.target.matches('#jn-agree, #jn-privacy') && document.querySelector('#jn-agree').checked && document.querySelector('#jn-privacy').checked) {
    document.querySelector('#jn-commit-error').hidden = true;
    event.target.closest('.pf-field').classList.remove('is-invalid');
  }
});
// Kiểm tra bắt buộc / định dạng · đã là thành viên (BR-04) · đã có hồ sơ đang xử lý với cùng đội, CLB (BR-03) · cam kết
const validateJoin = () => {
  const invalid = new Map();
  const bad = (field, msg) => { if (field && !invalid.has(field)) invalid.set(field, msg); };
  joinForm.querySelectorAll('input[required]:not([type="checkbox"]), select[required]').forEach((el) => {
    const field = el.closest('.pf-field');
    if (!el.value.trim()) bad(field, `Vui lòng ${el.tagName === 'SELECT' ? 'chọn' : 'nhập'} ${fieldName(field)}.`);
  });
  const phone = document.querySelector('#jn-phone');
  if (phone.value && !/^0\d{9}$/.test(phone.value)) bad(phone.closest('.pf-field'), 'Số điện thoại không hợp lệ');
  if (!joinSkills.selected().length) { const field = joinSkills.root.closest('.pf-field'); bad(field, `Vui lòng chọn ${fieldName(field)}.`); }
  if (joinClub.value) {
    const pending = joinPending(joinClub.value);
    if (joinMemberOf(joinClub.value)) bad(joinClub.closest('.pf-field'), `Bạn đã là thành viên của ${joinClub.value}`);
    else if (pending) bad(joinClub.closest('.pf-field'), `Bạn đã có hồ sơ ${pending.code} đang xử lý với đơn vị này`);
  }
  const agreed = document.querySelector('#jn-agree').checked && document.querySelector('#jn-privacy').checked;
  document.querySelector('#jn-commit-error').hidden = agreed;
  if (!agreed) bad(document.querySelector('#jn-agree').closest('.pf-field'));
  joinForm.querySelectorAll('.pf-field').forEach((field) => field.classList.toggle('is-invalid', invalid.has(field)));
  syncFieldErrors(joinForm, invalid);
  return [...joinForm.querySelectorAll('.pf-field.is-invalid')];
};
joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = validateJoin();
  if (invalid.length) {
    invalid[0].scrollIntoView({ behavior: regReduced() ? 'auto' : 'smooth', block: 'center' });
    const focusable = invalid[0].querySelector('input:not([readonly]), select, button');
    if (focusable) focusable.focus({ preventScroll: true });
    showToast(`Còn ${invalid.length} trường cần kiểm tra lại.`, 'error');
    return;
  }
  confirmAction({ title: 'Xác nhận nộp hồ sơ', text: 'Bạn có chắc chắn muốn nộp hồ sơ không?', ok: 'Nộp hồ sơ' }).then((yes) => {
    if (!yes) return;
    // Nộp từ bản nháp: dùng lại dòng nháp; nộp mới: thêm dòng. Hồ sơ cũ (đã trả) giữ nguyên trạng thái.
    const d = joinFormData();
    let r = joinEditId && findVolReg(joinEditId);
    if (r) joinRegCache.delete(r.id);
    else { r = { type: 'GC', created: isoToday() }; VOL_REGS.push(r); }
    const code = nextJoinCode(d.unit);
    Object.assign(r, { id: code, code, name: d.club, status: 'new', submitted: isoToday() });
    joinRegCache.set(code, { ...d, reason: '', times: { submitted: `${viDate(isoToday())} ${nowTime()}` } });
    joinEditId = null;
    refreshVolList();
    closeJoin();
    showToast(`Nộp hồ sơ thành công. Mã hồ sơ: ${code}`);
    // Chuyển sang màn xem hồ sơ vừa nộp
    window.location.hash = `#gia-nhap-doi/xem/${encodeURIComponent(code)}`;
  });
});
// ==================== END SECTION: ĐĂNG KÝ GIA NHẬP ĐỘI, CLB ====================

// ==================== SECTION: ĐĂNG KÝ GIA NHẬP CHI HỘI — drawer cùng khung Đăng ký gia nhập đội, CLB ====================
// Mở từ: Thêm mới (form trống) · Tiếp tục điền (bản nháp) · Tạo hồ sơ mới từ hồ sơ đã trả (điền sẵn, cam kết tích lại).
// Đặc tả UC-GN-01 (CD-02). Lưu nháp → dòng Bản nháp trên danh sách #gia-nhap-chi-hoi; Nộp hồ sơ → cấp mã ([Mã tỉnh].[Mã xã].GN.[Năm].[STT 4 số], BR-13), trạng thái Mới, mở màn Xem hồ sơ (CD-02a).
// Chi hội chỉ do Hội cấp xã quản lý: Đơn vị quản lý chỉ liệt kê Hội Chữ thập đỏ cấp xã của phường/xã đã chọn.
const branchJoin = document.querySelector('#pf-branch-join');
const branchPanel = branchJoin.querySelector('.pf-reg-panel');
const branchBody = branchJoin.querySelector('.pf-reg-body');
const branchForm = document.querySelector('#pf-bj-form');
const branchStatus = document.querySelector('#pf-bj-status');
const branchSubmit = branchForm.querySelector('[type="submit"]');
const branchSkills = setupMulti(branchJoin.querySelector('[data-multi]'), 91);
let branchTrigger = null;
let branchEditId = null; // bản nháp đang sửa (Tiếp tục điền / sau lần Lưu nháp đầu tiên)
let branchSaved = ''; // dữ liệu lúc mở / lưu gần nhất — khác thì hỏi trước khi rời form
branchPanel.tabIndex = -1;

// ---------- Chi hội đang hoạt động (minh họa, BR-12): chi hội trong các hồ sơ gia nhập + vài chi hội khác; đơn vị quản lý suy theo tên (clubUnit), loại theo branchKind ----------
const BRANCHES = [...new Set([...VOL_REGS.filter((r) => r.type === 'GN').map((r) => r.name), 'Chi hội Tổ dân phố số 6 phường Thành Sen', 'Chi hội Tổ dân phố số 2 phường Trần Phú', 'Chi hội Trường Tiểu học Hà Huy Tập', 'Chi hội Thôn Bắc Thạch Hạ', 'Chi hội Chùa Phổ Quang Thạch Hạ', 'Chi hội Giáo xứ Thành Sen', 'Chi hội Phòng khám đa khoa Thành Sen', BRANCH_UNIT.name])]
  .map((name) => ({ name, unit: clubUnit(name), kind: branchKind(name) }))
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
// Chi hội đã là hội viên (đã kết nạp) · hồ sơ gia nhập khác đang xử lý với cùng chi hội
const branchMemberOf = (name) => name === BRANCH_UNIT.name || VOL_REGS.some((r) => r.type === 'GN' && r.name === name && r.status === 'admitted');
const branchPending = (name) => VOL_REGS.find((r) => r.type === 'GN' && r.name === name && ['new', 'received', 'eligible'].includes(r.status));

// ---------- Tỉnh/Thành phố → Phường/xã → Đơn vị quản lý (tự chọn Hội cấp xã) → Loại chi hội → Chi hội; đổi cấp trên thì xóa các cấp dưới ----------
const branchProvince = document.querySelector('#bj-province');
const branchWard = document.querySelector('#bj-ward');
const branchUnit = document.querySelector('#bj-unit');
const branchKindSel = document.querySelector('#bj-kind');
const branchSel = document.querySelector('#bj-branch');
// Danh sách rỗng (đơn vị chưa có chi hội đang hoạt động thuộc loại đã chọn): chỉ còn placeholder, hiện gợi ý chọn loại chi hội khác
const branchHelp = document.querySelector('#bj-branch-help');
const fillBranches = () => {
  const ready = branchUnit.value && branchKindSel.value;
  const list = BRANCHES.filter((b) => b.unit === branchUnit.value && b.kind === branchKindSel.value);
  branchSel.disabled = !ready || !list.length;
  branchSel.innerHTML = '<option value="">Chọn chi hội</option>' + list.map((b) => `<option>${escapeHtml(b.name)}</option>`).join('');
  branchHelp.hidden = !ready || list.length > 0;
  checkBranch();
};
// Chọn chi hội mình đã là hội viên: tô đỏ, báo dưới trường, khóa Nộp hồ sơ
const checkBranch = () => {
  const field = branchSel.closest('.pf-field');
  const member = Boolean(branchSel.value) && branchMemberOf(branchSel.value);
  field.classList.toggle('is-invalid', member);
  if (member) syncFieldErrors(branchForm, new Map([[field, `Bạn đã là hội viên của ${branchSel.value}`]]));
  branchSubmit.disabled = member;
};
branchProvince.addEventListener('change', () => {
  branchWard.value = '';
  branchWard.disabled = !branchProvince.value;
  branchWard.dispatchEvent(new Event('change'));
});
branchWard.addEventListener('change', () => {
  const ward = branchWard.value;
  branchUnit.innerHTML = '<option value="">Chọn đơn vị quản lý</option>'
    + (ward ? `<option selected>Hội Chữ thập đỏ ${ward.charAt(0).toLowerCase()}${ward.slice(1)}</option>` : '');
  branchUnit.closest('.pf-field').classList.remove('is-invalid');
  fillBranches();
});
branchUnit.addEventListener('change', fillBranches);
branchKindSel.addEventListener('change', fillBranches);
branchSel.addEventListener('change', checkBranch);
document.querySelector('#bj-phone').addEventListener('input', (event) => { event.target.value = event.target.value.replace(/\D/g, ''); });

// ---------- Đọc / điền dữ liệu biểu mẫu ----------
const branchFormData = () => ({
  name: TEAM_ACCOUNT.name, identity: TEAM_ACCOUNT.identity, gender: TEAM_ACCOUNT.gender, year: TEAM_ACCOUNT.dob.slice(-4),
  phone: document.querySelector('#bj-phone').value.trim(),
  blood: document.querySelector('#bj-blood').value,
  member: document.querySelector('#bj-member').value,
  field: document.querySelector('#bj-field').value,
  skills: branchSkills.selected().map((o) => o.textContent),
  province: branchProvince.value, ward: branchWard.value, unit: branchUnit.value, kind: branchKindSel.value, branch: branchSel.value,
  agree: document.querySelector('#bj-agree').checked,
  privacy: document.querySelector('#bj-privacy').checked,
});
const loadBranch = (d) => {
  branchForm.querySelectorAll('.pf-field.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  document.querySelector('#bj-commit-error').hidden = true;
  document.querySelector('#bj-phone').value = d.phone;
  document.querySelector('#bj-blood').value = d.blood;
  document.querySelector('#bj-member').value = d.member;
  document.querySelector('#bj-field').value = d.field;
  branchSkills.setValues(d.skills);
  branchProvince.value = d.province;
  branchWard.disabled = !d.province;
  branchWard.value = d.ward;
  branchWard.dispatchEvent(new Event('change'));
  if (d.unit) branchUnit.value = d.unit;
  branchKindSel.value = d.kind;
  fillBranches();
  branchSel.value = d.branch;
  checkBranch();
  document.querySelector('#bj-agree').checked = d.agree;
  document.querySelector('#bj-privacy').checked = d.privacy;
};
// Thêm mới: form trống — tỉnh mặc định theo địa chỉ thường trú, điện thoại lấy từ tài khoản
const resetBranch = () => {
  branchEditId = null;
  loadBranch({ phone: TEAM_ACCOUNT.phone, blood: '', member: '', field: '', skills: [], province: 'Tỉnh Hà Tĩnh', ward: '', unit: '', kind: '', branch: '', agree: false, privacy: false });
  branchStatus.textContent = '';
};
const editBranchDraft = (r, trigger) => {
  loadBranch(branchRegData(r));
  branchEditId = r.id;
  branchStatus.textContent = 'Đang sửa bản nháp';
  openBranch(trigger);
};
const prefillBranch = (r) => {
  loadBranch({ ...branchRegData(r), agree: false, privacy: false });
  branchEditId = null;
  branchStatus.textContent = `Tạo mới từ hồ sơ ${r.code}`;
};

// ---------- Mở / đóng: như drawer Đăng ký gia nhập đội, CLB; rời form khi còn dữ liệu chưa lưu thì hỏi xác nhận ----------
const openBranch = (trigger) => {
  branchTrigger = trigger;
  branchSaved = JSON.stringify(branchFormData());
  branchJoin.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  branchBody.scrollTop = 0;
  requestAnimationFrame(() => {
    branchJoin.classList.add('is-open');
    branchPanel.focus({ preventScroll: true });
    branchSkills.refit();
  });
};
const closeBranch = () => {
  branchJoin.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  setTimeout(() => { branchJoin.hidden = true; }, regReduced() ? 0 : 300);
  if (branchTrigger && document.contains(branchTrigger)) branchTrigger.focus();
};
const requestCloseBranch = async () => {
  if (JSON.stringify(branchFormData()) !== branchSaved) {
    const yes = await confirmAction({ title: 'Rời khỏi biểu mẫu', text: 'Dữ liệu chưa được lưu. Bạn có muốn rời khỏi trang?', ok: 'Đồng ý' });
    if (!yes) return;
  }
  closeBranch();
};
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open-branch]');
  if (trigger) { resetBranch(); openBranch(trigger); }
  if (branchSkills.isOpen() && !branchSkills.root.contains(event.target)) branchSkills.setOpen(false);
});
branchJoin.querySelectorAll('[data-close-branch]').forEach((button) => button.addEventListener('click', requestCloseBranch));
document.addEventListener('keydown', (event) => {
  if (branchJoin.hidden || dialog.open || teamConfirm.open) return;
  if (event.key === 'Escape') {
    if (branchSkills.isOpen()) branchSkills.setOpen(false, true); else requestCloseBranch();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = [...branchPanel.querySelectorAll('a[href], button:not([disabled]), input:not([readonly]), select:not([disabled])')].filter((el) => el.offsetParent !== null);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === branchPanel)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

// ---------- Ghi hồ sơ vào danh sách: Lưu nháp (Bản nháp, chưa có mã, không kiểm tra bắt buộc) · Nộp hồ sơ (mã theo địa bàn Hội cấp xã quản lý chi hội) ----------
const nextBranchCode = () => {
  const prefix = `42.18073.GN.${new Date().getFullYear()}.`;
  const last = Math.max(0, ...VOL_REGS.filter((r) => r.code && r.code.startsWith(prefix)).map((r) => Number(r.code.slice(prefix.length))));
  return `${prefix}${String(last + 1).padStart(4, '0')}`;
};
branchJoin.querySelector('[data-branch-draft]').addEventListener('click', () => {
  const d = branchFormData();
  let r = branchEditId && findVolReg(branchEditId);
  if (!r) {
    r = { id: nextDraftId(), code: null, type: 'GN', status: 'draft', created: isoToday(), submitted: null };
    VOL_REGS.push(r);
    branchEditId = r.id;
  }
  r.name = d.branch || 'Chưa chọn chi hội';
  branchRegCache.set(r.id, { ...d, reason: '', times: {} });
  refreshVolList();
  branchSaved = JSON.stringify(d);
  branchStatus.textContent = `Đã lưu nháp lúc ${nowTime()}`;
  showToast('Đã lưu nháp hồ sơ');
});
branchForm.addEventListener('input', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.value && event.target.value.trim()) field.classList.remove('is-invalid');
});
branchForm.addEventListener('change', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.matches('select:not(#bj-branch)') && event.target.value) field.classList.remove('is-invalid');
  if (event.target.matches('#bj-agree, #bj-privacy') && document.querySelector('#bj-agree').checked && document.querySelector('#bj-privacy').checked) {
    document.querySelector('#bj-commit-error').hidden = true;
    event.target.closest('.pf-field').classList.remove('is-invalid');
  }
});
// Kiểm tra bắt buộc / định dạng · đã là hội viên · đã có hồ sơ đang xử lý với cùng chi hội · cam kết
const validateBranch = () => {
  const invalid = new Map();
  const bad = (field, msg) => { if (field && !invalid.has(field)) invalid.set(field, msg); };
  branchForm.querySelectorAll('input[required]:not([type="checkbox"]), select[required]').forEach((el) => {
    const field = el.closest('.pf-field');
    if (!el.value.trim()) bad(field, `Vui lòng ${el.tagName === 'SELECT' ? 'chọn' : 'nhập'} ${fieldName(field)}.`);
  });
  const phone = document.querySelector('#bj-phone');
  if (phone.value && !/^0\d{9}$/.test(phone.value)) bad(phone.closest('.pf-field'), 'Số điện thoại không hợp lệ');
  if (!branchSkills.selected().length) { const field = branchSkills.root.closest('.pf-field'); bad(field, `Vui lòng chọn ${fieldName(field)}.`); }
  if (branchSel.value) {
    const pending = branchPending(branchSel.value);
    if (branchMemberOf(branchSel.value)) bad(branchSel.closest('.pf-field'), `Bạn đã là hội viên của ${branchSel.value}`);
    else if (pending) bad(branchSel.closest('.pf-field'), `Bạn đã có hồ sơ ${pending.code} đang xử lý với chi hội này`);
  }
  const agreed = document.querySelector('#bj-agree').checked && document.querySelector('#bj-privacy').checked;
  document.querySelector('#bj-commit-error').hidden = agreed;
  if (!agreed) bad(document.querySelector('#bj-agree').closest('.pf-field'));
  branchForm.querySelectorAll('.pf-field').forEach((field) => field.classList.toggle('is-invalid', invalid.has(field)));
  syncFieldErrors(branchForm, invalid);
  return [...branchForm.querySelectorAll('.pf-field.is-invalid')];
};
branchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = validateBranch();
  if (invalid.length) {
    invalid[0].scrollIntoView({ behavior: regReduced() ? 'auto' : 'smooth', block: 'center' });
    const focusable = invalid[0].querySelector('input:not([readonly]), select, button');
    if (focusable) focusable.focus({ preventScroll: true });
    showToast(`Còn ${invalid.length} trường cần kiểm tra lại.`, 'error');
    return;
  }
  confirmAction({ title: 'Xác nhận nộp hồ sơ', text: 'Bạn có chắc chắn muốn nộp hồ sơ không?', ok: 'Nộp hồ sơ' }).then((yes) => {
    if (!yes) return;
    // Nộp từ bản nháp: dùng lại dòng nháp; nộp mới: thêm dòng. Hồ sơ cũ (đã trả) giữ nguyên trạng thái.
    const d = branchFormData();
    let r = branchEditId && findVolReg(branchEditId);
    if (r) branchRegCache.delete(r.id);
    else { r = { type: 'GN', created: isoToday() }; VOL_REGS.push(r); }
    const code = nextBranchCode();
    Object.assign(r, { id: code, code, name: d.branch, status: 'new', submitted: isoToday() });
    branchRegCache.set(code, { ...d, reason: '', times: { submitted: `${viDate(isoToday())} ${nowTime()}` } });
    branchEditId = null;
    refreshVolList();
    closeBranch();
    showToast(`Nộp hồ sơ thành công. Mã hồ sơ: ${code}`);
    // Chuyển sang màn Xem hồ sơ vừa nộp (CD-02a)
    window.location.hash = `#gia-nhap-chi-hoi/xem/${encodeURIComponent(code)}`;
  });
});
// ==================== END SECTION: ĐĂNG KÝ GIA NHẬP CHI HỘI ====================

// ==================== XÁC NHẬN NỘP HỒ SƠ ĐỘI, CLB ====================
// Hộp xác nhận dùng chung: confirmAction({ title, text, ok }) → Promise<boolean> (true khi bấm nút đồng ý).
// Dùng cho Nộp hồ sơ và Xóa đã chọn (team-members.js gọi window.confirmAction).
const teamConfirm = document.querySelector('#pf-team-confirm');
let confirmResolve = null;
const confirmAction = ({ title, text, ok }) => new Promise((resolve) => {
  teamConfirm.querySelector('#pf-confirm-title').textContent = title;
  teamConfirm.querySelector('#pf-confirm-text').textContent = text;
  teamConfirm.querySelector('[data-confirm-ok]').textContent = ok;
  confirmResolve = resolve;
  teamConfirm.returnValue = '';
  teamConfirm.showModal();
});
window.confirmAction = confirmAction;
// Đóng bằng Hủy / Esc / bấm ra ngoài → false; nút đồng ý → true
teamConfirm.addEventListener('close', () => { if (confirmResolve) { confirmResolve(teamConfirm.returnValue === 'ok'); confirmResolve = null; } });
teamConfirm.querySelector('[data-confirm-cancel]').addEventListener('click', () => teamConfirm.close('cancel'));
teamConfirm.querySelector('[data-confirm-ok]').addEventListener('click', () => teamConfirm.close('ok'));
teamConfirm.addEventListener('click', (event) => { if (event.target === teamConfirm) teamConfirm.close('cancel'); });

// ==================== XEM TRƯỚC PHIẾU ĐĂNG KÝ ĐỘI, CLB (PDF) ====================
// Kiểu trình xem PDF: thanh công cụ (tên file · Trang x / N · thu phóng · In · Tải về PDF) + các trang A4 trên nền xám.
// Trang dọc: phần 1, 2, 4 + ký; trang ngang: danh sách thành viên đủ cột. Nội dung tự chia trang (bảng ngắt theo dòng, lặp đầu bảng).
// Trường trống in dòng chấm để điền tay. In / Tải về: in riêng các trang qua iframe ẩn (trang ngang dùng @page landscape).
const teamPdf = document.querySelector('#pf-team-pdf');
const pdfBody = teamPdf.querySelector('.pf-pdf-body');
const pdfPages = document.querySelector('#pf-pdf-pages');
const pdfVal = (v) => (v && String(v).trim() ? escapeHtml(String(v).trim()) : '<span class="pf-pdf-blank"></span>');
// Dòng bảng thông tin 2 cột (nhãn | giá trị); giá trị trống để ô trống điền tay
const pdfInfo = (label, v) => `<tr><td>${label}:</td><td>${escapeHtml(v || '')}</td></tr>`;
const pdfBox = (on) => `<span class="pf-pdf-box">${on ? '✓' : ''}</span>`;
const pdfCell = (v, center) => `<td${center ? ' class="is-center"' : ''}>${escapeHtml(v || '')}</td>`;
const pdfSlug = (v) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
let pdfName = 'Phieu-dang-ky';
const pdfFileName = (name) => `Phieu-dang-ky-${pdfSlug(name || '') || 'doi-clb'}`;

// ---------- Dữ liệu phiếu: đọc từ biểu mẫu đang nhập (hồ sơ đã lưu dùng teamRegData — XEM CHI TIẾT HỒ SƠ THÀNH LẬP ĐỘI, CLB) ----------
const teamFormData = () => {
  const val = (id) => document.querySelector(`#${id}`).value.trim();
  return {
    name: val('tm-name'), unit: val('tm-unit'), branch: val('tm-branch'), phone: val('tm-phone'), email: val('tm-email'),
    province: val('tm-province'), ward: val('tm-ward'), address: val('tm-address'), parent: val('tm-parent'), decision: val('tm-decision'),
    fields: teamMultis[0].selected().map((o) => o.textContent),
    leader: { name: val('tm-leader-name'), identity: val('tm-leader-id'), dob: val('tm-leader-dob'), gender: (leaderRadios.find((r) => r.checked) || {}).value || '' },
    // Hoạt động tình nguyện: bỏ dòng chưa nhập nội dung
    actsNone: actsNone.checked,
    acts: [...actsSection.querySelectorAll('tbody tr')].map((row) => ['Từ ngày', 'Đến ngày', 'Nội dung hoạt động'].map((k) => row.querySelector(`[data-label="${k}"]`).value.trim())).filter((a) => a[2]),
    members: memberEditor.data(),
    agree: document.querySelector('#tm-agree').checked,
    privacy: document.querySelector('#tm-privacy').checked,
    signPlace: val('tm-sign-place'), signDate: val('tm-sign-date'), signer: val('tm-signer'),
  };
};

// ---------- Nội dung: trả về HTML trang dọc (phiếu) và trang ngang (danh sách thành viên) ----------
const teamPdfContent = (data) => {
  const { acts, members } = data;
  const fields = data.fields.join(', ');
  const address = [data.address, data.ward, data.province].filter(Boolean).join(', ');
  const actsHtml = data.actsNone || !acts.length
    ? `<p>${data.actsNone ? 'Đội, câu lạc bộ chưa có hoạt động tình nguyện nào.' : '<span class="pf-pdf-blank is-long"></span>'}</p>`
    : `<table class="pf-pdf-table is-acts"><thead><tr><th style="width:52px">STT</th><th style="width:190px">Thời gian<br /><span class="pf-pdf-th-note">(từ ngày – đến ngày)</span></th><th>Nội dung hoạt động</th></tr></thead><tbody>${acts.map((a, i) => `<tr>${pdfCell(String(i + 1), true)}${pdfCell([a[0], a[1]].filter(Boolean).join(' – '), true)}${pdfCell(a[2])}</tr>`).join('')}</tbody></table>`;
  // Danh sách thành viên: nhóm I. Ban chủ nhiệm · II. Thành viên, STT đánh lại trong nhóm
  const group = (no, title, list) => (list.length ? `<tr class="is-group"><td class="is-center"><b>${no}</b></td><td colspan="12"><b>${title}</b></td></tr>` + list.map((m, i) => `<tr>${pdfCell(String(i + 1), true)}${pdfCell(m.name)}${pdfCell(m.role)}${pdfCell(m.gender, true)}${pdfCell(m.year, true)}${pdfCell(m.identity, true)}${pdfCell(m.phone, true)}${pdfCell(m.blood, true)}${pdfCell(m.address)}${pdfCell(m.education, true)}${pdfCell(m.qualification, true)}${pdfCell(m.activity)}${pdfCell(m.skills.join(', '))}</tr>`).join('') : '');
  const memberRows = group('I', 'BAN CHỦ NHIỆM', members.filter((m) => m.role !== 'Thành viên')) + group('II', 'THÀNH VIÊN', members.filter((m) => m.role === 'Thành viên'));
  const [d, mo, y] = data.signDate.split('/');
  const place = data.signPlace;
  const portrait = `
    <div class="pf-pdf-motto"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><b class="is-line">Độc lập - Tự do - Hạnh phúc</b></div>
    <h1 class="pf-pdf-title">ĐƠN ĐĂNG KÝ THÀNH LẬP ĐỘI, CÂU LẠC BỘ<br />TÌNH NGUYỆN VIÊN CHỮ THẬP ĐỎ</h1>
    <p class="pf-pdf-to">Kính gửi: ${pdfVal(data.unit)}</p>
    <h2>1. Thông tin đội, câu lạc bộ</h2>
    <table class="pf-pdf-table is-info"><tbody>
      ${pdfInfo('Tên đội, câu lạc bộ', data.name)}
      ${pdfInfo('Số lượng thành viên (đính kèm danh sách thành viên)', `${members.length} thành viên`)}
      ${pdfInfo('Chủ nhiệm đội, câu lạc bộ', data.leader.name)}
      ${pdfInfo('- Giới tính', data.leader.gender)}
      ${pdfInfo('- Ngày, tháng, năm sinh', data.leader.dob)}
      ${pdfInfo('- Số định danh cá nhân', data.leader.identity)}
      ${pdfInfo('Địa chỉ sinh hoạt đội, câu lạc bộ', address)}
      ${pdfInfo('Điện thoại liên lạc', data.phone)}
      ${pdfInfo('Địa chỉ email', data.email)}
      ${pdfInfo('Cơ quan hiện đội, câu lạc bộ đang trực thuộc (nếu có; ghi rõ số QĐ thành lập đội, câu lạc bộ)', [data.parent, data.decision && `QĐ thành lập số ${data.decision}`].filter(Boolean).join('; '))}
      ${pdfInfo('Đơn vị quản lý (Hội Chữ thập đỏ)', data.unit)}
      ${pdfInfo('Chi hội trực thuộc', data.branch)}
      ${pdfInfo('Lĩnh vực hoạt động của đội, câu lạc bộ', fields)}
    </tbody></table>
    <h2>2. Hoạt động tình nguyện</h2>
    ${actsHtml}
    <h2>3. Danh sách các thành viên đội, câu lạc bộ</h2>
    <p>Gồm ${members.length} người (danh sách kèm theo).</p>
    <h2>4. Cam kết</h2>
    <p class="pf-pdf-text">Sau khi nghiên cứu Điều lệ Hội Chữ thập đỏ Việt Nam và Quy chế tổ chức và hoạt động của tình nguyện viên Chữ thập đỏ, chúng tôi tự nguyện đăng ký thành lập đội, câu lạc bộ nêu trên, chấp hành Điều lệ, Quy chế và sẵn sàng nhận nhiệm vụ do Hội giao.</p>
    <p class="pf-pdf-check">${pdfBox(data.agree)}Tôi đã đọc Điều lệ, Quy chế và đồng ý với cam kết trên.</p>
    <p class="pf-pdf-check">${pdfBox(data.privacy)}Tôi đồng ý để Hội xử lý dữ liệu cá nhân trong hồ sơ cho mục đích xét duyệt và quản lý tình nguyện viên.</p>
    <div class="pf-pdf-sign">
      <div>
        <p class="pf-pdf-date">${place ? escapeHtml(place) : '<span class="pf-pdf-blank is-short"></span>'}, ngày ${d || '……'} tháng ${mo || '……'} năm ${y || '……'}</p>
        <p><b>NGƯỜI ĐĂNG KÝ</b></p>
        <p class="pf-pdf-note">(TM đội, câu lạc bộ — ký, ghi rõ họ tên)</p>
        <p class="pf-pdf-signer"><b>${pdfVal(data.signer)}</b></p>
      </div>
    </div>`;
  const landscape = `
    <h1 class="pf-pdf-title is-list">DANH SÁCH CÁC THÀNH VIÊN ĐỘI, CÂU LẠC BỘ</h1>
    <p class="pf-pdf-sub">${data.name ? escapeHtml(data.name) : 'Đội, câu lạc bộ: <span class="pf-pdf-blank"></span>'} · ${members.length} người</p>
    <table class="pf-pdf-table is-members"><thead><tr><th style="width:32px">STT</th><th style="width:130px">Họ và tên</th><th style="width:84px">Chức vụ</th><th style="width:44px">Giới tính</th><th style="width:44px">Năm sinh</th><th style="width:92px">Số định danh</th><th style="width:80px">Điện thoại</th><th style="width:44px">Nhóm máu</th><th>Địa chỉ</th><th style="width:48px">Văn hóa</th><th style="width:72px">Chuyên môn</th><th style="width:110px">Lĩnh vực hoạt động</th><th style="width:120px">Kỹ năng</th></tr></thead><tbody>${memberRows}</tbody></table>`;
  return { portrait, landscape };
};

// ---------- Chia trang: thêm từng khối vào trang; tràn thì sang trang mới (kéo theo tiêu đề h2 đứng trước), bảng ngắt theo dòng ----------
const pdfFlow = (html, landscape) => {
  const makePage = () => {
    const page = document.createElement('section');
    page.className = `pf-pdf-page${landscape ? ' is-landscape' : ''}`;
    page.innerHTML = '<div class="pf-pdf-mark" aria-hidden="true">BẢN XEM TRƯỚC</div><div class="pf-pdf-content"></div><div class="pf-pdf-num"></div>';
    pdfPages.append(page);
    return page.querySelector('.pf-pdf-content');
  };
  let box = makePage();
  const fits = () => box.scrollHeight <= box.clientHeight + 1;
  // Dời node (cùng các node sau nó, và tiêu đề h2 ngay trước) sang trang mới — trừ khi đã là khối đầu trang.
  // Khối ký không đứng một mình đầu trang: kéo theo đoạn ngay trước nó
  const breakBefore = (node) => {
    const prev = node.previousElementSibling;
    const first = prev && (prev.tagName === 'H2' || node.classList.contains('pf-pdf-sign')) ? prev : node;
    if (first === box.firstElementChild) return;
    const moving = [];
    for (let n = first; n; n = n.nextElementSibling) moving.push(n);
    box = makePage();
    box.append(...moving);
  };
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  [...tpl.content.children].forEach((block) => {
    box.append(block);
    if (fits()) return;
    if (block.tagName !== 'TABLE') { breakBefore(block); return; }
    const shell = block.cloneNode(true);
    shell.tBodies[0].replaceChildren();
    const rows = [...block.tBodies[0].rows];
    block.tBodies[0].replaceChildren();
    if (!fits()) breakBefore(block);
    let table = block;
    rows.forEach((row) => {
      table.tBodies[0].append(row);
      if (fits()) return;
      // Dòng tiêu đề nhóm (I. / II.) không đứng cuối trang: đi cùng dòng đầu của nhóm
      const carry = [row];
      const prev = row.previousElementSibling;
      if (prev && prev.classList.contains('is-group')) carry.unshift(prev);
      if (carry.length === table.tBodies[0].rows.length) { breakBefore(table); return; }
      box = makePage();
      table = shell.cloneNode(true);
      box.append(table);
      table.tBodies[0].append(...carry);
    });
  });
};

// ---------- Thu phóng · trang hiện tại · chuyển trang ----------
const PDF_ZOOMS = [50, 67, 75, 90, 100, 110, 125, 150, 175, 200];
let pdfZoom = 100;
const pdfPageList = () => [...pdfPages.children];
const setPdfZoom = (z) => {
  pdfZoom = z;
  pdfPages.style.zoom = z / 100;
  teamPdf.querySelector('[data-pdf-zoom]').textContent = `${z}%`;
  teamPdf.querySelector('[data-pdf-zoom-out]').disabled = z === PDF_ZOOMS[0];
  teamPdf.querySelector('[data-pdf-zoom-in]').disabled = z === PDF_ZOOMS[PDF_ZOOMS.length - 1];
  syncPdfPage();
};
const pdfCurrent = () => {
  const top = pdfBody.getBoundingClientRect().top + pdfBody.clientHeight / 3;
  const pages = pdfPageList();
  let current = 0;
  pages.forEach((p, i) => { if (p.getBoundingClientRect().top <= top) current = i; });
  return current;
};
const syncPdfPage = () => {
  const current = pdfCurrent();
  const total = pdfPageList().length;
  teamPdf.querySelector('[data-pdf-current]').textContent = current + 1;
  teamPdf.querySelector('[data-pdf-total]').textContent = total;
  teamPdf.querySelector('[data-pdf-prev]').disabled = current === 0;
  teamPdf.querySelector('[data-pdf-next]').disabled = current === total - 1;
};
const goPdfPage = (i) => {
  const page = pdfPageList()[i];
  if (page) pdfBody.scrollTop += page.getBoundingClientRect().top - pdfBody.getBoundingClientRect().top - 24;
};
pdfBody.addEventListener('scroll', syncPdfPage, { passive: true });
teamPdf.querySelector('[data-pdf-prev]').addEventListener('click', () => goPdfPage(pdfCurrent() - 1));
teamPdf.querySelector('[data-pdf-next]').addEventListener('click', () => goPdfPage(pdfCurrent() + 1));
teamPdf.querySelector('[data-pdf-zoom-out]').addEventListener('click', () => setPdfZoom(PDF_ZOOMS[Math.max(0, PDF_ZOOMS.indexOf(pdfZoom) - 1)]));
teamPdf.querySelector('[data-pdf-zoom-in]').addEventListener('click', () => setPdfZoom(PDF_ZOOMS[Math.min(PDF_ZOOMS.length - 1, PDF_ZOOMS.indexOf(pdfZoom) + 1)]));

// ---------- Mở: dựng trang ở 100% (để đo đúng), đánh số trang, rồi chọn mức phóng vừa bề ngang ----------
// data: teamFormData() (biểu mẫu đang nhập) hoặc teamRegData(hồ sơ) (modal Xem chi tiết hồ sơ)
const openTeamPdf = (data) => {
  pdfName = pdfFileName(data.name);
  teamPdf.querySelector('.pf-pdf-name').textContent = `${pdfName}.pdf`;
  teamPdf.showModal();
  pdfPages.style.zoom = 1;
  pdfPages.replaceChildren();
  const { portrait, landscape } = teamPdfContent(data);
  pdfFlow(portrait, false);
  pdfFlow(landscape, true);
  pdfPageList().forEach((page, i) => { page.querySelector('.pf-pdf-num').textContent = i + 1; page.setAttribute('aria-label', `Trang ${i + 1}`); });
  const widest = Math.max(...pdfPageList().map((p) => p.offsetWidth));
  const fit = ((pdfBody.clientWidth - 48) / widest) * 100;
  setPdfZoom([...PDF_ZOOMS].reverse().find((z) => z <= Math.min(100, fit)) || PDF_ZOOMS[0]);
  pdfBody.scrollTop = 0;
  syncPdfPage();
};
team.querySelector('[data-team-pdf]').addEventListener('click', () => openTeamPdf(teamFormData()));
teamPdf.querySelector('[data-pdf-close]').addEventListener('click', () => teamPdf.close());

// ---------- In / Tải về PDF: iframe ẩn chỉ chứa các trang + styles.css; mỗi trang 1 tờ A4 (dọc / ngang) ----------
const printTeamPdf = () => {
  const frame = document.createElement('iframe');
  frame.className = 'pf-pdf-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.srcdoc = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${escapeHtml(pdfName)}</title><base href="${escapeHtml(location.href)}"><link rel="stylesheet" href="styles.css"><style>@page{size:A4 portrait;margin:0}@page landscape{size:A4 landscape;margin:0}html,body{margin:0;background:#fff}.pf-pdf-pages{display:block;width:auto;min-width:0}.pf-pdf-page{box-shadow:none;break-after:page}.pf-pdf-page:last-child{break-after:auto}</style></head><body><div class="pf-pdf-pages">${pdfPages.innerHTML}</div></body></html>`;
  frame.addEventListener('load', () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1000);
  });
  document.body.append(frame);
};
teamPdf.querySelector('[data-pdf-print]').addEventListener('click', printTeamPdf);
teamPdf.querySelector('[data-pdf-download]').addEventListener('click', printTeamPdf);
