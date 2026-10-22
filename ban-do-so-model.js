// ==================== BẢN ĐỒ SỐ: quy tắc tra cứu độc lập giao diện (UC-BD-01–08) ====================
// Dùng chung ở trình duyệt và kiểm thử Node. Phân quyền thật phải được thực thi ở API.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DigitalMapModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // unit: đơn vị đếm hiển thị cạnh số lượng của lớp (không dùng "bản ghi")
  const layers = {
    offices: { name: 'Trụ sở Hội', unit: 'đơn vị', color: '#C8102E', icon: 'building', columns: ['Tên trụ sở', 'Người đứng đầu'] },
    clubs: { name: 'Đội, CLB tình nguyện viên', unit: 'đội, CLB', color: '#0F7B6C', icon: 'people', columns: ['Tên đội, CLB', 'Lĩnh vực hoạt động'] },
    volunteers: { name: 'Tình nguyện viên', unit: 'người', color: '#2F5FB3', icon: 'user', columns: ['Họ và tên', 'Chuyên môn'] },
    police: { name: 'Trụ sở công an', unit: 'trụ sở', color: '#3D3A8C', icon: 'bd-shield', columns: ['Tên trụ sở', 'Địa chỉ'] },
    medical: { name: 'Cơ sở y tế', unit: 'cơ sở', color: '#D9730D', icon: 'plus', columns: ['Tên trụ sở', 'Địa chỉ'] },
    // Lớp bổ sung theo SRS Người yếu thế, chương trình và bảng cân đối nguồn lực (tắt sẵn khi mở trang)
    vulnerable: { name: 'Người yếu thế', unit: 'hồ sơ', color: '#7C4DDB', icon: 'people', columns: ['Mã hồ sơ', 'Nhóm đối tượng', 'Mức độ cấp thiết'] },
    fire: { name: 'Cơ sở PCCC', unit: 'cơ sở', color: '#E5232F', icon: 'alert', columns: ['Tên cơ sở', 'Địa chỉ'] },
    shelters: { name: 'Trường học, nhà văn hóa, nơi sơ tán, UBND', unit: 'địa điểm', color: '#5B6B7A', icon: 'building', columns: ['Tên địa điểm', 'Địa chỉ'] },
    goods: { name: 'Điểm tập kết hàng hóa', unit: 'điểm', color: '#8A5A2B', icon: 'box', columns: ['Tên điểm', 'Thuộc chương trình'] },
    relief: { name: 'Điểm cứu trợ', unit: 'điểm', color: '#C2410C', icon: 'hand-heart', columns: ['Tên điểm', 'Địa chỉ'] },
    kitchens: { name: 'Bếp ăn', unit: 'bếp', color: '#B7791F', icon: 'wheat', columns: ['Tên bếp ăn', 'Địa chỉ'] },
    blood: { name: 'Điểm hiến máu', unit: 'điểm', color: '#B91C2B', icon: 'drop', columns: ['Tên điểm', 'Địa chỉ'] },
    firstaid: { name: 'Trạm sơ cấp cứu', unit: 'trạm', color: '#0E7490', icon: 'medkit', columns: ['Tên trạm', 'Địa chỉ'] },
    programs: { name: 'Chương trình thiện nguyện', unit: 'chương trình', color: '#22A06B', icon: 'heart-solid', columns: ['Tên chương trình', 'Trạng thái'] },
  };
  // Lớp bật sẵn khi mở trang / Đặt lại: 5 lớp có dữ liệu theo UC-BD
  const defaults = ['offices', 'clubs', 'volunteers', 'police', 'medical'];
  const fields = ['Hiến máu', 'Sơ cấp cứu', 'Cứu hộ cứu nạn', 'Bếp ăn, Cơm cháo miễn phí', 'Cứu trợ xã hội và trợ giúp nhân đạo', 'Hiến mô, tạng', 'Công nghệ thông tin', 'Khám chữa bệnh', 'Khác'];
  const skills = ['Sơ cấp cứu', 'Sơ cứu tâm lý', 'Khám, chữa bệnh', 'Viết tin bài', 'Truyền thông số (TikTok, CapCut,…)', 'Xây dựng kênh truyền thông', 'Hướng dẫn kỹ thuật sinh kế theo nghề'];
  const order = Object.keys(layers);
  const fold = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const validPosition = (r) => Number.isFinite(r.lat) && Number.isFinite(r.lng) && Math.abs(r.lat) <= 90 && Math.abs(r.lng) <= 180;
  const descendant = (id, ancestor, units) => {
    const visited = new Set();
    while (id && !visited.has(id)) {
      if (id === ancestor) return true;
      visited.add(id);
      id = units.find((unit) => unit.id === id)?.parentId;
    }
    return false;
  };
  // Người yếu thế: chỉ hiện mã hồ sơ · nhóm đối tượng, không hiện họ tên (SRS 3.2 #1)
  const urgency = { very: { label: 'Rất cấp thiết', tone: 'red' }, urgent: { label: 'Cấp thiết', tone: 'orange' }, normal: { label: 'Bình thường', tone: 'green' } };
  const programStatus = { active: { label: 'Đang triển khai', tone: 'blue' }, done: { label: 'Đã hoàn thành', tone: 'green' } };
  const displayName = (record) => record.layer === 'vulnerable' ? `${record.code} · ${record.group}` : record.name;
  // Bộ lọc Thời gian (SRS 3.1 #3): Hiện tại = không lọc; 7 / 30 ngày qua; Tùy chọn từ ngày – đến ngày
  const TIME_RANGES = { '': 'Hiện tại', '7d': '7 ngày qua', '30d': '30 ngày qua', custom: 'Tùy chọn' };
  function timeWindow(state, now = Date.now()) {
    const day = 86400e3;
    if (state.time === '7d') return [now - 7 * day, now];
    if (state.time === '30d') return [now - 30 * day, now];
    if (state.time === 'custom') {
      const from = state.from ? Date.parse(`${state.from}T00:00:00+07:00`) : -Infinity;
      const to = state.to ? Date.parse(`${state.to}T23:59:59+07:00`) : Infinity;
      return [from, to];
    }
    return null;
  }
  // Đối tượng có mốc thời gian (ngày đánh giá, thời gian tập kết, thời gian triển khai) phải giao với khoảng đã chọn; lớp không có mốc thời gian luôn hiện
  function inTime(record, state, now) {
    const range = timeWindow(state, now);
    if (!range) return true;
    const start = Date.parse(record.from || record.date || '');
    const end = Date.parse(record.to || record.date || '');
    if (!Number.isFinite(start) && !Number.isFinite(end)) return true;
    return (Number.isFinite(start) ? start : -Infinity) <= range[1] && (Number.isFinite(end) ? end : Infinity) >= range[0];
  }
  const initialState = () => ({ layers: new Set(defaults), province: '', ward: '', unit: '', fields: [], skills: [], query: '', time: '', from: '', to: '', focusedId: null });
  function eligible(record, context, units) {
    if (!layers[record.layer] || !validPosition(record)) return false;
    if (record.layer === 'volunteers' && (!record.locationShared || !record.lastSeen)) return false;
    // Người không có quyền không thấy lớp Người yếu thế (NL04); quyền xem từng hồ sơ vẫn kiểm tra ở máy chủ khi mở chi tiết
    if (record.layer === 'vulnerable' && !context.canViewVulnerable) return false;
    // Chỉ hiển thị chương trình Đang triển khai, Đã hoàn thành (SRS 3.3 #1)
    if (record.layer === 'programs' && !programStatus[record.status]) return false;
    return !['clubs', 'volunteers'].includes(record.layer) || context.national || descendant(record.unitId, context.unitId, units);
  }
  // Lĩnh vực: Đội, CLB TNV và Địa bàn chương trình; Kỹ năng: Tình nguyện viên; Đơn vị: các lớp có đơn vị quản lý (SRS 3.1 #7)
  const FIELD_LAYERS = ['clubs', 'programs'];
  const SKILL_LAYERS = ['volunteers'];
  const UNIT_LAYERS = ['offices', 'clubs', 'volunteers', 'goods', 'programs'];
  function matches(record, state, units, now = Date.now()) {
    if (state.province && record.province !== state.province) return false;
    if (state.ward && record.ward !== state.ward) return false;
    if (state.unit && UNIT_LAYERS.includes(record.layer) && !descendant(record.unitId, state.unit, units)) return false;
    if (FIELD_LAYERS.includes(record.layer) && state.fields.length && !state.fields.some((value) => (record.fields || []).includes(value))) return false;
    if (SKILL_LAYERS.includes(record.layer) && state.skills.length && !state.skills.some((value) => (record.skills || []).includes(value))) return false;
    if (!inTime(record, state, now)) return false;
    const query = fold(state.query.trim());
    const text = record.layer === 'vulnerable' ? `${record.code} ${record.group} ${record.address}` : `${record.name} ${record.phone || ''} ${record.address}`;
    return query.length < 2 || fold(text).includes(query);
  }
  function select(records, state, context, units, now = Date.now()) {
    const filtered = records.filter((r) => eligible(r, context, units) && matches(r, state, units, now));
    const counts = Object.fromEntries(order.map((key) => [key, filtered.filter((r) => r.layer === key).length]));
    const rows = filtered.filter((r) => state.layers.has(r.layer)).sort((a, b) => order.indexOf(a.layer) - order.indexOf(b.layer) || displayName(a).localeCompare(displayName(b), 'vi'));
    return { counts, rows, total: rows.length };
  }
  // Tiêu đề popup danh sách theo vị trí (SRS 3.1 #11): cùng địa chỉ → địa chỉ; cùng xã → "xã, tỉnh"; khác xã → "Khu vực đã chọn"
  function pointTitle(rows, locations) {
    if (new Set(rows.map((r) => r.address)).size === 1) return rows[0].address;
    if (new Set(rows.map((r) => `${r.province}|${r.ward}`)).size === 1 && rows[0].ward) {
      const province = locations.find((p) => p.id === rows[0].province);
      const ward = province?.wards.find((w) => w.id === rows[0].ward);
      if (province && ward) return `${ward.name}, ${province.name}`;
    }
    return 'Khu vực đã chọn';
  }
  return { layers, fields, skills, order, defaults, urgency, programStatus, TIME_RANGES, FIELD_LAYERS, SKILL_LAYERS, UNIT_LAYERS, fold, validPosition, descendant, displayName, timeWindow, inTime, initialState, eligible, matches, select, pointTitle };
});
