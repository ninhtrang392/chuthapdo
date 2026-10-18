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
// The homepage is a standalone preview. Replace these panels with real destinations
// when the remaining pages, CMS data and donation flow are available.
const dialog = document.querySelector('.info-dialog');
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-panel]');
  if (!trigger) return;
  event.preventDefault();
  const title = trigger.dataset.panel;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('.dialog-description').textContent =
    `Đây là bản xem trước giao diện trang chủ. Mục “${title}” sẽ được kết nối khi nội dung và chức năng chính thức được bổ sung.`;
  dialog.showModal();
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==================== FLOW: cuộn mượt (ScrollSmoother nếu có, ngược lại cuộn gốc) ====================
let smoother = null; // created in the MOTION block, before any other ScrollTrigger
const headerOffset = () => document.querySelector('.header').offsetHeight;
const scrollToElement = (element) => {
  if (smoother) smoother.scrollTo(element, true, `top ${headerOffset()}px`);
  else element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
};
// Đến từ trang khác với #neo (vd. index.html#don-vi-dong-hanh): cuộn lại sau khi load,
// khi bố cục (ảnh, font) đã ổn định.
window.addEventListener('load', () => setTimeout(() => {
  const target = window.location.hash.length > 1 && document.querySelector(window.location.hash);
  if (target) scrollToElement(target);
}, 150));

// ==================== HERO: impact widget — đếm số ====================
const metricValues = document.querySelectorAll('.impact-card dd');
if (metricValues.length && !reduceMotion) {
  const countUp = (element) => {
    const target = Number(element.textContent.replace(/\D/g, ''));
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(target * eased).toLocaleString('vi-VN');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  metricValues.forEach((value) => observer.observe(value));
}

// ==================== SECTION 04: TOP GÂY QUỸ — tab Tổ chức / Cá nhân, kỳ xếp hạng, bảng top 10 ====================
// ---------- Dữ liệu: DỮ LIỆU MINH HỌA ----------
// Khi triển khai lấy từ API xếp hạng (chỉ số tiền đã xác nhận, người gây quỹ đồng ý công khai).
// Kỳ ngắn (tuần / tháng) giúp bảng biến động thường xuyên; nên cập nhật ít nhất hằng ngày.
// Mỗi dòng (theo hạng 1 → 11): [tên, địa bàn, số tiền (₫), số chiến dịch, logo / ảnh đại diện (tuỳ chọn)]
// Logo trong Emages/logo-demo/ là logo minh họa — thay bằng logo thật do tổ chức cung cấp.
const RANKING_PERIODS = {
  week: 'Tuần 42/2026 (12/10 – 18/10)',
  month: 'Tháng 10/2026',
  quarter: 'Quý IV/2026',
  year: 'Năm 2026',
};
const RANKING_DATA = {
  org: {
    week: [
      ['Công ty CP Thép Bình Minh', 'Hải Phòng', 186000000, 2],
      ['CLB Thiện nguyện Nắng Mai', 'Huế', 152400000, 4],
      ['Công ty Cổ phần An Phát', 'Hà Nội', 140000000, 3, 'Emages/logo-demo/an-phat.svg'],
      ['Quỹ Hy vọng Xanh', 'TP. Hồ Chí Minh', 118750000, 3, 'Emages/logo-demo/hy-vong-xanh.svg'],
      ['Hội Doanh nhân Nữ Đồng Nai', 'Đồng Nai', 96200000, 2],
      ['Nhóm Tình nguyện Mầm Xanh', 'Quảng Ngãi', 81500000, 4],
      ['Hiệp hội Doanh nghiệp Trẻ', 'Cần Thơ', 70000000, 1, 'Emages/logo-demo/doanh-nghiep-tre.svg'],
      ['Công ty TNHH Nông sản Phú Điền', 'Đắk Lắk', 58300000, 1],
      ['Công ty CP Công nghệ Lạc Hồng Số', 'Đà Nẵng', 45000000, 1],
      ['Công ty CP Vận tải Trường Sơn', 'Thanh Hóa', 38600000, 1],
      ['Quỹ Từ thiện Ánh Dương', 'Khánh Hòa', 31200000, 1],
    ],
    month: [
      ['Công ty Cổ phần An Phát', 'Hà Nội', 642000000, 3, 'Emages/logo-demo/an-phat.svg'],
      ['Quỹ Hy vọng Xanh', 'TP. Hồ Chí Minh', 598500000, 4, 'Emages/logo-demo/hy-vong-xanh.svg'],
      ['Công ty CP Thép Bình Minh', 'Hải Phòng', 455000000, 2],
      ['Hiệp hội Doanh nghiệp Trẻ', 'Cần Thơ', 386200000, 2, 'Emages/logo-demo/doanh-nghiep-tre.svg'],
      ['CLB Thiện nguyện Nắng Mai', 'Huế', 274800000, 6],
      ['Công ty TNHH Dược phẩm Tâm An', 'Nghệ An', 231000000, 1],
      ['Hội Doanh nhân Nữ Đồng Nai', 'Đồng Nai', 198650000, 3],
      ['Công ty CP Công nghệ Lạc Hồng Số', 'Đà Nẵng', 176000000, 2],
      ['Nhóm Tình nguyện Mầm Xanh', 'Quảng Ngãi', 142300000, 5],
      ['Quỹ Từ thiện Ánh Dương', 'Khánh Hòa', 120000000, 2],
      ['Công ty TNHH Nông sản Phú Điền', 'Đắk Lắk', 98700000, 2],
    ],
    quarter: [
      ['Quỹ Hy vọng Xanh', 'TP. Hồ Chí Minh', 1124000000, 5, 'Emages/logo-demo/hy-vong-xanh.svg'],
      ['Công ty Cổ phần An Phát', 'Hà Nội', 1056000000, 3, 'Emages/logo-demo/an-phat.svg'],
      ['Hiệp hội Doanh nghiệp Trẻ', 'Cần Thơ', 702500000, 3, 'Emages/logo-demo/doanh-nghiep-tre.svg'],
      ['Công ty CP Thép Bình Minh', 'Hải Phòng', 655000000, 2],
      ['Công ty TNHH Dược phẩm Tâm An', 'Nghệ An', 431000000, 2],
      ['CLB Thiện nguyện Nắng Mai', 'Huế', 384800000, 7],
      ['Hội Doanh nhân Nữ Đồng Nai', 'Đồng Nai', 298650000, 3],
      ['Công ty CP Công nghệ Lạc Hồng Số', 'Đà Nẵng', 276000000, 2],
      ['Quỹ Từ thiện Ánh Dương', 'Khánh Hòa', 220000000, 2],
      ['Nhóm Tình nguyện Mầm Xanh', 'Quảng Ngãi', 192300000, 6],
      ['CLB Doanh nghiệp Bắc Ninh', 'Bắc Ninh', 176000000, 2],
    ],
    year: [
      ['Công ty Cổ phần An Phát', 'Hà Nội', 6480000000, 11, 'Emages/logo-demo/an-phat.svg'],
      ['Quỹ Hy vọng Xanh', 'TP. Hồ Chí Minh', 5912500000, 14, 'Emages/logo-demo/hy-vong-xanh.svg'],
      ['Hiệp hội Doanh nghiệp Trẻ', 'Cần Thơ', 4105000000, 8, 'Emages/logo-demo/doanh-nghiep-tre.svg'],
      ['Công ty TNHH Dược phẩm Tâm An', 'Nghệ An', 3260000000, 6],
      ['Công ty CP Thép Bình Minh', 'Hải Phòng', 2874000000, 5],
      ['Quỹ Từ thiện Ánh Dương', 'Khánh Hòa', 2415800000, 9],
      ['Công ty CP Công nghệ Lạc Hồng Số', 'Đà Nẵng', 1986000000, 4],
      ['CLB Doanh nghiệp Bắc Ninh', 'Bắc Ninh', 1642000000, 5],
      ['Công ty CP Vận tải Trường Sơn', 'Thanh Hóa', 1310500000, 3],
      ['Hội Doanh nhân Nữ Đồng Nai', 'Đồng Nai', 1128000000, 6],
      ['CLB Thiện nguyện Nắng Mai', 'Huế', 986400000, 12],
    ],
  },
  personal: {
    week: [
      ['Phạm Gia Huy', 'Hải Phòng', 42500000, 2],
      ['Trần Thu Hà', 'TP. Hồ Chí Minh', 38200000, 1],
      ['Hoàng Mai Linh', 'Huế', 31000000, 2],
      ['Nguyễn Minh Anh', 'Hà Nội', 27400000, 1],
      ['Đặng Khánh Vy', 'Khánh Hòa', 22750000, 1],
      ['Lý Thảo Nguyên', 'Lâm Đồng', 18300000, 1],
      ['Lê Quốc Bảo', 'Đà Nẵng', 15000000, 1],
      ['Ngô Hải Nam', 'Bình Dương', 12600000, 1],
      ['Võ Ngọc Trâm', 'Cần Thơ', 9850000, 1],
      ['Trịnh Văn Khoa', 'Thanh Hóa', 7200000, 1],
      ['Bùi Đức Thắng', 'Quảng Ninh', 5500000, 1],
    ],
    month: [
      ['Trần Thu Hà', 'TP. Hồ Chí Minh', 128400000, 3],
      ['Nguyễn Minh Anh', 'Hà Nội', 115200000, 2],
      ['Phạm Gia Huy', 'Hải Phòng', 96750000, 2],
      ['Lê Quốc Bảo', 'Đà Nẵng', 88000000, 3],
      ['Hoàng Mai Linh', 'Huế', 72500000, 2],
      ['Võ Ngọc Trâm', 'Cần Thơ', 64300000, 1],
      ['Đặng Khánh Vy', 'Khánh Hòa', 51000000, 2],
      ['Đỗ Thanh Tùng', 'Nghệ An', 47850000, 1],
      ['Ngô Hải Nam', 'Bình Dương', 39200000, 1],
      ['Bùi Đức Thắng', 'Quảng Ninh', 33600000, 1],
      ['Lý Thảo Nguyên', 'Lâm Đồng', 28900000, 1],
    ],
    quarter: [
      ['Trần Thu Hà', 'TP. Hồ Chí Minh', 214400000, 4],
      ['Nguyễn Minh Anh', 'Hà Nội', 198200000, 3],
      ['Lê Quốc Bảo', 'Đà Nẵng', 162000000, 4],
      ['Phạm Gia Huy', 'Hải Phòng', 140750000, 3],
      ['Võ Ngọc Trâm', 'Cần Thơ', 118300000, 2],
      ['Hoàng Mai Linh', 'Huế', 102500000, 3],
      ['Đỗ Thanh Tùng', 'Nghệ An', 86850000, 2],
      ['Đặng Khánh Vy', 'Khánh Hòa', 71000000, 2],
      ['Bùi Đức Thắng', 'Quảng Ninh', 63600000, 1],
      ['Ngô Hải Nam', 'Bình Dương', 52200000, 1],
      ['Trịnh Văn Khoa', 'Thanh Hóa', 45800000, 1],
    ],
    year: [
      ['Nguyễn Minh Anh', 'Hà Nội', 1285200000, 14],
      ['Trần Thu Hà', 'TP. Hồ Chí Minh', 1162750000, 11],
      ['Lê Quốc Bảo', 'Đà Nẵng', 948400000, 12],
      ['Võ Ngọc Trâm', 'Cần Thơ', 702000000, 7],
      ['Đỗ Thanh Tùng', 'Nghệ An', 615500000, 6],
      ['Phạm Gia Huy', 'Hải Phòng', 540300000, 5],
      ['Bùi Đức Thắng', 'Quảng Ninh', 486000000, 6],
      ['Hoàng Mai Linh', 'Huế', 412800000, 8],
      ['Trịnh Văn Khoa', 'Thanh Hóa', 356000000, 4],
      ['Lý Thảo Nguyên', 'Lâm Đồng', 298500000, 3],
      ['Đặng Khánh Vy', 'Khánh Hòa', 254000000, 4],
    ],
  },
};

// ---------- Render: bục 1–3 + bảng 4–11 ----------
const formatVnd = (value) => `${Math.round(value).toLocaleString('vi-VN')} ₫`;
const initials = (name) => name.split(' ').slice(-2).map((word) => word[0]).join('').toUpperCase();
// Có logo / ảnh đại diện → hiển thị ảnh; không có (hoặc ảnh lỗi) → icon tòa nhà (tổ chức) / chữ viết tắt (cá nhân).
const fillAvatar = (node, type, name, image) => {
  node.classList.toggle('has-logo', Boolean(image));
  if (image) {
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => fillAvatar(node, type, name, null), { once: true });
    img.src = image;
    node.replaceChildren(img);
  } else if (type === 'org') {
    node.innerHTML = '<svg class="icon"><use href="#building"/></svg>';
  } else {
    node.textContent = initials(name);
  }
};
const buildRankRow = (type, [name, place, amount, campaigns, image], rank) => {
  const row = document.createElement('li');
  row.className = 'rl-item';
  row.innerHTML = `<span class="rl-rank">${rank}</span><span class="rl-avatar${type === 'org' ? ' is-org' : ''}" aria-hidden="true"></span><span class="rl-info"><a class="rl-name stretched" href="#" data-panel="Chương trình đã gây quỹ"></a><span class="rl-meta"></span></span><span class="rl-end"><span class="rl-total"></span></span>`;
  fillAvatar(row.querySelector('.rl-avatar'), type, name, image);
  row.querySelector('.rl-name').textContent = name;
  row.querySelector('.rl-meta').textContent = `${place} · ${campaigns} chiến dịch`;
  const total = row.querySelector('.rl-total');
  total.dataset.value = amount;
  total.textContent = formatVnd(amount);
  return row;
};
const renderRankingPanel = (panel, period) => {
  const type = panel.dataset.type;
  const rows = RANKING_DATA[type][period];
  // DOM order of podium items is rank 1 → 3.
  panel.querySelectorAll('.podium-item').forEach((item, index) => {
    const [name, place, amount, campaigns, image] = rows[index];
    fillAvatar(item.querySelector('.podium-avatar'), type, name, image);
    item.querySelector('.podium-name').textContent = name;
    item.querySelector('.podium-place').lastChild.textContent = place;
    const total = item.querySelector('.podium-total');
    total.dataset.value = amount;
    total.textContent = formatVnd(amount);
    item.querySelector('.podium-sub').textContent = `${campaigns} chiến dịch`;
  });
  panel.querySelector('.ranking-list').replaceChildren(...rows.slice(3).map((row, index) => buildRankRow(type, row, index + 4)));
};

// ---------- Chuyển tab / kỳ: crossfade ngắn + đếm số ----------
const tabs = [...document.querySelectorAll('.segmented [role="tab"]')];
const periodButtons = [...document.querySelectorAll('.period-switch [data-period]')];
const rankingPanels = [...document.querySelectorAll('.ranking-panel')];
const periodLabel = document.querySelector('.ranking-period-label');
const RANK_ITEMS = '.podium-card, .rl-item';
let rankingPeriod = periodButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.period || 'month';
let rankingTimeline;
rankingPanels.forEach((panel) => renderRankingPanel(panel, rankingPeriod));
// Runs `update` between fading `from` out and `to` in. With GSAP (and motion allowed) it takes
// ~0.4s and only counts the amounts — the full podium entrance is not replayed.
const transitionRanking = (from, to, update) => {
  if (rankingTimeline) rankingTimeline.progress(1, false).kill();
  if (!window.gsap || reduceMotion) {
    update();
    return;
  }
  rankingTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    .to(from.querySelectorAll(RANK_ITEMS), { autoAlpha: 0, y: 12, duration: 0.15, stagger: 0.015 })
    .add(() => {
      update();
      gsap.fromTo(to.querySelectorAll(RANK_ITEMS), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
      to.querySelectorAll('.podium-total, .rl-total').forEach((total) => {
        const counter = { value: 0 };
        gsap.to(counter, { value: Number(total.dataset.value), duration: 0.6, ease: 'power3.out', onUpdate: () => { total.textContent = formatVnd(counter.value); } });
      });
    });
};
const selectTab = (tab) => {
  const current = rankingPanels.find((panel) => !panel.hidden);
  const next = document.getElementById(tab.getAttribute('aria-controls'));
  tabs.forEach((other) => {
    const selected = other === tab;
    other.setAttribute('aria-selected', String(selected));
    other.tabIndex = selected ? 0 : -1;
  });
  if (current === next) return;
  transitionRanking(current, next, () => {
    current.hidden = true;
    next.hidden = false;
  });
};
const selectPeriod = (button) => {
  if (button.dataset.period === rankingPeriod) return;
  rankingPeriod = button.dataset.period;
  periodButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
  periodLabel.textContent = RANKING_PERIODS[rankingPeriod];
  const current = rankingPanels.find((panel) => !panel.hidden);
  transitionRanking(current, current, () => rankingPanels.forEach((panel) => renderRankingPanel(panel, rankingPeriod)));
};
periodButtons.forEach((button) => button.addEventListener('click', () => selectPeriod(button)));
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});


// ==================== SECTION 05: BẢN ĐỒ CỨU TRỢ — điểm trên ảnh & nút phóng to / thu nhỏ ====================
// Vị trí theo trung tâm hành chính (gần đúng). Mức độ và nhu cầu là DỮ LIỆU MINH HỌA:
// khi triển khai thật phải lấy từ hệ thống cảnh báo / điều phối chính thức.
// [tên, mức độ, vĩ độ, kinh độ, nhu cầu]
const reliefPoints = [
  ['Quảng Trị', 'urgent', 17.47, 106.62, 'Ngập sâu sau mưa lũ, nhiều hộ thiếu lương thực và nước sạch.'],
  ['Huế', 'urgent', 16.46, 107.59, 'Nhiều khu dân cư bị chia cắt, cần nhu yếu phẩm và thuốc men.'],
  ['Quảng Ngãi', 'urgent', 15.12, 108.8, 'Nhà ở hư hại sau lũ, cần hỗ trợ sửa chữa khẩn cấp.'],
  ['Cà Mau', 'urgent', 9.18, 105.15, 'Xâm nhập mặn sâu, thiếu nước sinh hoạt diện rộng.'],
  ['Vĩnh Long', 'urgent', 10.25, 105.97, 'Thiếu nước ngọt cho sinh hoạt tại nhiều xã ven biển.'],
  ['Hà Tĩnh', 'need', 18.34, 105.91, 'Khắc phục hậu quả mưa lũ, phục hồi sinh kế.'],
  ['Nghệ An', 'need', 18.68, 105.68, 'Hỗ trợ hộ dân vùng ven sông bị ảnh hưởng mưa lũ.'],
  ['Lai Châu', 'need', 22.4, 103.46, 'Học sinh vùng cao cần sách vở, áo ấm trước mùa đông.'],
  ['Điện Biên', 'need', 21.39, 103.02, 'Học sinh bán trú cần chăn ấm, đồ dùng học tập.'],
  ['Cao Bằng', 'need', 22.67, 106.26, 'Hỗ trợ học sinh có hoàn cảnh khó khăn đến trường.'],
  ['Sơn La', 'need', 21.33, 103.91, 'Nhà ở xuống cấp của hộ nghèo trước mùa mưa bão.'],
  ['Gia Lai', 'need', 13.78, 109.22, 'Người cao tuổi neo đơn cần mái ấm an toàn.'],
  ['An Giang', 'need', 10.01, 105.08, 'Thiếu nước sạch mùa khô tại các xã biên giới.'],
  ['TP. Hồ Chí Minh', 'need', 10.78, 106.7, 'Kho máu dự trữ giảm, cần người hiến máu tình nguyện.'],
];
// Kinh/vĩ độ → % trong khung ảnh map01-web.webp (hiệu chỉnh theo điểm cực Bắc, Nam, Đông, Tây của ảnh).
const mapPosition = (lat, lon) => ({
  x: ((277 + (lon - 102.14) * 60.8 - 273.5) / 452.5) * 100,
  y: ((30 + (23.39 - lat) * 63.4 - 26) / 948) * 100,
});

const reliefLayer = document.querySelector('.relief-points');
if (reliefLayer) {
  reliefPoints.forEach(([name, level, lat, lon, need], index) => {
    const { x, y } = mapPosition(lat, lon);
    const dot = document.createElement('span');
    dot.className = `relief-point is-${level}`;
    dot.style.cssText = `--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%;--d:${(index * 0.35).toFixed(2)}s`;
    const label = document.createElement('span');
    label.className = 'relief-point-label';
    const title = document.createElement('strong');
    title.textContent = name;
    label.append(title, need);
    dot.append(label);
    reliefLayer.append(dot);
  });
}

// ---------- Bản đồ: phóng to / thu nhỏ / về toàn cảnh ----------
const reliefFigure = document.querySelector('.relief-map-figure');
const reliefZoom = document.querySelector('.relief-zoom');
if (reliefFigure && reliefZoom) {
  const ZOOM_MIN = 1, ZOOM_MAX = 1.8, ZOOM_STEP = 0.4;
  let zoom = ZOOM_MIN;
  const buttons = Object.fromEntries([...reliefZoom.querySelectorAll('[data-zoom]')].map((button) => [button.dataset.zoom, button]));
  const applyZoom = (value) => {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 10) / 10));
    reliefFigure.style.setProperty('--map-zoom', zoom);
    buttons.in.disabled = zoom >= ZOOM_MAX;
    buttons.out.disabled = zoom <= ZOOM_MIN;
  };
  reliefZoom.addEventListener('click', (event) => {
    const action = event.target.closest('[data-zoom]')?.dataset.zoom;
    if (action === 'in') applyZoom(zoom + ZOOM_STEP);
    else if (action === 'out') applyZoom(zoom - ZOOM_STEP);
    else if (action === 'reset') applyZoom(ZOOM_MIN);
  });
  applyZoom(ZOOM_MIN);
}

if (!window.gsap) document.documentElement.classList.remove('hero-intro');

// ==================== SECTION 06: TẠO QUỸ — modal biểu mẫu 3 bước (hoạt động cả khi không có GSAP) ====================
// Chỉ là giao diện: bước "Gửi hồ sơ" hiện màn hình thành công, chưa gửi dữ liệu đi đâu — nối API khi triển khai.
(() => {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  const panel = modal.querySelector('.modal__panel');
  const overlay = modal.querySelector('.modal__overlay');
  const form = modal.querySelector('.fund-form');
  const steps = [...form.querySelectorAll('.fund-step')];
  const dots = [...modal.querySelectorAll('.modal__steps li')];
  const prevButton = form.querySelector('[data-prev]');
  const nextButton = form.querySelector('[data-next]');
  const success = form.querySelector('.fund-success');
  const animate = () => Boolean(window.gsap) && !reduceMotion;
  const TYPES = {
    personal: { kicker: 'Quỹ cá nhân', title: 'Tạo quỹ cá nhân' },
    org: { kicker: 'Quỹ tổ chức', title: 'Tạo quỹ tổ chức' },
  };
  let step = 0;
  let opener = null;
  let isOpen = false;

  // ---------- Khoá cuộn trang nền (có ScrollSmoother thì tạm dừng smoother) ----------
  const lockScroll = (on) => {
    if (smoother) smoother.paused(on);
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };

  // ---------- Loại quỹ: đổi tiêu đề, chỉ bật các ô dành cho loại đó ----------
  const setType = (type) => {
    modal.querySelector('#modal-kicker').textContent = TYPES[type].kicker;
    modal.querySelector('#modal-title').textContent = TYPES[type].title;
    form.querySelectorAll('[data-only]').forEach((field) => {
      const on = field.dataset.only === type;
      field.hidden = !on;
      field.querySelectorAll('input, select, textarea').forEach((input) => { input.disabled = !on; });
    });
  };

  // ---------- Điều hướng bước ----------
  const updateNav = () => {
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === step);
      dot.classList.toggle('is-done', index < step);
    });
    prevButton.disabled = step === 0;
    nextButton.querySelector('.fund-next-text').textContent = step === steps.length - 1 ? 'Gửi hồ sơ' : 'Tiếp tục';
  };
  const showStep = (next, direction = 1) => {
    const from = steps[step];
    const to = steps[next];
    step = next;
    updateNav();
    if (!animate()) {
      from.classList.remove('is-active');
      to.classList.add('is-active');
      return;
    }
    gsap.timeline()
      .to(from, { x: -40 * direction, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .add(() => { from.classList.remove('is-active'); gsap.set(from, { clearProps: 'transform,opacity,visibility' }); to.classList.add('is-active'); })
      .fromTo(to.children, { x: 50 * direction, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' });
  };

  // ---------- Kiểm tra ô bắt buộc của bước hiện tại; sai thì rung panel ----------
  const validate = (fieldset) => {
    let ok = true;
    fieldset.querySelectorAll('input, select, textarea').forEach((input) => {
      if (input.disabled) return;
      const wrap = input.closest('.field') || input.closest('.check');
      const valid = input.type === 'checkbox'
        ? !input.required || input.checked
        : input.checkValidity() && (!input.required || input.value.trim() !== '');
      wrap?.classList.toggle('is-invalid', !valid);
      if (!valid && ok) { ok = false; input.focus({ preventScroll: true }); }
    });
    if (!ok && animate()) gsap.fromTo(panel, { x: 0 }, { keyframes: { x: [-10, 10, -6, 6, 0] }, duration: 0.45, ease: 'none' });
    return ok;
  };

  const resetForm = () => {
    form.reset();
    modal.classList.remove('is-done');
    success.classList.remove('is-active');
    form.querySelectorAll('.is-invalid').forEach((element) => element.classList.remove('is-invalid'));
    steps.forEach((fieldset, index) => {
      fieldset.classList.toggle('is-active', index === 0);
      if (window.gsap) gsap.set([fieldset, ...fieldset.children], { clearProps: 'transform,opacity,visibility' });
    });
    if (window.gsap) gsap.set(success.querySelectorAll('*'), { clearProps: 'transform,opacity,visibility' });
    step = 0;
    updateNav();
  };

  // ---------- Mở / đóng: panel trượt từ phải, nội dung hiện lần lượt ----------
  const open = (type, button) => {
    if (isOpen) return;
    isOpen = true;
    opener = button;
    resetForm();
    setType(type);
    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    if (!animate()) {
      modal.style.visibility = 'visible';
      overlay.style.opacity = 1;
      panel.style.transform = 'none';
    } else {
      gsap.timeline()
        .set(modal, { visibility: 'visible' })
        .to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.out' })
        .fromTo(panel, { xPercent: 110 }, { xPercent: 0, x: 0, duration: 1, ease: 'expo.out' }, 0)
        .from(panel.querySelectorAll('.modal__top > *, .modal__steps li'), { y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: 'power3.out' }, 0.25)
        .from(steps[0].children, { y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: 'power3.out' }, 0.35);
    }
    setTimeout(() => steps[0].querySelector('input:not([disabled])')?.focus({ preventScroll: true }), 450);
  };
  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    modal.setAttribute('aria-hidden', 'true');
    const done = () => { modal.style.visibility = 'hidden'; lockScroll(false); opener?.focus({ preventScroll: true }); };
    if (!animate()) {
      overlay.style.opacity = 0;
      panel.style.transform = '';
      done();
      return;
    }
    gsap.timeline({ onComplete: done })
      .to(panel, { xPercent: 110, duration: 0.7, ease: 'expo.in' })
      .to(overlay, { opacity: 0, duration: 0.4 }, 0.3);
  };

  // ---------- Gửi: vẽ dấu tích, hiện lời cảm ơn ----------
  const submit = () => {
    modal.classList.add('is-done');
    dots.forEach((dot) => { dot.classList.remove('is-active'); dot.classList.add('is-done'); });
    const last = steps[step];
    const showSuccess = () => {
      last.classList.remove('is-active');
      success.classList.add('is-active');
      if (!animate()) return;
      const circle = success.querySelector('circle');
      const tick = success.querySelector('path');
      [circle, tick].forEach((shape) => { const length = shape.getTotalLength(); gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length }); });
      gsap.timeline()
        .to(circle, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
        .to(tick, { strokeDashoffset: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
        .from(success.querySelectorAll('h4, p, .button'), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.3);
    };
    if (animate()) gsap.to(last, { autoAlpha: 0, y: -20, duration: 0.3, onComplete: showSuccess });
    else showSuccess();
  };

  document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => open(button.dataset.open, button)));
  modal.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  nextButton.addEventListener('click', () => {
    if (!validate(steps[step])) return;
    if (step < steps.length - 1) showStep(step + 1, 1);
    else submit();
  });
  prevButton.addEventListener('click', () => { if (step > 0) showStep(step - 1, -1); });
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', (event) => {
    event.target.closest('.is-invalid')?.classList.remove('is-invalid');
    // Ô mục tiêu: tự thêm dấu chấm phân cách hàng nghìn
    if (event.target.name === 'goal') {
      const digits = event.target.value.replace(/\D/g, '');
      event.target.value = digits ? Number(digits).toLocaleString('vi-VN') : '';
    }
  });
})();

// ==================== MOTION: GSAP / ScrollTrigger (tự tắt khi reduced motion) ====================
// Content stays visible if GSAP fails to load; CTAs are clickable throughout.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollSmoother) gsap.registerPlugin(ScrollSmoother);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  const mm = gsap.matchMedia();

  // ==================== FLOW: ScrollSmoother + link neo ====================
  // Momentum scroll on desktop (touch keeps native scroll). Fixed header, dialog and the page curtain
  // live outside #smooth-wrapper so position: fixed keeps working.
  if (window.ScrollSmoother && !reduceMotion && document.querySelector('#smooth-wrapper')) {
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, smoothTouch: false, effects: false });
    document.documentElement.classList.add('has-smoother');
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"], a[href^="index.html#"]');
      if (!link || link.dataset.panel !== undefined) return;
      const hash = link.getAttribute('href').replace(/^index.html/, '');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      scrollToElement(target);
      history.replaceState(null, '', hash);
    });
  }

  // ==================== HERO: intro (SplitText) + parallax ====================
  // Intro: ảnh nền thu từ mờ + phóng to về rõ nét; "Lan tỏa lòng" hiện từng từ (trồi nhẹ lên, từ mờ sang nét);
  // "nhân ái" (chữ gradient, không tách để giữ background-clip) hiện cả cụm cùng kiểu, nối tiếp; câu dẫn hiện
  // theo dòng; CTA bật nhẹ; khối số liệu mở từ dưới lên.
  // Không dùng mask của SplitText vì mask cắt dấu tiếng Việt (line-height chặt). CTA chỉ đổi opacity/transform
  // nên vẫn bấm được trong lúc intro chạy. Parallax: ảnh nền và nội dung trôi khác tốc độ.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const delay = window.flowEnterDelay || 0;
    // Drop the pre-hide class first so .from() tweens read the real end values (same frame, no flash).
    document.documentElement.classList.remove('hero-intro');

    // ---------- Tiêu đề & câu dẫn: SplitText ----------
    // Tách một lần sau khi font tải xong (đúng kerning / ngắt dòng), chạy xong thì revert() về HTML gốc
    // để đổi kích thước màn hình sau đó không bị lệch dòng. Giữ ẩn trong lúc chờ font để không nháy chữ.
    if (window.SplitText) {
      gsap.set('.hero-title, .hero-content p', { autoAlpha: 0 });
      document.fonts.ready.then(() => {
        gsap.set('.hero-title, .hero-content p', { autoAlpha: 1 });
        const title = SplitText.create('.hero-title', { type: 'words', ignore: '.hero-accent' });
        const lead = SplitText.create('.hero-content p', { type: 'lines' });
        // "nhân ái" vốn có drop-shadow trong CSS → giữ drop-shadow trong cả hai đầu filter để không bị nháy bóng
        const accentShadow = 'drop-shadow(0 2px 8px rgba(255,255,255,.5))';
        gsap.timeline({ delay: delay + 0.25, defaults: { ease: 'power3.out' }, onComplete: () => { title.revert(); lead.revert(); } })
          .from(title.words, { autoAlpha: 0, y: 34, filter: 'blur(10px)', duration: 1.1, stagger: 0.14, clearProps: 'filter' })
          .fromTo('.hero-accent', { autoAlpha: 0, y: 34, filter: `blur(10px) ${accentShadow}` }, { autoAlpha: 1, y: 0, filter: `blur(0px) ${accentShadow}`, duration: 1.2, clearProps: 'filter,transform,opacity,visibility' }, '-=0.75')
          .from(lead.lines, { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.1 }, '-=0.7');
      });
    } else {
      gsap.from('.hero-title, .hero-content p', { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.2, delay: delay + 0.25, clearProps: 'transform,opacity,visibility' });
    }

    // ---------- Nền, header, CTA, khối số liệu ----------
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay })
      .addLabel('start')
      .fromTo('.hero-bg', { scale: 1.16, filter: 'blur(12px) brightness(0.85)' }, { scale: 1, filter: 'blur(0px) brightness(1)', duration: 2.4, ease: 'expo.out', clearProps: 'filter' }, 'start')
      .from('.header', { yPercent: -100, opacity: 0, duration: 0.7, clearProps: 'transform,opacity' }, 'start+=0.1')
      .from('.hero-actions .button', { autoAlpha: 0, y: 24, scale: 0.92, duration: 0.7, stagger: 0.12, ease: 'back.out(1.7)', clearProps: 'transform,opacity,visibility' }, 'start+=1.35')
      .fromTo('.impact-widget', { clipPath: 'inset(100% 0% 0% 0%)', y: 40 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out', clearProps: 'clipPath,transform' }, 'start+=1.5')
      .from('.impact-card', { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.08, clearProps: 'transform,opacity,visibility' }, 'start+=1.75');

    const parallax = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-bg', { yPercent: 12, ease: 'none', scrollTrigger: parallax });
    gsap.to('.hero-content', { y: -70, ease: 'none', scrollTrigger: parallax });
  });

  // Section 04 podium entrance: one timeline, one ScrollTrigger (on the timeline, not child tweens).
  // Order: bases rise 3 → 2 → 1, cards lift in, amounts count up to their real value, ranks 4–11 follow.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const panel = document.querySelector('.ranking-panel:not([hidden])');
    const items = ['.rank-3', '.rank-2', '.rank-1'].map((rank) => panel.querySelector(`.podium-item${rank}`));
    const totals = [...panel.querySelectorAll('.podium-total')];
    const counters = totals.map(() => ({ value: 0 }));
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.podium', start: 'top 80%', once: true },
    });
    tl.addLabel('bases')
      .from(items.map((item) => item.querySelector('.podium-base')), { scaleY: 0, duration: 0.8, stagger: 0.14, ease: 'power4.out' }, 'bases')
      .from(items.map((item) => item.querySelector('.base-emblem')), { autoAlpha: 0, scale: 0.6, y: 20, duration: 0.6, stagger: 0.14, ease: 'back.out(1.8)' }, 'bases+=0.35')
      .addLabel('cards', 'bases+=0.35')
      .call(() => totals.forEach((total) => { total.textContent = formatVnd(0); }), null, 'cards')
      .from(items.map((item) => item.querySelector('.podium-card')), { autoAlpha: 0, y: 48, duration: 0.7, stagger: 0.12, clearProps: 'transform' }, 'cards')
      .to(counters, {
        value: (index) => Number(totals[index].dataset.value), duration: 1.2, ease: 'power2.out',
        onUpdate: () => counters.forEach((counter, index) => { totals[index].textContent = formatVnd(counter.value); }),
      }, 'cards+=0.3')
      .from(panel.querySelectorAll('.rl-item'), { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.05, clearProps: 'transform' }, 'cards+=0.5');

    // Floating background hearts: gentle, transform-only yoyo loops.
    gsap.utils.toArray('.rk-heart').forEach((heart, index) => {
      gsap.to(heart, { y: gsap.utils.random(-18, -8), rotation: gsap.utils.random(-12, 12), duration: gsap.utils.random(2.6, 4), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: index * 0.3 });
    });
  });

  // ==================== SECTION 06: TẠO QUỸ — panel bay lên, ảnh parallax (không còn hiệu ứng nở rộng khi rê chuột) ====================
  mm.add({ motion: '(prefers-reduced-motion: no-preference)' }, (context) => {
    const { motion } = context.conditions;
    const panels = gsap.utils.toArray('.create .panel');
    if (!motion || !panels.length) return undefined;

    // ---------- Mở màn: 2 panel bay lên, hơi nghiêng về hai phía; nội dung từng panel trượt vào ----------
    gsap.from(panels, {
      yPercent: 25, autoAlpha: 0, rotate: (index) => (index ? 3 : -3), duration: 1.4, ease: 'expo.out', stagger: 0.12,
      clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.create__panels', start: 'top 85%', once: true },
    });
    panels.forEach((panel) => {
      // ---------- Parallax: ảnh trôi chậm hơn khi cuộn ----------
      gsap.fromTo(panel.querySelector('.panel__media img'), { yPercent: -8 }, {
        yPercent: 8, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      // Nút .panel__cta không nằm trong hiệu ứng: luôn đứng yên đúng vị trí
      gsap.from(panel.querySelectorAll('.panel__kicker, .panel__title, .panel__list li'), {
        y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.06,
        clearProps: 'opacity,visibility', scrollTrigger: { trigger: panel, start: 'top 60%', once: true },
      });
    });

    return undefined;
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ==================== FLOW: tiêu đề section hiện theo dòng (SplitText) ====================
    if (window.SplitText) {
      gsap.utils.toArray('.section-title:not(.ranking-title)').forEach((title) => {
        title.classList.add('is-split');
        SplitText.create(title, {
          type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.09,
            scrollTrigger: { trigger: title, start: 'top 90%', once: true },
          }),
        });
      });
    }

    const revealStart = window.innerHeight * 0.88;
    const pending = gsap.utils.toArray('[data-reveal]').filter((element) => element.getBoundingClientRect().top > revealStart);
    gsap.set(pending, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(pending, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });

    // ==================== SECTION 03: CHƯƠNG TRÌNH — card nổi bật rồi 3 card hiện lần lượt ====================
    gsap.from('.campaign-card', {
      autoAlpha: 0, y: 40, duration: 0.8, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.campaign-layout', start: 'top 85%', once: true },
    });

    gsap.utils.toArray('.progress-bar span').forEach((bar) => {
      gsap.from(bar, { scaleX: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: bar, start: 'top 92%', once: true } });
    });

    // ==================== SECTION 05: BẢN ĐỒ CỨU TRỢ — bản đồ hiện lên, điểm bật ra (khẩn cấp trước), số liệu đếm lên ====================
    gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: '.relief-map', start: 'top 75%', once: true } })
      .from('.relief-map-image', { autoAlpha: 0, y: 40, scale: 0.96, duration: 1.1, clearProps: 'transform,opacity,visibility' })
      .from('.relief-island', { autoAlpha: 0, duration: 0.6, stagger: 0.15, clearProps: 'opacity,visibility' }, '-=0.5')
      .from('.relief-point.is-urgent, .relief-point.is-need', { scale: 0, duration: 0.45, ease: 'back.out(2.4)', stagger: 0.05, clearProps: 'transform' }, '-=0.6');

    gsap.from('.relief-card', { autoAlpha: 0, y: 30, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.relief-card', start: 'top 90%', once: true } });
    const statValues = gsap.utils.toArray('.relief-stat strong[data-count-to]');
    const statFormat = new Intl.NumberFormat('vi-VN');
    statValues.forEach((value) => {
      const counter = { value: 0 };
      gsap.to(counter, {
        value: Number(value.dataset.countTo), duration: 1.6, ease: 'power2.out',
        onStart: () => { value.textContent = '0'; },
        onUpdate: () => { value.textContent = statFormat.format(Math.round(counter.value)); },
        scrollTrigger: { trigger: '.relief-card', start: 'top 90%', once: true },
      });
    });

    // ==================== SECTION 08: ĐỐI TÁC — 2 hàng logo trượt vào từ hai phía ====================
    gsap.from('.partner-row', {
      autoAlpha: 0, xPercent: (index) => (index ? 8 : -8), duration: 1.1, ease: 'power3.out', stagger: 0.12,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.partners-marquee', start: 'top 88%', once: true },
    });
  });
}
