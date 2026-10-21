// ==================== BẢN ĐỒ SỐ: quy tắc tra cứu độc lập giao diện (UC-BD-01–08) ====================
// Dùng chung ở trình duyệt và kiểm thử Node. Phân quyền thật phải được thực thi ở API.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DigitalMapModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const layers = {
    offices: { name: 'Trụ sở Hội', color: '#C8102E', icon: 'building', columns: ['Tên trụ sở', 'Người đứng đầu'] },
    clubs: { name: 'Đội, CLB tình nguyện viên', color: '#0F7B6C', icon: 'people', columns: ['Tên đội, CLB', 'Lĩnh vực hoạt động'] },
    volunteers: { name: 'Tình nguyện viên', color: '#2F5FB3', icon: 'user', columns: ['Họ và tên', 'Chuyên môn'] },
    police: { name: 'Trụ sở công an', color: '#3D3A8C', icon: 'bd-shield', columns: ['Tên trụ sở', 'Địa chỉ'] },
    medical: { name: 'Cơ sở y tế', color: '#D9730D', icon: 'plus', columns: ['Tên trụ sở', 'Địa chỉ'] },
    // Lớp đã có trên menu "Lớp bản đồ" nhưng nguồn chưa cung cấp dữ liệu (bật lên sẽ báo chưa có dữ liệu)
    vulnerable: { name: 'Người yếu thế', color: '#7C4DDB', icon: 'people', columns: ['Họ và tên', 'Địa chỉ'] },
    fire: { name: 'Cơ sở PCCC', color: '#E5232F', icon: 'alert', columns: ['Tên cơ sở', 'Địa chỉ'] },
    shelters: { name: 'Trường học, nhà văn hóa, nơi sơ tán, UBND', color: '#5B6B7A', icon: 'building', columns: ['Tên địa điểm', 'Địa chỉ'] },
    goods: { name: 'Điểm tập kết hàng hóa', color: '#8A5A2B', icon: 'box', columns: ['Tên điểm', 'Địa chỉ'] },
    relief: { name: 'Điểm cứu trợ', color: '#C2410C', icon: 'hand-heart', columns: ['Tên điểm', 'Địa chỉ'] },
    kitchens: { name: 'Bếp ăn', color: '#B7791F', icon: 'wheat', columns: ['Tên bếp ăn', 'Địa chỉ'] },
    blood: { name: 'Điểm hiến máu', color: '#B91C2B', icon: 'drop', columns: ['Tên điểm', 'Địa chỉ'] },
    programs: { name: 'Địa bàn triển khai chương trình thiện nguyện', color: '#22A06B', icon: 'heart-solid', columns: ['Tên chương trình', 'Địa bàn'] },
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
  const initialState = () => ({ layers: new Set(defaults), province: '', ward: '', unit: '', fields: [], skills: [], query: '', focusedId: null });
  function eligible(record, context, units) {
    if (!layers[record.layer] || !validPosition(record)) return false;
    if (record.layer === 'volunteers' && (!record.locationShared || !record.lastSeen)) return false;
    return !['clubs', 'volunteers'].includes(record.layer) || context.national || descendant(record.unitId, context.unitId, units);
  }
  function matches(record, state, units) {
    if (state.province && record.province !== state.province) return false;
    if (state.ward && record.ward !== state.ward) return false;
    if (state.unit && ['offices', 'clubs', 'volunteers'].includes(record.layer) && !descendant(record.unitId, state.unit, units)) return false;
    if (record.layer === 'clubs' && state.fields.length && !state.fields.some((value) => (record.fields || []).includes(value))) return false;
    if (record.layer === 'volunteers' && state.skills.length && !state.skills.some((value) => (record.skills || []).includes(value))) return false;
    const query = fold(state.query.trim());
    return query.length < 2 || fold(`${record.name} ${record.phone || ''} ${record.address}`).includes(query);
  }
  function select(records, state, context, units) {
    const filtered = records.filter((r) => eligible(r, context, units) && matches(r, state, units));
    const counts = Object.fromEntries(order.map((key) => [key, filtered.filter((r) => r.layer === key).length]));
    const rows = filtered.filter((r) => state.layers.has(r.layer)).sort((a, b) => order.indexOf(a.layer) - order.indexOf(b.layer) || a.name.localeCompare(b.name, 'vi'));
    return { counts, rows, total: rows.length };
  }
  return { layers, fields, skills, order, defaults, fold, validPosition, descendant, initialState, eligible, matches, select };
});
