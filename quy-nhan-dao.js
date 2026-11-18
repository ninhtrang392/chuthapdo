// ==================== TRANG QUỸ NHÂN ĐẠO (GSAP) ====================
// Header, footer, hộp thoại xem trước dùng chung với các trang khác.
// Chuyển động: GSAP + ScrollTrigger (+ SplitText nếu tải được). Người dùng chọn giảm chuyển động → chỉ hiện nội dung tĩnh.
// DỮ LIỆU MINH HỌA: số tài khoản, mã QR ở khung ủng hộ (khi vận hành lấy VietQR do ngân hàng đối tác của Quỹ cấp) · chương trình · thẻ "Vừa ủng hộ".

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// ==================== HEADER: menu mobile ====================
const menuButton = $('.menu-toggle');
const navigation = $('.navigation');
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
const dialog = $('.info-dialog:not(.qnd-rule-dialog)');
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-panel]');
  if (!trigger) return;
  event.preventDefault();
  const title = trigger.dataset.panel;
  $('#dialog-title').textContent = title;
  $('.dialog-description').textContent =
    `Đây là bản xem trước giao diện. Mục “${title}” sẽ được kết nối khi nội dung và chức năng chính thức được bổ sung.`;
  dialog.showModal();
});
$$('.dialog-close, .dialog-done').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

// ==================== TOAST: thông báo ngắn (.pf-toast dùng chung, như trang chương trình) ====================
const toast = $('.pf-toast');
const TOAST_TIME = 2800;
const TOAST_GLYPH = { success: '<svg class="icon" aria-hidden="true"><use href="#check"/></svg>', error: '!' };
let toastTimer;
const hideToast = () => { clearTimeout(toastTimer); toast.hidden = true; };
const showToast = (message, type = 'success') => {
  toast.className = `pf-toast is-${type}`;
  $('.pf-toast-icon', toast).innerHTML = TOAST_GLYPH[type];
  $('.pf-toast-text', toast).textContent = message;
  toast.style.setProperty('--toast-time', `${TOAST_TIME}ms`);
  const ring = $('.pf-toast-ring circle', toast);
  ring.style.animation = 'none'; void ring.getBoundingClientRect(); ring.style.animation = '';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, TOAST_TIME);
};
$('.pf-toast-close', toast).addEventListener('click', hideToast);

// ==================== SECTION: CÙNG QUỸ VUN ĐẮP — khung ủng hộ: chỉ hiển thị thẻ VietQR + thông tin chuyển khoản (ngân hàng QF_BANK; số tiền nhập trên ứng dụng ngân hàng) ====================
// Minh họa: số tài khoản suy cố định theo ngân hàng; mã QR là hình minh họa (khi triển khai lấy VietQR do ngân hàng đối tác cung cấp)
const QF_BANKS = {
  BIDV: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
  VCB: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  CTG: 'Ngân hàng TMCP Công Thương Việt Nam (VietinBank)',
  TCB: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
};
const QF_HOLDER = 'QUY NHAN DAO VIET NAM';
const seededRandom = (text) => {
  let seed = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 233280, 7);
  return () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
};
const bankShort = (bank) => QF_BANKS[bank].match(/\((.+)\)/)[1];
const qfAccount = (bank) => { const rand = seededRandom(`QNDVN-${bank}`); return Array.from({ length: 13 }, () => Math.floor(rand() * 10)).join(''); };
// Hình mã QR minh họa: lưới 25 × 25 ô, 3 ô định vị ở góc, phần còn lại sinh cố định theo nội dung
const qrSvg = (text) => {
  const n = 25;
  const rand = seededRandom(text);
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 29 29" role="img" aria-label="Mã QR ủng hộ Quỹ (minh họa)"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/><path d="${cells.join('')}" fill="#24272C"/></svg>`;
};
// Nội dung CK = mã ủng hộ: QNDVN-3 chữ + 4 số, sinh mới mỗi lần tải trang
const qfMemo = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return `QNDVN-${Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
};
const copyText = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; } catch (error) {
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
const qf = { memo: qfMemo(), amount: 0 }; // amount = 0 → QR không kèm số tiền, người ủng hộ nhập trên ứng dụng ngân hàng
const qrBox = $('#qf-qr');
const QF_BANK = 'BIDV'; // ngân hàng thụ hưởng hiển thị trên thẻ QR (khóa trong QF_BANKS)
// Vẽ QR + thông tin chuyển khoản theo ngân hàng QF_BANK và mã ủng hộ
const renderQr = () => {
  const bank = QF_BANK;
  const account = qfAccount(bank);
  $('#qf-qr-account').textContent = account;
  $('#qf-qr-holder').textContent = QF_HOLDER;
  $('#qf-qr-bank-short').textContent = bankShort(bank);
  $('#qf-qr-bank-name').textContent = bankShort(bank);
  $('#qf-qr-memo').textContent = qf.memo;
  $('#qf-qr-image').innerHTML = qrSvg(`${bank}|${account}|${qf.amount}|${qf.memo}`);
};
renderQr();
// Tải mã QR · sao chép thông tin chuyển khoản
qrBox.addEventListener('click', async (event) => {
  if (event.target.closest('[data-qr-download]')) {
    const blob = new Blob([$('#qf-qr-image').innerHTML], { type: 'image/svg+xml' });
    const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `ma-qr-${qf.memo}.svg` });
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }
  const copyBtn = event.target.closest('[data-qr-copy]');
  if (!copyBtn) return;
  const kind = copyBtn.dataset.qrCopy;
  const text = $(`#qf-qr-${kind}`).textContent;
  const done = { account: 'Đã sao chép số tài khoản.', holder: 'Đã sao chép tên chủ tài khoản.', memo: 'Đã sao chép nội dung chuyển khoản. Vui lòng giữ nguyên nội dung này khi chuyển khoản.' }[kind];
  if (await copyText(text)) showToast(done);
  else showToast(`Không thể sao chép tự động. Vui lòng sao chép: ${text}`, 'error');
});

// ==================== SECTION: MINH BẠCH & TRÁCH NHIỆM — tab tài liệu (Hồ sơ & quy chế · Quy chế vận hành · Khoản ủng hộ) ====================
const docTabs = $$('[data-doc-tab]');
docTabs.forEach((tab) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault();
    docTabs.forEach((other) => other.toggleAttribute('aria-current', other === tab));
    tab.setAttribute('aria-current', 'page');
    $$('[data-doc-panel]').forEach((panel) => { panel.hidden = panel.dataset.docPanel !== tab.dataset.docTab; });
  });
});

// ---------- Tab Khoản ủng hộ: danh sách ủng hộ vào Quỹ chung (không gồm khoản ủng hộ chương trình) — tìm theo chữ (tài khoản · lời nhắn) · 10 dòng/trang, phân trang rút gọn “…” (kiểu nút .pf-page-btn như trang chi tiết chương trình) ----------
// DỮ LIỆU MINH HỌA: 57 khoản ủng hộ sinh từ mẫu, mới nhất trước; tên hiển thị đầy đủ, lời nhắn in nghiêng dưới tên. Khi triển khai lấy từ hệ thống giao dịch đã đối soát.
const DONORS_PER_PAGE = 10;
const QF_DONORS = (() => {
  const names = ['Nguyễn Văn An', 'Công ty TNHH Minh Phát', 'Người ủng hộ ẩn danh', 'Trần Thị Bình', 'Nhóm Thiện Nguyện Xanh', 'Lê Hoàng Nam', 'Phạm Thu Cúc', 'Tập thể cán bộ Trường THCS Đoàn Kết', 'Vũ Minh Quân', 'Đặng Thu Hà', 'Hoàng Minh Khoa', 'Bùi Thanh Lan'];
  const amounts = [2000000, 5000000, 500000, 200000, 10000000, 1000000, 300000, 1500000, 50000000, 100000, 3000000, 700000];
  const notes = ['Lan tỏa yêu thương', 'Mong mọi người sớm vượt qua khó khăn, bình an trở lại sau cơn bão', '', 'Ủng hộ các em nhỏ vùng cao', 'Ủng hộ đồng bào vùng lũ', 'Cùng nhau vượt qua thiên tai', '', 'Gửi chút tấm lòng', 'Đồng hành cùng Hội Chữ thập đỏ Việt Nam', 'Cố lên bà con nhé!', '', 'Chúc mọi người bình an'];
  const start = new Date(2026, 10, 18, 9, 45);
  return Array.from({ length: 57 }, (_, i) => ({
    name: names[i % names.length],
    amount: amounts[(i * 7) % amounts.length],
    note: notes[(i * 5) % notes.length],
    time: new Date(start.getTime() - (i * 110 + (i % 3) * 17) * 60000), // lùi dần → luôn mới nhất trước
  }));
})();
const donorForm = $('[data-qf-donor-form]');
const donorRows = $('[data-qf-donor-rows]');
const donorFoot = $('[data-qf-donor-foot]');
if (donorForm && donorRows && donorFoot) {
  const escHtml = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const pad = (n) => String(n).padStart(2, '0');
  const viDateTime = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const arrow = '<svg class="icon" aria-hidden="true"><use href="#chevron-right"/></svg>';
  const pagerHtml = (current, pages) => {
    const numbers = [];
    for (let i = 1; i <= pages; i += 1) {
      if (i === 1 || i === pages || Math.abs(i - current) <= 1) numbers.push(i);
      else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
    }
    return `<div class="pf-pager"><div class="pf-pages">
      <button class="pf-page-btn is-chev is-prev" type="button" data-qf-donor-page="${current - 1}" ${current === 1 ? 'disabled' : ''} aria-label="Trang trước">${arrow}</button>
      ${numbers.map((n) => (n === '…' ? '<span aria-hidden="true">…</span>'
        : `<button class="pf-page-btn" type="button" data-qf-donor-page="${n}" ${n === current ? 'aria-current="page"' : ''} aria-label="Trang ${n}">${n}</button>`)).join('')}
      <button class="pf-page-btn is-chev" type="button" data-qf-donor-page="${current + 1}" ${current === pages ? 'disabled' : ''} aria-label="Trang sau">${arrow}</button>
    </div></div>`;
  };
  const qInput = $('[data-qf-donor-q]', donorForm);
  let list = QF_DONORS;
  const renderDonors = (page) => {
    const pages = Math.max(1, Math.ceil(list.length / DONORS_PER_PAGE));
    const current = Math.min(Math.max(1, page), pages);
    const first = (current - 1) * DONORS_PER_PAGE;
    const slice = list.slice(first, first + DONORS_PER_PAGE);
    donorRows.innerHTML = slice.length ? slice.map((x, i) => `<tr>
      <td class="pf-col-index">${first + i + 1}</td>
      <td><span class="pf-pv-donor${x.note ? ' has-note' : ''}"><b>${escHtml(x.name)}</b>${x.note ? `<span class="pv-donor-note is-quote" title="${escHtml(x.note)}">“${escHtml(x.note)}”</span>` : ''}</span></td>
      <td><b class="pf-pv-amount">${x.amount.toLocaleString('vi-VN')} đ</b></td>
      <td>${viDateTime(x.time)}</td>
    </tr>`).join('') : '<tr><td class="qf-donor-empty" colspan="4">Không tìm thấy khoản quyên góp phù hợp.</td></tr>';
    donorFoot.innerHTML = `<p class="pf-muted" aria-live="polite">${list.length ? `Hiển thị ${first + 1} – ${first + slice.length}/${list.length}` : 'Hiển thị 0/0'}</p>${list.length > DONORS_PER_PAGE ? pagerHtml(current, pages) : ''}`;
  };
  // Lọc: chữ khớp tài khoản · lời nhắn (không dấu) → về trang 1
  const applyFilter = () => {
    const q = normalize(qInput.value.trim());
    list = QF_DONORS.filter((x) => !q || normalize(`${x.name} ${x.note}`).includes(q));
    renderDonors(1);
  };
  donorForm.addEventListener('submit', (event) => { event.preventDefault(); applyFilter(); });
  qInput.addEventListener('input', applyFilter);
  donorFoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-qf-donor-page]');
    if (!button || button.disabled) return;
    renderDonors(Number(button.dataset.qfDonorPage));
  });
  renderDonors(1);
}

// ==================== SECTION: TIN TỨC — tab 5 chuyên mục: bấm tab → đổi bài trong .news-grid (bố cục tin tức trang chủ) ====================
// DỮ LIỆU MINH HỌA: khi triển khai lấy từ CMS theo chuyên mục. Mỗi chuyên mục 4 bài: bài đầu = bài nổi bật, 3 bài sau = danh sách bên phải.
// Tab "quy" (Tin hoạt động của Quỹ) viết sẵn trong HTML → lưu lại khi tải trang, không lặp dữ liệu ở đây.
const QF_NEWS = {
  'nhan-dao': [
    { img: 'Emages/ảnh minh họa/Làng nủ 3.jpg', alt: 'Người dân vùng sạt lở nhận đồ dùng thiết yếu', date: '2026-11-03', title: 'Cùng bà con Làng Nủ dựng lại mái nhà sau sạt lở', desc: 'Tình nguyện viên và cán bộ Hội ở lại nhiều tuần, dọn bùn, dựng vách, trao nhu yếu phẩm cho từng hộ dân bị ảnh hưởng.' },
    { img: 'Emages/ảnh minh họa/Chi-Hanh-hien-mau-tai-Sun-Ha-Nam-thang-9-nam-2026.jpg', alt: 'Người dân tham gia ngày hội hiến máu tình nguyện', date: '2026-09-28', title: 'Ngày hội hiến máu tình nguyện thu hút hàng nghìn người tham gia', desc: 'Mỗi đơn vị máu góp phần cứu sống người bệnh; ngày hội còn có khu tư vấn sức khỏe và khám sàng lọc miễn phí.' },
    { img: 'Emages/Chương trình/Khoảnh Khắc Trao Gửi Yêu Thương.png', alt: 'Tình nguyện viên trao quà tận tay cụ bà và cháu nhỏ tại nhà', date: '2026-09-18', title: 'Trao quà, nhu yếu phẩm tận nhà cho các hộ neo đơn, khó khăn', desc: 'Mỗi suất quà gồm gạo, nhu yếu phẩm và tiền mặt, được cán bộ Hội trao tận tay từng gia đình.' },
    { img: 'Emages/nguoi-gan-nhat/so-cap-cuu.webp', alt: 'Tình nguyện viên thực hành sơ cấp cứu', date: '2026-09-10', title: 'Tập huấn sơ cấp cứu cho tình nguyện viên trẻ tại cộng đồng', desc: 'Các lớp thực hành giúp người trẻ sẵn sàng giúp đúng lúc, đúng cách khi có tình huống khẩn cấp.' },
  ],
  'doi-tac': [
    { img: 'Emages/ảnh minh họa/3.-028ae9de1f.jpg', alt: 'Đại diện Hội Chữ thập đỏ và nhà tài trợ trao tặng biển hỗ trợ cho trường học', date: '2026-10-28', title: 'Doanh nghiệp đồng hành trao tặng công trình cho điểm trường vùng cao', desc: 'Công trình giúp học sinh có thêm phòng học kiên cố, khu vệ sinh và nước sạch trước mùa đông.' },
    { img: 'Emages/ảnh minh họa/trao-qua-hoc-sinh.jpg', alt: 'Trao quà cho học sinh có hoàn cảnh khó khăn', date: '2026-10-15', title: 'Ký kết hợp tác hỗ trợ học bổng cho học sinh có hoàn cảnh khó khăn', desc: 'Chương trình kéo dài ba năm, ưu tiên học sinh mồ côi, học sinh vùng thiên tai và vùng đặc biệt khó khăn.' },
    { img: 'Emages/ảnh minh họa/01 1.jpg', alt: 'Cán bộ Chữ thập đỏ trao gạo cho người dân tại gian hàng Chợ nhân đạo', date: '2026-10-02', title: 'Chợ nhân đạo: các đối tác cùng góp gian hàng 0 đồng', desc: 'Gạo, nhu yếu phẩm và quần áo được các doanh nghiệp, tổ chức đóng góp để trao cho người dân khó khăn.' },
    { img: 'Emages/ảnh minh họa/bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', alt: 'Hoạt động nhân ái cùng cộng đồng', date: '2026-09-22', title: 'Cộng đồng người Việt ở nước ngoài chung tay hướng về vùng lũ', desc: 'Nguồn ủng hộ từ kiều bào được Quỹ tiếp nhận, phân bổ và công khai theo từng địa bàn.' },
  ],
  'cau-chuyen': [
    { img: 'Emages/ảnh minh họa/1358142_gen-h-235_1777566365.jpg', alt: 'Cán bộ Chữ thập đỏ trao quà cho người dân tại nhà', date: '2026-11-01', title: 'Cụ bà 80 tuổi đều đặn để dành lương hưu ủng hộ Quỹ mỗi tháng', desc: '“Ít thôi, nhưng góp lại thì thành nhiều, mà người khó khăn thì đâu có chờ được.”' },
    { img: 'Emages/ảnh minh họa/Làng nủ 2.webp', alt: 'Khu vực bị sạt lở sau mưa lũ', date: '2026-10-24', title: 'Ba tuần ở lại Làng Nủ của nhóm tình nguyện viên trẻ', desc: 'Họ ở lại dọn bùn, dựng vách cho tới khi mái nhà mới của bà con được lợp xong.' },
    { img: 'Emages/ảnh minh họa/nu-cuoi-be-gai-vung-cao.jpg', alt: 'Nụ cười bé gái vùng cao trên đường đến lớp', date: '2026-10-09', title: 'Thầy giáo cắm bản 15 năm và mùa đông ấm ở điểm trường', desc: 'Áo ấm, sách vở về tới điểm trường, các em vẫn đến lớp đều suốt mùa đông.' },
    { img: 'Emages/ảnh minh họa/2.-Chi-Nguyen-Thi-Hong-ngoai-cung-ben-trai-trao-qua-cho-2-em-mac-benh-tan-mau-bam-sinh-tai-xa-Thanh-Yen-tinh-Dien-Bien.jpg', alt: 'Trao quà cho hai em nhỏ mắc bệnh tan máu bẩm sinh', date: '2026-09-26', title: 'Đồng hành cùng các em mắc bệnh tan máu bẩm sinh ở Điện Biên', desc: 'Những chuyến thăm, những suất quà giúp các gia đình có thêm động lực theo đuổi việc điều trị lâu dài.' },
  ],
  'truyen-thong': [
    { img: 'Emages/Ảnh News/Trao đi thời gian.png', alt: 'Tình nguyện viên trao đi thời gian cho cộng đồng', date: '2026-11-04', title: 'Phóng sự ảnh: Một năm của những bàn tay nhân ái', desc: 'Những khoảnh khắc từ các chuyến cứu trợ, ngày hội hiến máu và lớp học sơ cấp cứu trên khắp cả nước.' },
    { img: 'Emages/ảnh minh họa/tre-em-vung-cao-nu-cuoi.jpg', alt: 'Nụ cười trẻ em vùng cao', date: '2026-10-18', title: 'Bộ ảnh “Nụ cười vùng cao” từ các điểm trường được hỗ trợ', desc: 'Tư liệu hình ảnh chính thức, được chia sẻ với sự đồng ý của nhà trường và gia đình các em.' },
    { img: 'Emages/Ảnh News/Hoạt động gần nơi sống.jpg', alt: 'Hoạt động tình nguyện gần nơi sinh sống', date: '2026-10-06', title: 'Video: Người Gần Nhất, sẵn sàng giúp đúng lúc, đúng cách', desc: 'Phim ngắn giới thiệu chương trình phổ cập kỹ năng sơ cấp cứu cho người trẻ.' },
    { img: 'Emages/Chương trình/72ad1836-57d6-41e3-aad3-6638cbc4c87e.png', alt: 'Ấn phẩm giới thiệu hoạt động nhân đạo', date: '2026-09-30', title: 'Ấn phẩm giới thiệu Quỹ Nhân đạo Việt Nam năm 2026', desc: 'Tổng quan sứ mệnh, lĩnh vực hoạt động, cơ chế quản trị và cách đồng hành cùng Quỹ.' },
  ],
};
const newsGrid = $('[data-news-grid]');
if (newsGrid) {
  const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const viDate = (iso) => iso.split('-').reverse().join('/');
  const article = (item, type) => `
    <article class="news-item ${type}">
      <div class="media media-photo"><img src="${esc(encodeURI(item.img))}" alt="${esc(item.alt)}" loading="lazy" /></div>
      <div class="news-body">
        <p class="news-meta"><time datetime="${item.date}">${viDate(item.date)}</time></p>
        <h3 class="news-title"><a class="stretched" href="#" data-panel="Bài viết">${esc(item.title)}</a></h3>
        <p class="news-desc">${esc(item.desc)}</p>
      </div>
    </article>`;
  const render = ([first, ...rest]) => `${article(first, 'news-feature')}<div class="news-list">${rest.map((item) => article(item, 'news-row')).join('')}</div>`;
  const cache = { quy: newsGrid.innerHTML };
  const newsTabs = $$('[data-news-tab]');
  newsTabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      const key = tab.dataset.newsTab;
      if (tab.getAttribute('aria-current') === 'page') return;
      newsTabs.forEach((other) => other.toggleAttribute('aria-current', other === tab));
      tab.setAttribute('aria-current', 'page');
      cache[key] ??= render(QF_NEWS[key]);
      newsGrid.classList.add('is-swapping');
      setTimeout(() => {
        newsGrid.innerHTML = cache[key];
        newsGrid.classList.remove('is-swapping');
      }, 200);
    });
  });
}

// ==================== SECTION: HƯỚNG DẪN ĐỒNG HÀNH — câu hỏi mở/đóng: mở 1 câu thì đóng các câu khác (như trang Người Gần Nhất) ====================
const faqItems = $$('.qf-faq-list details');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((other) => { if (other !== item) other.open = false; });
    window.ScrollTrigger?.refresh(); // chiều cao trang đổi → cập nhật mốc cuộn của GSAP
  });
});

// ==================== SECTION: KẾT NỐI NGUỒN LỰC — rê chuột / focus / bấm: mở rộng tấm ====================
const resItems = $$('.qf-res-item');
const activateRes = (item) => resItems.forEach((other) => other.classList.toggle('is-active', other === item));
resItems.forEach((item) => {
  item.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) activateRes(item); });
  item.addEventListener('focusin', () => activateRes(item));
  item.addEventListener('click', () => activateRes(item));
});

// ==================== SECTION: MINH BẠCH & TRÁCH NHIỆM — tab Quy chế vận hành: bấm "Xem chi tiết" → popup nội dung ====================
// Nội dung theo Điều lệ Quỹ Nhân đạo Việt Nam. Mỗi mục: mảng khối — khối 1 chuỗi = đoạn văn; khối nhiều chuỗi = danh sách a), b), c)…
const QND_RULES = {
  '01': {
    title: 'Tôn chỉ, mục đích',
    content: [
      ['1. Quỹ Nhân đạo Việt Nam (sau đây gọi tắt là Quỹ) là quỹ xã hội, quỹ từ thiện do Hội Chữ thập đỏ Việt Nam sáng lập, tổ chức và hoạt động không vì mục tiêu lợi nhuận nhằm huy động, tiếp nhận, quản lý và sử dụng hiệu quả các nguồn lực hợp pháp để hỗ trợ người có hoàn cảnh khó khăn, người dễ bị tổn thương và cộng đồng có nhu cầu trợ giúp nhân đạo; tham gia phòng ngừa, ứng phó và khắc phục hậu quả thiên tai, thảm họa, dịch bệnh, sự cố nghiêm trọng và các tình huống khẩn cấp; hỗ trợ chăm sóc sức khỏe, sinh kế và các hoạt động nhân đạo khác; góp phần thực hiện chính sách an sinh xã hội, phát huy truyền thống nhân ái, tương thân, tương ái của dân tộc Việt Nam.'],
      ['2. Quỹ là địa chỉ tin cậy để tổ chức, doanh nghiệp, cá nhân trong và ngoài nước tự nguyện đóng góp, đồng hành thực hiện các mục tiêu nhân đạo; kết nối nguồn lực xã hội với nhu cầu nhân đạo; phát huy vai trò, uy tín và mạng lưới của Hội Chữ thập đỏ Việt Nam. Quỹ được xây dựng trở thành công cụ tài chính nhân đạo chủ động, lâu dài, bền vững, minh bạch; có khả năng huy động, tiếp nhận, quản lý, kết nối, điều phối, bảo toàn và phát triển nguồn lực tài chính hợp pháp trong nước và quốc tế; hình thành nguồn dự phòng rủi ro và cơ chế giải ngân sớm để chủ động ứng phó trước và ngay sau thiên tai, thảm họa. Quỹ hoạt động theo định hướng của Nghị quyết Đại hội đại biểu toàn quốc Hội Chữ thập đỏ Việt Nam lần thứ XII, nhiệm kỳ 2026-2031: lấy người dân làm trung tâm, lấy cộng đồng làm nền tảng, lấy chuyển đổi số và đổi mới sáng tạo làm động lực, lấy kết nối nguồn lực xã hội làm phương thức chủ yếu; góp phần phát huy vai trò nòng cốt, cầu nối và điều phối của Hội Chữ thập đỏ Việt Nam trong công tác nhân đạo.'],
      ['3. Quỹ được hình thành từ tài sản do sáng lập viên đóng góp, tài sản được kế thừa từ Quỹ Hoạt động Chữ thập đỏ và tự tạo nguồn lực trên cơ sở vận động quyên góp, vận động tài trợ của tổ chức, cá nhân trong và ngoài nước, tổ chức quốc tế, tổ chức phi chính phủ nước ngoài, các nhà hảo tâm trong nước và nước ngoài; tiếp nhận tài sản tặng cho, di tặng, tài sản thừa kế; xây dựng, đề xuất dự án và phối hợp với các Hội Chữ thập đỏ, Trăng lưỡi liềm đỏ quốc tế và các quốc gia trong Phong trào Chữ thập đỏ và Trăng lưỡi liềm đỏ quốc tế theo quy định của pháp luật.'],
    ],
  },
  '02': {
    title: 'Nguyên tắc tổ chức, hoạt động, phạm vi hoạt động và địa vị pháp lý',
    content: [
      ['1. Quỹ tổ chức, hoạt động theo các nguyên tắc sau:'],
      [
        'a) Không vì mục tiêu lợi nhuận; không phân chia tài sản của Quỹ trong quá trình hoạt động;',
        'b) Tự nguyện, tự tạo vốn, tự trang trải kinh phí và tự chịu trách nhiệm trước pháp luật bằng tài sản của Quỹ;',
        'c) Công khai, minh bạch về thu, chi, tài chính, tài sản; bảo đảm trách nhiệm giải trình với nhà tài trợ, người thụ hưởng, cơ quan nhà nước có thẩm quyền và xã hội;',
        'd) Nhân đạo, vô tư, công bằng, không phân biệt đối xử; lấy con người và nhu cầu nhân đạo làm trung tâm; bảo đảm trợ giúp đúng đối tượng, đúng nhu cầu, kịp thời, hiệu quả;',
        'đ) Tuân thủ Hiến pháp, pháp luật và Điều lệ này; chịu sự quản lý nhà nước của Bộ Nội vụ và các bộ, ngành liên quan đến lĩnh vực hoạt động của Quỹ;',
        'e) Không thay thế trách nhiệm của Nhà nước và chức năng, nhiệm vụ của các cơ quan, tổ chức, các quỹ xã hội, quỹ từ thiện khác; hợp tác, kết nối trên cơ sở tự nguyện;',
        'g) Lấy chuyển đổi số và đổi mới sáng tạo làm động lực; số hóa, công khai, minh bạch các hoạt động vận động, tiếp nhận, quản lý và phân bổ nguồn lực; bảo đảm an toàn thông tin và bảo vệ dữ liệu cá nhân theo quy định của pháp luật.',
      ],
      ['2. Quỹ có phạm vi hoạt động toàn quốc. Trong trường hợp cần thiết, Quỹ tham gia hoạt động hỗ trợ nhân đạo quốc tế theo quyết định của cấp có thẩm quyền và quy định của pháp luật.'],
      ['3. Quỹ có tư cách pháp nhân, có con dấu, tài khoản riêng (bao gồm tài khoản ngoại tệ) mở tại ngân hàng theo quy định của pháp luật.'],
    ],
  },
  '03': {
    title: 'Sử dụng các khoản vận động, tài trợ có mục đích',
    content: [
      ['1. Các khoản vận động, quyên góp, tài trợ để hỗ trợ trực tiếp cho đối tượng, địa bàn hoặc đợt vận động cụ thể phải được chuyển, chi 100% cho đúng đối tượng, địa bàn, mục đích đã công bố ngay sau khi tiếp nhận và hoàn thành thủ tục theo quy định.'],
      ['2. Khoản tài trợ có mục đích phải được sử dụng đúng mục đích và thỏa thuận hợp pháp với nhà tài trợ; không được chuyển sang tích lũy, bảo toàn hoặc sử dụng cho mục đích khác, trừ trường hợp được nhà tài trợ đồng ý bằng văn bản hoặc không thể thực hiện mục đích ban đầu và được xử lý theo quy định của pháp luật.'],
      ['3. Việc vận động, tiếp nhận, phân phối và sử dụng các nguồn đóng góp tự nguyện hỗ trợ nhân dân khắc phục khó khăn do thiên tai, hỏa hoạn, sự cố nghiêm trọng, bệnh nhân mắc bệnh hiểm nghèo thực hiện theo quy định của pháp luật về lĩnh vực này; việc tiếp nhận, sử dụng viện trợ không hoàn lại của cơ quan, tổ chức, cá nhân nước ngoài thực hiện theo quy định của pháp luật về quản lý, sử dụng viện trợ.'],
    ],
  },
  '04': {
    title: 'Chi hoạt động quản lý Quỹ',
    content: [
      ['1. Chi hoạt động quản lý Quỹ gồm: tiền lương, tiền công, phụ cấp và các khoản đóng góp theo quy định; thuê trụ sở (nếu có); mua sắm, sửa chữa trang thiết bị; văn phòng phẩm, dịch vụ công cộng, thông tin liên lạc; hội họp, công tác phí; kiểm toán; phát triển nền tảng số và các khoản chi cần thiết khác cho bộ máy.'],
      ['2. Hội đồng quản lý Quỹ quyết định tỷ lệ chi cho hoạt động quản lý Quỹ nhưng không quá 10% tổng chi trong năm của Quỹ để tài trợ, hỗ trợ cho các chương trình, đề án theo Điều lệ này (không bao gồm các khoản: tài trợ bằng hiện vật; thực hiện nhiệm vụ do cơ quan nhà nước giao; tài trợ của Nhà nước để thực hiện dịch vụ công, đề tài nghiên cứu khoa học, chương trình mục tiêu, đề án do Nhà nước đặt hàng; các khoản tài trợ có số tiền, địa chỉ của người nhận). Quỹ phấn đấu duy trì tỷ lệ chi quản lý không quá 5%. Kinh phí quản lý chưa sử dụng hết trong năm được chuyển sang năm sau tiếp tục sử dụng.'],
      ['3. Tỷ lệ chi quản lý thực tế được công khai hằng năm cùng với báo cáo tài chính của Quỹ.'],
    ],
  },
  // ---------- Section VỀ QUỸ: link "Xem đầy đủ…" — tóm tắt 4 phần (khối { heading } = tiêu đề nhỏ) ----------
  'gioi-thieu': {
    kicker: 'Về Quỹ Nhân đạo Việt Nam',
    title: 'Giới thiệu, sứ mệnh, quản trị và văn bản pháp lý',
    content: [
      { heading: 'Giới thiệu' },
      ['Quỹ Nhân đạo Việt Nam là quỹ xã hội, quỹ từ thiện hoạt động không vì mục tiêu lợi nhuận, do Hội Chữ thập đỏ Việt Nam khởi xướng thành lập, kế thừa Quỹ Hoạt động Chữ thập đỏ. Quỹ có phạm vi hoạt động toàn quốc, có tư cách pháp nhân, con dấu và tài khoản riêng.'],
      { heading: 'Sứ mệnh' },
      ['Huy động, tiếp nhận, quản lý, kết nối và sử dụng hiệu quả nguồn lực xã hội để hỗ trợ người có hoàn cảnh khó khăn, người dễ bị tổn thương và cộng đồng cần trợ giúp nhân đạo; tham gia phòng ngừa, ứng phó và khắc phục hậu quả thiên tai, thảm họa, dịch bệnh và các tình huống khẩn cấp.'],
      ['Quỹ hướng tới trở thành công cụ tài chính nhân đạo chủ động, lâu dài, bền vững và minh bạch; là địa chỉ tin cậy để tổ chức, doanh nghiệp, cá nhân trong và ngoài nước đồng hành vì mục tiêu nhân đạo.'],
      { heading: 'Quản trị' },
      [
        'Không vì mục tiêu lợi nhuận; không phân chia tài sản của Quỹ trong quá trình hoạt động.',
        'Tài sản, tài chính của Quỹ được quản lý, hạch toán tách biệt với Hội Chữ thập đỏ Việt Nam và các tổ chức, cá nhân khác.',
        'Hội đồng quản lý Quỹ quyết định tỷ lệ chi quản lý, không quá 10% tổng chi trong năm; Quỹ phấn đấu giữ ở mức không quá 5%.',
        'Công khai thu, chi, tài chính, tài sản; bảo đảm trách nhiệm giải trình với nhà tài trợ, người thụ hưởng và xã hội.',
      ],
      { heading: 'Văn bản pháp lý' },
      ['Quỹ tổ chức, hoạt động theo Hiến pháp, pháp luật và Điều lệ Quỹ Nhân đạo Việt Nam; chịu sự quản lý nhà nước của Bộ Nội vụ và các bộ, ngành liên quan. Toàn văn Điều lệ, quy chế và các văn bản liên quan được công bố tại mục Minh bạch & trách nhiệm.'],
    ],
  },
};

const ruleDialog = $('.qnd-rule-dialog');
if (ruleDialog) {
  const kicker = $('[data-qnd-rule-kicker]', ruleDialog);
  const ruleTitle = $('#qnd-rule-title', ruleDialog);
  const body = $('[data-qnd-rule-body]', ruleDialog);
  const block = (lines) => {
    if (!Array.isArray(lines)) { // { heading } → tiêu đề nhỏ trong popup
      const h = document.createElement('h3');
      h.textContent = lines.heading;
      return h;
    }
    if (lines.length === 1) {
      const p = document.createElement('p');
      p.textContent = lines[0];
      return p;
    }
    const list = document.createElement('ul');
    list.className = 'qnd-rule-sub';
    lines.forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      list.append(li);
    });
    return list;
  };
  $$('[data-qnd-rule]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const rule = QND_RULES[trigger.dataset.qndRule];
      if (!rule) return;
      event.preventDefault();
      kicker.textContent = rule.kicker || 'Quy chế vận hành';
      ruleTitle.textContent = rule.title;
      body.replaceChildren(...rule.content.map(block));
      body.scrollTop = 0;
      ruleDialog.showModal();
    });
  });
  // Bấm ra nền mờ ngoài khung → đóng
  ruleDialog.addEventListener('click', (event) => { if (event.target === ruleDialog) ruleDialog.close(); });
}

// ==================== CHUYỂN ĐỘNG GSAP (ScrollTrigger · SplitText) ====================
(() => {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('qf-motion');
    return;
  }
  const hasSplit = Boolean(window.SplitText);
  gsap.registerPlugin(ScrollTrigger, ...(hasSplit ? [SplitText] : []));
  const fine = '(hover: hover) and (pointer: fine)';
  const motion = '(prefers-reduced-motion: no-preference)';
  const mm = gsap.matchMedia();

  mm.add(motion, () => {
    // ---------- HERO: chữ trượt lên · mô tả, nút hiện dần · 3 ảnh mở từ dưới lên lần lượt · thẻ nổi bật ra ----------
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .from('.qf-crumb', { y: 20, autoAlpha: 0, duration: 0.8 })
      .from('.qf-line-in', { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.15)
      .from('.qf-hero-lead, .qf-hero-actions > *', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.06 }, 0.5)
      .fromTo('.qf-shot', { clipPath: 'inset(100% 0% 0% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.4, ease: 'expo.inOut', stagger: 0.15 }, 0.2)
      .from('.qf-shot img', { scale: 1.3, duration: 2, stagger: 0.15 }, 0.2)
      .from('.qf-float', { y: 32, scale: 0.9, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)', stagger: 0.12 }, 1.2);
    gsap.set('.qf-hero', { visibility: 'visible' });
    root.classList.remove('qf-motion');

    // ---------- HERO: cuộn qua → ảnh, thẻ nổi trôi lên lệch tốc độ theo data-depth ----------
    $$('.qf-hero-visual [data-depth]').forEach((el) => {
      gsap.to(el, {
        y: () => -80 * Number(el.dataset.depth), ease: 'none',
        scrollTrigger: { trigger: '.qf-hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
    });

    // ---------- HERO: thẻ "Vừa ủng hộ" — các dòng minh họa chạy luân phiên ----------
    const liveItems = $$('.qf-live-list li');
    gsap.set(liveItems.slice(1), { yPercent: 100, autoAlpha: 0 });
    const live = gsap.timeline({ repeat: -1, delay: 2.4 });
    liveItems.forEach((item, i) => {
      const next = liveItems[(i + 1) % liveItems.length];
      live
        .to(item, { yPercent: -100, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, '+=2.2')
        .fromTo(next, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', immediateRender: false }, '<0.3');
    });

    // ---------- Tiêu đề section: từng dòng trượt lên trong mặt nạ (SplitText) ----------
    $$('[data-split]').forEach((heading) => {
      const trigger = { trigger: heading, start: 'top 85%', once: true };
      if (!hasSplit) {
        gsap.from(heading, { y: 48, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: trigger });
        return;
      }
      heading.classList.add('is-split');
      SplitText.create(heading, {
        type: 'lines', mask: 'lines', linesClass: 'qf-sl', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: trigger }),
      });
    });

    // ---------- Khối nội dung: trồi lên theo nhóm ----------
    gsap.set('[data-reveal]', { autoAlpha: 0, y: 48 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
    });

    // ---------- CÙNG QUỸ VUN ĐẮP: khung ủng hộ trượt lên · thẻ VietQR bật ra ----------
    gsap.timeline({ scrollTrigger: { trigger: '.qf-donate', start: 'top 80%', once: true } })
      .from('.qf-donate', { y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
      .from('.qf-donate .pv-qr-card', { y: 32, scale: 0.94, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.35)
      .from('.qf-donate .pv-qr-transfer, .qf-donate .pv-qr-warn', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, 0.5);

    // ---------- VỀ QUỸ: ảnh trong khung thu nhỏ dần theo cuộn ----------
    gsap.fromTo('.qf-about-photo img', { scale: 1.2 }, {
      scale: 1, ease: 'none', scrollTrigger: { trigger: '.qf-about-photo', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // ---------- TIN TỨC: ảnh bài nổi bật thu từ phóng to về khi cuộn qua ----------
    $$('.news-feature .media img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    return () => {
      root.classList.remove('qf-motion');
    };
  });

  // Giảm chuyển động: hiện hero ngay
  mm.add('(prefers-reduced-motion: reduce)', () => {
    root.classList.remove('qf-motion');
    gsap.set('.qf-hero', { visibility: 'visible' });
  });

  // ---------- HERO (chuột): cụm ảnh, thẻ nổi lệch nhẹ theo con trỏ — mức lệch theo data-depth (dùng xPercent/yPercent để không đè y của cuộn) ----------
  mm.add(`${fine} and ${motion}`, () => {
    const hero = $('.qf-hero');
    const layers = $$('.qf-hero-visual [data-depth]').map((el) => ({
      depth: Number(el.dataset.depth),
      x: gsap.quickTo(el, 'xPercent', { duration: 1, ease: 'power3' }),
      y: gsap.quickTo(el, 'yPercent', { duration: 1, ease: 'power3' }),
    }));
    const move = (event) => {
      const dx = event.clientX / innerWidth - 0.5;
      const dy = event.clientY / innerHeight - 0.5;
      layers.forEach((layer) => { layer.x(dx * -3 * layer.depth); layer.y(dy * -3 * layer.depth); });
    };
    const reset = () => layers.forEach((layer) => { layer.x(0); layer.y(0); });
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', reset);
    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
    };
  });

  // Phông chữ tải xong → đo lại vị trí ghim / chia dòng
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
