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
const toast = document.querySelector('.pf-toast');
let toastTimer;
const showToast = (message) => {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
};

// ==================== HELPERS ====================
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Bỏ dấu để tìm "ha tinh" vẫn ra "Hà Tĩnh"
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const viDate = (iso) => iso.split('-').reverse().join('/');
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const fillOptions = (select, values) => values.forEach((value) => select.add(new Option(value, value)));
const kv = (rows) => `<dl class="pf-kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const timeline = (items) => `<ol class="pf-timeline">${items.map((i) => `<li class="${i.cls || ''}"><time datetime="${i.date}">${viDate(i.date)}</time><strong>${escapeHtml(i.title)}</strong>${i.meta ? `<span>${escapeHtml(i.meta)}</span>` : ''}</li>`).join('')}</ol>`;

// ==================== DATA: chương trình & hồ sơ người yếu thế (minh họa) ====================
// Bảng “Chương trình của tôi” hiện đủ trường như mẫu datatable (mã, ảnh, tên + mô tả, lĩnh vực, đơn vị, người phụ trách,
// địa bàn, mục tiêu, thời gian triển khai, trạng thái, ngày tạo); màn chi tiết thêm tiến độ, số đã nhận và lịch sử xử lý.
const IMG = 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/';
const PROGRAM_STATUS = {
  active: { label: 'Đang hoạt động', tone: 'green', slug: 'hoat-dong' },
  pending: { label: 'Đang chờ duyệt', tone: 'orange', slug: 'cho-duyet' },
  done: { label: 'Đã kết thúc', tone: 'blue', slug: 'hoan-thanh' },
  rejected: { label: 'Từ chối phê duyệt', tone: 'red', slug: 'tu-choi' },
  draft: { label: 'Bản nháp', tone: 'neutral', slug: 'ban-nhap' },
};
const PROGRAMS = [
  { code: 'CT-2026-040', img: '3.-028ae9de1f.jpg', name: 'Tiếp sức đến trường vùng cao', desc: 'Học bổng, sách vở và áo ấm cho 1.200 học sinh các điểm trường vùng cao huyện Đồng Văn trước mùa đông.', field: 'Giáo dục & Khuyến học', tone: 'blue', unit: 'Hội CTĐ Huyện Đồng Văn', owner: 'Vàng Seo Sùng', area: 'Hà Giang', goal: '800 triệu ₫', raised: '680 triệu ₫', pct: 85, period: '28/09/2026 – 20/11/2026', note: 'Đạt 85% mục tiêu', status: 'active', created: '2026-09-28', updated: '2026-10-12', detail: 'tiep-suc-den-truong' },
  { code: 'CT-2026-039', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', name: 'Bữa cơm yêu thương bệnh viện', desc: 'Cung cấp 30.000 suất ăn miễn phí cho bệnh nhân nghèo và người nhà tại 3 bệnh viện tuyến tỉnh.', field: 'Y tế - Sức khỏe', tone: 'orange', unit: 'Hội CTĐ TP. Hồ Chí Minh', owner: 'Trần Mỹ Linh', area: 'TP. Hồ Chí Minh', goal: '500 triệu ₫', raised: '0 ₫', pct: 0, period: '01/11/2026 – 01/05/2027', note: 'Chờ duyệt hồ sơ, chưa mở vận động', status: 'pending', created: '2026-09-25', updated: '2026-10-08' },
  { code: 'CT-2026-037', img: 'trao-qua-hoc-sinh.jpg', name: 'Áo ấm mùa đông trẻ em biên giới', desc: 'May và tặng 3.500 áo ấm cho trẻ em các xã biên giới tỉnh Lào Cai.', field: 'Trẻ em - Biên giới', tone: 'green', unit: 'Hội CTĐ Tỉnh Lào Cai', owner: 'Đỗ Thu Hà', area: 'Lào Cai', goal: '500 triệu ₫', raised: '460 triệu ₫', pct: 92, period: '18/09/2026 – 15/12/2026', note: 'Đạt 92% mục tiêu', status: 'active', created: '2026-09-18', updated: '2026-10-11' },
  { code: 'CT-2026-035', img: '01%201.jpg', name: 'Tủ sách cộng đồng vùng sâu', desc: 'Xây dựng 20 tủ sách cộng đồng tại các thôn đặc biệt khó khăn.', field: 'Giáo dục & Khuyến học', tone: 'blue', unit: 'Hội CTĐ Tỉnh Đắk Lắk', owner: 'Đặng Minh Tuấn', area: 'Đắk Lắk', goal: '200 triệu ₫', raised: '0 ₫', pct: 0, period: 'Chưa kích hoạt', note: 'Hồ sơ chưa đáp ứng tiêu chí minh bạch tài chính', status: 'rejected', created: '2026-09-05', updated: '2026-09-15' },
  { code: 'CT-2026-031', img: 'z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', name: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung', desc: 'Nhu yếu phẩm, nước sạch và hỗ trợ sửa chữa nhà cửa cho các hộ dân bị ảnh hưởng nặng sau lũ.', field: 'Cứu trợ thiên tai', tone: 'red', unit: 'Hội CTĐ Tỉnh Quảng Trị', owner: 'Lê Văn Hải', area: 'Quảng Trị', goal: '2 tỷ ₫', raised: '1,24 tỷ ₫', pct: 62, period: '02/09/2026 – 30/11/2026', note: 'Đạt 62% mục tiêu', status: 'active', created: '2026-09-02', updated: '2026-10-13', detail: 'lu-lut-mien-trung' },
  { code: 'CT-2026-028', img: '1358142_gen-h-235_1777566365.jpg', name: 'Nước sạch cho người dân vùng hạn mặn', desc: 'Lắp 120 bồn chứa và máy lọc nước cho hộ dân vùng hạn mặn.', field: 'Nước sạch & Vệ sinh', tone: 'blue', unit: 'Hội CTĐ Tỉnh Bến Tre', owner: 'Nguyễn Thị Lan', area: 'Bến Tre', goal: '500 triệu ₫', raised: '0 ₫', pct: 0, period: '15/10/2026 – 15/01/2027', note: 'Cần bổ sung kế hoạch giải ngân', status: 'pending', created: '2026-08-20', updated: '2026-10-05', detail: 'nuoc-sach-han-man' },
  { code: 'CT-2026-019', img: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', name: 'Khám bệnh, cấp thuốc miễn phí cho người cao tuổi', desc: 'Khám sức khỏe và cấp thuốc miễn phí cho 2.000 người cao tuổi.', field: 'Y tế - Sức khỏe', tone: 'orange', unit: 'Hội CTĐ Tỉnh Hà Tĩnh', owner: 'Nguyễn Ngọc Trâm', area: 'Hà Tĩnh', goal: '300 triệu ₫', raised: '320 triệu ₫', pct: 107, period: '01/06/2026 – 30/08/2026', note: 'Hoàn thành, đã công khai sao kê', status: 'done', created: '2026-05-28', updated: '2026-09-02', detail: 'kham-benh-nguoi-cao-tuoi' },
  { code: 'CT-2026-012', img: 'z765570465791.jpg', name: 'Giọt hồng yêu thương — tiếp sức kho máu mùa hè', desc: 'Ngày hội hiến máu tại 6 điểm trong tỉnh, bổ sung kho máu mùa hè.', field: 'Hiến máu nhân đạo', tone: 'red', unit: 'Hội CTĐ Tỉnh Hà Tĩnh', owner: 'Nguyễn Ngọc Trâm', area: 'Hà Tĩnh', goal: '100 đơn vị máu', raised: '120 đơn vị máu', pct: 120, period: '01/06/2026 – 15/07/2026', note: 'Hoàn thành, đã công khai kết quả', status: 'done', created: '2026-05-20', updated: '2026-07-20', detail: 'hien-mau-mua-he' },
  { code: 'CT-2026-008', img: '1-1-3-9134.avif', name: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn', desc: 'Xây mới 3 căn nhà nhân ái cho hộ nghèo, người cao tuổi neo đơn.', field: 'Sinh kế & Nhà ở', tone: 'green', unit: 'Hội CTĐ Tỉnh Nghệ An', owner: 'Phan Văn Đức', area: 'Nghệ An', goal: '300 triệu ₫', raised: '315 triệu ₫', pct: 105, period: '10/03/2026 – 30/05/2026', note: 'Hoàn thành, đã bàn giao 3 căn nhà', status: 'done', created: '2026-03-10', updated: '2026-06-05', detail: 'mai-am-nhan-ai' },
  { code: 'CT-2026-005', img: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', name: 'Sơ cấp cứu cộng đồng ven biển', desc: 'Tập huấn sơ cấp cứu và trang bị túi cứu thương cho 40 thôn ven biển.', field: 'Y tế - Sức khỏe', tone: 'orange', unit: 'Hội CTĐ Tỉnh Quảng Bình', owner: 'Hoàng Thị Mai', area: 'Quảng Bình', goal: '150 triệu ₫', raised: '60 triệu ₫', pct: 40, period: '15/02/2026 – 31/12/2026', note: 'Đạt 40% mục tiêu', status: 'active', created: '2026-02-15', updated: '2026-10-01' },
  { code: 'CT-2026-003', img: 'trao-qua-hoc-sinh.jpg', name: 'Sinh kế cho phụ nữ đơn thân', desc: 'Hỗ trợ vốn chăn nuôi và tập huấn kỹ thuật cho 50 hộ phụ nữ đơn thân.', field: 'Sinh kế & Nhà ở', tone: 'green', unit: 'Hội CTĐ Huyện Kỳ Sơn', owner: 'Lô Thị Hương', area: 'Nghệ An', goal: '250 triệu ₫', raised: '0 ₫', pct: null, period: 'Chưa xác định', note: 'Bản nháp, chưa gửi duyệt', status: 'draft', created: '2026-01-22', updated: '2026-01-25' },
  { code: 'CT-2026-001', img: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', name: 'Tết nhân ái 2026', desc: 'Tặng 1.500 suất quà Tết cho hộ nghèo, hộ khó khăn trong tỉnh.', field: 'Trợ giúp nhân đạo', tone: 'red', unit: 'Hội CTĐ Tỉnh Hà Tĩnh', owner: 'Nguyễn Ngọc Trâm', area: 'Hà Tĩnh', goal: '400 triệu ₫', raised: '448 triệu ₫', pct: 112, period: '05/01/2026 – 15/02/2026', note: 'Hoàn thành, đã công khai sao kê', status: 'done', created: '2026-01-05', updated: '2026-02-20' },
];
// Đối tượng tạo & mục tiêu quy ra triệu đồng (để lọc “Mục tiêu quyên góp”; null = mục tiêu không tính bằng tiền)
const PROGRAM_EXTRA = {
  'CT-2026-040': ['Tổ chức', 800], 'CT-2026-039': ['Cá nhân', 500], 'CT-2026-037': ['Tổ chức', 500], 'CT-2026-035': ['Tổ chức', 200],
  'CT-2026-031': ['Tổ chức', 2000], 'CT-2026-028': ['Tổ chức', 500], 'CT-2026-019': ['Cá nhân', 300], 'CT-2026-012': ['Cá nhân', null],
  'CT-2026-008': ['Tổ chức', 300], 'CT-2026-005': ['Cá nhân', 150], 'CT-2026-003': ['Cá nhân', 250], 'CT-2026-001': ['Tổ chức', 400],
};
PROGRAMS.forEach((p) => { [p.creator, p.goalValue] = PROGRAM_EXTRA[p.code]; });
// Dòng 1 của cột “Thời gian triển khai”: tình trạng ngắn gọn theo trạng thái & tiến độ
const programStage = (p) => ({
  active: [`Đạt ${p.pct}%`, 'green'],
  pending: ['Chờ duyệt hồ sơ', 'orange'],
  done: [`Hoàn thành ${p.pct}%`, 'blue'],
  rejected: ['Không phê duyệt', 'red'],
  draft: ['Chưa gửi duyệt', 'neutral'],
}[p.status]);
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
  program: (p) => [
    { label: 'Xem chi tiết', icon: 'eye', href: `#chuong-trinh/xem/${p.code}` },
    { label: 'Chỉnh sửa', icon: 'pencil', panel: `Chỉnh sửa chương trình ${p.code}` },
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

// ==================== BẢNG DỮ LIỆU: lọc, đánh số thứ tự, phân trang (dùng chung 2 danh sách) ====================
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
    body.closest('.pf-table-card').scrollIntoView({ block: 'nearest' });
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
  status: '',
  search: document.querySelector('#ct-search'),
  field: document.querySelector('#ct-field'),
  area: document.querySelector('#ct-area'),
  progress: document.querySelector('#ct-progress'),
  budget: document.querySelector('#ct-budget'),
};
const ctFilters = [ct.field, ct.area, ct.progress, ct.budget];
fillOptions(ct.field, [...new Set(PROGRAMS.map((p) => p.field))]);
fillOptions(ct.area, [...new Set(PROGRAMS.map((p) => p.area))].sort((a, b) => a.localeCompare(b, 'vi')));
const countProgramFilters = setupFilterPanel('ct-filters', ctFilters);

// Thời gian triển khai “dd/mm/yyyy – dd/mm/yyyy” tách thành 2 mục: Từ · Đến (mỗi mục 1 dòng)
const periodLines = (period) => {
  const [from, to] = period.split(' – ');
  if (!to) return line(period, { label: 'Thời gian triển khai', cls: 'is-muted' });
  return line(`Từ ${from}`, { label: 'Bắt đầu', cls: 'is-small' }) + line(`Đến ${to}`, { label: 'Kết thúc', cls: 'is-muted' });
};
const programRow = (p, index) => {
  const [, tone] = programStage(p);
  const view = `#chuong-trinh/xem/${p.code}`;
  const pct = Math.min(p.pct || 0, 100);
  const open = p.status !== 'pending' && p.status !== 'draft';
  return `<tr>
    ${rowIndex(index)}
    <td>
      <div class="pf-cell-stack">
        <a class="pf-cell-title" href="${view}"><span class="pf-clamp-1" data-tip>${escapeHtml(p.name)}</span></a>
        <span class="pf-cell-line is-code"><span class="visually-hidden">Mã chương trình: </span><span>${p.code}</span></span>
      </div>
    </td>
    <td><span class="pf-tag is-blue pf-cell-tag"><span class="pf-clamp-2" data-tip>${escapeHtml(p.field)}</span></span></td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(p.owner)}</span></td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(p.area)}</span></td>
    <td>
      <div class="pf-cell-stack">
        ${line(p.goal, { label: 'Mục tiêu', cls: 'is-strong', tip: `Mục tiêu: ${p.goal} · Đã nhận: ${open ? p.raised : 'chưa vận động'}` })}
        <span class="pf-cell-progress">
          <span class="progress-bar${p.status === 'done' ? ' is-blue' : ''}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ ${escapeHtml(p.name)}"><span style="--value:${pct}%"></span></span>
          <strong class="is-${tone}">${open ? `${p.pct}%` : '—'}</strong>
        </span>
      </div>
    </td>
    <td><div class="pf-cell-stack">${periodLines(p.period)}</div></td>
    <td class="pf-col-date">${viDate(p.created)}</td>
    ${rowActions(view, 'program', p.code)}
  </tr>`;
};
const programTable = createTable({
  rows: PROGRAMS,
  body: document.querySelector('#ct-rows'),
  empty: document.querySelector('#ct-empty'),
  pager: document.querySelector('#ct-pager'),
  range: document.querySelector('#ct-range'),
  renderRow: programRow,
});

const PROGRESS_MATCH = {
  none: (p) => !p.pct,
  low: (p) => p.pct > 0 && p.pct < 50,
  mid: (p) => p.pct >= 50 && p.pct < 100,
  reached: (p) => p.pct >= 100,
};
const BUDGET_MATCH = {
  small: (p) => p.goalValue !== null && p.goalValue < 300,
  medium: (p) => p.goalValue !== null && p.goalValue >= 300 && p.goalValue <= 800,
  large: (p) => p.goalValue !== null && p.goalValue > 800,
};
const applyProgramFilter = () => {
  const query = fold(ct.search.value.trim());
  programTable.setFilter((p) => (!query || fold(`${p.code} ${p.name}`).includes(query))
    && (!ct.status || p.status === ct.status)
    && (!ct.field.value || p.field === ct.field.value)
    && (!ct.area.value || p.area === ct.area.value)
    && (!ct.progress.value || PROGRESS_MATCH[ct.progress.value](p))
    && (!ct.budget.value || BUDGET_MATCH[ct.budget.value](p)));
  countProgramFilters();
};
ct.search.addEventListener('input', applyProgramFilter);
ctFilters.forEach((el) => el.addEventListener('change', applyProgramFilter));
document.querySelector('#ct-reset').addEventListener('click', () => {
  ctFilters.forEach((el) => { el.value = ''; });
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
    rows.map((p) => [p.code, p.name, p.desc, p.creator, p.field, p.unit, p.owner, p.area, p.goal, p.raised, p.pct === null ? '' : `${p.pct}%`, p.period, PROGRAM_STATUS[p.status].label, viDate(p.created), viDate(p.updated)]),
    filename,
  );
  showToast(`Đã kết xuất ${rows.length} chương trình ra tệp CSV.`);
}
document.querySelector('#ct-export').addEventListener('click', () => exportPrograms(programTable.shownRows()));

// ==================== SECTION: XEM CHI TIẾT CHƯƠNG TRÌNH — modal phải (cùng cỡ Đăng ký): 3 ô thống kê · Tổng quan · Đơn vị & liên hệ · Nguồn lực · Hàng hóa · Phân công · Hồ sơ ====================
// ---------- Dữ liệu hồ sơ đăng ký (minh họa): suy từ PROGRAMS, bổ sung riêng cho chương trình có hồ sơ đầy đủ ----------
const PRIORITY = {
  urgent: ['Khẩn cấp (Ưu tiên cứu trợ thiên tai, hiểm nghèo cấp bách)', 'is-urgent'],
  high: ['Cao', 'is-high'],
  normal: ['Bình thường', 'is-normal'],
};
// Lĩnh vực → [loại hình hỗ trợ, nhóm đối tượng hưởng lợi]
const FIELD_PRESET = {
  'Cứu trợ thiên tai': ['Cứu trợ nhân đạo', ['Nạn nhân thiên tai', 'Hộ nghèo, cận nghèo']],
  'Giáo dục & Khuyến học': ['Cứu trợ nhân đạo', ['Trẻ em có hoàn cảnh khó khăn', 'Hộ nghèo, cận nghèo', 'Người khuyết tật']],
  'Trẻ em - Biên giới': ['Cứu trợ nhân đạo', ['Trẻ em có hoàn cảnh khó khăn', 'Hộ nghèo, cận nghèo', 'Nạn nhân thiên tai']],
  'Y tế - Sức khỏe': ['Hỗ trợ y tế', ['Người cao tuổi neo đơn', 'Hộ nghèo, cận nghèo']],
  'Hiến máu nhân đạo': ['Hỗ trợ y tế', ['Hộ nghèo, cận nghèo']],
  'Nước sạch & Vệ sinh': ['Cứu trợ nhân đạo', ['Hộ nghèo, cận nghèo']],
  'Sinh kế & Nhà ở': ['Hỗ trợ sinh kế', ['Hộ nghèo, cận nghèo', 'Người cao tuổi neo đơn']],
  'Trợ giúp nhân đạo': ['Cứu trợ nhân đạo', ['Hộ nghèo, cận nghèo']],
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
    groups: ['Hộ nghèo, cận nghèo', 'Trẻ em có hoàn cảnh khó khăn', 'Nạn nhân thiên tai'],
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
    priority: p.field === 'Cứu trợ thiên tai' ? 'urgent' : 'normal',
    creatorName: p.creator === 'Tổ chức' ? p.unit : p.owner,
    phone: '0912 345 678',
    email: 'lienhe@hoichuthapdo.vn',
    goal: `Huy động nguồn lực cho chương trình “${p.name}” tại ${p.area}.`,
    target: `- ${p.desc}`,
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
    raiseFrom: viDate(p.created),
    raiseTo: viDate(addDays(p.created, 45)),
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
    <div class="pf-pager"><div class="pf-pages">
      <button class="pf-page-btn is-prev" type="button" data-goods-page="${current - 1}" ${current === 1 ? 'disabled' : ''} aria-label="Trang trước">${icon('page-arrow')}</button>
      ${Array.from({ length: pages }, (_, i) => i + 1).map((n) => `<button class="pf-page-btn" type="button" data-goods-page="${n}" ${n === current ? 'aria-current="page"' : ''} aria-label="Trang ${n}">${n}</button>`).join('')}
      <button class="pf-page-btn" type="button" data-goods-page="${current + 1}" ${current === pages ? 'disabled' : ''} aria-label="Trang sau">${icon('page-arrow')}</button>
    </div></div>
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

// ---------- Dựng nội dung modal: 3 ô thống kê · Tổng quan · Đơn vị & liên hệ | Nguồn lực · Hàng hóa · Phân công · Hồ sơ ----------
const renderProgramView = (p) => {
  const f = programForm(p);
  const st = PROGRAM_STATUS[p.status];
  const [priorityLabel, priorityCls] = PRIORITY[f.priority];
  const reasons = p.status === 'rejected' ? p.note.split(/;\s*/) : [];
  const note = document.querySelector('#pf-view-note');
  const dot = '<span aria-hidden="true">•</span>';
  document.querySelector('#pf-view-title').textContent = p.name;
  document.querySelector('#pf-view-sub').innerHTML = `<span>Mã chương trình: <b>${p.code}</b></span>${dot}<span class="pf-badge is-${st.tone}"><span class="pf-dot" aria-hidden="true"></span>${st.label}</span>${dot}<span>Ngày tạo: ${viDate(p.created)}</span>`;
  // Lý do từ chối / ghi chú duyệt: thông tin của hồ sơ → hiển thị ở đầu modal
  note.hidden = !(reasons.length || p.status === 'pending');
  note.className = `pf-view-note${reasons.length ? ' is-red' : ''}`;
  note.innerHTML = reasons.length ? `<b>Lý do từ chối:</b> ${reasons.map(escapeHtml).join('; ')}` : `<b>Ghi chú:</b> ${vText(p.note)}`;
  // Chân modal: Xem mã QR ủng hộ · Trang công khai chỉ hiện khi chương trình Đang hoạt động; Chỉnh sửa chỉ khi Bản nháp
  const isActive = p.status === 'active';
  const qrBtn = document.querySelector('#pf-view-qr');
  const publicLink = document.querySelector('#pf-view-public');
  qrBtn.hidden = !isActive;
  // Bản nháp: thêm nút Chỉnh sửa
  const editBtn = document.querySelector('#pf-view-edit');
  editBtn.hidden = p.status !== 'draft';
  editBtn.dataset.panel = `Chỉnh sửa chương trình ${p.code}`;
  qrBtn.dataset.panel = `Mã QR ủng hộ chương trình ${p.code}`;
  publicLink.hidden = !isActive;
  if (p.detail) {
    publicLink.href = `chuong-trinh.html?id=${p.detail}`;
    delete publicLink.dataset.panel;
  } else {
    // Chưa có trang công khai minh họa → hiện thông báo xem trước
    publicLink.href = '#';
    publicLink.dataset.panel = `Trang công khai chương trình ${p.code}`;
  }
  const target = (f.target || '').replace(/^-\s*/, '');
  document.querySelector('#pf-view-body').innerHTML = `
    <!-- Số liệu chính -->
    <div class="pf-view-stats" id="pf-v-overview">
      ${vStat('layers', 'Mục tiêu quyên góp (VND)', f.money ? `${vVnd(f.money)} VND` : vText(p.goal))}
      ${vStat('people', 'Số người/hộ hưởng lợi dự kiến', f.people ? `${vVnd(f.people)} người` : '')}
      ${vStat('user', 'Số lượng TNV dự kiến', f.volunteers ? `${vVnd(f.volunteers)} người` : '')}
    </div>

    <!-- Tổng quan chương trình (4 : 6): trái — ảnh banner + lĩnh vực, mức độ ưu tiên · phải — dòng nhãn – giá trị (mục tiêu, phạm vi, thời gian) -->
    ${vCard('pf-v-summary', 'Tổng quan chương trình', `<div class="pf-view-overview">
      <div class="pf-view-overview-side">
        <figure class="pf-view-banner"><img src="${IMG}${p.img}" alt="Ảnh banner chương trình ${escapeHtml(p.name)}" loading="lazy" /></figure>
        ${vKvs([
          vKv('Lĩnh vực thiện nguyện trọng tâm', vText(p.field)),
          vKv('Mức độ ưu tiên', `<span class="pf-view-priority"><span class="pf-reg-dot ${priorityCls}" aria-hidden="true"></span>${priorityLabel}</span>`),
        ])}
      </div>
      ${vKvs([
        vKv('Mục tiêu tổng quát', vText(f.goal)),
        vKv('Mục tiêu cụ thể/chỉ tiêu', vText(target)),
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
        vKv('Mục tiêu quyên góp (VND)', f.money ? `${vVnd(f.money)} VND` : vText(p.goal)),
        vKv('Địa điểm hàng hóa tập kết', vText(f.depot)),
      ]))}
    </div>

    ${vCard('pf-v-goods', 'Danh sách hàng hóa nhận', '<div id="pf-v-goods-body"></div>', `${f.goods.length} mặt hàng`)}

    ${vCard('pf-v-assign', 'Phân công đầu mối trách nhiệm thực thi', vTable('is-v-assign', ['Đơn vị/Tổ chức', 'Người phụ trách', 'Nhiệm vụ chính', 'Thời hạn hoàn thành'],
      f.assign.map(([unit, person, task, date]) => [`<b>${escapeHtml(unit)}</b>`, escapeHtml(person), escapeHtml(task), escapeHtml(date || '—')]),
      'Chưa phân công đầu mối.'), `${f.assign.length} đầu mối`)}

    ${vCard('pf-v-docs', 'Hồ sơ đề án &amp; Văn bản pháp lý đính kèm', vDocs(f.docs), `${f.docs.length} tệp`)}`;
  pfViewGoods = f.goods;
  renderViewGoods(1);
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
    showToast(`Không tìm thấy chương trình “${code}”.`);
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
};
function closeProgramView(updateHash = true) {
  if (pfView.hidden) return;
  pfView.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  pfViewTimer = setTimeout(() => { pfView.hidden = true; }, viewReduced() ? 0 : 300);
  pfViewCode = null;
  if (updateHash && window.location.hash.startsWith('#chuong-trinh/xem/')) {
    const slug = ct.status && ct.status !== 'active' ? `/${PROGRAM_STATUS[ct.status].slug}` : '';
    history.replaceState(null, '', `#chuong-trinh${slug}`);
  }
  if (pfViewTrigger && document.contains(pfViewTrigger)) pfViewTrigger.focus();
}
pfView.querySelectorAll('[data-close-view]').forEach((button) => button.addEventListener('click', () => closeProgramView()));
pfViewBody.addEventListener('click', (event) => {
  if (event.target.closest('[data-download], [data-preview]')) showToast('Bản xem trước — tệp chưa được tải từ hệ thống.');
  // Phân trang Danh sách hàng hóa nhận
  const pageBtn = event.target.closest('[data-goods-page]');
  if (pageBtn && !pageBtn.disabled) renderViewGoods(Number(pageBtn.dataset.goodsPage));
});
document.addEventListener('keydown', (event) => {
  if (pfView.hidden || dialog.open) return;
  if (event.key === 'Escape') { closeProgramView(); return; }
  if (event.key !== 'Tab') return;
  const items = [...pfViewPanel.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);
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
// Tìm theo mã hồ sơ, tên đơn vị · panel Bộ lọc: Thời gian tạo. Sắp xếp: bản nháp (chưa nộp) lên đầu, sau đó theo Ngày nộp giảm dần; phân trang 50 / 100 dòng.
// Thao tác (hiện thẳng trên dòng): Bản nháp → Xem, Sửa, Xóa · trạng thái khác → Xem.
// Chưa có dữ liệu minh họa cho 2 loại chi hội: danh sách trống.
const VOL_KINDS = {
  'thanh-lap-chi-hoi': { type: 'TC', label: 'Đăng ký thành lập chi hội', unit: 'chi hội', found: true },
  'gia-nhap-chi-hoi': { type: 'GH', label: 'Đăng ký gia nhập chi hội', unit: 'chi hội', found: false },
  'thanh-lap-doi': { type: 'DC', label: 'Đăng ký thành lập đội, câu lạc bộ tình nguyện viên', unit: 'đội, CLB', found: true },
  'gia-nhap-doi': { type: 'GC', label: 'Đăng ký gia nhập đội, câu lạc bộ tình nguyện viên', unit: 'đội, CLB', found: false },
};
const VOL_PLACE = { DC: 'Hội Chữ thập đỏ phường Thành Sen', GC: 'Chủ nhiệm, phó chủ nhiệm' };
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
].map(([code, type, name, status, created, submitted], i) => ({ id: code || `NHAP-${i + 1}`, code, type, name, status, created, submitted }))
  .sort((a, b) => (Boolean(a.submitted) - Boolean(b.submitted)) || (b.submitted || b.created).localeCompare(a.submitted || a.created));
const findVolReg = (id) => VOL_REGS.find((r) => r.id === id);
const volf = {
  kind: 'thanh-lap-doi',
  status: '',
  search: document.querySelector('#vol-search'),
  time: document.querySelector('#vol-time'),
};
const volFilters = [volf.time];
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
  // Thêm mới: thành lập đội, CLB mở biểu mẫu đăng ký; các loại khác chưa có biểu mẫu → hộp thông báo xem trước
  const add = document.querySelector('#vol-add');
  const hasForm = kind === 'thanh-lap-doi';
  add.toggleAttribute('data-open-team', hasForm);
  add.setAttribute('aria-haspopup', hasForm ? 'dialog' : 'false');
  if (hasForm) delete add.dataset.panel; else add.dataset.panel = k.label;
};
const updateVolCounts = () => Object.entries(VOL_KINDS).forEach(([kind, k]) => {
  document.querySelector(`[data-count="${kind}"]`).textContent = VOL_REGS.filter((r) => r.type === k.type).length;
});

const volRow = (r, index) => {
  // Bản nháp: Xem · Sửa · Xóa hiện thẳng trên dòng; trạng thái khác: chỉ Xem
  const name = escapeHtml(r.name);
  const actions = r.status === 'draft'
    ? `<button class="pf-icon-btn" type="button" data-panel="Xem bản nháp ${name}" aria-label="Xem bản nháp ${name}">${icon('eye')}</button><button class="pf-icon-btn" type="button" data-panel="Sửa bản nháp ${name}" aria-label="Sửa bản nháp ${name}">${icon('pencil')}</button><button class="pf-icon-btn is-danger" type="button" data-vol-delete="${r.id}" aria-label="Xóa bản nháp ${name}">${icon('trash')}</button>`
    : `<button class="pf-icon-btn" type="button" data-panel="Xem hồ sơ ${r.code}" aria-label="Xem hồ sơ ${r.code}">${icon('eye')}</button>`;
  return `<tr>
    ${rowIndex(index)}
    <td>
      <div class="pf-cell-stack">
        <span class="pf-cell-title"><span class="pf-clamp-1" data-tip>${escapeHtml(r.name)}</span></span>
        <span class="pf-cell-line is-muted">Mã: ${r.code || 'Chưa có mã'}</span>
      </div>
    </td>
    <td><span class="pf-clamp-2" data-tip>${escapeHtml(VOL_PLACE[r.type] || '')}</span></td>
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
  perPage: 50,
  perPageOptions: [50, 100],
});
// Thời gian tạo: 7 / 30 ngày qua hoặc năm hiện tại
const createdWithin = (iso, value) => {
  if (!value) return true;
  const created = new Date(`${iso}T00:00:00`);
  const now = new Date();
  if (value === 'year') return created.getFullYear() === now.getFullYear();
  return (now - created) / 86400000 <= Number(value);
};
const applyVolFilter = () => {
  const query = fold(volf.search.value.trim());
  volTable.setFilter((r) => (!query || fold(`${r.code || ''} ${r.name}`).includes(query))
    && r.type === VOL_KINDS[volf.kind].type
    && (!volf.status || r.status === volf.status)
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
});
// Xóa nháp: hỏi xác nhận bằng hộp xác nhận dùng chung (window.confirmAction), đồng ý mới xóa thật (bản nháp chưa có mã)
const deleteVolDraft = async (r) => {
  const yes = await window.confirmAction({ title: 'Xóa bản ghi', text: 'Bạn có chắc chắn muốn xóa bản ghi này không?', ok: 'Xóa' });
  if (!yes) return;
  VOL_REGS.splice(VOL_REGS.indexOf(r), 1);
  applyVolFilter();
  renderTabs('tinh-nguyen-vien', volf.status);
  updateVolCounts();
  showToast('Đã xóa bản nháp');
};

// ==================== SECTION: CỘT TRÁI — số liệu tính từ dữ liệu ====================
{
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
  updateVolCounts();
}

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
  // Chương trình không có tab “Tất cả”: mặc định mở tab trạng thái đầu tiên (Đang hoạt động)
  'chuong-trinh': { map: PROGRAM_STATUS, rows: PROGRAMS },
  'nguoi-yeu-the': { map: VULNERABLE_STATUS, rows: VULNERABLE, all: 'Tất cả hồ sơ' },
  // Đăng ký hồ sơ không có tab “Tất cả”: mặc định mở tab đầu tiên (Bản nháp); tab và số đếm theo loại hồ sơ đang mở
  'tinh-nguyen-vien': () => ({ map: volStatuses(), rows: volKindRows(), href: volf.kind }),
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
  const items = [...(source.all ? [['', source.all, source.rows.length]] : []), ...Object.entries(source.map).map(([key, s]) => [key, s.label, source.rows.filter((r) => r.status === key).length])].map(([key, label, n]) => [key, (key && source.map[key].tab) || label, n]);
  tabs.innerHTML = items.map(([key, label, n]) => {
    const href = key ? `#${base}/${source.map[key].slug}` : `#${base}`;
    return `<a href="${href}"${key === status ? ' aria-current="page"' : ''}>${label}<span class="pf-tab-count">${n}</span></a>`;
  }).join('');
  revealCurrentTab();
};

// ==================== SECTION: ĐIỀU HƯỚNG — menu trái & tab đồng bộ theo #hash ====================
// #chuong-trinh[/<trạng thái>|/xem/<mã> → modal xem chi tiết] · #nguoi-yeu-the[/<trạng thái>|/xem/<mã>] · #thong-tin
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
  let target = volKind ? 'tinh-nguyen-vien' : (screens.some((s) => s.dataset.screen === screen) ? screen : 'chuong-trinh');
  const isView = sub === 'xem' && code && target === 'chuong-trinh';
  const isDetail = sub === 'xem' && code && target === 'nguoi-yeu-the';
  if (isDetail) target = `${target}-xem`;
  screens.forEach((s) => { s.hidden = s.dataset.screen !== target; });
  const base = volKind || target.replace(/-xem$/, '');
  navLinks.forEach((link) => {
    const match = link.dataset.route === base;
    if (match && !isDetail) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    link.classList.toggle('is-parent', match && isDetail);
  });
  navGroup.classList.toggle('is-parent', Boolean(volKind));
  if (volKind) setNavGroup(true);
  if (target === 'chuong-trinh') {
    // Mở modal xem chi tiết: giữ tab đang xem; chỉ dựng bảng khi chưa có (giữ nút vừa bấm để trả focus khi đóng)
    if (!isView) ct.status = findStatus(PROGRAM_STATUS, sub) || 'active';
    else if (!ct.status) ct.status = (findProgram(decodeURIComponent(code)) || {}).status || 'active'; // mở thẳng link chi tiết: hiện tab theo trạng thái chương trình
    if (!isView || !document.querySelector('#ct-rows').children.length) applyProgramFilter();
  }
  if (target === 'nguoi-yeu-the') { vul.status = findStatus(VULNERABLE_STATUS, sub); applyVulnerableFilter(); }
  if (target === 'tinh-nguyen-vien') { setVolKind(volKind); volf.status = findStatus(volStatuses(), sub) || 'draft'; applyVolFilter(); }
  renderTabs(target, { 'chuong-trinh': ct.status, 'tinh-nguyen-vien': volf.status }[target] ?? vul.status);
  // Chờ script chạy xong (readVnd khai báo ở cuối file) rồi mới dựng modal
  if (isView) setTimeout(() => openProgramView(decodeURIComponent(code)), 0);
  else closeProgramView(false);
  if (target === 'nguoi-yeu-the-xem') renderVulnerableDetail(decodeURIComponent(code));
};
window.addEventListener('hashchange', () => {
  showRoute();
  if (window.location.hash.startsWith('#chuong-trinh/xem/')) return; // mở modal: không cuộn trang
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
    showToast('Ảnh vượt quá 2MB, vui lòng chọn ảnh nhỏ hơn.');
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
const reg = document.querySelector('#pf-reg');
const regPanel = reg.querySelector('.pf-reg-panel');
const regBody = reg.querySelector('.pf-reg-body');
const regForm = document.querySelector('#pf-reg-form');
const regStatus = document.querySelector('#pf-reg-status');
const regReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let regTrigger = null;
regPanel.tabIndex = -1;

// ---------- Mở / đóng: khóa cuộn trang, đưa focus vào drawer, trả focus về nút đã bấm ----------
const openRegister = (trigger) => {
  regTrigger = trigger;
  reg.hidden = false;
  document.documentElement.classList.add('pf-reg-lock');
  regBody.scrollTop = 0;
  requestAnimationFrame(() => {
    reg.classList.add('is-open');
    regPanel.focus({ preventScroll: true });
  });
};
const closeRegister = () => {
  reg.classList.remove('is-open');
  document.documentElement.classList.remove('pf-reg-lock');
  regMultis.forEach((m) => m.setOpen(false));
  setTimeout(() => { reg.hidden = true; }, regReduced() ? 0 : 300);
  if (regTrigger) regTrigger.focus();
};
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open-register]');
  if (trigger) openRegister(trigger);
});
reg.querySelectorAll('[data-close-register]').forEach((button) => button.addEventListener('click', closeRegister));

// ---------- Bàn phím: Esc đóng (ưu tiên đóng danh sách chọn), Tab xoay vòng trong drawer ----------
document.addEventListener('keydown', (event) => {
  if (reg.hidden || dialog.open) return;
  if (event.key === 'Escape') {
    const openMulti = regMultis.find((m) => m.isOpen());
    if (openMulti) openMulti.setOpen(false, true);
    else closeRegister();
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
regPriority.addEventListener('change', () => {
  reg.querySelector('.pf-reg-dot').className = `pf-reg-dot is-${regPriority.value}`;
});

// ---------- Chọn nhiều: thẻ đỏ có nút ×, danh sách tích chọn, điều khiển bằng phím mũi tên ----------
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
  return { root, setOpen, isOpen, selected, refit: fitChips, closePop };
};
const regMultis = [...reg.querySelectorAll('[data-multi]')].map(setupMulti);
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
regMoney.addEventListener('input', () => {
  const amount = Number(regMoney.value.replace(/\D/g, '').slice(0, 15));
  regMoney.value = amount ? amount.toLocaleString('en-US') : '';
  regWords.textContent = amount ? `Bằng chữ: ${readVnd(amount)}` : '';
});
['#rg-people', '#rg-volunteers'].forEach((id) => {
  const input = document.querySelector(id);
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 9); });
});

// ---------- Khoảng ngày: ngày kết thúc không trước ngày bắt đầu; tiếp nhận đóng góp không quá 60 ngày ----------
const dayDiff = (from, to) => (new Date(to) - new Date(from)) / 86400000;
const checkRange = (fromId, toId, maxDays) => {
  const from = document.querySelector(fromId).value;
  const to = document.querySelector(toId).value;
  const ok = Boolean(from && to) && dayDiff(from, to) >= 0 && (!maxDays || dayDiff(from, to) <= maxDays);
  document.querySelector(fromId).closest('.pf-field').classList.toggle('is-invalid', !ok);
  return ok;
};
const REG_RANGES = [['#rg-run-from', '#rg-run-to', 0], ['#rg-raise-from', '#rg-raise-to', 60]];
REG_RANGES.forEach(([from, to, max]) => [from, to].forEach((id) => document.querySelector(id).addEventListener('change', () => checkRange(from, to, max))));

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
// Dùng chung cho mọi drawer biểu mẫu (.pf-reg): Đăng ký chương trình, Đăng ký thành lập đội, CLB
document.querySelectorAll('.pf-reg').forEach((drawer) => {
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

// ---------- Tệp: khung tải lên dùng chung (bấm hoặc kéo thả) — ảnh banner 1 tệp ≤10MB, hồ sơ pháp lý nhiều tệp ≤25MB ----------
const regDocs = document.querySelector('#rg-docs');
const fileSize = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
const fileItem = (file, iconId) => `<li class="pf-file">
  <span class="pf-file-icon" aria-hidden="true">${icon(iconId)}</span>
  <div class="pf-file-text"><p class="pf-file-name"><span class="pf-clamp-1">${escapeHtml(file.name)}</span></p><p class="pf-file-meta">${fileSize(file.size)}<span aria-hidden="true">•</span><span class="is-ok">Đã tải</span></p></div>
  <button class="pf-icon-btn" type="button" data-remove-file aria-label="Xóa tệp ${escapeHtml(file.name)}">${icon('trash')}</button>
</li>`;
const setupDropzone = (input, { list, iconId, maxMb, exts, multiple }) => {
  const zone = input.closest('[data-dropzone]');
  const take = (files) => {
    const ok = files.filter((f) => exts.some((ext) => f.name.toLowerCase().endsWith(ext)) && f.size <= maxMb * 1048576);
    const skipped = files.length - ok.length;
    const chosen = multiple ? ok : ok.slice(0, 1);
    if (!multiple && chosen.length) list.innerHTML = '';
    chosen.forEach((file) => list.insertAdjacentHTML('beforeend', fileItem(file, iconId)));
    if (chosen.length) list.closest('.pf-field').classList.remove('is-invalid');
    if (skipped) showToast(`Bỏ qua ${skipped} tệp không đúng định dạng hoặc vượt quá ${maxMb} MB.`);
  };
  input.addEventListener('change', () => { take([...input.files]); input.value = ''; });
  ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => { event.preventDefault(); zone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, () => zone.classList.remove('is-dragover')));
  zone.addEventListener('drop', (event) => { event.preventDefault(); take([...event.dataTransfer.files]); });
};
setupDropzone(document.querySelector('#rg-banner'), { list: document.querySelector('#rg-banner-list'), iconId: 'image', maxMb: 10, exts: ['.jpg', '.jpeg', '.png'], multiple: false });
setupDropzone(document.querySelector('#rg-docs-input'), { list: regDocs, iconId: 'document', maxMb: 25, exts: ['.pdf', '.docx'], multiple: true });
reg.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-file]');
  if (!button) return;
  button.closest('.pf-file').remove();
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
    showToast(`Đã xóa ${count} dòng.`);
  });
  addRow(false);
};
reg.querySelectorAll('[data-reg-list]').forEach(setupRegList);

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

// ---------- Lưu bản nháp · Lưu và tạo chương trình (kiểm tra trường bắt buộc) ----------
const nowTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
reg.querySelector('[data-save-draft]').addEventListener('click', () => {
  regStatus.textContent = `Đã lưu bản nháp lúc ${nowTime()}`;
  showToast('Đã lưu bản nháp (bản xem trước — chưa gửi lên hệ thống).');
});
regForm.addEventListener('input', (event) => {
  const field = event.target.closest('.pf-field');
  if (field && event.target.value && event.target.value.trim()) field.classList.remove('is-invalid');
});
const validateRegister = () => {
  const invalid = new Set();
  regForm.querySelectorAll('input[required], select[required], textarea[required]').forEach((el) => {
    const value = el.value.trim();
    const bad = !value || (el.type === 'email' && !el.checkValidity()) || (el.type === 'tel' && !/^[0-9 +]{9,15}$/.test(value));
    if (bad) invalid.add(el.closest('.pf-field'));
  });
  regMultis.forEach((m) => { if (m.root.hasAttribute('data-required') && !m.selected().length) invalid.add(m.root.closest('.pf-field')); });
  REG_RANGES.forEach(([from, to, max]) => { if (!checkRange(from, to, max)) invalid.add(document.querySelector(from).closest('.pf-field')); });
  if (!regDocs.children.length) invalid.add(regDocs.closest('.pf-field'));
  regForm.querySelectorAll('.pf-field').forEach((field) => field.classList.toggle('is-invalid', invalid.has(field)));
  return [...regForm.querySelectorAll('.pf-field.is-invalid')];
};
regForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = validateRegister();
  if (invalid.length) {
    // Thẻ đang thu gọn mà có trường lỗi thì mở ngay (không hiệu ứng) để cuộn tới đúng vị trí
    invalid.forEach((field) => { const section = field.closest('.pf-reg-section.is-collapsible'); if (section) setRegSection(section, true, false); });
    invalid[0].scrollIntoView({ behavior: regReduced() ? 'auto' : 'smooth', block: 'center' });
    const focusable = invalid[0].querySelector('input:not([type="file"]), select, textarea, button');
    if (focusable) focusable.focus({ preventScroll: true });
    showToast(`Còn ${invalid.length} trường cần kiểm tra lại.`);
    return;
  }
  const name = document.querySelector('#rg-name').value.trim();
  closeRegister();
  showToast(`Đã tạo chương trình “${name}” (bản xem trước — chưa gửi lên hệ thống).`);
});

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
  else showToast(ACTS_RANGE_MSG);
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
    showToast(`Còn ${invalid.length} trường cần kiểm tra lại.`);
    return;
  }
  confirmAction({ title: 'Xác nhận nộp hồ sơ', text: 'Bạn có chắc chắn muốn nộp hồ sơ không?', ok: 'Nộp hồ sơ' }).then((yes) => {
    if (!yes) return;
    closeTeam();
    showToast('Nộp hồ sơ thành công (bản xem trước — chưa gửi lên hệ thống).');
  });
});

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
const pdfFileName = () => `Phieu-dang-ky-${pdfSlug(document.querySelector('#tm-name').value) || 'doi-clb'}`;

// ---------- Nội dung: trả về HTML trang dọc (phiếu) và trang ngang (danh sách thành viên) ----------
const teamPdfContent = () => {
  const val = (id) => document.querySelector(`#${id}`).value.trim();
  const fields = teamMultis[0].selected().map((o) => o.textContent).join(', ');
  const gender = (leaderRadios.find((r) => r.checked) || {}).value;
  const address = [val('tm-address'), val('tm-ward'), val('tm-province')].filter(Boolean).join(', ');
  // Phần 2: hoạt động tình nguyện (bỏ dòng chưa nhập nội dung)
  const acts = [...actsSection.querySelectorAll('tbody tr')].map((row) => ['Từ ngày', 'Đến ngày', 'Nội dung hoạt động'].map((k) => row.querySelector(`[data-label="${k}"]`).value.trim())).filter((a) => a[2]);
  const actsHtml = actsNone.checked || !acts.length
    ? `<p>${actsNone.checked ? 'Đội, câu lạc bộ chưa có hoạt động tình nguyện nào.' : '<span class="pf-pdf-blank is-long"></span>'}</p>`
    : `<table class="pf-pdf-table is-acts"><thead><tr><th style="width:52px">STT</th><th style="width:190px">Thời gian<br /><span class="pf-pdf-th-note">(từ ngày – đến ngày)</span></th><th>Nội dung hoạt động</th></tr></thead><tbody>${acts.map((a, i) => `<tr>${pdfCell(String(i + 1), true)}${pdfCell([a[0], a[1]].filter(Boolean).join(' – '), true)}${pdfCell(a[2])}</tr>`).join('')}</tbody></table>`;
  // Danh sách thành viên: nhóm I. Ban chủ nhiệm · II. Thành viên, STT đánh lại trong nhóm
  const members = memberEditor.data();
  const group = (no, title, list) => (list.length ? `<tr class="is-group"><td class="is-center"><b>${no}</b></td><td colspan="12"><b>${title}</b></td></tr>` + list.map((m, i) => `<tr>${pdfCell(String(i + 1), true)}${pdfCell(m.name)}${pdfCell(m.role)}${pdfCell(m.gender, true)}${pdfCell(m.year, true)}${pdfCell(m.identity, true)}${pdfCell(m.phone, true)}${pdfCell(m.blood, true)}${pdfCell(m.address)}${pdfCell(m.education, true)}${pdfCell(m.qualification, true)}${pdfCell(m.activity)}${pdfCell(m.skills.join(', '))}</tr>`).join('') : '');
  const memberRows = group('I', 'BAN CHỦ NHIỆM', members.filter((m) => m.role !== 'Thành viên')) + group('II', 'THÀNH VIÊN', members.filter((m) => m.role === 'Thành viên'));
  const [d, mo, y] = val('tm-sign-date').split('/');
  const place = val('tm-sign-place');
  const portrait = `
    <div class="pf-pdf-motto"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><b class="is-line">Độc lập - Tự do - Hạnh phúc</b></div>
    <h1 class="pf-pdf-title">ĐƠN ĐĂNG KÝ THÀNH LẬP ĐỘI, CÂU LẠC BỘ<br />TÌNH NGUYỆN VIÊN CHỮ THẬP ĐỎ</h1>
    <p class="pf-pdf-to">Kính gửi: ${pdfVal(val('tm-unit'))}</p>
    <h2>1. Thông tin đội, câu lạc bộ</h2>
    <table class="pf-pdf-table is-info"><tbody>
      ${pdfInfo('Tên đội, câu lạc bộ', val('tm-name'))}
      ${pdfInfo('Số lượng thành viên (đính kèm danh sách thành viên)', `${members.length} thành viên`)}
      ${pdfInfo('Chủ nhiệm đội, câu lạc bộ', val('tm-leader-name'))}
      ${pdfInfo('- Giới tính', gender)}
      ${pdfInfo('- Ngày, tháng, năm sinh', val('tm-leader-dob'))}
      ${pdfInfo('- Số định danh cá nhân', val('tm-leader-id'))}
      ${pdfInfo('Địa chỉ sinh hoạt đội, câu lạc bộ', address)}
      ${pdfInfo('Điện thoại liên lạc', val('tm-phone'))}
      ${pdfInfo('Địa chỉ email', val('tm-email'))}
      ${pdfInfo('Cơ quan hiện đội, câu lạc bộ đang trực thuộc (nếu có; ghi rõ số QĐ thành lập đội, câu lạc bộ)', [val('tm-parent'), val('tm-decision') && `QĐ thành lập số ${val('tm-decision')}`].filter(Boolean).join('; '))}
      ${pdfInfo('Đơn vị quản lý (Hội Chữ thập đỏ)', val('tm-unit'))}
      ${pdfInfo('Chi hội trực thuộc', val('tm-branch'))}
      ${pdfInfo('Lĩnh vực hoạt động của đội, câu lạc bộ', fields)}
    </tbody></table>
    <h2>2. Hoạt động tình nguyện</h2>
    ${actsHtml}
    <h2>3. Danh sách các thành viên đội, câu lạc bộ</h2>
    <p>Gồm ${members.length} người (danh sách kèm theo).</p>
    <h2>4. Cam kết</h2>
    <p class="pf-pdf-text">Sau khi nghiên cứu Điều lệ Hội Chữ thập đỏ Việt Nam và Quy chế tổ chức và hoạt động của tình nguyện viên Chữ thập đỏ, chúng tôi tự nguyện đăng ký thành lập đội, câu lạc bộ nêu trên, chấp hành Điều lệ, Quy chế và sẵn sàng nhận nhiệm vụ do Hội giao.</p>
    <p class="pf-pdf-check">${pdfBox(document.querySelector('#tm-agree').checked)}Tôi đã đọc Điều lệ, Quy chế và đồng ý với cam kết trên.</p>
    <p class="pf-pdf-check">${pdfBox(document.querySelector('#tm-privacy').checked)}Tôi đồng ý để Hội xử lý dữ liệu cá nhân trong hồ sơ cho mục đích xét duyệt và quản lý tình nguyện viên.</p>
    <div class="pf-pdf-sign">
      <div>
        <p class="pf-pdf-date">${place ? escapeHtml(place) : '<span class="pf-pdf-blank is-short"></span>'}, ngày ${d || '……'} tháng ${mo || '……'} năm ${y || '……'}</p>
        <p><b>NGƯỜI ĐĂNG KÝ</b></p>
        <p class="pf-pdf-note">(TM đội, câu lạc bộ — ký, ghi rõ họ tên)</p>
        <p class="pf-pdf-signer"><b>${pdfVal(val('tm-signer'))}</b></p>
      </div>
    </div>`;
  const landscape = `
    <h1 class="pf-pdf-title is-list">DANH SÁCH CÁC THÀNH VIÊN ĐỘI, CÂU LẠC BỘ</h1>
    <p class="pf-pdf-sub">${val('tm-name') ? escapeHtml(val('tm-name')) : 'Đội, câu lạc bộ: <span class="pf-pdf-blank"></span>'} · ${members.length} người</p>
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
team.querySelector('[data-team-pdf]').addEventListener('click', () => {
  teamPdf.querySelector('.pf-pdf-name').textContent = `${pdfFileName()}.pdf`;
  teamPdf.showModal();
  pdfPages.style.zoom = 1;
  pdfPages.replaceChildren();
  const { portrait, landscape } = teamPdfContent();
  pdfFlow(portrait, false);
  pdfFlow(landscape, true);
  pdfPageList().forEach((page, i) => { page.querySelector('.pf-pdf-num').textContent = i + 1; page.setAttribute('aria-label', `Trang ${i + 1}`); });
  const widest = Math.max(...pdfPageList().map((p) => p.offsetWidth));
  const fit = ((pdfBody.clientWidth - 48) / widest) * 100;
  setPdfZoom([...PDF_ZOOMS].reverse().find((z) => z <= Math.min(100, fit)) || PDF_ZOOMS[0]);
  pdfBody.scrollTop = 0;
  syncPdfPage();
});
teamPdf.querySelector('[data-pdf-close]').addEventListener('click', () => teamPdf.close());

// ---------- In / Tải về PDF: iframe ẩn chỉ chứa các trang + styles.css; mỗi trang 1 tờ A4 (dọc / ngang) ----------
const printTeamPdf = () => {
  const frame = document.createElement('iframe');
  frame.className = 'pf-pdf-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.srcdoc = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${escapeHtml(pdfFileName())}</title><base href="${escapeHtml(location.href)}"><link rel="stylesheet" href="styles.css"><style>@page{size:A4 portrait;margin:0}@page landscape{size:A4 landscape;margin:0}html,body{margin:0;background:#fff}.pf-pdf-pages{display:block;width:auto;min-width:0}.pf-pdf-page{box-shadow:none;break-after:page}.pf-pdf-page:last-child{break-after:auto}</style></head><body><div class="pf-pdf-pages">${pdfPages.innerHTML}</div></body></html>`;
  frame.addEventListener('load', () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1000);
  });
  document.body.append(frame);
};
teamPdf.querySelector('[data-pdf-print]').addEventListener('click', printTeamPdf);
teamPdf.querySelector('[data-pdf-download]').addEventListener('click', printTeamPdf);
