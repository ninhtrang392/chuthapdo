// ==================== BẢN ĐỒ SỐ: nguồn dữ liệu minh họa ====================
// Không phải thông tin hoạt động, liên hệ hay vị trí thực của cá nhân/tổ chức.
// Tích hợp thật: thay DigitalMapSource.load(), getRecord(), canViewRecord(), openRecord().
// API phải lọc theo phiên đăng nhập; không gửi dữ liệu ngoài quyền về trình duyệt.
(() => {
  const M = window.DigitalMapModel;
  const locations = window.DigitalMapLocations;
  const centers = {
    1: [21.028, 105.834], 4: [22.666, 106.258], 8: [22.147, 105.834], 11: [21.386, 103.023],
    12: [22.386, 103.470], 14: [21.327, 103.918], 15: [22.05, 104.18], 19: [21.59, 105.848],
    20: [21.853, 106.762], 22: [20.95, 107.08], 24: [21.18, 106.07], 25: [21.32, 105.4],
    31: [20.844, 106.688], 33: [20.646, 106.052], 37: [20.25, 105.975], 38: [19.806, 105.785],
    40: [18.679, 105.681], 42: [18.355, 105.887], 44: [17.05, 106.8], 46: [16.463, 107.59],
    48: [16.054, 108.202], 51: [15.121, 108.804], 52: [13.78, 109.22], 56: [12.238, 109.196],
    66: [12.667, 108.038], 68: [11.94, 108.458], 75: [10.944, 106.824], 79: [10.776, 106.7],
    80: [11.311, 106.098], 82: [10.453, 105.632], 86: [10.254, 105.973], 91: [10.01, 105.08],
    92: [10.045, 105.747], 96: [9.176, 105.152],
  };
  const units = [{ id: 'national', name: 'Hội Chữ thập đỏ Việt Nam', parentId: null, province: '', ward: '' }];
  const records = [];
  // Số nhà, đường của trụ sở công an, cơ sở y tế (UC-BD 8.4, 8.5: cột Địa chỉ của popup danh sách); Hà Nội theo mockup
  const STREETS = ['Trần Hưng Đạo', 'Lê Lợi', 'Hùng Vương', 'Quang Trung', 'Lý Thường Kiệt', 'Trần Phú', 'Nguyễn Trãi', 'Nguyễn Huệ'];
  const streetOf = (layer, provinceId, p) => provinceId === '1' ? (layer === 'police' ? '87 Trần Hưng Đạo' : '40 Tràng Thi') : `${12 + p * 3 + (layer === 'police' ? 0 : 1)} ${STREETS[(p + (layer === 'police' ? 0 : 3)) % STREETS.length]}`;
  locations.forEach((province, p) => {
    const unitId = `province-${province.id}`;
    const unitName = `Hội Chữ thập đỏ ${province.name.replace(/^Tỉnh /, 'tỉnh ')}`;
    const ward = province.id === '1' ? province.wards.find((w) => w.id === '82') : province.wards[0];
    units.push({ id: unitId, parentId: 'national', name: unitName, province: province.id, ward: ward.id });
    ['offices', 'police', 'medical'].forEach((layer, i) => {
      const [lat, lng] = centers[province.id];
      const street = layer === 'offices' ? '' : streetOf(layer, province.id, p);
      records.push({ id: `${layer}-${province.id}`, layer, unitId, province: province.id, ward: ward.id,
        name: layer === 'offices' ? unitName : `${layer === 'police' ? 'Trụ sở công an' : 'Cơ sở y tế'} ${province.name}`,
        street, address: `${street ? `${street}, ` : ''}${ward.name}, ${province.name}`, lat: lat + i * .014, lng: lng + i * .016,
        phone: layer === 'offices' ? '0900 000 001' : '', leader: layer === 'offices' ? 'Nguyễn Văn Hùng – Chủ tịch' : '',
        canView: province.id === '1',
      });
    });
  });
  const areas = [
    { ward: '382', name: 'Xã Kim Anh', lat: 21.235, lng: 105.765 },
    { ward: '454', name: 'Xã Đông Anh', lat: 21.143, lng: 105.847 },
    { ward: '376', name: 'Xã Sóc Sơn', lat: 21.256, lng: 105.848 },
  ];
  areas.forEach((area, index) => {
    const unitId = `ward-${area.ward}`;
    const name = `Hội Chữ thập đỏ ${area.name.toLowerCase().replace('kim anh', 'Kim Anh').replace('đông anh', 'Đông Anh').replace('sóc sơn', 'Sóc Sơn')}`;
    units.push({ id: unitId, name, parentId: 'province-1', province: '1', ward: area.ward });
    records.push({ id: `office-${area.ward}`, layer: 'offices', name, unitId, province: '1', ward: area.ward,
      lat: area.lat, lng: area.lng, address: `${area.name}, Thành phố Hà Nội`, phone: '0900 000 002', leader: 'Nguyễn Văn Hùng – Chủ tịch', canView: true });
    ['Hiến máu', 'Sơ cấp cứu'].forEach((field, j) => {
      const clubId = `club-${area.ward}-${j}`;
      const clubName = `${j ? 'Đội Sơ cấp cứu' : 'Câu lạc bộ Hiến máu'} ${area.name.slice(3)}`;
      units.push({ id: clubId, name: clubName, parentId: unitId, province: '1', ward: area.ward, club: true });
      records.push({ id: clubId, layer: 'clubs', name: clubName, unitId, province: '1', ward: area.ward,
        lat: area.lat + .006, lng: area.lng + .006, address: `${area.name}, Thành phố Hà Nội`,
        phone: '0900 000 003', leader: 'Đỗ Văn Thành – Chủ nhiệm', fields: [field, M.fields[(index + j + 2) % M.fields.length]], canView: true });
    });
  });
  const names = ['Nguyễn Thanh Minh', 'Phạm Thu Hằng', 'Lê Hoàng Nam', 'Vũ Ngọc Anh', 'Trịnh Đức Long', 'Trần Minh Châu', 'Đặng Quỳnh Hoa', 'Bùi Quốc Huy', 'Đỗ Thị Lan', 'Hoàng Tuấn Anh', 'Phan Ngọc Hà', 'Ngô Minh Đức'];
  for (let i = 0; i < 65; i += 1) {
    const area = areas[i % areas.length];
    records.push({ id: `volunteer-${i}`, layer: 'volunteers', name: `${names[i % names.length]}${i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''}`,
      unitId: `club-${area.ward}-${i % 2}`, province: '1', ward: area.ward,
      lat: area.lat + (i < 6 ? .012 : (i % 8) * .003), lng: area.lng + (i < 6 ? .012 : (i % 7) * .004),
      address: `${area.name}, Thành phố Hà Nội`, phone: `0900 000 ${String(100 + i)}`,
      skills: [M.skills[i % M.skills.length], M.skills[(i + 1) % M.skills.length]],
      lastSeen: `2026-10-08T${String(9 + i % 8).padStart(2, '0')}:32:00+07:00`, locationShared: true, canView: i % 5 !== 4,
    });
  }
  // ---------- Lớp bổ sung (SRS Người yếu thế, chương trình và bảng cân đối nguồn lực) ----------
  const day = (offset) => new Date(Date.now() + offset * 86400e3).toISOString();
  const photo = (file) => `Emages/${encodeURIComponent('ảnh minh họa')}/${encodeURIComponent(file)}`;
  const PHOTOS_V = ['1358142_gen-h-235_1777566365.jpg', 'trao-qua-hoc-sinh.jpg', '1-1-3-9134.avif', 'z765570465791.jpg', '01 1.jpg', 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg'];
  const unitOf = (province, ward) => units.some((u) => u.id === `ward-${ward}`) ? `ward-${ward}` : `province-${province}`;
  // Điểm tập kết hàng hóa: dùng chung danh sách ĐTK của tab Nguồn lực (ban-do-so-nguon-luc-data.js)
  const R = window.DigitalMapResourceData;
  const STOCK = { water: ['Nước uống', 'thùng', '2027-03'], rice: ['Gạo', 'tấn', '2027-01'], blanket: ['Chăn', 'chiếc', null], medkit: ['Bộ y tế', 'bộ', '2026-12'], volunteer: null, truck: null, unit: null };
  (R?.depots || []).forEach((d, i) => {
    const program = R.programs.find((p) => p.id === d.programs[0]);
    const goods = d.goods || Object.entries(d.available).filter(([key]) => STOCK[key]).map(([key, qty], j) => ['Hiện vật', STOCK[key][0], STOCK[key][1], qty, Math.round(qty * (.3 + j * .1)), STOCK[key][2]]);
    records.push({ id: `goods-${d.id}`, layer: 'goods', name: d.name, unitId: d.id === 'd-tw' ? 'national' : unitOf(d.province, d.ward), province: d.province, ward: d.ward, lat: d.lat, lng: d.lng, address: d.address,
      status: d.status, program, unit: d.unit, manager: d.manager, phone: d.phone, from: d.period.from, to: d.period.to, photos: d.photos, photoCount: d.photoCount,
      goods: (goods.length ? goods : [['Tiền', 'Tiền mặt', 'đồng', 20000000 + i * 5000000, 10000000, null]]).map(([kind, item, unit, stock, given, expiry]) => ({ kind, item, unit, stock, given, expiry })) });
  });
  // Điểm tập kết cấp thôn (chỉ ở tab Tổng quan): nhiều điểm trong cùng xã để bấm số của xã ra danh sách Tên điểm · Thuộc chương trình
  const VILLAGE_DEPOTS = [
    ['454', 'Đông Anh', 'thôn Lực Canh', 21.1512, 105.8391, 0, 'Lê Thị Hoa', '0912 300 411'],
    ['454', 'Đông Anh', 'thôn Cổ Dương', 21.1368, 105.8556, 1, 'Trần Văn Khải', '0912 300 412'],
    ['454', 'Đông Anh', 'thôn Tiên Hội', 21.1466, 105.8618, 0, 'Phạm Thị Lụa', '0912 300 413'],
    ['376', 'Sóc Sơn', 'thôn Đông Xuân', 21.2650, 105.8390, 0, 'Ngô Văn Hải', '0904 220 131'],
    ['376', 'Sóc Sơn', 'thôn Thắng Trí', 21.2489, 105.8601, 1, 'Vũ Thị Mai', '0904 220 132'],
    ['382', 'Kim Anh', 'thôn Ninh Bắc', 21.2296, 105.7731, 0, 'Đỗ Văn Tùng', '0983 410 221'],
    ['382', 'Kim Anh', 'thôn Thanh Nhàn', 21.2381, 105.7652, 1, 'Hoàng Thị Yến', '0983 410 222'],
  ];
  const base = records.find((r) => r.id === 'goods-d-hn-da');
  if (base) VILLAGE_DEPOTS.forEach(([ward, xa, thon, lat, lng, p, manager, phone], i) => {
    records.push({ ...base, id: `goods-village-${i}`, name: `Điểm tập kết ${thon[0].toUpperCase()}${thon.slice(1)}, xã ${xa}`, unitId: unitOf('1', ward), ward, lat, lng,
      address: `Nhà văn hóa ${thon}, xã ${xa}, Thành phố Hà Nội`, program: R.programs[p], unit: `Hội Chữ thập đỏ xã ${xa}`, manager, phone, photoCount: 3 + (i % 3),
      goods: [{ kind: 'Hiện vật', item: 'Nước uống', unit: 'thùng', stock: 200 + i * 40, given: 80 + i * 10, expiry: '2027-03' }, { kind: 'Hiện vật', item: 'Chăn', unit: 'chiếc', stock: 60 + i * 15, given: 20, expiry: null }] });
  });
  // Người yếu thế: mã hồ sơ, nhóm đối tượng, mức độ cấp thiết; không lưu họ tên trên bản đồ
  const GROUPS = ['Người cao tuổi neo đơn', 'Người khuyết tật', 'Trẻ em có hoàn cảnh đặc biệt', 'Hộ nghèo', 'Trẻ em mồ côi', 'Phụ nữ đơn thân nuôi con nhỏ'];
  const NEEDS = [['Lương thực, thực phẩm', 'Chăm sóc tại nhà'], ['Xe lăn', 'Hỗ trợ sinh kế'], ['Học bổng', 'Đồ dùng học tập'], ['Sửa chữa nhà ở', 'Lương thực, thực phẩm'], ['Sữa, dinh dưỡng'], ['Hỗ trợ sinh kế']];
  const URGENCY = ['very', 'urgent', 'urgent', 'normal', 'very', 'normal'];
  const SPOTS = [
    { ward: '376', place: 'Số nhà 12, thôn Đông Xuân, xã Sóc Sơn', lat: 21.2622, lng: 105.8418, n: 4 },
    { ward: '376', place: 'Thôn Thắng Trí, xã Sóc Sơn', lat: 21.2489, lng: 105.8601, n: 2 },
    { ward: '454', place: 'Thôn Lực Canh, xã Đông Anh', lat: 21.1504, lng: 105.8372, n: 3 },
    { ward: '382', place: 'Thôn Ninh Bắc, xã Kim Anh', lat: 21.2296, lng: 105.7731, n: 3 },
  ];
  let seq = 12845;
  SPOTS.forEach((spot) => {
    const ward = locations.find((p) => p.id === '1').wards.find((w) => w.id === spot.ward);
    for (let k = 0; k < spot.n; k += 1) {
      const g = (seq + k) % GROUPS.length;
      const code = `NYT-HN-00${seq}`;
      records.push({ id: `vulnerable-${seq}`, layer: 'vulnerable', name: code, code, group: GROUPS[g], kind: g === 3 ? 'Hộ gia đình' : 'Cá nhân', urgency: URGENCY[g], date: day(-3 - (seq % 40)),
        needs: NEEDS[g], photos: [photo(PHOTOS_V[(seq) % PHOTOS_V.length]), photo(PHOTOS_V[(seq + 1) % PHOTOS_V.length]), photo(PHOTOS_V[(seq + 2) % PHOTOS_V.length])], photoCount: 3 + (seq % 3),
        unitId: unitOf('1', spot.ward), province: '1', ward: spot.ward, lat: spot.lat, lng: spot.lng, address: `${spot.place}, Thành phố Hà Nội`, wardName: ward?.name,
        // Hồ sơ NYT-HN-0012851 minh họa máy chủ từ chối quyền xem (TB02)
        canView: seq !== 12851 });
      seq += 6;
    }
  });
  // Địa bàn triển khai chương trình thiện nguyện: chỉ Đang triển khai / Đã hoàn thành được hiển thị
  const PROGRAMS = [
    { id: 'CT-2026-HN-0152', name: 'Áo ấm cho em vùng cao 2026', status: 'active', fields: ['Cứu trợ xã hội và trợ giúp nhân đạo', 'Khác'], from: day(-20), to: day(70), ward: '9574', lat: 21.1405, lng: 105.5046, slug: 'tiep-suc-den-truong', cover: 'trao-qua-hoc-sinh.jpg' },
    { id: 'CT-2026-HN-0148', name: 'Nhà nhân ái Sơn Tây', status: 'active', fields: ['Cứu trợ xã hội và trợ giúp nhân đạo'], from: day(-45), to: day(40), ward: '9574', lat: 21.1361, lng: 105.5108, slug: 'mai-am-nhan-ai', cover: '1-1-3-9134.avif' },
    { id: 'CT-2026-HN-0131', name: 'Hành trình đỏ 2026 – điểm Sơn Tây', status: 'done', fields: ['Hiến máu'], from: day(-120), to: day(-60), ward: '9574', lat: 21.1442, lng: 105.4981, slug: 'hien-mau-mua-he', cover: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg' },
    { id: 'CT-2026-HN-0155', name: 'Bữa cơm yêu thương Sơn Tây', status: 'pending', fields: ['Bếp ăn, Cơm cháo miễn phí'], from: day(10), to: day(90), ward: '9574', lat: 21.1388, lng: 105.5012, slug: '', cover: 'bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg' },
    { id: 'CT-2026-HN-0140', name: 'Sơ cấp cứu cộng đồng Sóc Sơn', status: 'active', fields: ['Sơ cấp cứu'], from: day(-30), to: day(30), ward: '376', lat: 21.2655, lng: 105.8297, slug: '', cover: 'Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg' },
    { id: 'CT-2026-HN-0119', name: 'Khám bệnh miễn phí người cao tuổi Đông Anh', status: 'done', fields: ['Khám chữa bệnh'], from: day(-150), to: day(-100), ward: '454', lat: 21.1369, lng: 105.8562, slug: 'kham-benh-nguoi-cao-tuoi', cover: '2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg' },
  ];
  PROGRAMS.forEach((p, i) => {
    const ward = locations.find((x) => x.id === '1').wards.find((w) => w.id === p.ward);
    records.push({ ...p, layer: 'programs', unitId: 'province-1', province: '1', address: `${ward.name}, Thành phố Hà Nội`, creatorType: 'Đơn vị Hội', owner: 'Hội Chữ thập đỏ Thành phố Hà Nội', phone: '0243 825 0032',
      url: p.slug ? `chuong-trinh.html?id=${p.slug}` : 'chuong-trinh.html', cover: photo(p.cover), photos: [photo(PHOTOS_V[i % PHOTOS_V.length]), photo(PHOTOS_V[(i + 2) % PHOTOS_V.length]), photo(PHOTOS_V[(i + 4) % PHOTOS_V.length])], photoCount: 4 + i });
  });
  // Lớp chưa có mockup popup (SRS 1.2 ngoài phạm vi): vài điểm mẫu, popup thông tin chung
  [
    ['fire', 'Đội Cảnh sát PCCC và CNCH khu vực Đông Anh', '454', 21.1388, 105.8501], ['fire', 'Đội Cảnh sát PCCC và CNCH khu vực Sóc Sơn', '376', 21.2533, 105.8455],
    ['shelters', 'Trường THCS Sóc Sơn – nơi sơ tán', '376', 21.2598, 105.8521], ['shelters', 'Nhà văn hóa xã Kim Anh', '382', 21.2389, 105.7702], ['shelters', 'UBND xã Đông Anh', '454', 21.1452, 105.8418],
    ['relief', 'Điểm cứu trợ thôn Đông Xuân', '376', 21.2611, 105.8389], ['kitchens', 'Bếp ăn 0 đồng Bệnh viện Đông Anh', '454', 21.1417, 105.8535],
    ['blood', 'Điểm hiến máu Trung tâm Hội nghị Đông Anh', '454', 21.1463, 105.8492], ['firstaid', 'Trạm sơ cấp cứu Hội CTĐ xã Kim Anh', '382', 21.2371, 105.7646], ['firstaid', 'Trạm sơ cấp cứu chợ Sóc Sơn', '376', 21.2546, 105.8513],
  ].forEach(([layer, name, wardId, lat, lng], i) => {
    const ward = locations.find((x) => x.id === '1').wards.find((w) => w.id === wardId);
    records.push({ id: `${layer}-hn-${i}`, layer, name, unitId: unitOf('1', wardId), province: '1', ward: wardId, lat, lng, address: `${ward.name}, Thành phố Hà Nội` });
  });
  // Các mẫu ngoài phạm vi / thiếu tọa độ kiểm tra BR-01, BR-03, BR-08.
  records.push({ ...records.find((r) => r.layer === 'volunteers'), id: 'outside-scope', name: 'Tình nguyện viên ngoài đơn vị', unitId: 'province-79', province: '79', lat: 10.78, lng: 106.7, canView: false });
  records.push({ ...records.find((r) => r.layer === 'volunteers'), id: 'not-shared', locationShared: false });
  records.push({ ...records[0], id: 'no-coordinates', lat: null, lng: null });
  window.DigitalMapSource = {
    async load() {
      return { records, units, locations, centers, demo: true,
        context: { unitId: 'province-1', national: false, name: 'Hội Chữ thập đỏ Thành phố Hà Nội', bounds: [[20.55, 105.28], [21.4, 106.03]], canViewVulnerable: true, expiryWarnMonths: 3 } };
    },
    async getRecord(id) { return records.find((record) => record.id === id); },
    canViewRecord(record) { return record.canView === true; },
  };
})();
// ==================== BẢN ĐỒ SỐ: tab Thời tiết — dữ liệu minh họa (tab Nguồn lực: ban-do-so-nguon-luc-data.js) ====================
// Tích hợp thật: thay window.DigitalMapExtra bằng dữ liệu của dịch vụ cảnh báo thời tiết (tab Thời tiết chưa có mockup trong SRS).
(() => {
  // Cảnh báo thời tiết: alert = cảnh báo nguy hiểm, còn lại = cần theo dõi
  const weather = [
    { lat: 22.25, lng: 103.75, text: 'Lũ quét', alert: true },
    { lat: 16.45, lng: 108.1, text: 'Mưa lớn', alert: true },
    { lat: 15.2, lng: 111.0, text: 'Áp thấp nhiệt đới', alert: true },
    { lat: 11.6, lng: 109.25, text: 'Nắng hạn', alert: false },
    { lat: 9.75, lng: 106.9, text: 'Triều cường', alert: false },
  ];
  window.DigitalMapExtra = { weather };
})();
