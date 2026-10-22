// ==================== BẢN ĐỒ SỐ — NGUỒN LỰC: quy tắc nghiệp vụ độc lập giao diện ====================
// Mức đáp ứng, mức ưu tiên, trạng thái lệnh điều phối, kiểm tra hợp lệ khi tạo lệnh (SRS mục 1.4, 3.4–3.9, NL09–NL18).
// Dùng chung ở trình duyệt và kiểm thử Node. Kiểm tra quyền, lưu lệnh và gửi thông báo phải thực hiện lại ở API.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DigitalMapResourceModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // ---------- Mức ưu tiên nhân đạo P1–P4 ----------
  const PRIORITIES = {
    P1: { label: 'Khẩn cấp', short: 'P1 – Khẩn cấp', color: '#e5232f' },
    P2: { label: 'Cao', short: 'P2 – Cao', color: '#f39a2b' },
    P3: { label: 'Trung bình', short: 'P3 – Trung bình', color: '#f2c230' },
    P4: { label: 'Thấp', short: 'P4 – Thấp', color: '#8fa3b5' },
  };
  // ---------- Mức đáp ứng: Hiện có ÷ Nhu cầu × 100% (chú giải SRS 3.5 #3) ----------
  const LEVELS = {
    critical: { label: 'Thiếu nghiêm trọng', range: '< 30%', color: '#e5232f' },
    short: { label: 'Thiếu', range: '30% – < 60%', color: '#f39a2b' },
    near: { label: 'Gần cân bằng', range: '60% – < 100%', color: '#f2c230' },
    enough: { label: 'Đủ', range: '= 100%', color: '#22a06b' },
    surplus: { label: 'Dư nguồn lực', range: '> 100%', color: '#2f6fe4' },
  };
  const coverage = (need, have) => need > 0 ? (have / need) * 100 : 100;
  function level(pct) {
    const value = Math.round(pct * 10) / 10;
    if (value < 30) return 'critical';
    if (value < 60) return 'short';
    if (value < 100) return 'near';
    if (value === 100) return 'enough';
    return 'surplus';
  }
  // Phần trăm hiển thị luôn nằm trong khoảng của mức (59,5% hiển thị 59% "Thiếu", không làm tròn thành 60%)
  const BOUNDS = { critical: [0, 29], short: [30, 59], near: [60, 99], enough: [100, 100], surplus: [101, Infinity] };
  function percent(pct) { const [lo, hi] = BOUNDS[level(pct)]; return Math.min(hi, Math.max(lo, Math.round(pct))); }
  // Mức đáp ứng của tỉnh = trung bình cộng mức đáp ứng các nhóm (chỉ các nhóm đang lọc)
  function provinceCoverage(balance, groups) {
    const keys = (groups && groups.length ? groups : Object.keys(balance)).filter((key) => balance[key]);
    if (!keys.length) return null;
    return keys.reduce((sum, key) => sum + coverage(balance[key][0], balance[key][1]), 0) / keys.length;
  }
  // Bảng thừa/thiếu: Thiếu/Thừa = Hiện có − Nhu cầu; chỉ dòng thiếu có nút Điều phối
  function balanceRows(balance, groups) {
    return Object.keys(groups).filter((key) => balance[key]).map((key) => {
      const [need, have] = balance[key];
      const pct = coverage(need, have);
      return { key, ...groups[key], need, have, diff: have - need, pct, level: level(pct), short: have < need };
    });
  }
  // ---------- Lệnh điều phối: trạng thái gốc, nhãn lọc, tiến trình 7 mốc ----------
  const STATUSES = {
    draft: { label: 'Nháp', tone: 'neutral', color: '#8a9097' },
    pending: { label: 'Chờ duyệt', tone: 'orange', color: '#f39a2b' },
    approved: { label: 'Đã phê duyệt', tone: 'blue', color: '#2f6fe4' },
    preparing: { label: 'Đang chuẩn bị', tone: 'blue', color: '#7c4ddb' },
    shipping: { label: 'Đang vận chuyển', tone: 'orange', color: '#e8710a' },
    arrived: { label: 'Đã đến', tone: 'green', color: '#0f7b6c' },
    delivered: { label: 'Đã bàn giao', tone: 'green', color: '#22a06b' },
    distributed: { label: 'Đã phân phối', tone: 'green', color: '#00573a' },
    rejected: { label: 'Từ chối', tone: 'red', color: '#b91c2b' },
  };
  // Nhãn lọc khối Điều phối nguồn lực (thẻ lệnh luôn hiển thị trạng thái gốc) — Ghi chú SRS 3.5
  const FILTERS = {
    all: { label: 'Tất cả', statuses: Object.keys(STATUSES) },
    draft: { label: 'Nháp', statuses: ['draft'] },
    pending: { label: 'Chờ duyệt', statuses: ['pending'] },
    approved: { label: 'Đã duyệt', statuses: ['approved', 'preparing'] },
    shipping: { label: 'Đang vận chuyển', statuses: ['shipping', 'arrived'] },
    done: { label: 'Hoàn thành', statuses: ['delivered', 'distributed'] },
    rejected: { label: 'Từ chối', statuses: ['rejected'] },
  };
  // Theo dõi tuyến: chỉ lệnh từ Đã phê duyệt trở đi (SRS 3.9 #3, #5)
  const TRACK_STATUSES = ['approved', 'preparing', 'shipping', 'arrived', 'delivered', 'distributed'];
  const TRACK_FILTERS = {
    all: { label: 'Tất cả', test: () => true },
    shipping: { label: 'Đang vận chuyển', test: (o) => o.status === 'shipping' },
    waiting: { label: 'Chờ xuất hàng', test: (o) => ['approved', 'preparing'].includes(o.status) },
    delivered: { label: 'Đã bàn giao', test: (o) => ['delivered', 'distributed'].includes(o.status) },
    incident: { label: 'Sự cố', test: (o) => Boolean(o.incident) },
  };
  const MILESTONES = ['pending', 'approved', 'preparing', 'shipping', 'arrived', 'delivered', 'distributed'];
  // Nút chính trên thẻ lệnh đổi theo trạng thái (NL17); "who" = đơn vị được bấm
  const NEXT_ACTION = {
    approved: { label: 'Bắt đầu chuẩn bị', next: 'preparing', who: 'Đơn vị nguồn' },
    preparing: { label: 'Xuất hàng', next: 'shipping', who: 'Đơn vị nguồn' },
    shipping: { label: 'Xác nhận đã đến', next: 'arrived', who: 'Người áp tải hoặc đơn vị nhận' },
    arrived: { label: 'Xác nhận bàn giao', next: 'delivered', who: 'Đơn vị nhận' },
    delivered: { label: 'Cập nhật phân phối', next: 'distributed', who: 'Đơn vị nhận' },
  };
  // Nháp chỉ người tạo xem được (NL06)
  const visibleTo = (order, me) => order.status !== 'draft' || order.creator?.id === me.id;
  const inFilter = (order, key) => FILTERS[key].statuses.includes(order.status);
  // Phê duyệt / Từ chối / Chỉnh sửa chỉ với lệnh Chờ duyệt; Phê duyệt ẩn với người tạo lệnh (SRS 3.8 #8–10)
  const canApprove = (order, me) => order.status === 'pending' && me.canApprove !== false && order.creator?.id !== me.id;
  const canReject = (order, me) => order.status === 'pending' && me.canApprove !== false;
  const canEdit = (order, me) => order.status === 'pending' && (order.creator?.id === me.id || me.canApprove !== false);
  // Mã lệnh dạng LĐP-năm-số thứ tự
  function nextOrderId(orders, year) {
    const prefix = `LĐP-${year}-`;
    const max = orders.reduce((n, o) => o.id.startsWith(prefix) ? Math.max(n, Number(o.id.slice(prefix.length)) || 0) : n, 0);
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }
  // ---------- Quãng đường, thời gian: ước tính theo đường chim bay × hệ số đường bộ (dịch vụ định tuyến thật thay thế) ----------
  function distanceKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)) * 1.35);
  }
  // 45 km/giờ trên đường miền núi + 30 phút bốc xếp
  const travelMinutes = (km) => Math.round(km / 45 * 60 + 30);
  const durationText = (minutes) => { const h = Math.floor(minutes / 60), m = minutes % 60; return h ? `${h} giờ${m ? ` ${m} phút` : ''}` : `${m} phút`; };
  const shortDuration = (minutes) => `${Math.floor(minutes / 60)}g${String(minutes % 60).padStart(2, '0')}`;
  // Vị trí xe giai đoạn 1: ước tính theo giờ xuất phát và lộ trình (SRS 3.9 #4)
  function progress(order, now) {
    if (['arrived', 'delivered', 'distributed'].includes(order.status)) return 1;
    if (order.status !== 'shipping') return 0;
    const started = Date.parse((order.history || []).find(([status]) => status === 'shipping')?.[1] || '');
    if (!Number.isFinite(started) || !order.minutes) return 0;
    return Math.min(.97, Math.max(.03, (now - started) / (order.minutes * 60e3)));
  }
  // ---------- Kiểm tra hợp lệ cửa sổ Tạo lệnh (SRS 3.7 #9, NL09, NL10, NL18) ----------
  // draft: { program, target, due, rows: [{ depot, qty, vehicle }], escort }, ctx: { shortage, depots, now, eta(row) }
  function validateOrder(draft, ctx, { submit = true } = {}) {
    const errors = [];
    const warnings = [];
    const rows = draft.rows || [];
    const total = rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
    const missing = !draft.program || !draft.group || !draft.target || !draft.due || !rows.length
      || rows.some((row) => !row.depot || !(Number(row.qty) > 0) || !row.vehicle) || (submit && !draft.escort);
    if (missing) errors.push('TB04');
    if (draft.due && Date.parse(draft.due) <= ctx.now) errors.push('due');
    const integer = rows.every((row) => !row.qty || (Number.isInteger(Number(row.qty)) && Number(row.qty) > 0));
    if (!integer) errors.push('qty');
    if (total > ctx.shortage) errors.push('TB05');
    const over = rows.filter((row) => { const depot = ctx.depots[row.depot]; return depot && Number(row.qty) > (depot.available[draft.group] || 0); });
    if (over.length) errors.push('TB06');
    const foreign = rows.filter((row) => { const depot = ctx.depots[row.depot]; return depot && !depot.programs.includes(draft.program); });
    const targetDepot = ctx.depots[draft.target];
    if (foreign.length || (targetDepot && !targetDepot.programs.includes(draft.program))) errors.push('TB07');
    if (total > 0 && total < ctx.shortage) warnings.push('TB16');
    const lateRows = draft.due ? rows.filter((row) => row.depot && ctx.eta(row) > Date.parse(draft.due)) : [];
    if (lateRows.length) warnings.push('TB08');
    return { ok: !errors.length, errors, warnings, total, over: over.map((r) => r.depot), late: lateRows.map((r) => r.depot) };
  }
  return { PRIORITIES, LEVELS, STATUSES, FILTERS, TRACK_STATUSES, TRACK_FILTERS, MILESTONES, NEXT_ACTION, coverage, level, percent, provinceCoverage, balanceRows, visibleTo, inFilter, canApprove, canReject, canEdit, nextOrderId, distanceKm, travelMinutes, durationText, shortDuration, progress, validateOrder };
});
