// ==================== TRANG CHI TIẾT CHƯƠNG TRÌNH ====================
// Dữ liệu minh họa — khi triển khai thật, lấy từ CMS/API đã xác minh theo `id` trên URL.

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

// ==================== DATA: chương trình (minh họa) ====================
const statuses = {
  urgent: { className: 'status-urgent', label: 'Cần hỗ trợ khẩn cấp' },
  active: { className: 'status-active', label: 'Đang gây quỹ' },
  receiving: { className: 'status-active', label: 'Đang tiếp nhận' },
  done: { className: 'status-done', label: 'Đã hoàn thành' },
};

const campaigns = {
  'lu-lut-mien-trung': {
    title: 'Khắc phục hậu quả lũ lụt cho người dân miền Trung',
    status: 'urgent', category: 'Cứu trợ thiên tai', image: 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/z7793485711445_87903495f28730b1681f43dbaf4873d1.jpg', focus: '60% 50%', zoom: 1,
    summary: 'Hỗ trợ lương thực, nước sạch, thuốc men và sửa chữa nhà ở cho các hộ gia đình bị ảnh hưởng nặng sau đợt lũ.',
    raisedLabel: 'Đã huy động', raised: '1.245.000.000 ₫', goal: '2.000.000.000 ₫', percent: 62, deadline: 'Còn 18 ngày',
    organizer: 'Hội Chữ thập đỏ tỉnh (minh họa)', area: 'Các xã vùng lũ, tỉnh Quảng Trị', beneficiaries: 'Khoảng 3.000 hộ gia đình',
    cta: 'Ủng hộ ngay',
    story: [
      'Đợt mưa lũ kéo dài khiến nhiều khu dân cư bị ngập sâu, hàng nghìn hộ gia đình mất nhà cửa, lương thực và tài sản thiết yếu.',
      'Chương trình tập trung hỗ trợ khẩn cấp trong giai đoạn đầu và đồng hành cùng người dân khôi phục cuộc sống sau lũ.',
    ],
    uses: ['Gạo, mì, nước uống đóng chai cho các hộ bị cô lập', 'Túi thuốc gia đình, hóa chất khử khuẩn nguồn nước', 'Hỗ trợ sửa chữa nhà ở bị hư hại nặng'],
    updates: [['05/10/2026', 'Trao 1.200 suất quà nhu yếu phẩm tại 4 xã bị chia cắt.'], ['28/09/2026', 'Khởi động chương trình, tiếp nhận đóng góp từ cộng đồng.']],
  },
  'nuoc-sach-han-man': {
    title: 'Nước sạch cho người dân vùng hạn mặn',
    status: 'urgent', category: 'Nước sạch & vệ sinh', image: 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/1358142_gen-h-235_1777566365.jpg', focus: '50% 40%', zoom: 1,
    summary: 'Lắp đặt bồn chứa, máy lọc nước cho các xã thiếu nước sinh hoạt trong mùa khô.',
    raisedLabel: 'Đã huy động', raised: '410.000.000 ₫', goal: '1.200.000.000 ₫', percent: 34, deadline: 'Còn 25 ngày',
    organizer: 'Hội Chữ thập đỏ tỉnh (minh họa)', area: 'Các xã ven biển bị xâm nhập mặn, tỉnh Vĩnh Long', beneficiaries: 'Khoảng 1.500 hộ dân',
    cta: 'Ủng hộ ngay',
    story: ['Xâm nhập mặn khiến nguồn nước sinh hoạt khan hiếm, ảnh hưởng trực tiếp tới sức khỏe người dân, đặc biệt là trẻ em và người cao tuổi.'],
    uses: ['Bồn chứa nước dung tích lớn cho hộ gia đình', 'Máy lọc nước đặt tại trường học, trạm y tế', 'Tập huấn sử dụng và bảo quản nước sạch'],
    updates: [['01/10/2026', 'Khảo sát nhu cầu tại 6 xã, lập danh sách hộ ưu tiên.']],
  },
  'tiep-suc-den-truong': {
    title: 'Tiếp sức đến trường cho học sinh vùng cao',
    status: 'active', category: 'Giáo dục', image: 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/3.-028ae9de1f.jpg', focus: '50% 45%', zoom: 1,
    summary: 'Trao học bổng, sách vở và áo ấm cho học sinh có hoàn cảnh khó khăn.',
    raisedLabel: 'Đã huy động', raised: '328.500.000 ₫', goal: '800.000.000 ₫', percent: 41, deadline: '',
    organizer: 'Hội Chữ thập đỏ tỉnh (minh họa)', area: 'Các trường vùng cao, tỉnh Cao Bằng', beneficiaries: 'Khoảng 2.000 học sinh',
    cta: 'Ủng hộ ngay',
    story: ['Nhiều học sinh vùng cao phải vượt quãng đường dài tới trường trong điều kiện thiếu thốn. Một bộ sách vở, chiếc áo ấm giúp các em yên tâm học tập.'],
    uses: ['Học bổng cho học sinh có hoàn cảnh đặc biệt khó khăn', 'Sách vở, đồ dùng học tập', 'Áo ấm, chăn cho học sinh bán trú'],
    updates: [['22/09/2026', 'Trao 300 suất học bổng đợt 1.']],
  },
  'hien-mau-mua-he': {
    title: 'Giọt hồng yêu thương — tiếp sức kho máu mùa hè',
    status: 'receiving', category: 'Hiến máu nhân đạo', image: 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/z765570465791.jpg', focus: '55% 45%', zoom: 1,
    summary: 'Kêu gọi hiến máu tình nguyện, bổ sung lượng máu dự trữ cho các bệnh viện.',
    raisedLabel: 'Đã tiếp nhận', raised: '3.120 đơn vị', goal: '5.000 đơn vị', percent: 62, deadline: 'Còn 12 ngày',
    organizer: 'Ban Chỉ đạo vận động hiến máu (minh họa)', area: 'Các điểm hiến máu cố định và lưu động tại Hà Nội', beneficiaries: 'Người bệnh tại các bệnh viện',
    cta: 'Đăng ký hiến máu',
    story: ['Mùa hè là thời điểm lượng máu dự trữ thường giảm. Mỗi đơn vị máu có thể góp phần cứu sống người bệnh.'],
    uses: ['Tổ chức các điểm hiến máu lưu động', 'Chăm sóc, bồi dưỡng người hiến máu', 'Truyền thông, vận động cộng đồng'],
    updates: [['03/10/2026', 'Ngày hội hiến máu tiếp nhận 820 đơn vị máu.']],
  },
  'mai-am-nhan-ai': {
    title: 'Mái ấm nhân ái cho hộ nghèo, người cao tuổi neo đơn',
    status: 'active', category: 'Sinh kế & nhà ở', image: 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/1-1-3-9134.avif', focus: '50% 40%', zoom: 1,
    summary: 'Xây mới, sửa chữa nhà ở an toàn trước mùa mưa bão.',
    raisedLabel: 'Đã huy động', raised: '860.000.000 ₫', goal: '1.500.000.000 ₫', percent: 57, deadline: 'Còn 40 ngày',
    organizer: 'Hội Chữ thập đỏ tỉnh (minh họa)', area: 'Các xã có tỷ lệ hộ nghèo cao, tỉnh Tuyên Quang', beneficiaries: '30 hộ nghèo, người cao tuổi neo đơn',
    cta: 'Ủng hộ ngay',
    story: ['Nhiều người cao tuổi neo đơn đang sống trong những căn nhà xuống cấp, không an toàn khi mùa mưa bão đến.'],
    uses: ['Xây mới nhà nhân ái', 'Sửa chữa mái, tường nhà xuống cấp', 'Hỗ trợ vật dụng sinh hoạt thiết yếu'],
    updates: [['26/09/2026', 'Khởi công 8 căn nhà nhân ái đầu tiên.']],
  },
  'kham-benh-nguoi-cao-tuoi': {
    title: 'Khám bệnh, cấp thuốc miễn phí cho người cao tuổi',
    status: 'done', category: 'Y tế', image: 'Emages/%E1%BA%A3nh%20minh%20h%E1%BB%8Da/bong-hoa-nhan-ai-toa-huong-doi-thuong-35738.jpg', focus: '50% 40%', zoom: 1,
    summary: 'Chương trình đã đạt mục tiêu. Báo cáo sử dụng nguồn đóng góp được công khai bên dưới.',
    raisedLabel: 'Đã huy động', raised: '500.000.000 ₫', goal: '500.000.000 ₫', percent: 100, deadline: '',
    organizer: 'Hội Chữ thập đỏ tỉnh (minh họa)', area: 'Các xã vùng sâu, vùng xa, tỉnh Nghệ An', beneficiaries: 'Khoảng 4.500 người cao tuổi',
    cta: 'Xem báo cáo',
    story: ['Chương trình đã tổ chức các đợt khám bệnh lưu động, tư vấn sức khỏe và cấp thuốc miễn phí cho người cao tuổi.'],
    uses: ['Khám, tư vấn sức khỏe lưu động', 'Cấp thuốc điều trị bệnh mãn tính', 'Tặng dụng cụ hỗ trợ đi lại'],
    updates: [['15/09/2026', 'Hoàn thành chương trình, công bố báo cáo tài chính.']],
  },
};

// ==================== RENDER ====================
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const icon = (name) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${name}`);
  svg.append(use);
  return svg;
};

const root = document.querySelector('#detail-root');
const id = new URLSearchParams(window.location.search).get('id');
const campaign = campaigns[id];

if (!campaign) {
  // ---------- Trạng thái không tìm thấy ----------
  root.innerHTML = '';
  const box = el('div', 'container detail-empty');
  box.append(el('h1', 'section-title', 'Không tìm thấy chương trình'), el('p', 'section-lead', 'Chương trình bạn tìm có thể đã kết thúc hoặc đường dẫn chưa chính xác.'));
  const back = el('a', 'button button-primary', 'Xem các chương trình');
  back.href = 'index.html#chuong-trinh';
  box.append(back);
  root.append(box);
  root.hidden = false;
} else {
  document.title = `${campaign.title} | Hội Chữ thập đỏ Việt Nam`;
  const status = statuses[campaign.status];
  const isDone = campaign.status === 'done';

  // ---------- Breadcrumb ----------
  document.querySelector('.breadcrumb-current').textContent = campaign.title;

  // ---------- Tóm tắt: ảnh + khối tiến độ ----------
  const media = document.querySelector('.detail-media');
  media.style.setProperty('--focus', campaign.focus);
  media.style.setProperty('--zoom', campaign.zoom);
  const mediaImg = media.querySelector('img');
  mediaImg.src = campaign.image;
  mediaImg.alt = campaign.title;

  const badge = document.querySelector('.detail-status');
  badge.className = `status ${status.className} detail-status`;
  badge.replaceChildren(document.createTextNode(status.label));
  document.querySelector('.detail-category').textContent = campaign.category;
  document.querySelector('.detail-title').textContent = campaign.title;
  document.querySelector('.detail-summary').textContent = campaign.summary;

  document.querySelector('.detail-raised-label').textContent = campaign.raisedLabel;
  document.querySelector('.detail-raised').textContent = campaign.raised;
  document.querySelector('.detail-goal').textContent = campaign.goal;
  const bar = document.querySelector('.detail-progress .progress-bar');
  bar.classList.toggle('is-complete', isDone);
  bar.setAttribute('aria-valuenow', campaign.percent);
  bar.setAttribute('aria-valuetext', isDone ? 'Đã đạt mục tiêu' : `Đã đạt ${campaign.percent}% mục tiêu`);
  bar.querySelector('span').style.setProperty('--value', `${campaign.percent}%`);
  const meta = document.querySelector('.detail-progress .progress-meta');
  meta.replaceChildren(el('span', '', isDone ? 'Đã đạt mục tiêu' : `Đạt ${campaign.percent}%`));
  if (campaign.deadline) {
    const deadline = el('span');
    deadline.append(icon('clock'), document.createTextNode(campaign.deadline));
    meta.append(deadline);
  }

  const facts = document.querySelector('.detail-facts');
  [['Đơn vị tổ chức', campaign.organizer], ['Địa bàn', campaign.area], ['Đối tượng hưởng lợi', campaign.beneficiaries]].forEach(([term, value]) => {
    const row = el('div');
    row.append(el('dt', '', term), el('dd', '', value));
    facts.append(row);
  });

  const cta = document.querySelector('.detail-cta');
  cta.dataset.panel = campaign.cta;
  cta.className = `button ${isDone ? 'button-outline' : 'button-primary'} detail-cta`;
  cta.replaceChildren(...(isDone ? [] : [icon('heart-solid')]), document.createTextNode(campaign.cta));

  // ---------- Nội dung chi tiết ----------
  const story = document.querySelector('.detail-story');
  campaign.story.forEach((text) => story.append(el('p', '', text)));
  const uses = document.querySelector('.detail-uses');
  campaign.uses.forEach((text) => uses.append(el('li', '', text)));
  const updates = document.querySelector('.detail-updates');
  campaign.updates.forEach(([date, text]) => {
    const item = el('li');
    item.append(el('time', '', date), el('p', '', text));
    updates.append(item);
  });

  // ---------- Chương trình khác ----------
  const others = document.querySelector('.detail-others');
  Object.entries(campaigns).filter(([key]) => key !== id).slice(0, 3).forEach(([key, item]) => {
    const li = el('li');
    const link = el('a', '', item.title);
    link.href = `chuong-trinh.html?id=${key}`;
    const small = el('span', '', statuses[item.status].label);
    li.append(link, small);
    others.append(li);
  });

  root.hidden = false;
}
