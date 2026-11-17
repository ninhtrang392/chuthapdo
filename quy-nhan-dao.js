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

// ==================== SECTION: CÙNG QUỸ VUN ĐẮP — khung ủng hộ (form · thẻ VietQR · thông tin chuyển khoản), cùng cách hoạt động với popup ủng hộ trang chương trình ====================
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
const qf = { memo: qfMemo(), amount: 0 };
const qrBox = $('#qf-qr');
const qrForm = $('#qf-qr-form');
const qrBank = $('#qf-qr-bank');
const qrAmount = $('#qf-qr-amount');
const qrAnon = $('#qf-qr-anon');
const qrDisplay = $('#qf-qr-display');
const amountValue = () => Number(qrAmount.value.replace(/\D/g, '')) || 0;
// Vẽ lại QR + thông tin chuyển khoản theo ngân hàng, số tiền đã tạo mã và mã ủng hộ
const renderQr = () => {
  const bank = qrBank.value;
  const account = qfAccount(bank);
  $('#qf-qr-account').textContent = account;
  $('#qf-qr-holder').textContent = QF_HOLDER;
  $('#qf-qr-bank-short').textContent = bankShort(bank);
  $('#qf-qr-bank-name').textContent = bankShort(bank);
  $('#qf-qr-amount-view').textContent = qf.amount ? `${qf.amount.toLocaleString('vi-VN')} VNĐ` : 'Nhập trên ứng dụng';
  $('#qf-qr-memo').textContent = qf.memo;
  $('#qf-qr-image').innerHTML = qrSvg(`${bank}|${account}|${qf.amount}|${qf.memo}`);
};
qrBank.replaceChildren(...Object.entries(QF_BANKS).map(([value, label]) => new Option(`${qfAccount(value)} - ${label}`, value)));
qrBank.addEventListener('change', renderQr);
renderQr();
// Số tiền: chỉ giữ chữ số, tự phân cách hàng nghìn bằng "."
qrAmount.addEventListener('input', () => {
  const digits = qrAmount.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12);
  qrAmount.value = digits ? Number(digits).toLocaleString('vi-VN') : '';
  if (amountValue() >= 1000) $('#qf-qr-amount-field').classList.remove('is-invalid');
});
// Ủng hộ ẩn danh: khóa ô Tên hiển thị
qrAnon.addEventListener('change', () => { qrDisplay.disabled = qrAnon.checked; });
// Tạo mã QR: kiểm tra số tiền (tối thiểu 1.000 ₫) → đưa số tiền vào mã QR và thông tin chuyển khoản
qrForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (amountValue() < 1000) {
    $('#qf-qr-amount-field').classList.add('is-invalid');
    qrAmount.focus();
    return;
  }
  qf.amount = amountValue();
  renderQr();
  showToast('Đã tạo mã QR. Quét mã hoặc chuyển khoản theo thông tin bên cạnh.');
});
// Chọn nhanh số tiền · tải mã QR · sao chép thông tin chuyển khoản
qrBox.addEventListener('click', async (event) => {
  const quick = event.target.closest('[data-qr-quick]');
  if (quick) { qrAmount.value = Number(quick.dataset.qrQuick).toLocaleString('vi-VN'); qrAmount.dispatchEvent(new Event('input')); return; }
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

// ==================== SECTION: MINH BẠCH & TRÁCH NHIỆM — tab tài liệu (Hồ sơ & quy chế · Quy chế vận hành · Báo cáo) ====================
const docTabs = $$('[data-doc-tab]');
docTabs.forEach((tab) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault();
    docTabs.forEach((other) => other.toggleAttribute('aria-current', other === tab));
    tab.setAttribute('aria-current', 'page');
    $$('[data-doc-panel]').forEach((panel) => { panel.hidden = panel.dataset.docPanel !== tab.dataset.docTab; });
  });
});

// ==================== SECTION: ĐỐI TÁC — nhân bản hàng logo để băng chạy vòng liền mạch (hoạt ảnh CSS .partner-track có sẵn) ====================
$$('[data-partner-clone]').forEach((clone) => {
  clone.innerHTML = clone.previousElementSibling.innerHTML;
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
};

const ruleDialog = $('.qnd-rule-dialog');
if (ruleDialog) {
  const kicker = $('[data-qnd-rule-kicker]', ruleDialog);
  const ruleTitle = $('#qnd-rule-title', ruleDialog);
  const body = $('[data-qnd-rule-body]', ruleDialog);
  const block = (lines) => {
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
      kicker.textContent = `Quy chế vận hành · ${trigger.dataset.qndRule}`;
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

    // ---------- VỀ QUỸ: tuyên bố sáng dần từng chữ theo cuộn ----------
    const statement = $('[data-words]');
    if (statement && hasSplit) {
      SplitText.create(statement, {
        type: 'words', autoSplit: true,
        onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.14 }, {
          opacity: 1, stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 50%', scrub: true },
        }),
      });
    }
    gsap.fromTo('.qf-about-photo img', { scale: 1.2 }, {
      scale: 1, ease: 'none', scrollTrigger: { trigger: '.qf-about-photo', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // ---------- TIN TỨC: ảnh bài nổi bật thu từ phóng to về khi cuộn qua ----------
    $$('.news-feature .media img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // ---------- HƯỚNG DẪN: đường dọc tô đỏ dần · chấm bước sáng lên khi qua giữa màn ----------
    gsap.fromTo('.qf-steps-line span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.qf-steps', start: 'top 60%', end: 'bottom 60%', scrub: true },
    });
    const steps = $$('.qf-step');
    steps.forEach((step) => {
      step.classList.remove('is-active');
      ScrollTrigger.create({
        trigger: step, start: 'top 60%',
        onEnter: () => step.classList.add('is-active'),
        onLeaveBack: () => step.classList.remove('is-active'),
      });
    });

    return () => {
      root.classList.remove('qf-motion');
      steps.forEach((step) => step.classList.add('is-active'));
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

  // ---------- LĨNH VỰC (≥ 1024px): ghim section, cuộn dọc → dải thẻ trượt ngang; ảnh trong thẻ trôi ngược ----------
  mm.add(`(min-width: 1024px) and ${motion}`, () => {
    const section = $('.qf-fields');
    const viewport = $('.qf-fields-viewport');
    const track = $('.qf-fields-track');
    section.classList.add('is-scrubbed');
    const distance = () => {
      const pad = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
      return Math.max(0, track.scrollWidth - (viewport.clientWidth - pad * 2));
    };
    const slide = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: section, pin: '.qf-fields-pin', start: 'top top', end: () => `+=${distance()}`,
        scrub: 1, invalidateOnRefresh: true,
      },
    });
    gsap.fromTo('.qf-fields-bar span', { scaleX: 0.17 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true },
    });
    $$('.qf-field-img img').forEach((img) => {
      gsap.fromTo(img, { xPercent: 6 }, {
        xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: img.closest('.qf-field'), containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
      });
    });
    return () => section.classList.remove('is-scrubbed');
  });

  // ---------- CÂU CHUYỆN (≥ 1024px): thẻ sau trượt lên đè, thẻ trước thu nhỏ & phủ đỏ nhạt (như chương Giải thưởng trang chủ) ----------
  mm.add(`(min-width: 1024px) and ${motion}`, () => {
    const cards = $$('.qf-story');
    cards.slice(0, -1).forEach((card, i) => {
      const next = cards[i + 1];
      // Kết thúc khi thẻ sau chạm vị trí ghim (top của sticky)
      const tl = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: () => `top ${parseInt(getComputedStyle(next).top, 10)}px`, scrub: true, invalidateOnRefresh: true } });
      tl.to(card, { scale: 0.92, ease: 'none' }, 0).to($('.award-card-shade', card), { opacity: 0.12, ease: 'none' }, 0);
    });
  });

  // ---------- HOẠT ĐỘNG (chuột): ảnh nổi đi theo con trỏ ----------
  mm.add(`${fine} and ${motion}`, () => {
    const list = $('.qf-acts-list');
    const media = $('.qf-cursor-media');
    const images = new Map();
    $$('.qf-act a', list).forEach((link) => {
      const img = Object.assign(document.createElement('img'), { src: link.dataset.img, alt: '', decoding: 'async' });
      media.append(img);
      images.set(link, img);
    });
    gsap.set(media, { xPercent: -50, yPercent: -50, scale: 0.6 });
    const xTo = gsap.quickTo(media, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(media, 'y', { duration: 0.6, ease: 'power3' });
    const rTo = gsap.quickTo(media, 'rotation', { duration: 0.8, ease: 'power3' });
    let lastX = 0;
    const move = (event) => {
      xTo(event.clientX + 40);
      yTo(event.clientY);
      rTo(gsap.utils.clamp(-10, 10, (event.clientX - lastX) * 0.6));
      lastX = event.clientX;
    };
    const show = (event) => {
      const link = event.target.closest('.qf-act a');
      if (!link) return;
      images.forEach((img, key) => img.classList.toggle('is-on', key === link));
      gsap.to(media, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
    };
    const hide = () => gsap.to(media, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: 'power3.in', overwrite: 'auto' });
    gsap.set(media, { x: innerWidth / 2, y: innerHeight / 2 });
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerover', show);
    list.addEventListener('pointerleave', hide);
    return () => {
      list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerover', show);
      list.removeEventListener('pointerleave', hide);
      media.replaceChildren();
    };
  });

  // Phông chữ tải xong → đo lại vị trí ghim / chia dòng
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
