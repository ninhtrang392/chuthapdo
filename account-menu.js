// ==================== HEADER: menu tài khoản khi bấm avatar (dùng chung mọi trang) ====================
// Dựng menu ngay sau .avatar-button: Tài khoản của tôi · Quản lý hồ sơ (ho-so.html) · Đăng xuất.
// Dữ liệu người dùng là minh họa — khi có đăng nhập thật, lấy từ phiên đăng nhập.
// Đăng xuất: gọi window.AccountSession.logout() nếu hệ thống cung cấp (xóa phiên ở máy chủ), rồi về trang chủ.
(() => {
  const button = document.querySelector('.avatar-button');
  if (!button) return;

  // ---------- Dữ liệu & icon (vẽ nét, không phụ thuộc sprite của từng trang) ----------
  const user = { name: 'Nguyễn Ngọc Trâm', email: 'tram.nguyen@gmail.com', initials: 'NT' };
  const svg = (paths) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
  const icons = {
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.1-3.6 4-5.5 7.5-5.5s6.4 1.9 7.5 5.5"/>'),
    profile: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    logout: svg('<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M16 17l5-5-5-5M21 12H9"/>'),
  };
  const onProfilePage = /ho-so\.html$/.test(window.location.pathname);

  // ---------- Dựng menu ----------
  const wrap = document.createElement('div');
  wrap.className = 'account-menu';
  button.replaceWith(wrap);
  wrap.append(button);
  const menu = document.createElement('div');
  menu.className = 'account-dropdown';
  menu.id = 'account-dropdown';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Tài khoản');
  menu.hidden = true;
  menu.innerHTML = `
    <div class="account-user" role="presentation">
      <span class="account-avatar" aria-hidden="true">${user.initials}</span>
      <span class="account-user-text"><strong>${user.name}</strong><small>${user.email}</small></span>
    </div>
    <a role="menuitem" href="#" data-panel="Tài khoản của tôi">${icons.user}Tài khoản của tôi</a>
    <a role="menuitem" href="ho-so.html#chuong-trinh"${onProfilePage ? ' aria-current="page"' : ''}>${icons.profile}Quản lý hồ sơ</a>
    <div class="account-sep" role="separator"></div>
    <a role="menuitem" href="index.html" class="account-logout" data-logout>${icons.logout}Đăng xuất</a>`;
  wrap.append(menu);
  button.removeAttribute('data-panel');
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-controls', menu.id);
  button.setAttribute('aria-expanded', 'false');

  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const isOpen = () => !menu.hidden;
  const setOpen = (open, { focus } = {}) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open && focus === 'first') items[0].focus();
    if (!open && focus === 'button') button.focus();
  };

  // ---------- Mở / đóng: bấm avatar, bấm ra ngoài, Escape, chọn mục ----------
  button.addEventListener('click', () => setOpen(!isOpen()));
  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true, { focus: 'first' }); }
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !wrap.contains(event.target)) setOpen(false);
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('[role="menuitem"]')) setOpen(false);
  });

  // ---------- Đăng xuất: xóa phiên (nếu có tích hợp) rồi về trang chủ ----------
  menu.querySelector('[data-logout]').addEventListener('click', async (event) => {
    event.preventDefault();
    try { await window.AccountSession?.logout?.(); } finally { window.location.href = 'index.html'; }
  });
  menu.addEventListener('keydown', (event) => {
    const index = items.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false, { focus: 'button' }); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length].focus(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length].focus(); }
    else if (event.key === 'Tab') setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { focus: 'button' });
  });
})();
