// ==================== TRANG CHI TIẾT TIN TỨC (tin-tuc-chi-tiet.html?id=) ====================
// Bài viết theo ?id= từ dữ liệu chung tin-tuc-data.js (CATEGORIES, IMG, ARTICLES, media, meta, latestCard, otherCard…).
// DỮ LIỆU MINH HỌA — nội dung bài lấy từ Web nội bộ Hội khi có hệ thống chính thức; ở đây dựng theo mẫu của từng chuyên mục.

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

// ==================== TOAST: thông báo ngắn (dùng lại .pf-toast như trang chi tiết chương trình) ====================
const toast = document.querySelector('.pf-toast');
const TOAST_TIME = 2800;
const TOAST_GLYPH = { success: icon('check'), info: 'i', warning: '!', error: '!' };
let toastTimer;
const hideToast = () => { clearTimeout(toastTimer); toast.hidden = true; };
const showToast = (message, type = 'success') => {
  toast.className = `pf-toast is-${type}`;
  toast.querySelector('.pf-toast-icon').innerHTML = TOAST_GLYPH[type];
  toast.querySelector('.pf-toast-text').textContent = message;
  toast.style.setProperty('--toast-time', `${TOAST_TIME}ms`);
  const ring = toast.querySelector('.pf-toast-ring circle');
  ring.style.animation = 'none'; void ring.getBoundingClientRect(); ring.style.animation = '';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, TOAST_TIME);
};
toast.querySelector('.pf-toast-close').addEventListener('click', hideToast);

// ==================== NỘI DUNG BÀI (minh họa) ====================
// Mỗi chuyên mục 1 mẫu: đoạn văn (p) · tiêu đề nhỏ (h2) · trích dẫn (quote: [lời, người nói]) · ảnh trong bài (img: ảnh bài khác cùng chuyên mục)
const BODY = {
  'noi-bat': [
    ['p', 'Hoạt động nằm trong kế hoạch công tác năm 2026 của Hội Chữ thập đỏ Việt Nam, được triển khai đồng bộ từ Trung ương đến cơ sở với sự phối hợp của chính quyền địa phương, các cơ quan, đơn vị và đông đảo tình nguyện viên.'],
    ['h2', 'Triển khai nhanh, đúng đối tượng'],
    ['p', 'Ngay từ khâu chuẩn bị, các cấp Hội đã rà soát danh sách, khảo sát nhu cầu thực tế để nguồn lực đến đúng người, đúng nơi. Mọi khoản hỗ trợ đều được ghi nhận và công khai trên nền tảng để người dân, nhà hảo tâm cùng theo dõi.'],
    ['quote', ['Mỗi hoạt động của Hội đều hướng tới mục tiêu không để ai bị bỏ lại phía sau, nhất là những người yếu thế, gặp hoàn cảnh khó khăn.', 'Đại diện Trung ương Hội Chữ thập đỏ Việt Nam']],
    ['img'],
    ['h2', 'Lan tỏa tinh thần nhân đạo'],
    ['p', 'Thời gian tới, Hội tiếp tục duy trì các hoạt động thường xuyên, mở rộng mạng lưới tình nguyện viên và kêu gọi sự đồng hành của cộng đồng để lan tỏa tinh thần “Vì mọi người, ở mọi nơi”.'],
  ],
  'chien-dich': [
    ['p', 'Chiến dịch được Hội Chữ thập đỏ Việt Nam phát động trên toàn quốc, huy động nguồn lực từ các cấp Hội, doanh nghiệp, nhà hảo tâm và cộng đồng. Toàn bộ khoản ủng hộ được tiếp nhận qua tài khoản chính thức của Hội và công khai trên nền tảng.'],
    ['h2', 'Nguồn lực đến tận tay người dân'],
    ['p', 'Các đoàn công tác phối hợp cùng chính quyền địa phương rà soát danh sách, trao hỗ trợ trực tiếp tại thôn, bản và điểm trường. Mỗi suất hỗ trợ đều được xác nhận, cập nhật tiến độ để người ủng hộ theo dõi.'],
    ['quote', ['Sự chung tay của cộng đồng giúp chiến dịch đến được với những nơi khó khăn nhất, ngay khi người dân cần.', 'Ban điều hành chiến dịch']],
    ['img'],
    ['h2', 'Tiếp tục nhận ủng hộ'],
    ['p', 'Chiến dịch vẫn đang tiếp nhận ủng hộ. Người dân có thể đóng góp qua mục Ủng hộ trên nền tảng, theo dõi kết quả và sao kê công khai của từng chương trình.'],
  ],
  'nguoi-tot': [
    ['p', 'Câu chuyện là một trong nhiều tấm gương người tốt, việc thiện được các cấp Hội ghi nhận trong năm 2026. Những việc làm thầm lặng, bền bỉ ấy đã góp phần lan tỏa tinh thần sẻ chia trong cộng đồng.'],
    ['h2', 'Bền bỉ với việc thiện'],
    ['p', 'Không ồn ào, không cần được nhắc tên, họ vẫn đều đặn dành thời gian, công sức để giúp đỡ người khó khăn quanh mình. Với nhiều người được giúp đỡ, đó là chỗ dựa để vượt qua lúc khó khăn nhất.'],
    ['quote', ['Tôi chỉ làm những việc nhỏ trong khả năng của mình. Thấy mọi người bớt khó khăn hơn là tôi vui rồi.', 'Nhân vật trong bài']],
    ['img'],
    ['h2', 'Lan tỏa trong cộng đồng'],
    ['p', 'Hội Chữ thập đỏ Việt Nam mong muốn những câu chuyện như thế này được chia sẻ rộng rãi, để mỗi người cùng góp một phần nhỏ, làm nên những điều tốt đẹp.'],
  ],
  'doi-tac': [
    ['p', 'Hoạt động là kết quả hợp tác giữa Hội Chữ thập đỏ Việt Nam và các đơn vị đồng hành, hướng tới hỗ trợ thiết thực, lâu dài cho người dân có hoàn cảnh khó khăn.'],
    ['h2', 'Hợp tác minh bạch, hiệu quả'],
    ['p', 'Các bên thống nhất nội dung, đối tượng và tiến độ thực hiện; mọi khoản đóng góp được tiếp nhận, phân bổ và công khai trên nền tảng để đối tác cùng theo dõi kết quả.'],
    ['quote', ['Chúng tôi tin rằng doanh nghiệp phát triển bền vững khi cùng cộng đồng vượt qua khó khăn.', 'Đại diện đơn vị đồng hành']],
    ['img'],
    ['h2', 'Mở rộng đồng hành'],
    ['p', 'Hội Chữ thập đỏ Việt Nam trân trọng sự đồng hành của các doanh nghiệp, tổ chức và mong tiếp tục mở rộng hợp tác trong các chương trình nhân đạo thời gian tới.'],
  ],
};
// Tác giả / nguồn bài (minh họa)
const AUTHOR = 'Ban Truyền thông – Trung ương Hội Chữ thập đỏ Việt Nam';

// ==================== DỰNG TRANG ====================
const fullDate = (at) => `${viDate(at)} ${at.slice(11, 16)}`;
const views = (n) => `${n.toLocaleString('vi-VN')} lượt xem`;
const shareUrl = () => location.href;

// ---------- Nút chia sẻ: Facebook (mở tab mới) · sao chép liên kết (TB: "Đã sao chép liên kết bài viết") ----------
const shareButtons = () => `
  <div class="nw-share" role="group" aria-label="Chia sẻ bài viết">
    <a class="pf-icon-btn nw-share-btn is-brand" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}" target="_blank" rel="noopener" aria-label="Chia sẻ lên Facebook" title="Chia sẻ lên Facebook">${icon('facebook-logo')}</a>
    <button class="pf-icon-btn nw-share-btn is-brand" type="button" data-share-zalo aria-label="Chia sẻ qua Zalo" title="Chia sẻ qua Zalo"><img class="icon" src="Emages/Icon_of_Zalo.svg.webp" alt="" width="24" height="24" decoding="async" /></button>
    <button class="pf-icon-btn nw-share-btn" type="button" data-copy-link aria-label="Sao chép liên kết" title="Sao chép liên kết">${icon('copy')}</button>
  </div>`;

// ---------- Ảnh trong bài: ảnh bài khác cùng chuyên mục (khác ảnh đầu bài) ----------
const innerImage = (a) => {
  const other = ARTICLES.find((b) => b.cat === a.cat && b.img !== a.img) || a;
  return `<figure class="nw-article-figure"><div class="media media-photo nw-article-media is-inner" style="--focus:${other.focus}"><img src="${imgSrc(other.img)}" alt="${escapeHtml(other.alt)}" loading="lazy" decoding="async" /></div><figcaption>${escapeHtml(other.alt)}. Ảnh: Hội Chữ thập đỏ Việt Nam</figcaption></figure>`;
};
const bodyHtml = (a) => BODY[a.cat].map(([tag, v]) => {
  if (tag === 'p') return `<p>${escapeHtml(v)}</p>`;
  if (tag === 'h2') return `<h2>${escapeHtml(v)}</h2>`;
  if (tag === 'quote') return `<blockquote class="nw-quote"><p>“${escapeHtml(v[0])}”</p><cite>— ${escapeHtml(v[1])}</cite></blockquote>`;
  return innerImage(a);
}).join('');

// ---------- Bài viết: tiêu đề (24/32, không nhãn chuyên mục — chuyên mục đã có ở breadcrumb) · ngày giờ | N phút trước | lượt xem · chia sẻ · sapo · ảnh đầu bài · nội dung · tác giả (cuối bài không có Quay lại / Chia sẻ — chia sẻ chỉ ở đầu bài) ----------
const articleHtml = (a) => `
  <header class="nw-article-head">
    <h1 class="nw-article-title" id="nw-article-title">${escapeHtml(a.title)}</h1>
    <div class="nw-article-bar">
      <p class="nw-meta">${icon('clock')}<time datetime="${a.at.replace(' ', 'T')}">${fullDate(a.at)}</time><span aria-hidden="true">|</span><span>${a.read} phút trước</span><span aria-hidden="true">|</span><span>${views(a.views)}</span></p>
      ${shareButtons()}
    </div>
  </header>
  <p class="nw-article-lead">${escapeHtml(a.desc)}</p>
  <figure class="nw-article-figure">
    ${media(a, 'nw-article-media', true)}
    <figcaption>${escapeHtml(a.alt)}. Ảnh: Hội Chữ thập đỏ Việt Nam</figcaption>
  </figure>
  <div class="nw-article-body">${bodyHtml(a)}</div>
  <p class="nw-article-author">${escapeHtml(AUTHOR)}</p>`;

const id = Number(new URLSearchParams(location.search).get('id'));
const article = ARTICLES.find((a) => a.id === id);
if (!article) {
  // Không có bài (id sai / đã gỡ): ẩn bài, hiện thông báo + link về Tin tức
  $('#nw-missing').hidden = false;
  $('#nw-crumb-cat').textContent = 'Không tìm thấy bài viết';
  document.title = 'Không tìm thấy bài viết | Hội Chữ thập đỏ Việt Nam';
} else {
  document.title = `${article.title} | Hội Chữ thập đỏ Việt Nam`;
  // Breadcrumb: mục cuối = chuyên mục của bài, bấm được → Tin tức lọc chuyên mục
  const crumb = $('#nw-crumb-cat');
  crumb.outerHTML = `<a href="tin-tuc.html?chuyen-muc=${article.cat}">${escapeHtml(CATEGORIES[article.cat])}</a>`;
  $('#nw-article').innerHTML = articleHtml(article);
  // Cột phải: Tin liên quan — 6 bài mới nhất cùng chuyên mục (trừ bài đang xem); thiếu thì bù bài mới nhất chuyên mục khác
  const rest = [...ARTICLES.filter((a) => a !== article)].sort(byNewest);
  const sameCat = rest.filter((a) => a.cat === article.cat);
  const sideRelated = [...sameCat, ...rest.filter((a) => a.cat !== article.cat)].slice(0, 6);
  $('#nw-side-related').innerHTML = sideRelated.map(latestCard).join('');
  $('#nw-side-related-more').href = `tin-tuc-danh-sach.html?chuyen-muc=${article.cat}`; // Xem thêm → Danh sách tin tức chọn sẵn chuyên mục của bài
  // Tin mới nhất (cuối trang): 4 bài mới nhất, không trùng bài đang xem + Tin liên quan; không có bài → ẩn khối
  const latest = rest.filter((a) => !sideRelated.includes(a)).slice(0, 4);
  $('#nw-related').innerHTML = latest.map(otherCard).join('');
  $('#nw-related-section').hidden = !latest.length;
  $('#nw-detail').hidden = false;
}

// ==================== CHIA SẺ: sao chép liên kết bài viết ====================
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
document.addEventListener('click', async (event) => {
  if (!event.target.closest('[data-copy-link]')) return;
  const ok = await copyText(shareUrl());
  showToast(ok ? 'Đã sao chép liên kết bài viết.' : `Không sao chép được. Liên kết: ${shareUrl()}`, ok ? 'success' : 'error');
});

// ---------- Chia sẻ qua Zalo: điện thoại → bảng chia sẻ của máy (chọn Zalo); máy tính → sao chép liên kết để dán vào Zalo ----------
// Nút chia sẻ chính thức của Zalo (Zalo Social Plugin) cần mã Zalo OA của Hội — thay khi có mã.
document.addEventListener('click', async (event) => {
  if (!event.target.closest('[data-share-zalo]')) return;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ title: document.title, url: shareUrl() }); } catch (error) { /* người dùng đóng bảng chia sẻ */ }
    return;
  }
  const ok = await copyText(shareUrl());
  showToast(ok ? 'Đã sao chép liên kết. Mở Zalo và dán vào cuộc trò chuyện để chia sẻ.' : `Không sao chép được. Liên kết: ${shareUrl()}`, ok ? 'success' : 'error');
});
