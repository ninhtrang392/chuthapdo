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
  locations.forEach((province) => {
    const unitId = `province-${province.id}`;
    const unitName = `Hội Chữ thập đỏ ${province.name.replace(/^Tỉnh /, 'tỉnh ')}`;
    const ward = province.id === '1' ? province.wards.find((w) => w.id === '82') : province.wards[0];
    units.push({ id: unitId, parentId: 'national', name: unitName, province: province.id, ward: ward.id });
    ['offices', 'police', 'medical'].forEach((layer, i) => {
      const [lat, lng] = centers[province.id];
      records.push({ id: `${layer}-${province.id}`, layer, unitId, province: province.id, ward: ward.id,
        name: layer === 'offices' ? unitName : `${layer === 'police' ? 'Trụ sở công an' : 'Cơ sở y tế'} ${province.name}`,
        address: `${ward.name}, ${province.name}`, lat: lat + i * .014, lng: lng + i * .016,
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
  // Các mẫu ngoài phạm vi / thiếu tọa độ kiểm tra BR-01, BR-03, BR-08.
  records.push({ ...records.find((r) => r.layer === 'volunteers'), id: 'outside-scope', name: 'Tình nguyện viên ngoài đơn vị', unitId: 'province-79', province: '79', lat: 10.78, lng: 106.7, canView: false });
  records.push({ ...records.find((r) => r.layer === 'volunteers'), id: 'not-shared', locationShared: false });
  records.push({ ...records[0], id: 'no-coordinates', lat: null, lng: null });
  window.DigitalMapSource = {
    async load() {
      return { records, units, locations, centers, demo: true,
        context: { unitId: 'province-1', national: false, name: 'Hội Chữ thập đỏ Thành phố Hà Nội', bounds: [[20.55, 105.28], [21.4, 106.03]] } };
    },
    async getRecord(id) { return records.find((record) => record.id === id); },
    canViewRecord(record) { return record.canView === true; },
  };
})();
// ==================== BẢN ĐỒ SỐ: tab Nguồn lực, Thời tiết — dữ liệu minh họa (lấy từ Bản đồ Nhân đạo Quốc gia bản cũ) ====================
// Điều phối nguồn lực: địa bàn cần hỗ trợ / nơi có nguồn lực, tô màu theo mức cân đối. Thời tiết: cảnh báo thiên tai.
// Tích hợp thật: thay window.DigitalMapExtra bằng dữ liệu của hệ thống điều phối và dịch vụ cảnh báo thời tiết.
(() => {
  const statuses = {
    critical: { label: 'Thiếu nghiêm trọng', color: '#e5232f', cover: 0.38 },
    short: { label: 'Thiếu', color: '#f39a2b', cover: 0.62 },
    near: { label: 'Gần cân bằng', color: '#f2c230', cover: 0.88 },
    enough: { label: 'Đủ', color: '#22a06b', cover: 1 },
    surplus: { label: 'Dư nguồn lực', color: '#2f6fe4', cover: 1.25 },
  };
  const resources = {
    water: { label: 'Nước uống', icon: 'drop', unit: 'thùng' },
    food: { label: 'Lương thực', icon: 'wheat', unit: 'suất' },
    medicine: { label: 'Thuốc men', icon: 'medkit', unit: 'lọ/gói' },
    volunteer: { label: 'Tình nguyện viên', icon: 'user', unit: 'người' },
    supplies: { label: 'Vật tư thiết yếu', icon: 'box', unit: 'bộ' },
    other: { label: 'Khác', icon: 'dots', unit: 'đơn vị' },
  };
  // [tỉnh, huyện/xã, vĩ độ, kinh độ, tình trạng, số người cần hỗ trợ, nguồn lực chính, loại ghim]
  const areas = [
    ['Lào Cai', 'Bát Xát', 22.53, 103.88, 'critical', 12500, 'water', 'need'],
    ['Hà Giang', 'Đồng Văn', 23.28, 105.36, 'critical', 8200, 'food', 'need'],
    ['Quảng Ninh', 'Hải Hà', 21.45, 107.75, 'short', 6780, 'supplies', 'need'],
    ['Nghệ An', 'Kỳ Sơn', 19.4, 104.15, 'near', 4320, 'food', 'program'],
    ['Quảng Bình', 'Lệ Thủy', 17.22, 106.8, 'enough', 1250, 'volunteer', 'resource'],
    ['Yên Bái', 'Mù Cang Chải', 21.85, 104.09, 'critical', 6900, 'medicine', 'need'],
    ['Cao Bằng', 'Bảo Lạc', 22.95, 105.67, 'short', 3900, 'food', 'resource'],
    ['Điện Biên', 'Mường Nhé', 22.18, 102.46, 'short', 4100, 'water', 'need'],
    ['Lai Châu', 'Sìn Hồ', 22.36, 103.24, 'near', 2800, 'supplies', 'resource'],
    ['Sơn La', 'Bắc Yên', 21.25, 104.42, 'short', 3500, 'food', 'resource'],
    ['Thanh Hóa', 'Mường Lát', 20.53, 104.6, 'near', 2600, 'medicine', 'resource'],
    ['Hà Tĩnh', 'Hương Khê', 18.18, 105.7, 'short', 4700, 'water', 'resource'],
    ['Quảng Trị', 'Hải Lăng', 16.7, 107.25, 'critical', 9800, 'water', 'need'],
    ['Huế', 'Quảng Điền', 16.58, 107.5, 'critical', 7600, 'food', 'need'],
    ['Quảng Nam', 'Nam Trà My', 15.15, 108.1, 'short', 5200, 'medicine', 'resource'],
    ['Quảng Ngãi', 'Sơn Tây', 14.97, 108.36, 'critical', 6400, 'supplies', 'need'],
    ['Kon Tum', 'Đắk Glei', 15.1, 107.73, 'near', 2100, 'volunteer', 'resource'],
    ['Gia Lai', 'Krông Pa', 13.22, 108.67, 'short', 3300, 'water', 'resource'],
    ['Đắk Lắk', 'Ea Súp', 13.18, 107.88, 'near', 2400, 'food', 'resource'],
    ['Phú Yên', 'Sông Hinh', 12.92, 108.95, 'enough', 1800, 'volunteer', 'resource'],
    ['Khánh Hòa', 'Khánh Sơn', 12.02, 108.9, 'enough', 1500, 'medicine', 'resource'],
    ['Ninh Thuận', 'Bác Ái', 11.88, 108.85, 'near', 2900, 'water', 'resource'],
    ['Lâm Đồng', 'Đam Rông', 12.05, 108.17, 'surplus', 900, 'volunteer', 'resource'],
    ['Bình Phước', 'Bù Gia Mập', 12.2, 106.95, 'enough', 1100, 'supplies', 'resource'],
    ['TP. Hồ Chí Minh', 'Cần Giờ', 10.41, 106.95, 'surplus', 1200, 'volunteer', 'resource'],
    ['Bến Tre', 'Thạnh Phú', 9.93, 106.55, 'short', 5600, 'water', 'need'],
    ['Trà Vinh', 'Duyên Hải', 9.62, 106.48, 'short', 3800, 'water', 'resource'],
    ['Sóc Trăng', 'Trần Đề', 9.5, 106.18, 'near', 2700, 'food', 'resource'],
    ['Cà Mau', 'Ngọc Hiển', 8.7, 105.0, 'critical', 7200, 'water', 'need'],
    ['An Giang', 'Tri Tôn', 10.42, 104.98, 'near', 2300, 'supplies', 'resource'],
    ['Hà Nội', 'Kho điều phối', 21.03, 105.85, 'surplus', 1000, 'other', 'resource'],
    ['Đà Nẵng', 'Hòa Vang', 16.03, 108.05, 'enough', 1400, 'supplies', 'program'],
  ].map(([province, district, lat, lng, status, people, res, kind], index) => {
    const cover = statuses[status].cover;
    const waterNeed = Math.round((people * 1.6) / 100) * 100;
    const foodNeed = Math.round(people / 100) * 100;
    return {
      id: `area-${index}`, province, district, name: `${province} - ${district}`, lat, lng, status, people, res, kind,
      needs: [
        { res: 'water', have: Math.round((waterNeed * cover) / 100) * 100, need: waterNeed },
        { res: 'food', have: Math.round((foodNeed * cover) / 100) * 100, need: foodNeed },
      ],
    };
  });
  // Cảnh báo thời tiết: alert = cảnh báo nguy hiểm, còn lại = cần theo dõi
  const weather = [
    { lat: 22.25, lng: 103.75, text: 'Lũ quét', alert: true },
    { lat: 16.45, lng: 108.1, text: 'Mưa lớn', alert: true },
    { lat: 15.2, lng: 111.0, text: 'Áp thấp nhiệt đới', alert: true },
    { lat: 11.6, lng: 109.25, text: 'Nắng hạn', alert: false },
    { lat: 9.75, lng: 106.9, text: 'Triều cường', alert: false },
  ];
  window.DigitalMapExtra = { statuses, resources, areas, weather };
})();
