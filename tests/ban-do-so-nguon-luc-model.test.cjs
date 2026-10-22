// Kiểm thử quy tắc nghiệp vụ: tab Tổng quan (lớp bổ sung) và tab Nguồn lực (SRS Người yếu thế, chương trình và bảng cân đối nguồn lực)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
process.chdir(path.resolve(__dirname, '..'));
const M = require('../ban-do-so-model.js');
const RM = require('../ban-do-so-nguon-luc-model.js');
const ctx = { window: { DigitalMapModel: M } };
vm.createContext(ctx);
for (const file of ['ban-do-so-locations.js', 'ban-do-so-nguon-luc-data.js', 'ban-do-so-data.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
(async () => {
  const d = await ctx.window.DigitalMapSource.load();
  const R = ctx.window.DigitalMapResourceData;
  let checks = 0;
  const check = (name, fn) => { fn(); checks += 1; console.log('PASS ' + name); };
  const all = () => { const s = M.initialState(); s.layers = new Set(M.order); return s; };

  // ---------- Tab Tổng quan ----------
  check('New layers are off by default; five UC-BD layers stay default', () => {
    const r = M.select(d.records, M.initialState(), d.context, d.units);
    assert.equal(r.total, 176);
    assert(r.counts.goods > 0 && r.counts.vulnerable > 0 && r.counts.programs > 0 && r.counts.firstaid > 0);
  });
  check('Vulnerable layer requires permission and never exposes a personal name', () => {
    const v = d.records.find((x) => x.layer === 'vulnerable');
    assert.equal(M.displayName(v), `${v.code} · ${v.group}`);
    assert.equal(M.select(d.records, all(), { ...d.context, canViewVulnerable: false }, d.units).counts.vulnerable, 0);
  });
  check('Only active or completed programs are shown', () => {
    const shown = M.select(d.records, all(), d.context, d.units).rows.filter((x) => x.layer === 'programs');
    assert(shown.length > 0 && shown.every((x) => ['active', 'done'].includes(x.status)));
    assert(!shown.some((x) => x.id === 'CT-2026-HN-0155'));
  });
  check('Field filter applies to clubs and programs, not to other layers', () => {
    const s = all(); s.fields = ['Hiến máu'];
    const r = M.select(d.records, s, d.context, d.units);
    assert(r.rows.filter((x) => x.layer === 'programs').every((x) => x.fields.includes('Hiến máu')));
    assert.equal(r.counts.goods, M.select(d.records, all(), d.context, d.units).counts.goods);
  });
  check('Time filter keeps timeless layers and drops records outside the window', () => {
    const s = all(); s.time = '7d';
    const r = M.select(d.records, s, d.context, d.units);
    assert.equal(r.counts.offices, 37);
    assert(!r.rows.some((x) => x.id === 'CT-2026-HN-0119'));
    const custom = all(); Object.assign(custom, { time: 'custom', from: '2020-01-01', to: '2020-01-31' });
    assert.equal(M.select(d.records, custom, d.context, d.units).counts.programs, 0);
  });
  check('Point list title: same address, same ward, otherwise "Khu vực đã chọn"', () => {
    const same = d.records.filter((x) => x.address?.startsWith('Số nhà 12, thôn Đông Xuân'));
    assert.equal(M.pointTitle(same, d.locations), same[0].address);
    const ward = d.records.filter((x) => x.layer === 'vulnerable' && x.ward === '376');
    assert.equal(M.pointTitle(ward, d.locations), 'Xã Sóc Sơn, Thành phố Hà Nội');
    const mixed = d.records.filter((x) => x.layer === 'vulnerable' && ['376', '454'].includes(x.ward));
    assert.equal(M.pointTitle(mixed, d.locations), 'Khu vực đã chọn');
  });

  // ---------- Tab Nguồn lực ----------
  check('Coverage levels follow the legend boundaries', () => {
    assert.deepEqual([29.9, 30, 59.5, 60, 99.9, 100, 100.1].map(RM.level), ['critical', 'short', 'short', 'near', 'near', 'enough', 'surplus']);
    assert.equal(RM.percent(59.5), 59);
    assert.equal(RM.percent(99.9), 99);
    assert.equal(RM.percent(100.2), 101);
  });
  check('Province coverage is the average of group coverage; Tuyên Quang is short with 5/7 groups lacking', () => {
    const tq = R.provinces[8];
    assert.equal(RM.level(RM.provinceCoverage(tq.balance)), 'short');
    const rows = RM.balanceRows(tq.balance, R.groups);
    assert.equal(rows.filter((r) => r.short).length, 5);
    assert.equal(rows.find((r) => r.key === 'water').diff, -4000);
  });
  check('34 provinces split 1 / 2 / 7 / 15 / 9 across coverage levels', () => {
    const counts = {};
    Object.values(R.provinces).forEach((p) => { const l = RM.level(RM.provinceCoverage(p.balance)); counts[l] = (counts[l] || 0) + 1; });
    assert.deepEqual(counts, { critical: 1, short: 2, near: 7, enough: 15, surplus: 9 });
  });
  check('Order filter chips group raw statuses (SRS 3.5 note)', () => {
    assert(RM.inFilter({ status: 'preparing' }, 'approved'));
    assert(RM.inFilter({ status: 'arrived' }, 'shipping'));
    assert(RM.inFilter({ status: 'distributed' }, 'done'));
    assert(!RM.inFilter({ status: 'pending' }, 'approved'));
  });
  check('Drafts are private; creator cannot approve; only pending orders can be edited or rejected', () => {
    const draft = R.orders.find((o) => o.status === 'draft');
    assert(RM.visibleTo(draft, R.me));
    assert(!RM.visibleTo(draft, { id: 'someone-else' }));
    const mine = R.orders.find((o) => o.id === 'LĐP-2026-0151');
    assert(!RM.canApprove(mine, R.me) && RM.canEdit(mine, R.me));
    const other = R.orders.find((o) => o.id === 'LĐP-2026-0152');
    assert(RM.canApprove(other, R.me) && RM.canReject(other, R.me));
    assert(!RM.canReject(R.orders.find((o) => o.status === 'shipping'), R.me));
  });
  check('Order code is LĐP-year-sequence', () => { assert.equal(RM.nextOrderId(R.orders, 2026), 'LĐP-2026-0154'); assert.equal(RM.nextOrderId([], 2027), 'LĐP-2027-0001'); });
  check('Tracking milestones and next action follow NL17', () => {
    assert.equal(RM.MILESTONES.length, 7);
    assert.equal(RM.NEXT_ACTION.shipping.label, 'Xác nhận đã đến');
    assert.equal(RM.NEXT_ACTION.delivered.next, 'distributed');
    assert(RM.TRACK_FILTERS.waiting.test({ status: 'preparing' }));
    assert(RM.TRACK_FILTERS.incident.test({ status: 'shipping', incident: { type: 'Tắc đường' } }));
  });
  check('Create-order validation blocks TB04–TB07 and warns TB08 / TB16', () => {
    const depots = Object.fromEntries(R.depots.map((x) => [x.id, x]));
    const now = Date.parse('2026-10-21T08:00:00+07:00');
    const base = { program: 'CT-2026-HN-0139', group: 'water', target: 'r-dong-van', due: '2026-10-22T20:00:00+07:00', escort: 'e-0', rows: [{ depot: 'd-tn', qty: 4000, vehicle: '4 xe tải 5 tấn' }] };
    const ctxv = { shortage: 4000, depots, now, eta: () => now + 3600e3 };
    assert.deepEqual(RM.validateOrder(base, ctxv).errors, []);
    assert(RM.validateOrder({ ...base, escort: '' }, ctxv).errors.includes('TB04'));
    assert(!RM.validateOrder({ ...base, escort: '' }, ctxv, { submit: false }).errors.includes('TB04'));
    assert(RM.validateOrder({ ...base, rows: [{ ...base.rows[0], qty: 5000 }] }, ctxv).errors.includes('TB05'));
    assert(RM.validateOrder({ ...base, rows: [{ ...base.rows[0], qty: 4000 }] }, { ...ctxv, shortage: 9000 }).warnings.includes('TB16'));
    assert(RM.validateOrder({ ...base, rows: [{ depot: 'd-hn-da', qty: 2000, vehicle: '2 xe tải 5 tấn' }] }, ctxv).errors.includes('TB06'));
    assert(RM.validateOrder({ ...base, rows: [{ depot: 'd-dn', qty: 100, vehicle: '1 xe tải 5 tấn' }] }, ctxv).errors.includes('TB07'));
    assert(RM.validateOrder(base, { ...ctxv, eta: () => Date.parse(base.due) + 60e3 }).warnings.includes('TB08'));
    assert(RM.validateOrder({ ...base, due: '2026-10-20T08:00:00+07:00' }, ctxv).errors.includes('due'));
    assert(RM.validateOrder({ ...base, rows: [{ ...base.rows[0], qty: 2.5 }] }, ctxv).errors.includes('qty'));
  });
  check('Vehicle position is estimated from departure time and stays on the route', () => {
    const o = R.orders.find((x) => x.id === 'LĐP-2026-0149');
    const p = RM.progress({ ...o, minutes: 240 }, Date.now());
    assert(p > 0 && p < 1);
    assert.equal(RM.progress({ status: 'approved' }, Date.now()), 0);
    assert.equal(RM.progress({ status: 'delivered' }, Date.now()), 1);
  });
  console.log(`${checks} resource business-rule checks passed`);
})().catch((error) => { console.error(error); process.exit(1); });
