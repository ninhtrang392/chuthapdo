/* Member editor: stable leader identity, grouped rows and local Excel import. */
function createTeamMembers(root, countInput) {
  const fields = [
    ['name', 'Họ và tên', null, true], ['role', 'Chức vụ', ['Phó Chủ nhiệm', 'Thành viên'], true],
    ['gender', 'Giới tính', ['Nam', 'Nữ'], true], ['year', 'Năm sinh', null, true],
    ['identity', 'Số định danh cá nhân', null, true], ['phone', 'Điện thoại', null, true],
    ['blood', 'Nhóm máu', ['A', 'B', 'AB', 'O', 'Chưa rõ'], true],
    ['address', 'Địa chỉ'], ['education', 'Văn hóa', ['5/12', '9/12', '12/12', 'Khác']],
    ['qualification', 'Chuyên môn', ['Sơ cấp', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Sau đại học', 'Khác']],
    ['activity', 'Lĩnh vực hoạt động', ['Hiến máu', 'Sơ cấp cứu', 'Cứu hộ cứu nạn', 'Bếp ăn, Cơm cháo miễn phí', 'Cứu trợ xã hội và trợ giúp nhân đạo', 'Hiến mô, tạng', 'Công nghệ thông tin', 'Khám chữa bệnh', 'Khác']],
    ['skills', 'Kỹ năng']
  ];
  const skills = ['Sơ cấp cứu', 'Vận chuyển bệnh nhân', 'Khám, chữa bệnh', 'Truyền thông', 'Hướng dẫn kỹ thuật sinh kế', 'Viết tin bài', 'Xây dựng trạm xá lưu động'];
  let nextId = 1;
  const blank = (role = 'Thành viên') => ({ id: nextId++, role, skills: [], ...Object.fromEntries(fields.filter(([k]) => !['role', 'skills'].includes(k)).map(([k]) => [k, ''])) });
  const leader = { ...blank('Chủ nhiệm'), leader: true, phone: document.querySelector('#tm-phone').value };
  let members = [leader];
  let checked = new Set();
  let reviewed = false;
  let multis = [];
  document.addEventListener('click', event => multis.forEach(m => { if (!event.composedPath().includes(m.root)) m.setOpen(false); }));
  root.addEventListener('keydown', event => { if (event.key === 'Escape') { const open = multis.find(m => m.isOpen()); if (open) { event.stopPropagation(); open.setOpen(false, true); } } });
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  // iconId: icon trong sprite ho-so.html, đứng trước chữ
  const button = (text, fn, cls = 'pf-btn pf-btn-ghost pf-btn-sm', iconId) => { const b = el('button', cls); if (iconId) b.innerHTML = icon(iconId); if (text) b.append(text); b.type = 'button'; b.addEventListener('click', fn); return b; };
  // Thanh tiêu đề phần chứa bảng (ho-so.html "3. Danh sách…"): tổng số "(N)" cạnh tiêu đề, 2 nút Excel bên phải cùng dòng
  const sectionHead = root.closest('.pf-reg-section').querySelector('.pf-reg-section-head');
  const total = el('span', 'tm-title-count'); sectionHead.querySelector('h3').append(' ', total);
  const actions = el('div', 'pf-reg-list-actions');
  const file = el('input'); file.type = 'file'; file.accept = '.xlsx,.xls'; file.hidden = true;
  const status = el('p', 'pf-hint tm-notice'); status.hidden = true; status.setAttribute('role', 'status');
  const errors = el('div', 'pf-error tm-notice'); errors.hidden = true; errors.setAttribute('aria-live', 'polite');
  // Chọn tất cả + Xóa đã chọn: nằm trong từng bảng (Ban chủ nhiệm / Thành viên), xem render()
  const groupChecks = [];
  actions.append(button('Tải file Excel mẫu', downloadTemplate, undefined, 'download'), button('Nhập từ Excel', () => file.click(), undefined, 'upload'), file);
  sectionHead.append(actions); root.append(status, errors);
  const groups = el('div'); root.append(groups);
  function stats() {
    total.textContent = `(${members.length})`;
    countInput.value = members.length;
    // Ô chọn tất cả của từng bảng: tích khi mọi dòng chọn được trong nhóm đã tích; gạch ngang khi tích một phần
    // Nút Xóa đã chọn của bảng: chỉ hiện khi bảng đó có từ 2 dòng được tích (1 dòng thì dùng nút xóa cuối dòng), kèm số dòng
    groupChecks.forEach(({ input, ids, remove }) => {
      const n = ids.filter(id => checked.has(id)).length;
      input.disabled = !ids.length; input.checked = ids.length > 0 && n === ids.length; input.indeterminate = n > 0 && n < ids.length;
      remove.hidden = n < 2; remove.querySelector('span').textContent = `Xóa đã chọn (${n})`;
    });
  }
  // placeholder = false: ô ở dòng chính, nhãn đã có ở đầu bảng
  // placeholder = true: ô ở dòng chi tiết, không có nhãn — tên trường hiện làm placeholder (ô chọn: tùy chọn rỗng mang tên trường, chữ xám)
  function control(member, key, label, options, required, placeholder = true) {
    const box = el('label', 'tm-field');
    let input;
    if (options && !(member.leader && key === 'role')) {
      input = el('select', 'pf-cell-input');
      input.add(new Option(placeholder ? label : 'Chọn', ''));
      options.forEach(value => input.add(new Option(value, value)));
      if (member[key] && !options.includes(member[key])) input.add(new Option(member[key], member[key]));
    } else {
      input = el('input', 'pf-cell-input'); input.type = key === 'phone' ? 'tel' : 'text';
      if (['year', 'identity', 'phone'].includes(key)) { input.inputMode = 'numeric'; input.maxLength = { year: 4, identity: 12, phone: 10 }[key]; }
      if (placeholder) input.placeholder = label;
    }
    input.value = member[key] || ''; input.dataset.key = key; input.setAttribute('aria-label', label);
    if (placeholder && input.tagName === 'SELECT') { const empty = () => input.classList.toggle('is-empty', !input.value); empty(); input.addEventListener('change', empty); }
    if (member.leader && ['name', 'role', 'gender', 'year', 'identity'].includes(key)) { if (input.tagName === 'SELECT') input.disabled = true; else input.readOnly = true; }
    input.addEventListener('input', () => {
      if (['year', 'identity', 'phone'].includes(key)) input.value = input.value.replace(/\D/g, '');
      member[key] = input.value;
      if (reviewed) validate();
    });
    if (key === 'role') input.addEventListener('change', () => { member.role = input.value; render(); });
    if (input.tagName === 'SELECT') { const wrap = el('span', 'pf-cell-select'); wrap.append(input); wrap.insertAdjacentHTML('beforeend', icon('chevron-down')); box.append(wrap); }
    else box.append(input);
    return box;
  }
  function skillControl(member) {
    const box = el('div', 'pf-field tm-field');
    // data-one-line: thẻ kỹ năng chỉ 1 dòng, tràn thì "+N" — bấm mở khung xem đủ (dùng chung bộ chọn nhiều của ho-so.js)
    const multi = el('div', 'pf-multi'); multi.dataset.placeholder = 'Thêm kỹ năng'; multi.dataset.oneLine = '';
    multi.innerHTML = '<div class="pf-multi-box"><span class="pf-multi-chips"></span><button class="pf-multi-toggle" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Thêm kỹ năng">' + icon('chevron-down') + '</button></div>';
    const list = el('ul', 'pf-multi-list'); list.hidden = true; list.setAttribute('role', 'listbox'); list.setAttribute('aria-multiselectable', 'true'); list.setAttribute('aria-label', 'Kỹ năng');
    [...new Set([...skills, ...member.skills])].forEach(skill => { const option = el('li', '', skill); option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(member.skills.includes(skill))); list.append(option); });
    multi.append(list); box.append(multi);
    const instance = setupMulti(multi, 1000 + member.id); multis.push(instance);
    const sync = () => { member.skills = instance.selected().map(o => o.textContent); };
    multi.addEventListener('click', sync); multi.addEventListener('keydown', sync);
    return box;
  }
  function render() {
    multis = []; groups.replaceChildren(); groupChecks.length = 0;
    [['I. Ban chủ nhiệm', true], ['II. Thành viên', false]].forEach(([title, board]) => {
      const section = el('section', 'tm-group');
      const rows = members.filter(m => (m.role !== 'Thành viên') === board);
      // Dòng chọn được của bảng (không tính Chủ nhiệm — không xóa được)
      const ids = rows.filter(m => !m.leader).map(m => m.id);
      // Tiêu đề bảng kèm số người của nhóm "(N)"
      const heading = el('h4', 'pf-reg-list-title', title + ' '); heading.append(el('span', 'tm-title-count', `(${rows.length})`));
      const head = el('div', 'pf-reg-list-head'); head.append(heading);
      // Nút bảng: Xóa đã chọn (chỉ hiện khi tích từ 2 dòng) · Thêm thành viên — như các bảng nhập theo dòng khác
      const headActions = el('div', 'pf-reg-list-actions');
      // Xóa đã chọn: hỏi xác nhận trước (hộp xác nhận dùng chung của ho-so.js), đồng ý mới xóa
      const remove = button('', async () => {
        const n = ids.filter(id => checked.has(id)).length;
        const ask = window.confirmAction || (() => Promise.resolve(true));
        if (!(await ask({ title: 'Xóa thành viên đã chọn', text: `Bạn có chắc chắn muốn xóa ${n} thành viên đã chọn khỏi danh sách ${board ? 'Ban chủ nhiệm' : 'Thành viên'}?`, ok: 'Xóa' }))) return;
        members = members.filter(m => !(ids.includes(m.id) && checked.has(m.id))); ids.forEach(id => checked.delete(id)); render();
      }, 'pf-btn pf-btn-ghost pf-btn-sm is-danger');
      remove.innerHTML = icon('trash') + '<span>Xóa đã chọn (0)</span>'; remove.hidden = true;
      headActions.append(remove, button(board ? 'Thêm thành viên ban chủ nhiệm' : 'Thêm thành viên', () => {
        const m = blank(board ? 'Phó Chủ nhiệm' : 'Thành viên'); members.push(m); render(); groups.querySelector('[data-member-id="' + m.id + '"] input[data-key="name"]').focus();
      }, 'pf-btn pf-btn-green pf-btn-sm', 'plus'));
      head.append(headActions);
      section.append(head);
      const scroll = el('div', 'pf-reg-list-scroll'); const table = el('table', 'pf-reg-table tm-table'); table.setAttribute('aria-label', title); scroll.append(table); section.append(scroll);
      // Đầu bảng: nhãn 7 trường chính chỉ hiện 1 lần (ô ở dòng chính không lặp nhãn)
      if (rows.length) {
        const thead = el('thead'); const hr = el('tr');
        // Ô chọn tất cả của bảng
        const checkHead = el('th', 'pf-col-check');
        const checkAll = el('input', 'pf-check'); checkAll.type = 'checkbox'; checkAll.setAttribute('aria-label', 'Chọn tất cả ' + title);
        checkAll.addEventListener('change', () => { ids.forEach(id => (checkAll.checked ? checked.add(id) : checked.delete(id))); render(); });
        checkHead.append(checkAll); groupChecks.push({ input: checkAll, ids, remove });
        hr.append(checkHead, el('th', 'pf-col-index', 'STT'));
        fields.slice(0, 7).forEach(([, label, , required]) => { const th = el('th', '', label); if (required) th.append(el('span', 'pf-req', '*')); hr.append(th); });
        hr.append(el('th', 'pf-col-del'));
        thead.append(hr); table.append(thead);
      }
      rows.forEach((member, index) => {
        const body = el('tbody'); body.dataset.memberId = member.id;
        const top = el('tr', 'tm-main'); const bottom = el('tr', 'tm-detail');
        const checkCell = el('td', 'pf-col-check');
        // Chủ nhiệm: ô tích hiển thị cho đồng bộ nhưng khóa (lấy từ mục 1, không xóa được)
        if (member.leader) { const lock = el('input', 'pf-check'); lock.type = 'checkbox'; lock.disabled = true; lock.title = 'Chủ nhiệm lấy từ mục 1, không xóa được'; lock.setAttribute('aria-label', lock.title); checkCell.append(lock); }
        if (!member.leader) { const check = el('input', 'pf-check'); check.type = 'checkbox'; check.checked = checked.has(member.id); check.setAttribute('aria-label', 'Chọn ' + title + ' dòng ' + (index + 1)); check.addEventListener('change', () => { check.checked ? checked.add(member.id) : checked.delete(member.id); body.querySelectorAll('tr').forEach(r => r.classList.toggle('is-selected', check.checked)); stats(); }); checkCell.append(check); }
        // Ô chọn + STT trải 2 dòng (dòng chính + dòng chi tiết) để căn giữa theo cả khối
        const number = el('td', 'pf-col-index', String(index + 1)); checkCell.rowSpan = 2; number.rowSpan = 2; top.append(checkCell, number);
        fields.slice(0, 7).forEach(f => { const td = el('td'); td.append(control(member, f[0], f[1], f[2], f[3], false)); top.append(td); });
        // Cột cuối: nút xóa (Chủ nhiệm: khóa) — trải 2 dòng như ô chọn + STT để căn giữa theo cả khối
        const tail = el('td', 'pf-col-del tm-col-actions'); tail.rowSpan = 2;
        const tailWrap = el('div', 'tm-actions');
        // Chủ nhiệm lấy từ mục 1: icon xóa hiển thị cho đồng bộ nhưng không bấm được
        if (member.leader) { const del = button('', () => {}, 'pf-icon-btn'); del.innerHTML = icon('trash'); del.disabled = true; del.title = 'Chủ nhiệm lấy từ mục 1, không xóa được'; del.setAttribute('aria-label', del.title); tailWrap.append(del); }
        else { const del = button('', () => { members = members.filter(m => m.id !== member.id); checked.delete(member.id); render(); }, 'pf-icon-btn'); del.innerHTML = icon('trash'); del.setAttribute('aria-label', 'Xóa ' + title + ' dòng ' + (index + 1)); tailWrap.append(del); }
        tail.append(tailWrap); top.append(tail);
        // Dòng chi tiết luôn hiện, ô thẳng theo cột dòng chính: Địa chỉ (Họ và tên) · Văn hóa (Chức vụ) · Chuyên môn (Giới tính)
        // · Lĩnh vực (Năm sinh + Số định danh) · Kỹ năng (Điện thoại + Nhóm máu); cột xóa đã trải từ dòng chính
        const [address, education, qualification, activity] = fields.slice(7, 11);
        const detailCell = (span, ...nodes) => { const td = el('td', 'tm-detail-cell'); td.colSpan = span; td.append(...nodes); bottom.append(td); };
        detailCell(1, control(member, ...address)); detailCell(1, control(member, ...education)); detailCell(1, control(member, ...qualification));
        detailCell(2, control(member, ...activity)); detailCell(2, skillControl(member));
        top.classList.toggle('is-selected', checked.has(member.id)); bottom.classList.toggle('is-selected', checked.has(member.id));
        body.append(top, bottom); table.append(body);
      });
      if (!rows.length) section.append(el('p', 'pf-reg-list-empty', 'Chưa có thành viên. Bấm “Thêm thành viên” để thêm dòng.'));
      groups.append(section);
    });
    stats(); if (reviewed) validate();
    multis.forEach(m => m.refit());
  }
  // Ô kỹ năng được dựng khi bảng còn ẩn (drawer đóng) nên chưa đo được: đo lại "+N" khi bảng hiện ra / đổi bề ngang
  new ResizeObserver(() => multis.forEach(m => m.refit())).observe(groups);
  function validate() {
    reviewed = true;
    const issues = []; const ids = new Map();
    members.forEach(m => { if (m.identity) ids.set(m.identity, (ids.get(m.identity) || 0) + 1); });
    groups.querySelectorAll('[data-key]').forEach(input => { input.classList.remove('is-invalid'); input.removeAttribute('aria-invalid'); input.removeAttribute('title'); });
    groups.querySelectorAll('.tm-field > .pf-field-error').forEach(help => help.remove());
    const yearNow = new Date().getFullYear();
    members.forEach(m => {
      const sameGroup = members.filter(n => (n.role !== 'Thành viên') === (m.role !== 'Thành viên'));
      const prefix = `${m.role === 'Thành viên' ? 'Thành viên' : 'Ban chủ nhiệm'}, dòng ${sameGroup.indexOf(m) + 1}`;
      const bad = (key, message) => {
        const input = groups.querySelector(`[data-member-id="${m.id}"] [data-key="${key}"]`);
        if (input) {
          input.classList.add('is-invalid'); input.setAttribute('aria-invalid', 'true'); input.title = message;
          // Helper lỗi ngay dưới ô (như ô biểu mẫu): icon alert + câu báo; mỗi ô 1 câu (câu đầu tiên)
          const box = input.closest('.tm-field');
          if (box && !box.querySelector(':scope > .pf-field-error')) { const help = el('p', 'pf-field-error'); help.innerHTML = icon('alert') + '<span></span>'; help.lastChild.textContent = message; box.append(help); }
        }
        issues.push(`${prefix}: ${message}`);
      };
      fields.forEach(([key, label, options, required]) => {
        const value = String(m[key] || '').trim();
        if (required && !value) bad(key, `Vui lòng ${options && !(m.leader && key === 'role') ? 'chọn' : 'nhập'} ${label.toLowerCase()}.`);
        else if (value && options && !(m.leader && key === 'role') && !options.includes(value)) bad(key, `${label} không hợp lệ.`);
      });
      if (m.identity && !/^\d{12}$/.test(m.identity)) bad('identity', 'Số định danh cá nhân phải có đúng 12 chữ số.');
      if (m.identity && ids.get(m.identity) > 1) bad('identity', 'Số định danh cá nhân bị trùng trong danh sách.');
      if (m.phone && !/^0\d{9}$/.test(m.phone)) bad('phone', 'Điện thoại phải có 10 chữ số, bắt đầu bằng 0.');
      if (m.year && (!/^\d{4}$/.test(m.year) || Number(m.year) < 1900 || Number(m.year) > yearNow)) bad('year', `Năm sinh phải từ 1900 đến ${yearNow}.`);
    });
    errors.replaceChildren(); errors.hidden = !issues.length;
    if (issues.length) { errors.append(el('strong', '', `Còn ${issues.length} lỗi cần sửa trước khi tiếp tục:`)); const list = el('ul'); issues.forEach(issue => list.append(el('li', '', issue))); errors.append(list); }
    root.classList.toggle('is-invalid', !!issues.length); return !issues.length;
  }
  function requireExcel() { if (window.XLSX) return true; status.hidden = false; status.textContent = 'Không tải được công cụ Excel. Vui lòng tải lại trang.'; return false; }
  function downloadTemplate() {
    if (!requireExcel()) return;
    const ws = XLSX.utils.aoa_to_sheet([fields.map(([, label]) => label)]);
    ws['!cols'] = fields.map(() => ({ wch: 26 }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Thanh vien');
    const help = [['Hướng dẫn'], ['Điền dữ liệu từ dòng 2 của sheet Thanh vien. Các cột có sẵn phải giữ nguyên.'], ['Không nhập Chủ nhiệm: người này được đồng bộ từ mục 1. Chức vụ: Phó Chủ nhiệm hoặc Thành viên.'], ['Họ tên, chức vụ, giới tính, năm sinh, số định danh, điện thoại, nhóm máu là bắt buộc.'], ['Đặt định dạng Text cho số định danh và điện thoại để giữ số 0 đầu.'], ['Nhiều kỹ năng ngăn cách bằng dấu chấm phẩy (;).'], ['Nhập Excel sẽ thêm vào danh sách hiện tại; lỗi sẽ được đánh dấu để sửa.']];
    const guide = XLSX.utils.aoa_to_sheet(help); guide['!cols'] = [{ wch: 110 }]; XLSX.utils.book_append_sheet(wb, guide, 'Huong dan');
    XLSX.writeFile(wb, 'mau-thanh-vien-doi-clb.xlsx');
  }
  file.addEventListener('change', async () => {
    const selected = file.files[0]; file.value = ''; if (!selected || !requireExcel()) return;
    try {
      if (!/\.(xlsx|xls)$/i.test(selected.name) || selected.size > 5 * 1024 * 1024) throw new Error('Chọn file Excel .xlsx/.xls tối đa 5 MB.');
      const wb = XLSX.read(await selected.arrayBuffer(), { type: 'array' });
      const sheet = wb.Sheets['Thanh vien'] || wb.Sheets[wb.SheetNames[0]];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      if (range.e.r > 1000 || range.e.c > 50) throw new Error('File vượt giới hạn 1.000 dòng hoặc 51 cột.');
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
      const header = (data.shift() || []).map(v => String(v).trim());
      if (!fields.every(([, label]) => header.includes(label))) throw new Error('File thiếu cột. Vui lòng dùng file Excel mẫu.');
      const incoming = data.filter(row => row.some(value => String(value).trim())).map(row => {
        const m = blank(); fields.forEach(([key, label]) => { const value = String(row[header.indexOf(label)] ?? '').trim(); m[key] = key === 'skills' ? [...new Set(value.split(';').map(s => s.trim()).filter(Boolean))] : value; }); return m;
      });
      if (!incoming.length) throw new Error('File chưa có thành viên nào.');
      if (incoming.some(m => m.role === 'Chủ nhiệm')) throw new Error('Chủ nhiệm được lấy từ mục 1. Vui lòng bỏ dòng Chủ nhiệm khỏi file Excel.');
      if (members.length + incoming.length > 1000) throw new Error('Danh sách tối đa 1.000 người.');
      members.push(...incoming); reviewed = true; render();
      status.textContent = `Đã nhập ${incoming.length} dòng từ file “${selected.name}”. Kiểm tra các lỗi bên dưới nếu có.`;
    } catch (error) { status.textContent = `Không nhập được: ${error.message}`; }
    status.hidden = false;
  });
  render();
  // data(): bản sao danh sách thành viên (dùng cho phiếu xem trước PDF)
  return { validate, syncLeader(values) { Object.assign(leader, values); render(); }, data: () => members.map(m => ({ ...m, skills: [...m.skills] })) };
}
