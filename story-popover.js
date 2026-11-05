// ==================== POPUP CÂU CHUYỆN: rê chuột vào nút "Ủng hộ ngay" trên thẻ chương trình ====================
// Dùng chung: trang chủ (4 thẻ) · trang danh sách chương trình · dải "Các chiến dịch khác" trang chi tiết.
// Rê chuột (hoặc Tab tới) nút Ủng hộ ngay của thẻ ảnh tràn viền (.cp-grid-cover .cp-donate) → sau 150 ms hiện popup bên cạnh thẻ
// (phải thẻ, không đủ chỗ thì sang trái): người vận động · 2 đoạn câu chuyện · Xem thêm — cùng kiểu khối câu chuyện
// chương trình nổi bật trang chủ (.spotlight-story). Chuột rời nút và popup → ẩn sau 200 ms (kịp di chuột vào popup để bấm Xem thêm).
// Ẩn khi cuộn, đổi cỡ màn hình, Esc. Màn hình cảm ứng / hẹp (< 1024px) không hiện. Thẻ đã kết thúc (nút Xem kết quả) không hiện.
// Cần: PROGRAMS, programStory, escapeHtml (chuong-trinh-data.js)
(() => {
  const SHOW_DELAY = 150;
  const HIDE_DELAY = 200;
  const GAP = 16;
  const canHover = () => matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
  const BADGE = { person: 'is-blue', org: 'is-green', hctd: 'is-red' };

  // ---------- Khung popup: tạo 1 lần, gắn vào body (thoát khỏi khung cuộn ngang của "Các chiến dịch khác") ----------
  const pop = document.createElement('aside');
  pop.className = 'spotlight-story story-pop';
  pop.id = 'story-pop';
  pop.hidden = true;
  document.body.append(pop);

  let showTimer = 0;
  let hideTimer = 0;
  let current = null; // nút đang gắn popup

  const programOf = (button) => {
    const id = new URL(button.href, location.href).searchParams.get('id');
    return PROGRAMS.find((p) => p.id === id);
  };

  // ---------- Nội dung: người vận động · 2 đoạn câu chuyện · Xem thêm ----------
  const fill = (p, href) => {
    const o = p.owner;
    pop.setAttribute('aria-label', `Câu chuyện: ${p.title}`);
    pop.innerHTML = `
      <div class="pf-pv-org spotlight-owner">
        <img class="spotlight-owner-avatar is-${o.kind}" src="${o.avatar}" alt="" width="48" height="48" />
        <div class="pf-pv-org-text"><p class="pf-pv-cap">Người vận động</p><p class="pf-pv-org-name">${escapeHtml(o.name)}<span class="pf-badge ${BADGE[o.kind] || 'is-blue'}">${escapeHtml(o.group)}</span></p></div>
      </div>
      ${programStory(p).map((s) => `<p>${escapeHtml(s)}</p>`).join('')}
      <a class="spotlight-more" href="${href}">Xem thêm</a>`;
  };

  // ---------- Vị trí: cạnh phải thẻ (đủ chỗ) hoặc cạnh trái; dọc theo mép trên thẻ, giữ trong khung nhìn dưới header ----------
  const place = (card) => {
    const r = card.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
    let left = r.right + GAP;
    let side = 'right';
    if (left + w > innerWidth - 8) { left = r.left - GAP - w; side = 'left'; }
    if (left < 8) { left = Math.max(8, Math.min(innerWidth - w - 8, r.left + (r.width - w) / 2)); side = 'over'; }
    const top = Math.max(headerH + 8, Math.min(innerHeight - h - 8, r.top + (r.height - h) / 2));
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
    pop.dataset.side = side;
  };

  const show = (button) => {
    const p = programOf(button);
    if (!p) return;
    clearTimeout(hideTimer);
    if (current !== button) {
      fill(p, button.getAttribute('href'));
      current = button;
    }
    pop.hidden = false;
    place(button.closest('.cp-card'));
    button.setAttribute('aria-describedby', pop.id);
    requestAnimationFrame(() => pop.classList.add('is-open'));
  };
  const hide = () => {
    clearTimeout(showTimer);
    pop.classList.remove('is-open');
    pop.hidden = true;
    if (current) current.removeAttribute('aria-describedby');
    current = null;
  };
  const scheduleHide = () => { clearTimeout(showTimer); clearTimeout(hideTimer); hideTimer = setTimeout(hide, HIDE_DELAY); };

  const target = (el) => el && el.closest && el.closest('.cp-grid-cover .cp-donate:not(.is-result)');

  // ---------- Chuột: vào nút → hiện; rời nút / popup → ẩn trễ; quay lại popup → giữ ----------
  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse' || !canHover()) return;
    const button = target(event.target);
    if (button) {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      showTimer = setTimeout(() => show(button), current === button ? 0 : SHOW_DELAY);
    } else if (pop.contains(event.target)) {
      clearTimeout(hideTimer);
    }
  });
  document.addEventListener('pointerout', (event) => {
    if (event.pointerType !== 'mouse') return;
    const from = target(event.target) || (pop.contains(event.target) ? pop : null);
    if (!from) return;
    const to = event.relatedTarget;
    if (to && (from.contains(to) || pop.contains(to) || (current && current.contains(to)))) return;
    scheduleHide();
  });

  // ---------- Bàn phím: Tab tới nút → hiện; rời nút (không vào popup) → ẩn; Esc → ẩn, giữ focus ở nút ----------
  document.addEventListener('focusin', (event) => {
    const button = target(event.target);
    if (button && canHover()) { clearTimeout(showTimer); show(button); }
    else if (pop.contains(event.target)) clearTimeout(hideTimer);
  });
  document.addEventListener('focusout', (event) => {
    if (!target(event.target) && !pop.contains(event.target)) return;
    const to = event.relatedTarget;
    if (to && (pop.contains(to) || (current && current.contains(to)))) return;
    scheduleHide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || pop.hidden) return;
    const button = current;
    hide();
    if (button && pop.contains(document.activeElement)) button.focus();
  });
  // Cuộn trang / dải "Các chiến dịch khác" hoặc đổi cỡ màn hình → ẩn (vị trí thẻ đã đổi)
  addEventListener('scroll', () => { if (!pop.hidden) hide(); }, { passive: true, capture: true });
  addEventListener('resize', () => { if (!pop.hidden) hide(); });
})();
