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
    basic: { name: 'Bản đồ cơ bản', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: '' },
    road: { name: 'Bản đồ đường', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: 'is-road' },
    satellite: { name: 'Bản đồ vệ tinh', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: 'is-satellite' },
    dark: { name: 'Bản đồ tối', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri', preview: 'is-dark' },
  };
  let baseKey = 'basic';
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
  document.querySelectorAll('dialog').forEach((dialog) => {
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
  function detailHtml(record) {
    const rows = [];
    if (record.layer === 'offices') rows.push(['Tên trụ sở', esc(record.name)], ['Người đứng đầu', esc(record.leader || '—')], ['Số điện thoại', esc(record.phone || '—')], ['Địa điểm', esc(record.address || '—')]);
    if (record.layer === 'clubs') rows.push(['Tên đội, CLB', esc(record.name)], ['Người đại diện, Chủ nhiệm', esc(record.leader || '—')], ['Điện thoại', esc(record.phone || '—')], ['Đơn vị quản lý', esc(unitName(record.unitId))], ['Địa chỉ', esc(record.address || '—')], ['Lĩnh vực hoạt động', tags(record.fields)]);
    if (record.layer === 'volunteers') {
      const unit = data.units.find((u) => u.id === record.unitId);
      const manager = unit?.club ? `${unit.name} – ${unitName(unit.parentId)}` : unitName(record.unitId);
      rows.push(['Họ và tên', esc(record.name)], ['Điện thoại', esc(record.phone || '—')], ['Đơn vị quản lý', esc(manager)], ['Chuyên môn', tags(record.skills)], ['Trực tuyến lần cuối', esc(dateText(record.lastSeen))], ['Địa chỉ', esc(record.address || '—')]);
    }
    if (['police', 'medical'].includes(record.layer)) rows.push(['Tên trụ sở', esc(record.name)], ['Loại trụ sở', esc(M.layers[record.layer].name)], ['Địa chỉ', esc(record.address || '—')]);
    return `<dl class="bd-detail">${rows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  }
  const mayView = (record) => ['offices', 'clubs', 'volunteers'].includes(record.layer) && source.canViewRecord?.(record, data.context) === true;
  const viewLabel = (record) => record.layer === 'volunteers' ? 'Xem hồ sơ' : record.layer === 'clubs' ? 'Xem thông tin đội, CLB' : 'Xem thông tin đơn vị';
  function popupHtml(record) {
    const layer = M.layers[record.layer];
    return `<div class="bd-popup-kind" style="--layer-color:${layer.color}">${icon(layer.icon)}${esc(layer.name)}</div><h3>${esc(record.name)}</h3>${detailHtml(record)}<div class="bd-popup-actions">${record.layer !== 'volunteers' ? `<button type="button" class="button ${mayView(record) ? 'button-outline' : 'button-primary'}" data-directions="${esc(record.id)}">Chỉ đường</button>` : ''}${mayView(record) ? `<button type="button" class="button button-primary" data-profile="${esc(record.id)}">${viewLabel(record)}</button>` : ''}</div>`;
  }
  function showPopup(latlng, html) {
    popup = L.popup({ className: 'bd-popup', maxWidth: 330, minWidth: 240, maxHeight: Math.max(150, Math.min(520, map.getSize().y - 115)), offset: window.innerWidth > 900 ? [180, 100] : [0, -30], autoPanPaddingTopLeft: [40, 16], autoPanPaddingBottomRight: [65, 25], closeButton: true, autoPan: true }).setLatLng(latlng).setContent(html).openOn(map);
    const element = popup.getElement();
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-label', element.querySelector('h3')?.textContent || 'Thông tin trên bản đồ');
    const close = element.querySelector('.leaflet-popup-close-button');
    close?.setAttribute('aria-label', 'Đóng thông tin');
    close?.focus({ preventScroll: true });
  }
  async function openDetail(record, { isolate = false } = {}) {
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
    if (!fresh || !M.eligible(fresh, data.context, data.units) || !M.matches(fresh, state, data.units) || !state.layers.has(fresh.layer)) { exitFocus(); toast('Bản ghi không còn trong kết quả hiện tại.'); return; }
    if (!map) { showRecordDialog(fresh); return; }
    const marker = markers.get(fresh.id);
    if (ticket !== requestId) return;
    showPopup([fresh.lat, fresh.lng], popupHtml(fresh));
    const visibleMarker = groups.get(fresh.layer)?.getVisibleParent?.(marker) || marker;
    highlight(visibleMarker?.getElement());
  }
  function showPointList(rows, latlng, element) {
    closePopup();
    const title = new Set(rows.map((r) => r.address)).size === 1 ? rows[0].address : 'Danh sách tại điểm';
    const body = M.order.map((key) => {
      const items = rows.filter((r) => r.layer === key);
      if (!items.length) return '';
      const secondary = (r) => key === 'offices' ? r.leader || '—' : key === 'clubs' ? (r.fields || []).join('; ') || '—' : key === 'volunteers' ? (r.skills || []).join('; ') || '—' : r.address || '—';
      return `<h4>${dot(key)}${esc(M.layers[key].name)}<span>Số lượng: ${fmt.format(items.length)}</span></h4><table class="bd-popup-table"><thead><tr>${M.layers[key].columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${items.map((r) => `<tr><td><button type="button" data-point-record="${esc(r.id)}">${esc(r.name)}</button></td><td>${esc(secondary(r))}</td></tr>`).join('')}</tbody></table>`;
    }).join('');
    showPopup(latlng, `<h3>${esc(title)}</h3><div class="bd-popup-group">${body}</div>`);
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
    rows.forEach((record) => {
      const layer = M.layers[record.layer];
      const marker = L.marker([record.lat, record.lng], { title: record.name, alt: record.name, recordId: record.id,
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
    $('#bd-map-notice').hidden = true;
    const base = bases[key];
    let succeeded = 0, failed = 0;
    const current = L.tileLayer(base.url, { maxZoom: 19, maxNativeZoom: key === 'road' ? 18 : 19, attribution: base.attribution });
    tile = current;
    current.on('tileload', () => { succeeded += 1; });
    current.on('tileerror', () => {
      failed += 1;
      if (tile === current && !succeeded) mapNotice(`Không tải được ${base.name}. Vui lòng thử lại hoặc chọn nền bản đồ khác.`);
    });
    current.on('load', () => { if (tile === current && succeeded && !failed) $('#bd-map-notice').hidden = true; });
    current.addTo(map);
    document.querySelectorAll('[data-base]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.base === key)));
  }
  function initMap() {
    if (!window.L) { mapNotice('Không tải được bản đồ. Vui lòng kiểm tra kết nối và thử lại.'); return; }
    map = L.map('digital-map', { zoomControl: false, minZoom: 3, maxZoom: 19, attributionControl: true, fadeAnimation: false, zoomAnimation: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    map.attributionControl.setPrefix(false);
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
    M.order.forEach((key) => {
      const group = L.markerClusterGroup ? L.markerClusterGroup({ maxClusterRadius: 42, showCoverageOnHover: false, zoomToBoundsOnClick: false, spiderfyOnMaxZoom: false, animate: false,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount(); const size = count > 99 ? 48 : count > 9 ? 42 : 36;
          return L.divIcon({ className: 'bd-cluster-host', html: `<span class="bd-cluster" style="--layer-color:${M.layers[key].color}" aria-label="${esc(M.layers[key].name)}: ${fmt.format(count)} bản ghi">${fmt.format(count)}</span>`, iconSize: [size, size] });
        },
      }) : L.layerGroup();
      group.on('clusterclick', (event) => {
        const ids = new Set(event.layer.getAllChildMarkers().map((marker) => marker.options.recordId));
        const rows = result.rows.filter((r) => ids.has(r.id));
        if (!rows.length) return;
        const same = rows.every((r) => coordinatesEqual(r, rows[0]));
        if (map.getZoom() >= map.getMaxZoom() || same) {
          const all = same ? result.rows.filter((r) => coordinatesEqual(r, rows[0])) : rows;
          showPointList(all, event.layer.getLatLng(), event.layer.getElement());
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
    map.on('zoomend', () => { $('#bd-zoom-in').disabled = map.getZoom() >= map.getMaxZoom(); $('#bd-zoom-out').disabled = map.getZoom() <= map.getMinZoom(); });
    changeBase('basic');
    map.fitBounds(data.context.national ? [[8.3, 102], [23.5, 110]] : data.context.bounds, { ...pad(), animate: false });
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
    $('#bd-total').textContent = `${fmt.format(result.total)} bản ghi`;
    $('#bd-empty').hidden = result.total > 0;
    $('#bd-empty').textContent = state.layers.size ? 'Không có dữ liệu phù hợp với điều kiện lọc.' : 'Chưa chọn lớp dữ liệu nào.';
    $('#bd-rows').innerHTML = result.rows.slice(0, limit).map((r) => `<tr class="${r.id === state.focusedId ? 'is-active' : ''}"><td><button type="button" data-record="${esc(r.id)}" aria-pressed="${r.id === state.focusedId}">${dot(r.layer)}<span>${esc(r.name)}</span></button></td><td>${esc(r.address || '—')}</td></tr>`).join('');
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
  // ---------- Lớp bản đồ: chia nhóm, mỗi dòng = biểu tượng màu lớp (không nền) · tên + số bản ghi · công tắc ----------
  const LAYER_GROUPS = [
    ['Tổ chức hội', [['offices', 'Trụ sở hội'], ['clubs', 'Đội, CLB tình nguyện viên']]],
    ['Con người', [['volunteers', 'Tình nguyện viên'], ['vulnerable', 'Người yếu thế']]],
    ['Hạ tầng hỗ trợ', [['medical', 'Bệnh viện, cơ sở y tế'], ['police', 'Công an'], ['fire', 'Cơ sở PCCC'], ['shelters', 'Trường học, nhà văn hóa, nơi sơ tán, UBND']]],
    ['Hạ tầng nhân đạo', [['goods', 'Điểm tập kết hàng hóa'], ['relief', 'Điểm cứu trợ'], ['kitchens', 'Bếp ăn'], ['blood', 'Điểm hiến máu']]],
    ['Chương trình', [['programs', 'Địa bàn triển khai chương trình thiện nguyện']]],
  ];
  $('#bd-layers').insertAdjacentHTML('beforeend', LAYER_GROUPS.map(([title, items], g) => `<div class="bd-layer-group" role="group" aria-labelledby="bd-layer-group-${g}"><h3 class="bd-layer-group-title"><button type="button" class="bd-layer-group-toggle" id="bd-layer-group-${g}" aria-expanded="true" aria-controls="bd-layer-group-body-${g}">${esc(title)}${icon('chevron-down')}</button></h3><div class="bd-layer-group-body" id="bd-layer-group-body-${g}">${items.map(([key, label]) => `<label class="md-layer bd-layer" style="--layer-color:${M.layers[key].color}"><span class="md-layer-icon" aria-hidden="true">${icon(M.layers[key].icon)}</span><span class="md-layer-text"><strong class="bd-layer-name">${esc(label)}</strong><small><span data-count="${key}">0</span> bản ghi</small></span><input class="md-switch" type="checkbox" data-layer="${key}" ${state.layers.has(key) ? 'checked' : ''} /></label>`).join('')}</div></div>`).join(''));
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
  function dependentFilters() {
    $('#bd-unit-field').hidden = !state.layers.size;
    if (!state.layers.size) { state.unit = ''; $('#bd-unit-picker').open = false; }
    for (const [layer, kind] of [['clubs', 'fields'], ['volunteers', 'skills']]) {
      const hidden = !state.layers.has(layer);
      $(`#bd-${kind}-field`).hidden = hidden;
      if (hidden) { state[kind] = []; $(`#bd-${kind}-picker`).open = false; }
      renderMulti(kind);
    }
    renderUnits();
  }
  function updateWards() {
    $('#bd-ward').replaceChildren(new Option('Tất cả xã, phường', ''));
    $('#bd-ward').disabled = !state.province;
    data.locations.find((p) => p.id === state.province)?.wards.forEach((w) => $('#bd-ward').add(new Option(w.name, w.id)));
  }
  function fitRegion() {
    if (!map) return;
    if (!state.province) { map.fitBounds(data.context.national ? [[8.3, 102], [23.5, 110]] : data.context.bounds, { ...pad(), animate: false }); return; }
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
    document.getElementById(button.getAttribute('aria-controls')).inert = isPanelClosed(document.getElementById(button.getAttribute('aria-controls')));
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
    $('#bd-record-title').textContent = record.layer === 'volunteers' ? 'Thông tin tình nguyện viên' : ['police', 'medical'].includes(record.layer) ? 'Thông tin địa điểm' : 'Thông tin tổ chức';
    $('#bd-record-content').innerHTML = `<h3>${esc(record.name)}</h3>${detailHtml(record)}`;
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
    if (point) { const record = result.rows.find((r) => r.id === point.dataset.pointRecord); if (record) openDetail(record); }
    if (route) directions(route.dataset.directions);
    if (profile) openProfile(profile.dataset.profile);
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
    setMenu(false); setBases(false);
    document.querySelectorAll('.bd-multi[open]').forEach((details) => { details.open = false; details.querySelector('summary').focus(); });
    if (document.body.classList.contains('bd-fullscreen')) { fullscreen(false); $('#bd-fullscreen').focus(); }
    else if (state.focusedId) exitFocus(); else closePopup();
  });
  document.addEventListener('click', (event) => { document.querySelectorAll('.bd-multi[open]').forEach((details) => { if (!details.contains(event.target)) details.open = false; }); });
  // ==================== LỚP BẢN ĐỒ: tab Tổng quan · Nguồn lực · Thời tiết ====================
  // Nguồn lực, Thời tiết là lớp riêng (window.DigitalMapExtra), không vào Danh sách dữ liệu và số lượng của 5 lớp UC-BD.
  // ---------- Tab: bấm hoặc phím ← → Home End để chuyển ----------
  const tabs = [...document.querySelectorAll('.bd-tabs [role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
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
  // ---------- Dữ liệu, trạng thái bật / lọc ----------
  const X = window.DigitalMapExtra || { statuses: {}, resources: {}, areas: [], weather: [] };
  const STATUS_ORDER = Object.keys(X.statuses); // nặng → nhẹ
  const extraDefaults = () => ({ relief: false, alert: false, watch: false, statuses: new Set(Object.keys(X.statuses)), resources: new Set(Object.keys(X.resources)) });
  let extra = extraDefaults();
  const WEATHER_KINDS = [['alert', 'Cảnh báo nguy hiểm', 'rain', '#e5232f'], ['watch', 'Cần theo dõi', 'cloud', '#2f6fe4']];
  $('#bd-resource-filter').innerHTML = Object.entries(X.resources).map(([key, r]) => `<button type="button" class="md-chip" data-res="${key}" aria-pressed="true"><span class="md-chip-icon is-${key}">${icon(r.icon)}</span>${esc(r.label)}</button>`).join('');
  $('#bd-status-filter').innerHTML = Object.entries(X.statuses).map(([key, s]) => `<label><span class="md-dot is-${key}" aria-hidden="true"></span>${esc(s.label)}<input type="checkbox" value="${key}" checked /></label>`).join('');
  $('#bd-weather-layers').innerHTML = WEATHER_KINDS.map(([key, label, ic, color]) => `<label class="md-layer bd-layer" style="--layer-color:${color}"><span class="md-layer-icon" aria-hidden="true">${icon(ic)}</span><span class="md-layer-text"><strong class="bd-layer-name">${label}</strong><small>${esc(X.weather.filter((w) => (key === 'alert') === w.alert).map((w) => w.text).join(', '))}</small></span><input class="md-switch" type="checkbox" data-extra="${key}" /></label>`).join('');
  // ---------- Lớp trên bản đồ: vùng màu theo tình trạng + ghim theo loại nguồn lực (gom cụm); nhãn cảnh báo thời tiết ----------
  let blobGroup; let pinCluster; let reliefGroup; const weatherGroups = {};
  const reliefPopup = (a) => `
    <p class="md-pop-title">${esc(a.province)}</p>
    <p class="md-pop-sub">${esc(a.district)} · ${fmt.format(a.people)} người cần hỗ trợ</p>
    <span class="md-pill is-${a.status}">${icon('alert')}${esc(X.statuses[a.status].label)}</span>
    <div class="md-pop-rows">${a.needs.map(({ res, have, need }) => {
      const short = need - have;
      return `<div class="md-pop-row"><span class="md-chip-icon is-${res}">${icon(X.resources[res].icon)}</span>
        <span><small>${esc(X.resources[res].label)}</small><strong>${fmt.format(have)} ${X.resources[res].unit}</strong></span>
        <span class="md-pop-short${short <= 0 ? ' is-ok' : ''}">${short > 0 ? `(còn thiếu ${fmt.format(short)})` : '(đã đủ)'}</span></div>`;
    }).join('')}</div>
    <button type="button" class="md-pop-btn" data-panel="Chi tiết địa bàn ${esc(a.name)}">Xem chi tiết${icon('arrow')}</button>`;
  function buildExtraLayers() {
    if (!map || !window.L) return;
    blobGroup = L.layerGroup();
    pinCluster = L.markerClusterGroup
      ? L.markerClusterGroup({
        maxClusterRadius: 44, showCoverageOnHover: false, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 8,
        iconCreateFunction: (cluster) => {
          const worst = cluster.getAllChildMarkers().map((m) => m.options.status).sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b))[0];
          const count = cluster.getChildCount();
          return L.divIcon({ className: '', html: `<span class="md-cluster st-${worst}" title="${count} địa bàn gần nhau, bấm để xem">${count}</span>`, iconSize: [40, 40] });
        },
      })
      : L.layerGroup();
    reliefGroup = L.layerGroup([blobGroup, pinCluster]);
    X.areas.forEach((a) => {
      a.blob = L.circle([a.lat, a.lng], { radius: 15000 * Math.sqrt(a.people / 1000), stroke: false, fillColor: X.statuses[a.status].color, fillOpacity: 0.42, className: 'md-area-blob', interactive: false });
      const pinIcon = a.kind === 'need' ? 'alert-mark' : a.kind === 'program' ? 'heart-solid' : X.resources[a.res].icon;
      a.pin = L.marker([a.lat, a.lng], {
        title: `${a.name} · ${X.statuses[a.status].label}`, riseOnHover: true, status: a.status,
        icon: L.divIcon({ className: 'md-pin-wrap', html: `<span class="md-pin st-${a.status}">${icon(pinIcon)}</span>`, iconSize: [32, 32], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
      }).bindPopup(reliefPopup(a), { className: 'md-popup', maxWidth: 300, autoPanPaddingTopLeft: [40, 16], autoPanPaddingBottomRight: [72, 40] });
    });
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
    const pinned = (a) => extra.statuses.has(a.status) && extra.resources.has(a.res);
    $('#bd-relief-count').textContent = fmt.format(X.areas.filter(pinned).length);
    if (!reliefGroup) return;
    X.areas.forEach((a) => { showIn(blobGroup, a.blob, extra.statuses.has(a.status)); showIn(pinCluster, a.pin, pinned(a)); });
    showIn(map, reliefGroup, extra.relief);
    WEATHER_KINDS.forEach(([key]) => showIn(map, weatherGroups[key], extra[key]));
  }
  // ---------- Thao tác: công tắc lớp, thẻ loại nguồn lực, ô tình trạng; Đặt lại đưa về mặc định (tắt) ----------
  document.querySelectorAll('[data-extra]').forEach((input) => input.addEventListener('change', () => { extra[input.dataset.extra] = input.checked; applyExtra(); }));
  $('#bd-resource-filter').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-res]');
    if (!chip) return;
    const on = chip.getAttribute('aria-pressed') !== 'true';
    chip.setAttribute('aria-pressed', String(on));
    if (on) extra.resources.add(chip.dataset.res); else extra.resources.delete(chip.dataset.res);
    applyExtra();
  });
  $('#bd-status-filter').addEventListener('change', (event) => {
    if (event.target.checked) extra.statuses.add(event.target.value); else extra.statuses.delete(event.target.value);
    applyExtra();
  });
  $('#bd-reset').addEventListener('click', () => {
    extra = extraDefaults();
    document.querySelectorAll('[data-extra]').forEach((input) => { input.checked = false; });
    document.querySelectorAll('#bd-resource-filter [data-res]').forEach((chip) => chip.setAttribute('aria-pressed', 'true'));
    document.querySelectorAll('#bd-status-filter input').forEach((input) => { input.checked = true; });
    applyExtra();
  });

  dependentFilters();
  initMap();
  buildExtraLayers();
  applyExtra();
  applyFilters();
})();
