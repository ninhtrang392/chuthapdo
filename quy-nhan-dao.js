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
const dialog = document.querySelector('.info-dialog:not(.qnd-rule-dialog)');
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
  button.addEventListener('click', () => button.closest('dialog').close());
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

// ==================== QUY CHẾ VẬN HÀNH: "Xem chi tiết" → popup nội dung từng mục ====================
// Nội dung theo Điều lệ Quỹ Nhân đạo Việt Nam (lấy từ bản Quỹ nhân đạo trước: quy-nhan-dao/assets).
// Mỗi mục: mảng khối — khối 1 chuỗi = đoạn văn; khối nhiều chuỗi = danh sách a), b), c)…
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

const ruleDialog = document.querySelector('.qnd-rule-dialog');
if (ruleDialog) {
  const kicker = ruleDialog.querySelector('[data-qnd-rule-kicker]');
  const ruleTitle = ruleDialog.querySelector('#qnd-rule-title');
  const body = ruleDialog.querySelector('[data-qnd-rule-body]');
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
  document.querySelectorAll('[data-qnd-rule]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const rule = QND_RULES[link.dataset.qndRule];
      if (!rule) return;
      event.preventDefault();
      kicker.textContent = `Quy chế vận hành · ${link.dataset.qndRule}`;
      ruleTitle.textContent = rule.title;
      body.replaceChildren(...rule.content.map(block));
      body.scrollTop = 0;
      ruleDialog.showModal();
    });
  });
  // Bấm ra nền mờ ngoài khung → đóng
  ruleDialog.addEventListener('click', (event) => { if (event.target === ruleDialog) ruleDialog.close(); });
}
