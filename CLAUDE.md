# Quy ước dự án

## Đánh dấu section (bắt buộc)

Mọi section / khối chính trong `index.html`, `styles.css`, `script.js` phải có comment tiêu đề ghi tên section. Khi thêm section mới, thêm tiêu đề tương ứng ở cả 3 file (nếu file đó có code cho section).

- Section cấp 1: `==================== SECTION: TÊN ====================`
- Khối con bên trong: `---------- Tên khối: mô tả ngắn ----------`
- Kết thúc section cấp 1 trong HTML: `==================== END SECTION: TÊN ====================`

Ví dụ:

```html
<!-- ==================== SECTION: HERO ==================== -->
<section class="hero">
  <!-- ---------- Header: logo, menu, nút ủng hộ ---------- -->
  ...
</section>
<!-- ==================== END SECTION: HERO ==================== -->
```

```css
/* ==================== SECTION: HERO ==================== */
/* ---------- Hero content ---------- */
```

```js
// ==================== HEADER: menu mobile ====================
```
