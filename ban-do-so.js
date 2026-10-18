// ==================== TRANG BẢN ĐỒ SỐ — BẢN ĐỒ NHÂN ĐẠO QUỐC GIA ====================
// Nền bản đồ: Esri World Ocean Base / World Imagery (không cần API key). Toàn bộ số liệu trên trang là DỮ LIỆU MINH HỌA (tên địa bàn theo đơn vị hành chính cũ, vị trí gần đúng).
// Khi triển khai thật phải lấy từ hệ thống cảnh báo / điều phối chính thức.

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

// ==================== DATA: tình trạng, loại nguồn lực, địa bàn (minh họa) ====================
const STATUS = {
  critical: { label: 'Thiếu nghiêm trọng', color: '#e5232f', cover: 0.38 },
  short: { label: 'Thiếu', color: '#f39a2b', cover: 0.62 },
  near: { label: 'Gần cân bằng', color: '#f2c230', cover: 0.88 },
  enough: { label: 'Đủ', color: '#22a06b', cover: 1 },
  surplus: { label: 'Dư nguồn lực', color: '#2f6fe4', cover: 1.25 },
};
const RESOURCE = {
  water: { label: 'Nước uống', icon: 'drop', unit: 'thùng' },
  food: { label: 'Lương thực', icon: 'wheat', unit: 'suất' },
  medicine: { label: 'Thuốc men', icon: 'medkit', unit: 'lọ/gói' },
  volunteer: { label: 'Tình nguyện viên', icon: 'user', unit: 'người' },
  supplies: { label: 'Vật tư thiết yếu', icon: 'box', unit: 'bộ' },
  other: { label: 'Khác', icon: 'dots', unit: 'đơn vị' },
};
// [tỉnh, huyện/xã, vĩ độ, kinh độ, tình trạng, số người cần hỗ trợ, nguồn lực chính, loại ghim]
const AREAS = [
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
  const cover = STATUS[status].cover;
  const waterNeed = Math.round((people * 1.6) / 100) * 100;
  const foodNeed = Math.round(people / 100) * 100;
  return {
    id: index, province, district, name: `${province} - ${district}`, lat, lng, status, people, res, kind,
    needs: [
      { res: 'water', have: Math.round((waterNeed * cover) / 100) * 100, need: waterNeed },
      { res: 'food', have: Math.round((foodNeed * cover) / 100) * 100, need: foodNeed },
    ],
  };
});
// Địa bàn minh họa trong ảnh mẫu: số liệu cố định để khớp bố cục.
Object.assign(AREAS[1], { needs: [{ res: 'water', have: 12000, need: 19500 }, { res: 'food', have: 8000, need: 12200 }] });
const VULNERABLE = [[22.1, 104.6], [20.9, 105.2], [19.0, 105.3], [16.9, 106.9], [15.6, 108.2], [13.9, 108.0], [10.1, 105.6], [9.2, 105.3]];
const WEATHER = [
  { lat: 22.25, lng: 103.75, text: 'Lũ quét', alert: true },
  { lat: 16.45, lng: 108.1, text: 'Mưa lớn', alert: true },
  { lat: 15.2, lng: 111.0, text: 'Áp thấp nhiệt đới', alert: true },
  { lat: 11.6, lng: 109.25, text: 'Nắng hạn', alert: false },
  { lat: 9.75, lng: 106.9, text: 'Triều cường', alert: false },
];
const REGION = { north: (a) => a.lat >= 19.8, central: (a) => a.lat < 19.8 && a.lat >= 11.4, south: (a) => a.lat < 11.4, all: () => true };

// ==================== HELPERS ====================
const fmt = new Intl.NumberFormat('vi-VN');
const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const state = { statuses: new Set(Object.keys(STATUS)), resources: new Set(Object.keys(RESOURCE)), tab: 'critical', query: '', region: 'all', active: null };
const visible = (area) => state.statuses.has(area.status) && REGION[state.region](area);

const toast = document.querySelector('.md-toast');
let toastTimer;
const showToast = (message) => {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
};

// ==================== SECTION: DANH SÁCH ĐỊA BÀN — tab, tìm kiếm ====================
const list = document.querySelector('#area-list');
const tabMatch = { critical: (a) => a.status === 'critical', short: (a) => a.status === 'short', near: (a) => a.status === 'near', other: (a) => a.status === 'enough' || a.status === 'surplus' };
const LIST_LIMIT = 5; // cột phải chỉ hiện top 5 để vừa khung (đầy đủ ở "Xem tất cả"); đang tìm kiếm thì hiện hết kết quả
const renderList = () => {
  const query = fold(state.query.trim());
  const rows = AREAS
    .filter((area) => visible(area) && tabMatch[state.tab](area) && (!query || fold(area.name).includes(query)))
    .sort((a, b) => b.people - a.people)
    .slice(0, query ? undefined : LIST_LIMIT);
  list.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('li');
    empty.className = 'md-areas-empty';
    empty.textContent = 'Không có địa bàn phù hợp với bộ lọc hiện tại.';
    list.append(empty);
    return;
  }
  rows.forEach((area, index) => {
    const item = document.createElement('li');
    item.innerHTML = `<button type="button" class="md-area${state.active === area.id ? ' is-active' : ''}" data-area="${area.id}">
      <span class="md-area-rank is-${area.status}">${index + 1}</span>
      <span class="md-area-name"><strong>${area.name}</strong><small>${fmt.format(area.people)} người cần hỗ trợ</small></span>
      <span class="md-pill is-${area.status}">${STATUS[area.status].label}</span>${icon('chevron-right')}</button>`;
    list.append(item);
  });
};
document.querySelector('.md-tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('[data-tab]');
  if (!tab) return;
  state.tab = tab.dataset.tab;
  document.querySelectorAll('.md-tabs [data-tab]').forEach((button) => button.setAttribute('aria-selected', String(button === tab)));
  renderList();
});

// ---------- Ô chọn địa bàn (cột trái) ----------
const areaSelect = document.querySelector('#area-filter');
[...AREAS].sort((a, b) => a.name.localeCompare(b.name, 'vi')).forEach((area) => areaSelect.add(new Option(area.name, area.id)));

// ==================== SECTION: BẢN ĐỒ — Leaflet ====================
const mapCard = document.querySelector('.md-map');
const VN_BOUNDS = [[8.4, 102.1], [23.4, 114.4]];
// Chừa chỗ cho nút nền (trên), cột nút điều khiển (phải) và chú giải (dưới — theo chiều cao thật của chú giải lúc đó).
const viewPad = () => {
  const legendBox = document.querySelector('.md-legend');
  const bottom = legendBox ? Math.min(legendBox.offsetHeight + 28, mapCard.clientHeight * 0.45) : 132;
  return { paddingTopLeft: [24, 76], paddingBottomRight: [72, Math.max(bottom, 60)] };
};
let map = null;
const groups = {};
let blobGroup = null; // vùng màu quanh địa bàn
let pinCluster = null; // ghim điều phối, gom cụm khi gần nhau
const STATUS_ORDER = ['critical', 'short', 'near', 'enough', 'surplus']; // nặng → nhẹ
const markers = new Map(); // area.id → { blob, pin }

const popupHtml = (area) => `
  <p class="md-pop-title">${area.province}</p>
  <p class="md-pop-sub">${area.district} · ${fmt.format(area.people)} người cần hỗ trợ</p>
  <span class="md-pill is-${area.status}">${icon('alert')}${STATUS[area.status].label}</span>
  <div class="md-pop-rows">${area.needs.map(({ res, have, need }) => {
    const short = need - have;
    return `<div class="md-pop-row"><span class="md-chip-icon is-${res}">${icon(RESOURCE[res].icon)}</span>
      <span><small>${RESOURCE[res].label}</small><strong>${fmt.format(have)} ${RESOURCE[res].unit}</strong></span>
      <span class="md-pop-short${short <= 0 ? ' is-ok' : ''}">${short > 0 ? `(còn thiếu ${fmt.format(short)})` : '(đã đủ)'}</span></div>`;
  }).join('')}</div>
  <button type="button" class="md-pop-btn" data-panel="Chi tiết địa bàn ${area.name}">Xem chi tiết${icon('arrow')}</button>`;

const focusArea = (id, { fly = true, pan = true } = {}) => {
  const area = AREAS[id];
  if (!area || !map) return;
  state.active = area.id;
  const entry = markers.get(area.id);
  // Ghim có thể đang nằm trong một cụm → mở cụm (phóng to vừa đủ) rồi mới mở popup
  const open = () => {
    if (!entry || !map.hasLayer(groups.relief) || !pinCluster.hasLayer(entry.pin)) return;
    pinCluster.zoomToShowLayer(entry.pin, () => { entry.pin.getPopup().options.autoPan = pan; entry.pin.openPopup(); });
  };
  if (fly) { map.closePopup(); map.once('moveend', open); map.flyTo([area.lat, area.lng], Math.max(map.getZoom(), 7), { duration: 0.8 }); } else open(); // mở popup sau khi bay xong để tự canh vừa khung
  document.querySelectorAll('.md-pin-wrap').forEach((el) => el.classList.toggle('is-active', el.dataset.area === String(area.id)));
  renderList();
};

const applyFilters = () => {
  if (!map) return;
  AREAS.forEach((area) => {
    const { blob, pin } = markers.get(area.id);
    const show = visible(area);
    const toggle = (group, layer, wanted) => {
      if (wanted && !group.hasLayer(layer)) group.addLayer(layer);
      if (!wanted && group.hasLayer(layer)) group.removeLayer(layer);
    };
    toggle(blobGroup, blob, show);
    toggle(pinCluster, pin, show && state.resources.has(area.res));
  });
};

// ---------- Chú giải: chỉ hiện nhóm của lớp đang bật + đếm số lớp; thu gọn được ----------
const legend = document.querySelector('.md-legend');
const updateLegend = () => {
  const on = [...document.querySelectorAll('[data-layer]')].filter((input) => input.checked).map((input) => input.dataset.layer);
  legend.querySelectorAll('[data-legend]').forEach((group) => { group.hidden = !on.includes(group.dataset.legend); });
  legend.querySelector('.md-legend-empty').hidden = on.length > 0;
  document.getElementById('md-legend-count').textContent = on.length ? `${on.length} lớp đang bật` : 'Chưa bật lớp nào';
};
legend.querySelector('.md-legend-head').addEventListener('click', (event) => {
  const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
  event.currentTarget.setAttribute('aria-expanded', String(open));
  legend.classList.toggle('is-collapsed', !open);
});
// Điện thoại: chú giải thu gọn sẵn để không che bản đồ
if (window.matchMedia('(max-width: 700px)').matches) legend.querySelector('.md-legend-head').click();
updateLegend();

const initMap = () => {
  map = L.map('relief-map', { zoomControl: false, attributionControl: true, minZoom: 4, maxZoom: 12, zoomSnap: 0.25, worldCopyJump: false });
  map.attributionControl.setPrefix(false);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
  const base = {
    map: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 10, attribution: 'Nền bản đồ © Esri, GEBCO, NOAA' }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Ảnh vệ tinh © Esri' }),
  };
  base.map.addTo(map);
  map.fitBounds(VN_BOUNDS, viewPad());

  // ---------- Nhãn tự đặt: quốc gia, biển, quần đảo, thành phố (không dùng nhãn của nền bản đồ) ----------
  const label = (lat, lng, html, cls) => L.marker([lat, lng], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: `<span class="map-label ${cls}">${html}</span>`, iconSize: null }) });
  const labels = L.layerGroup([
    label(23.9, 108.3, 'Trung Quốc', ''), label(20.0, 102.4, 'Lào', ''), label(15.6, 101.4, 'Thái Lan', ''), label(12.7, 104.2, 'Campuchia', ''),
    label(14.6, 112.4, 'Biển Đông', 'is-sea'),
    label(15.75, 111.9, 'QĐ. Hoàng Sa<br><small>(Việt Nam)</small>', 'is-island'),
    label(8.95, 114.0, 'QĐ. Trường Sa<br><small>(Việt Nam)</small>', 'is-island'),
    label(21.03, 105.85, 'Hà Nội', 'is-city'), label(16.05, 108.2, 'Đà Nẵng', 'is-city'), label(10.78, 106.7, 'TP. Hồ Chí Minh', 'is-city'),
  ]).addTo(map);
  const islet = (lat, lng) => L.marker([lat, lng], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: '<span class="map-islet" style="display:block"></span>', iconSize: [4, 4] }) });
  L.layerGroup([[16.5, 111.6], [16.8, 112.3], [16.3, 112.0], [16.95, 111.95], [16.6, 111.2], [10.4, 114.3], [10.0, 113.9], [9.6, 114.6], [10.8, 114.9], [8.65, 111.9], [9.9, 115.5]].map(([a, b]) => islet(a, b))).addTo(map);

  // ---------- Lớp điều phối: vùng màu theo tình trạng + ghim ----------
  // Quy ước dễ đọc: MÀU ghim = mức cân đối (khớp chú giải), HÌNH trong ghim = loại hỗ trợ cần.
  // Ghim gần nhau gom thành vòng tròn có số (màu theo địa bàn nặng nhất trong cụm), bấm vào thì phóng to.
  const sidePopup = mapCard.clientWidth >= 640;
  blobGroup = L.layerGroup();
  pinCluster = window.L.markerClusterGroup
    ? L.markerClusterGroup({
      maxClusterRadius: 44, showCoverageOnHover: false, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 8,
      iconCreateFunction: (cluster) => {
        const worst = cluster.getAllChildMarkers().map((m) => m.options.status).sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b))[0];
        const count = cluster.getChildCount();
        return L.divIcon({ className: '', html: `<span class="md-cluster st-${worst}" title="${count} địa bàn gần nhau, bấm để xem">${count}</span>`, iconSize: [40, 40] });
      },
    })
    : L.layerGroup(); // dự phòng khi không tải được plugin gom cụm
  if (!pinCluster.zoomToShowLayer) pinCluster.zoomToShowLayer = (layer, done) => done();
  groups.relief = L.layerGroup([blobGroup, pinCluster]).addTo(map);
  AREAS.forEach((area) => {
    const blob = L.circle([area.lat, area.lng], {
      radius: 15000 * Math.sqrt(area.people / 1000), stroke: false, fillColor: STATUS[area.status].color, fillOpacity: 0.42, className: 'md-area-blob',
    });
    const pinIcon = area.kind === 'need' ? 'alert-mark' : area.kind === 'program' ? 'heart-solid' : RESOURCE[area.res].icon;
    const pin = L.marker([area.lat, area.lng], {
      title: `${area.name} · ${STATUS[area.status].label}`, riseOnHover: true, status: area.status,
      icon: L.divIcon({ className: 'md-pin-wrap', html: `<span class="md-pin st-${area.status}">${icon(pinIcon)}</span>`, iconSize: [32, 32], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
    }).bindPopup(popupHtml(area), {
      // Popup đặt bên phải ghim (như ảnh mẫu), mép trên ngang đầu ghim.
      // Màn hẹp: popup phía trên ghim như mặc định.
      className: sidePopup ? 'md-popup is-side' : 'md-popup', maxWidth: 300, offset: sidePopup ? [176, 262] : [0, 0], autoPanPaddingTopLeft: [24, 76], autoPanPaddingBottomRight: [72, 132],
    });
    pin.on('add', () => { const el = pin.getElement(); if (el) el.dataset.area = area.id; });
    pin.on('click', () => focusArea(area.id, { fly: false }));
    blob.on('click', () => focusArea(area.id, { fly: false }));
    markers.set(area.id, { blob, pin });
  });
  applyFilters();

  // ---------- Lớp thời tiết & người yếu thế (tắt sẵn) ----------
  // Thời tiết: nhãn chữ luôn nằm trên cùng, không che bởi ghim; người yếu thế: ô vuông tím, nằm dưới ghim
  groups.weather = L.layerGroup(WEATHER.map((w) => L.marker([w.lat, w.lng], {
    keyboard: false, interactive: false, zIndexOffset: 2000,
    icon: L.divIcon({ className: '', html: `<span class="md-weather${w.alert ? ' is-alert' : ''}">${icon(w.alert ? 'rain' : 'cloud')}${w.text}</span>`, iconSize: null }),
  })));
  groups.vulnerable = L.layerGroup(VULNERABLE.map(([lat, lng]) => L.marker([lat, lng], {
    keyboard: false, title: 'Khu có hộ yếu thế cần ưu tiên', zIndexOffset: -1000,
    icon: L.divIcon({ className: '', html: `<span class="md-vuln">${icon('people')}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }),
  }).bindTooltip('Khu có hộ yếu thế cần ưu tiên', { direction: 'top', offset: [0, -12] })));

  // ---------- Đổi nền: Bản đồ / Vệ tinh ----------
  document.querySelector('.md-basemap').addEventListener('click', (event) => {
    const button = event.target.closest('[data-base]');
    if (!button) return;
    const key = button.dataset.base;
    Object.entries(base).forEach(([name, layer]) => { if (name === key) layer.addTo(map); else map.removeLayer(layer); });
    mapCard.classList.toggle('is-satellite', key === 'satellite');
    document.querySelectorAll('.md-basemap [data-base]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  });

  // ---------- Nút điều khiển ----------
  document.querySelector('.md-map').addEventListener('click', (event) => {
    const ctrl = event.target.closest('[data-ctrl]');
    if (!ctrl) return;
    const action = ctrl.dataset.ctrl;
    if (action === 'home') map.flyToBounds(VN_BOUNDS, { ...viewPad(), duration: 0.8 });
    else if (action === 'in') map.zoomIn();
    else if (action === 'out') map.zoomOut();
    else if (action === 'locate') focusArea(state.active ?? AREAS.find((a) => a.status === 'critical').id);
    else if (action === 'full') {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (mapCard.requestFullscreen) mapCard.requestFullscreen();
      else showToast('Trình duyệt không hỗ trợ chế độ toàn màn hình.');
    } else if (action === 'me') {
      if (!navigator.geolocation) { showToast('Trình duyệt không hỗ trợ định vị.'); return; }
      showToast('Đang xác định vị trí của bạn…');
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          L.circleMarker([coords.latitude, coords.longitude], { radius: 8, color: '#fff', weight: 3, fillColor: '#2f6fe4', fillOpacity: 1 }).addTo(map);
          map.flyTo([coords.latitude, coords.longitude], 9, { duration: 0.8 });
          toast.hidden = true;
        },
        () => showToast('Không lấy được vị trí. Hãy cho phép trình duyệt truy cập vị trí.'),
        { timeout: 8000 },
      );
    }
  });
  document.addEventListener('fullscreenchange', () => setTimeout(() => map.invalidateSize(), 150));
  new ResizeObserver(() => map.invalidateSize()).observe(mapCard);

  // Mở sẵn popup Hà Giang như ảnh mẫu, chỉ khi ghim đang hiện riêng (không nằm trong cụm) để không tự phóng to bản đồ
  const firstPin = markers.get(1).pin;
  if (sidePopup && (!pinCluster.getVisibleParent || pinCluster.getVisibleParent(firstPin) === firstPin)) focusArea(1, { fly: false, pan: false });
};

if (window.L) initMap();
else document.querySelector('.md-map-fallback').hidden = false;

// ==================== SECTION: BẢN ĐỒ — nút mở / đóng cột trái & cột phải ====================
// Đóng cột: cột co về 0 (CSS), bản đồ giãn ra (ResizeObserver ở trên tự gọi invalidateSize). Cột đóng được gắn inert
// để không nhận focus bàn phím. Trạng thái nhớ trong localStorage (chỉ là tiện ích, lỗi đọc/ghi thì bỏ qua).
const dashboard = document.querySelector('.map-dashboard');
const PANEL_KEY = 'md-panels-closed';
const panelLabels = { left: 'cột lớp bản đồ và bộ lọc', right: 'cột tổng quan' };
const setPanel = (button, open) => {
  const side = button.dataset.panelToggle;
  dashboard.classList.toggle(`is-${side}-closed`, !open);
  document.getElementById(button.getAttribute('aria-controls')).inert = !open;
  const label = `${open ? 'Thu gọn' : 'Mở'} ${panelLabels[side]}`;
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', label);
  button.title = label;
};
const panelToggles = [...document.querySelectorAll('[data-panel-toggle]')];
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
// Màn hình hẹp (≤ 1100px) xếp dọc, không có nút đóng → luôn hiện cả hai cột
const wideMap = window.matchMedia('(min-width: 1101px)');
const syncPanelsToWidth = () => panelToggles.forEach((button) => {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  panel.inert = wideMap.matches && button.getAttribute('aria-expanded') === 'false';
});
wideMap.addEventListener('change', syncPanelsToWidth);
syncPanelsToWidth();

// ==================== SECTION: CỘT BÊN — accordion ====================
// Mỗi cột chỉ mở một mục: mở mục này thì mục đang mở khác trong cùng cột tự đóng (hạn chế cuộn).
// Ngoại lệ data-acc-pinned (Lớp bản đồ): không bị mục khác tự đóng và không làm mục khác đóng — chỉ đóng/mở khi bấm chính nó.
// Nội dung đang đóng gắn inert để không nhận focus bàn phím.
const setAccordion = (item, open) => {
  item.classList.toggle('is-open', open);
  item.querySelector('.md-acc-head').setAttribute('aria-expanded', String(open));
  item.querySelector('.md-acc-body').inert = !open;
};
document.querySelectorAll('.md-acc').forEach((item) => setAccordion(item, item.classList.contains('is-open')));
document.querySelectorAll('.md-acc-head').forEach((head) => {
  head.addEventListener('click', () => {
    const item = head.closest('.md-acc');
    const open = !item.classList.contains('is-open');
    if (open && !item.hasAttribute('data-acc-pinned')) item.closest('.md-panel').querySelectorAll('.md-acc.is-open:not([data-acc-pinned])').forEach((other) => setAccordion(other, false));
    setAccordion(item, open);
  });
});

// ==================== SECTION: CỘT TRÁI — lớp bản đồ & bộ lọc ====================
document.querySelectorAll('[data-layer]').forEach((input) => {
  input.addEventListener('change', () => {
    input.closest('.md-layer').classList.toggle('is-on', input.checked);
    updateLegend();
    const group = groups[input.dataset.layer];
    if (!map || !group) return;
    if (input.checked) group.addTo(map); else map.removeLayer(group);
  });
});
document.querySelector('#resource-filter').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-res]');
  if (!chip) return;
  const on = chip.getAttribute('aria-pressed') !== 'true';
  chip.setAttribute('aria-pressed', String(on));
  if (on) state.resources.add(chip.dataset.res); else state.resources.delete(chip.dataset.res);
  applyFilters();
});
document.querySelector('#status-filter').addEventListener('change', (event) => {
  if (event.target.checked) state.statuses.add(event.target.value); else state.statuses.delete(event.target.value);
  applyFilters();
  renderList();
});
document.querySelector('#filter-reset').addEventListener('click', () => {
  document.querySelectorAll('#resource-filter [data-res]').forEach((chip) => chip.setAttribute('aria-pressed', 'true'));
  document.querySelectorAll('#status-filter input').forEach((input) => { input.checked = true; });
  state.resources = new Set(Object.keys(RESOURCE));
  state.statuses = new Set(Object.keys(STATUS));
  areaSelect.value = '';
  applyFilters();
  renderList();
});
areaSelect.addEventListener('change', () => { if (areaSelect.value !== '') focusArea(Number(areaSelect.value)); });

// ==================== SECTION: THANH CÔNG CỤ — tìm kiếm, phạm vi, thời gian ====================
const search = document.querySelector('#map-search');
search.addEventListener('input', () => { state.query = search.value; renderList(); });
search.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const query = fold(search.value.trim());
  const hit = query && AREAS.find((area) => visible(area) && fold(area.name).includes(query));
  if (hit) {
    state.tab = tabMatch.other(hit) ? 'other' : hit.status;
    document.querySelectorAll('.md-tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
    focusArea(hit.id);
  } else if (query) showToast('Không tìm thấy địa bàn phù hợp.');
});
document.querySelector('#map-region').addEventListener('change', (event) => {
  state.region = event.target.value;
  applyFilters();
  renderList();
  if (!map) return;
  const shown = AREAS.filter(visible);
  if (state.region === 'all' || !shown.length) map.flyToBounds(VN_BOUNDS, { ...viewPad(), duration: 0.8 });
  else map.flyToBounds(L.latLngBounds(shown.map((a) => [a.lat, a.lng])), { paddingTopLeft: [60, 90], paddingBottomRight: [90, 150], duration: 0.8 });
});
document.querySelector('#map-time').addEventListener('change', () => showToast('Bản xem trước: dữ liệu theo khoảng thời gian sẽ có khi kết nối hệ thống.'));
list.addEventListener('click', (event) => {
  const row = event.target.closest('[data-area]');
  if (row) focusArea(Number(row.dataset.area));
});

renderList();
