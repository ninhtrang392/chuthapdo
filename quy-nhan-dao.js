// ==================== TRANG QUỸ NHÂN ĐẠO ====================
// Header, footer, hộp thoại xem trước dùng chung với các trang khác; bảng quyên góp: DỮ LIỆU MINH HỌA (lọc ngay trên 10 dòng đang hiển thị).

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

// ==================== DANH SÁCH QUYÊN GÓP: tìm theo chữ + lọc chương trình (trên các dòng minh họa) ====================
const donorForm = document.querySelector('[data-qnd-donor-form]');
if (donorForm) {
  const rows = [...document.querySelectorAll('[data-qnd-rows] tr')];
  const count = document.querySelector('[data-qnd-count]');
  const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const apply = () => {
    const q = normalize(donorForm.querySelector('[data-qnd-q]').value.trim());
    const program = donorForm.querySelector('[data-qnd-program]').value;
    let shown = 0;
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const okText = !q || normalize(row.textContent).includes(q);
      const okProgram = !program || cells[2].textContent.trim() === program;
      row.hidden = !(okText && okProgram);
      if (!row.hidden) shown += 1;
    });
    count.textContent = q || program ? `Tìm thấy ${shown} khoản quyên góp phù hợp trên trang này` : 'Hiển thị 1 – 10/1.308';
  };
  donorForm.addEventListener('submit', (event) => { event.preventDefault(); apply(); });
  donorForm.querySelector('[data-qnd-program]').addEventListener('change', apply);
  donorForm.querySelector('[data-qnd-q]').addEventListener('input', apply);
}

// ---------- Ô bị cắt "…" (1 dòng): rê chuột hiện đủ nội dung ----------
document.querySelectorAll('.pf-table.is-donations td').forEach((cell) => {
  const text = cell.textContent.trim();
  if (text && text !== '-' && !cell.title) cell.title = text;
});
