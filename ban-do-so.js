// ==================== SECTION: BẢN ĐỒ SỐ — UC-BD-01 đến UC-BD-08 ====================
(async () => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const M = window.DigitalMapModel;
  const source = window.DigitalMapSource;
  const fmt = new Intl.NumberFormat('vi-VN');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
  const dot = (layer) => `<span class="bd-dot" style="--layer-color:${M.layers[layer].color}" aria-hidden="true"></span>`;
  let state = M.initialState();
  let data, result, map, tile, userPosition, userMarker, selectedElement, popup;
  let suppressedClose = false, requestId = 0, limit = 50, searchTimer, toastTimer;
  const groups = new Map();
  const markers = new Map();
  const bases = {
    // Bản đồ cơ bản: đất kem, nước xanh, biên xám tím (ô Esri World Light Gray qua bộ lọc #bd-tint-*); zoom ≤ 10 lộ lớp độ sâu đại dương (World Ocean Base) dưới mặt nước
    basic: { name: 'Bản đồ cơ bản', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', maxNativeZoom: 16, tint: true,
      ocean: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri — Esri, HERE, Garmin, GEBCO, NOAA NGDC', preview: '' },
    road: { name: 'Bản đồ đường', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: 'is-road' },
    satellite: { name: 'Bản đồ vệ tinh', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: 'is-satellite' },
    dark: { name: 'Bản đồ tối', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: 'is-dark' },
  };
  let baseKey = 'basic';
  let oceanTile = null;
  // Lớp độ sâu đại dương chỉ có dữ liệu tới zoom 10 → phóng to hơn thì nước dùng màu xanh phẳng
  const OCEAN_MAX_ZOOM = 10;
  // Khung nhìn toàn quốc: đất liền + Quần đảo Hoàng Sa, Quần đảo Trường Sa (kinh độ tới 115°E)
  const VIETNAM_BOUNDS = [[8.3, 102], [23.5, 115]];
  // ---------- Chủ quyền: nhãn Quần đảo Hoàng Sa, Quần đảo Trường Sa (luôn hiện trên mọi nền, không bấm được) ----------
  const ISLANDS = [
    { name: 'Quần đảo Hoàng Sa', at: [16.5, 112] },
    { name: 'Quần đảo Trường Sa', at: [10.2, 114.2] },
  ];
  function addIslands() {
    const pane = map.createPane('bd-sovereignty');
    pane.style.zIndex = 450;
    pane.style.pointerEvents = 'none';
    ISLANDS.forEach((island) => L.marker(island.at, { pane: 'bd-sovereignty', interactive: false, keyboard: false,
      icon: L.divIcon({ className: 'bd-map-label-host', html: `<span class="bd-island">${esc(island.name)}<small>(Việt Nam)</small></span>`, iconSize: null }) }).addTo(map));
  }
  const syncOcean = () => { if (map) $('#digital-map').classList.toggle('is-ocean', Boolean(oceanTile) && map.getZoom() <= OCEAN_MAX_ZOOM); };
  const toast = (message) => {
    $('#bd-toast').textContent = message;
    $('#bd-toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#bd-toast').hidden = true; }, 5500);
  };
  // ---------- Header và dialog dùng chung ----------
  const menuButton = $('.menu-toggle');
  const setMenu = (open) => { menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu'); $('.navigation').classList.toggle('is-open', open); };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $('.navigation').addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  const genericDialog = $('dialog.info-dialog:not(.bd-record-dialog)');
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-panel]');
    if (!trigger) return;
    event.preventDefault();
    $('#dialog-title').textContent = trigger.dataset.panel;
    $('.dialog-description').textContent = 'Chức năng này sẽ được kết nối khi nội dung và dữ liệu chính thức được bổ sung.';
    genericDialog.showModal();
  });
  document.querySelectorAll('dialog:not(.bd-dialog)').forEach((dialog) => {
    dialog.querySelectorAll('.dialog-close, .dialog-done').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (event) => { if (event.target === dialog) { const b = dialog.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close(); } });
  });
  // ---------- Nạp nguồn: giao diện danh sách vẫn hoạt động khi nền bản đồ lỗi ----------
  try {
    data = await source.load();
    if (!Array.isArray(data.records) || !Array.isArray(data.units) || !Array.isArray(data.locations)) throw new Error('Invalid map source');
  } catch (error) {
    $('#bd-total').textContent = 'Không tải được';
    $('#bd-empty').innerHTML = 'Không tải được dữ liệu bản đồ. <button type="button" class="md-link" id="bd-retry-data">Thử lại</button>';
    $('#bd-retry-data').addEventListener('click', () => location.reload());
    return;
  }
  if (data.bases) Object.assign(bases, data.bases);
  $('#bd-map-caption').hidden = !data.demo;
  if (data.errors?.length) toast(data.errors.map((key) => `Không tải được dữ liệu ${M.layers[key]?.name || key}. Vui lòng thử lại.`).join(' '));
  const unitName = (id) => data.units.find((u) => u.id === id)?.name || '—';
  // Cột lọc / danh sách nằm ngoài khung bản đồ (bố cục 3 cột) → chỉ chừa chỗ cho tab lớp bản đồ (trên trái), nút thu gọn cột (trái) và nút điều khiển (phải)
  const pad = () => window.innerWidth > 650
    ? { paddingTopLeft: [48, 72], paddingBottomRight: [80, 48] }
    : { paddingTopLeft: [24, 24], paddingBottomRight: [65, 40] };
  const coordinatesEqual = (a, b) => Math.abs(a.lat - b.lat) < .000001 && Math.abs(a.lng - b.lng) < .000001;
  const closePopup = () => { requestId += 1; if (!map) return; suppressedClose = true; map.closePopup(); suppressedClose = false; selectedElement?.classList.remove('is-selected'); selectedElement = null; };
  const highlight = (element) => { selectedElement?.classList.remove('is-selected'); selectedElement = element; element?.classList.add('is-selected'); };
  const dateText = (value) => {
    if (!value || !Number.isFinite(new Date(value).getTime())) return '—';
    const date = new Date(value);
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map((p) => [p.type, p.value]));
    return `${parts.hour}:${parts.minute}, ${parts.day}/${parts.month}/${parts.year}`;
  };
  const tags = (values) => values?.length ? `<span class="bd-tags">${values.map((value) => `<span class="pf-tag">${esc(value)}</span>`).join('')}</span>` : '—';
  const badge = (label, tone) => `<span class="pf-badge is-${tone}">${esc(label)}</span>`;
  const dayText = (value) => { const text = dateText(value); return text === '—' ? text : text.split(', ')[1]; };
  // Ảnh: tối đa 3 ảnh thu nhỏ, ảnh cuối ghi +N khi còn ảnh khác (SRS 3.1 #12)
  const thumbs = (photos = [], total = photos.length) => photos.length ? `<span class="bd-thumbs">${photos.slice(0, 3).map((src, i) => `<span class="bd-thumb"><img src="${esc(src)}" alt="" loading="lazy" />${i === 2 && total > 3 ? `<b>+${total - 3}</b>` : ''}</span>`).join('')}</span>` : '—';
  const dl = (rows) => `<dl class="bd-detail">${rows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  // ---------- Khung popup: phần đầu (nút quay lại · nhãn lớp · tên, dấu X cùng hàng nhãn) · đường kẻ ngang · phần thân ----------
  const frame = (head, body, back = '') => `<div class="bd-popup-header">${back}${head}</div><div class="bd-popup-body">${body}</div>`;
  const kindLabel = (record, extra = '') => { const layer = M.layers[record.layer]; return `<div class="bd-popup-kind" style="--layer-color:${layer.color}">${icon(layer.icon)}${esc(layer.name)}${extra}</div>`; };
  // ---------- Popup chi tiết hồ sơ Người yếu thế (SRS 3.2 #3–6) ----------
  function vulnerableHtml(r, back) {
    const level = M.urgency[r.urgency] || M.urgency.normal;
    return frame(`${kindLabel(r)}<div class="bd-popup-head"><h3>Hồ sơ ${esc(r.code)}</h3>${badge(level.label, level.tone)}</div>`, `
      ${dl([['Mã hồ sơ', esc(r.code)], ['Địa chỉ cụ thể', esc(r.address)], ['Loại đối tượng', esc(r.kind)], ['Nhóm đối tượng yếu thế', esc(r.group)], ['Mức độ cấp thiết', `${badge(level.label, level.tone)} <small>đánh giá ${dayText(r.date)}</small>`], ['Nhu cầu trợ giúp', tags(r.needs)], ['Hình ảnh', thumbs(r.photos, r.photoCount)]])}
      <div class="bd-popup-actions"><button type="button" class="button button-outline" data-directions="${esc(r.id)}">Chỉ đường</button><a class="button button-primary" href="${esc(r.profileUrl || 'ho-so.html#nguoi-yeu-the')}" target="_blank" rel="noopener">Xem thông tin chi tiết${icon('chevron-right')}</a></div>`, back);
  }
  function detailHtml(record) {
    const rows = [];
    if (record.layer === 'offices') rows.push(['Người đứng đầu', esc(record.leader || '—')], ['Số điện thoại', esc(record.phone || '—')], ['Địa điểm', esc(record.address || '—')]);
    if (record.layer === 'clubs') rows.push(['Người đại diện, Chủ nhiệm', esc(record.leader || '—')], ['Điện thoại', esc(record.phone || '—')], ['Đơn vị quản lý', esc(unitName(record.unitId))], ['Địa chỉ', esc(record.address || '—')], ['Lĩnh vực hoạt động', tags(record.fields)]);
    if (record.layer === 'volunteers') {
      const unit = data.units.find((u) => u.id === record.unitId);
      const manager = unit?.club ? `${unit.name} – ${unitName(unit.parentId)}` : unitName(record.unitId);
      rows.push(['Điện thoại', esc(record.phone || '—')], ['Đơn vị quản lý', esc(manager)], ['Chuyên môn', tags(record.skills)], ['Trực tuyến lần cuối', esc(dateText(record.lastSeen))], ['Địa chỉ', esc(record.address || '—')]);
    }
    if (['police', 'medical'].includes(record.layer)) rows.push(['Địa chỉ', esc(record.address || '—')]);
    if (record.layer === 'humanitarian') rows.push(['Địa chỉ', esc(record.address || '—')], ['Đơn vị quản lý trực tiếp', esc(unitName(record.unitId))], ['Loại hình/chức năng', esc(record.kind || '—')], ['Cấp độ', esc(record.level || '—')], ['Nhu cầu địa phương/căn cứ lựa chọn', esc(record.basis || '—')], ['Nhóm đối tượng hưởng lợi', esc(record.beneficiaries || '—')], ['Số điện thoại', esc(record.phone || '—')]);
    // Lớp chưa có mockup popup (SRS 1.2 ngoài phạm vi): thông tin chung; tên và loại đã ở phần đầu popup
    if (['fire', 'blood', 'firstaid'].includes(record.layer)) rows.push(['Địa chỉ', esc(record.address || '—')]);
    return dl(rows);
  }
  const mayView = (record) => ['offices', 'clubs', 'volunteers'].includes(record.layer) && source.canViewRecord?.(record, data.context) === true;
  const viewLabel = (record) => record.layer === 'volunteers' ? 'Xem hồ sơ' : record.layer === 'clubs' ? 'Xem thông tin đội, CLB' : 'Xem thông tin đơn vị';
  const WIDE_POPUP = ['vulnerable'];
  // Lớp gom theo xã trên bản đồ: mọi lớp trừ Trụ sở Hội. Bấm số của xã mở danh sách (cột theo M.layers[key].columns), bấm tên mở chi tiết
  const WARD_LAYERS = M.order.filter((key) => key !== 'offices');
  function popupHtml(record, back = '') {
    if (record.layer === 'vulnerable') return vulnerableHtml(record, back);
    return frame(`${kindLabel(record)}<h3>${esc(record.name)}</h3>`, `${detailHtml(record)}<div class="bd-popup-actions">${record.layer !== 'volunteers' ? `<button type="button" class="button ${mayView(record) ? 'button-outline' : 'button-primary'}" data-directions="${esc(record.id)}">Chỉ đường</button>` : ''}${mayView(record) ? `<button type="button" class="button button-primary" data-profile="${esc(record.id)}">${viewLabel(record)}</button>` : ''}</div>`, back);
  }
  // Mũi nhọn popup chỉ đúng đỉnh biểu tượng đã chọn (ghim neo ở đáy, cụm neo ở tâm): đo khoảng từ điểm neo tới mép trên icon
  const tipOffset = (element, latlng) => {
    if (!element) return [0, -31];
    const point = map.latLngToContainerPoint(latlng);
    const box = element.getBoundingClientRect(), frame = map.getContainer().getBoundingClientRect();
    return [Math.round(box.left - frame.left + box.width / 2 - point.x), Math.round(7 - (point.y - (box.top - frame.top)))];
  };
  function showPopup(latlng, html, { wide = false, anchor = null } = {}) {
    // Thanh "Đang định vị đối tượng" (đáy bản đồ, ~82px) đang hiện: chừa chỗ để ghim và hàng nút ghim đáy popup không bị che
    const focusBar = !$('#bd-focus-note').hidden;
    const bottom = focusBar ? 130 : 25;
    popup = L.popup({ className: `bd-popup${wide ? ' is-wide' : ''}`, maxWidth: wide ? 420 : 340, minWidth: 240, maxHeight: Math.max(150, Math.min(520, map.getSize().y - (focusBar ? 224 : 115))), offset: tipOffset(anchor, latlng), autoPanPaddingTopLeft: [40, 72], autoPanPaddingBottomRight: [65, bottom], closeButton: true, autoPan: true }).setLatLng(latlng).setContent(html).openOn(map);
    const element = popup.getElement();
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-label', element.querySelector('h3')?.textContent || 'Thông tin trên bản đồ');
    const close = element.querySelector('.leaflet-popup-close-button');
    close?.setAttribute('aria-label', 'Đóng thông tin');
    close?.focus({ preventScroll: true });
  }
  let lastList = null;
  async function openDetail(record, { isolate = false, fromList = null } = {}) {
    closePopup();
    if (isolate) {
      state.focusedId = record.id;
      renderList();
      renderMarkers();
      $('#bd-focus-note').hidden = false;
      if (map) map.setView([record.lat, record.lng], Math.max(map.getZoom(), 14), { animate: false });
    }
    const ticket = ++requestId;
    let fresh;
    try { fresh = await source.getRecord(record.id); }
    catch { if (ticket === requestId) toast(`Không tải được dữ liệu ${M.layers[record.layer].name}. Vui lòng thử lại.`); return; }
    if (ticket !== requestId) return;
    if (!fresh || !M.eligible(fresh, data.context, data.units) || !M.matches(fresh, state, data.units) || !state.layers.has(fresh.layer)) { exitFocus(); toast('Đối tượng không còn trong kết quả hiện tại.'); return; }
    // Bước 8a (NL04): hồ sơ người yếu thế mà máy chủ không cho xem → không mở chi tiết, báo TB02
    if (fresh.layer === 'vulnerable' && source.canViewRecord?.(fresh, data.context) !== true) {
      toast('Bạn không có quyền xem hồ sơ người yếu thế.');
      if (fromList && map) showPointList(...fromList); else if (isolate) exitFocus();
      return;
    }
    // Bước 8b: mọi lượt xem hồ sơ người yếu thế được ghi nhật ký
    if (fresh.layer === 'vulnerable') source.logView?.(fresh, data.context);
    if (!map) { showRecordDialog(fresh); return; }
    const marker = markers.get(fresh.id);
    if (ticket !== requestId) return;
    const back = fromList ? `<button type="button" class="bd-popup-back" data-back-list>${icon('chevron-right')}Danh sách tại điểm</button>` : '';
    // Ghim nằm trong cụm: popup neo vào biểu tượng cụm đang hiển thị
    const visibleMarker = groups.get(fresh.layer)?.getVisibleParent?.(marker) || marker;
    const anchor = visibleMarker?.getElement() || null;
    showPopup(visibleMarker?.getLatLng?.() || [fresh.lat, fresh.lng], popupHtml(fresh, back), { wide: WIDE_POPUP.includes(fresh.layer), anchor });
    highlight(anchor);
  }
  // ---------- Popup danh sách theo vị trí (SRS 3.1 #11): tiêu đề theo quy tắc địa chỉ, cột bảng đổi theo lớp ----------
  function pointCells(r) {
    if (r.layer === 'offices') return [esc(r.leader || '—')];
    if (r.layer === 'clubs') return [esc((r.fields || []).join('; ') || '—')];
    if (r.layer === 'volunteers') return [esc((r.skills || []).join('; ') || '—')];
    // Trụ sở công an, Cơ sở y tế: cột Địa chỉ chỉ gồm số nhà, đường (UC-BD 8.4, 8.5); địa chỉ đầy đủ ở popup chi tiết
    if (['police', 'medical'].includes(r.layer)) return [esc(r.street || '—')];
    if (r.layer === 'vulnerable') { const level = M.urgency[r.urgency] || M.urgency.normal; return [esc(r.group), badge(level.label, level.tone)]; }
    return [esc(r.address || '—')];
  }
  function showPointList(rows, latlng, element) {
    closePopup();
    lastList = [rows, latlng, element];
    const title = M.pointTitle(rows, data.locations);
    // Giống card chi tiết: phần đầu = nhãn lớp · số lượng + địa điểm; phần thân = bảng. Điểm có nhiều lớp: phần thân chia nhóm theo lớp
    const keys = M.order.filter((key) => rows.some((r) => r.layer === key));
    const count = (n) => `<span class="bd-popup-count">· Số lượng: ${fmt.format(n)}</span>`;
    const kind = keys.length === 1 ? kindLabel(rows[0], count(rows.length)) : `<div class="bd-popup-kind" style="--layer-color:var(--color-text-muted)">${icon('pin')}Danh sách tại điểm${count(rows.length)}</div>`;
    const body = keys.map((key) => {
      const items = rows.filter((r) => r.layer === key);
      const name = (r) => r.layer === 'vulnerable' ? r.code : r.name;
      const group = keys.length > 1 ? `<h4 style="--layer-color:${M.layers[key].color}">${icon(M.layers[key].icon)}${esc(M.layers[key].name)}${count(items.length)}</h4>` : '';
      return `${group}<table class="bd-popup-table is-${M.layers[key].columns.length}-cols"><thead><tr>${M.layers[key].columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${items.map((r) => `<tr><td><button type="button" data-point-record="${esc(r.id)}">${esc(name(r))}</button></td>${pointCells(r).map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }).join('');
    const wide = rows.some((r) => WIDE_POPUP.includes(r.layer));
    showPopup(latlng, frame(`${kind}<h3>${esc(title)}</h3>`, `<div class="bd-popup-group">${body}</div>`), { wide, anchor: element });
    highlight(element);
  }
  function exitFocus() {
    closePopup();
    state.focusedId = null;
    $('#bd-focus-note').hidden = true;
    renderMarkers(); renderList();
  }
  // ---------- Lớp độc lập: gộp cụm theo lớp, không đếm theo khung nhìn ----------
  function renderMarkers() {
    if (!map) return;
    groups.forEach((group) => group.clearLayers());
    markers.clear();
    const rows = state.focusedId ? result.rows.filter((r) => r.id === state.focusedId) : result.rows;
    // ---------- Các lớp trừ Trụ sở Hội: gom theo xã, mỗi xã một biểu tượng số không tách nhỏ hơn; bấm số mở danh sách của xã ----------
    const wards = new Map();
    if (!state.focusedId) rows.filter((r) => WARD_LAYERS.includes(r.layer) && r.ward).forEach((r) => {
      const id = `${r.layer}|${r.province}|${r.ward}`;
      wards.set(id, [...(wards.get(id) || []), r]);
    });
    wards.forEach((items) => {
      if (items.length < 2) return;
      const layer = M.layers[items[0].layer];
      const latlng = [items.reduce((n, r) => n + r.lat, 0) / items.length, items.reduce((n, r) => n + r.lng, 0) / items.length];
      const label = `${M.pointTitle(items, data.locations)}: ${fmt.format(items.length)} ${layer.unit}`;
      const size = items.length > 99 ? 48 : items.length > 9 ? 42 : 36;
      const marker = L.marker(latlng, { title: label, alt: label, recordIds: items.map((r) => r.id), count: items.length,
        icon: L.divIcon({ className: 'bd-cluster-host is-ward', html: `<span class="bd-cluster" style="--layer-color:${layer.color}" aria-label="${esc(label)}">${fmt.format(items.length)}</span>`, iconSize: [size, size] }) });
      marker.on('click', () => showPointList(items, marker.getLatLng(), marker.getElement()));
      items.forEach((r) => markers.set(r.id, marker));
      groups.get(items[0].layer).addLayer(marker);
    });
    rows.filter((r) => !markers.has(r.id)).forEach((record) => {
      const layer = M.layers[record.layer];
      const marker = L.marker([record.lat, record.lng], { title: M.displayName(record), alt: M.displayName(record), recordId: record.id,
        icon: L.divIcon({ className: 'bd-pin-host', html: `<span class="bd-pin" style="--layer-color:${layer.color}">${icon(layer.icon)}</span>`, iconSize: [32, 40], iconAnchor: [16, 38] }) });
      marker.on('click', () => {
        const samePoint = result.rows.filter((r) => coordinatesEqual(r, record));
        if (!state.focusedId && samePoint.length > 1) showPointList(samePoint, marker.getLatLng(), marker.getElement());
        else openDetail(record);
      });
      markers.set(record.id, marker);
      groups.get(record.layer).addLayer(marker);
    });
  }
  function mapNotice(message) {
    $('#bd-map-notice').innerHTML = `${esc(message)} <button type="button" id="bd-retry-map">Thử lại</button>`;
    $('#bd-map-notice').hidden = false;
    $('#bd-retry-map').addEventListener('click', () => { if (map) changeBase(baseKey); else location.reload(); });
  }
  function changeBase(key) {
    if (!map) return;
    baseKey = key;
    $('#digital-map').classList.toggle('bd-dark-base', key === 'dark');
    if (tile) map.removeLayer(tile);
    if (oceanTile) { map.removeLayer(oceanTile); oceanTile = null; }
    $('#bd-map-notice').hidden = true;
    const base = bases[key];
    let succeeded = 0, failed = 0;
    if (base.ocean) oceanTile = L.tileLayer(base.ocean, { maxZoom: OCEAN_MAX_ZOOM, maxNativeZoom: OCEAN_MAX_ZOOM, className: 'bd-tiles-ocean', zIndex: 0 }).addTo(map);
    const current = L.tileLayer(base.url, { maxZoom: 19, maxNativeZoom: base.maxNativeZoom || (key === 'road' ? 18 : 19), attribution: base.attribution, className: base.tint ? 'bd-tiles-tint' : '', zIndex: 1 });
    tile = current;
    current.on('tileload', () => { succeeded += 1; });
    current.on('tileerror', () => {
      failed += 1;
      if (tile === current && !succeeded) mapNotice(`Không tải được ${base.name}. Vui lòng thử lại hoặc chọn nền bản đồ khác.`);
    });
    current.on('load', () => { if (tile === current && succeeded && !failed) $('#bd-map-notice').hidden = true; });
    current.addTo(map);
    syncOcean();
    document.querySelectorAll('[data-base]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.base === key)));
  }
  function initMap() {
    if (!window.L) { mapNotice('Không tải được dữ liệu bản đồ. Vui lòng thử lại.'); return; }
    map = L.map('digital-map', { zoomControl: false, minZoom: 3, maxZoom: 19, attributionControl: true, fadeAnimation: false, zoomAnimation: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    map.attributionControl.setPrefix(false);
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
    M.order.forEach((key) => {
      const group = L.markerClusterGroup ? L.markerClusterGroup({ maxClusterRadius: 42, showCoverageOnHover: false, zoomToBoundsOnClick: false, spiderfyOnMaxZoom: false, animate: false,
        iconCreateFunction: (cluster) => {
          // Biểu tượng xã mang sẵn số đối tượng: cụm cộng dồn theo số đối tượng, không đếm theo số biểu tượng
          const count = cluster.getAllChildMarkers().reduce((n, marker) => n + (marker.options.count || 1), 0); const size = count > 99 ? 48 : count > 9 ? 42 : 36;
          return L.divIcon({ className: 'bd-cluster-host', html: `<span class="bd-cluster" style="--layer-color:${M.layers[key].color}" aria-label="${esc(M.layers[key].name)}: ${fmt.format(count)} ${esc(M.layers[key].unit)}">${fmt.format(count)}</span>`, iconSize: [size, size] });
        },
      }) : L.layerGroup();
      group.on('clusterclick', (event) => {
        const children = event.layer.getAllChildMarkers();
        const ids = new Set(children.flatMap((marker) => marker.options.recordIds || [marker.options.recordId]));
        const rows = result.rows.filter((r) => ids.has(r.id));
        if (!rows.length) return;
        const same = rows.every((r) => coordinatesEqual(r, rows[0]));
        if (map.getZoom() >= map.getMaxZoom() || same) {
          const all = same ? result.rows.filter((r) => coordinatesEqual(r, rows[0])) : rows;
          showPointList(all, event.layer.getLatLng(), event.layer.getElement());
        } else if (WARD_LAYERS.includes(key)) {
          // Cụm các lớp gom theo xã: phóng tới vùng của cụm để tách thành các xã (mỗi xã một biểu tượng số)
          closePopup();
          const before = map.getZoom();
          const bounds = L.latLngBounds(children.map((marker) => marker.getLatLng()));
          map.fitBounds(bounds.pad(.2), { ...pad(), maxZoom: map.getMaxZoom(), animate: false });
          if (map.getZoom() <= before) map.setView(bounds.getCenter(), Math.min(map.getZoom() + 1, map.getMaxZoom()), { animate: false });
        } else { closePopup(); map.setView(event.layer.getLatLng(), Math.min(map.getZoom() + 1, map.getMaxZoom()), { animate: false }); }
      });
      group.addTo(map); groups.set(key, group);
    });
    map.on('popupclose', () => {
      if (suppressedClose) return;
      requestId += 1;
      highlight(null);
      if (state.focusedId) { state.focusedId = null; $('#bd-focus-note').hidden = true; renderMarkers(); renderList(); }
    });
    map.on('click', () => { setBases(false); });
    map.on('zoomend', syncOcean);
    map.on('zoomend', () => { $('#bd-zoom-in').disabled = map.getZoom() >= map.getMaxZoom(); $('#bd-zoom-out').disabled = map.getZoom() <= map.getMinZoom(); });
    changeBase('basic');
    addIslands();
    map.fitBounds(data.context.national ? VIETNAM_BOUNDS : data.context.bounds, { ...pad(), animate: false });
    let mobileLayout = window.innerWidth <= 650;
    new ResizeObserver(() => {
      map.invalidateSize();
      const mobile = window.innerWidth <= 650;
      if (mobile !== mobileLayout) {
        mobileLayout = mobile;
        if (state.focusedId) {
          const record = result.rows.find((r) => r.id === state.focusedId);
          if (record) openDetail(record, { isolate: true });
        } else fitRegion();
      }
    }).observe($('#digital-map'));
  }
  // ---------- Danh sách: tiêu đề cố định, 50 dòng mỗi lần, truy cập bằng bàn phím ----------
  function renderList() {
    $('#bd-total').textContent = `${fmt.format(result.total)} kết quả`;
    $('#bd-empty').hidden = result.total > 0;
    // TB01: tìm kiếm, lọc không có kết quả
    $('#bd-empty').textContent = state.layers.size ? 'Không tìm thấy dữ liệu phù hợp.' : 'Chưa chọn lớp dữ liệu nào.';
    // Mỗi dòng: chấm màu lớp · tên đối tượng (Người yếu thế: mã hồ sơ · nhóm đối tượng) · tên lớp · địa chỉ (SRS 3.1 #8, 3.2 #1)
    $('#bd-rows').innerHTML = result.rows.slice(0, limit).map((r) => `<tr class="${r.id === state.focusedId ? 'is-active' : ''}"><td><button type="button" data-record="${esc(r.id)}" aria-pressed="${r.id === state.focusedId}">${dot(r.layer)}<span><span class="bd-row-name">${esc(M.displayName(r))}</span><small class="bd-row-layer">${esc(M.layers[r.layer].name)}</small></span></button></td><td>${esc(r.address || '—')}</td></tr>`).join('');
    $('#bd-load-more').hidden = limit >= result.total;
    M.order.forEach((key) => { $(`[data-count="${key}"]`).textContent = fmt.format(result.counts[key]); });
  }
  function applyFilters({ resetLimit = true } = {}) {
    closePopup();
    if (resetLimit) { limit = 50; $('#bd-results-body').scrollTop = 0; }
    result = M.select(data.records, state, data.context, data.units);
    if (!result.rows.some((r) => r.id === state.focusedId)) state.focusedId = null;
    $('#bd-focus-note').hidden = !state.focusedId;
    renderList(); renderMarkers();
    // Số bộ lọc nâng cao đang áp dụng (đơn vị hội · lĩnh vực · kỹ năng) hiện trên nút "Bộ lọc nâng cao"
    const advanced = [state.unit, state.fields.length, state.skills.length].filter(Boolean).length;
    $('#bd-adv-count').hidden = !advanced;
    $('#bd-adv-count').textContent = advanced;
    if (state.focusedId) openDetail(result.rows.find((r) => r.id === state.focusedId));
  }
  // ---------- Lớp bản đồ: chia nhóm, mỗi dòng = biểu tượng màu lớp (không nền) · tên + số lượng theo đơn vị của lớp · công tắc ----------
  const LAYER_GROUPS = [
    ['Tổ chức hội', [['offices', 'Trụ sở hội'], ['clubs', 'Đội, CLB tình nguyện viên']]],
    ['Con người', [['volunteers', 'Tình nguyện viên'], ['vulnerable', 'Người yếu thế']]],
    ['Hạ tầng hỗ trợ', [['medical', 'Bệnh viện, cơ sở y tế'], ['police', 'Công an'], ['fire', 'Cơ sở PCCC']]],
    ['Hạ tầng nhân đạo', [['humanitarian', 'Điểm nhân đạo'], ['blood', 'Điểm hiến máu'], ['firstaid', 'Trạm sơ cấp cứu']]],
  ];
  // Liên kết "Bật tất cả" (SRS 3.1 #6) nằm cùng hàng tiêu đề "Lớp bản đồ"; khi mọi lớp đang bật thì đổi thành "Tắt tất cả"
  $('#bd-layers').insertAdjacentHTML('beforeend', LAYER_GROUPS.map(([title, items], g) => `<div class="bd-layer-group" role="group" aria-labelledby="bd-layer-group-${g}"><h3 class="bd-layer-group-title"><button type="button" class="bd-layer-group-toggle" id="bd-layer-group-${g}" aria-expanded="true" aria-controls="bd-layer-group-body-${g}">${esc(title)}${icon('chevron-down')}</button></h3><div class="bd-layer-group-body" id="bd-layer-group-body-${g}">${items.map(([key, label]) => `<label class="md-layer bd-layer" style="--layer-color:${M.layers[key].color}"><span class="md-layer-icon" aria-hidden="true">${icon(M.layers[key].icon)}</span><span class="md-layer-text"><strong class="bd-layer-name">${esc(label)}</strong><small><span data-count="${key}">0</span> ${esc(M.layers[key].unit)}</small></span><input class="md-switch" type="checkbox" data-layer="${key}" ${state.layers.has(key) ? 'checked' : ''} /></label>`).join('')}</div></div>`).join(''));
  const layerHasData = (key) => data.records.some((r) => r.layer === key);
  data.locations.forEach((p) => $('#bd-province').add(new Option(p.name, p.id)));
  function renderMulti(kind) {
    const catalog = M[kind]; const noun = kind === 'fields' ? 'lĩnh vực' : 'kỹ năng';
    $(`#bd-${kind}-value`).textContent = state[kind].length > 1 ? `${state[kind].length} ${noun} đã chọn` : state[kind][0] || `Tất cả ${noun}`;
    $(`#bd-${kind}-options`).innerHTML = catalog.map((value, index) => `<label><input type="checkbox" data-multi="${kind}" value="${index}" ${state[kind].includes(value) ? 'checked' : ''}/><span>${esc(value)}</span></label>`).join('') + `<button type="button" class="md-link" data-clear="${kind}">Bỏ chọn tất cả</button>`;
  }
  const availableUnits = () => data.units.filter((u) => !u.club && (!state.province || u.province === state.province) && (!state.ward || u.ward === state.ward));
  function renderUnits() {
    if (state.unit && !availableUnits().some((u) => u.id === state.unit)) state.unit = '';
    $('#bd-unit-value').textContent = state.unit ? unitName(state.unit) : 'Tất cả đơn vị';
    const query = M.fold($('#bd-unit-search').value.trim());
    const units = availableUnits().filter((u) => M.fold(u.name).includes(query));
    $('#bd-unit-options').innerHTML = `<label><input type="radio" name="bd-unit" value="" ${state.unit ? '' : 'checked'}/>Tất cả đơn vị</label>` + units.map((u) => `<label><input type="radio" name="bd-unit" value="${esc(u.id)}" ${state.unit === u.id ? 'checked' : ''}/><span>${esc(u.name)}</span></label>`).join('') + (units.length ? '' : '<p>Không tìm thấy đơn vị phù hợp.</p>');
  }
  // Bộ lọc Đơn vị / Lĩnh vực / Kỹ năng: không có lớp áp dụng đang bật → hiển thị mờ, không cho chọn, xóa giá trị (SRS 3.1 #7)
  function setFieldEnabled(kind, enabled) {
    const field = $(`#bd-${kind}-field`);
    const picker = $(`#bd-${kind}-picker`);
    field.classList.toggle('is-disabled', !enabled);
    picker.querySelector('summary').setAttribute('aria-disabled', String(!enabled));
    picker.querySelector('summary').tabIndex = enabled ? 0 : -1;
    if (!enabled) picker.open = false;
  }
  function dependentFilters() {
    const unitOn = M.UNIT_LAYERS.some((layer) => state.layers.has(layer));
    setFieldEnabled('unit', unitOn);
    if (!unitOn) state.unit = '';
    for (const [layers, kind] of [[M.FIELD_LAYERS, 'fields'], [M.SKILL_LAYERS, 'skills']]) {
      const enabled = layers.some((layer) => state.layers.has(layer));
      setFieldEnabled(kind, enabled);
      if (!enabled) state[kind] = [];
      renderMulti(kind);
    }
    renderUnits();
    const all = M.order.every((key) => state.layers.has(key));
    $('#bd-layers-all').textContent = all ? 'Tắt tất cả' : 'Bật tất cả';
  }
  // Ô bộ lọc bị mờ: chặn mở danh sách chọn
  document.querySelectorAll('#bd-adv .bd-multi summary').forEach((summary) => summary.addEventListener('click', (event) => { if (summary.getAttribute('aria-disabled') === 'true') event.preventDefault(); }));
  function updateWards() {
    $('#bd-ward').replaceChildren(new Option('Tất cả xã, phường', ''));
    $('#bd-ward').disabled = !state.province;
    data.locations.find((p) => p.id === state.province)?.wards.forEach((w) => $('#bd-ward').add(new Option(w.name, w.id)));
  }
  function fitRegion() {
    if (!map) return;
    if (!state.province) { map.fitBounds(data.context.national ? VIETNAM_BOUNDS : data.context.bounds, { ...pad(), animate: false }); return; }
    // Nguồn thật có thể cung cấp bounds cho tỉnh/xã; mẫu dùng tọa độ gần đúng.
    const province = data.locations.find((p) => p.id === state.province);
    const ward = province?.wards.find((w) => w.id === state.ward);
    const bounds = ward?.bounds || (!state.ward && province?.bounds);
    if (bounds) { map.fitBounds(bounds, { ...pad(), animate: false }); return; }
    const inRegion = data.records.filter((r) => M.validPosition(r) && r.province === state.province && (!state.ward || r.ward === state.ward));
    if (inRegion.length) map.fitBounds(L.latLngBounds(inRegion.map((r) => [r.lat, r.lng])).pad(state.ward ? .3 : .8), { ...pad(), maxZoom: state.ward ? 13 : 10, animate: false });
    else if (data.centers[state.province]) map.setView(data.centers[state.province], 9, { animate: false });
  }
  $('#bd-layers').addEventListener('change', (event) => {
    const key = event.target.dataset.layer;
    if (!key) return;
    if (event.target.checked) state.layers.add(key); else state.layers.delete(key);
    if (event.target.checked && !layerHasData(key)) toast(`Lớp “${event.target.closest('.bd-layer').querySelector('.bd-layer-name').firstChild.textContent}” chưa có dữ liệu.`);
    dependentFilters(); applyFilters();
  });
  $('#bd-layers-all').addEventListener('click', () => {
    const on = !M.order.every((key) => state.layers.has(key));
    state.layers = new Set(on ? M.order : []);
    document.querySelectorAll('[data-layer]').forEach((input) => { input.checked = on; });
    dependentFilters(); applyFilters();
    $('#bd-layers').dispatchEvent(new Event('change', { bubbles: true }));
  });
  // ---------- Bộ lọc Thời gian (SRS 3.1 #3): Hiện tại · 7 ngày qua · 30 ngày qua · Tùy chọn (từ ngày – đến ngày) ----------
  const timeSelect = $('#bd-time');
  const customOption = timeSelect.querySelector('option[value="custom"]');
  const timePop = $('#bd-time-pop');
  const setTimePop = (open) => { timePop.hidden = !open; if (open) $('#bd-time-from').focus(); };
  timeSelect.addEventListener('change', () => {
    if (timeSelect.value === 'custom') { setTimePop(true); return; }
    state.time = timeSelect.value; state.from = ''; state.to = '';
    customOption.textContent = 'Tùy chọn';
    setTimePop(false); applyFilters();
  });
  $('#bd-time-apply').addEventListener('click', () => {
    const from = $('#bd-time-from').value, to = $('#bd-time-to').value;
    if (!from && !to) { $('#bd-time-error').textContent = 'Vui lòng chọn ít nhất một ngày.'; return; }
    if (from && to && from > to) { $('#bd-time-error').textContent = 'Ngày bắt đầu phải trước ngày kết thúc.'; return; }
    $('#bd-time-error').textContent = '';
    Object.assign(state, { time: 'custom', from, to });
    const short = (value) => value ? value.split('-').reverse().slice(0, 2).join('/') : '…';
    customOption.textContent = `${short(from)} – ${short(to)}`;
    timeSelect.value = 'custom';
    setTimePop(false); applyFilters();
  });
  $('#bd-time-cancel').addEventListener('click', () => { timeSelect.value = state.time; setTimePop(false); timeSelect.focus(); });
  $('#bd-province').addEventListener('change', (event) => { state.province = event.target.value; state.ward = ''; updateWards(); renderUnits(); applyFilters(); fitRegion(); });
  $('#bd-ward').addEventListener('change', (event) => { state.ward = event.target.value; renderUnits(); applyFilters(); fitRegion(); });
  $('#bd-unit-search').addEventListener('input', renderUnits);
  $('#bd-unit-options').addEventListener('change', (event) => { state.unit = event.target.value; renderUnits(); $('#bd-unit-picker').open = false; $('#bd-unit-picker summary').focus(); applyFilters(); });
  for (const kind of ['fields', 'skills']) {
    $(`#bd-${kind}-options`).addEventListener('change', (event) => {
      const value = M[kind][Number(event.target.value)];
      if (event.target.checked) state[kind] = [...new Set([...state[kind], value])]; else state[kind] = state[kind].filter((v) => v !== value);
      const noun = kind === 'fields' ? 'lĩnh vực' : 'kỹ năng';
      $(`#bd-${kind}-value`).textContent = state[kind].length > 1 ? `${state[kind].length} ${noun} đã chọn` : state[kind][0] || `Tất cả ${noun}`;
      applyFilters();
    });
    $(`#bd-${kind}-options`).addEventListener('click', (event) => { if (!event.target.closest('[data-clear]')) return; state[kind] = []; renderMulti(kind); $(`#bd-${kind}-picker summary`).focus(); applyFilters(); });
  }
  $('#bd-search').addEventListener('input', () => {
    clearTimeout(searchTimer);
    const value = $('#bd-search').value.trim();
    const run = () => { state.query = value.length >= 2 ? value : ''; applyFilters(); };
    if (value.length < 2) run(); else searchTimer = setTimeout(run, 500);
  });
  $('#bd-reset').addEventListener('click', () => {
    clearTimeout(searchTimer); state = M.initialState();
    $('#bd-search').value = ''; $('#bd-province').value = ''; $('#bd-unit-search').value = '';
    timeSelect.value = ''; customOption.textContent = 'Tùy chọn'; $('#bd-time-from').value = ''; $('#bd-time-to').value = ''; setTimePop(false);
    document.querySelectorAll('[data-layer]').forEach((input) => { input.checked = state.layers.has(input.dataset.layer); });
    document.querySelectorAll('.bd-multi').forEach((details) => { details.open = false; });
    updateWards(); dependentFilters(); applyFilters(); fitRegion();
  });
  $('#bd-rows').addEventListener('click', (event) => { const button = event.target.closest('[data-record]'); if (button) openDetail(result.rows.find((r) => r.id === button.dataset.record), { isolate: true }); });
  const loadMore = () => { if (limit < result.total) { limit += 50; renderList(); } };
  $('#bd-load-more').addEventListener('click', loadMore);
  $('#bd-results-body').addEventListener('scroll', (event) => { const el = event.currentTarget; if (el.scrollHeight - el.clientHeight - el.scrollTop < 45) loadMore(); });
  $('#bd-exit-focus').addEventListener('click', exitFocus);
  // Tiêu đề nhóm lớp bản đồ (Tổ chức hội, Con người…): bấm để thu gọn / mở các lớp trong nhóm
  $('#bd-layers').addEventListener('click', (event) => {
    const button = event.target.closest('.bd-layer-group-toggle');
    if (!button) return;
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
  });
  // ---------- BỘ LỌC NÂNG CAO: nút trên thanh công cụ mở / đóng bảng ngay dưới (như bộ lọc trang hồ sơ) ----------
  $('#bd-adv-toggle').addEventListener('click', () => {
    const open = $('#bd-adv').hidden;
    $('#bd-adv').hidden = !open;
    $('#bd-adv-toggle').setAttribute('aria-expanded', String(open));
    if (!open) document.querySelectorAll('#bd-adv .bd-multi[open]').forEach((details) => { details.open = false; });
  });
  // ---------- CỘT BÊN: thu gọn / mở cột trái, cột phải (như bản cũ); nhớ trạng thái trong trình duyệt ----------
  const PANEL_KEY = 'bd-panels-closed';
  const panelLabels = { left: 'cột lớp bản đồ', right: 'cột danh sách dữ liệu' };
  const panelToggles = [...document.querySelectorAll('[data-panel-toggle]')];
  const wideMap = matchMedia('(min-width: 1101px)');
  function isPanelClosed(panel) { return wideMap.matches && panelToggles.some((b) => b.getAttribute('aria-controls') === panel.id && b.getAttribute('aria-expanded') === 'false'); }
  function setPanel(button, open) {
    const side = button.dataset.panelToggle;
    $('#bd-dashboard').classList.toggle(`is-${side}-closed`, !open);
    const label = `${open ? 'Thu gọn' : 'Mở'} ${panelLabels[side]}`;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', label);
    button.title = label;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    // Cột trái thu gọn vẫn hiện thanh biểu tượng lớp → chỉ khóa phần nội dung đầy đủ
    (side === 'left' ? panel.querySelector('.bd-layers-card') : panel).inert = isPanelClosed(panel);
  }
  let closedPanels = [];
  try { closedPanels = JSON.parse(localStorage.getItem(PANEL_KEY)) || []; } catch { closedPanels = []; }
  panelToggles.forEach((button) => {
    if (closedPanels.includes(button.dataset.panelToggle)) setPanel(button, false);
    button.addEventListener('click', () => {
      setPanel(button, button.getAttribute('aria-expanded') !== 'true');
      const closed = panelToggles.filter((b) => b.getAttribute('aria-expanded') === 'false').map((b) => b.dataset.panelToggle);
      try { localStorage.setItem(PANEL_KEY, JSON.stringify(closed)); } catch { /* bỏ qua: trình duyệt chặn lưu trữ */ }
    });
  });
  // Màn hình hẹp (≤ 1100px) xếp dọc, không có nút thu gọn → luôn hiện cả hai cột
  wideMap.addEventListener('change', () => panelToggles.forEach((button) => setPanel(button, button.getAttribute('aria-expanded') === 'true')));
  // ---------- Thao tác popup và tra cứu hồ sơ nguồn ----------
  function showRecordDialog(record) {
    $('#bd-record-title').textContent = record.layer === 'volunteers' ? 'Thông tin tình nguyện viên' : record.layer === 'vulnerable' ? 'Hồ sơ người yếu thế' : ['offices', 'clubs'].includes(record.layer) ? 'Thông tin tổ chức' : 'Thông tin địa điểm';
    $('#bd-record-content').innerHTML = WIDE_POPUP.includes(record.layer) ? popupHtml(record) : `<h3>${esc(record.name)}</h3>${detailHtml(record)}`;
    $('#bd-record-dialog').showModal();
  }
  async function openProfile(id) {
    try {
      const record = await source.getRecord(id);
      if (!record || !mayView(record) || !M.eligible(record, data.context, data.units)) { toast('Bạn không có quyền xem hồ sơ này.'); return; }
      if (source.openRecord) source.openRecord(record, record.layer === 'volunteers' ? 'CB-04a' : 'CB-01a');
      else showRecordDialog(record);
    } catch { toast('Không tải được hồ sơ. Vui lòng thử lại.'); }
  }
  function directions(id) {
    const record = result.rows.find((r) => r.id === id);
    if (!record || record.layer === 'volunteers') return;
    const url = new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api', '1'); url.searchParams.set('destination', `${record.lat},${record.lng}`);
    if (userPosition) url.searchParams.set('origin', `${userPosition.lat},${userPosition.lng}`);
    // Mở đồng bộ trong click để trình duyệt không coi là popup tự động.
    const target = window.open('about:blank', '_blank');
    if (!target) { toast('Trình duyệt đã chặn cửa sổ chỉ đường. Vui lòng cho phép cửa sổ bật lên và thử lại.'); return; }
    target.opener = null; target.location.href = url.toString();
  }
  $('#digital-map').addEventListener('click', (event) => {
    const point = event.target.closest('[data-point-record]');
    const route = event.target.closest('[data-directions]');
    const profile = event.target.closest('[data-profile]');
    if (point) { const record = result.rows.find((r) => r.id === point.dataset.pointRecord); if (record) openDetail(record, { fromList: lastList }); }
    if (route) directions(route.dataset.directions);
    if (profile) openProfile(profile.dataset.profile);
    if (event.target.closest('[data-back-list]') && lastList) showPointList(...lastList);
  });
  // ---------- UC-BD-08: nền, vị trí, zoom và toàn màn hình trong cửa sổ ----------
  function setBases(open) { $('#bd-bases').hidden = !open; $('#bd-base-toggle').setAttribute('aria-expanded', String(open)); }
  $('#bd-base-options').innerHTML = Object.entries(bases).map(([key, base]) => `<button type="button" class="bd-base-option" data-base="${key}" aria-pressed="${key === 'basic'}"><span class="bd-base-preview ${base.preview}" aria-hidden="true"></span>${base.name}</button>`).join('');
  $('#bd-base-toggle').addEventListener('click', () => setBases($('#bd-bases').hidden));
  $('#bd-base-options').addEventListener('click', (event) => { const button = event.target.closest('[data-base]'); if (button) changeBase(button.dataset.base); });
  $('#bd-zoom-in').addEventListener('click', () => map?.zoomIn());
  $('#bd-zoom-out').addEventListener('click', () => map?.zoomOut());
  $('#bd-locate').addEventListener('click', () => {
    const failure = () => { $('#bd-locate').disabled = false; toast('Không xác định được vị trí của bạn. Vui lòng cho phép trình duyệt truy cập vị trí.'); };
    if (!navigator.geolocation || !map) { failure(); return; }
    $('#bd-locate').disabled = true;
    navigator.geolocation.getCurrentPosition((position) => {
      $('#bd-locate').disabled = false;
      userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker(userPosition, { radius: 8, color: '#fff', weight: 3, fillColor: '#2F5FB3', fillOpacity: 1 }).addTo(map).bindTooltip('Vị trí của tôi');
      map.setView(userPosition, 15, { animate: false });
    }, failure, { timeout: 10000, maximumAge: 60000 });
  });
  function fullscreen(open) {
    document.body.classList.toggle('bd-fullscreen', open);
    $('#bd-fullscreen').setAttribute('aria-pressed', String(open));
    $('#bd-fullscreen').setAttribute('aria-label', open ? 'Thoát toàn màn hình' : 'Toàn màn hình');
    $('#bd-fullscreen').title = open ? 'Thoát toàn màn hình' : 'Toàn màn hình';
    // Toàn màn hình (UC-BD-08): ẩn header, footer; thanh công cụ, các cột và nút điều khiển giữ nguyên
    document.querySelectorAll('body > header, body > footer').forEach((element) => { element.inert = open; });
    requestAnimationFrame(() => {
      map?.invalidateSize();
      if (state.focusedId) {
        const record = result.rows.find((r) => r.id === state.focusedId);
        if (record) openDetail(record, { isolate: true });
      } else if (window.innerWidth <= 650) fitRegion();
    });
  }
  $('#bd-fullscreen').addEventListener('click', () => fullscreen(!document.body.classList.contains('bd-fullscreen')));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if ($('dialog[open]')) return;
    setMenu(false); setBases(false); setTimePop(false);
    document.querySelectorAll('.bd-multi[open]').forEach((details) => { details.open = false; details.querySelector('summary').focus(); });
    if (document.body.classList.contains('bd-fullscreen')) { fullscreen(false); $('#bd-fullscreen').focus(); }
    else if (state.focusedId) exitFocus(); else closePopup();
  });
  document.addEventListener('click', (event) => { document.querySelectorAll('.bd-multi[open]').forEach((details) => { if (!details.contains(event.target)) details.open = false; }); });
  // ==================== LỚP BẢN ĐỒ: tab Tổng quan · Nguồn lực · Thời tiết ====================
  // Nguồn lực (ban-do-so-nguon-luc.js) và Thời tiết là lớp riêng, không vào Danh sách địa điểm và số lượng của các lớp Tổng quan.
  // ---------- Tab: bấm hoặc phím ← → Home End để chuyển; Nguồn lực đổi cả thanh bộ lọc, cột phải và ẩn ghim Tổng quan ----------
  const tabs = [...document.querySelectorAll('.bd-tabs [role="tab"]')];
  const tabListeners = [];
  let currentTab = 'overview';
  function showOverviewMarkers(visible) {
    if (!map) return;
    groups.forEach((group) => { if (visible && !map.hasLayer(group)) group.addTo(map); if (!visible && map.hasLayer(group)) map.removeLayer(group); });
  }
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    const key = tab.id.replace('bd-tab-', '');
    if (key !== currentTab) {
      currentTab = key;
      const resources = key === 'resources';
      document.querySelectorAll('[data-tools]').forEach((element) => { element.hidden = element.dataset.tools !== (resources ? 'resources' : 'overview'); });
      // Nút Bật / Tắt tất cả trên hàng tiêu đề: chỉ hiện ở tab có lớp tương ứng (Thời tiết không có)
      document.querySelectorAll('[data-tab-only]').forEach((element) => { element.hidden = element.dataset.tabOnly !== key; });
      if (resources && !$('#bd-adv').hidden) $('#bd-adv-toggle').click();
      $('.bd-results-card').hidden = resources;
      $('#bd-dashboard').classList.toggle('is-resources', resources);
      $('#bd-res-card').hidden = !resources;
      $('#bd-right').setAttribute('aria-label', resources ? 'Nguồn lực' : 'Danh sách địa điểm');
      panelLabels.right = resources ? 'cột nguồn lực' : 'cột danh sách dữ liệu';
      panelToggles.forEach((button) => setPanel(button, button.getAttribute('aria-expanded') === 'true'));
      if (resources) { exitFocus(); closePopup(); }
      showOverviewMarkers(!resources);
      tabListeners.forEach((listener) => listener(key));
    }
    renderRail();
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    // Tab nằm trên bản đồ: cột Lớp bản đồ đang thu gọn thì mở lại để thấy nội dung tab
    tab.addEventListener('click', () => { selectTab(tab); if ($('#bd-dashboard').classList.contains('is-left-closed')) $('[data-panel-toggle="left"]').click(); });
    tab.addEventListener('keydown', (event) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[(next + tabs.length) % tabs.length], true);
    });
  });
  // ---------- Thời tiết: nhãn cảnh báo thiên tai (dữ liệu minh họa window.DigitalMapExtra) ----------
  const X = window.DigitalMapExtra || { weather: [] };
  const extraDefaults = () => ({ alert: false, watch: false });
  let extra = extraDefaults();
  const WEATHER_KINDS = [['alert', 'Cảnh báo nguy hiểm', 'rain', '#e5232f'], ['watch', 'Cần theo dõi', 'cloud', '#2f6fe4']];
  $('#bd-weather-layers').innerHTML = WEATHER_KINDS.map(([key, label, ic, color]) => `<label class="md-layer bd-layer" style="--layer-color:${color}"><span class="md-layer-icon" aria-hidden="true">${icon(ic)}</span><span class="md-layer-text"><strong class="bd-layer-name">${label}</strong><small>${esc(X.weather.filter((w) => (key === 'alert') === w.alert).map((w) => w.text).join(', '))}</small></span><input class="md-switch" type="checkbox" data-extra="${key}" /></label>`).join('');
  const weatherGroups = {};
  function buildExtraLayers() {
    if (!map || !window.L) return;
    WEATHER_KINDS.forEach(([key]) => {
      weatherGroups[key] = L.layerGroup(X.weather.filter((w) => (key === 'alert') === w.alert).map((w) => L.marker([w.lat, w.lng], {
        keyboard: false, interactive: false, zIndexOffset: 2000,
        icon: L.divIcon({ className: '', html: `<span class="md-weather${w.alert ? ' is-alert' : ''}">${icon(w.alert ? 'rain' : 'cloud')}${esc(w.text)}</span>`, iconSize: null }),
      })));
    });
  }
  const showIn = (group, layer, wanted) => {
    if (wanted && !group.hasLayer(layer)) group.addLayer(layer);
    if (!wanted && group.hasLayer(layer)) group.removeLayer(layer);
  };
  function applyExtra() {
    if (!map || !weatherGroups.alert) return;
    WEATHER_KINDS.forEach(([key]) => showIn(map, weatherGroups[key], extra[key]));
  }
  document.querySelectorAll('[data-extra]').forEach((input) => input.addEventListener('change', () => { extra[input.dataset.extra] = input.checked; applyExtra(); }));
  $('#bd-reset').addEventListener('click', () => {
    extra = extraDefaults();
    document.querySelectorAll('[data-extra]').forEach((input) => { input.checked = false; });
    applyExtra();
  });

  // ==================== LỚP BẢN ĐỒ THU GỌN: thanh biểu tượng + tooltip ====================
  // ---------- Thanh biểu tượng: mỗi công tắc lớp của tab đang chọn = 1 nút; bấm = bật / tắt công tắc tương ứng ----------
  const rail = $('#bd-rail');
  let railInputs = [];
  let tipButton = null;
  const tip = Object.assign(document.createElement('div'), { id: 'bd-rail-tip', className: 'bd-rail-tip', hidden: true });
  tip.setAttribute('role', 'tooltip');
  document.body.append(tip);
  const railName = (input) => input.closest('.bd-layer').querySelector('.bd-layer-name').textContent;
  function renderRail() {
    hideTip();
    railInputs = [...document.querySelectorAll('#bd-left .bd-card-body:not([hidden]) .bd-layer .md-switch')];
    let lastGroup;
    rail.innerHTML = railInputs.map((input, i) => {
      const row = input.closest('.bd-layer');
      const group = row.closest('.bd-layer-group');
      const sep = i && group !== lastGroup ? '<span class="bd-rail-sep" aria-hidden="true"></span>' : '';
      lastGroup = group;
      return `${sep}<button type="button" class="bd-rail-btn" data-rail="${i}" style="--layer-color:${row.style.getPropertyValue('--layer-color')}" aria-pressed="${input.checked}" aria-label="${esc(railName(input))}">${row.querySelector('.md-layer-icon').innerHTML}</button>`;
    }).join('');
  }
  function syncRail() {
    rail.querySelectorAll('[data-rail]').forEach((button) => button.setAttribute('aria-pressed', String(railInputs[button.dataset.rail].checked)));
    if (tipButton) showTip(tipButton);
  }
  // ---------- Tooltip: tên lớp · số lượng · đang bật / tắt, đặt bên phải nút ----------
  function showTip(button) {
    const input = railInputs[button.dataset.rail];
    const detail = input.closest('.bd-layer').querySelector('.md-layer-text small')?.textContent.trim();
    tip.innerHTML = `<strong>${esc(railName(input))}</strong><span>${detail ? `${esc(detail)} · ` : ''}${input.checked ? 'Đang bật' : 'Đang tắt'}</span>`;
    const rect = button.getBoundingClientRect();
    tip.style.left = `${Math.round(rect.right + 10)}px`;
    tip.style.top = `${Math.round(rect.top + rect.height / 2)}px`;
    tip.hidden = false;
    if (tipButton && tipButton !== button) tipButton.removeAttribute('aria-describedby');
    button.setAttribute('aria-describedby', tip.id);
    tipButton = button;
  }
  function hideTip() {
    tip.hidden = true;
    tipButton?.removeAttribute('aria-describedby');
    tipButton = null;
  }
  rail.addEventListener('click', (event) => {
    const button = event.target.closest('[data-rail]');
    if (!button) return;
    const input = railInputs[button.dataset.rail];
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  rail.addEventListener('mouseover', (event) => { const button = event.target.closest('[data-rail]'); if (button && button !== tipButton) showTip(button); });
  rail.addEventListener('mouseout', (event) => { if (tipButton && !tipButton.contains(event.relatedTarget) && !tipButton.matches(':focus-visible')) hideTip(); });
  rail.addEventListener('focusin', (event) => { const button = event.target.closest('[data-rail]'); if (button) showTip(button); });
  rail.addEventListener('focusout', hideTip);
  rail.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideTip(); });
  $('#bd-left').addEventListener('scroll', hideTip);
  $('#bd-left').addEventListener('change', syncRail);
  $('#bd-reset').addEventListener('click', syncRail);
  $('[data-panel-toggle="left"]').addEventListener('click', hideTip);
  renderRail();

  dependentFilters();
  initMap();
  buildExtraLayers();
  applyExtra();
  applyFilters();
  // ---------- Tab Nguồn lực (ban-do-so-nguon-luc.js): dùng chung bản đồ, thông báo, tiện ích và sự kiện đổi tab ----------
  window.DigitalMapResources?.init({ map, $, esc, icon, fmt, toast, dateText, pad, data, onTab: (listener) => tabListeners.push(listener), renderRail, syncRail, closeOverviewPopup: closePopup, isActive: () => currentTab === 'resources' });
})();
