# Bản đồ số – Đơn vị, con người

Triển khai giao diện UC-BD-01–08 theo tài liệu “2. Đặc tả chức năng-05-Bản đồ số_Đơn vị, con người.docx.pdf”. Mở `ban-do-so.html` qua Live Server của dự án (cổng 5501).

## Giao diện và mã nguồn

- Giữ header/footer, font Be Vietnam Pro, màu chủ đạo, SVG sprite và UI kit `pf-input`, `pf-field`, `pf-badge`, `pf-tag`, `button` của `styles.css`.
- Bố cục giữ dạng 3 cột của bản cũ: các class `map-page`, `map-toolbar`, `map-dashboard`, `md-panel`, `md-map`, `md-layer`, `md-switch` và `md-panel-toggle` có sẵn trong `styles.css`. Cột trái là "Lớp bản đồ", chia 4 nhóm: Tổ chức hội · Con người · Hạ tầng hỗ trợ · Hạ tầng nhân đạo. Mỗi lớp có biểu tượng (màu lớp khi bật, xám khi tắt; dòng đang bật không có nền), tên lớp, số lượng theo đơn vị của lớp (đơn vị, người, cơ sở, điểm…) và công tắc; danh sách nhóm nằm ở `LAYER_GROUPS` trong `ban-do-so.js`. Bấm tiêu đề nhóm (có mũi tên) để thu gọn hoặc mở nhóm đó. Thanh tab nằm ở góc trên bên trái khung bản đồ (kiểu nút nhóm `md-basemap` của bản cũ) và đổi nội dung cột Lớp bản đồ; bấm tab khi cột đang thu gọn sẽ mở lại cột. Có 3 tab: Tổng quan (các lớp kể trên) · Nguồn lực (xem mục "SRS Người yếu thế, chương trình và bảng cân đối nguồn lực" bên dưới) · Thời tiết (công tắc Cảnh báo nguy hiểm và Cần theo dõi, nhãn cảnh báo trên bản đồ; dữ liệu minh họa `window.DigitalMapExtra`, chưa có mockup trong SRS). Tiêu đề hai cột (Lớp bản đồ, Danh sách địa điểm) là tiêu đề tĩnh, không thu gọn. 5 lớp bổ sung (Người yếu thế, Cơ sở PCCC, Điểm nhân đạo, Điểm hiến máu, Trạm sơ cấp cứu; đã bỏ Nơi sơ tán, Điểm tập kết hàng hóa, Điểm cứu trợ, Bếp ăn, Chương trình thiện nguyện khỏi tab Tổng quan theo yêu cầu 2026-10-23) có dữ liệu minh họa và tắt sẵn; lớp nào nguồn không trả dữ liệu thì bật lên sẽ báo "chưa có dữ liệu". Cột trái thu gọn còn thanh biểu tượng lớp (bấm để bật/tắt, rê chuột hoặc focus hiện tooltip: tên · số lượng · trạng thái). Ở giữa là bản đồ, cột phải là danh sách dữ liệu. Thanh công cụ gồm tiêu đề, ô tìm kiếm, Tỉnh, Xã, nút "Bộ lọc nâng cao" và "Đặt lại". Bộ lọc nâng cao (Đơn vị hội, Lĩnh vực hoạt động, Kỹ năng tình nguyện viên) mở bảng `pf-adv-panel` ngay dưới thanh công cụ, giống bộ lọc trang hồ sơ; nút hiện số bộ lọc nâng cao đang áp dụng (`pf-filter-count`). Ô tìm kiếm, ô chọn và nút dùng UI KIT (`pf-input`, `pf-caret`, `pf-btn pf-btn-ghost`): cao 40px, bo góc 8px, viền xanh khi hover/focus; ô chọn nhiều được làm cùng khung với `pf-input`. Trang không còn hiển thị đơn vị đang làm việc (`context.name`) và nhãn "Dữ liệu minh họa" ở thanh tiêu đề; chú thích dữ liệu minh họa vẫn ở chân bản đồ. Hai cột bên thu gọn được, trạng thái lưu trong `localStorage` (`bd-panels-closed`).
- `ban-do-so.css`: phần riêng của bản đồ số (khối trong cột, danh sách, popup, ghim, cụm, responsive và toàn màn hình). Không thay đổi CSS của trang khác.
- `ban-do-so-model.js`: quy tắc phạm vi đơn vị, tọa độ, tìm kiếm, bộ lọc và tính số lượng; chạy được trong Node.
- `ban-do-so.js`: giao diện, Leaflet, popup, định vị, danh sách tải thêm 50 dòng và điều khiển.
- `ban-do-so-data.js`: nguồn minh họa, dùng đơn vị đang làm việc là Hội Chữ thập đỏ Thành phố Hà Nội.
- `ban-do-so-locations.js`: bản chụp danh mục 34 tỉnh/thành và 3.321 xã/phường từ https://provinces.open-api.vn/api/v2/?depth=2, lấy ngày 19/10/2026. Có cả xã/phường không có dữ liệu bản đồ.
- `vendor/leaflet`: Leaflet 1.9.4 và MarkerCluster 1.5.3, tải tại chỗ để bộ lọc không phụ thuộc CDN. Nền bản đồ vẫn cần mạng.

## Hành vi đã triển khai

Mặc định bật cả 5 lớp. Các lớp gộp cụm độc lập. Số lượng không phụ thuộc khung nhìn. Chọn đối tượng trong danh sách sẽ tạm ẩn các ghim khác; đóng popup khôi phục kết quả theo bộ lọc, giữ mức zoom. Tìm kiếm từ 2 ký tự, chờ 500 ms, không phân biệt dấu/hoa thường. Các bộ lọc dùng AND; nhiều lĩnh vực/kỹ năng trong cùng bộ lọc dùng OR. Bỏ chọn lớp sẽ ẩn và xóa bộ lọc riêng của lớp đó.

Mọi popup/thẻ thông tin (chi tiết, danh sách tại điểm và bảng cân đối ở tab Nguồn lực) dùng chung một khung: phần đầu gồm nút "Danh sách tại điểm" (nếu có), nhãn lớp, tên; dấu X cùng hàng với dòng đầu tiên. Dưới phần đầu là đường kẻ ngang hết chiều rộng, rồi phần thân gồm các trường và nút hành động. Lề 20px ở mọi phía; phần đầu dính lại khi cuộn. Danh sách tại điểm: phần đầu là nhãn lớp · "Số lượng: N" và địa điểm, phần thân là bảng (dòng đầu tô sáng); điểm có nhiều lớp thì nhãn ghi "Danh sách tại điểm" và phần thân chia nhóm theo lớp. Các trường không lặp lại tên và loại đã có ở phần đầu (bỏ Tên trụ sở, Tên đội/CLB, Họ và tên, Loại trụ sở, Loại địa điểm). Popup có các trường và hành động riêng từng lớp. Tình nguyện viên không có chỉ đường, gọi điện hay nhắn tin. Nút hồ sơ chỉ hiện khi `canViewRecord` trả về `true`. Từ chối định vị, popup chỉ đường bị chặn, lỗi tải bản đồ, lỗi dữ liệu và kết quả rỗng đều có phản hồi.

## SRS Người yếu thế, chương trình và bảng cân đối nguồn lực

Theo tài liệu "3. [HCTĐ - SRS] [Web nội bộ hội] Bản đồ số - Người yếu thế, chương trình và bảng cân đối nguồn lực".

**Tab Tổng quan**
- Bộ lọc Thời gian (Hiện tại · 7 ngày qua · 30 ngày qua · Tùy chọn từ ngày – đến ngày) trên thanh công cụ. Bộ lọc chỉ áp dụng cho lớp có mốc thời gian: ngày đánh giá hồ sơ người yếu thế. Ô tỉnh hiển thị "Toàn quốc" khi chưa chọn.
- Liên kết "Bật tất cả" / "Tắt tất cả"; lớp mới Trạm sơ cấp cứu.
- Bộ lọc Đơn vị / Lĩnh vực / Kỹ năng hiển thị mờ và không cho chọn khi không có lớp áp dụng nào đang bật.
- Danh sách địa điểm: mỗi dòng có thêm tên lớp. Người yếu thế chỉ hiện "mã hồ sơ · nhóm đối tượng". TB01: "Không tìm thấy dữ liệu phù hợp."
- Popup danh sách theo vị trí: tiêu đề theo quy tắc cùng địa chỉ / cùng xã / "Khu vực đã chọn"; cột đổi theo lớp. Từ popup chi tiết có nút "Danh sách tại điểm" để quay lại.
- Popup chi tiết:
  - Người yếu thế: không hiển thị ghi chú phân quyền trên popup; `source.logView()` vẫn ghi nhật ký mỗi lượt xem; máy chủ từ chối thì báo TB02 và giữ popup danh sách.
  - "Xem thông tin chi tiết" mở tab mới.
  - Điểm nhân đạo: Địa chỉ, Đơn vị quản lý trực tiếp, Loại hình/chức năng, Cấp độ, Nhu cầu địa phương/căn cứ lựa chọn, Nhóm đối tượng hưởng lợi, Số điện thoại; nút Chỉ đường.
  - Cơ sở PCCC, Điểm hiến máu, Trạm sơ cấp cứu: popup thông tin chung (Địa chỉ, Chỉ đường).

**Tab Nguồn lực**: giao diện `ban-do-so-nguon-luc.js`, quy tắc `ban-do-so-nguon-luc-model.js`, dữ liệu minh họa `ban-do-so-nguon-luc-data.js`.
- Bố cục:
  - Thanh bộ lọc đổi theo tab con.
  - Cột trái: ô tìm địa phương / kho / ĐTK và Lớp dữ liệu chia nhóm như tab Tổng quan (tiêu đề nhóm viết hoa, bấm để thu gọn): Cân đối & điều phối (Cân đối nguồn lực, Tuyến; tab con Theo dõi tuyến thêm Phương tiện) · Hạ tầng nhân đạo (Điểm tập kết hàng hóa) · Thiên tai – rủi ro (Điểm nóng nhân đạo, Đường đi bão, Đường giao thông gián đoạn).
  - Cột phải rộng 420px, 3 tab con kèm số lượng.
  - Chú giải và dòng hướng dẫn nằm trên bản đồ.
- Điểm nóng:
  - Tô màu tỉnh theo P1–P4, vẽ đường đi bão.
  - Nhãn đếm theo mức (SRS 3.4 #7) gộp vào bộ lọc Mức ưu tiên trên thanh công cụ: mỗi lựa chọn P1–P4 kèm số tỉnh (theo phạm vi, nhóm nhu cầu); tích / bỏ tích để bật tắt thẻ của mức. Cột phải không còn hàng nhãn mức và dòng "Sắp xếp: HPS" (thẻ vẫn sắp theo HPS).
  - Thẻ xếp theo HPS. Mỗi thẻ (SRS 3.4 #9, mockup 4): nhãn P1–P4 · tỉnh · nhãn xám loại thiên tai · HPS (góc phải); 3 số liệu Ảnh hưởng · Chưa hỗ trợ · Xã nóng nhất; "Nhóm nhu cầu:" với nhãn `pf-tag is-blue` một màu info (xanh dương) cho mọi nhóm. Thẻ đang chọn viền đỏ, nền đỏ nhạt.
  - Xuất danh sách ra .xlsx (tự tạo tệp, không cần thư viện); nút Xem cân đối tỉnh.
- Cân đối & điều phối:
  - Bộ lọc Thời gian (theo thời gian tạo lệnh): mặc định Hiện tại; Hiện tại · 7 ngày qua · 30 ngày qua · Tùy chọn (hộp từ ngày – đến ngày như tab Tổng quan, kiểm tra ngày bắt đầu ≤ ngày kết thúc; áp dụng thì ô hiện "dd/mm – dd/mm").
  - Màu tỉnh theo mức đáp ứng. Phần trăm hiển thị luôn khớp mức, ví dụ 59,5% → 59% "Thiếu".
  - Khối tình hình tự cập nhật 15 phút/lần; phân bổ 34 tỉnh theo mức.
  - Popup bảng thừa/thiếu: Phạm vi đổi theo tỉnh, đóng popup thì trả về giá trị trước. Cột: Loại nguồn lực · Nhóm (chấm màu theo mức + tên đậm) · Nhu cầu · Hiện có · Thiếu/Thừa · Thao tác (chỉ chế độ cán bộ).
  - Bấm vào tỉnh trên lớp Cân đối nguồn lực luôn mở bảng cân đối của tỉnh, kể cả ở tab Điểm nóng và chế độ chỉ xem (giữ nguyên tab con, không có cột Thao tác). Lớp tắt thì bấm vùng điểm nóng vẫn chọn thẻ điểm nóng như cũ. Ở Theo dõi tuyến, lớp cân đối chỉ làm nền, không bấm được.
  - Chỉ tab con Cân đối & điều phối đổi Phạm vi theo tỉnh khi mở bảng; tab Điểm nóng giữ Phạm vi (danh sách điểm nóng không bị lọc trống). Đang mở bảng vẫn bấm sang tỉnh khác được; bấm chỗ trống trên bản đồ hoặc dấu X để đóng.
  - **Chỉ xem:** tab Nguồn lực ẩn hẳn cột Lớp bản đồ (lớp `.is-res-public`, bản đồ giãn ra; tab Tổng quan, Thời tiết vẫn có cột). Lớp Cân đối nguồn lực bật sẵn để bấm được cả 34 tỉnh; chú giải thêm phần Mức đáp ứng theo tỉnh.
  - **Chỉ xem (mặc định, web portal cho người dân):** cột phải không có thanh tab con, thay bằng tiêu đề "Danh sách điểm nóng · N điểm nóng" cùng kiểu "Danh sách địa điểm" của tab Tổng quan (ẩn tab Cân đối & điều phối, Theo dõi tuyến) và không có chân thao tác (ẩn Xuất danh sách, Xem cân đối tỉnh). Khi bật chế độ cán bộ, khối Điều phối nguồn lực có nhãn lọc Tất cả · Chờ xác nhận (Chờ duyệt) · Đã nhận lệnh (Đã phê duyệt, Đang chuẩn bị, Đang vận chuyển, Đã đến) · Hoàn thành (Đã bàn giao, Đã phân phối) — `RM.VIEW_FILTERS`; không hiện Nháp, Từ chối; thẻ lệnh Chờ duyệt ghi "Chờ xác nhận"; số trên tab con đếm theo các lệnh đang hiện. Ẩn mọi thao tác: nút Tạo lệnh điều phối, cột Thao tác (Điều phối) và nút "Điều phối tất cả nhóm thiếu" trong bảng cân đối tỉnh, Chỉnh sửa / Từ chối / Phê duyệt trong thẻ lệnh, Báo sự cố và nút cập nhật trạng thái ở Theo dõi tuyến. Code thao tác vẫn giữ: đặt `window.DigitalMapResourceConfig = { staffMode: true }` trước khi tải trang để bật chế độ cán bộ.
  - Chế độ cán bộ: nhãn lọc trạng thái; thẻ lệnh với Chỉnh sửa / Từ chối (bắt buộc lý do) / Phê duyệt (ẩn với người tạo); vẽ tuyến của lệnh đang chọn.
- Cửa sổ Tạo lệnh:
  - Gợi ý ĐTK dư, cùng chương trình, gần nhất; nhiều điểm nguồn (mỗi điểm thành một lệnh).
  - Tính Còn lại / Tổng; khối Kiểm tra hợp lệ (TB04–TB08, TB16).
  - Lưu nháp (cần Điểm nhận); Hủy hỏi xác nhận khi đã nhập.
  - NL08: mở lần lượt từng nhóm thiếu, có nút Bỏ qua. NL15: thêm Chương trình / Tỉnh nhận / Nhóm nguồn lực.
- Theo dõi tuyến:
  - Tuyến tô màu theo trạng thái; vị trí xe ước tính theo giờ xuất phát.
  - Nhãn lọc nhanh; tiến trình 7 mốc; Báo sự cố.
  - Nút chính đổi theo trạng thái (NL17); Cập nhật phân phối có ô nhập số hộ.

**Điểm khác SRS / mockup**
- Giữ bố cục 3 cột: các tab con Nguồn lực nằm ở cột phải. Lớp dữ liệu dùng tiêu đề nhóm như tab Tổng quan thay cho lớp cha có công tắc "chọn một phần" (SRS 3.6 #1); bật/tắt cả nhóm dùng "Bật tất cả / Tắt tất cả". "Nút Lớp dữ liệu dạng thu gọn" được thay bằng cột trái thu gọn thành thanh biểu tượng.
- Chưa có ranh giới tỉnh nên tỉnh được tô bằng vùng tròn quanh trung tâm tỉnh. Nguồn có thể cấp GeoJSON qua `DigitalMapResourceData.shapes[mãTỉnh]` để vẽ đúng ranh giới.
- Bấm một đối tượng đơn lẻ mở thẳng popup chi tiết (như UC-BD). Bấm vào số (biểu tượng xã, hoặc cụm khi đã ở mức phóng to tối đa / trùng vị trí) mở popup danh sách theo vị trí. Mọi lớp trừ Trụ sở Hội gom theo xã (`WARD_LAYERS` trong `ban-do-so.js`): mỗi xã một biểu tượng số, không tách nhỏ hơn; bấm số của xã mở popup danh sách (cột theo lớp, ví dụ Tình nguyện viên: Họ và tên · Chuyên môn; Người yếu thế: Mã hồ sơ · Nhóm đối tượng · Mức độ cấp thiết), bấm tên mở chi tiết. Xã chỉ có 1 đối tượng hiện ghim, bấm ghim mở thẳng chi tiết. Trụ sở Hội không gom theo xã: cụm tách dần khi phóng to, bấm ghim mở chi tiết. Khi thu nhỏ, các xã gần nhau gộp thành cụm cộng dồn số đối tượng; bấm cụm thì bản đồ phóng tới vùng của cụm để tách thành các xã. Cụm các lớp khác phóng to thêm 1 mức cho tới khi tách hết điểm.
- Bảng thừa/thiếu gộp "Loại nguồn lực" thành dòng phụ dưới tên nhóm để vừa khung bản đồ.
- Quãng đường, thời gian và lộ trình là ước tính (đường chim bay × 1,35, tốc độ 45 km/giờ); sẽ thay bằng dịch vụ định tuyến thật.
- Người dùng mẫu (Lê Minh Quân, TW Hội) có quyền phê duyệt và cập nhật mọi trạng thái.

Tích hợp:
- Thay `window.DigitalMapResourceSource` (`load()`, `saveOrder(order)`). API phải kiểm tra quyền, sinh mã lệnh, ghi nhật ký và gửi thông báo.
- `window.DigitalMapSource` có thêm `logView(record, context)` và `context.canViewVulnerable`.

## Phần cần tích hợp với hệ thống thật

Đây vẫn là giao diện chạy bằng dữ liệu minh họa. Không có đăng nhập cán bộ, cơ sở dữ liệu hay xác thực quyền ở máy chủ trong repository.

Thay `window.DigitalMapSource` trước khi chạy `ban-do-so.js`:

1. `load()` trả `{ records, units, locations, centers, context, demo, errors?, bases? }`.
2. `getRecord(id)` lấy thông tin mới nhất khi mở popup.
3. `canViewRecord(record, context)` trả boolean dựa trên quyền đã được API cấp.
4. `openRecord(record, screenCode)` mở CB-01a hoặc CB-04a của hệ thống cán bộ. Hiện chưa có hai màn hình này, nên bản mẫu mở dialog hồ sơ chỉ đọc.

`context` gồm `unitId`, `national`, `name`, `bounds`. `units` có `id`, `parentId`, `name`, `province`, `ward` và cờ `club` tùy chọn. `records` có `id`, `layer`, `name`, `unitId`, `province`, `ward`, `lat`, `lng`, `address`; các trường riêng theo lớp: `phone`, `leader`, `fields`, `skills`, `lastSeen`, `locationShared`, `street` (số nhà, đường của trụ sở công an, cơ sở y tế: cột Địa chỉ trong popup danh sách; thiếu thì hiện "—").

API phải kiểm tra quyền và giới hạn phạm vi trước khi trả dữ liệu, kể cả khi truy cập hồ sơ qua ID. Lọc ở trình duyệt chỉ phục vụ giao diện.

Danh mục tỉnh/xã hiện có mã và tên, chưa có ranh giới địa lý. Có thể bổ sung `bounds: [[south, west], [north, east]]` cho từng tỉnh/xã. Khi chưa có bounds, mẫu fit theo các điểm dữ liệu trong khu vực; nếu khu vực không có điểm, giữ mốc tỉnh gần đúng. Vị trí đơn vị, cá nhân và thông tin liên hệ trong bộ mẫu không phải dữ liệu thực.

Các nền xem trước sử dụng ô bản đồ của Esri.
- **Bản đồ cơ bản** (đất kem, biển xanh, biên xám tím): ô World Light Gray được tô màu bằng bộ lọc SVG `#bd-tint-solid` / `#bd-tint-ocean` trong `ban-do-so.html`, ánh xạ theo độ sáng (đất xám 239 → kem, nước 208 → xanh). Ở zoom ≤ 10, mặt nước trong suốt để lộ lớp độ sâu World Ocean Base (đã làm tươi bằng CSS filter); zoom lớn hơn thì nước là màu xanh phẳng.
- **Bản đồ đường / vệ tinh**: World Street / Imagery.
- **Nền tối**: World Topo có bộ lọc màu chỉ áp lên ô bản đồ.
- Nếu đổi nguồn ô bản đồ, cần đo lại mức xám đất / nước và chỉnh các mốc trong bộ lọc. Team bản đồ cần cung cấp nền chính thức và ranh giới. Có thể thay `bases` trong nguồn, với các khóa `basic`, `road`, `satellite`, `dark`, mỗi phần tử gồm `name`, `url`, `attribution`, `preview`. Chỉ đường mẫu mở Google Maps với tọa độ đích, dùng vị trí đã cho phép hoặc để trống điểm xuất phát.

## Điểm khác đặc tả (theo yêu cầu thiết kế)

Đối chiếu với “2. Đặc tả chức năng-05-Bản đồ số_Đơn vị, con người”. Popup mở phía trên biểu tượng, mũi nhọn chỉ đúng vào ghim hoặc cụm đã chọn; chế độ toàn màn hình giữ nguyên các cụm đã làm theo đặc tả. Các điểm dưới đây cố ý khác đặc tả:

- Bố cục 3 cột (lớp bản đồ · bản đồ · danh sách dữ liệu) thay cho các cụm nổi bên trái bản đồ. Ô tìm kiếm, Tỉnh, Xã và nút Bộ lọc nâng cao (Đơn vị hội, Lĩnh vực, Kỹ năng) nằm trên thanh công cụ.
- Tiêu đề trang là “Bản đồ Nhân đạo Quốc gia”. Không hiển thị breadcrumb “Bản đồ › Bản đồ số” và “Đang làm việc tại …”.
- Cụm “Lớp bản đồ” và “Danh sách địa điểm” không thu gọn (UC-BD-08 bước 1–2). Thay vào đó từng nhóm lớp thu gọn được, và cả cột trái/phải thu gọn bằng nút ‹ › ở mép bản đồ.
- Lớp dùng công tắc thay cho checkbox, chia 5 nhóm. Ngoài 5 lớp của đặc tả có thêm 5 lớp bổ sung (tắt sẵn).
- Toàn màn hình phủ cả trang bản đồ (thanh công cụ, 2 cột, bản đồ), chỉ ẩn header website.
- Không hiển thị chân trang website trên desktop (≥ 1101px): trang bản đồ là màn hình làm việc vừa một màn hình, lăn chuột trên bản đồ dùng để phóng to / thu nhỏ. Màn hình hẹp vẫn có chân trang ở cuối trang.

## Kiểm tra

Chạy từ thư mục dự án:

```powershell
node tests/ban-do-so-model.test.cjs
node tests/ban-do-so-nguon-luc-model.test.cjs
```

Kiểm thử trình duyệt cần Playwright và một HTTP server đang phục vụ dự án:

```powershell
$env:MAP_TEST_URL = 'http://127.0.0.1:5501/ban-do-so.html'
node tests/ban-do-so-browser.test.cjs
node tests/ban-do-so-nguon-luc-browser.test.cjs
```

Có thể đặt `PLAYWRIGHT_MODULE` thành đường dẫn module Playwright đã cài và `CHROMIUM_PATH` thành đường dẫn executable Chromium. Ảnh kiểm tra được ghi vào `tmp/map/`.
