// ==================== FOOTER: lượt truy cập (dùng chung mọi trang có footer) ====================
// Hai chỉ số ở thanh cuối footer:
//  · Lượt truy cập (đang trực tuyến): số phiên (session) hoặc kết nối còn hoạt động trong 15 phút gần nhất.
//    Người dùng đóng trình duyệt → phiên bị hủy, số tự giảm.
//  · Tổng số lượt: tổng lượt truy cập tích lũy vào website tính tới hiện tại.
// Cả hai phải do MÁY CHỦ đếm (web hiện là HTML tĩnh, trình duyệt không tự biết người khác đang truy cập).
// Khi có API: đặt window.VISIT_STATS_URL = '/api/visit-stats' trước file này; API trả về JSON { online: number, total: number }.
// Script gọi API khi tải trang và mỗi 60 giây (để số trực tuyến cập nhật). Chưa có API → hiện SỐ LIỆU MINH HỌA bên dưới.
(() => {
  const box = document.querySelector('.footer-stats');
  if (!box) return;
  const onlineEl = box.querySelector('[data-stat="online"]');
  const totalEl = box.querySelector('[data-stat="total"]');
  const format = (value) => Number(value).toLocaleString('vi-VN');
  const render = ({ online, total }) => {
    if (onlineEl && Number.isFinite(online)) onlineEl.textContent = format(online);
    if (totalEl && Number.isFinite(total)) totalEl.textContent = format(total);
  };

  // ---------- Có API: lấy số thật, làm mới mỗi 60 giây ----------
  const url = window.VISIT_STATS_URL;
  if (url) {
    const load = () => fetch(url, { credentials: 'same-origin', cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then(render)
      .catch(() => {}); // lỗi mạng: giữ số đang hiện
    load();
    setInterval(load, 60000);
    return;
  }

  // ---------- Chưa có API: số liệu minh họa ----------
  render({ online: 128, total: 1254380 });
})();
