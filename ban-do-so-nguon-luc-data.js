// ==================== BẢN ĐỒ SỐ: tab Nguồn lực — dữ liệu minh họa (SRS "Bản đồ số – Người yếu thế, chương trình và bảng cân đối nguồn lực") ====================
// Không phải số liệu thật. Tích hợp thật: thay window.DigitalMapResourceSource (load, saveOrder, updateOrder) bằng API điều phối.
// Điểm tập kết hàng hóa (ĐTK) ở đây dùng chung cho lớp "Điểm tập kết hàng hóa" của tab Tổng quan (ban-do-so-data.js).
// Mốc thời gian tính tương đối theo lúc mở trang để vị trí xe, hạn "Cần có mặt trước" luôn hợp lý.
(() => {
  const now = Date.now();
  const hours = (h) => new Date(now + h * 3600e3).toISOString();
  const atClock = (dayOffset, hh, mm = 0) => { const d = new Date(now + dayOffset * 86400e3); d.setHours(hh, mm, 0, 0); return d.toISOString(); };

  // ---------- Danh mục: chương trình, nhóm nguồn lực, nhóm nhu cầu ----------
  const programs = [
    { id: 'CT-2026-HN-0139', name: 'Lũ quét miền núi phía Bắc 10/2026', url: 'chuong-trinh.html?id=lu-lut-mien-trung' },
    { id: 'CT-2026-031', name: 'Ứng phó bão số 9 miền Trung', url: 'chuong-trinh.html?id=lu-lut-mien-trung' },
    { id: 'CT-2026-028', name: 'Nước sạch vùng hạn mặn Nam Bộ', url: 'chuong-trinh.html?id=nuoc-sach-han-man' },
  ];
  const [NORTH, CENTRAL, SOUTH] = programs.map((p) => p.id);
  const groups = {
    water: { label: 'Nước uống', unit: 'thùng', type: 'Vật tư – tài chính', vehicle: 'truck' },
    rice: { label: 'Gạo', unit: 'tấn', type: 'Vật tư – tài chính', vehicle: 'truck' },
    blanket: { label: 'Chăn', unit: 'chiếc', type: 'Vật tư – tài chính', vehicle: 'truck' },
    medkit: { label: 'Bộ y tế', unit: 'bộ', type: 'Vật tư – tài chính', vehicle: 'pickup' },
    unit: { label: 'Đơn vị hội', unit: 'đơn vị', type: 'Con người', vehicle: 'bus' },
    truck: { label: 'Xe vận chuyển', unit: 'xe', type: 'Vật tư – tài chính', vehicle: 'self' },
    volunteer: { label: 'Tình nguyện viên', unit: 'người', type: 'Con người', vehicle: 'bus' },
  };
  const needGroups = ['Thiếu nước', 'Thiếu lương thực', 'Thiếu chỗ ở tạm', 'Thiếu nhân lực', 'Thiếu chăn màn', 'Thiếu thuốc', 'Thiếu phương tiện'];
  // Phương tiện theo loại nguồn lực; count = số xe tính vào dòng Tổng
  const vehicles = {
    truck: [['1 xe tải 5 tấn', 1], ['2 xe tải 5 tấn', 2], ['3 xe tải 5 tấn', 3], ['4 xe tải 5 tấn', 4], ['1 xe tải 10 tấn', 1], ['2 xe tải 10 tấn', 2]],
    pickup: [['1 xe bán tải', 1], ['2 xe bán tải', 2], ['1 xe tải 5 tấn', 1]],
    bus: [['1 xe khách 16 chỗ', 1], ['2 xe khách 16 chỗ', 2], ['1 xe khách 29 chỗ', 1]],
    self: [['Tự hành (đoàn xe)', 0]],
  };

  // ---------- Điểm tập kết hàng hóa: nguồn (available = khả dụng có thể điều phối) và điểm nhận ----------
  const photo = (file) => `Emages/${encodeURIComponent('ảnh minh họa')}/${encodeURIComponent(file)}`;
  const PHOTOS = ['z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', 'trao-qua-hoc-sinh.jpg', '1358142_gen-h-235_1777566365.jpg', 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', '01 1.jpg', 'z765570465791.jpg'];
  const depots = [
    { id: 'd-tw', name: 'ĐTK TW Hội (Hà Nội)', province: '1', ward: '82', lat: 21.0245, lng: 105.8452, address: 'Số 82 Nguyễn Du, phường Cửa Nam, Thành phố Hà Nội', programs: [NORTH, CENTRAL], route: 'CT05 → QL2 → QL34', unit: 'Trung ương Hội Chữ thập đỏ Việt Nam', manager: 'Phạm Quốc Toàn', phone: '0243 822 4030', available: { water: 12000, rice: 40, blanket: 3000, medkit: 500, truck: 10, volunteer: 60 } },
    { id: 'd-tn', name: 'ĐTK Hội CTĐ tỉnh Thái Nguyên', province: '19', lat: 21.594, lng: 105.848, address: 'Phường Phan Đình Phùng, Tỉnh Thái Nguyên', programs: [NORTH], route: 'QL3 → QL279 → ĐT4C', unit: 'Hội Chữ thập đỏ tỉnh Thái Nguyên', manager: 'Dương Thị Thu', phone: '0208 385 5114', available: { water: 8000, rice: 25, blanket: 1500, volunteer: 40, truck: 6 } },
    { id: 'd-pt', name: 'ĐTK Hội CTĐ tỉnh Phú Thọ', province: '25', lat: 21.322, lng: 105.402, address: 'Phường Việt Trì, Tỉnh Phú Thọ', programs: [NORTH], route: 'CT05 → QL70 → QL4E', unit: 'Hội Chữ thập đỏ tỉnh Phú Thọ', manager: 'Lê Hồng Quân', phone: '0210 384 6115', available: { water: 6000, rice: 10, medkit: 120, truck: 4, volunteer: 25 } },
    { id: 'd-hn-da', name: 'Điểm tập kết Hội CTĐ xã Đông Anh', province: '1', ward: '454', lat: 21.1431, lng: 105.8474, address: 'Nhà văn hóa thôn Lộc Hà, xã Đông Anh, Thành phố Hà Nội', programs: [NORTH], route: 'QL3 → CT07 → QL2', unit: 'Hội Chữ thập đỏ xã Đông Anh', manager: 'Nguyễn Văn Bình', phone: '0912 556 208', available: { water: 1600, blanket: 400 },
      goods: [['Tiền', 'Tiền mặt', 'đồng', 85000000, 120000000, null], ['Hiện vật', 'Nước uống', 'thùng', 2400, 800, '2027-03'], ['Hiện vật', 'Mì tôm', 'thùng', 400, 350, '2026-12'], ['Hiện vật', 'Chăn', 'chiếc', 600, 200, null]] },
    { id: 'd-hn-ss', name: 'Điểm tập kết Hội CTĐ xã Sóc Sơn', province: '1', ward: '376', lat: 21.2571, lng: 105.8492, address: 'Trụ sở UBND xã Sóc Sơn, Thành phố Hà Nội', programs: [NORTH], route: 'QL3 → CT07', unit: 'Hội Chữ thập đỏ xã Sóc Sơn', manager: 'Đặng Thị Huyền', phone: '0904 118 362', available: { water: 900, rice: 4 }, status: 'paused' },
    { id: 'd-dn', name: 'ĐTK Hội CTĐ TP Đà Nẵng', province: '48', lat: 16.067, lng: 108.21, address: 'Phường Hải Châu, Thành phố Đà Nẵng', programs: [CENTRAL], route: 'QL1 → QL14B', unit: 'Hội Chữ thập đỏ thành phố Đà Nẵng', manager: 'Trần Thị Mỹ', phone: '0236 382 2140', available: { water: 5000, rice: 18, blanket: 2000, medkit: 200, truck: 5, volunteer: 30 } },
    { id: 'd-kh', name: 'ĐTK Hội CTĐ tỉnh Khánh Hòa', province: '56', lat: 12.245, lng: 109.19, address: 'Phường Nha Trang, Tỉnh Khánh Hòa', programs: [CENTRAL], route: 'QL1 → QL1A', unit: 'Hội Chữ thập đỏ tỉnh Khánh Hòa', manager: 'Võ Văn Lâm', phone: '0258 382 2361', available: { water: 4000, rice: 12, blanket: 2600, medkit: 260, truck: 4, volunteer: 35 } },
    { id: 'd-hcm', name: 'ĐTK Hội CTĐ TP Hồ Chí Minh', province: '79', lat: 10.776, lng: 106.7, address: 'Phường Bến Thành, Thành phố Hồ Chí Minh', programs: [SOUTH], route: 'QL1 → QL60 → QL57', unit: 'Hội Chữ thập đỏ Thành phố Hồ Chí Minh', manager: 'Huỳnh Thị Ngọc', phone: '0283 829 1395', available: { water: 9000, rice: 20, medkit: 300, truck: 8, volunteer: 80 } },
    // Điểm nhận tại các tỉnh đang thiếu
    { id: 'r-dong-van', name: 'ĐTK Hội CTĐ xã Đồng Văn', province: '8', ward: '721', lat: 23.2775, lng: 105.3614, address: 'Thị tứ Đồng Văn, xã Đồng Văn, Tỉnh Tuyên Quang', programs: [NORTH], route: 'QL4C', unit: 'Hội Chữ thập đỏ xã Đồng Văn', manager: 'Vàng Seo Sùng', phone: '0912 334 105', available: {} },
    { id: 'r-meo-vac', name: 'ĐTK Hội CTĐ xã Mèo Vạc', province: '8', ward: '769', lat: 23.1603, lng: 105.4092, address: 'Xã Mèo Vạc, Tỉnh Tuyên Quang', programs: [NORTH], route: 'QL4C', unit: 'Hội Chữ thập đỏ xã Mèo Vạc', manager: 'Giàng Thị Mai', phone: '0915 772 640', available: {} },
    { id: 'r-bat-xat', name: 'ĐTK Hội CTĐ xã Bát Xát', province: '15', lat: 22.535, lng: 103.885, address: 'Xã Bát Xát, Tỉnh Lào Cai', programs: [NORTH], route: 'QL4D', unit: 'Hội Chữ thập đỏ xã Bát Xát', manager: 'Lý Văn Tả', phone: '0913 220 418', available: {} },
    { id: 'r-mu-cang-chai', name: 'ĐTK Hội CTĐ xã Mù Cang Chải', province: '15', lat: 21.851, lng: 104.089, address: 'Xã Mù Cang Chải, Tỉnh Lào Cai', programs: [NORTH], route: 'QL32', unit: 'Hội Chữ thập đỏ xã Mù Cang Chải', manager: 'Sùng A Páo', phone: '0916 401 377', available: {} },
    { id: 'r-bao-lac', name: 'ĐTK Hội CTĐ xã Bảo Lạc', province: '4', lat: 22.95, lng: 105.67, address: 'Xã Bảo Lạc, Tỉnh Cao Bằng', programs: [NORTH], route: 'QL34', unit: 'Hội Chữ thập đỏ xã Bảo Lạc', manager: 'Nông Văn Hải', phone: '0918 662 019', available: {} },
    { id: 'r-le-thuy', name: 'ĐTK Hội CTĐ xã Lệ Thủy', province: '44', lat: 17.215, lng: 106.79, address: 'Xã Lệ Thủy, Tỉnh Quảng Trị', programs: [CENTRAL], route: 'QL1', unit: 'Hội Chữ thập đỏ xã Lệ Thủy', manager: 'Hoàng Thị Mai', phone: '0914 380 552', available: {} },
    { id: 'r-vinh-linh', name: 'ĐTK Hội CTĐ xã Vĩnh Linh', province: '44', lat: 17.03, lng: 106.99, address: 'Xã Vĩnh Linh, Tỉnh Quảng Trị', programs: [CENTRAL], route: 'QL1', unit: 'Hội Chữ thập đỏ xã Vĩnh Linh', manager: 'Lê Văn Hải', phone: '0919 507 213', available: {} },
    { id: 'r-a-luoi', name: 'ĐTK Hội CTĐ xã A Lưới', province: '46', lat: 16.27, lng: 107.23, address: 'Xã A Lưới 2, Thành phố Huế', programs: [CENTRAL], route: 'QL49', unit: 'Hội Chữ thập đỏ xã A Lưới', manager: 'Hồ Văn Tình', phone: '0905 214 688', available: {} },
    { id: 'r-huong-khe', name: 'ĐTK Hội CTĐ xã Hương Khê', province: '42', lat: 18.18, lng: 105.7, address: 'Xã Hương Khê, Tỉnh Hà Tĩnh', programs: [CENTRAL], route: 'QL15', unit: 'Hội Chữ thập đỏ xã Hương Khê', manager: 'Phan Thị Hạnh', phone: '0912 645 309', available: {} },
    { id: 'r-dai-loc', name: 'ĐTK Hội CTĐ xã Đại Lộc', province: '48', lat: 15.88, lng: 108.05, address: 'Xã Đại Lộc, Thành phố Đà Nẵng', programs: [CENTRAL], route: 'QL14B', unit: 'Hội Chữ thập đỏ xã Đại Lộc', manager: 'Nguyễn Thị Thu', phone: '0935 118 207', available: {} },
    { id: 'r-muong-nhe', name: 'ĐTK Hội CTĐ xã Mường Nhé', province: '11', lat: 22.18, lng: 102.46, address: 'Xã Mường Nhé, Tỉnh Điện Biên', programs: [NORTH], route: 'QL4H', unit: 'Hội Chữ thập đỏ xã Mường Nhé', manager: 'Lò Văn Pắng', phone: '0915 228 371', available: {} },
    { id: 'r-sin-ho', name: 'ĐTK Hội CTĐ xã Sìn Hồ', province: '12', lat: 22.36, lng: 103.24, address: 'Xã Sìn Hồ, Tỉnh Lai Châu', programs: [NORTH], route: 'ĐT128', unit: 'Hội Chữ thập đỏ xã Sìn Hồ', manager: 'Tẩn Văn Phin', phone: '0912 803 662', available: {} },
    { id: 'r-bac-yen', name: 'ĐTK Hội CTĐ xã Bắc Yên', province: '14', lat: 21.25, lng: 104.42, address: 'Xã Bắc Yên, Tỉnh Sơn La', programs: [NORTH], route: 'QL37', unit: 'Hội Chữ thập đỏ xã Bắc Yên', manager: 'Hà Thị Lả', phone: '0916 540 128', available: {} },
    { id: 'r-ky-son', name: 'ĐTK Hội CTĐ xã Kỳ Sơn', province: '40', lat: 19.4, lng: 104.15, address: 'Xã Mường Xén, Tỉnh Nghệ An', programs: [CENTRAL], route: 'QL7', unit: 'Hội Chữ thập đỏ xã Kỳ Sơn', manager: 'Lô Thị Hương', phone: '0919 661 245', available: {} },
    { id: 'r-thanh-phu', name: 'ĐTK Hội CTĐ xã Thạnh Phú', province: '86', lat: 9.93, lng: 106.55, address: 'Xã Thạnh Phú, Tỉnh Vĩnh Long', programs: [SOUTH], route: 'QL57', unit: 'Hội Chữ thập đỏ xã Thạnh Phú', manager: 'Nguyễn Thị Lan', phone: '0918 334 201', available: {} },
    { id: 'r-ngoc-hien', name: 'ĐTK Hội CTĐ xã Ngọc Hiển', province: '96', lat: 8.7, lng: 105.0, address: 'Xã Ngọc Hiển, Tỉnh Cà Mau', programs: [SOUTH], route: 'QL1', unit: 'Hội Chữ thập đỏ xã Ngọc Hiển', manager: 'Lâm Văn Út', phone: '0917 260 553', available: {} },
  ].map((d, i) => ({
    status: 'active',
    period: { from: atClock(-18 + (i % 5), 7), to: atClock(12 + (i % 7), 17) },
    photos: [PHOTOS[i % PHOTOS.length], PHOTOS[(i + 1) % PHOTOS.length], PHOTOS[(i + 2) % PHOTOS.length]].map(photo), photoCount: 3 + (i % 4),
    ...d,
  }));

  // ---------- Người áp tải: cán bộ, TNV của đơn vị quản lý ĐTK nguồn ----------
  const escorts = [
    ['Trần Văn Lực', '0919 452 380', 'd-tn'], ['Hoàng Văn Định', '0912 300 415', 'd-tn'], ['Nguyễn Thị Hảo', '0904 552 117', 'd-tw'], ['Phạm Quốc Toàn', '0243 822 4030', 'd-tw'],
    ['Lê Hồng Quân', '0210 384 6115', 'd-pt'], ['Đinh Văn Sơn', '0983 117 260', 'd-pt'], ['Nguyễn Văn Bình', '0912 556 208', 'd-hn-da'], ['Trần Thị Mỹ', '0236 382 2140', 'd-dn'],
    ['Lê Quang Vinh', '0905 667 120', 'd-dn'], ['Võ Văn Lâm', '0258 382 2361', 'd-kh'], ['Huỳnh Thị Ngọc', '0283 829 1395', 'd-hcm'], ['Trương Minh Tâm', '0908 773 412', 'd-hcm'],
  ].map(([name, phone, depot], i) => ({ id: `e-${i}`, name, phone, depot }));

  // ---------- Tỉnh: mức ưu tiên (điểm nóng) và bảng cân đối theo chương trình ----------
  // Điểm nóng: [mức, loại thiên tai HPS, ảnh hưởng, chưa hỗ trợ, xã nóng nhất, nhóm nhu cầu, tăng 24 giờ, xã thiếu nhân lực]
  const hotspots = {
    44: ['P1', 'Bão số 9', 98, 41200, 18600, 'Lệ Thủy, Vĩnh Linh, Hải Lăng', ['Thiếu nước', 'Thiếu lương thực', 'Thiếu chỗ ở tạm', 'Thiếu nhân lực'], 1400, 5],
    8: ['P1', 'Lũ quét, sạt lở', 85, 23600, 9400, 'Đồng Văn, Mèo Vạc', ['Thiếu nước', 'Thiếu chăn màn', 'Thiếu nhân lực', 'Thiếu phương tiện'], 900, 4],
    15: ['P2', 'Lũ quét', 71, 14800, 5100, 'Bát Xát, Mù Cang Chải', ['Thiếu nước', 'Thiếu thuốc'], 600, 3],
    46: ['P2', 'Bão số 9', 69, 22000, 6900, 'A Lưới, Quảng Điền', ['Thiếu lương thực', 'Thiếu chỗ ở tạm'], 800, 2],
    42: ['P2', 'Mưa lớn', 64, 9600, 3200, 'Hương Khê', ['Thiếu nước', 'Thiếu thuốc'], 300, 1],
    48: ['P2', 'Bão số 9', 61, 12300, 4000, 'Đại Lộc', ['Thiếu chăn màn', 'Thiếu lương thực'], 500, 1],
    4: ['P3', 'Sạt lở đất', 52, 6100, 1800, 'Bảo Lạc', ['Thiếu chăn màn'], 120, 0],
    11: ['P3', 'Lũ quét', 49, 5400, 1500, 'Mường Nhé', ['Thiếu nước'], 100, 0],
    51: ['P3', 'Mưa lớn', 47, 7200, 1300, 'Sơn Tây', ['Thiếu chỗ ở tạm'], 150, 0],
    40: ['P3', 'Mưa lớn', 45, 6800, 1200, 'Kỳ Sơn', ['Thiếu lương thực'], 90, 0],
    86: ['P3', 'Hạn mặn', 42, 8400, 2100, 'Thạnh Phú, Duyên Hải', ['Thiếu nước'], 60, 0],
    12: ['P4', 'Sạt lở đất', 31, 2800, 600, 'Sìn Hồ', ['Thiếu chăn màn'], 30, 0],
    14: ['P4', 'Rét đậm', 28, 3500, 500, 'Bắc Yên', ['Thiếu chăn màn'], 20, 0],
    96: ['P4', 'Triều cường', 26, 4100, 700, 'Ngọc Hiển', ['Thiếu nước'], 40, 0],
  };
  // Hệ số đáp ứng theo tỉnh (≈ Hiện có ÷ Nhu cầu); 1 = đủ đúng 100% mọi nhóm
  const cover = {
    1: [NORTH, 1.4], 4: [NORTH, .75], 8: [NORTH, null], 11: [NORTH, .8], 12: [NORTH, .9], 14: [NORTH, .92], 15: [NORTH, .45], 19: [NORTH, 1.3], 20: [NORTH, 1], 22: [NORTH, 1],
    24: [NORTH, 1], 25: [NORTH, 1.25], 31: [NORTH, 1], 33: [NORTH, 1], 37: [NORTH, 1], 38: [CENTRAL, 1], 40: [CENTRAL, .85], 42: [CENTRAL, .7], 44: [CENTRAL, .22], 46: [CENTRAL, .64],
    48: [CENTRAL, 1.1], 51: [CENTRAL, 1], 52: [CENTRAL, 1], 56: [CENTRAL, 1.35], 66: [CENTRAL, 1], 68: [CENTRAL, 1.2], 75: [SOUTH, 1.15], 79: [SOUTH, 1.5], 80: [SOUTH, 1], 82: [SOUTH, 1],
    86: [SOUTH, 1], 91: [SOUTH, 1], 92: [SOUTH, 1.1], 96: [SOUTH, 1],
  };
  const VARY = { water: 1.1, rice: 1.25, blanket: .7, medkit: 1.2, unit: .95, truck: .9, volunteer: .9 };
  const round = (value, step) => Math.max(step, Math.round(value / step) * step);
  const provinces = Object.fromEntries(Object.entries(cover).map(([id, [program, factor]]) => {
    const hot = hotspots[id];
    const people = hot ? hot[3] : 3000;
    const need = { water: round(people * .4, 100), rice: round(people / 1000, 1), blanket: round(people * .2, 100), medkit: round(people * .08, 10), unit: round(people / 100, 5), truck: round(people / 1500, 1), volunteer: round(people / 200, 10) };
    const balance = factor === null
      // Tuyên Quang: số liệu theo mockup 6 (5/7 nhóm thiếu)
      ? { water: [10000, 6000], rice: [20, 22], blanket: [5000, 1500], medkit: [2000, 2100], unit: [200, 100], truck: [15, 8], volunteer: [120, 10] }
      : Object.fromEntries(Object.entries(need).map(([key, value]) => [key, [value, Math.round(value * factor * (factor === 1 ? 1 : VARY[key]))]]));
    return [id, {
      program, balance,
      priority: hot?.[0] || null, hazard: hot?.[1] || '', hps: hot?.[2] || 0, affected: hot?.[3] || 0, unsupported: hot?.[4] || 0,
      hotWards: hot?.[5] || '', needs: hot?.[6] || [], new24h: hot?.[7] || 0, shortWards: hot?.[8] || 0,
      updatedAt: hours(-1.2),
    }];
  }));

  // ---------- Thiên tai – rủi ro: đường đi bão, đường giao thông gián đoạn ----------
  const storm = {
    name: 'Bão số 9', level: 'cấp 12', landfall: atClock(1, 14),
    track: [[15.9, 114.2], [16.3, 112.6], [16.7, 111.1]], forecast: [[16.7, 111.1], [16.95, 109.4], [17.1, 107.9], [17.18, 106.9]],
  };
  const disruptions = [
    { id: 'rd-ql4c', name: 'QL4C gián đoạn – đá lở', path: [[22.98, 105.2], [23.07, 105.27], [23.16, 105.31]] },
    { id: 'rd-ql9', name: 'QL9 ngập sâu – chia cắt', path: [[16.74, 106.92], [16.69, 106.75], [16.64, 106.6]] },
  ];

  // ---------- Lệnh điều phối mẫu ----------
  const me = { id: 'u-quan', name: 'Lê Minh Quân', title: 'Cán bộ chuyên trách', unit: 'Trung ương Hội Chữ thập đỏ Việt Nam' };
  const dinh = { id: 'u-dinh', name: 'Hoàng Văn Định', unit: 'Hội Chữ thập đỏ tỉnh Thái Nguyên' };
  const huong = { id: 'u-huong', name: 'Nguyễn Thu Hương', unit: 'Trung ương Hội Chữ thập đỏ Việt Nam' };
  const tam = { id: 'u-tam', name: 'Trương Minh Tâm', unit: 'Hội Chữ thập đỏ Thành phố Hồ Chí Minh' };
  const order = (o) => ({ incident: null, note: '', notify: true, priority: 'P2', history: [], plates: [], ...o });
  const orders = [
    order({ id: 'LĐP-2026-0152', program: NORTH, group: 'water', qty: 3000, source: 'd-tn', target: 'r-dong-van', status: 'pending', priority: 'P1', due: atClock(1, 20), vehicle: '3 xe tải 5 tấn', vehicleCount: 3, escort: 'e-0', creator: dinh, createdAt: hours(-2.6),
      via: [[22.15, 105.83], [22.82, 105.62], [23.12, 105.52]], routeText: 'QL3 → QL279 → QL4C (tránh đoạn QL4C gián đoạn)', note: 'Ưu tiên giao trước cho 3 thôn bị cô lập.' }),
    order({ id: 'LĐP-2026-0151', program: NORTH, group: 'water', qty: 1000, source: 'd-tw', target: 'r-meo-vac', status: 'pending', priority: 'P1', due: atClock(2, 12), vehicle: '1 xe tải 5 tấn', vehicleCount: 1, escort: 'e-2', creator: me, createdAt: hours(-1.4), via: [[21.6, 105.5], [22.4, 105.2]] }),
    order({ id: 'LĐP-2026-0149', program: NORTH, group: 'water', qty: 3000, source: 'd-pt', target: 'r-bat-xat', status: 'shipping', priority: 'P2', due: atClock(0, 23), vehicle: '3 xe tải 5 tấn', vehicleCount: 3, escort: 'e-0', creator: huong, createdAt: hours(-26),
      plates: ['19C-204.18', '19C-211.52', '19C-198.07'], via: [[21.72, 104.9], [22.2, 104.3]], routeText: 'CT05 → QL70 → QL4D',
      history: [['approved', hours(-24), 'Lê Minh Quân · TW Hội'], ['preparing', hours(-8), 'Hội CTĐ tỉnh Phú Thọ'], ['shipping', hours(-2.5), 'Trần Văn Lực · áp tải']] }),
    order({ id: 'LĐP-2026-0148', program: NORTH, group: 'volunteer', qty: 20, source: 'd-tn', target: 'r-dong-van', status: 'approved', priority: 'P1', due: atClock(1, 18), vehicle: '2 xe khách 16 chỗ', vehicleCount: 2, escort: 'e-1', creator: dinh, createdAt: hours(-20),
      plates: ['20B-015.62', '20B-018.30'], via: [[22.15, 105.83], [22.82, 105.62], [23.12, 105.52]], departAt: atClock(0, 13), history: [['approved', hours(-6), 'Lê Minh Quân · TW Hội']] }),
    order({ id: 'LĐP-2026-0147', program: CENTRAL, group: 'water', qty: 6000, source: 'd-tw', target: 'r-le-thuy', status: 'shipping', priority: 'P1', due: atClock(1, 10), vehicle: '4 xe tải 5 tấn', vehicleCount: 4, escort: 'e-2', creator: huong, createdAt: hours(-30),
      plates: ['29C-511.07', '29C-498.21', '29C-503.66', '29C-517.40'], via: [[19.8, 105.78], [18.68, 105.68], [17.48, 106.6]], routeText: 'CT01 → QL1 → QL1A',
      history: [['approved', hours(-28), 'Lê Minh Quân · TW Hội'], ['preparing', hours(-14), 'Trung ương Hội'], ['shipping', hours(-5), 'Nguyễn Thị Hảo · áp tải']] }),
    order({ id: 'LĐP-2026-0146', program: CENTRAL, group: 'rice', qty: 8, source: 'd-dn', target: 'r-a-luoi', status: 'preparing', priority: 'P2', due: atClock(1, 16), vehicle: '2 xe tải 5 tấn', vehicleCount: 2, escort: 'e-8', creator: huong, createdAt: hours(-12),
      plates: ['43C-220.15', '43C-231.08'], via: [[16.2, 107.95]], history: [['approved', hours(-9), 'Lê Minh Quân · TW Hội'], ['preparing', hours(-3), 'Hội CTĐ TP Đà Nẵng']] }),
    order({ id: 'LĐP-2026-0144', program: CENTRAL, group: 'blanket', qty: 1200, source: 'd-kh', target: 'r-dai-loc', status: 'pending', priority: 'P2', due: atClock(2, 9), vehicle: '1 xe tải 5 tấn', vehicleCount: 1, escort: 'e-9', creator: tam, createdAt: hours(-4), via: [[13.8, 109.2], [15.1, 108.8]] }),
    order({ id: 'LĐP-2026-0143', program: NORTH, group: 'blanket', qty: 800, source: 'd-tn', target: 'r-bao-lac', status: 'shipping', priority: 'P3', due: atClock(0, 21), vehicle: '1 xe tải 5 tấn', vehicleCount: 1, escort: 'e-1', creator: dinh, createdAt: hours(-28),
      plates: ['20C-117.44'], via: [[22.15, 106.0], [22.66, 105.95]], history: [['approved', hours(-26), 'Lê Minh Quân · TW Hội'], ['preparing', hours(-10), 'Hội CTĐ tỉnh Thái Nguyên'], ['shipping', hours(-3.5), 'Hoàng Văn Định · áp tải']],
      incident: { type: 'Tắc đường', text: 'Sạt lở nhẹ tại Km 42 QL34, xe chờ thông tuyến.', at: hours(-1), by: 'Hoàng Văn Định' } }),
    order({ id: 'LĐP-2026-0140', program: NORTH, group: 'water', qty: 2000, source: 'd-tw', target: 'r-mu-cang-chai', status: 'delivered', priority: 'P2', due: hours(-20), vehicle: '2 xe tải 5 tấn', vehicleCount: 2, escort: 'e-3', creator: huong, createdAt: hours(-60),
      plates: ['29C-488.12', '29C-490.37'], via: [[21.3, 105.2], [21.6, 104.6]], history: [['approved', hours(-58), 'Lê Minh Quân · TW Hội'], ['preparing', hours(-50), 'Trung ương Hội'], ['shipping', hours(-40), 'Phạm Quốc Toàn · áp tải'], ['arrived', hours(-28), 'Phạm Quốc Toàn · áp tải'], ['delivered', hours(-26), 'Hội CTĐ xã Mù Cang Chải']] }),
    order({ id: 'LĐP-2026-0138', program: SOUTH, group: 'water', qty: 1500, source: 'd-hcm', target: 'r-thanh-phu', status: 'distributed', priority: 'P3', due: hours(-70), vehicle: '2 xe tải 5 tấn', vehicleCount: 2, escort: 'e-11', creator: tam, createdAt: hours(-120),
      plates: ['51C-602.18', '51C-611.94'], via: [[10.36, 106.6]], households: 640,
      history: [['approved', hours(-118), 'Lê Minh Quân · TW Hội'], ['preparing', hours(-110), 'Hội CTĐ TP Hồ Chí Minh'], ['shipping', hours(-100), 'Trương Minh Tâm · áp tải'], ['arrived', hours(-96), 'Trương Minh Tâm · áp tải'], ['delivered', hours(-95), 'Hội CTĐ xã Thạnh Phú'], ['distributed', hours(-72), 'Hội CTĐ xã Thạnh Phú · 640 hộ']] }),
    order({ id: 'LĐP-2026-0136', program: CENTRAL, group: 'medkit', qty: 300, source: 'd-kh', target: 'r-le-thuy', status: 'rejected', priority: 'P1', due: hours(-30), vehicle: '1 xe bán tải', vehicleCount: 1, escort: 'e-9', creator: tam, createdAt: hours(-50), via: [[14.2, 109.1], [16.0, 108.1]],
      rejectReason: 'Đã có lệnh LĐP-2026-0135 cấp đủ bộ y tế cho xã Lệ Thủy.', history: [['rejected', hours(-46), 'Lê Minh Quân · TW Hội']] }),
    order({ id: 'LĐP-2026-0153', program: CENTRAL, group: 'water', qty: 500, source: 'd-tw', target: 'r-huong-khe', status: 'draft', priority: 'P2', due: atClock(3, 9), vehicle: '1 xe tải 5 tấn', vehicleCount: 1, escort: '', creator: me, createdAt: hours(-0.5), via: [[19.8, 105.78]] }),
  ];

  window.DigitalMapResourceData = { now, me, programs, groups, needGroups, vehicles, depots, escorts, provinces, storm, disruptions, orders, shapes: null };
  // Nguồn mẫu: lưu tạm trong bộ nhớ trang; hệ thống thật gọi API, API kiểm tra quyền, ghi nhật ký và gửi thông báo.
  window.DigitalMapResourceSource = {
    async load() { return window.DigitalMapResourceData; },
    async saveOrder(order) { const list = window.DigitalMapResourceData.orders; const i = list.findIndex((o) => o.id === order.id); if (i >= 0) list[i] = order; else list.unshift(order); return order; },
  };
})();
