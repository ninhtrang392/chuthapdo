// ==================== TRANG CHI TIẾT CHƯƠNG TRÌNH (công khai, chỉ xem) ====================
// Bố cục trang chiến dịch dùng chung khối .pf-pv-* với modal Xem chi tiết chương trình (ho-so.js); trang công khai không có thao tác của người đề xuất (đăng bản tin, chỉnh sửa).
// Dữ liệu minh họa — chương trình lấy từ chuong-trinh-data.js theo ?id=; câu chuyện, bản tin, lượt ủng hộ, khoản chi suy ra cố định theo mã chương trình.

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

// ==================== TOAST: thông báo ngắn ====================
// Loại (UI KIT Toast): success (mặc định) · info · warning · error — icon tròn theo loại, vòng đếm ngược quanh nút đóng chạy hết khi toast tự ẩn
const toast = document.querySelector('.pf-toast');
const TOAST_TIME = 2800;
const TOAST_GLYPH = { success: '<svg class="icon" aria-hidden="true"><use href="#check"/></svg>', info: 'i', warning: '!', error: '!' };
let toastTimer;
const hideToast = () => { clearTimeout(toastTimer); toast.hidden = true; };
const showToast = (message, type = 'success') => {
  toast.className = `pf-toast is-${type}`;
  toast.querySelector('.pf-toast-icon').innerHTML = TOAST_GLYPH[type];
  toast.querySelector('.pf-toast-text').textContent = message;
  toast.style.setProperty('--toast-time', `${TOAST_TIME}ms`);
  // Chạy lại vòng đếm ngược từ đầu cho mỗi thông báo
  const ring = toast.querySelector('.pf-toast-ring circle');
  ring.style.animation = 'none'; void ring.getBoundingClientRect(); ring.style.animation = '';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, TOAST_TIME);
};
toast.querySelector('.pf-toast-close').addEventListener('click', hideToast);

// ==================== DATA: thông tin chi tiết (minh họa) ====================
// IMG, BANNER_IMG, PRIORITY, PROGRAMS, escapeHtml, fold, icon, programCard, FIELD_INFO, DETAILS: chuong-trinh-data.js
// FIELD_INFO (theo lĩnh vực), DETAILS (nội dung riêng từng chương trình), programStory: chuong-trinh-data.js — dùng chung với popup câu chuyện (story-popover.js)
// Ảnh minh họa xoay vòng cho bộ ảnh, bản tin (ảnh đầu bộ ảnh = ảnh của chương trình)
const PV_PHOTOS = PROGRAM_PHOTOS; // ảnh bộ ảnh trang chi tiết: 9 ảnh trong Emages/Chương trình/ (chuong-trinh-data.js)
// Đường dây nóng Trung ương Hội (cùng số ở chân trang)
const HOTLINE = '024 3822 4030';

// ---------- Định dạng & số ngẫu nhiên cố định theo mã (cùng chương trình luôn ra cùng dữ liệu) ----------
const DAY = 86400000;
const pad2 = (n) => String(n).padStart(2, '0');
const vnd = (n) => Math.round(n).toLocaleString('vi-VN');
const isoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const viDate = (iso) => iso.split('-').reverse().join('/');
const viDateTime = (ms) => { const d = new Date(ms); return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const seededRandom = (text) => {
  let seed = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 233280, 7);
  return () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
};
const CITIES = ['Hà Nội', 'Hải Phòng', 'Đà Nẵng', 'Huế', 'Cần Thơ'];
const orgOf = (place) => (place.startsWith('TP.') ? `Hội Chữ thập đỏ ${place}` : `Hội Chữ thập đỏ ${CITIES.includes(place) ? 'thành phố' : 'tỉnh'} ${place}`);

// ---------- Hồ sơ chi tiết của 1 chương trình: thời gian · đơn vị · câu chuyện · số liệu gây quỹ · lượt ủng hộ · bản tin ----------
const programDetail = (p) => {
  const info = FIELD_INFO[p.field];
  const extra = DETAILS[p.id] || {};
  const rand = seededRandom(p.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raiseFrom = extra.start ? new Date(`${extra.start}T00:00:00`) : new Date(today.getTime() - (20 + Math.floor(rand() * 25)) * DAY);
  const raiseTo = new Date(today.getTime() + Math.max(p.days, 0) * DAY);
  const runTo = new Date(raiseTo.getTime() + 60 * DAY);
  const org = extra.org || orgOf(p.place);
  const isMoney = !p.unit;
  const ended = p.days <= 0;
  // Lượt ủng hộ: tiền — trung bình ~2,6 triệu/lượt · hiến máu — mỗi lượt 1 đơn vị máu
  const donors = p.startIn > 0 ? 0 : isMoney ? Math.max(12, Math.round(p.raised / 2.6e6)) : p.raised; // sắp diễn ra: chưa có lượt ủng hộ
  const spent = isMoney ? p.raised * (ended ? 0.97 : 0.36) : 0;
  const proven = ended ? spent : spent * 0.78;
  const goal = extra.summary || `Huy động nguồn lực xã hội cho chương trình “${p.title}”, hỗ trợ kịp thời ${info.groups.join(', ').toLowerCase()} tại ${p.place}.`;
  return {
    info, org, isMoney, ended, donors, goal,
    area: extra.area || `Các xã, phường khó khăn, ${p.place}`,
    people: extra.people || (isMoney ? `Khoảng ${vnd(Math.max(50, Math.round(p.goal / 1e7) * 10))} người` : 'Người bệnh cần truyền máu'),
    // Câu chuyện: phần riêng (DETAILS) hoặc theo lĩnh vực + 3 đoạn chung (khảo sát, minh bạch, kêu gọi) — đủ dài để có nút Xem thêm
    story: [
      ...(extra.story || [info.story(p.place)]),
      `Trước khi triển khai, cán bộ ${org} đã phối hợp với chính quyền cơ sở khảo sát thực tế, lập danh sách những hoàn cảnh cần hỗ trợ trước. Mỗi hồ sơ đều được xác minh để bảo đảm sự giúp đỡ đến đúng người, đúng lúc và đúng nhu cầu.`,
      'Mọi khoản đóng góp được tiếp nhận qua tài khoản chuyên dụng của chương trình, đối soát tự động và công khai trên sao kê. Ban tổ chức sẽ thường xuyên cập nhật hình ảnh, tiến độ triển khai và chứng từ chi tiêu tại mục Hoạt động để nhà hảo tâm cùng theo dõi.',
      `Mỗi lượt ủng hộ, dù lớn hay nhỏ, đều góp thêm một phần yêu thương gửi tới ${p.place}. Hãy cùng Hội Chữ thập đỏ chung tay để không ai bị bỏ lại phía sau.`,
    ],
    uses: extra.uses || info.uses,
    raiseFrom: isoDate(raiseFrom), raiseTo: isoDate(raiseTo), runTo: isoDate(runTo),
    runMonths: Math.max(1, Math.round((runTo - raiseFrom) / (30 * DAY))),
    spent, proven, unproven: spent - proven, left: p.raised - spent,
    updates: extra.updates,
  };
};

// ---------- Danh sách ủng hộ minh họa: đủ số lượt ủng hộ, rải trong thời gian tiếp nhận, mới nhất lên đầu; Top 5 = 5 khoản lớn nhất ----------
// Mỗi người: [tên, loại, ảnh đại diện / logo] — ảnh chân dung trong Emages/avatar/, logo minh họa trong Emages/logo-demo/ (cùng người với bảng Top gây quỹ trang chủ)
const TOP_DONORS = [['Công ty Cổ phần An Phát', 'org', 'Emages/logo-demo/an-phat.svg'], ['Trần Thu Hà', 'user', 'Emages/avatar/tran-thu-ha.jpg'], ['Quỹ Hy vọng Xanh', 'org', 'Emages/logo-demo/hy-vong-xanh.svg'], ['Phạm Gia Huy', 'user', 'Emages/avatar/pham-gia-huy.jpg'], ['Nguyễn Minh Anh', 'user', 'Emages/avatar/nguyen-minh-anh.jpg']];
const TOP_RATIOS = [0.071, 0.052, 0.037, 0.024, 0.016];
const DONOR_NAMES = ['Lê Hoàng Nam', 'Phạm Thu Hằng', 'Đỗ Quang Huy', 'Vũ Ngọc Lan', 'Hoàng Minh Đức', 'Bùi Thị Thảo', 'Đặng Văn Định', 'Ngô Thanh Tùng', 'Dương Thị Hà', 'Lý Quốc Bảo', 'Phan Thị Ngọc', 'Trịnh Văn Long', 'Mai Anh Thư', 'Tạ Minh Khôi', 'Đinh Thị Yến'];
const SMALL_AMOUNTS = [20000, 50000, 50000, 100000, 100000, 200000, 200000, 300000, 500000, 500000, 1000000, 2000000, 5000000];
// Lời nhắn minh họa kèm khoản ủng hộ (khoảng 60% lượt có lời nhắn; còn lại để trống → "—")
const DONOR_NOTES = ['Chúc bà con sớm vượt qua khó khăn.', 'Một chút tấm lòng gửi tới các em.', 'Chung tay vì cộng đồng.', 'Gửi chút yêu thương, mong mọi người bình an.', 'Chúc chương trình thành công tốt đẹp!', 'Lá lành đùm lá rách.', 'Mong các em có một mùa đông ấm áp.', 'Cảm ơn Hội đã kết nối những tấm lòng.', 'Ủng hộ chương trình, chúc bà con sớm ổn định cuộc sống.', 'Góp một phần nhỏ, mong lan tỏa thật nhiều.'];
const programDonations = (p, d) => {
  const rand = seededRandom(`${p.id}-donors`);
  const from = new Date(`${d.raiseFrom}T07:00:00`).getTime();
  const to = Math.max(from, Math.min(Date.now(), new Date(`${d.raiseTo}T21:00:00`).getTime()));
  return Array.from({ length: d.donors }, (_, i) => {
    const time = from + rand() * (to - from);
    if (d.isMoney && i < TOP_DONORS.length) {
      const [name, kind, avatar] = TOP_DONORS[i];
      return { name, kind, avatar, time, note: DONOR_NOTES[i * 3 % DONOR_NOTES.length], amount: Math.max(Math.round((p.raised * TOP_RATIOS[i]) / 100000) * 100000, (10 - i) * 1e6) };
    }
    const anonymous = rand() < 0.18;
    const note = rand() < 0.6 ? DONOR_NOTES[Math.floor(rand() * DONOR_NOTES.length)] : '';
    return { name: anonymous ? 'Người ủng hộ ẩn danh' : DONOR_NAMES[Math.floor(rand() * DONOR_NAMES.length)], kind: anonymous ? 'heart' : 'user', time, note, amount: d.isMoney ? SMALL_AMOUNTS[Math.floor(rand() * SMALL_AMOUNTS.length)] : 1 };
  }).sort((a, b) => b.time - a.time).map((x, i) => ({ ...x, ref: txRef(x.time, `${p.id}-${i}`) }));
};
// Mã giao dịch minh họa (kiểu mã chuyển khoản ngân hàng): FT + yyMMdd (ngày ủng hộ) + 6 số băm từ mã chương trình + thứ tự lượt → cố định mỗi lần tải
const txRef = (time, seed) => {
  const t = new Date(time);
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return `FT${pad(t.getFullYear() % 100)}${pad(t.getMonth() + 1)}${pad(t.getDate())}${pad(h % 1e6, 6)}`;
};

// ---------- Người đồng hành (minh họa): người / tổ chức đứng ra kêu gọi, chia sẻ gây quỹ cho chương trình — số tiền và lượt ủng hộ kêu gọi được ----------
// Khi triển khai: lấy từ hệ thống (mỗi người đồng hành có liên kết gây quỹ riêng). avatar (tùy chọn) = ảnh đại diện.
// Khung Vinh danh có 2 tab: Top 5 ủng hộ · Người đồng hành — đổi thành false để chỉ còn Top 5 người ủng hộ
const SHOW_COMPANIONS = true;
// Khối Kê khai khoản chi (cột phải) đang ẩn — đổi thành true để hiện lại
const SHOW_SPEND = false;
const COMPANION_RATIOS = [0.052, 0.034, 0.021, 0.013, 0.008];
const programCompanions = (p) => {
  const rand = seededRandom(`${p.id}-companions`);
  const names = [`Đoàn Thanh niên tỉnh ${p.place}`, 'CLB Thiện nguyện Ánh Dương', 'Nguyễn Thu Hà', 'Nhóm Tình nguyện Sắc Xanh', 'Lê Minh Quân'];
  return names.map((name, i) => ({ name, amount: Math.max(Math.round((p.raised * COMPANION_RATIOS[i]) / 100000) * 100000, 1e6), count: 20 + Math.floor(rand() * 180) }))
    .sort((a, b) => b.amount - a.amount);
};

// ---------- Bản tin cập nhật (tab Hoạt động, khối Hoạt động trích đoạn): bản tin riêng của chương trình hoặc bản tin minh họa suy từ số liệu, kèm bài cảm ơn; mới nhất trước ----------
// tag: nhãn thẻ tin — Hoạt động (tiến độ) · Tin tức (khởi động) · Cảm ơn
const programBulletins = (p, d, photos) => {
  const media = (list) => list.map((src) => `${IMG}${src}`);
  const from = new Date(`${d.raiseFrom}T00:00:00`).getTime();
  const own = d.updates
    ? d.updates.map(([date, title, text], i) => ({ date, unit: d.org, tag: /^Khởi động/.test(title) ? 'Tin tức' : 'Hoạt động', title, text, media: media(i ? photos.slice(0, 3) : [...photos.slice(1), ...PV_PHOTOS].slice(0, 6)) }))
    : [
      { date: isoDate(new Date(Date.now() - 3 * DAY)), unit: d.org, tag: 'Hoạt động', title: `${p.title} — cập nhật tiến độ`, text: `Chương trình đã tiếp nhận ${amount(p, p.raised)} từ ${vnd(d.donors)} lượt ủng hộ, đạt ${p.pct}% mục tiêu. Hạng mục “${d.uses[0].toLowerCase()}” đang được triển khai tại ${p.place}. Ban tổ chức xin gửi lời cảm ơn chân thành tới các nhà hảo tâm, tình nguyện viên đã đồng hành cùng chương trình.`, media: media([...photos.slice(1), ...PV_PHOTOS].slice(0, 6)) },
      { date: d.raiseFrom, unit: d.org, tag: 'Tin tức', title: `Khởi động chương trình ${p.title}`, text: `Chương trình “${p.title}” đã được Hội phê duyệt và chính thức mở tiếp nhận ủng hộ từ ngày ${viDate(d.raiseFrom)}. Mọi đóng góp được ${d.org} tiếp nhận, sử dụng đúng mục đích và công khai sao kê trên nền tảng.`, media: media(photos.slice(0, 3)) },
    ];
  const thanks = { date: isoDate(new Date(from + (Date.now() - from) * 0.6)), unit: d.org, tag: 'Cảm ơn', title: `Những tấm lòng hướng về ${p.place}`, text: `Chỉ sau một thời gian ngắn mở tiếp nhận, chương trình đã nhận được ${vnd(d.donors)} ${d.isMoney ? 'lượt ủng hộ' : 'lượt đăng ký hiến máu'} từ cá nhân, tập thể và doanh nghiệp trên cả nước. ${d.org} trân trọng cảm ơn những tấm lòng đã đồng hành, mọi đóng góp đều được công khai trên trang chương trình.`, media: media([...photos.slice(2), ...PV_PHOTOS].slice(0, 4)) };
  // Minh họa: chương trình thứ tự chẵn có thêm 3 bản tin giữa kỳ → hơn 3 bản tin, tab Hoạt động hiện nút Xem thêm
  const at = (ratio) => isoDate(new Date(from + (Date.now() - from) * ratio));
  const extra = p.order % 2 ? [] : [
    { date: at(0.3), unit: d.org, tag: 'Hoạt động', title: `Khảo sát, lập danh sách đối tượng hưởng lợi tại ${p.place}`, text: `Tình nguyện viên ${d.org} đã đến từng thôn, bản tại ${p.place} để khảo sát thực tế, đối chiếu hoàn cảnh và lập danh sách đối tượng hưởng lợi. Danh sách được niêm yết công khai trước khi triển khai hỗ trợ.`, media: media(photos.slice(1, 3)) },
    { date: at(0.45), unit: d.org, tag: 'Hoạt động', title: `Trao hỗ trợ đợt 1 — ${p.title}`, text: `Đợt 1 của chương trình đã được trao tận tay bà con tại ${p.place}. Hạng mục “${d.uses[0].toLowerCase()}” được ưu tiên triển khai trước; chứng từ và hình ảnh trao tặng được cập nhật đầy đủ trên trang chương trình.`, media: media([...photos.slice(2), ...PV_PHOTOS].slice(0, 4)) },
    { date: at(0.8), unit: d.org, tag: 'Tin tức', title: `Kiểm tra, giám sát việc sử dụng nguồn đóng góp`, text: `Đoàn kiểm tra của Hội đã làm việc tại ${p.place}, đối chiếu sổ sách, chứng từ chi và kết quả triển khai thực tế. Toàn bộ khoản chi được công khai trên nền tảng để nhà hảo tâm theo dõi.`, media: media(photos.slice(0, 2)) },
  ];
  return [...own, ...extra, thanks].sort((a, b) => b.date.localeCompare(a.date));
};

// ---------- Bình luận minh họa: 10–14 bình luận của nhiều người, rải trong thời gian tiếp nhận; có trả lời của Ban tổ chức (đơn vị thực hiện) và trả lời qua lại giữa người dùng ----------
// Người đang đăng nhập (minh họa, cùng account-menu.js) — khi có đăng nhập thật, lấy từ phiên đăng nhập
const ME = 'Nguyễn Ngọc Trâm';
// Mỗi mục: [nội dung, ...trả lời]; trả lời: ['org', nội dung] = Ban tổ chức · ['user', nội dung] = người dùng khác; nội dung có thể là hàm (p, d)
const COMMENT_POOL = {
  money: [
    ['Chúc chương trình sớm về đích, mong bà con sớm ổn định cuộc sống.'],
    ['Mình vừa chuyển khoản ủng hộ, cảm ơn Hội đã công khai sao kê rất rõ ràng.', ['user', 'Mình cũng vừa tra sao kê, thấy giao dịch của mình hiện ngay sau vài phút. Rất minh bạch!']],
    ['Cho mình hỏi có thể ủng hộ hiện vật (quần áo, sách vở) được không ạ?', ['org', (p, d) => `Chào bạn, chương trình có tiếp nhận hiện vật tại trụ sở ${d.org}. Bạn vui lòng gọi đường dây nóng ${HOTLINE} để được hướng dẫn nhé.`]],
    ['Đã chia sẻ cho nhóm bạn cùng công ty, mong lan tỏa thêm nhiều tấm lòng.'],
    ['Cảm ơn các tình nguyện viên đã vất vả đi trao quà tận nơi.', ['user', 'Mình là tình nguyện viên đợt vừa rồi, bà con đón đoàn rất xúc động. Cảm ơn mọi người đã đồng hành!']],
    ['Hình ảnh cập nhật rất cụ thể, mình yên tâm khi đóng góp qua nền tảng này.'],
    ['Chương trình có tuyển tình nguyện viên tham gia trao quà không ạ?', ['org', () => 'Chào bạn, bạn có thể đăng ký tình nguyện viên tại mục Hồ sơ tình nguyện viên trên trang cá nhân. Ban tổ chức sẽ liên hệ khi có đợt trao quà tiếp theo.'], ['user', 'Mình đăng ký rồi, tuần sau đi đợt 2. Ai đi cùng thì nhắn mình nhé!']],
    ['Quê mình ở gần đó, mong mọi người chung tay giúp bà con nhiều hơn nữa.'],
    ['Lớp mình góp được một ít tiền quỹ lớp, vừa chuyển khoản xong. Chúc chương trình thành công!'],
    ['Cho mình hỏi chuyển khoản qua ví điện tử có được ghi nhận vào sao kê không ạ?', ['org', () => 'Chào bạn, mọi giao dịch quét đúng mã QR và giữ nguyên nội dung chuyển khoản đều được đối soát tự động và hiển thị trên sao kê công khai.']],
    ['Số tiền nhỏ nhưng là tấm lòng của cả gia đình mình. Mong các cháu, các bác sớm qua khó khăn.'],
    ['Nhóm thiện nguyện của bọn mình sẽ quyên góp thêm vào cuối tháng này.', ['user', 'Cho mình tham gia với nhóm nhé, mình ở cùng khu vực.']],
    ['Cảm ơn Hội Chữ thập đỏ luôn có mặt kịp thời những lúc bà con khó khăn nhất.'],
    ['Mong ban tổ chức tiếp tục cập nhật hình ảnh sau khi trao hỗ trợ để mọi người cùng theo dõi.', ['org', () => 'Cảm ơn bạn đã quan tâm. Ban tổ chức sẽ đăng bản tin kèm hình ảnh sau mỗi đợt trao hỗ trợ tại tab Hoạt động.']],
    ['Đọc câu chuyện mà rưng rưng. Đã ủng hộ và chia sẻ lên trang cá nhân.'],
    ['Chương trình ý nghĩa quá, chúc ban tổ chức nhiều sức khỏe!'],
  ],
  unit: [
    ['Mình đã đăng ký hiến máu đợt này, hẹn gặp mọi người ở điểm hiến!'],
    ['Lần thứ 5 đi hiến máu, lần nào cũng thấy rất ý nghĩa.', ['user', 'Đỉnh quá! Mình mới đi lần đầu tháng trước, sẽ cố gắng đi đều như bạn.']],
    ['Cho mình hỏi điểm hiến máu lưu động cuối tuần mở cửa mấy giờ ạ?', ['org', () => 'Chào bạn, các điểm hiến máu lưu động cuối tuần tiếp nhận từ 7h30 đến 11h30 và 13h30 đến 16h30. Bạn nhớ ăn sáng nhẹ và mang theo giấy tờ tùy thân nhé.']],
    ['Cảm ơn các y bác sĩ và tình nguyện viên rất nhiệt tình, chu đáo.'],
    ['Cả nhóm mình rủ nhau đi hiến máu vào thứ Bảy này.', ['user', 'Nhóm bạn đi điểm nào vậy? Mình muốn đi cùng.']],
    ['Người nhà mình từng được truyền máu cứu sống, nên giờ mình đi hiến đều đặn mỗi 3 tháng.'],
    ['Cân nặng bao nhiêu thì được hiến máu ạ? Mình hơi gầy.', ['org', () => 'Chào bạn, nữ từ 42 kg và nam từ 45 kg trở lên là đủ điều kiện hiến máu. Bác sĩ sẽ khám sàng lọc trước khi hiến.']],
    ['Công ty mình tổ chức cho cả phòng đi hiến máu, ai cũng hào hứng.'],
    ['Hiến máu xong được nhận giấy chứng nhận, rất vui vì đã góp một phần nhỏ.'],
    ['Mong chương trình được tổ chức thêm nhiều điểm ở các trường đại học.'],
  ],
};
// Tên người bình luận: xáo theo chương trình để mỗi bình luận một người khác nhau
const COMMENT_NAMES = [...DONOR_NAMES, 'Hồ Thị Lan Anh', 'Cao Minh Tuấn', 'Lương Thị Hồng', 'Võ Đức Thắng', 'Chu Thanh Hương', 'Nhóm thiện nguyện Sẻ Chia', 'Kiều Văn Phúc', 'Tô Ngọc Ánh'];
let commentSeq = 0;
const programComments = (p, d) => {
  const rand = seededRandom(`${p.id}-comments`);
  const shuffle = (list) => [...list].sort(() => rand() - 0.5);
  const all = COMMENT_POOL[d.isMoney ? 'money' : 'unit'];
  const pool = shuffle(all).slice(0, Math.min(all.length, (d.isMoney ? 10 : 8) + Math.floor(rand() * 5)));
  const names = shuffle(COMMENT_NAMES);
  let nameIndex = 0;
  const nextName = () => { nameIndex += 1; return names[(nameIndex - 1) % names.length]; };
  const from = new Date(`${d.raiseFrom}T08:00:00`).getTime();
  const span = Math.max(DAY, Date.now() - from);
  return pool.map(([text, ...replies]) => {
    // Bình luận gốc rải trong 85% đầu khoảng thời gian, chừa chỗ cho trả lời đến sau
    const time = from + rand() * span * 0.85;
    const name = nextName();
    commentSeq += 1;
    let at = time;
    return {
      id: commentSeq, name, kind: name.startsWith('Nhóm') ? 'people' : 'user', time, text, likes: Math.floor(rand() * 40), liked: false,
      replies: replies.map(([who, reply]) => {
        commentSeq += 1;
        at = Math.min(Date.now() - 600000, at + (1 + rand() * 18) * 3600000);
        return { id: commentSeq, name: who === 'org' ? d.org : nextName(), kind: who === 'org' ? 'org' : 'user', time: at, text: typeof reply === 'function' ? reply(p, d) : reply, likes: Math.floor(rand() * 10), liked: false };
      }),
    };
  }).sort((a, b) => b.time - a.time);
};

// ==================== RENDER: khối dùng chung kiểu modal Xem chi tiết chương trình ====================
const none = (text) => `<p class="pf-view-none">${text}</p>`;
const avatar = (kind, cls = 'pf-pv-avatar') => `<span class="${cls}${kind === 'org' ? ' is-org' : ''}" aria-hidden="true">${icon(kind === 'org' ? 'building' : kind)}</span>`;
// Avatar danh sách ủng hộ: có ảnh (x.avatar) → ảnh · ẩn danh → icon tim · còn lại → chữ cái đầu họ và tên, màu theo người (initials / avatarTone ở phần Bình luận)
const donorAvatar = (x) => {
  if (x.avatar) return `<img class="pf-pv-avatar pv-donor-photo${x.kind === 'org' ? ' is-logo' : ''}" src="${escapeHtml(x.avatar)}" alt="" width="32" height="32" loading="lazy" />`;
  if (x.kind === 'heart') return avatar('heart');
  return `<span class="pf-pv-avatar pv-cm-initials tone-${avatarTone(x.name)}" aria-hidden="true">${escapeHtml(initials(x.name))}</span>`;
};
// Top 5 dạng danh sách gọn: hạng · tên + ngày ủng hộ · số tiền
// Mỗi dòng: số hạng · avatar nhà hảo tâm (donorAvatar) · tên · số tiền
const top5 = (top) => `<ol class="pf-pv-top5-list">${top.map((x, i) => `<li class="pf-pv-top5-item is-rank-${i + 1}">
  <span class="pf-pv-rank" aria-label="Hạng ${i + 1}">${i + 1}</span>
  ${donorAvatar(x)}
  <span class="pf-pv-top5-info"><span class="pf-pv-top5-name">${escapeHtml(x.name)}</span></span>
  <b class="pf-pv-top5-amount">${vnd(x.amount)}đ</b>
</li>`).join('')}</ol>`;
// Người đồng hành: cùng kiểu dòng với Top 5 · dưới tên là số lượt ủng hộ đã kêu gọi được · số tiền kêu gọi được
const companionList = (list) => `<ol class="pf-pv-top5-list">${list.map((x, i) => `<li class="pf-pv-top5-item is-rank-${i + 1}">
  <span class="pf-pv-rank" aria-label="Hạng ${i + 1}">${i + 1}</span>
  ${donorAvatar(x)}
  <span class="pf-pv-top5-info"><span class="pf-pv-top5-name">${escapeHtml(x.name)}</span><span class="pf-pv-top5-date">Kêu gọi ${vnd(x.count)} lượt ủng hộ</span></span>
  <b class="pf-pv-top5-amount">${vnd(x.amount)}đ</b>
</li>`).join('')}</ol>`;
// Kê khai khoản chi (SRS #14): gauge nửa vòng — cả cung = số tiền đã nhận; đoạn xanh lá (gradient) = đã kê khai có chứng từ, đoạn đỏ = chưa có chứng từ, còn lại xám
// · nhãn 0% / 100% · giữa: Tổng số tiền chi (số lớn + VNĐ) · chú thích 2 dòng (tiêu đề + dòng phụ · số tiền)
// · rê chuột vào đoạn cung / dòng chú thích: hiện tooltip "tên — x% số tiền đã nhận", đoạn tương ứng nổi bật (data-gauge-part)
const spendGauge = (d) => {
  const share = (n) => (d.spent + d.left > 0 ? Math.round((n / (d.spent + d.left)) * 1000) / 10 : 0);
  const tip = (label, n) => `${label}|${nf.format(share(n))}% số tiền đã nhận · ${vnd(n)} VNĐ`;
  const arc = 'M14 80a66 66 0 0 1 132 0';
  return `<div class="pv-gauge">
    <div class="pv-gauge-chart">
      <svg viewBox="0 0 160 90" role="img" aria-label="Đã chi ${share(d.spent)}% số tiền đã nhận">
        <defs><linearGradient id="pv-gauge-green" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#006c45" /><stop offset="1" stop-color="#2f8f57" /></linearGradient></defs>
        <path d="${arc}" pathLength="100" class="pv-gauge-track" data-gauge-tip="${tip('Chưa chi', d.left)}" data-gauge-part="left" />
        ${d.unproven > 0 ? `<path d="${arc}" pathLength="100" class="pv-gauge-unproven" stroke-dasharray="0 ${share(d.proven)} ${share(d.unproven)} 100" data-gauge-tip="${tip('Đã kê khai chưa có chứng từ', d.unproven)}" data-gauge-part="unproven" />` : ''}
        ${d.proven > 0 ? `<path d="${arc}" pathLength="100" class="pv-gauge-proven" stroke-dasharray="${share(d.proven)} 100" data-gauge-tip="${tip('Đã kê khai có chứng từ', d.proven)}" data-gauge-part="proven" />` : ''}
      </svg>
      <p class="pv-gauge-center"><span>Tổng số tiền chi</span><b>${vnd(d.spent)}</b><span>VNĐ</span></p>
      <span class="pv-gauge-end" aria-hidden="true">0%</span><span class="pv-gauge-end is-right" aria-hidden="true">100%</span>
      <span class="pv-gauge-tip" role="tooltip" hidden><b></b><span></span></span>
    </div>
    <dl class="pv-gauge-legend">
      <div class="is-proven" data-gauge-tip="${tip('Đã kê khai có chứng từ', d.proven)}" data-gauge-part="proven"><dt>Số tiền đã kê khai có chứng từ<small>Đã được xác minh đầy đủ · ${nf.format(share(d.proven))}%</small></dt><dd><b>${vnd(d.proven)}</b> VNĐ</dd></div>
      <div class="is-unproven" data-gauge-tip="${tip('Đã kê khai chưa có chứng từ', d.unproven)}" data-gauge-part="unproven"><dt>Số tiền đã kê khai chưa có chứng từ<small>Đang được cập nhật · ${nf.format(share(d.unproven))}%</small></dt><dd><b>${vnd(d.unproven)}</b> VNĐ</dd></div>
    </dl>
  </div>`;
};
// Tối đa 4 ảnh; còn lại hiện “+n” trên ô thứ 4
const mediaGrid = (list) => {
  if (!list.length) return '';
  const more = list.length - 4;
  return `<div class="pf-pv-update-photos">${list.slice(0, 4).map((src, i) => `<figure class="pf-pv-update-photo"><img src="${src}" alt="" loading="lazy" />${i === 3 && more > 0 ? `<span class="pf-pv-photo-more" aria-label="Còn ${more} ảnh">+${more}</span>` : ''}</figure>`).join('')}</div>`;
};
// Bản tin: ngày • đơn vị đăng · tiêu đề · nội dung · ảnh (khối Hoạt động ở cột trái chỉ hiện trích đoạn, bấm tiêu đề mở tab Hoạt động; dòng thời gian đã có cột ngày)
const bulletin = (b, { excerpt = false, dateless = false } = {}) => `<article class="pf-pv-update${excerpt ? '' : ' is-full'}">
  <p class="pf-pv-update-meta">${dateless ? '' : `<time datetime="${b.date}">${viDate(b.date)}</time><span aria-hidden="true">•</span>`}<b>${escapeHtml(b.unit)}</b></p>
  <h4 class="pf-pv-update-title">${excerpt ? `<button class="pf-pv-update-link" type="button" data-pv-open-acts>${escapeHtml(b.title)}</button>` : escapeHtml(b.title)}</h4>
  <p class="pf-pv-update-text">${escapeHtml(b.text)}</p>
  ${mediaGrid(b.media)}
</article>`;
// Phân trang danh sách ủng hộ: kiểu nút của bảng danh sách, quá nhiều trang thì rút gọn “…”
const pagerHtml = (current, pages) => {
  const numbers = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - current) <= 1) numbers.push(i);
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
  }
  return `<div class="pf-pager"><div class="pf-pages">
    <button class="pf-page-btn is-prev" type="button" data-donor-page="${current - 1}" ${current === 1 ? 'disabled' : ''} aria-label="Trang trước">${icon('page-arrow')}</button>
    ${numbers.map((n) => (n === '…' ? '<span aria-hidden="true">…</span>'
      : `<button class="pf-page-btn" type="button" data-donor-page="${n}" ${n === current ? 'aria-current="page"' : ''} aria-label="Trang ${n}">${n}</button>`)).join('')}
    <button class="pf-page-btn" type="button" data-donor-page="${current + 1}" ${current === pages ? 'disabled' : ''} aria-label="Trang sau">${icon('page-arrow')}</button>
  </div></div>`;
};

// ==================== SECTION: TRANG CHI TIẾT — đầu trang (tên · nhãn · chia sẻ) · cột trái: bộ ảnh, tab Câu chuyện / Hoạt động / Danh sách ủng hộ, Hoạt động (trích đoạn) · cột phải: gây quỹ, Top 5 · Người đồng hành, Bình luận (Kê khai khoản chi đang ẩn) · Các chiến dịch khác ====================
const $ = (s) => document.querySelector(s);
const root = $('#pv-root');
// Mọi sự kiện của trang bắt ở #pv-root (nội dung dựng lại theo chương trình)
const body = root;
// ctx: chương trình đang xem — dùng khi đổi ảnh, lọc danh sách ủng hộ, bình luận, xuất sao kê, popup QR
let ctx = null;
const DONORS_PER_PAGE = 10;
// Bình luận nằm ở cột phải (hẹp): hiện 3, Xem thêm mở thêm 3 — giữ 2 cột cân đối
const COMMENT_STEP = 3;
// Tab Hoạt động: hiện 3 bản tin mới nhất, hơn 3 thì có nút Xem thêm (mỗi lần mở thêm 3)
const ACT_STEP = 3;
const COMMENT_MAX = 500;
// Mục tiêu dạng gọn cho dòng tóm tắt câu chuyện: 7 tỷ đồng · 500 triệu đồng · 2.000 đơn vị máu
const shortAmount = (p, n) => (p.unit ? `${vnd(n)} ${p.unit}` : n >= 1e9 ? `${nf.format(Math.floor(n / 1e8) / 10)} tỷ đồng` : `${nf.format(Math.floor(n / 1e6))} triệu đồng`);

const renderProgram = (p) => {
  const d = programDetail(p);
  // Bộ ảnh: ảnh chương trình + ảnh riêng (p.photos) hoặc ảnh minh họa xoay vòng theo vị trí chương trình
  const rest = PV_PHOTOS.filter((x) => x !== p.img);
  const shift = p.order % rest.length;
  const photos = [p.img, ...(p.photos || [...rest.slice(shift), ...rest.slice(0, shift)])].slice(0, 5);
  const donations = programDonations(p, d);
  const top = d.isMoney ? [...donations].sort((a, b) => b.amount - a.amount).slice(0, 5) : [];
  // Cuối tab Top 5: Xem danh sách → mở tab Danh sách ủng hộ (đầy đủ, có tìm kiếm / lọc)
  const donorListBtn = top.length ? `<button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-pv-donor-list>Xem danh sách${icon('arrow')}</button>` : '';
  // Nội dung CK: mã chương trình + chuỗi ngẫu nhiên, sinh mới mỗi lượt xem trang (không trùng lặp), dùng trong popup QR
  const random = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  ctx = { p, d, photos, photo: 0, donations, bulletins: programBulletins(p, d, photos), donorPage: 1, comments: programComments(p, d), commentLimit: COMMENT_STEP, actLimit: ACT_STEP, sort: 'relevant', replyTo: null, replyDraft: '', memo: `${p.code.replace(/-/g, '')} ${random}` };
  document.title = `${p.title} | Hội Chữ thập đỏ Việt Nam`;
  $('meta[name="description"]').content = d.goal;

  // ---------- Số liệu: số tiền (VNĐ) hoặc số lượng theo đơn vị (hiến máu); tỷ lệ = đã đạt / mục tiêu × 100, làm tròn 2 chữ số thập phân ----------
  const pctExact = Math.round((p.raised / p.goal) * 10000) / 100;
  const pctText = `${nf.format(pctExact)}%`;
  const valueText = (n) => (d.isMoney ? `${vnd(n)} VNĐ` : fullAmount(p, n));
  const raiseDays = Math.max(1, Math.round((new Date(d.raiseTo) - new Date(d.raiseFrom)) / DAY));
  const { bulletins } = ctx;
  const heart = icon('heart-solid');
  // ---------- Các chiến dịch khác (SRS #19): tối đa OTHERS_MAX (8) chương trình mới nhất đang hiển thị công khai, trừ chương trình đang xem — thẻ chương trình dùng chung với trang danh sách (programCard, chuong-trinh-data.js), cùng kiểu ảnh tràn viền (.cp-grid-cover) ----------
  const others = PROGRAMS.filter((x) => x.id !== p.id).slice(0, OTHERS_MAX);
  // Danh sách ủng hộ: tìm theo tên · Tìm kiếm nâng cao (số tiền — chỉ chương trình gây quỹ tiền, thời gian) · bảng 10 dòng/trang
  const dateInput = (id, label) => `<div class="pf-control pf-date" data-vi-date><input type="text" inputmode="numeric" maxlength="10" placeholder="dd/mm/yyyy" autocomplete="off" aria-label="${label}" /><input class="pf-date-native" type="date" id="${id}" tabindex="-1" aria-hidden="true" /><button class="pf-date-btn" type="button" aria-label="Chọn ngày — ${label.toLowerCase()}">${icon('calendar')}</button></div>`;
  const donorsCard = `<div class="pf-view-card pf-pv-donors">
      <div class="pf-pv-donors-tools">
        <label class="pf-input is-search">${icon('search')}<span class="visually-hidden">Tìm kiếm người ủng hộ</span><input type="search" id="pf-pv-donor-q" placeholder="${d.isMoney ? 'Tìm theo tên hoặc mã giao dịch' : 'Tìm theo tên hoặc mã phiếu'}" autocomplete="off" /></label>
        <button class="pf-btn pf-btn-ghost pf-adv-toggle" type="button" aria-expanded="false" aria-controls="pf-pv-donor-adv" data-pv-adv>${icon('filter')}Tìm kiếm nâng cao<span class="pf-filter-count" hidden></span></button>
      </div>
      <div class="pf-pv-donor-adv" id="pf-pv-donor-adv" role="region" aria-label="Tìm kiếm nâng cao" hidden>
        <div class="pf-adv-grid${d.isMoney ? ' is-donors' : ''}">
          ${d.isMoney ? `<div class="pf-adv-field" role="group" aria-labelledby="pf-pv-donor-money"><span id="pf-pv-donor-money">Số tiền ủng hộ</span>
            <div class="pf-reg-range">${donorMoney('pf-pv-donor-min', 'Từ')}${donorMoney('pf-pv-donor-max', 'Đến')}</div>
          </div>` : ''}
          <div class="pf-adv-field" role="group" aria-labelledby="pf-pv-donor-time"><span id="pf-pv-donor-time">${d.isMoney ? 'Thời gian ủng hộ' : 'Thời gian hiến máu'}</span>
            <div class="pf-reg-range">${dateInput('pf-pv-donor-from', 'Từ ngày')}${dateInput('pf-pv-donor-to', 'Đến ngày')}</div>
          </div>
        </div>
        <div class="pf-adv-foot"><button class="pf-link-btn" type="button" data-pv-donor-reset>${icon('close')}Xóa bộ lọc</button></div>
      </div>
      <div id="pf-pv-donor-list"></div>
    </div>`;
  const tab = (id, label, selected = false) => `<button type="button" role="tab" id="pf-pv-tab-${id}" aria-controls="pf-pv-panel-${id}" aria-selected="${selected}" ${selected ? '' : 'tabindex="-1"'}>${label}</button>`;

  root.innerHTML = `
    <!-- ---------- Đầu trang: breadcrumb (Trang chủ › Ủng hộ › tên) · tên chương trình · nhãn Khẩn cấp (đứng đầu) + nhóm đối tượng hưởng lợi (SRS #2) — không ảnh banner ---------- -->
    <header class="pv-banner">
      <div class="container">
        <nav class="breadcrumb pv-breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Trang chủ</a>${icon('chevron-right')}<a href="chuong-trinh-thien-nguyen.html">Ủng hộ</a>${icon('chevron-right')}<span class="breadcrumb-current" aria-current="page">${escapeHtml(p.title)}</span>
        </nav>
        <div class="pv-banner-content">
          <h1 class="pv-banner-title" id="pv-title">${escapeHtml(p.title)}</h1>
          <p class="pv-banner-tags">${p.priority === 'urgent' ? '<span class="pv-banner-tag is-urgent"><span class="pf-dot" aria-hidden="true"></span>Khẩn cấp</span>' : ''}${d.info.groups.map((g) => `<span class="pv-banner-tag">${escapeHtml(g)}</span>`).join('')}</p>
        </div>
      </div>
    </header>
    <div class="container">

      <div class="pf-pv-split">
        <div class="pf-pv-split-main">
          <!-- ---------- Bộ ảnh (SRS #3): ảnh lớn, nút ‹ › hai bên, dải ảnh nhỏ; tự chuyển ảnh mỗi 2 giây (dừng khi rê chuột) ---------- -->
          <section class="pf-pv-card pv-photos" aria-label="Hình ảnh chương trình">
            <div class="pf-pv-gallery">
              <figure class="pf-pv-main">
                <img id="pf-pv-main-img" src="${IMG}${photos[0]}" alt="Ảnh chương trình ${escapeHtml(p.title)}" />
                <div class="pf-pv-nav"><button class="pf-pv-nav-btn is-prev" type="button" data-pv-step="-1" aria-label="Ảnh trước">${icon('chevron-right')}</button><button class="pf-pv-nav-btn" type="button" data-pv-step="1" aria-label="Ảnh sau">${icon('chevron-right')}</button></div>
              </figure>
              <div class="pf-pv-thumbs" role="group" aria-label="Ảnh chương trình">${photos.map((src, i) => `<button class="pf-pv-thumb" type="button" data-pv-photo="${i}" aria-pressed="${i === 0}" aria-label="Ảnh ${i + 1}"><img src="${IMG}${src}" alt="" loading="lazy" /></button>`).join('')}</div>
            </div>
          </section>

          <!-- ---------- Tab nội dung: Câu chuyện (SRS #15) · Hoạt động — dòng thời gian bản tin (SRS #16, #18) · Danh sách ủng hộ (SRS #12, #17) ---------- -->
          <section class="pf-pv-card pv-content" aria-label="Nội dung chương trình">
            <div class="pf-pv-tabs" role="tablist" aria-label="Nội dung chương trình">
              ${tab('story', 'Câu chuyện', true)}${tab('acts', `Hoạt động (${bulletins.length})`)}${tab('donors', `${d.isMoney ? 'Danh sách ủng hộ' : 'Danh sách hiến máu'} (${vnd(d.donors)})`)}
            </div>
            <!-- Câu chuyện: tên in hoa · dòng tóm tắt (thời gian – mục tiêu – loại hình – đối tượng) · câu chuyện · khung khẩu hiệu · Mục tiêu · nguồn đóng góp dùng cho; thu gọn, Xem thêm -->
            <div class="pf-pv-panel" id="pf-pv-panel-story" role="tabpanel" aria-labelledby="pf-pv-tab-story" tabindex="0">
              <div class="pf-pv-story-text pv-story is-collapsed" id="pf-pv-story-text">
                <h2 class="pv-story-title">${heart}${escapeHtml(p.title.toUpperCase())}${heart}</h2>
                <p class="pv-story-lead">${raiseDays} ngày – ${shortAmount(p, p.goal)} – ${escapeHtml(d.info.support)} – ${escapeHtml(d.people)}</p>
                <p>${escapeHtml(d.goal)}</p>
                ${d.story.map((s) => `<p>${escapeHtml(s)}</p>`).join('')}
                <p><b>Mục tiêu:</b> ${d.isMoney ? `Vận động ${vnd(p.goal)} đồng` : `Tiếp nhận ${fullAmount(p, p.goal)}`} hỗ trợ ${escapeHtml(d.info.groups.join(', ').toLowerCase())} tại <b>${escapeHtml(d.area)}</b>.</p>
                <p class="pf-pv-pre">${escapeHtml(`Nguồn đóng góp được sử dụng cho:\n${d.uses.map((u) => `- ${u}`).join('\n')}`)}</p>
              </div>
              <button class="pf-pv-link" type="button" data-pv-more aria-expanded="false" aria-controls="pf-pv-story-text"><span>Xem thêm</span>${icon('chevron-down')}</button>
            </div>
            <div class="pf-pv-panel" id="pf-pv-panel-acts" role="tabpanel" aria-labelledby="pf-pv-tab-acts" tabindex="0" hidden>
              ${bulletins.length ? `<ol class="pf-pv-timeline" id="pv-acts">${bulletins.map((b, i) => `<li class="pf-pv-tl-item"${i >= ACT_STEP ? ' hidden' : ''}><time class="pf-pv-tl-date" datetime="${b.date}">${viDate(b.date)}</time>${bulletin(b, { dateless: true })}</li>`).join('')}</ol>
              <button class="pf-btn pf-btn-ghost pf-pv-feed-more pv-acts-more" type="button" data-act-more aria-controls="pv-acts"${bulletins.length > ACT_STEP ? '' : ' hidden'}>Xem thêm hoạt động (${bulletins.length - ACT_STEP})${icon('arrow')}</button>` : none('Chương trình chưa có bản tin cập nhật.')}
            </div>
            <div class="pf-pv-panel" id="pf-pv-panel-donors" role="tabpanel" aria-labelledby="pf-pv-tab-donors" tabindex="0" hidden>${donorsCard}</div>
          </section>

          <!-- ---------- Hoạt động (trích đoạn): bản tin mới nhất, bấm tiêu đề mở tab Hoạt động — ẩn khi đang xem tab Hoạt động (trùng nội dung) ---------- -->
          <section class="pf-pv-card pf-pv-updates" aria-labelledby="pf-pv-updates-title">
            <h3 id="pf-pv-updates-title">Hoạt động (${bulletins.length})</h3>
            ${bulletins.length ? bulletin(bulletins[0], { excerpt: true }) : none('Chương trình chưa có bản tin cập nhật.')}
          </section>

          <!-- ---------- Bình luận (cột trái, dưới Hoạt động): Bình luận (N) · sắp xếp · ô viết (Enter gửi) · danh sách Thích, Trả lời (1 cấp); hiện 3, Xem thêm mở thêm 3 ---------- -->
          <section class="pf-pv-card pv-cm-card" aria-labelledby="pv-cm-list-title">
            <header class="pv-cm-head">
              <h3 id="pv-cm-list-title">Bình luận (0)</h3>
              <button class="pf-link-btn" type="button" data-cm-sort aria-label="Sắp xếp bình luận: Phù hợp nhất">${icon('sliders')}<span>Phù hợp nhất</span></button>
            </header>
            <div class="pf-field pv-cm-compose" id="pv-cm-field">
              ${cmAvatar(ME)}
              <div class="pv-cm-box">
                <label class="visually-hidden" for="pv-cm-text">Viết bình luận với tên ${ME}</label>
                <textarea id="pv-cm-text" rows="1" maxlength="${COMMENT_MAX}" placeholder="Viết bình luận…" data-cm-input="post"></textarea>
                <button class="pv-cm-send" type="button" data-cm-post aria-label="Gửi bình luận">${icon('send')}</button>
              </div>
              <p class="pf-field-error">${icon('alert')}Vui lòng nhập nội dung bình luận.</p>
            </div>
            <ol class="pv-comments" id="pv-comments"></ol>
            <button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-cm-more hidden>Xem thêm bình luận${icon('arrow')}</button>
          </section>
        </div>

        <!-- ---------- Cột phải: gây quỹ · Vinh danh (Top 5 ủng hộ · Người đồng hành, cuối mỗi tab có Xem danh sách) · Kê khai khoản chi đang ẩn (SHOW_SPEND) ---------- -->
        <aside class="pf-pv-split-side" aria-label="Quyên góp và vinh danh">
          <!-- Gây quỹ (nền hồng nhạt): người vận động (SRS #4) · khối trắng: mục tiêu, thời gian còn lại
               · khối trắng: số đã đạt (đỏ lớn) + % · thanh tiến độ · lượt ủng hộ · Ủng hộ · Xuất sao kê, Chia sẻ -->
          <section class="pf-pv-card pf-pv-fund pv-fund" aria-label="Tiến độ gây quỹ">
            <div class="pf-pv-org pv-fund-org">
              <img class="pv-fund-logo" src="Emages/logo-hctd-mark.svg" alt="" width="44" height="44" />
              <div class="pf-pv-org-text"><p class="pf-pv-cap">Người vận động</p><p class="pf-pv-org-name">${escapeHtml(d.org)}</p></div>
              <span class="pf-badge is-green">${icon('check')}Đã xác minh</span>
            </div>
            <!-- Mục tiêu · thời gian còn lại: ô biểu tượng (mục tiêu / đồng hồ — sắp diễn ra: lịch · đã kết thúc: dấu tích) + nhãn + giá trị -->
            <ul class="pv-fund-facts">
              <li><span class="pv-fact-icon">${icon('target')}</span><span><small>Mục tiêu chiến dịch</small><b>${valueText(p.goal)}</b></span></li>
              <li class="${upcoming(p) ? 'is-upcoming' : d.ended ? 'is-ended' : endingSoon(p) ? 'is-warning' : ''}"><span class="pv-fact-icon">${icon(upcoming(p) ? 'calendar' : d.ended ? 'check' : 'clock')}</span><span><small>${upcoming(p) ? 'Trạng thái' : 'Thời gian còn lại'}</small><b${upcoming(p) ? ' class="is-upcoming"' : endingSoon(p) ? ' class="is-warning"' : ''}>${upcoming(p) ? `Sắp diễn ra · mở sau ${p.startIn} ngày` : d.ended ? 'Đã kết thúc' : `${p.days} ngày`}</b></span></li>
            </ul>
            <div class="pv-fund-panel">
              <div class="pv-fund-raised"><p><span class="visually-hidden">${d.isMoney ? 'Đã đạt được' : 'Đã tiếp nhận'}</span><b>${valueText(p.raised)}</b></p><b>${pctText}</b></div>
              <span class="pf-pv-bar" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(pctExact, 100)}" aria-valuetext="Đã đạt ${pctText} mục tiêu"><span style="width:${Math.min(pctExact, 100)}%"></span></span>
              <p class="pv-fund-count">${d.isMoney ? 'Lượt ủng hộ' : 'Lượt hiến máu'}: <b>${vnd(d.donors)}</b></p>
              <button class="pf-btn pf-btn-primary pf-pv-donate" type="button" ${d.isMoney ? 'data-pv-donate' : `data-panel="${escapeHtml(`Đăng ký hiến máu — ${p.title}`)}"`}>${heart}${d.isMoney ? 'Ủng hộ ngay' : 'Đăng ký hiến máu'}</button>
              <div class="pf-pv-actions">
                ${d.isMoney ? `<button class="pf-btn pf-btn-ghost" type="button" data-pv-statement>${icon('document')}Xuất sao kê</button>` : ''}
                <button class="pf-btn pf-btn-ghost" type="button" data-pv-share>${icon('share')}Chia sẻ</button>
              </div>
            </div>
          </section>
          ${d.isMoney ? `${SHOW_COMPANIONS ? `<section class="pf-pv-card pf-pv-top5" aria-label="Vinh danh">
            <!-- Tab: Top 5 người ủng hộ nhiều nhất · Người đồng hành (kêu gọi gây quỹ) — cuối mỗi tab có nút Xem danh sách -->
            <div class="pf-pv-tabs pv-top5-tabs" role="tablist" aria-label="Vinh danh">${tab('top', 'Top 5 ủng hộ', true)}${tab('companions', 'Người đồng hành')}</div>
            <div class="pv-top5-panel" id="pf-pv-panel-top" role="tabpanel" aria-labelledby="pf-pv-tab-top">${top.length ? top5(top) : none('Chương trình chưa có người ủng hộ.')}${donorListBtn}</div>
            <div class="pv-top5-panel" id="pf-pv-panel-companions" role="tabpanel" aria-labelledby="pf-pv-tab-companions" hidden>${companionList(programCompanions(p))}<button class="pf-btn pf-btn-ghost pf-pv-feed-more" type="button" data-panel="${escapeHtml(`Danh sách người đồng hành — ${p.title}`)}">Xem danh sách${icon('arrow')}</button></div>
          </section>` : `<section class="pf-pv-card pf-pv-top5" aria-labelledby="pf-pv-top5-title">
            <!-- Top 5 người ủng hộ nhiều nhất (tab Người đồng hành đang ẩn — SHOW_COMPANIONS) -->
            <h3 class="pf-pv-top5-title" id="pf-pv-top5-title">Top 5 người ủng hộ nhiều nhất</h3>
            <div class="pv-top5-panel" id="pf-pv-panel-top">${top.length ? top5(top) : none('Chương trình chưa có người ủng hộ.')}${donorListBtn}</div>
          </section>`}
          ${SHOW_SPEND ? `<!-- Kê khai khoản chi (SRS #14): gauge nửa vòng · có / chưa có chứng từ -->
          <section class="pf-pv-card pf-pv-spend" aria-labelledby="pf-pv-spend-title"><h3 id="pf-pv-spend-title">Kê khai khoản chi</h3>${spendGauge(d)}</section>` : ''}` : ''}
        </aside>
      </div>

      <!-- ---------- Các chiến dịch khác (SRS #19, #20): thẻ chương trình, nút ‹ ›, tự cuộn 1 thẻ mỗi 10 giây ---------- -->
      <section class="pf-pv-others" aria-labelledby="pv-others-title">
        <div class="pf-pv-others-head"><h2 id="pv-others-title">Các chiến dịch khác</h2>
          <div class="pv-car-nav"><button class="pv-car-btn is-prev" type="button" data-car="pv-others" data-car-step="-1" aria-label="Chiến dịch trước">${icon('chevron-right')}</button><button class="pv-car-btn" type="button" data-car="pv-others" data-car-step="1" aria-label="Chiến dịch sau">${icon('chevron-right')}</button></div>
        </div>
        <div class="pv-track pv-cards cp-grid-cover" id="pv-others" role="group" aria-label="Các chiến dịch khác — tự cuộn mỗi 10 giây, dừng khi rê chuột">${others.map((x) => programCard(x)).join('')}</div>
        <!-- Chấm chuyển (dùng lại .founders-dot trang chủ): mỗi chấm = 1 vị trí cuộn (thẻ đầu khung), chấm đang xem kéo dài màu đỏ — renderOthersDots dựng, 1 vị trí thì ẩn -->
        <div class="founders-dots pv-others-dots" id="pv-others-dots" role="group" aria-label="Chọn vị trí dải Các chiến dịch khác"></div>
      </section>
    </div>`;

  renderDonors(1);
  renderComments();
  syncStoryMore();
  renderOthersDots();
  startAuto();
};

// ---------- Tab nội dung: chọn tab hiện vùng nội dung tương ứng · khối Hoạt động (trích đoạn) ẩn khi đang xem tab Hoạt động ----------
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Mỗi thanh tab chỉ đổi tab của chính nó (tab nội dung · tab Vinh danh: Top 5 / Người đồng hành)
const selectTab = (button) => {
  const list = button.closest('[role="tablist"]');
  list.querySelectorAll('[role="tab"]').forEach((t) => {
    const on = t === button;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (!list.classList.contains('pv-top5-tabs')) $('.pf-pv-updates').hidden = button.id === 'pf-pv-tab-acts';
};

// ---------- Tự chuyển: ảnh lớn sang ảnh kế tiếp mỗi 2 giây (PHOTO_MS, #3) · Các chiến dịch khác cuộn 1 thẻ mỗi 10 giây (AUTO_MS), hết thì về đầu (#19); dừng khi rê chuột / đang focus, tắt khi giảm chuyển động ----------
const AUTO_MS = 10000;
const PHOTO_MS = 2000;
let autoTimer;
let photoTimer;
// Dải trượt (Hoạt động tiêu biểu, Các chiến dịch khác): dịch 1 thẻ; hết thì quay về đầu / cuối
const stepTrack = (track, dir) => {
  const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  const atStart = track.scrollLeft <= 2;
  const left = dir > 0 ? (atEnd ? 0 : track.scrollLeft + step) : (atStart ? track.scrollWidth : track.scrollLeft - step);
  track.scrollTo({ left, behavior: reduced() ? 'auto' : 'smooth' });
};
// ---------- Các chiến dịch khác: chấm chuyển — số chấm = số thẻ − số thẻ trong khung + 1 (đổi theo cỡ màn hình); cuộn → tô chấm; bấm chấm → cuộn tới ----------
const OTHERS_MAX = 8;
const trackStep = (track) => track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
const syncOthersDots = () => {
  const track = $('#pv-others');
  const dots = $('#pv-others-dots');
  if (!track || !dots || !track.firstElementChild) return;
  const i = Math.round(track.scrollLeft / trackStep(track));
  [...dots.children].forEach((dot, k) => dot.setAttribute('aria-current', String(k === Math.min(i, dots.children.length - 1))));
};
const renderOthersDots = () => {
  const track = $('#pv-others');
  const dots = $('#pv-others-dots');
  if (!track || !dots || !track.firstElementChild) return;
  const perView = Math.max(1, Math.round(track.clientWidth / trackStep(track)));
  const count = Math.max(1, track.children.length - perView + 1);
  dots.hidden = count <= 1;
  if (dots.children.length !== count) {
    dots.innerHTML = Array.from({ length: count }, (_, k) => `<button class="founders-dot" type="button" data-others-dot="${k}" aria-controls="pv-others" aria-label="Vị trí ${k + 1} / ${count}"></button>`).join('');
  }
  syncOthersDots();
};
// Dải được dựng lại mỗi lần vẽ trang → bắt sự kiện cuộn ở document (capture); đổi cỡ màn hình → tính lại số chấm
let othersRaf = 0;
document.addEventListener('scroll', (event) => {
  if (event.target.id !== 'pv-others' || othersRaf) return;
  othersRaf = requestAnimationFrame(() => { othersRaf = 0; syncOthersDots(); });
}, { capture: true, passive: true });
addEventListener('resize', () => renderOthersDots());
// ---------- Kéo chuột qua lại trên dải (máy tính; cảm ứng đã vuốt được sẵn): giữ chuột trái + kéo → cuộn theo; thả → bắt vào thẻ gần nhất.
// Kéo quá 5px thì không mở thẻ khi thả (chặn click); tắt bắt thẻ (scroll-snap) trong lúc kéo để dải đi theo chuột mượt ----------
const DRAG_MIN = 5;
let drag = null;
document.addEventListener('pointerdown', (event) => {
  const track = event.target.closest('#pv-others');
  if (!track || event.pointerType !== 'mouse' || event.button !== 0) return;
  drag = { track, x: event.clientX, left: track.scrollLeft, moved: false };
});
document.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const dx = event.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < DRAG_MIN) return;
  if (!drag.moved) { drag.moved = true; drag.track.classList.add('is-dragging'); }
  drag.track.scrollLeft = drag.left - dx;
});
const endDrag = () => {
  if (!drag) return;
  const { track, moved } = drag;
  drag = null;
  if (!moved) return;
  track.classList.remove('is-dragging');
  const step = trackStep(track);
  track.scrollTo({ left: Math.round(track.scrollLeft / step) * step, behavior: reduced() ? 'auto' : 'smooth' });
  // Chặn click ngay sau khi kéo (thả chuột trên thẻ không mở trang chi tiết)
  // (click đến ngay sau pointerup; quá 1 nhịp mà không có click — thả ngoài dải — thì gỡ để click sau vẫn bình thường)
  const block = (e) => { e.preventDefault(); e.stopPropagation(); };
  track.addEventListener('click', block, { capture: true, once: true });
  setTimeout(() => track.removeEventListener('click', block, { capture: true }), 0);
};
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);
document.addEventListener('dragstart', (event) => { if (event.target.closest('#pv-others')) event.preventDefault(); }); // không kéo ảnh / liên kết kiểu mặc định
const startAuto = () => {
  clearInterval(autoTimer);
  clearInterval(photoTimer);
  if (reduced()) return;
  // Bộ ảnh: 2 giây đổi 1 ảnh, dừng khi rê chuột / focus trong bộ ảnh
  photoTimer = setInterval(() => {
    const gallery = body.querySelector('.pf-pv-gallery');
    if (gallery && !gallery.matches(':hover, :focus-within')) showPhoto(ctx.photo + 1);
  }, PHOTO_MS);
  autoTimer = setInterval(() => {
    const track = $('#pv-others');
    if (track.firstElementChild && !track.matches(':hover, :focus-within')) stepTrack(track, 1);
  }, AUTO_MS);
};

// ---------- Bình luận: đầu thẻ (Bình luận (N) · sắp xếp) · ô viết bo tròn · danh sách — mỗi bình luận: avatar · tên (Ban tổ chức có nhãn) • thời gian · nội dung · Thích (n) · Trả lời ----------
// Trả lời 1 cấp: avatar nhỏ, lùi vào dưới bình luận gốc, xếp cũ trước; ô trả lời nằm dưới các trả lời
// Bình luận mới giữ trong phiên xem trang (minh họa) — khi triển khai thật, gửi lên hệ thống và tải lại theo chương trình
const SORT_LABEL = { relevant: 'Phù hợp nhất', newest: 'Mới nhất' };
const commentWhen = (ms) => (Date.now() - ms < 60000 ? 'Vừa xong' : viDateTime(ms));
// Ô viết (bình luận / trả lời): ô bo tròn tự giãn chiều cao · nút gửi; lỗi bỏ trống hiện dưới ô
const composeBox = (id, kind, placeholder, label, sendAttr, value = '') => `<div class="pv-cm-box">
    <label class="visually-hidden" for="${id}">${label}</label>
    <textarea id="${id}" rows="1" maxlength="${COMMENT_MAX}" placeholder="${placeholder}" data-cm-input="${kind}">${escapeHtml(value)}</textarea>
    <button class="pv-cm-send" type="button" ${sendAttr} aria-label="${label}">${icon('send')}</button>
  </div>`;
const replyForm = (c) => `<div class="pf-field pv-reply-form" id="pv-reply-field">
    ${composeBox('pv-reply-text', 'reply', `Trả lời ${escapeHtml(c.name)}…`, `Gửi trả lời ${escapeHtml(c.name)}`, `data-cm-send="${c.id}"`, ctx.replyDraft)}
    <p class="pf-field-error">${icon('alert')}Vui lòng nhập nội dung trả lời.</p>
    <p class="pv-cm-hint">Nhấn Enter để gửi · <button class="pf-link-btn" type="button" data-cm-cancel>Hủy</button></p>
  </div>`;
// Avatar bình luận: chữ cái đầu của họ và tên (Dương Thị Hà → DH) · Ban tổ chức dùng logo Hội
const initials = (name) => { const w = name.trim().split(/\s+/); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
// Màu avatar: người xuất hiện lần đầu nhận tông kế tiếp trong vòng 5 tông (.pv-cm-initials.tone-0…4), sau đó giữ nguyên —
// người liền nhau luôn khác màu, cùng một người luôn cùng màu
const avatarTones = new Map();
const avatarTone = (name) => {
  if (!avatarTones.has(name)) avatarTones.set(name, avatarTones.size % 5);
  return avatarTones.get(name);
};
const cmAvatar = (name, kind = 'user') => (kind === 'org' ? '<img class="pf-pv-avatar pv-cm-logo" src="Emages/logo-hctd-mark.svg" alt="" width="40" height="40" />' : `<span class="pf-pv-avatar pv-cm-initials tone-${avatarTone(name)}" aria-hidden="true">${escapeHtml(initials(name))}</span>`);
const commentItem = (c, isReply = false) => `<li class="pv-comment${isReply ? ' is-reply' : ''}">
  ${cmAvatar(c.name, c.kind)}
  <div class="pv-comment-main">
    <article class="pf-pv-update is-full">
      <p class="pf-pv-update-meta"><b>${escapeHtml(c.name)}</b>${c.kind === 'org' ? `<span class="pf-badge is-green">${icon('check')}Ban tổ chức</span>` : ''}<span aria-hidden="true">•</span><time datetime="${new Date(c.time).toISOString()}">${commentWhen(c.time)}</time></p>
      <p class="pf-pv-update-text">${escapeHtml(c.text)}</p>
    </article>
    <div class="pv-comment-actions">
      <button class="pf-link-btn" type="button" data-cm-like="${c.id}" aria-pressed="${c.liked}" aria-label="Thích bình luận của ${escapeHtml(c.name)}${c.likes ? `, ${c.likes} lượt thích` : ''}">${icon(c.liked ? 'heart-solid' : 'heart')}Thích${c.likes ? ` (${c.likes})` : ''}</button>
      ${isReply ? '' : `<button class="pf-link-btn" type="button" data-cm-reply="${c.id}" aria-expanded="${ctx.replyTo === c.id}">Trả lời</button>`}
    </div>
    ${isReply ? '' : `${c.replies.length ? `<ol class="pv-comments">${c.replies.map((r) => commentItem(r, true)).join('')}</ol>` : ''}${ctx.replyTo === c.id ? replyForm(c) : ''}`}
  </div>
</li>`;
// Sắp xếp: Phù hợp nhất (lượt thích + trả lời) · Mới nhất; bình luận vừa gửi luôn lên đầu
const sortedComments = () => {
  const score = (c) => c.likes + c.replies.length * 3;
  return [...ctx.comments].sort((a, b) => (b.mine || 0) - (a.mine || 0) || (ctx.sort === 'newest' ? b.time - a.time : score(b) - score(a) || b.time - a.time));
};
const renderComments = () => {
  const { comments, commentLimit } = ctx;
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);
  $('#pv-comments').innerHTML = comments.length ? sortedComments().slice(0, commentLimit).map((c) => commentItem(c)).join('') : `<li>${none('Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ.')}</li>`;
  $('[data-cm-more]').hidden = comments.length <= commentLimit;
  $('#pv-cm-list-title').textContent = `Bình luận (${vnd(total)})`;
  const sort = $('[data-cm-sort]');
  sort.querySelector('span').textContent = SORT_LABEL[ctx.sort];
  sort.setAttribute('aria-label', `Sắp xếp bình luận: ${SORT_LABEL[ctx.sort]}`);
  const reply = $('#pv-reply-text');
  if (reply) growBox(reply);
};
const findComment = (cid) => ctx.comments.flatMap((c) => [c, ...c.replies]).find((c) => c.id === cid);
// Ô viết tự giãn theo nội dung (tối đa ~5 dòng, CSS max-height)
const growBox = (area) => { area.style.height = 'auto'; area.style.height = `${area.scrollHeight}px`; };
// Gửi bình luận / trả lời: bỏ trống thì báo lỗi dưới ô; bình luận mới lên đầu, trả lời ở cuối luồng; báo toast
const postComment = () => {
  const text = $('#pv-cm-text');
  const value = text.value.trim();
  $('#pv-cm-field').classList.toggle('is-invalid', !value);
  if (!value) { text.focus(); return; }
  commentSeq += 1;
  ctx.comments.push({ id: commentSeq, name: ME, kind: 'user', time: Date.now(), text: value, likes: 0, liked: false, replies: [], mine: commentSeq });
  text.value = '';
  growBox(text);
  renderComments();
  showToast('Đã gửi bình luận.');
};
const postReply = (cid) => {
  const text = $('#pv-reply-text');
  const value = text.value.trim();
  $('#pv-reply-field').classList.toggle('is-invalid', !value);
  if (!value) { text.focus(); return; }
  commentSeq += 1;
  ctx.comments.find((c) => c.id === cid).replies.push({ id: commentSeq, name: ME, kind: 'user', time: Date.now(), text: value, likes: 0, liked: false });
  ctx.replyTo = null;
  ctx.replyDraft = '';
  renderComments();
  showToast('Đã gửi trả lời.');
};

// ---------- Danh sách ủng hộ: lọc theo tên, số tiền, thời gian · 10 dòng/trang · “Hiển thị x – y/N” ----------
// Ô số tiền (lọc danh sách ủng hộ): dùng lại .pf-control.has-suffix — chỉ nhận chữ số, tự thêm dấu chấm hàng nghìn, đuôi VNĐ
const donorMoney = (id, label) => `<div class="pf-control has-suffix"><input type="text" inputmode="numeric" id="${id}" placeholder="${label}" autocomplete="off" aria-label="Số tiền ủng hộ — ${label.toLowerCase()}" /><span class="pf-suffix" aria-hidden="true">VNĐ</span></div>`;
const moneyValue = (el) => Number((el?.value || '').replace(/\D/g, '')) || 0;
const formatMoneyInput = (el) => { const n = moneyValue(el); el.value = n ? n.toLocaleString('vi-VN') : ''; };
const renderDonors = (page = ctx.donorPage) => {
  const { d } = ctx;
  const q = fold($('#pf-pv-donor-q').value.trim());
  // Số tiền Từ – Đến (bỏ trống = không giới hạn; nhập ngược thì tự đổi chỗ)
  let min = d.isMoney ? moneyValue($('#pf-pv-donor-min')) : 0;
  let max = d.isMoney ? moneyValue($('#pf-pv-donor-max')) : 0;
  if (min && max && min > max) [min, max] = [max, min];
  const from = $('#pf-pv-donor-from').value;
  const to = $('#pf-pv-donor-to').value;
  const rows = ctx.donations.filter((x) => {
    const day = isoDate(new Date(x.time));
    return (!q || fold(x.name).includes(q) || fold(x.ref).includes(q)) && (!min || x.amount >= min) && (!max || x.amount <= max) && (!from || day >= from) && (!to || day <= to);
  });
  const active = [min || max, from || to].filter(Boolean).length;
  const count = $('[data-pv-adv] .pf-filter-count');
  count.hidden = active === 0;
  count.textContent = active;
  const pages = Math.max(1, Math.ceil(rows.length / DONORS_PER_PAGE));
  ctx.donorPage = Math.min(Math.max(1, page), pages);
  const start = (ctx.donorPage - 1) * DONORS_PER_PAGE;
  const slice = rows.slice(start, start + DONORS_PER_PAGE);
  // Cột: # · người (lời nhắn ngay dưới tên: in nghiêng, trong ngoặc kép, dài thì cắt 2 dòng, rê chuột xem đủ; không có lời nhắn → chỉ tên) · số tiền / số lượng · mã giao dịch · thời gian
  const heads = d.isMoney ? ['Người ủng hộ', 'Số tiền ủng hộ', 'Mã giao dịch', 'Thời gian ủng hộ'] : ['Người hiến máu', 'Số lượng', 'Mã phiếu', 'Thời gian hiến máu'];
  $('#pf-pv-donor-list').innerHTML = rows.length ? `<div class="pf-view-table"><table class="pf-reg-table is-view is-v-donors is-v-refs">
      <thead><tr><th scope="col" class="pf-col-index">#</th>${heads.map((t) => `<th scope="col">${t}</th>`).join('')}</tr></thead>
      <tbody>${slice.map((x, i) => `<tr><td class="pf-col-index">${start + i + 1}</td><td><span class="pf-pv-donor${x.note ? ' has-note' : ''}"><b>${escapeHtml(x.name)}</b>${x.note ? `<span class="pv-donor-note is-quote" title="${escapeHtml(x.note)}">“${escapeHtml(x.note)}”</span>` : ''}</span></td><td><b class="pf-pv-amount">${d.isMoney ? `${vnd(x.amount)}đ` : `${x.amount} đơn vị`}</b></td><td><span class="pv-donor-ref">${x.ref}</span></td><td>${viDateTime(x.time)}</td></tr>`).join('')}</tbody>
    </table></div>
    <div class="pf-table-foot">
      <p class="pf-muted" aria-live="polite">Hiển thị ${start + 1} – ${start + slice.length}/${vnd(rows.length)}</p>
      ${pages > 1 ? pagerHtml(ctx.donorPage, pages) : ''}
    </div>` : none(d.isMoney ? 'Không tìm thấy người ủng hộ phù hợp.' : 'Không tìm thấy người hiến máu phù hợp.');
};

// ---------- Câu chuyện: chỉ hiện Xem thêm khi nội dung dài hơn khung thu gọn ----------
const syncStoryMore = () => {
  const text = $('#pf-pv-story-text');
  const more = $('[data-pv-more]');
  const overflow = text.scrollHeight > text.clientHeight + 1;
  more.hidden = !overflow;
  if (!overflow) text.classList.remove('is-collapsed');
};

// ---------- Bộ ảnh: ảnh nhỏ, nút trước/sau ----------
const showPhoto = (index) => {
  ctx.photo = (index + ctx.photos.length) % ctx.photos.length;
  $('#pf-pv-main-img').src = `${IMG}${ctx.photos[ctx.photo]}`;
  body.querySelectorAll('.pf-pv-thumb').forEach((b, i) => b.setAttribute('aria-pressed', String(i === ctx.photo)));
};
// ---------- Sao chép vào bộ nhớ tạm: trả về false khi trình duyệt không cho phép ----------
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const area = Object.assign(document.createElement('textarea'), { value: text });
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
};
// ---------- Chia sẻ (NL05): sao chép URL trang → TB02; không sao chép được → TB07 kèm URL · Xuất sao kê: tệp CSV toàn bộ lượt ủng hộ ----------
const copyUrl = async () => {
  const url = window.location.href;
  if (await copyText(url)) showToast('Đã sao chép liên kết chương trình.');
  else showToast(`Không thể sao chép tự động. Vui lòng sao chép liên kết: ${url}`, 'error');
};
const exportStatement = () => {
  const { p, donations } = ctx;
  const cell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [['STT', 'Thời gian ủng hộ', 'Người ủng hộ', 'Số tiền ủng hộ (VNĐ)'], ...donations.map((x, i) => [i + 1, viDateTime(x.time), x.name, x.amount])];
  const blob = new Blob([`﻿${lines.map((r) => r.map(cell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `sao-ke-${p.id}.csv` });
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(`Đã xuất sao kê ${vnd(donations.length)} lượt ủng hộ.`);
};

// ==================== SECTION: POPUP ỦNG HỘ — MÃ QR QUYÊN GÓP (SRS 3.3) — form (ngân hàng · số tiền · lời nhắn · tên hiển thị · email/SĐT · ẩn danh · Tạo mã QR) · thẻ VietQR · thông tin chuyển khoản ====================
// Bước 9: hết thời gian tiếp nhận → TB06, không mở popup · mặc định BIDV, đổi ngân hàng thì QR, số tài khoản, chủ tài khoản cập nhật theo (bước 10)
// Minh họa: số tài khoản suy cố định theo mã chương trình + ngân hàng; mã QR là hình minh họa (khi triển khai lấy VietQR do ngân hàng đối tác cung cấp)
const BANKS = {
  BIDV: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
  TPB: 'Ngân hàng TMCP Tiên Phong (TPBank)',
  CTG: 'Ngân hàng TMCP Công Thương Việt Nam (VietinBank)',
  VCB: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  TCB: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
};
const bankShort = (bank) => BANKS[bank].match(/\((.+)\)/)[1];
const qrDialog = $('#pv-qr');
const qrForm = $('#pv-qr-form');
const qrBank = $('#pv-qr-bank');
const qrAmount = $('#pv-qr-amount');
const qrMessage = $('#pv-qr-message');
const qrDisplay = $('#pv-qr-display');
const qrContact = $('#pv-qr-contact');
const qrAnon = $('#pv-qr-anon');
const qrAccount = (bank) => {
  const rand = seededRandom(`${ctx.p.code}-${bank}`);
  return Array.from({ length: 13 }, () => Math.floor(rand() * 10)).join('');
};
// Hình mã QR minh họa: lưới 25 × 25 ô, 3 ô định vị ở góc, phần còn lại sinh cố định theo nội dung
const qrSvg = (text) => {
  const n = 25;
  const rand = seededRandom(text);
  // Vùng góc 8 × 8 (trên trái, trên phải, dưới trái): ô định vị 7 × 7 + 1 hàng trống ngăn cách
  const corner = (x, y, size) => (x < size && y < size) || (x >= n - size && y < size) || (x < size && y >= n - size);
  const cells = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const fx = x < 7 ? x : x - (n - 7);
      const fy = y < 7 ? y : y - (n - 7);
      const on = corner(x, y, 8)
        ? corner(x, y, 7) && (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4))
        : rand() < 0.48;
      if (on) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 29 29" role="img" aria-label="Mã QR quyên góp (minh họa)"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/><path d="${cells.join('')}" fill="#24272C"/></svg>`;
};
const amountValue = () => Number(qrAmount.value.replace(/\D/g, '')) || 0;
// Vẽ lại QR + thông tin chuyển khoản theo ngân hàng, số tiền đã tạo mã (ctx.qrAmount) và mã ủng hộ
const renderQr = () => {
  const bank = qrBank.value;
  const account = qrAccount(bank);
  $('#pv-qr-account').textContent = account;
  $('#pv-qr-holder').textContent = fold(ctx.d.org).toUpperCase();
  $('#pv-qr-bank-short').textContent = `${bankShort(bank)}`;
  $('#pv-qr-bank-name').textContent = bankShort(bank);
  $('#pv-qr-amount-view').textContent = ctx.qrAmount ? `${vnd(ctx.qrAmount)} VNĐ` : 'Nhập trên ứng dụng';
  $('#pv-qr-memo').textContent = ctx.memo;
  $('#pv-qr-image').innerHTML = qrSvg(`${bank}|${account}|${ctx.qrAmount}|${ctx.memo}`);
};
// Số tiền ủng hộ (SRS 3.3 #6): chỉ giữ chữ số, tự phân cách hàng nghìn bằng "." · chọn nhanh 4 mức
qrAmount.addEventListener('input', () => {
  const digits = qrAmount.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12);
  qrAmount.value = digits ? Number(digits).toLocaleString('vi-VN') : '';
  if (amountValue() >= 1000) $('#pv-qr-amount-field').classList.remove('is-invalid');
});
// Ủng hộ ẩn danh: khóa ô Tên hiển thị
qrAnon.addEventListener('change', () => { qrDisplay.disabled = qrAnon.checked; });

// ---------- Mã ủng hộ = Nội dung CK (SRS 1.4): mã chương trình viết liền + "-" + 3 chữ + 4 số, sinh mới mỗi lần mở popup, không trùng ----------
const usedMemos = new Set();
const newMemo = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let memo;
  do {
    const tail = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('') + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    memo = `${ctx.p.code.replace(/-/g, '')}-${tail}`;
  } while (usedMemos.has(memo));
  usedMemos.add(memo);
  return memo;
};

// Bước 8–9b: mở popup — mặc định BIDV (danh sách hiện "số tài khoản - tên ngân hàng"), mã ủng hộ mới, form trống
const openQr = () => {
  if (ctx.d.ended) { showToast('Chương trình hiện không còn tiếp nhận quyên góp.', 'warning'); return; }
  ctx.memo = newMemo();
  ctx.qrAmount = 0;
  $('#pv-qr-code').textContent = ctx.p.code;
  $('#pv-qr-name').textContent = ctx.p.title;
  qrBank.replaceChildren(...Object.entries(BANKS).map(([value, label]) => new Option(`${qrAccount(value)} - ${label}`, value)));
  qrBank.value = 'BIDV';
  qrForm.reset();
  qrDisplay.disabled = false;
  $('#pv-qr-amount-field').classList.remove('is-invalid');
  renderQr();
  qrDialog.showModal();
  startDemoTransfer();
};
qrBank.addEventListener('change', renderQr);
// Tạo mã QR: kiểm tra số tiền (tối thiểu 1.000 ₫) → đưa số tiền vào mã QR và thông tin chuyển khoản
qrForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (amountValue() < 1000) {
    $('#pv-qr-amount-field').classList.add('is-invalid');
    qrAmount.focus();
    return;
  }
  ctx.qrAmount = amountValue();
  renderQr();
  showToast('Đã tạo mã QR. Quét mã hoặc chuyển khoản theo thông tin bên cạnh.');
  startDemoTransfer();
});
// Tải mã QR: lưu hình SVG của mã đang hiện
const downloadQr = () => {
  const blob = new Blob([$('#pv-qr-image').innerHTML], { type: 'image/svg+xml' });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `ma-qr-${ctx.memo}.svg` });
  link.click();
  URL.revokeObjectURL(link.href);
};
qrDialog.addEventListener('close', stopDemoTransfer);
qrDialog.addEventListener('click', async (event) => {
  // Đóng (NL03): bấm × hoặc nền mờ ngoài popup — không lưu dữ liệu
  if (event.target === qrDialog || event.target.closest('[data-qr-close]')) { qrDialog.close(); return; }
  const quick = event.target.closest('[data-qr-quick]');
  if (quick) { qrAmount.value = Number(quick.dataset.qrQuick).toLocaleString('vi-VN'); qrAmount.dispatchEvent(new Event('input')); return; }
  if (event.target.closest('[data-qr-download]')) { downloadQr(); return; }
  const copyBtn = event.target.closest('[data-qr-copy]');
  if (!copyBtn) return;
  const kind = copyBtn.dataset.qrCopy;
  const text = $(`#pv-qr-${kind}`).textContent;
  const done = { account: 'Đã sao chép số tài khoản.', holder: 'Đã sao chép tên chủ tài khoản.', memo: 'Đã sao chép nội dung chuyển khoản. Vui lòng giữ nguyên nội dung này khi chuyển khoản.' }[kind];
  if (await copyText(text)) showToast(done);
  else showToast(`Không thể sao chép tự động. Vui lòng sao chép: ${text}`, 'error');
});

// ==================== SECTION: POPUP CẢM ƠN QUYÊN GÓP (SRS 3.4, bước 13–15, NL09–NL12) ====================
// Minh họa ngân hàng báo giao dịch: sau DEMO_TRANSFER_MS kể từ lúc mở popup / bấm Tạo mã QR, coi như có giao dịch khớp mã ủng hộ (số tiền = số đã nhập, chưa nhập thì 200.000đ).
// Khi triển khai: thay bằng sự kiện từ hệ thống đối soát (bước 12–13), chỉ khớp đúng mã ủng hộ của popup đang mở (NL12). Gọi tay để thử: window.pvDemoDonate()
const DEMO_TRANSFER_MS = 12000;
let demoTimer = 0;
// Giao dịch minh họa: người chuyển (tên chủ tài khoản từ ngân hàng) · tên hiển thị / ẩn danh · email nhận biên lai lấy từ ô Email/SĐT nếu là email
const demoTransfer = (payer) => {
  const contact = qrContact.value.trim();
  return {
    code: ctx.memo,
    amount: amountValue() || 200000,
    payer,
    display: qrDisplay.value.trim(),
    anonymous: qrAnon.checked,
    time: Date.now(),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : '',
  };
};
const startDemoTransfer = () => {
  stopDemoTransfer();
  demoTimer = setTimeout(() => receiveTransfer(demoTransfer(DONOR_NAMES[Math.floor(Math.random() * DONOR_NAMES.length)])), DEMO_TRANSFER_MS);
};
function stopDemoTransfer() { clearTimeout(demoTimer); }
window.pvDemoDonate = () => { stopDemoTransfer(); if (qrDialog.open) receiveTransfer(demoTransfer(DONOR_NAMES[0])); };

// Bước 13: lưu giao dịch → cập nhật Đã đạt được, %, Lượt ủng hộ (+1), Danh sách ủng hộ, Top 5
const recordTransfer = (tx) => {
  const { p, d } = ctx;
  p.raised += tx.amount;
  d.donors += 1;
  // Danh sách ủng hộ: ẩn danh → "Người ủng hộ ẩn danh" · có tên hiển thị → tên đó · không thì tên chủ tài khoản chuyển
  ctx.donations.unshift({ name: tx.anonymous ? 'Người ủng hộ ẩn danh' : (tx.display || tx.payer), kind: tx.anonymous ? 'heart' : 'user', time: tx.time, amount: tx.amount });
  const pct = Math.round((p.raised / p.goal) * 10000) / 100;
  $('.pv-fund-raised p b').textContent = `${vnd(p.raised)} VNĐ`;
  $('.pv-fund-raised > b').textContent = `${nf.format(pct)}%`;
  const bar = $('.pv-fund .pf-pv-bar');
  bar.setAttribute('aria-valuenow', Math.min(pct, 100));
  bar.setAttribute('aria-valuetext', `Đã đạt ${nf.format(pct)}% mục tiêu`);
  bar.firstElementChild.style.width = `${Math.min(pct, 100)}%`;
  $('.pv-fund-count b').textContent = vnd(d.donors);
  $('#pf-pv-tab-donors').textContent = `Danh sách ủng hộ (${vnd(d.donors)})`;
  const top = $('#pf-pv-panel-top');
  if (top) top.innerHTML = top5([...ctx.donations].sort((a, b) => b.amount - a.amount).slice(0, 5));
  renderDonors(1);
};
// Bước 14: popup QR còn mở → đóng QR, hiện popup cảm ơn (14a) · đã đóng → không hiện (14b, NL09b)
// NL09a: đang ở tab/ứng dụng khác → chờ người dùng quay lại trang rồi mới hiện · NL10: mỗi giao dịch chỉ hiện popup cảm ơn 1 lần
let pendingThanks = null;
const thanked = new Set();
const receiveTransfer = (tx) => {
  recordTransfer(tx);
  if (!qrDialog.open || tx.code !== ctx.memo) return;
  if (document.hidden) { pendingThanks = tx; return; }
  showThanks(tx);
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !pendingThanks) return;
  const tx = pendingThanks;
  pendingThanks = null;
  if (qrDialog.open && tx.code === ctx.memo) showThanks(tx);
});
// Email che bớt (SRS 3.4 #8): giữ 2 ký tự đầu và 3 ký tự cuối trước "@"
const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  return user.length <= 5 ? `${user.slice(0, 2)}***@${domain}` : `${user.slice(0, 2)}***${user.slice(-3)}@${domain}`;
};
const thanksDialog = $('#pv-thanks');
let thanksTx = null;
const thanksTime = (ms) => { const at = new Date(ms); return `${pad2(at.getHours())}:${pad2(at.getMinutes())}, ${pad2(at.getDate())}/${pad2(at.getMonth() + 1)}/${at.getFullYear()}`; };
const showThanks = (tx) => {
  if (thanked.has(tx.code)) return;
  thanked.add(tx.code);
  thanksTx = tx;
  qrDialog.close();
  // Ảnh thiệp cảm ơn = ảnh banner chính của chương trình (banner riêng nếu có, không thì ảnh chương trình)
  $('#pv-thanks-photo').src = ctx.p.banner ? `${BANNER_IMG}${ctx.p.banner}` : `${IMG}${ctx.p.img}`;
  $('#pv-thanks-program').textContent = ctx.p.title;
  $('#pv-thanks-program').title = ctx.p.title; // tên dài bị cắt "…" trên 1 dòng → rê chuột xem đủ
  $('#pv-thanks-amount').textContent = `${vnd(tx.amount)}đ`;
  $('#pv-thanks-payer').textContent = tx.payer;
  $('#pv-thanks-code').textContent = tx.code;
  $('#pv-thanks-mail').hidden = !tx.email;
  if (tx.email) $('#pv-thanks-email').textContent = maskEmail(tx.email);
  thanksDialog.showModal();
  // Tên chương trình luôn 1 dòng: tên dài thì thu nhỏ cỡ chữ cho vừa (tối thiểu 10px), vẫn không vừa mới cắt "…"
  const programEl = $('#pv-thanks-program');
  programEl.style.fontSize = '';
  for (let size = parseFloat(getComputedStyle(programEl).fontSize); programEl.scrollWidth > programEl.clientWidth && size > 10; size -= 0.5) programEl.style.fontSize = `${size - 0.5}px`;
};
// Tải biên lai (SRS 3.4 #9): minh họa — mở trang biên lai và hộp thoại In để lưu PDF; khi triển khai tải tệp PDF theo SRS Email thông báo hệ thống, mục 3.2
const downloadReceipt = () => {
  const tx = thanksTx;
  const win = window.open('', '_blank', 'width=640,height=760');
  if (!win) { showToast('Trình duyệt đã chặn cửa sổ biên lai. Vui lòng cho phép cửa sổ bật lên rồi thử lại.', 'warning'); return; }
  const row = (label, value) => `<tr><th>${label}</th><td>${escapeHtml(value)}</td></tr>`;
  win.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Biên lai ủng hộ ${escapeHtml(tx.code)}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#24272c}h1{margin:0 0 4px;font-size:22px;color:#b91c2b}p{margin:0 0 24px;color:#687078}table{width:100%;border-collapse:collapse}th,td{padding:10px 0;border-bottom:1px solid #e6e7e8;font-size:14px;text-align:left}th{width:40%;font-weight:400;color:#687078}td{font-weight:700}</style></head>
<body><h1>BIÊN LAI ỦNG HỘ</h1><p>Hội Chữ thập đỏ Việt Nam</p><table>${row('Chương trình', ctx.p.title)}${row('Mã chương trình', ctx.p.code)}${row('Mã ủng hộ', tx.code)}${row('Người chuyển khoản', tx.payer)}${row('Số tiền', `${vnd(tx.amount)} ₫`)}${row('Thời gian ghi nhận', thanksTime(tx.time))}</table></body></html>`);
  win.document.close();
  win.focus();
  win.print();
};
thanksDialog.addEventListener('click', async (event) => {
  // NL10: bấm × hoặc nền mờ → đóng, quay về chi tiết với số liệu đã cập nhật
  if (event.target === thanksDialog || event.target.closest('[data-thanks-close]')) { thanksDialog.close(); return; }
  if (event.target.closest('[data-thanks-copy]')) {
    if (await copyText(thanksTx.code)) showToast('Đã sao chép mã ủng hộ.');
    else showToast(`Không thể sao chép tự động. Vui lòng sao chép: ${thanksTx.code}`, 'error');
    return;
  }
  if (event.target.closest('[data-thanks-receipt]')) { downloadReceipt(); return; }
  if (event.target.closest('[data-pv-share]')) copyUrl();
});

// ---------- Ô ngày dd/mm/yyyy (như hồ sơ): ô chữ luôn hiện ngày/tháng/năm; nút lịch mở bộ chọn ngày gốc (ẩn) giữ giá trị yyyy-mm-dd ----------
const maskVi = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
};
const viToIso = (vi) => {
  const m = vi.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? '' : iso;
};

// ---------- Kê khai khoản chi: rê chuột vào đoạn cung / dòng chú thích → tooltip % theo con trỏ, đoạn tương ứng nổi bật ----------
const gaugeTip = (event) => {
  const part = event.target.closest('[data-gauge-tip]');
  const gauge = event.target.closest('.pv-gauge');
  // Con trỏ rời biểu đồ: tắt tooltip đang hiện
  if (!gauge) { body.querySelectorAll('.pv-gauge.is-hovering').forEach((g) => gaugeTip({ target: g })); return; }
  const tip = gauge.querySelector('.pv-gauge-tip');
  gauge.querySelectorAll('[data-gauge-part]').forEach((el) => el.classList.toggle('is-active', !!part && el.dataset.gaugePart === part.dataset.gaugePart));
  gauge.classList.toggle('is-hovering', !!part);
  if (!part) { tip.hidden = true; return; }
  const [label, value] = part.dataset.gaugeTip.split('|');
  tip.firstElementChild.textContent = label;
  tip.lastElementChild.textContent = value;
  tip.hidden = false;
  const chart = gauge.querySelector('.pv-gauge-chart').getBoundingClientRect();
  // Trên cung: theo con trỏ · trên dòng chú thích: đặt giữa phía trên biểu đồ
  const onArc = part.closest('svg');
  tip.style.left = `${onArc ? event.clientX - chart.left : chart.width / 2}px`;
  tip.style.top = `${onArc ? event.clientY - chart.top : 0}px`;
};
body.addEventListener('pointermove', gaugeTip);
body.addEventListener('pointerleave', () => body.querySelectorAll('.pv-gauge').forEach((g) => gaugeTip({ target: g })));

// ---------- Sự kiện trong nội dung: ảnh · tab · Xem thêm · bình luận · Các chiến dịch khác · danh sách ủng hộ · quyên góp · chia sẻ · sao kê ----------
body.addEventListener('click', (event) => {
  const photoBtn = event.target.closest('[data-pv-photo]');
  if (photoBtn) showPhoto(Number(photoBtn.dataset.pvPhoto));
  const stepBtn = event.target.closest('[data-pv-step]');
  if (stepBtn) showPhoto(ctx.photo + Number(stepBtn.dataset.pvStep));
  const tabBtn = event.target.closest('.pf-pv-tabs [role="tab"]');
  if (tabBtn) selectTab(tabBtn);
  // Khối Hoạt động (trích đoạn) · bấm tiêu đề bản tin: chuyển sang tab Hoạt động và cuộn tới khung tab
  if (event.target.closest('[data-pv-open-acts]')) {
    selectTab($('#pf-pv-tab-acts'));
    $('.pv-content').scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  }
  // Top 5 · Xem danh sách: chuyển sang tab Danh sách ủng hộ và cuộn tới khung tab
  if (event.target.closest('[data-pv-donor-list]')) {
    selectTab($('#pf-pv-tab-donors'));
    $('.pv-content').scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  }
  // Dải trượt Các chiến dịch khác: nút ‹ ›
  const carBtn = event.target.closest('[data-car]');
  if (carBtn) stepTrack(document.getElementById(carBtn.dataset.car), Number(carBtn.dataset.carStep));
  // Chấm dưới dải: cuộn tới vị trí của chấm
  const othersDot = event.target.closest('[data-others-dot]');
  if (othersDot) { const track = $('#pv-others'); track.scrollTo({ left: Number(othersDot.dataset.othersDot) * trackStep(track), behavior: reduced() ? 'auto' : 'smooth' }); }
  const moreBtn = event.target.closest('[data-pv-more]');
  if (moreBtn) {
    const open = moreBtn.getAttribute('aria-expanded') !== 'true';
    moreBtn.setAttribute('aria-expanded', String(open));
    $('#pf-pv-story-text').classList.toggle('is-collapsed', !open);
    moreBtn.querySelector('span').textContent = open ? 'Thu gọn' : 'Xem thêm';
  }
  // Bình luận: sắp xếp · gửi · Xem thêm · Thích (bấm lại để bỏ thích) · mở / đóng ô trả lời · gửi trả lời
  if (event.target.closest('[data-cm-sort]')) {
    ctx.sort = ctx.sort === 'relevant' ? 'newest' : 'relevant';
    renderComments();
  }
  if (event.target.closest('[data-cm-post]')) postComment();
  if (event.target.closest('[data-cm-more]')) { ctx.commentLimit += COMMENT_STEP; renderComments(); }
  // Tab Hoạt động · Xem thêm: mở thêm ACT_STEP bản tin, hết thì ẩn nút; nút ghi số bản tin còn lại
  const actMore = event.target.closest('[data-act-more]');
  if (actMore) {
    ctx.actLimit += ACT_STEP;
    const items = [...document.querySelectorAll('#pv-acts > li')];
    items.forEach((li, i) => { li.hidden = i >= ctx.actLimit; });
    const left = items.length - ctx.actLimit;
    actMore.hidden = left <= 0;
    actMore.firstChild.textContent = `Xem thêm hoạt động (${left})`;
  }
  const likeBtn = event.target.closest('[data-cm-like]');
  if (likeBtn) {
    const c = findComment(Number(likeBtn.dataset.cmLike));
    c.liked = !c.liked;
    c.likes += c.liked ? 1 : -1;
    renderComments();
    body.querySelector(`[data-cm-like="${c.id}"]`).focus();
  }
  const replyBtn = event.target.closest('[data-cm-reply]');
  if (replyBtn) {
    const cid = Number(replyBtn.dataset.cmReply);
    ctx.replyTo = ctx.replyTo === cid ? null : cid;
    ctx.replyDraft = '';
    renderComments();
    if (ctx.replyTo) $('#pv-reply-text').focus();
  }
  if (event.target.closest('[data-cm-cancel]')) { ctx.replyTo = null; ctx.replyDraft = ''; renderComments(); }
  const sendBtn = event.target.closest('[data-cm-send]');
  if (sendBtn) postReply(Number(sendBtn.dataset.cmSend));
  if (event.target.closest('[data-pv-donate]')) openQr();
  if (event.target.closest('[data-pv-share]')) copyUrl();
  if (event.target.closest('[data-pv-statement]')) exportStatement();
  const pageBtn = event.target.closest('[data-donor-page]');
  if (pageBtn && !pageBtn.disabled) {
    renderDonors(Number(pageBtn.dataset.donorPage));
    body.querySelector('.pf-pv-donors').scrollIntoView({ block: 'nearest' });
  }
  const advBtn = event.target.closest('[data-pv-adv]');
  if (advBtn) {
    const open = advBtn.getAttribute('aria-expanded') !== 'true';
    advBtn.setAttribute('aria-expanded', String(open));
    $('#pf-pv-donor-adv').hidden = !open;
  }
  if (event.target.closest('[data-pv-donor-reset]')) {
    body.querySelectorAll('#pf-pv-donor-adv select, #pf-pv-donor-adv input').forEach((el) => { el.value = ''; });
    renderDonors(1);
  }
  const dateBtn = event.target.closest('.pf-date-btn');
  if (dateBtn) {
    const box = dateBtn.closest('[data-vi-date]');
    try { box.querySelector('.pf-date-native').showPicker(); } catch (error) { box.querySelector('input[type="text"]').focus(); }
  }
});
body.addEventListener('keydown', (event) => {
  // Ô viết bình luận / trả lời: Enter gửi · Shift+Enter xuống dòng · Esc đóng ô trả lời
  const input = event.target.closest('[data-cm-input]');
  if (input && event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (input.dataset.cmInput === 'post') postComment();
    else postReply(ctx.replyTo);
    return;
  }
  if (input && input.dataset.cmInput === 'reply' && event.key === 'Escape') {
    const cid = ctx.replyTo;
    ctx.replyTo = null;
    ctx.replyDraft = '';
    renderComments();
    body.querySelector(`[data-cm-reply="${cid}"]`).focus();
  }
  // Thanh tab: ← → chuyển tab kề, Home / End về tab đầu / cuối
  const tabBtn = event.target.closest('.pf-pv-tabs [role="tab"]');
  if (!tabBtn || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...tabBtn.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(tabBtn);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  selectTab(tabs[next]);
  tabs[next].focus();
});
body.addEventListener('input', (event) => {
  if (event.target.matches('#pf-pv-donor-q')) renderDonors(1);
  if (event.target.matches('#pf-pv-donor-min, #pf-pv-donor-max')) { formatMoneyInput(event.target); renderDonors(1); }
  // Ô bình luận: tự giãn, hết lỗi khi đã nhập · ô trả lời: giữ bản nháp khi danh sách dựng lại (Thích, Xem thêm)
  if (event.target.matches('[data-cm-input]')) growBox(event.target);
  if (event.target.matches('#pv-cm-text') && event.target.value.trim()) $('#pv-cm-field').classList.remove('is-invalid');
  if (event.target.matches('#pv-reply-text')) {
    ctx.replyDraft = event.target.value;
    if (event.target.value.trim()) $('#pv-reply-field').classList.remove('is-invalid');
  }
  const box = event.target.closest('[data-vi-date]');
  if (box && event.target.type === 'text') {
    event.target.value = maskVi(event.target.value);
    const native = box.querySelector('.pf-date-native');
    const iso = viToIso(event.target.value);
    if (native.value !== iso) { native.value = iso; renderDonors(1); }
  }
});
body.addEventListener('change', (event) => {
  if (event.target.matches('.pf-date-native') && event.target.value) {
    event.target.closest('[data-vi-date]').querySelector('input[type="text"]').value = viDate(event.target.value);
  }
  if (event.target.matches('.pf-date-native')) renderDonors(1);
});

// ==================== KHỞI TẠO: chương trình theo ?id= · không còn hiển thị công khai / không tồn tại (bước 6a, NL04) thì báo TB06 và dẫn về danh sách ====================
const program = PROGRAMS.find((p) => p.id === new URLSearchParams(window.location.search).get('id'));
if (program) {
  root.hidden = false;
  renderProgram(program);
  // ---------- Cột phải dính khi cuộn (CSS: .pf-pv-split-side sticky, top = --side-top) ----------
  // top = header + 24px; cột cao hơn khung nhìn → top âm (khung nhìn − cao cột − 24px) để cuộn tới đáy cột rồi mới dính.
  // Tính lại khi đổi cỡ cửa sổ và khi cột đổi chiều cao (đổi tab Top 5 / Người đồng hành)
  const side = root.querySelector('.pf-pv-split-side');
  if (side) {
    const SIDE_GAP = 24;
    const setSideTop = () => {
      const headEl = document.querySelector('.header');
      const head = headEl ? headEl.offsetTop + headEl.offsetHeight : 0; // header nổi cách đỉnh → lấy mép dưới
      side.style.setProperty('--side-top', `${Math.min(head + SIDE_GAP, window.innerHeight - side.offsetHeight - SIDE_GAP)}px`);
    };
    setSideTop();
    addEventListener('resize', setSideTop);
    if (window.ResizeObserver) new ResizeObserver(setSideTop).observe(side);
  }
} else {
  root.hidden = false;
  root.innerHTML = `<div class="container pv-empty">
    <h1 class="pf-title">Không tìm thấy chương trình</h1>
    <p class="pf-lead">Chương trình hiện không còn tiếp nhận quyên góp.</p>
    <a class="button button-primary" href="chuong-trinh-thien-nguyen.html">Xem các chương trình</a>
  </div>`;
}
