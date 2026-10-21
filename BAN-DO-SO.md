# Bản đồ số – Đơn vị, con người

Triển khai giao diện UC-BD-01–08 theo tài liệu “2. Đặc tả chức năng-05-Bản đồ số_Đơn vị, con người.docx.pdf”. Mở `ban-do-so.html` qua Live Server của dự án (cổng 5501).

## Giao diện và mã nguồn

- Giữ header/footer, font Be Vietnam Pro, màu chủ đạo, SVG sprite và UI kit `pf-input`, `pf-field`, `pf-badge`, `pf-tag`, `button` của `styles.css`.
- Bố cục giữ dạng 3 cột của bản cũ: các class `map-page`, `map-toolbar`, `map-dashboard`, `md-panel`, `md-map`, `md-layer`, `md-switch` và `md-panel-toggle` có sẵn trong `styles.css`. Cột trái là "Lớp bản đồ", chia 5 nhóm: Tổ chức hội · Con người · Hạ tầng hỗ trợ · Hạ tầng nhân đạo · Chương trình. Mỗi lớp có biểu tượng (màu lớp khi bật, xám khi tắt; dòng đang bật không có nền), tên lớp, số bản ghi và công tắc; danh sách nhóm nằm ở `LAYER_GROUPS` trong `ban-do-so.js`. Bấm tiêu đề nhóm (có mũi tên) để thu gọn hoặc mở nhóm đó. Thanh tab nằm ở góc trên bên trái khung bản đồ (kiểu nút nhóm `md-basemap` của bản cũ) và đổi nội dung cột Lớp bản đồ; bấm tab khi cột đang thu gọn sẽ mở lại cột. Có 3 tab: Tổng quan (các lớp kể trên) · Nguồn lực (công tắc Điều phối nguồn lực, lọc Loại nguồn lực và Tình trạng; vùng màu theo mức cân đối + ghim gom cụm, popup như bản đồ cũ) · Thời tiết (công tắc Cảnh báo nguy hiểm và Cần theo dõi, hiện nhãn cảnh báo trên bản đồ). Dữ liệu 2 tab mới là dữ liệu minh họa của bản đồ cũ trong `window.DigitalMapExtra` (cuối `ban-do-so-data.js`), tắt sẵn, không tính vào Danh sách dữ liệu và số lượng của 5 lớp; "Đặt lại" tắt lại và bỏ lọc của 2 tab này. Tiêu đề hai cột (Lớp bản đồ, Danh sách dữ liệu) là tiêu đề tĩnh, không thu gọn. 8 lớp mới (Người yếu thế, Cơ sở PCCC, Trường học/nhà văn hóa/nơi sơ tán/UBND, Điểm tập kết hàng hóa, Điểm cứu trợ, Bếp ăn, Điểm hiến máu, Địa bàn triển khai chương trình thiện nguyện) đã có trong `ban-do-so-model.js` nhưng nguồn chưa có dữ liệu: chúng tắt sẵn, và bật lên sẽ báo "chưa có dữ liệu". Ở giữa là bản đồ, cột phải là danh sách dữ liệu. Thanh công cụ gồm tiêu đề, ô tìm kiếm, Tỉnh, Xã, nút "Bộ lọc nâng cao" và "Đặt lại". Bộ lọc nâng cao (Đơn vị hội, Lĩnh vực hoạt động, Kỹ năng tình nguyện viên) mở bảng `pf-adv-panel` ngay dưới thanh công cụ, giống bộ lọc trang hồ sơ; nút hiện số bộ lọc nâng cao đang áp dụng (`pf-filter-count`). Ô tìm kiếm, ô chọn và nút dùng UI KIT (`pf-input`, `pf-caret`, `pf-btn pf-btn-ghost`): cao 40px, bo góc 8px, viền xanh khi hover/focus; ô chọn nhiều được làm cùng khung với `pf-input`. Trang không còn hiển thị đơn vị đang làm việc (`context.name`) và nhãn "Dữ liệu minh họa" ở thanh tiêu đề; chú thích dữ liệu minh họa vẫn ở chân bản đồ. Hai cột bên thu gọn được, trạng thái lưu trong `localStorage` (`bd-panels-closed`).
- `ban-do-so.css`: phần riêng của bản đồ số (khối trong cột, danh sách, popup, ghim, cụm, responsive và toàn màn hình). Không thay đổi CSS của trang khác.
- `ban-do-so-model.js`: quy tắc phạm vi đơn vị, tọa độ, tìm kiếm, bộ lọc và tính số lượng; chạy được trong Node.
- `ban-do-so.js`: giao diện, Leaflet, popup, định vị, danh sách tải thêm 50 dòng và điều khiển.
- `ban-do-so-data.js`: nguồn minh họa, dùng đơn vị đang làm việc là Hội Chữ thập đỏ Thành phố Hà Nội.
- `ban-do-so-locations.js`: bản chụp danh mục 34 tỉnh/thành và 3.321 xã/phường từ https://provinces.open-api.vn/api/v2/?depth=2, lấy ngày 19/10/2026. Có cả xã/phường không có dữ liệu bản đồ.
- `vendor/leaflet`: Leaflet 1.9.4 và MarkerCluster 1.5.3, tải tại chỗ để bộ lọc không phụ thuộc CDN. Nền bản đồ vẫn cần mạng.

## Hành vi đã triển khai

Mặc định bật cả 5 lớp. Các lớp gộp cụm độc lập. Số lượng không phụ thuộc khung nhìn. Chọn bản ghi trong danh sách sẽ tạm ẩn các ghim khác; đóng popup khôi phục kết quả theo bộ lọc, giữ mức zoom. Tìm kiếm từ 2 ký tự, chờ 500 ms, không phân biệt dấu/hoa thường. Các bộ lọc dùng AND; nhiều lĩnh vực/kỹ năng trong cùng bộ lọc dùng OR. Bỏ chọn lớp sẽ ẩn và xóa bộ lọc riêng của lớp đó.

Popup có các trường và hành động riêng từng lớp. Tình nguyện viên không có chỉ đường, gọi điện hay nhắn tin. Nút hồ sơ chỉ hiện khi `canViewRecord` trả về `true`. Từ chối định vị, popup chỉ đường bị chặn, lỗi tải bản đồ, lỗi dữ liệu và kết quả rỗng đều có phản hồi.

## Phần cần tích hợp với hệ thống thật

Đây vẫn là giao diện chạy bằng dữ liệu minh họa. Không có đăng nhập cán bộ, cơ sở dữ liệu hay xác thực quyền ở máy chủ trong repository.

Thay `window.DigitalMapSource` trước khi chạy `ban-do-so.js`:

1. `load()` trả `{ records, units, locations, centers, context, demo, errors?, bases? }`.
2. `getRecord(id)` lấy thông tin mới nhất khi mở popup.
3. `canViewRecord(record, context)` trả boolean dựa trên quyền đã được API cấp.
4. `openRecord(record, screenCode)` mở CB-01a hoặc CB-04a của hệ thống cán bộ. Hiện chưa có hai màn hình này, nên bản mẫu mở dialog hồ sơ chỉ đọc.

`context` gồm `unitId`, `national`, `name`, `bounds`. `units` có `id`, `parentId`, `name`, `province`, `ward` và cờ `club` tùy chọn. `records` có `id`, `layer`, `name`, `unitId`, `province`, `ward`, `lat`, `lng`, `address`; các trường riêng theo lớp: `phone`, `leader`, `fields`, `skills`, `lastSeen`, `locationShared`.

API phải kiểm tra quyền và giới hạn phạm vi trước khi trả dữ liệu, kể cả khi truy cập hồ sơ qua ID. Lọc ở trình duyệt chỉ phục vụ giao diện.

Danh mục tỉnh/xã hiện có mã và tên, chưa có ranh giới địa lý. Có thể bổ sung `bounds: [[south, west], [north, east]]` cho từng tỉnh/xã. Khi chưa có bounds, mẫu fit theo các điểm dữ liệu trong khu vực; nếu khu vực không có điểm, giữ mốc tỉnh gần đúng. Vị trí đơn vị, cá nhân và thông tin liên hệ trong bộ mẫu không phải dữ liệu thực.

Các nền xem trước sử dụng Esri World Topo / Street / Imagery; nền tối là World Topo có bộ lọc màu chỉ trên tile. Team bản đồ cần cung cấp nền chính thức và ranh giới. Có thể thay `bases` trong nguồn, với các khóa `basic`, `road`, `satellite`, `dark`, mỗi phần tử gồm `name`, `url`, `attribution`, `preview`. Chỉ đường mẫu mở Google Maps với tọa độ đích, dùng vị trí đã cho phép hoặc để trống điểm xuất phát.

## Điểm khác đặc tả (theo yêu cầu thiết kế)

Đối chiếu với “2. Đặc tả chức năng-05-Bản đồ số_Đơn vị, con người”. Popup chi tiết mở bên phải ghim và chế độ toàn màn hình giữ nguyên các cụm đã làm theo đặc tả. Các điểm dưới đây cố ý khác đặc tả:

- Bố cục 3 cột (lớp bản đồ · bản đồ · danh sách dữ liệu) thay cho các cụm nổi bên trái bản đồ. Ô tìm kiếm, Tỉnh, Xã và nút Bộ lọc nâng cao (Đơn vị hội, Lĩnh vực, Kỹ năng) nằm trên thanh công cụ.
- Tiêu đề trang là “Bản đồ Nhân đạo Quốc gia”. Không hiển thị breadcrumb “Bản đồ › Bản đồ số” và “Đang làm việc tại …”.
- Cụm “Lớp bản đồ” và “Danh sách dữ liệu” không thu gọn (UC-BD-08 bước 1–2). Thay vào đó từng nhóm lớp thu gọn được, và cả cột trái/phải thu gọn bằng nút ‹ › ở mép bản đồ.
- Lớp dùng công tắc thay cho checkbox, chia 5 nhóm. Ngoài 5 lớp của đặc tả có thêm 8 lớp chưa có dữ liệu (tắt sẵn).
- Toàn màn hình phủ cả trang bản đồ (thanh công cụ, 2 cột, bản đồ), chỉ ẩn header website.

## Kiểm tra

Chạy từ thư mục dự án:

```powershell
node tests/ban-do-so-model.test.cjs
```

Kiểm thử trình duyệt cần Playwright và một HTTP server đang phục vụ dự án:

```powershell
$env:MAP_TEST_URL = 'http://127.0.0.1:5501/ban-do-so.html'
node tests/ban-do-so-browser.test.cjs
```

Có thể đặt `PLAYWRIGHT_MODULE` thành đường dẫn module Playwright đã cài và `CHROMIUM_PATH` thành đường dẫn executable Chromium. Ảnh kiểm tra được ghi vào `tmp/map/`.
