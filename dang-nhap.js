// ==================== TRANG ĐĂNG NHẬP / ĐĂNG KÝ ====================
// Bản xem trước: kiểm tra dữ liệu nhập ở trình duyệt. Khi có hệ thống thật, gọi
// window.AccountSession.login() / register() (nếu được cung cấp) để xác thực ở máy chủ.

// ==================== DIALOG: thông báo xem trước ====================
const dialog = document.querySelector('.info-dialog');
const showDialog = (title, description) => {
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('.dialog-description').textContent = description;
  dialog.showModal();
};
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-panel]');
  if (!trigger) return;
  event.preventDefault();
  const title = trigger.dataset.panel;
  showDialog(title, `Đây là bản xem trước giao diện. Mục “${title}” sẽ được kết nối khi nội dung và chức năng chính thức được bổ sung.`);
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});

// ==================== SECTION: ĐĂNG NHẬP / ĐĂNG KÝ ====================
const loginForm = document.querySelector('#auth-login');
const registerForm = document.querySelector('#auth-register');
const authTabs = [...document.querySelectorAll('.auth-tabs [role="tab"]')];
const altLabel = document.querySelector('#auth-alt-label');
const switchText = document.querySelector('#auth-switch-text');
const switchLink = document.querySelector('#auth-switch-link');
const socialButtons = [...document.querySelectorAll('.auth-social [data-social]')];
const vneidButton = document.querySelector('.auth-vneid');
const authTitle = document.querySelector('#auth-title');
const authLead = document.querySelector('.auth-lead');

// ---------- Tab: Đăng nhập / Đăng ký (← → chuyển tab; đồng bộ #dang-ky; đổi tiêu đề, chữ thanh trên & nút mạng xã hội) ----------
const selectTab = (tab, { focus = false } = {}) => {
  authTabs.forEach((other) => {
    const selected = other === tab;
    other.setAttribute('aria-selected', String(selected));
    other.tabIndex = selected ? 0 : -1;
    document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
  });
  const isRegister = tab.id === 'auth-tab-register';
  const verb = isRegister ? 'Đăng ký' : 'Đăng nhập';
  authTitle.textContent = verb;
  authLead.textContent = isRegister
    ? 'Tạo tài khoản để cùng chung tay lan tỏa những điều tử tế.'
    : 'Để tiếp tục, vui lòng nhập thông tin tài khoản của bạn.';
  document.title = `${verb} | Hội Chữ thập đỏ Việt Nam`;
  altLabel.textContent = `hoặc ${verb.toLowerCase()} bằng`;
  socialButtons.forEach((label) => {
    label.textContent = `${verb} bằng`;
    label.closest('button').dataset.panel = label.parentElement.textContent;
  });
  vneidButton.hidden = isRegister;
  switchText.textContent = isRegister ? 'Bạn đã có tài khoản?' : 'Chưa có tài khoản?';
  switchLink.textContent = isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay';
  switchLink.href = isRegister ? '#dang-nhap' : '#dang-ky';
  history.replaceState(null, '', isRegister ? '#dang-ky' : location.pathname + location.search);
  if (focus) tab.focus();
};
authTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    selectTab(authTabs[(index + step + authTabs.length) % authTabs.length], { focus: true });
  });
});
switchLink.addEventListener('click', (event) => {
  event.preventDefault();
  selectTab(authTabs.find((tab) => tab.getAttribute('aria-selected') !== 'true'), { focus: true });
});
if (location.hash === '#dang-ky') selectTab(authTabs[1]);

// ---------- Mật khẩu: hiện / ẩn ----------
document.querySelectorAll('.auth-eye').forEach((button) => {
  const input = button.previousElementSibling;
  button.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    button.querySelector('use').setAttribute('href', show ? '#eye-off' : '#eye');
  });
});

// ---------- Mã xác minh: 5 ký tự dễ đọc (bỏ 0/O, 1/I), chữ xoay lệch + nét nhiễu; bấm ↻ để đổi ----------
// Chỉ chặn nhập tự động ở bản xem trước; hệ thống thật cần mã xác minh do máy chủ cấp.
const captchaCanvas = document.querySelector('#auth-captcha-canvas');
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let captchaCode = '';
const random = (min, max) => min + Math.random() * (max - min);
const drawCaptcha = () => {
  const context = captchaCanvas.getContext('2d');
  const { width, height } = captchaCanvas;
  captchaCode = Array.from({ length: 5 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  for (let i = 0; i < 4; i += 1) {
    context.strokeStyle = `rgba(36,39,44,${random(0.15, 0.35)})`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(random(0, width), random(0, height));
    context.bezierCurveTo(random(0, width), random(0, height), random(0, width), random(0, height), random(0, width), random(0, height));
    context.stroke();
  }
  const step = (width - 12) / captchaCode.length; // chia đều 5 ký tự theo bề ngang ảnh
  context.font = "700 20px 'Be Vietnam Pro', Arial, sans-serif";
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  [...captchaCode].forEach((char, i) => {
    context.save();
    context.translate(6 + step * (i + 0.5), height / 2 + random(-3, 3));
    context.rotate(random(-0.35, 0.35));
    context.fillStyle = i % 2 ? '#24272c' : '#b91c2b';
    context.fillText(char, 0, 0);
    context.restore();
  });
};
document.querySelector('#auth-captcha-refresh').addEventListener('click', () => {
  drawCaptcha();
  registerForm.elements.captcha.value = '';
  registerForm.elements.captcha.focus();
});
document.fonts.ready.then(drawCaptcha);

// ---------- Kiểm tra dữ liệu: đánh dấu ô lỗi, báo lỗi đầu tiên, đưa con trỏ về ô đó ----------
const markInvalid = (input, invalid) => {
  (input.closest('.field') || input.closest('.check')).classList.toggle('is-invalid', invalid);
  input.setAttribute('aria-invalid', String(invalid));
};
const validate = (form, rules) => {
  const error = form.querySelector('.auth-error');
  let message = '';
  let firstInvalid = null;
  const failed = new Set();
  rules.forEach(([input, check, text]) => {
    if (failed.has(input)) return; // một ô nhiều luật: dừng ở luật sai đầu tiên
    const invalid = !check(input);
    if (invalid) failed.add(input);
    markInvalid(input, invalid);
    if (invalid && !firstInvalid) { firstInvalid = input; message = text; }
  });
  error.textContent = message;
  error.hidden = !message;
  firstInvalid?.focus();
  return !firstInvalid;
};
const filled = (input) => input.value.trim() !== '';
const isPhone = (input) => /^(\+84|0)\d{9}$/.test(input.value.replace(/[\s.]/g, ''));
const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
[loginForm, registerForm].forEach((form) => {
  form.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid') === 'true') markInvalid(event.target, false);
  });
});

// ---------- Tài khoản minh họa: tài khoản demo + tài khoản đăng ký trên trình duyệt này ----------
// Demo: demo (hoặc tram.nguyen@gmail.com / 0912345678) · mật khẩu Demo@123
const DEMO_ACCOUNT = { name: 'Nguyễn Ngọc Trâm', ids: ['demo', 'tram.nguyen@gmail.com', '0912345678'], password: 'Demo@123' };
const ACCOUNTS_KEY = 'ctd-demo-accounts';
const normalizeId = (value) => value.trim().toLowerCase().replace(/[\s.]/g, '').replace(/^\+84/, '0');
const normalizeEmail = (value) => value.trim().toLowerCase();
const loadAccounts = () => {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []; } catch { return []; }
};
const saveAccount = (account) => {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...loadAccounts(), account])); } catch {}
};
const findAccount = (id) => [DEMO_ACCOUNT, ...loadAccounts()]
  .find((account) => account.ids.includes(normalizeId(id)) || account.ids.includes(normalizeEmail(id)));
const usesRealApi = (method) => typeof window.AccountSession?.[method] === 'function';

// ---------- Gửi: Đăng nhập ----------
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { username, password, remember } = loginForm.elements;
  const valid = validate(loginForm, [
    [username, filled, 'Vui lòng nhập tên đăng nhập, email hoặc số điện thoại.'],
    [password, filled, 'Vui lòng nhập mật khẩu.'],
  ]);
  if (!valid) return;
  try {
    if (usesRealApi('login')) await window.AccountSession.login({ username: username.value.trim(), password: password.value });
    else if (findAccount(username.value)?.password !== password.value) throw new Error('invalid');
    // Phiên minh họa: account-menu.js đọc khóa này để hiện avatar thay cho nút Đăng nhập.
    // Ghi nhớ đăng nhập → localStorage (giữ sau khi đóng trình duyệt); không chọn → sessionStorage (hết khi đóng tab)
    try { (remember.checked ? localStorage : sessionStorage).setItem('ctd-demo-session', '1'); } catch {}
    window.location.href = 'index.html';
  } catch {
    validate(loginForm, [[password, () => false, 'Tên đăng nhập hoặc mật khẩu không đúng.']]);
  }
});

// ---------- Gửi: Đăng ký → báo thành công, chuyển sang tab Đăng nhập với SĐT vừa đăng ký ----------
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { name, phone, email, password, confirm, agree, captcha } = registerForm.elements;
  const isNew = (input) => usesRealApi('register') || !findAccount(input.value);
  const valid = validate(registerForm, [
    [name, filled, 'Vui lòng nhập họ và tên.'],
    [phone, filled, 'Vui lòng nhập số điện thoại.'],
    [phone, isPhone, 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).'],
    [phone, isNew, 'Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.'],
    [email, filled, 'Vui lòng nhập email.'],
    [email, isEmail, 'Email chưa đúng định dạng (VD: nguyenvana@gmail.com).'],
    [email, isNew, 'Email này đã có tài khoản. Vui lòng đăng nhập.'],
    [password, (input) => input.value.length >= 8, 'Mật khẩu cần tối thiểu 8 ký tự.'],
    [confirm, (input) => filled(input) && input.value === password.value, 'Mật khẩu nhập lại không khớp.'],
    [agree, (input) => input.checked, 'Vui lòng đồng ý với Quy chế minh bạch & Điều khoản dịch vụ.'],
    [captcha, (input) => input.value.trim().toUpperCase() === captchaCode, 'Mã xác minh chưa đúng. Vui lòng nhập lại.'],
  ]);
  if (!valid) {
    if (captcha.getAttribute('aria-invalid') === 'true') { drawCaptcha(); captcha.value = ''; }
    return;
  }
  const account = { name: name.value.trim(), phone: normalizeId(phone.value), email: normalizeEmail(email.value), password: password.value };
  try {
    if (usesRealApi('register')) await window.AccountSession.register(account);
    else saveAccount({ name: account.name, ids: [account.phone, account.email], password: account.password });
  } catch {
    validate(registerForm, [[email, () => false, 'Không thể đăng ký với thông tin này. Vui lòng thử lại.']]);
    return;
  }
  loginForm.elements.username.value = account.phone;
  registerForm.reset();
  drawCaptcha();
  selectTab(authTabs[0]);
  showDialog('Đăng ký thành công', 'Tài khoản của bạn đã được tạo. Hãy đăng nhập bằng số điện thoại hoặc email vừa đăng ký.');
  dialog.addEventListener('close', () => loginForm.elements.password.focus(), { once: true });
});
