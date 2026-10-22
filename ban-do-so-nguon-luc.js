// ==================== SECTION: BẢN ĐỒ SỐ — TAB NGUỒN LỰC (SRS mục 3.4–3.9, NL05–NL18) ====================
// Điểm nóng · Cân đối & điều phối (bảng thừa/thiếu, tạo / phê duyệt / từ chối lệnh) · Theo dõi tuyến.
// ban-do-so.js gọi DigitalMapResources.init(app) sau khi dựng bản đồ; dữ liệu từ window.DigitalMapResourceSource.
(() => {
  'use strict';
  const RM = window.DigitalMapResourceModel;
  // ---------- Thông báo (SRS mục 6) ----------
  const MSG = {
    TB04: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
    TB05: 'Tổng số lượng điều phối vượt quá số đang thiếu.',
    TB06: 'Số lượng điều phối vượt quá số khả dụng của điểm tập kết nguồn.',
    TB07: 'Điểm tập kết nguồn và nơi nhận không thuộc cùng chương trình.',
    TB10: 'Đã lưu nháp lệnh điều phối.',
    TB15: 'Không tải được dữ liệu bản đồ. Vui lòng thử lại.',
    TB18: 'Vui lòng nhập lý do từ chối.',
    due: 'Thời điểm "Cần có mặt trước" phải sau thời điểm hiện tại.',
    qty: 'Số lượng phải là số nguyên dương.',
  };
  const two = (n) => String(n).padStart(2, '0');
  const clock = (value) => { const d = new Date(value); return `${two(d.getHours())}:${two(d.getMinutes())}`; };
  const stamp = (value) => { const d = new Date(value); return `${clock(value)} ${two(d.getDate())}/${two(d.getMonth() + 1)}`; };
  const localInput = (value) => { const d = new Date(value); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`; };
  const PRESETS = {
    hotspots: { hotspots: true, balance: false, routes: false, vehicles: false, depots: false, storm: true, roads: false },
    balance: { hotspots: false, balance: true, routes: true, vehicles: false, depots: true, storm: false, roads: true },
    track: { hotspots: false, balance: true, routes: true, vehicles: true, depots: true, storm: false, roads: true },
  };
  const filterDefaults = () => ({ need: '', priorities: new Set(['P1', 'P2']), program: '', group: '', status: '', scope: '', time: '' });
  // Sức chở mỗi xe theo nhóm nguồn lực → gợi ý phương tiện
  const CAPACITY = { water: 1000, rice: 5, blanket: 1500, medkit: 300, unit: 8, truck: 1, volunteer: 16 };
  const VIETNAM = [[8.3, 102], [23.5, 110]];

  window.DigitalMapResources = {
    async init(app) {
      const { map, $, esc, icon, fmt, toast, data } = app;
      const L = window.L;
      const source = window.DigitalMapResourceSource;
      let R;
      try { R = await source.load(); } catch { toast(MSG.TB15); return; }
      const me = R.me;
      const depot = (id) => R.depots.find((d) => d.id === id);
      const provinceFull = (id) => data.locations.find((p) => p.id === id)?.name || '';
      const provinceName = (id) => provinceFull(id).replace(/^(Tỉnh|Thành phố) /, '');
      const center = (id) => data.centers[id];
      const programName = (id) => R.programs.find((p) => p.id === id)?.name || '—';
      const shortDepot = (d) => d.name.replace('Hội CTĐ ', '').replace(/ (tỉnh|TP|xã) /, ' ');
      const receiverPlace = (d) => d.name.match(/xã .+$/)?.[0] || shortDepot(d);
      const qtyText = (group, qty) => `${fmt.format(qty)} ${R.groups[group].unit}`;
      const badge = (label, tone) => `<span class="pf-badge is-${tone}">${esc(label)}</span>`;
      const statusBadge = (o) => badge(RM.STATUSES[o.status].label, RM.STATUSES[o.status].tone) + (o.incident ? badge('Sự cố', 'red') : '');
      const shortage = (provinceId, group) => { const b = R.provinces[provinceId]?.balance[group]; return b ? Math.max(0, b[0] - b[1]) : 0; };
      const latlng = (d) => [d.lat, d.lng];
      // Quãng đường, thời gian, lộ trình của lệnh (dịch vụ định tuyến thật thay thế phần ước tính)
      function enrich(o) {
        const src = depot(o.source), dst = depot(o.target);
        if (!src || !dst) return o;
        o.km = RM.distanceKm(src, dst);
        o.minutes = RM.travelMinutes(o.km);
        o.path = [latlng(src), ...(o.via || []), latlng(dst)];
        return o;
      }
      R.orders.forEach(enrich);

      // ---------- Trạng thái giao diện ----------
      const S = { active: false, fitted: false, sub: 'hotspots', layers: { ...PRESETS.hotspots }, f: filterDefaults(), hot: null, province: null, prevScope: null, order: null, orderFilter: 'all', trackFilter: 'all', updatedAt: Date.now() };
      const scopeOk = (provinceId) => !S.f.scope || provinceId === S.f.scope;
      function hotspotList({ ignorePriority = false } = {}) {
        return Object.entries(R.provinces)
          .filter(([id, p]) => p.priority && scopeOk(id) && (!S.f.need || p.needs.includes(S.f.need)) && (ignorePriority || S.f.priorities.has(p.priority)))
          .map(([id, p]) => ({ id, ...p })).sort((a, b) => b.hps - a.hps);
      }
      function balanceList() {
        return Object.entries(R.provinces).filter(([, p]) => !S.f.program || p.program === S.f.program).map(([id, p]) => {
          const pct = RM.provinceCoverage(p.balance, S.f.group ? [S.f.group] : null);
          return { id, ...p, pct, level: RM.level(pct) };
        });
      }
      const inTime = (o) => !S.f.time || Date.parse(o.createdAt) >= Date.now() - (S.f.time === '7d' ? 7 : 30) * 86400e3;
      const orderProvince = (o) => depot(o.target)?.province;
      const baseOrders = () => R.orders.filter((o) => RM.visibleTo(o, me) && (!S.f.program || o.program === S.f.program) && (!S.f.scope || orderProvince(o) === S.f.scope || depot(o.source)?.province === S.f.scope));
      const balanceOrders = (filter = S.orderFilter) => baseOrders().filter((o) => inTime(o) && RM.inFilter(o, filter));
      const trackOrders = (filter = S.trackFilter) => baseOrders().filter((o) => RM.TRACK_STATUSES.includes(o.status) && (!S.f.status || o.status === S.f.status) && RM.TRACK_FILTERS[filter].test(o));
      const selectedOrder = () => R.orders.find((o) => o.id === S.order);

      // ==================== THANH BỘ LỌC: đổi theo tab con ====================
      const tools = $('#bd-res-tools');
      R.needGroups.forEach((g) => $('#bd-res-need').add(new Option(g, g)));
      R.programs.forEach((p) => $('#bd-res-program').add(new Option(p.name, p.id)));
      Object.entries(R.groups).forEach(([key, g]) => $('#bd-res-group').add(new Option(g.label, key)));
      RM.TRACK_STATUSES.forEach((key) => $('#bd-res-status').add(new Option(RM.STATUSES[key].label, key)));
      data.locations.forEach((p) => $('#bd-res-scope').add(new Option(p.name, p.id)));
      // Bộ lọc Mức ưu tiên gộp cả nhãn đếm theo mức (SRS 3.4 #7): mỗi lựa chọn kèm số tỉnh, cập nhật ở renderHotspots
      $('#bd-res-priority-options').innerHTML = Object.entries(RM.PRIORITIES).map(([key, p]) => `<label><input type="checkbox" value="${key}" /><span class="bd-level-dot" style="--c:${p.color}"></span><span>${esc(p.short)}</span><small class="bd-opt-count" data-priority-count="${key}"></small></label>`).join('');
      function renderTools() {
        tools.querySelectorAll('[data-sub]').forEach((item) => { item.hidden = !item.dataset.sub.split(' ').includes(S.sub); });
        $('#bd-res-need').value = S.f.need; $('#bd-res-program').value = S.f.program; $('#bd-res-group').value = S.f.group;
        $('#bd-res-status').value = S.f.status; $('#bd-res-scope').value = S.f.scope; $('#bd-res-time').value = S.f.time;
        $('#bd-res-priority-options').querySelectorAll('input').forEach((input) => { input.checked = S.f.priorities.has(input.value); });
        const chosen = Object.keys(RM.PRIORITIES).filter((key) => S.f.priorities.has(key));
        $('#bd-res-priority-value').textContent = chosen.length === 4 ? 'Tất cả mức ưu tiên' : chosen.length ? chosen.map((key) => RM.PRIORITIES[key].label).join(', ') : 'Chưa chọn mức ưu tiên';
      }
      const bindSelect = (id, key) => $(id).addEventListener('change', (event) => { S.f[key] = event.target.value; if (key === 'scope') { S.prevScope = null; closeBalancePopup({ restore: false }); fitScope(); } render(); });
      [['#bd-res-need', 'need'], ['#bd-res-program', 'program'], ['#bd-res-group', 'group'], ['#bd-res-status', 'status'], ['#bd-res-scope', 'scope'], ['#bd-res-time', 'time']].forEach(([id, key]) => bindSelect(id, key));
      $('#bd-res-priority-options').addEventListener('change', (event) => { if (event.target.checked) S.f.priorities.add(event.target.value); else S.f.priorities.delete(event.target.value); render(); });
      document.addEventListener('click', (event) => { const picker = $('#bd-res-priority-picker'); if (picker.open && !picker.contains(event.target)) picker.open = false; });
      $('#bd-res-reset').addEventListener('click', () => {
        closeBalancePopup({ restore: false });
        Object.assign(S, { f: filterDefaults(), layers: { ...PRESETS[S.sub] }, hot: null, province: null, prevScope: null, order: null, orderFilter: 'all', trackFilter: 'all' });
        $('#bd-res-search').value = ''; showResults([]);
        render(); map?.fitBounds(VIETNAM, { ...app.pad(), animate: false });
      });
      function fitScope() {
        if (!map) return;
        if (S.f.scope && center(S.f.scope)) map.setView(center(S.f.scope), 8, { animate: false });
        else map.fitBounds(VIETNAM, { ...app.pad(), animate: false });
      }

      // ==================== CỘT TRÁI: tìm kiếm + cây Lớp dữ liệu ====================
      // ---------- Lớp dữ liệu: chia nhóm như tab Tổng quan — tiêu đề nhóm (viết hoa, mũi tên thu gọn) · các lớp có biểu tượng, tên, số lượng, công tắc ----------
      const GROUPS = [
        { key: 'coord', title: 'Cân đối & điều phối', layers: [
          { key: 'balance', icon: 'grid', color: '#22a06b', label: () => S.sub === 'track' || S.order ? 'Cân đối nguồn lực (làm mờ)' : 'Cân đối nguồn lực (theo tỉnh)', count: () => `${balanceList().length} tỉnh` },
          { key: 'routes', icon: 'navigate', color: '#2f6fe4', label: () => S.sub === 'track' ? 'Tuyến điều phối đang thực hiện' : 'Tuyến của lệnh đang chọn', count: () => S.sub === 'track' ? `${trackOrders('all').length} tuyến` : S.order ? '1 tuyến' : 'Chưa chọn lệnh' },
          { key: 'vehicles', icon: 'truck', color: '#e8710a', label: () => 'Phương tiện đang hoạt động', only: 'track', count: () => `${trackOrders('all').filter((o) => o.status === 'shipping').reduce((n, o) => n + o.vehicleCount, 0)} xe` },
        ] },
        { key: 'infra', title: 'Hạ tầng nhân đạo', layers: [
          { key: 'depots', icon: 'box', color: '#8A5A2B', label: () => 'Điểm tập kết hàng hóa', count: () => `${visibleDepots().length} điểm` },
        ] },
        { key: 'hazard', title: 'Thiên tai – rủi ro', layers: [
          { key: 'hotspots', icon: 'alert', color: '#e5232f', label: () => 'Điểm nóng nhân đạo', count: () => `${hotspotList().length} tỉnh` },
          { key: 'storm', icon: 'storm', color: '#7c4ddb', label: () => 'Đường đi bão', count: () => `${R.storm.name} · ${R.storm.level}` },
          { key: 'roads', icon: 'alert', color: '#b91c2b', label: () => 'Đường giao thông gián đoạn', count: () => `${R.disruptions.length} đoạn` },
        ] },
      ];
      const shown = (layer) => !layer.only || layer.only === S.sub;
      const expanded = { coord: true, infra: true, hazard: true };
      const layerRow = (layer) => `<label class="md-layer bd-layer" style="--layer-color:${layer.color}"><span class="md-layer-icon" aria-hidden="true">${icon(layer.icon)}</span><span class="md-layer-text"><strong class="bd-layer-name">${esc(layer.label())}</strong><small>${esc(layer.count())}</small></span><input class="md-switch" type="checkbox" data-res-layer="${layer.key}" ${S.layers[layer.key] ? 'checked' : ''} /></label>`;
      const groupHtml = (group) => `<div class="bd-layer-group" role="group" aria-labelledby="bd-res-group-${group.key}"><h3 class="bd-layer-group-title"><button type="button" class="bd-layer-group-toggle" id="bd-res-group-${group.key}" aria-expanded="${expanded[group.key]}" aria-controls="bd-res-group-body-${group.key}">${esc(group.title)}${icon('chevron-down')}</button></h3><div class="bd-layer-group-body" id="bd-res-group-body-${group.key}" ${expanded[group.key] ? '' : 'hidden'}>${group.layers.filter(shown).map(layerRow).join('')}</div></div>`;
      // Chỉ dựng lại cột khi đổi tab con / đổi tên lớp; bật tắt, thu gọn nhóm thì cập nhật tại chỗ để thanh biểu tượng (cột thu gọn) vẫn trỏ đúng công tắc
      let treeSignature = '';
      function renderTree() {
        const layers = activeLayers();
        const signature = JSON.stringify([S.sub, layers.map((layer) => layer.label())]);
        const rebuilt = signature !== treeSignature;
        if (rebuilt) {
          treeSignature = signature;
          $('#bd-res-layers').querySelectorAll(':scope > :not(legend)').forEach((el) => el.remove());
          $('#bd-res-layers').insertAdjacentHTML('beforeend', GROUPS.map(groupHtml).join(''));
        }
        layers.forEach((layer) => {
          const input = $(`[data-res-layer="${layer.key}"]`);
          if (!input) return;
          input.checked = Boolean(S.layers[layer.key]);
          input.closest('.bd-layer').querySelector('small').textContent = layer.count();
        });
        $('#bd-res-layers-all').textContent = layers.every((layer) => S.layers[layer.key]) ? 'Tắt tất cả' : 'Bật tất cả';
        if (S.active) { if (rebuilt) app.renderRail(); else app.syncRail(); }
      }
      const activeLayers = () => GROUPS.flatMap((group) => group.layers.filter(shown));
      const activeKeys = () => activeLayers().map((layer) => layer.key);
      $('#bd-res-layers').addEventListener('change', (event) => {
        const key = event.target.dataset.resLayer;
        if (!key) return;
        S.layers[key] = event.target.checked;
        renderTree(); renderMap(); renderLegend();
      });
      // Tiêu đề nhóm: bấm để thu gọn / mở các lớp trong nhóm (giữ trạng thái khi đổi tab con)
      $('#bd-res-layers').addEventListener('click', (event) => {
        const toggle = event.target.closest('.bd-layer-group-toggle');
        if (!toggle) return;
        const key = toggle.id.replace('bd-res-group-', '');
        expanded[key] = !expanded[key];
        toggle.setAttribute('aria-expanded', String(expanded[key]));
        $(`#bd-res-group-body-${key}`).hidden = !expanded[key];
      });
      $('#bd-res-layers-all').addEventListener('click', () => {
        const on = !activeKeys().every((key) => S.layers[key]);
        activeKeys().forEach((key) => { S.layers[key] = on; });
        renderTree(); renderMap(); renderLegend();
      });
      // ---------- Ô tìm địa phương, kho, điểm tập kết ----------
      function showResults(items) {
        $('#bd-res-results').innerHTML = items.map(([kind, id, label, sub]) => `<li><button type="button" data-goto="${kind}:${esc(id)}"><strong>${esc(label)}</strong><small>${esc(sub)}</small></button></li>`).join('');
        $('#bd-res-results').hidden = !items.length;
        $('#bd-res-search').setAttribute('aria-expanded', String(Boolean(items.length)));
      }
      $('#bd-res-search').addEventListener('input', (event) => {
        const query = window.DigitalMapModel.fold(event.target.value.trim());
        if (query.length < 2) { showResults([]); return; }
        const provinces = data.locations.filter((p) => window.DigitalMapModel.fold(p.name).includes(query)).map((p) => ['p', p.id, p.name, R.provinces[p.id]?.priority ? `Điểm nóng ${R.provinces[p.id].priority}` : 'Tỉnh, thành phố']);
        const depots = R.depots.filter((d) => window.DigitalMapModel.fold(`${d.name} ${d.address}`).includes(query)).map((d) => ['d', d.id, d.name, d.address]);
        showResults([...provinces, ...depots].slice(0, 8));
      });
      document.addEventListener('click', (event) => { if (!event.target.closest('.bd-res-search')) showResults([]); });
      $('#bd-res-search').addEventListener('keydown', (event) => { if (event.key === 'Escape') showResults([]); });
      $('#bd-res-results').addEventListener('click', (event) => {
        const button = event.target.closest('[data-goto]');
        if (!button) return;
        const [kind, id] = button.dataset.goto.split(':');
        showResults([]);
        if (kind === 'p') { if (S.sub === 'hotspots' && R.provinces[id]?.priority) selectHotspot(id); else selectProvince(id); }
        else { const d = depot(id); if (!d || !map) return; if (!S.layers.depots) { S.layers.depots = true; renderTree(); renderMap(); } map.setView(latlng(d), 10, { animate: false }); openDepotPopup(d); }
      });

      // ==================== BẢN ĐỒ: tỉnh (mức ưu tiên / mức đáp ứng), thiên tai, ĐTK, tuyến, phương tiện ====================
      const G = map ? { provinces: L.layerGroup(), storm: L.layerGroup(), roads: L.layerGroup(), depots: L.layerGroup(), routes: L.layerGroup(), vehicles: L.layerGroup() } : null;
      const root = map ? L.layerGroup(Object.values(G)) : null;
      const label = (at, html, className = '') => L.marker(at, { keyboard: false, interactive: false, icon: L.divIcon({ className: `bd-map-label-host ${className}`, html, iconSize: null }) });
      function pointAlong(path, t) {
        const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
        let left = lengths.reduce((a, b) => a + b, 0) * t;
        for (let i = 0; i < lengths.length; i += 1) {
          if (left <= lengths[i]) { const k = lengths[i] ? left / lengths[i] : 0; return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k]; }
          left -= lengths[i];
        }
        return path.at(-1);
      }
      const visibleDepots = () => R.depots.filter((d) => (!S.f.program || d.programs.includes(S.f.program)));
      function renderMap() {
        if (!map) return;
        Object.values(G).forEach((group) => group.clearLayers());
        if (!S.active) return;
        const dim = S.sub === 'track' || Boolean(S.order);
        const focus = S.province || S.f.scope || (S.sub === 'hotspots' ? S.hot : null);
        // Cân đối nguồn lực: tô màu tỉnh theo mức đáp ứng (chưa có ranh giới tỉnh → vùng tròn quanh trung tâm tỉnh; nguồn có thể cấp GeoJSON qua R.shapes)
        if (S.layers.balance) balanceList().forEach((p) => {
          const at = center(p.id);
          if (!at) return;
          const color = RM.LEVELS[p.level].color, selected = p.id === focus;
          // Theo dõi tuyến: lớp cân đối chỉ làm nền (làm mờ), không bấm được
          const interactive = S.sub === 'balance';
          const shape = R.shapes?.[p.id] ? L.geoJSON(R.shapes[p.id], { interactive }) : L.circle(at, { radius: 30000, interactive });
          shape.setStyle({ color: selected ? '#24272c' : '#ffffff', weight: selected ? 3 : 1, fillColor: color, fillOpacity: dim ? .2 : .5, bubblingMouseEvents: false });
          shape.on('click', () => selectProvince(p.id));
          shape.bindTooltip(`${provinceFull(p.id)} · mức đáp ứng ${RM.percent(p.pct)}% (${RM.LEVELS[p.level].label})`, { sticky: true }).addTo(G.provinces);
          label(at, `<span class="bd-prov${selected ? ' is-selected' : ''}${dim ? ' is-dim' : ''}" style="--c:${color}"><b>${esc(provinceName(p.id))}</b>${RM.percent(p.pct)}%</span>`).addTo(G.provinces);
        });
        // Điểm nóng: tô màu tỉnh theo mức ưu tiên, nhãn P1, P2…; nhấn mạnh tỉnh của thẻ đang chọn
        if (S.layers.hotspots) hotspotList().forEach((h) => {
          const at = center(h.id);
          if (!at) return;
          const color = RM.PRIORITIES[h.priority].color, selected = h.id === focus;
          if (!S.layers.balance) {
            L.circle(at, { radius: 36000, color: selected ? '#24272c' : color, weight: selected ? 3 : 1, fillColor: color, fillOpacity: selected ? .6 : .42, bubblingMouseEvents: false })
              .on('click', () => selectHotspot(h.id)).bindTooltip(`${provinceFull(h.id)} · ${RM.PRIORITIES[h.priority].short} · HPS ${h.hps}`, { sticky: true }).addTo(G.provinces);
          }
          label(at, `<span data-p="${h.priority}" class="bd-hot-pin${selected ? ' is-selected' : ''}${S.layers.balance ? ' is-stacked' : ''}" style="--c:${color}"><b>${h.priority}</b>${S.layers.balance ? '' : esc(provinceName(h.id))}</span>`).addTo(G.provinces);
        });
        // Thiên tai: đường đi bão (đã qua: nét liền, dự báo: nét đứt), nhãn tên bão · cấp · thời gian đổ bộ dự kiến
        if (S.layers.storm) {
          L.polyline(R.storm.track, { color: '#7c4ddb', weight: 3, interactive: false }).addTo(G.storm);
          L.polyline(R.storm.forecast, { color: '#7c4ddb', weight: 3, dashArray: '8 8', interactive: false }).addTo(G.storm);
          label(R.storm.track.at(-1), `<span class="bd-storm-eye">${icon('storm')}</span>`).addTo(G.storm);
          const landfall = new Date(R.storm.landfall);
          label(R.storm.track.at(-1), `<span class="bd-map-tag is-storm">${esc(R.storm.name)} · ${esc(R.storm.level)}<small>Đổ bộ dự kiến ${landfall.getHours()}h ${two(landfall.getDate())}/${two(landfall.getMonth() + 1)}</small></span>`).addTo(G.storm);
        }
        if (S.layers.roads) R.disruptions.forEach((road) => {
          L.polyline(road.path, { color: '#e5232f', weight: 4, dashArray: '6 6', interactive: false }).addTo(G.roads);
          label(road.path[1], `<span class="bd-map-tag is-road">${esc(road.name)}</span>`).addTo(G.roads);
        });
        // Điểm tập kết hàng hóa (hiển thị khi lớp ĐTK đang bật)
        if (S.layers.depots) visibleDepots().forEach((d) => {
          const source = Object.values(d.available).some((v) => v > 0);
          L.marker(latlng(d), { title: d.name, alt: d.name, icon: L.divIcon({ className: 'bd-depot-host', html: `<span class="bd-depot${source ? '' : ' is-target'}">${icon('box')}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }) })
            .on('click', () => openDepotPopup(d)).addTo(G.depots);
        });
        // Tuyến: Cân đối = lệnh đang chọn; Theo dõi tuyến = các lệnh từ Đã phê duyệt trở đi, tô màu theo trạng thái
        if (S.layers.routes) {
          const list = S.sub === 'track' ? trackOrders() : S.sub === 'balance' && selectedOrder() && selectedOrder().status !== 'draft' ? [selectedOrder()] : [];
          list.forEach((o) => drawRoute(o, o.id === S.order || list.length === 1));
        }
        if (S.layers.vehicles && S.sub === 'track') trackOrders().filter((o) => o.status === 'shipping').forEach((o) => {
          const pct = RM.progress(o, Date.now());
          L.marker(pointAlong(o.path, pct), { title: `${o.id} · ${Math.round(pct * 100)}% quãng đường`, icon: L.divIcon({ className: 'bd-vehicle-host', html: `<span class="bd-vehicle" style="--c:${RM.STATUSES[o.status].color}">${icon('truck')}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] }) })
            .on('click', () => selectOrder(o.id)).addTo(G.vehicles);
        });
      }
      function routeTag(o) {
        if (S.sub !== 'track') return `${o.id} · ${qtyText(o.group, o.qty)} · ${o.km} km · ${RM.shortDuration(o.minutes)}`;
        const load = o.group === 'volunteer' ? `${o.qty} TNV` : `${o.vehicleCount} xe`;
        if (o.status === 'shipping') return `${o.id} · ${load} · còn ${RM.durationText(Math.max(5, Math.round(o.minutes * (1 - RM.progress(o, Date.now())))))}`;
        if (['approved', 'preparing'].includes(o.status)) return `${o.id} · ${load} · xuất phát ${o.departAt ? clock(o.departAt) : 'chờ xếp lịch'}`;
        const done = (o.history || []).find(([status]) => status === o.status);
        return `${o.id} · ${RM.STATUSES[o.status].label}${done ? ` ${clock(done[1])}` : ''}`;
      }
      function drawRoute(o, selected) {
        const src = depot(o.source), dst = depot(o.target);
        if (!src || !dst) return;
        const color = S.sub === 'track' ? RM.STATUSES[o.status].color : '#1f3a5f';
        L.polyline(o.path, { color: '#ffffff', weight: selected ? 9 : 6, opacity: .9, interactive: false }).addTo(G.routes);
        L.polyline(o.path, { color, weight: selected ? 5 : 3, opacity: selected ? 1 : .75 }).on('click', () => selectOrder(o.id)).bindTooltip(o.id, { sticky: true }).addTo(G.routes);
        label(pointAlong(o.path, .5), `<span class="bd-map-tag is-route${selected ? ' is-selected' : ''}" style="--c:${color}">${esc(routeTag(o))}</span>`).addTo(G.routes);
        if (!selected) return;
        // Điểm nguồn: tên ĐTK; số xuất · số còn dư. Điểm nhận: "Nhận:" tên điểm; tỉnh · số đang thiếu (SRS 3.8 #3–4)
        const left = (src.available[o.group] || 0) - o.qty;
        label(latlng(src), `<span class="bd-map-tag is-source">${icon('house')}<span>${esc(src.name)}<small>Xuất ${esc(qtyText(o.group, o.qty))} · còn dư ${fmt.format(Math.max(0, left))}</small></span></span>`).addTo(G.routes);
        label(latlng(dst), `<span class="bd-map-tag is-target">${icon('pin')}<span>Nhận: ${esc(dst.name)}<small>${esc(provinceFull(dst.province))} · thiếu ${esc(qtyText(o.group, shortage(dst.province, o.group)))}</small></span></span>`).addTo(G.routes);
      }
      function openDepotPopup(d) {
        if (!map) return;
        const stock = Object.entries(d.available).filter(([, v]) => v > 0).map(([key, v]) => `<li>${esc(R.groups[key].label)}<b>${esc(qtyText(key, v))}</b></li>`).join('');
        L.popup({ className: 'bd-popup', maxWidth: 340, offset: [0, -6], autoPanPaddingTopLeft: [40, 72], autoPanPaddingBottomRight: [72, 40] }).setLatLng(latlng(d))
          .setContent(`<div class="bd-popup-header"><div class="bd-popup-kind" style="--layer-color:#8A5A2B">${icon('box')}Điểm tập kết hàng hóa</div><h3>${esc(d.name)}</h3></div><div class="bd-popup-body"><dl class="bd-detail"><div><dt>Địa chỉ</dt><dd>${esc(d.address)}</dd></div><div><dt>Chương trình</dt><dd>${d.programs.map((id) => esc(programName(id))).join('<br>')}</dd></div><div><dt>Người phụ trách</dt><dd>${esc(`${d.manager} · ${d.phone}`)}</dd></div><div><dt>${stock ? 'Khả dụng' : 'Vai trò'}</dt><dd>${stock ? `<ul class="bd-stock">${stock}</ul>` : 'Điểm nhận hàng'}</dd></div></dl></div>`).openOn(map);
      }

      // ---------- Popup Cân đối nguồn lực của tỉnh (SRS 3.6 #4–7) ----------
      let balancePopup = null;
      function balanceHtml(id) {
        const p = R.provinces[id];
        const rows = RM.balanceRows(p.balance, R.groups);
        const pct = RM.provinceCoverage(p.balance);
        const shortRows = rows.filter((r) => r.short);
        const sign = (n) => n > 0 ? `+${fmt.format(n)}` : n < 0 ? `−${fmt.format(-n)}` : '0';
        return `<div class="bd-popup-header"><h3>Tỉnh ${esc(provinceName(id))} · Cân đối nguồn lực</h3>
          <p class="bd-popup-sub">Chương trình ${esc(programName(p.program))} · cập nhật ${clock(p.updatedAt)} · mức đáp ứng: <b style="color:${RM.LEVELS[RM.level(pct)].color}">${RM.LEVELS[RM.level(pct)].label} (${RM.percent(pct)}%)</b></p></div>
          <div class="bd-popup-body"><div class="bd-goods-scroll"><table class="bd-balance"><thead><tr><th scope="col">Nhóm <small>(loại nguồn lực)</small></th><th scope="col">Nhu cầu</th><th scope="col">Hiện có</th><th scope="col">Thiếu/Thừa</th><th scope="col">Thao tác</th></tr></thead>
          <tbody>${rows.map((r) => `<tr><td><span class="bd-level-dot" style="--c:${RM.LEVELS[r.level].color}" title="${esc(RM.LEVELS[r.level].label)}"></span>${esc(r.label)}<small>${esc(r.type)}</small></td><td class="is-num">${esc(qtyText(r.key, r.need))}</td><td class="is-num">${fmt.format(r.have)}</td><td class="is-num ${r.diff < 0 ? 'is-neg' : r.diff > 0 ? 'is-pos' : ''}">${sign(r.diff)}</td><td>${r.short ? `<button type="button" class="pf-btn pf-btn-soft pf-btn-sm" data-dispatch="${r.key}" data-province="${id}">Điều phối</button>` : '—'}</td></tr>`).join('')}</tbody></table></div>
          <div class="bd-balance-foot"><span>${shortRows.length}/${rows.length} nhóm đang thiếu · Mức đáp ứng = Hiện có ÷ Nhu cầu × 100%</span>${shortRows.length ? `<button type="button" class="pf-btn pf-btn-primary pf-btn-sm" data-dispatch-all="${id}">Điều phối tất cả nhóm thiếu</button>` : ''}</div></div>`;
      }
      // Bấm tỉnh: viền đậm, phóng tới tỉnh; Phạm vi tự đổi theo tỉnh, đóng popup thì trả về giá trị trước (SRS 3.6 #2)
      function selectProvince(id) {
        if (!R.provinces[id]) { toast('Tỉnh này chưa có dữ liệu cân đối nguồn lực.'); return; }
        if (S.sub === 'hotspots') { if (R.provinces[id].priority) selectHotspot(id); return; }
        if (S.sub !== 'balance') setSub('balance');
        const previous = balancePopup;
        if (!previous) S.prevScope = S.f.scope;
        balancePopup = null;
        previous?.remove();
        S.province = id; S.f.scope = id; S.order = null;
        render();
        if (!map) return;
        map.setView(center(id), 8, { animate: false });
        const width = Math.max(300, Math.min(560, map.getSize().x - 116));
        $('#digital-map').style.setProperty('--bd-balance-w', width + 'px');
        const popup = L.popup({ className: 'bd-popup is-balance', maxWidth: width, minWidth: width, maxHeight: Math.max(220, map.getSize().y - 150), autoPanPaddingTopLeft: [24, 72], autoPanPaddingBottomRight: [76, 24] }).setLatLng(center(id)).setContent(balanceHtml(id));
        balancePopup = popup;
        popup.on('remove', () => { if (balancePopup === popup) { balancePopup = null; restoreScope(); } });
        popup.openOn(map);
        renderLegend();
        popup.getElement()?.setAttribute('role', 'dialog');
        popup.getElement()?.setAttribute('aria-label', `Cân đối nguồn lực ${provinceFull(id)}`);
      }
      function restoreScope() {
        S.province = null;
        if (S.prevScope !== null) { S.f.scope = S.prevScope; S.prevScope = null; }
        render();
      }
      function closeBalancePopup({ restore = true } = {}) {
        if (!balancePopup) return;
        const popup = balancePopup;
        balancePopup = null;
        popup.remove();
        if (restore) restoreScope(); else { S.province = null; S.prevScope = null; }
      }
      function refreshBalancePopup() { if (balancePopup && S.province) balancePopup.setContent(balanceHtml(S.province)); }
      $('#digital-map').addEventListener('click', (event) => {
        const one = event.target.closest('[data-dispatch]');
        if (one) openOrderDialog({ province: one.dataset.province, group: one.dataset.dispatch });
        const all = event.target.closest('[data-dispatch-all]');
        if (all) startQueue(all.dataset.dispatchAll);
      });

      // ==================== CỘT PHẢI: tab con ====================
      const subTabs = [...document.querySelectorAll('#bd-res-card [role="tab"]')];
      function setSub(sub, focus = false) {
        closeBalancePopup({ restore: true });
        S.sub = sub;
        S.layers = { ...PRESETS[sub] };
        if (sub === 'track' && !trackOrders('all').some((o) => o.id === S.order)) S.order = null;
        if (sub === 'hotspots') S.order = null;
        subTabs.forEach((tab) => {
          const on = tab.dataset.sub === sub;
          tab.setAttribute('aria-selected', String(on));
          tab.tabIndex = on ? 0 : -1;
          document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
          if (on && focus) tab.focus();
        });
        render();
      }
      subTabs.forEach((tab, i) => {
        tab.addEventListener('click', () => setSub(tab.dataset.sub));
        tab.addEventListener('keydown', (event) => {
          const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: subTabs.length - 1 }[event.key];
          if (next === undefined) return;
          event.preventDefault();
          setSub(subTabs[(next + subTabs.length) % subTabs.length].dataset.sub, true);
        });
      });
      // ---------- Điểm nóng (SRS 3.4): nhãn đếm theo mức · thẻ điểm nóng xếp theo HPS · Xuất danh sách · Xem cân đối tỉnh ----------
      function renderHotspots() {
        const all = hotspotList({ ignorePriority: true });
        const list = hotspotList();
        if (!list.some((h) => h.id === S.hot)) S.hot = list[0]?.id || null;
        // Số tỉnh theo mức (không phụ thuộc mức đang chọn) hiện trong bộ lọc Mức ưu tiên trên thanh công cụ
        Object.keys(RM.PRIORITIES).forEach((key) => { const count = $(`[data-priority-count="${key}"]`); if (count) count.textContent = `${all.filter((h) => h.priority === key).length} tỉnh`; });
        // ---------- Thẻ điểm nóng (SRS 3.4 #9, mockup 4): nhãn mức · tỉnh · loại thiên tai · HPS; Ảnh hưởng · Chưa hỗ trợ · Xã nóng nhất; Nhóm nhu cầu ----------
        // Màu nhãn nhóm nhu cầu theo tông pf-tag của web (xanh dương, cam, xanh lá; còn lại xám)
        const NEED_TONE = { 'Thiếu nước': 'is-blue', 'Thiếu lương thực': 'is-orange', 'Thiếu nhân lực': 'is-green', 'Thiếu thuốc': 'is-green' };
        const card = (h) => {
          const p = RM.PRIORITIES[h.priority], selected = h.id === S.hot;
          return `<li><article class="bd-hot-card${selected ? ' is-selected' : ''}" data-p="${h.priority}" style="--c:${p.color}">
            <div class="bd-hot-top"><span class="bd-prio" title="${esc(p.short)}">${h.priority}</span><h3><button type="button" class="bd-hot-hit" data-hotspot="${h.id}" aria-pressed="${selected}">${esc(provinceName(h.id))}</button></h3><span class="pf-tag bd-hot-hazard">${esc(h.hazard)}</span><span class="bd-hps">HPS ${h.hps}</span></div>
            <dl class="bd-hot-stats"><div><dt>Ảnh hưởng</dt><dd>${fmt.format(h.affected)}</dd></div><div><dt>Chưa hỗ trợ</dt><dd>${fmt.format(h.unsupported)}</dd></div><div><dt>Xã nóng nhất</dt><dd>${esc(h.hotWards)}</dd></div></dl>
            <p class="bd-hot-needs"><span>Nhóm nhu cầu:</span>${h.needs.map((n) => `<span class="pf-tag ${NEED_TONE[n] || ''}">${esc(n)}</span>`).join('')}</p></article></li>`;
        };
        $('#bd-res-hotspots').innerHTML = `<div class="bd-res-scroll">
          ${list.length ? `<ul class="bd-hot-list">${list.map(card).join('')}</ul>` : '<p class="bd-empty">Không tìm thấy dữ liệu phù hợp.</p>'}</div>
          <div class="bd-res-foot"><button type="button" class="pf-btn pf-btn-ghost" data-export ${list.length ? '' : 'disabled'}>${icon('download')}Xuất danh sách</button><button type="button" class="pf-btn pf-btn-primary" data-view-balance ${S.hot ? '' : 'disabled'}><span>Xem cân đối tỉnh ${S.hot ? esc(provinceName(S.hot)) : ''}</span>${icon('chevron-right')}</button></div>`;
      }
      function selectHotspot(id) {
        S.hot = id;
        render();
        if (map && center(id)) map.setView(center(id), Math.max(map.getZoom(), 6), { animate: false });
        $(`[data-hotspot="${id}"]`)?.scrollIntoView({ block: 'nearest' });
      }
      $('#bd-res-hotspots').addEventListener('click', (event) => {
        const hit = event.target.closest('[data-hotspot]');
        if (hit) { selectHotspot(hit.dataset.hotspot); return; }
        if (event.target.closest('[data-export]')) exportHotspots();
        if (event.target.closest('[data-view-balance]') && S.hot) { const id = S.hot; setSub('balance'); selectProvince(id); }
      });
      // ---------- Cân đối & điều phối (SRS 3.5): tình hình · phân bổ tỉnh theo mức · khối Điều phối nguồn lực ----------
      function situation() {
        const provinces = Object.entries(R.provinces).filter(([id, p]) => scopeOk(id) && (!S.f.program || p.program === S.f.program)).map(([, p]) => p);
        const need = provinces.reduce((n, p) => n + p.affected, 0);
        const supported = provinces.reduce((n, p) => n + p.affected - p.unsupported, 0);
        const staff = provinces.filter((p) => p.balance.volunteer && p.balance.volunteer[1] < p.balance.volunteer[0]);
        const depots = R.depots.filter((d) => (!S.f.program || d.programs.some((id) => id === S.f.program)) && (!S.f.scope || d.province === S.f.scope) && d.status !== 'paused' && Object.values(d.available).some((v) => v > 0));
        return {
          need, new24h: provinces.reduce((n, p) => n + p.new24h, 0), supported, pct: need ? Math.round(supported / need * 100) : 0,
          wards: staff.reduce((n, p) => n + Math.max(1, p.shortWards), 0), staffProvinces: staff.length, volunteersShort: staff.reduce((n, p) => n + p.balance.volunteer[0] - p.balance.volunteer[1], 0),
          depots: depots.length, trucks: depots.reduce((n, d) => n + (d.available.truck || 0), 0), volunteers: depots.reduce((n, d) => n + (d.available.volunteer || 0), 0),
        };
      }
      function orderCard(o, mode) {
        const src = depot(o.source), dst = depot(o.target), group = R.groups[o.group], selected = o.id === S.order;
        return `<li class="bd-order${selected ? ' is-selected' : ''}${o.incident ? ' has-incident' : ''}">
          <button type="button" class="bd-order-hit" data-order="${esc(o.id)}" aria-expanded="${selected}"><span class="bd-order-top"><strong>${esc(shortDepot(src))} → ${esc(provinceName(dst.province))}</strong><span class="bd-order-badges">${statusBadge(o)}</span></span>
          <span class="bd-order-meta">${esc(group.label)} · ${esc(qtyText(o.group, o.qty))} · nhận tại ${esc(receiverPlace(dst))} · ${esc(o.id)}</span></button>
          ${selected ? (mode === 'track' ? trackBody(o) : orderBody(o)) : ''}</li>`;
      }
      function orderBody(o) {
        const src = depot(o.source), dst = depot(o.target);
        const rows = [
          ['Nguồn lực', `${R.groups[o.group].label} · ${qtyText(o.group, o.qty)}`],
          ['Nguồn → nhận', `${src.name} → ${dst.name} (${provinceFull(dst.province)})`],
          ['Quãng đường', `${o.km} km · dự kiến ${RM.durationText(o.minutes)} · ${o.vehicle}`],
          ['Lộ trình', o.routeText || `${src.route} → ${dst.route}`],
          ['Cần có mặt trước', o.due ? stamp(o.due) : '—'],
          ['Người tạo', `${o.creator.name} · ${stamp(o.createdAt)}`],
        ];
        if (o.note) rows.push(['Ghi chú', o.note]);
        if (o.rejectReason) rows.push(['Lý do từ chối', o.rejectReason]);
        const actions = o.status === 'draft' ? `<button type="button" class="pf-btn pf-btn-primary pf-btn-sm" data-resume="${esc(o.id)}">${icon('pencil')}Tiếp tục soạn</button>`
          : o.status === 'pending' ? `${RM.canEdit(o, me) ? `<button type="button" class="pf-btn pf-btn-ghost pf-btn-sm" data-edit="${esc(o.id)}">Chỉnh sửa</button>` : ''}${RM.canReject(o, me) ? `<button type="button" class="pf-btn pf-btn-ghost pf-btn-sm is-danger" data-reject="${esc(o.id)}">Từ chối</button>` : ''}${RM.canApprove(o, me) ? `<button type="button" class="pf-btn pf-btn-green pf-btn-sm" data-approve="${esc(o.id)}">${icon('check')}Phê duyệt</button>` : '<span class="bd-order-note">Bạn là người tạo lệnh nên không phê duyệt được.</span>'}` : '';
        return `<div class="bd-order-body"><dl class="bd-order-dl">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${actions ? `<div class="bd-order-actions">${actions}</div>` : ''}</div>`;
      }
      function renderBalance() {
        const st = situation();
        const compact = Boolean(S.order);
        const provinces = balanceList().filter((p) => scopeOk(p.id));
        const dist = Object.entries(RM.LEVELS).map(([key, l]) => [key, l, provinces.filter((p) => p.level === key).length]);
        const counts = Object.fromEntries(Object.keys(RM.FILTERS).map((key) => [key, balanceOrders(key).length]));
        const list = balanceOrders();
        const stat = (cls, title, short, value, sub, extra = '') => `<div class="bd-stat${cls}"><span>${compact ? short : title}</span><strong>${value}</strong>${compact ? '' : `<small>${sub}</small>${extra}`}</div>`;
        $('#bd-res-balance').innerHTML = `<div class="bd-res-scroll">
          <div class="bd-sit-head"><h3>Tình hình ${esc(S.f.scope ? provinceFull(S.f.scope) : 'toàn quốc')}</h3><button type="button" class="bd-refresh" data-refresh title="Tự cập nhật 15 phút/lần">Cập nhật ${clock(S.updatedAt)}${icon('refresh')}</button></div>
          <div class="bd-stats${compact ? ' is-compact' : ''}">
            ${stat('', 'Người cần hỗ trợ', 'Cần hỗ trợ', fmt.format(st.need), `+${fmt.format(st.new24h)} trong 24 giờ`)}
            ${stat(' is-good', 'Đã được hỗ trợ', 'Đã hỗ trợ', fmt.format(st.supported), `${st.pct}% người cần hỗ trợ`, `<span class="bd-progress" aria-hidden="true"><i style="width:${Math.min(100, st.pct)}%"></i></span>`)}
            ${stat(' is-warn', 'Điểm đang thiếu nhân lực', 'Thiếu nhân lực', `${st.wards} xã`, `${st.staffProvinces} tỉnh · thiếu ${fmt.format(st.volunteersShort)} TNV`)}
            ${stat(' is-ok', 'Nguồn lực có thể điều phối', 'Điều phối được', `${st.depots} ĐTK dư`, `${st.trucks} xe · ${fmt.format(st.volunteers)} TNV sẵn sàng`)}
          </div>
          ${compact ? '' : `<div class="bd-dist"><p>Phân bổ ${provinces.length} tỉnh theo mức đáp ứng</p><div class="bd-dist-bar" role="img" aria-label="${dist.map(([, l, n]) => `${l.label} ${n}`).join(', ')}">${dist.filter(([, , n]) => n).map(([, l, n]) => `<i style="flex:${n};background:${l.color}"></i>`).join('')}</div><ul class="bd-dist-legend">${dist.map(([, l, n]) => `<li><span class="bd-level-dot" style="--c:${l.color}"></span>${esc(l.label)} <b>${n}</b></li>`).join('')}</ul></div>`}
          <div class="bd-orders-head"><h3>Điều phối nguồn lực</h3><button type="button" class="pf-btn pf-btn-primary pf-btn-sm" data-create>${icon('plus')}Tạo lệnh điều phối</button></div>
          <div class="bd-chips" role="group" aria-label="Lọc theo trạng thái lệnh">${Object.entries(RM.FILTERS).map(([key, f]) => `<button type="button" class="bd-chip" data-order-filter="${key}" aria-pressed="${S.orderFilter === key}">${esc(f.label)}<b>${counts[key]}</b></button>`).join('')}</div>
          ${list.length ? `<ul class="bd-order-list">${list.map((o) => orderCard(o, 'balance')).join('')}</ul>` : '<p class="bd-empty">Không tìm thấy dữ liệu phù hợp.</p>'}</div>`;
      }
      function selectOrder(id) {
        S.order = S.order === id ? null : id;
        if (S.sub === 'balance') closeBalancePopup({ restore: true });
        render();
        const o = selectedOrder();
        if (o?.path && map && o.status !== 'draft') map.fitBounds(L.latLngBounds(o.path), { ...app.pad(), maxZoom: 9, animate: false });
        $(`#bd-res-${S.sub} [data-order="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' });
      }
      $('#bd-res-balance').addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const d = target.dataset;
        if (d.refresh !== undefined) { refresh(); return; }
        if (d.create !== undefined) { openOrderDialog({ province: S.f.scope || null }); return; }
        if (d.orderFilter) { S.orderFilter = d.orderFilter; render(); return; }
        if (d.order) { selectOrder(d.order); return; }
        if (d.approve) approve(d.approve);
        if (d.reject) openAction('reject', d.reject);
        if (d.edit) openOrderDialog({ order: R.orders.find((o) => o.id === d.edit) });
        if (d.resume) openOrderDialog({ order: R.orders.find((o) => o.id === d.resume) });
      });
      // ---------- Theo dõi tuyến (SRS 3.9): nhãn lọc nhanh · tiến trình 7 mốc · phương tiện · Báo sự cố · nút chính đổi theo trạng thái ----------
      function trackBody(o) {
        const current = RM.MILESTONES.indexOf(o.status);
        const steps = RM.MILESTONES.map((ms, i) => {
          const h = ms === 'pending' ? [ms, o.createdAt, `${o.creator.name} · tạo lệnh`] : (o.history || []).find(([status]) => status === ms);
          return `<li class="${i < current ? 'is-done' : i === current ? 'is-current' : ''}"><strong>${RM.STATUSES[ms].label}</strong><small>${h ? `${esc(h[2])} · ${stamp(h[1])}` : 'Chưa tới'}</small></li>`;
        }).join('');
        const pct = Math.round(RM.progress(o, Date.now()) * 100);
        const escort = R.escorts.find((e) => e.id === o.escort);
        const plates = (o.plates.length ? o.plates : [o.vehicle]).map((plate) => `<li>${icon('truck')}<span>${esc(plate)}</span><b>${pct}%</b></li>`).join('');
        return `<div class="bd-order-body"><ol class="bd-timeline" aria-label="Tiến trình lệnh">${steps}</ol>
          <dl class="bd-order-dl"><div><dt>Phương tiện</dt><dd><ul class="bd-plates">${plates}</ul></dd></div><div><dt>Người áp tải</dt><dd>${esc(escort ? `${escort.name} · ${escort.phone}` : '—')}</dd></div><div><dt>Lộ trình</dt><dd>${esc(o.routeText || `${depot(o.source).route} → ${depot(o.target).route}`)}</dd></div>
          ${o.incident ? `<div class="is-incident"><dt>Sự cố</dt><dd>${esc(`${o.incident.type}: ${o.incident.text}`)}<small>${esc(o.incident.by)} · ${stamp(o.incident.at)}</small></dd></div>` : ''}${o.households ? `<div><dt>Đã phân phối</dt><dd>${fmt.format(o.households)} hộ</dd></div>` : ''}</dl></div>`;
      }
      function renderTrack() {
        const counts = Object.fromEntries(Object.keys(RM.TRACK_FILTERS).map((key) => [key, trackOrders(key).length]));
        const list = trackOrders();
        const o = selectedOrder();
        const next = o && RM.NEXT_ACTION[o.status];
        const canReport = o && ['approved', 'preparing', 'shipping', 'arrived'].includes(o.status);
        $('#bd-res-track').innerHTML = `<div class="bd-res-scroll">
          <div class="bd-chips" role="group" aria-label="Lọc nhanh lệnh">${Object.entries(RM.TRACK_FILTERS).map(([key, f]) => `<button type="button" class="bd-chip${key === 'incident' ? ' is-danger' : ''}" data-track-filter="${key}" aria-pressed="${S.trackFilter === key}">${esc(f.label)}<b>${counts[key]}</b></button>`).join('')}</div>
          ${list.length ? `<ul class="bd-order-list">${list.map((x) => orderCard(x, 'track')).join('')}</ul>` : '<p class="bd-empty">Không tìm thấy dữ liệu phù hợp.</p>'}</div>
          <div class="bd-res-foot"><button type="button" class="pf-btn pf-btn-ghost is-danger" data-incident ${canReport ? '' : 'disabled'}>Báo sự cố</button>${next ? `<button type="button" class="pf-btn pf-btn-primary" data-advance title="${esc(next.who)}">${esc(next.label)}</button>` : `<button type="button" class="pf-btn pf-btn-primary" disabled>${o ? 'Lệnh đã hoàn tất' : 'Chọn một lệnh'}</button>`}</div>`;
      }
      $('#bd-res-track').addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const d = target.dataset;
        if (d.trackFilter) { S.trackFilter = d.trackFilter; render(); return; }
        if (d.order) { selectOrder(d.order); return; }
        if (d.incident !== undefined && S.order) openAction('incident', S.order);
        if (d.advance !== undefined && S.order) advance(S.order);
      });

      // ---------- Chú giải trên bản đồ + dòng hướng dẫn ----------
      function renderLegend() {
        const legend = $('#bd-res-legend'), hint = $('#bd-res-hint');
        // Popup cân đối đang mở: ẩn chú giải và dòng hướng dẫn để không che bảng thừa/thiếu
        legend.hidden = !S.active || Boolean(balancePopup); hint.hidden = !S.active || S.sub !== 'balance' || Boolean(balancePopup);
        if (!S.active) return;
        const o = selectedOrder();
        let html = '';
        if (S.sub === 'hotspots') {
          const all = hotspotList({ ignorePriority: true });
          const on = Object.keys(RM.PRIORITIES).filter((key) => S.f.priorities.has(key));
          html = `<h2>Mức độ ưu tiên nhân đạo</h2><p>Đang lọc: ${esc(on.map((key) => RM.PRIORITIES[key].label).join(', ') || 'không mức nào')}</p><ul>${Object.entries(RM.PRIORITIES).map(([key, p]) => `<li class="${S.f.priorities.has(key) ? '' : 'is-off'}"><span class="bd-level-dot" style="--c:${p.color}"></span>${esc(p.short)}<b>${all.filter((h) => h.priority === key).length} tỉnh</b></li>`).join('')}</ul>`;
        } else if (S.sub === 'balance' && o && o.status !== 'draft') {
          html = `<h2>Lệnh đang chọn</h2><p>${esc(o.id)} · ${esc(RM.STATUSES[o.status].label)}</p><ul><li><span class="bd-line"></span>Lộ trình đề xuất</li><li><span class="bd-line is-dashed"></span>Đoạn đường gián đoạn</li><li><span class="bd-level-dot is-square" style="--c:#f2c230"></span>Màu tỉnh: mức đáp ứng (làm mờ)</li></ul>`;
        } else if (S.sub === 'balance') {
          html = `<h2>Mức đáp ứng theo tỉnh</h2><p>Hiện có ÷ Nhu cầu (từng nhóm)</p><ul>${Object.values(RM.LEVELS).map((l) => `<li><span class="bd-level-dot is-square" style="--c:${l.color}"></span>${esc(l.label)}<b>${esc(l.range)}</b></li>`).join('')}</ul>`;
        } else {
          const list = trackOrders('all');
          html = `<h2>Trạng thái lệnh điều phối</h2><p>Chỉ hiện lệnh đã phê duyệt trở đi</p><ul>${RM.TRACK_STATUSES.map((key) => `<li><span class="bd-line" style="--c:${RM.STATUSES[key].color}"></span>${esc(RM.STATUSES[key].label)}<b>${list.filter((x) => x.status === key).length}</b></li>`).join('')}</ul>`;
        }
        legend.innerHTML = html;
        hint.textContent = 'Chọn một tỉnh để xem bảng thừa/thiếu · Chọn một lệnh để xem tuyến';
      }
      function render() {
        if (!S.active) return;
        renderTools(); renderTree();
        subTabs.forEach((tab) => {
          const n = tab.dataset.sub === 'hotspots' ? hotspotList().length : tab.dataset.sub === 'balance' ? balanceOrders('all').length : trackOrders('all').length;
          tab.querySelector('[data-sub-count]').textContent = n;
        });
        if (S.sub === 'hotspots') renderHotspots();
        if (S.sub === 'balance') renderBalance();
        if (S.sub === 'track') renderTrack();
        renderMap(); renderLegend(); refreshBalancePopup();
      }
      // Số liệu tự cập nhật 15 phút/lần và khi bấm Cập nhật (SRS 3.5 #5)
      async function refresh() {
        try { R = await source.load(); R.orders.forEach(enrich); } catch { toast(MSG.TB15); return; }
        S.updatedAt = Date.now(); render();
      }
      setInterval(() => { if (S.active) refresh(); }, 15 * 60e3);

      // ==================== LỆNH ĐIỀU PHỐI: phê duyệt, từ chối, sự cố, cập nhật trạng thái ====================
      const by = () => `${me.name} · ${me.unit.replace('Trung ương Hội Chữ thập đỏ Việt Nam', 'TW Hội')}`;
      async function save(order) { try { await source.saveOrder(order); return true; } catch { toast(MSG.TB15); return false; } }
      async function approve(id) {
        const o = R.orders.find((x) => x.id === id);
        if (!o || !RM.canApprove(o, me)) return;
        Object.assign(o, { status: 'approved', approvedBy: me.name, history: [...o.history, ['approved', new Date().toISOString(), by()]] });
        if (!(await save(o))) return;
        toast(`Đã phê duyệt lệnh ${o.id}.`);
        render();
      }
      async function advance(id, extra = {}) {
        const o = R.orders.find((x) => x.id === id);
        const next = o && RM.NEXT_ACTION[o.status];
        if (!next) return;
        if (next.next === 'distributed' && extra.households === undefined) { openAction('distribute', id); return; }
        Object.assign(o, extra, { status: next.next, history: [...o.history, [next.next, new Date().toISOString(), extra.households ? `${by()} · ${fmt.format(extra.households)} hộ` : by()]] });
        if (!(await save(o))) return;
        toast(next.next === 'arrived' ? `Đã xác nhận lệnh ${o.id} đến điểm nhận.` : `Đã cập nhật lệnh ${o.id} sang trạng thái ${RM.STATUSES[next.next].label}.`);
        render();
      }
      // ---------- Hộp thoại thao tác: Từ chối (lý do bắt buộc) · Báo sự cố · Cập nhật phân phối ----------
      const actionDialog = $('#bd-action-dialog'), actionForm = $('#bd-action-form');
      let action = null;
      function openAction(kind, id) {
        action = { kind, id };
        const o = R.orders.find((x) => x.id === id);
        const head = (title, sub) => `<div class="bd-dialog-head"><div><h2 id="bd-action-title">${title}</h2><p class="bd-dialog-sub">${sub}</p></div><button type="button" class="bd-dialog-close" data-close aria-label="Đóng">${icon('close')}</button></div>`;
        const sub = `${esc(o.id)} · ${esc(R.groups[o.group].label)} · ${esc(qtyText(o.group, o.qty))} → ${esc(receiverPlace(depot(o.target)))}`;
        const foot = (label, danger) => `<div class="bd-dialog-foot"><button type="button" class="pf-btn pf-btn-ghost" data-close>Hủy</button><button type="submit" class="pf-btn ${danger ? 'pf-btn-primary' : 'pf-btn-green'}">${label}</button></div>`;
        if (kind === 'reject') actionForm.innerHTML = `${head('Từ chối lệnh điều phối', sub)}<div class="bd-dialog-body"><label class="pf-field" data-field="reason"><span>Lý do từ chối <i>*</i></span><textarea name="reason" rows="4" maxlength="1000" placeholder="Nhập lý do để báo lại người tạo lệnh"></textarea><span class="pf-field-error">${icon('alert')}${MSG.TB18}</span></label></div>${foot('Từ chối lệnh', true)}`;
        if (kind === 'incident') actionForm.innerHTML = `${head('Báo sự cố', sub)}<div class="bd-dialog-body"><p class="bd-dialog-text">Lệnh giữ nguyên trạng thái và được gắn cờ Sự cố; hệ thống báo người tạo và người phê duyệt.</p>
          <label class="pf-field" data-field="type"><span>Loại sự cố <i>*</i></span><span class="pf-input"><select name="type"><option value="">Chọn loại sự cố</option>${['Tắc đường', 'Hỏng xe', 'Thời tiết xấu', 'Hàng hư hỏng, thất thoát', 'Tai nạn', 'Khác'].map((t) => `<option>${t}</option>`).join('')}</select><svg class="icon pf-caret" aria-hidden="true"><use href="#chevron-down"/></svg></span><span class="pf-field-error">${icon('alert')}Vui lòng chọn loại sự cố.</span></label>
          <label class="pf-field" data-field="text"><span>Mô tả <i>*</i></span><textarea name="text" rows="3" maxlength="1000" placeholder="Vị trí, tình trạng, cần hỗ trợ gì"></textarea><span class="pf-field-error">${icon('alert')}Vui lòng nhập mô tả.</span></label>
          <label class="pf-field"><span>Ảnh</span><input type="file" name="photos" accept="image/*" multiple /></label></div>${foot('Gửi báo cáo sự cố', true)}`;
        if (kind === 'distribute') actionForm.innerHTML = `${head('Cập nhật phân phối', sub)}<div class="bd-dialog-body"><label class="pf-field" data-field="households"><span>Số hộ đã nhận <i>*</i></span><span class="pf-input"><input type="number" name="households" min="1" step="1" inputmode="numeric" /></span><span class="pf-field-error">${icon('alert')}Vui lòng nhập số hộ là số nguyên dương.</span></label></div>${foot('Cập nhật', false)}`;
        actionDialog.showModal();
        actionForm.querySelector('textarea, select, input')?.focus();
      }
      actionForm.addEventListener('click', (event) => { if (event.target.closest('[data-close]')) actionDialog.close(); });
      actionForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const o = R.orders.find((x) => x.id === action?.id);
        if (!o) return;
        const value = (name) => actionForm.elements[name]?.value.trim() || '';
        const invalid = (name, bad) => { actionForm.querySelector(`[data-field="${name}"]`)?.classList.toggle('is-invalid', bad); return bad; };
        if (action.kind === 'reject') {
          if (invalid('reason', !value('reason'))) { toast(MSG.TB18); return; }
          Object.assign(o, { status: 'rejected', rejectReason: value('reason'), history: [...o.history, ['rejected', new Date().toISOString(), by()]] });
          if (!(await save(o))) return;
          toast(`Đã từ chối lệnh ${o.id}.`);
        }
        if (action.kind === 'incident') {
          const missing = [invalid('type', !value('type')), invalid('text', !value('text'))].some(Boolean);
          if (missing) { toast(MSG.TB04); return; }
          o.incident = { type: value('type'), text: value('text'), photos: actionForm.elements.photos.files.length, at: new Date().toISOString(), by: me.name };
          if (!(await save(o))) return;
          toast(`Đã ghi nhận sự cố của lệnh ${o.id}.`);
        }
        if (action.kind === 'distribute') {
          const households = Number(value('households'));
          if (invalid('households', !(Number.isInteger(households) && households > 0))) { toast(MSG.TB04); return; }
          actionDialog.close();
          await advance(o.id, { households });
          return;
        }
        actionDialog.close();
        render();
      });

      // ==================== CỬA SỔ TẠO LỆNH ĐIỀU PHỐI (SRS 3.7, NL05–NL11, NL15, NL18) ====================
      const orderDialog = $('#bd-order-dialog'), form = $('#bd-order-form');
      let F = null;
      let queue = null;
      const sourcesFor = (f, exclude = []) => R.depots
        .filter((d) => f.program && f.group && d.programs.includes(f.program) && (d.available[f.group] || 0) > 0 && d.id !== f.target && d.status !== 'paused' && !exclude.includes(d.id))
        .map((d) => ({ d, km: RM.distanceKm(d, depot(f.target) || { lat: center(f.province)?.[0], lng: center(f.province)?.[1] }) }))
        .sort((a, b) => a.km - b.km);
      function pickVehicle(group, qty) {
        const options = R.vehicles[R.groups[group].vehicle];
        const needed = Math.max(1, Math.ceil((Number(qty) || 1) / CAPACITY[group]));
        return (options.find(([, n]) => n >= needed) || options.at(-1))[0];
      }
      // Gợi ý ĐTK đang dư, cùng chương trình, gần nhất cho tới khi đủ số đang thiếu
      function suggestRows(f) {
        let left = shortage(f.province, f.group);
        const rows = [];
        for (const { d } of sourcesFor(f)) {
          if (left <= 0 || rows.length >= 3) break;
          const qty = Math.min(left, d.available[f.group]);
          rows.push({ depot: d.id, qty, vehicle: pickVehicle(f.group, qty) });
          left -= qty;
        }
        return rows;
      }
      const targetsFor = (f) => R.depots.filter((d) => d.province === f.province && d.programs.includes(f.program) && d.status !== 'paused' && !Object.values(d.available).some((v) => v > 0));
      function openOrderDialog({ province = null, group = null, order = null } = {}) {
        const now = Date.now();
        if (order) {
          // NL11 Chỉnh sửa lệnh Chờ duyệt (một điểm nguồn) · NL06 mở lại nháp từ nhãn "Nháp"
          const dst = depot(order.target);
          F = { mode: order.status === 'draft' ? 'resume' : 'edit', orderId: order.id, program: order.program, province: dst.province, group: order.group, target: order.target, priority: order.priority, due: localInput(order.due),
            rows: order.rows ? order.rows.map((r) => ({ ...r })) : [{ depot: order.source, qty: order.qty, vehicle: order.vehicle }], escort: order.escort || '', note: order.note || '', notify: order.notify !== false, pick: false, dirty: false };
        } else {
          const p = province && R.provinces[province];
          const f = { mode: 'create', orderId: null, program: p?.program || S.f.program || '', province: province || '', group: group || '', target: '', priority: p?.priority || 'P2',
            due: localInput(now + 24 * 3600e3), rows: [], escort: '', note: '', notify: true, pick: !group, dirty: false };
          // NL15: bấm "+ Tạo lệnh điều phối" khi chưa chọn tỉnh/nhóm → thêm 3 trường bắt buộc Chương trình, Tỉnh nhận, Nhóm nguồn lực
          f.target = targetsFor(f)[0]?.id || '';
          if (f.group) f.rows = suggestRows(f);
          F = f;
        }
        renderOrderForm();
        if (!orderDialog.open) orderDialog.showModal();
        form.querySelector('select, input')?.focus();
      }
      function startQueue(provinceId) {
        const groups = RM.balanceRows(R.provinces[provinceId].balance, R.groups).filter((r) => r.short).map((r) => r.key);
        queue = { province: provinceId, groups, index: 0 };
        openOrderDialog({ province: provinceId, group: groups[0] });
      }
      function nextInQueue() {
        if (!queue) { orderDialog.close(); return; }
        queue.index += 1;
        if (queue.index >= queue.groups.length) { queue = null; orderDialog.close(); return; }
        openOrderDialog({ province: queue.province, group: queue.groups[queue.index] });
      }
      const eta = (row) => { const d = depot(row.depot), t = depot(F.target); return d && t ? Date.now() + RM.travelMinutes(RM.distanceKm(d, t)) * 60e3 : 0; };
      const check = () => {
        const depots = Object.fromEntries(R.depots.map((d) => [d.id, d]));
        // Chỉnh sửa lệnh Chờ duyệt: số lượng cũ của chính lệnh không tính là đã điều phối
        return RM.validateOrder({ ...F, due: F.due ? new Date(F.due).toISOString() : '' }, { shortage: shortage(F.province, F.group), depots, now: Date.now(), eta }, { submit: true });
      };
      function select(name, options, value, placeholder) {
        return `<span class="pf-input"><select name="${name}">${placeholder ? `<option value="">${placeholder}</option>` : ''}${options.map(([v, text]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select><svg class="icon pf-caret" aria-hidden="true"><use href="#chevron-down"/></svg></span>`;
      }
      function rowHtml(row, i) {
        const d = depot(row.depot), t = depot(F.target);
        const avail = d ? d.available[F.group] || 0 : 0;
        const km = d && t ? RM.distanceKm(d, t) : null;
        const chosen = F.rows.map((r) => r.depot).filter((id, j) => id && j !== i);
        const cell = d ? `<strong>${esc(d.name)}</strong><small>${esc(d.route)}</small>` : select(`row-depot-${i}`, sourcesFor(F, chosen).map(({ d: x, km: dist }) => [x.id, `${x.name} · khả dụng ${fmt.format(x.available[F.group])} · ${dist} km`]), '', 'Chọn điểm tập kết nguồn');
        const vehicles = R.vehicles[R.groups[F.group].vehicle].map(([text]) => [text, text]);
        return `<tr data-row="${i}"><td>${cell}</td><td class="is-num">${d ? fmt.format(avail) : '—'}</td><td data-dist="${i}">${km !== null ? `${km} km · ${RM.shortDuration(RM.travelMinutes(km))}` : '—'}</td>
          <td><span class="pf-input is-num"><input type="number" name="row-qty-${i}" min="1" step="1" inputmode="numeric" value="${esc(row.qty)}" aria-label="Số lượng từ ${esc(d?.name || 'điểm nguồn')}" ${d ? '' : 'disabled'} /></span></td>
          <td>${select(`row-vehicle-${i}`, vehicles, row.vehicle, 'Chọn')}</td><td class="is-num" data-remain="${i}"></td>
          <td>${F.mode === 'edit' ? '' : `<button type="button" class="bd-row-remove" data-row-remove="${i}" aria-label="Bỏ dòng">${icon('close')}</button>`}</td></tr>`;
      }
      function renderOrderForm() {
        const g = R.groups[F.group];
        const lack = shortage(F.province, F.group);
        const title = F.mode === 'edit' ? `Chỉnh sửa lệnh ${F.orderId}` : F.mode === 'resume' ? `Tiếp tục lệnh nháp ${F.orderId}` : 'Tạo lệnh điều phối';
        const context = g && F.province ? `${esc(g.label)} → ${esc(provinceFull(F.province))} · đang thiếu <b>${esc(qtyText(F.group, lack))}</b> · Chương trình: ${esc(programName(F.program))}` : 'Chọn chương trình, tỉnh nhận và nhóm nguồn lực để hệ thống gợi ý nguồn cung.';
        const provinces = Object.entries(R.provinces).filter(([, p]) => p.program === F.program && Object.values(p.balance).some(([n, h]) => h < n)).map(([id]) => [id, provinceFull(id)]);
        const groups = F.province ? RM.balanceRows(R.provinces[F.province].balance, R.groups).filter((r) => r.short).map((r) => [r.key, `${r.label} · thiếu ${fmt.format(-r.diff)} ${r.unit}`]) : [];
        const escorts = R.escorts.filter((e) => F.rows.some((r) => r.depot === e.depot)).map((e) => [e.id, `${e.name} · ${depot(e.depot).unit}`]);
        form.innerHTML = `<div class="bd-dialog-head"><div><h2 id="bd-order-title">${title}</h2><p class="bd-dialog-sub">${context}</p></div>${queue ? `<span class="pf-badge is-blue">Nhóm ${queue.index + 1}/${queue.groups.length}</span>` : ''}<button type="button" class="bd-dialog-close" data-cancel aria-label="Đóng">${icon('close')}</button></div>
          <div class="bd-dialog-body">
            ${F.pick ? `<div class="bd-form-grid">
              <label class="pf-field" data-field="program"><span>Chương trình <i>*</i></span>${select('program', R.programs.map((p) => [p.id, p.name]), F.program, 'Chọn chương trình')}</label>
              <label class="pf-field" data-field="province"><span>Tỉnh nhận <i>*</i></span>${select('province', provinces, F.province, F.program ? 'Chọn tỉnh nhận' : 'Chọn chương trình trước')}</label>
              <label class="pf-field" data-field="group"><span>Nhóm nguồn lực <i>*</i></span>${select('group', groups, F.group, F.province ? 'Chọn nhóm đang thiếu' : 'Chọn tỉnh nhận trước')}</label></div>` : ''}
            ${g ? `<div class="bd-form-grid">
              <label class="pf-field" data-field="target"><span>Điểm nhận <i>*</i></span>${select('target', targetsFor(F).map((d) => [d.id, d.name]), F.target, 'Chọn điểm nhận')}<span class="pf-field-error">${icon('alert')}Vui lòng chọn điểm nhận.</span></label>
              <label class="pf-field"><span>Mức ưu tiên</span>${select('priority', Object.entries(RM.PRIORITIES).map(([k, p]) => [k, p.short]), F.priority)}</label>
              <label class="pf-field" data-field="due"><span>Cần có mặt trước <i>*</i></span><span class="pf-input"><input type="datetime-local" name="due" value="${esc(F.due)}" min="${localInput(Date.now())}" /></span><span class="pf-field-error">${icon('alert')}${MSG.due}</span></label></div>
            <section class="bd-supply"><h3>Nguồn cung <small>Hệ thống gợi ý điểm tập kết đang dư, cùng chương trình, gần nhất</small></h3>
              <div class="bd-supply-scroll"><table class="bd-supply-table"><thead><tr><th scope="col">ĐTK nguồn</th><th scope="col">Khả dụng</th><th scope="col">Quãng đường</th><th scope="col">Số lượng <i>*</i></th><th scope="col">Phương tiện <i>*</i></th><th scope="col">Còn lại</th><th scope="col"><span class="visually-hidden">Thao tác</span></th></tr></thead>
              <tbody>${F.rows.map(rowHtml).join('') || `<tr><td colspan="7" class="bd-supply-empty">Không có điểm tập kết nào cùng chương trình còn khả dụng ${esc(g.label.toLowerCase())}.</td></tr>`}</tbody>
              <tfoot><tr><th scope="row" colspan="3">Tổng</th><td id="bd-order-total" colspan="2"></td><td colspan="2"></td></tr></tfoot></table></div>
              ${F.mode === 'edit' || !sourcesFor(F, F.rows.map((r) => r.depot)).length ? '' : '<button type="button" class="md-link" data-add-row>+ Thêm điểm tập kết nguồn</button>'}
            </section>
            <div class="bd-form-grid is-2">
              <section class="bd-checks"><h3>Kiểm tra hợp lệ</h3><ul id="bd-order-checks" aria-live="polite"></ul></section>
              <div class="bd-form-col">
                <label class="pf-field" data-field="escort"><span>Người áp tải <i>*</i></span>${select('escort', escorts, F.escort, escorts.length ? 'Chọn người áp tải' : 'Chọn điểm nguồn trước')}<span class="pf-field-error">${icon('alert')}Bắt buộc khi gửi phê duyệt.</span></label>
                <label class="pf-field"><span>Ghi chú</span><textarea name="note" rows="3" maxlength="1000" placeholder="Không bắt buộc, tối đa 1000 ký tự">${esc(F.note)}</textarea><small class="bd-counter" id="bd-note-count">${F.note.length}/1000</small></label>
                <label class="bd-check"><input type="checkbox" name="notify" ${F.notify ? 'checked' : ''} /><span>Thông báo cho người phụ trách điểm nguồn, điểm nhận và người áp tải</span></label>
              </div>
            </div>` : ''}
          </div>
          <div class="bd-dialog-foot">${queue ? '<button type="button" class="pf-btn pf-btn-ghost" data-skip>Bỏ qua nhóm này</button>' : ''}<span class="bd-dialog-spacer"></span><button type="button" class="pf-btn pf-btn-ghost" data-cancel>Hủy</button>${F.mode === 'edit' ? '' : '<button type="button" class="pf-btn pf-btn-ghost" data-draft>Lưu nháp</button>'}<button type="submit" class="pf-btn pf-btn-primary" ${g ? '' : 'disabled'}>${F.mode === 'edit' ? 'Lưu thay đổi' : 'Tạo lệnh &amp; gửi phê duyệt'}</button></div>`;
        updateComputed();
      }
      // Tính Còn lại, Tổng; cập nhật Kiểm tra hợp lệ (bước 16)
      function updateComputed() {
        const g = R.groups[F.group];
        if (!g) return;
        const lack = shortage(F.province, F.group);
        const v = check();
        F.rows.forEach((row, i) => {
          const d = depot(row.depot);
          const remain = d ? (d.available[F.group] || 0) - (Number(row.qty) || 0) : null;
          const cell = form.querySelector(`[data-remain="${i}"]`);
          if (cell) { cell.textContent = remain === null ? '—' : fmt.format(remain); cell.classList.toggle('is-neg', remain !== null && remain < 0); }
        });
        const vehicles = F.rows.reduce((n, row) => n + (R.vehicles[g.vehicle].find(([text]) => text === row.vehicle)?.[1] || 0), 0);
        $('#bd-order-total').innerHTML = `<b class="${v.total > lack ? 'is-neg' : ''}">${fmt.format(v.total)} / ${fmt.format(lack)} ${esc(g.unit)}</b> · ${vehicles} xe`;
        const ok = (text) => `<li class="is-ok">${icon('check')}<span>${text}</span></li>`;
        const bad = (text) => `<li class="is-error">${icon('close')}<span>${text}</span></li>`;
        const warn = (text) => `<li class="is-warn">${icon('alert')}<span>${text}</span></li>`;
        const items = [];
        if (v.total > lack) items.push(bad(`${MSG.TB05} (${fmt.format(v.total)} / ${fmt.format(lack)})`));
        else if (v.total === lack && lack > 0) items.push(ok(`Tổng số lượng bằng số đang thiếu (${fmt.format(v.total)} / ${fmt.format(lack)}).`));
        else items.push(warn(`Tổng số lượng điều phối ${fmt.format(v.total)} / ${fmt.format(lack)} – còn thiếu ${fmt.format(lack - v.total)}.`));
        items.push(v.errors.includes('TB07') ? bad(MSG.TB07) : ok('Điểm tập kết nguồn và nơi nhận cùng chương trình.'));
        items.push(v.errors.includes('TB06') ? bad(MSG.TB06) : ok('Không điểm tập kết nào âm khả dụng sau điều phối.'));
        if (v.errors.includes('qty')) items.push(bad(MSG.qty));
        v.late.forEach((id) => {
          const arrive = eta(F.rows.find((r) => r.depot === id)), late = Math.round((arrive - Date.parse(new Date(F.due).toISOString())) / 60e3);
          items.push(warn(`${esc(shortDepot(depot(id)))}: thời gian dự kiến đến ${clock(arrive)} – muộn hơn yêu cầu ${RM.durationText(late)}.`));
        });
        $('#bd-order-checks').innerHTML = items.join('');
      }
      function markInvalid(v) {
        const set = (name, bad) => form.querySelector(`[data-field="${name}"]`)?.classList.toggle('is-invalid', bad);
        set('target', !F.target); set('due', !F.due || v.errors.includes('due')); set('escort', !F.escort);
        set('program', !F.program); set('province', !F.province); set('group', !F.group);
        F.rows.forEach((row, i) => form.querySelector(`[name="row-qty-${i}"]`)?.closest('.pf-input').classList.toggle('is-invalid', !(Number(row.qty) > 0) || v.over.includes(row.depot)));
      }
      form.addEventListener('input', (event) => {
        const { name, value } = event.target;
        if (!name) return;
        F.dirty = true;
        const qty = name.match(/^row-qty-(\d+)$/), vehicle = name.match(/^row-vehicle-(\d+)$/);
        if (qty) { F.rows[qty[1]].qty = value === '' ? '' : Number(value); updateComputed(); return; }
        if (vehicle) { F.rows[vehicle[1]].vehicle = value; updateComputed(); return; }
        if (name === 'note') { F.note = value; $('#bd-note-count').textContent = `${value.length}/1000`; return; }
        if (name === 'notify') { F.notify = event.target.checked; return; }
        if (['priority', 'due', 'escort'].includes(name)) { F[name] = value; updateComputed(); return; }
      });
      form.addEventListener('change', (event) => {
        const { name, value } = event.target;
        const depotPick = name?.match(/^row-depot-(\d+)$/);
        if (depotPick) { const row = F.rows[depotPick[1]]; row.depot = value; const d = depot(value); row.qty = d ? Math.min(d.available[F.group], Math.max(0, shortage(F.province, F.group) - check().total)) || '' : ''; row.vehicle = d ? pickVehicle(F.group, row.qty || 1) : ''; renderOrderForm(); return; }
        if (name === 'program') { Object.assign(F, { program: value, province: '', group: '', target: '', rows: [], escort: '' }); renderOrderForm(); return; }
        if (name === 'province') { Object.assign(F, { province: value, group: '', target: '', rows: [], escort: '', priority: R.provinces[value]?.priority || 'P2' }); renderOrderForm(); return; }
        if (name === 'group') { F.group = value; F.target = targetsFor(F)[0]?.id || ''; F.rows = value ? suggestRows(F) : []; F.escort = ''; renderOrderForm(); return; }
        if (name === 'target') { F.target = value; renderOrderForm(); }
      });
      form.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-row-remove]');
        if (remove) { F.rows.splice(Number(remove.dataset.rowRemove), 1); F.dirty = true; if (!F.rows.some((r) => r.depot && R.escorts.find((e) => e.id === F.escort)?.depot === r.depot)) F.escort = ''; renderOrderForm(); return; }
        if (event.target.closest('[data-add-row]')) { F.rows.push({ depot: '', qty: '', vehicle: '' }); F.dirty = true; renderOrderForm(); form.querySelector(`[name="row-depot-${F.rows.length - 1}"]`)?.focus(); return; }
        if (event.target.closest('[data-cancel]')) { cancelOrder(); return; }
        if (event.target.closest('[data-skip]')) { nextInQueue(); return; }
        if (event.target.closest('[data-draft]')) saveDraft();
      });
      // NL05: Hủy / nút đóng / Esc → hỏi xác nhận nếu đã nhập dữ liệu
      function cancelOrder() {
        if (F?.dirty) { $('#bd-confirm-dialog').showModal(); $('#bd-confirm-keep').focus(); return; }
        queue = null; orderDialog.close();
      }
      orderDialog.addEventListener('cancel', (event) => { event.preventDefault(); cancelOrder(); });
      $('#bd-confirm-keep').addEventListener('click', () => $('#bd-confirm-dialog').close());
      $('#bd-confirm-discard').addEventListener('click', () => { $('#bd-confirm-dialog').close(); queue = null; orderDialog.close(); });
      const via = (src, dst) => { const mid = [(src.lat + dst.lat) / 2, (src.lng + dst.lng) / 2]; const k = .12; return [[mid[0] - (dst.lng - src.lng) * k, mid[1] + (dst.lat - src.lat) * k]]; };
      // NL06 Lưu nháp: cần đã chọn Điểm nhận; chỉ người tạo xem được, mở lại từ nhãn "Nháp"
      async function saveDraft() {
        if (!F.target) { markInvalid(check()); toast('Vui lòng chọn Điểm nhận trước khi lưu nháp.'); return; }
        const first = F.rows.find((r) => r.depot) || {};
        const existing = F.mode === 'resume' ? R.orders.find((o) => o.id === F.orderId) : null;
        const draft = enrich(Object.assign(existing || { id: RM.nextOrderId(R.orders, new Date().getFullYear()), creator: me, createdAt: new Date().toISOString(), history: [], plates: [], incident: null }, {
          status: 'draft', program: F.program, group: F.group, qty: F.rows.reduce((n, r) => n + (Number(r.qty) || 0), 0), source: first.depot || F.target, target: F.target, rows: F.rows.map((r) => ({ ...r })),
          priority: F.priority, due: F.due ? new Date(F.due).toISOString() : '', vehicle: first.vehicle || '', vehicleCount: 0, escort: F.escort, note: F.note, notify: F.notify, via: [] }));
        if (!(await save(draft))) return;
        toast(MSG.TB10);
        F.dirty = false; queue = null; orderDialog.close();
        S.orderFilter = 'draft'; S.order = draft.id;
        if (S.sub !== 'balance') setSub('balance'); else render();
      }
      // Bước 17–18: kiểm tra; hợp lệ → tạo một lệnh cho mỗi điểm nguồn, trạng thái Chờ duyệt, gửi thông báo (TB09)
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const v = check();
        markInvalid(v);
        if (!v.ok) { toast(MSG[['TB04', 'due', 'qty', 'TB05', 'TB06', 'TB07'].find((code) => v.errors.includes(code))]); return; }
        const common = { program: F.program, group: F.group, target: F.target, priority: F.priority, due: new Date(F.due).toISOString(), escort: F.escort, note: F.note, notify: F.notify };
        const count = (row) => R.vehicles[R.groups[F.group].vehicle].find(([text]) => text === row.vehicle)?.[1] || 0;
        if (F.mode === 'edit') {
          const o = R.orders.find((x) => x.id === F.orderId);
          const row = F.rows[0];
          enrich(Object.assign(o, common, { source: row.depot, qty: Number(row.qty), vehicle: row.vehicle, vehicleCount: count(row), via: via(depot(row.depot), depot(F.target)) }));
          if (!(await save(o))) return;
          toast(`Đã cập nhật lệnh ${o.id}.`);
          F.dirty = false; orderDialog.close(); S.order = o.id; render(); return;
        }
        if (F.mode === 'resume') R.orders.splice(R.orders.findIndex((o) => o.id === F.orderId), 1);
        const created = [];
        for (const row of F.rows) {
          const o = enrich({ ...common, id: RM.nextOrderId(R.orders, new Date().getFullYear()), source: row.depot, qty: Number(row.qty), vehicle: row.vehicle, vehicleCount: count(row), status: 'pending',
            creator: me, createdAt: new Date().toISOString(), history: [], plates: [], incident: null, via: via(depot(row.depot), depot(F.target)) });
          if (!(await save(o))) return;
          created.push(o.id);
        }
        toast(`Đã tạo lệnh điều phối ${created.join(', ')} và gửi phê duyệt.`);
        F.dirty = false;
        S.order = created[0]; S.orderFilter = 'all';
        if (S.sub !== 'balance') setSub('balance'); else render();
        if (queue) nextInQueue(); else orderDialog.close();
      });

      // ==================== XUẤT DANH SÁCH ĐIỂM NÓNG (NL14): tệp .xlsx theo bộ lọc đang chọn ====================
      function crc32(bytes) {
        let crc = -1;
        for (const byte of bytes) { crc ^= byte; for (let k = 0; k < 8; k += 1) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1)); }
        return (crc ^ -1) >>> 0;
      }
      // Gói zip không nén (store) đủ cho tệp Office Open XML
      function zip(files) {
        const enc = new TextEncoder(), parts = [], central = [];
        let offset = 0;
        files.forEach(({ name, text }) => {
          const nameBytes = enc.encode(name), body = enc.encode(text), crc = crc32(body);
          const local = new DataView(new ArrayBuffer(30));
          [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, 0, 2], [12, 0x21, 2], [14, crc, 4], [18, body.length, 4], [22, body.length, 4], [26, nameBytes.length, 2], [28, 0, 2]].forEach(([at, v, size]) => size === 4 ? local.setUint32(at, v, true) : local.setUint16(at, v, true));
          const entry = new DataView(new ArrayBuffer(46));
          [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, 0, 2], [14, 0x21, 2], [16, crc, 4], [20, body.length, 4], [24, body.length, 4], [28, nameBytes.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]].forEach(([at, v, size]) => size === 4 ? entry.setUint32(at, v, true) : entry.setUint16(at, v, true));
          parts.push(new Uint8Array(local.buffer), nameBytes, body);
          central.push(new Uint8Array(entry.buffer), nameBytes);
          offset += 30 + nameBytes.length + body.length;
        });
        const size = central.reduce((n, part) => n + part.length, 0);
        const end = new DataView(new ArrayBuffer(22));
        [[0, 0x06054b50, 4], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, offset, 4]].forEach(([at, v, s]) => s === 4 ? end.setUint32(at, v, true) : end.setUint16(at, v, true));
        return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }
      function xlsx(rows, sheet) {
        const xml = (value) => String(value).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
        const col = (i) => String.fromCharCode(65 + i);
        const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, r) => `<row r="${r + 1}">${row.map((v, c) => typeof v === 'number' ? `<c r="${col(c)}${r + 1}"><v>${v}</v></c>` : `<c r="${col(c)}${r + 1}" t="inlineStr"><is><t>${xml(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
        return zip([
          { name: '[Content_Types].xml', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
          { name: '_rels/.rels', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
          { name: 'xl/workbook.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xml(sheet)}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
          { name: 'xl/_rels/workbook.xml.rels', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
          { name: 'xl/worksheets/sheet1.xml', text: sheetXml },
        ]);
      }
      function exportHotspots() {
        const list = hotspotList();
        const rows = [['Mức ưu tiên', 'Tỉnh, thành phố', 'Loại thiên tai', 'HPS', 'Ảnh hưởng (người)', 'Chưa hỗ trợ (người)', 'Xã nóng nhất', 'Nhóm nhu cầu'],
          ...list.map((h) => [RM.PRIORITIES[h.priority].short, provinceFull(h.id), h.hazard, h.hps, h.affected, h.unsupported, h.hotWards, h.needs.join(', ')])];
        const today = new Date();
        const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(xlsx(rows, 'Điểm nóng')), download: `diem-nong-${today.getFullYear()}${two(today.getMonth() + 1)}${two(today.getDate())}.xlsx` });
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      }

      // ==================== KÍCH HOẠT: chuyển tab Tổng quan ↔ Nguồn lực ====================
      app.onTab((tab) => {
        S.active = tab === 'resources';
        if (!S.active) {
          closeBalancePopup({ restore: true });
          if (map && root && map.hasLayer(root)) map.removeLayer(root);
          $('#bd-res-legend').hidden = true; $('#bd-res-hint').hidden = true;
          return;
        }
        app.closeOverviewPopup();
        if (map && root && !map.hasLayer(root)) root.addTo(map);
        if (map && !S.fitted) { S.fitted = true; map.fitBounds(VIETNAM, { ...app.pad(), animate: false }); }
        render();
      });
      // Kiểm thử: xuất trạng thái để đối chiếu
      window.DigitalMapResources.debug = { state: S, data: () => R, xlsx };
    },
  };
})();
