// Kiểm thử trình duyệt: SRS "Bản đồ số – Người yếu thế, chương trình và bảng cân đối nguồn lực"
// Chạy: MAP_TEST_URL=http://127.0.0.1:5501/ban-do-so.html node tests/ban-do-so-nguon-luc-browser.test.cjs
const fs = require('node:fs'); const path = require('node:path'); process.chdir(path.resolve(__dirname, '..')); fs.mkdirSync('tmp/map', { recursive: true });
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = process.env.MAP_TEST_URL || 'http://127.0.0.1:5501/ban-do-so.html';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  // Trang chính chạy chế độ cán bộ (có thao tác) để kiểm luồng tạo / duyệt / từ chối / theo dõi; chế độ chỉ xem (mặc định) kiểm ở trang riêng
  await page.addInitScript(() => { window.DigitalMapResourceConfig = { staffMode: true }; });
  let checks = 0; const check = async (name, fn) => { await fn(); checks += 1; console.log('PASS ' + name); };
  const toast = async () => (await page.locator('#bd-toast').textContent()).trim();
  const search = async (text) => { await page.locator('#bd-search').fill(text); await page.waitForTimeout(650); };
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-record]').first().waitFor();

  // ==================== Tab Tổng quan ====================
  await check('"Bật tất cả" turns on every layer including Trạm sơ cấp cứu, then becomes "Tắt tất cả"', async () => {
    await page.locator('#bd-layers-all').click();
    assert.equal(await page.locator('[data-layer]:not(:checked)').count(), 0);
    assert.equal(await page.locator('#bd-layers-all').textContent(), 'Tắt tất cả');
    assert.equal(await page.locator('[data-layer="firstaid"]').count(), 1);
  });
  await check('List rows show layer name; vulnerable rows show code · group, never a name', async () => {
    await search('NYT-HN-0012845');
    const row = page.locator('#bd-rows tr').first();
    assert.match(await row.locator('.bd-row-name').textContent(), /^NYT-HN-0012845 · /);
    assert.equal(await row.locator('.bd-row-layer').textContent(), 'Người yếu thế');
  });
  await check('Vulnerable detail popup without permission note; new-tab detail link', async () => {
    await page.locator('[data-record]').first().click();
    await page.locator('.bd-popup h3', { hasText: 'Hồ sơ NYT-HN-0012845' }).waitFor();
    assert(!(await page.locator('.bd-popup').textContent()).includes('ghi nhật ký'));
    assert.equal(await page.locator('.bd-popup a', { hasText: 'Xem thông tin chi tiết' }).getAttribute('target'), '_blank');
    await page.locator('#bd-exit-focus').click();
  });
  await check('Vulnerable ward list: ward title, 3 columns; no permission → TB02 and list stays', async () => {
    await search('');
    await page.locator('#bd-layers-all').click(); // tắt tất cả
    await page.locator('[data-layer="vulnerable"]').check();
    await page.selectOption('#bd-province', '1'); await page.selectOption('#bd-ward', '376');
    // Gom theo xã: 4 hồ sơ ở số nhà 12 thôn Đông Xuân + 2 ở thôn Thắng Trí → một biểu tượng "6" của xã Sóc Sơn
    await page.locator('.bd-cluster-host.is-ward', { hasText: '6' }).first().click();
    await page.locator('[data-point-record]').first().waitFor();
    assert.equal(await page.locator('.bd-popup h3').first().textContent(), 'Xã Sóc Sơn, Thành phố Hà Nội');
    assert.deepEqual(await page.locator('.bd-popup-table th').allTextContents(), ['Mã hồ sơ', 'Nhóm đối tượng', 'Mức độ cấp thiết']);
    await page.locator('[data-point-record="vulnerable-12851"]').click();
    await page.waitForTimeout(200);
    assert.equal(await toast(), 'Bạn không có quyền xem hồ sơ người yếu thế.');
    assert.equal(await page.locator('[data-point-record]').count(), 6);
    await page.locator('[data-point-record="vulnerable-12845"]').click();
    await page.locator('[data-back-list]').waitFor();
    await page.locator('[data-back-list]').click();
    assert.equal(await page.locator('[data-point-record]').count(), 6);
    await page.locator('.leaflet-popup-close-button').click();
  });
  await check('Goods popup: status, thumbnails +N, goods table with expiry warning, program link in new tab', async () => {
    await page.locator('#bd-reset').click(); await page.locator('[data-layer="goods"]').check();
    await search('Đông Anh');
    await page.locator('[data-record="goods-d-hn-da"]').click();
    await page.locator('.bd-goods').waitFor();
    assert.equal(await page.locator('.bd-popup .pf-badge', { hasText: 'Đang hoạt động' }).count(), 1);
    assert.match(await page.locator('.bd-thumb b').textContent(), /^\+\d+$/);
    assert.deepEqual(await page.locator('.bd-goods th').allTextContents(), ['Loại', 'Hàng hóa', 'Tồn hiện tại', 'Đã phân phát', 'HSD']);
    assert(await page.locator('.bd-expiry').count() >= 1);
    assert.equal(await page.locator('.bd-popup a', { hasText: 'Xem chương trình' }).getAttribute('target'), '_blank');
    await page.screenshot({ path: 'tmp/map/srs-goods-popup.png' });
    await page.locator('#bd-exit-focus').click();
  });
  await check('Program popup: only active/done programs, copy link → TB03', async () => {
    await page.locator('[data-layer="programs"]').check();
    await search('Sơn Tây');
    assert.equal(await page.locator('#bd-rows tr', { hasText: 'Bữa cơm yêu thương' }).count(), 0);
    await page.locator('#bd-rows button', { hasText: 'Áo ấm cho em vùng cao 2026' }).click();
    await page.locator('[data-copy-link]').click();
    await page.waitForTimeout(200);
    assert.equal(await toast(), 'Đã sao chép link chương trình.');
    await page.locator('#bd-exit-focus').click();
  });
  await check('Time filter: 7 days hides finished programs; custom range validates and applies', async () => {
    await search('');
    const before = Number((await page.locator('[data-count="programs"]').textContent()));
    await page.selectOption('#bd-time', '7d');
    assert(Number(await page.locator('[data-count="programs"]').textContent()) < before);
    await page.selectOption('#bd-time', 'custom');
    await page.locator('#bd-time-from').fill('2026-10-10'); await page.locator('#bd-time-to').fill('2026-10-01');
    await page.locator('#bd-time-apply').click();
    assert.equal(await page.locator('#bd-time-error').textContent(), 'Ngày bắt đầu phải trước ngày kết thúc.');
    await page.locator('#bd-time-to').fill('2026-12-31'); await page.locator('#bd-time-apply').click();
    assert(await page.locator('#bd-time-pop').isHidden());
    assert.equal(await page.locator('#bd-time option[value="custom"]').textContent(), '10/10 – 31/12');
    await page.locator('#bd-reset').click();
    assert.equal(await page.locator('#bd-time').inputValue(), '');
  });

  // ==================== Tab Nguồn lực ====================
  await page.locator('#bd-tab-resources').click();
  await check('Resources tab swaps toolbar, right column and hides overview markers', async () => {
    assert(await page.locator('#bd-search').isHidden());
    assert(await page.locator('#bd-res-tools').isVisible());
    assert(await page.locator('#bd-res-card').isVisible());
    assert(await page.locator('.bd-results-card').isHidden());
    assert.equal(await page.locator('.bd-pin-host').count(), 0);
  });
  await check('Hotspots: default Khẩn cấp + Cao, sorted by HPS; priority filter shows counts per level and toggles cards', async () => {
    assert.equal(await page.locator('[data-sub-count="hotspots"]').textContent(), '6');
    const hps = (await page.locator('.bd-hps').allTextContents()).map((t) => Number(t.replace('HPS ', '')));
    assert.deepEqual(hps, [...hps].sort((a, b) => b - a));
    await page.locator('#bd-res-priority-picker summary').click();
    assert.deepEqual(await page.locator('[data-priority-count]').allTextContents(), ['2 tỉnh', '4 tỉnh', '5 tỉnh', '3 tỉnh']);
    await page.locator('#bd-res-priority-options input[value="P3"]').check();
    assert.equal(await page.locator('.bd-hot-card').count(), 11);
    assert((await page.locator('#bd-res-priority-value').textContent()).includes('Trung bình'));
    await page.locator('#bd-res-priority-options input[value="P3"]').uncheck();
    await page.locator('#bd-res-priority-picker summary').click();
  });
  await check('Export hotspots downloads an .xlsx workbook (NL14)', async () => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-export]').click()]);
    assert.match(download.suggestedFilename(), /^diem-nong-\d{8}\.xlsx$/);
    const file = 'tmp/map/' + download.suggestedFilename();
    await download.saveAs(file);
    const bytes = fs.readFileSync(file);
    assert.equal(bytes.subarray(0, 2).toString(), 'PK');
    assert(bytes.includes(Buffer.from('xl/worksheets/sheet1.xml')) && bytes.includes(Buffer.from('Quảng Trị')));
  });
  await check('"Xem cân đối tỉnh" opens the province balance popup; scope follows the province and restores on close', async () => {
    await page.locator('[data-hotspot="8"]').click();
    await page.locator('[data-view-balance]').click();
    await page.locator('.bd-balance').waitFor();
    assert.equal(await page.locator('#bd-res-scope').inputValue(), '8');
    assert.equal(await page.locator('.bd-balance tbody tr').count(), 7);
    assert.equal(await page.locator('[data-dispatch]').count(), 5);
    assert((await page.locator('.bd-balance-foot').textContent()).includes('5/7 nhóm đang thiếu'));
    await page.screenshot({ path: 'tmp/map/srs-balance-popup.png' });
    await page.locator('.bd-popup.is-balance .leaflet-popup-close-button').click();
    assert.equal(await page.locator('#bd-res-scope').inputValue(), '');
  });
  await check('Create order: suggestions prefilled; missing escort → TB04; over shortage → TB05 check', async () => {
    assert.equal(await page.locator('#bd-sub-balance').getAttribute('aria-selected'), 'true');
    await page.locator('#bd-res-scope').selectOption('8');
    await page.locator('[data-create]').click();
    await page.locator('#bd-order-dialog[open]').waitFor();
    await page.locator('#bd-order-form select[name="group"]').selectOption('water');
    assert(await page.locator('#bd-order-form [name^="row-qty-"]').count() >= 1);
    assert.match(await page.locator('#bd-order-total').textContent(), /4\.000 \/ 4\.000 thùng/);
    await page.locator('#bd-order-form [type="submit"]').click();
    assert.equal(await toast(), 'Vui lòng nhập đầy đủ thông tin bắt buộc.');
    assert(await page.locator('#bd-order-form [data-field="escort"]').evaluate((el) => el.classList.contains('is-invalid')));
    await page.locator('#bd-order-form [name="row-qty-0"]').fill('5000');
    assert.equal(await page.locator('#bd-order-checks .is-error').count() >= 1, true);
    await page.locator('#bd-order-form [name="row-qty-0"]').fill('4000');
  });
  await check('Create order → one pending order per source, TB09; creator cannot approve it', async () => {
    const escort = page.locator('#bd-order-form select[name="escort"] option').nth(1);
    await page.locator('#bd-order-form select[name="escort"]').selectOption(await escort.getAttribute('value'));
    await page.locator('#bd-order-form [type="submit"]').click();
    await page.waitForTimeout(200);
    assert.match(await toast(), /^Đã tạo lệnh điều phối LĐP-2026-0154 và gửi phê duyệt\.$/);
    assert(await page.locator('#bd-order-dialog').evaluate((d) => !d.open));
    const card = page.locator('#bd-res-balance .bd-order.is-selected');
    assert((await card.textContent()).includes('Chờ duyệt'));
    assert.equal(await card.locator('[data-approve]').count(), 0);
  });
  await check('Cancel with entered data asks for confirmation (NL05)', async () => {
    await page.locator('[data-create]').click();
    await page.locator('#bd-order-form select[name="group"]').selectOption('blanket');
    await page.locator('#bd-order-form [data-cancel]').last().click();
    assert(await page.locator('#bd-confirm-dialog').evaluate((d) => d.open));
    await page.locator('#bd-confirm-discard').click();
    assert(await page.locator('#bd-order-dialog').evaluate((d) => !d.open));
  });
  await check('Reject requires a reason (TB18) then TB12; approve another order → TB11', async () => {
    await page.locator('#bd-res-scope').selectOption('');
    await page.locator('#bd-res-balance [data-order="LĐP-2026-0152"]').click();
    await page.locator('[data-reject="LĐP-2026-0152"]').click();
    await page.locator('#bd-action-form [type="submit"]').click();
    assert.equal(await toast(), 'Vui lòng nhập lý do từ chối.');
    await page.locator('#bd-action-form textarea[name="reason"]').fill('Trùng với lệnh khác.');
    await page.locator('#bd-action-form [type="submit"]').click();
    assert.equal(await toast(), 'Đã từ chối lệnh LĐP-2026-0152.');
    await page.locator('#bd-res-balance [data-order="LĐP-2026-0144"]').click();
    await page.locator('[data-approve="LĐP-2026-0144"]').click();
    assert.equal(await toast(), 'Đã phê duyệt lệnh LĐP-2026-0144.');
  });
  await check('Draft needs a receiving point (NL06/NL15) and appears under "Nháp"', async () => {
    await page.locator('[data-create]').click();
    await page.locator('#bd-order-form select[name="program"]').selectOption('CT-2026-031');
    await page.locator('#bd-order-form select[name="province"]').selectOption('42');
    await page.locator('#bd-order-form select[name="group"]').selectOption('water');
    await page.locator('#bd-order-form select[name="target"]').selectOption('');
    await page.locator('#bd-order-form [data-draft]').click();
    assert.equal(await toast(), 'Vui lòng chọn Điểm nhận trước khi lưu nháp.');
    await page.locator('#bd-order-form select[name="target"]').selectOption('r-huong-khe');
    await page.locator('#bd-order-form [data-draft]').click();
    assert.equal(await toast(), 'Đã lưu nháp lệnh điều phối.');
    assert.equal(await page.locator('[data-order-filter="draft"]').getAttribute('aria-pressed'), 'true');
    assert(await page.locator('#bd-res-balance .bd-order').count() >= 2);
  });
  await check('Selecting an order draws its route with source / receiver labels and compact stats', async () => {
    await page.locator('[data-order-filter="all"]').click();
    await page.locator('#bd-res-balance [data-order="LĐP-2026-0151"]').click();
    assert(await page.locator('.bd-stats.is-compact').isVisible());
    assert.equal(await page.locator('.bd-map-tag.is-source').count(), 1);
    assert.equal(await page.locator('.bd-map-tag.is-target').count(), 1);
    assert((await page.locator('#bd-res-legend').textContent()).includes('Lệnh đang chọn'));
  });
  await check('View-only (default): title Danh sách điểm nóng instead of sub-tabs, no Xuất danh sách / Xem cân đối tỉnh; staff-only tabs and actions hidden', async () => {
    const view = await context.newPage();
    await view.goto(URL_, { waitUntil: 'domcontentloaded' });
    await view.locator('[data-record]').first().waitFor();
    await view.locator('#bd-tab-resources').click();
    assert.equal((await view.locator('#bd-res-title').innerText()).replace(/\s*\n\s*/g, ' | '), 'Danh sách điểm nóng | 6 điểm nóng');
    assert(await view.locator('#bd-res-card .bd-subtabs').isHidden());
    assert(await view.locator('#bd-sub-balance').isHidden());
    assert(await view.locator('#bd-sub-track').isHidden());
    assert(await view.locator('.bd-hot-card').count() > 0);
    assert.equal(await view.locator('[data-export], [data-view-balance], #bd-res-hotspots .bd-res-foot').count(), 0);
    assert(await view.locator('#bd-res-balance').isHidden());
    await view.close();
  });
  await check('Track: 7 milestones, confirm arrival → TB13, report incident → TB14', async () => {
    await page.locator('#bd-sub-track').click();
    await page.locator('#bd-res-track [data-order="LĐP-2026-0149"]').click();
    assert.equal(await page.locator('.bd-timeline li').count(), 7);
    assert(await page.locator('.bd-vehicle').count() >= 1);
    await page.locator('[data-advance]').click();
    assert.equal(await toast(), 'Đã xác nhận lệnh LĐP-2026-0149 đến điểm nhận.');
    assert.equal(await page.locator('.bd-timeline li.is-current strong').textContent(), 'Đã đến');
    await page.locator('[data-incident]').click();
    await page.locator('#bd-action-form [type="submit"]').click();
    assert.equal(await toast(), 'Vui lòng nhập đầy đủ thông tin bắt buộc.');
    await page.locator('#bd-action-form select[name="type"]').selectOption('Tắc đường');
    await page.locator('#bd-action-form textarea[name="text"]').fill('Sạt lở tại Km 12.');
    await page.locator('#bd-action-form [type="submit"]').click();
    assert.equal(await toast(), 'Đã ghi nhận sự cố của lệnh LĐP-2026-0149.');
    assert.equal(await page.locator('[data-track-filter="incident"] b').textContent(), '2');
    await page.screenshot({ path: 'tmp/map/srs-track.png' });
  });
  await check('Collapsed left column shows resource layer icons with tooltips', async () => {
    await page.locator('[data-panel-toggle="left"]').click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.bd-rail-btn').count(), await page.locator('#bd-res-layers .md-switch').count());
    await page.locator('.bd-rail-btn').first().hover();
    assert(await page.locator('#bd-rail-tip').isVisible());
    await page.locator('[data-panel-toggle="left"]').click();
  });
  await check('Back to overview restores toolbar, list and markers; no JS errors', async () => {
    await page.locator('#bd-tab-overview').click();
    assert(await page.locator('#bd-search').isVisible());
    assert(await page.locator('.bd-results-card').isVisible());
    assert(await page.locator('.bd-pin-host, .bd-cluster-host').count() > 0);
    assert.deepEqual(errors, []);
  });
  await browser.close();
  console.log(`${checks} SRS browser checks passed`);
})().catch((e) => { console.error(e); process.exit(1); });
