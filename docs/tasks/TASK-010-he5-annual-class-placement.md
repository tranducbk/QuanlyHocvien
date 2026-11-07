# TASK-010: Xếp lớp Hệ 5 theo năm học

## Trạng thái

Đã triển khai API, giao diện và áp dụng migration trên `neondb`. Đã khởi tạo bản nháp 2026–2027, kế thừa phân lớp hiện tại; chưa chốt danh sách thay người dùng. Quyết định nghiệp vụ được người dùng xác nhận trong phiên làm việc này, thay thế phần cho phép tạo/sửa/ngừng lớp Hệ 5 và phần chưa hỗ trợ chuyển lớp của các task cũ. Các Hệ 1/3/4/7 giữ nguyên.

## Quyết định đã chốt

- Hệ 5 có đúng Lớp 1–6 cố định; không tạo, sửa, xóa hoặc ngừng hoạt động.
- Danh sách học viên thuộc lớp được lưu riêng cho từng năm học dạng `2026-2027`.
- Sáu lớp dùng chung toàn Hệ 5. Chỉ huy Hệ 5 được xem và xếp lớp toàn bộ học viên Hệ 5, không giới hạn theo `commanderId` của học viên.
- Chỉ xếp lại lớp và bổ sung học viên mới vào đầu năm học.
- Chuẩn bị năm mới bằng cách kế thừa danh sách năm trước rồi điều chỉnh.
- Đánh dấu học viên tốt nghiệp trong bước chuẩn bị năm mới, không đưa họ vào danh sách năm mới; giữ hồ sơ, điểm và danh sách các năm trước.
- Luồng giao diện: chọn năm học, chuẩn bị bản nháp, điều chỉnh, kiểm tra, chốt xếp lớp. Sau chốt không thêm hoặc chuyển học viên trong năm.
- Lưu người thực hiện, thời gian và thay đổi trước/sau; không ghi đè lịch sử các năm trước.
- Bảng lớp: tên lớp, số học viên toàn Hệ 5 theo năm học, xem danh sách.
- Bổ sung cột Cơ sở đào tạo: mã trường duy nhất từ hồ sơ các học viên ACTIVE thuộc chính lớp trong năm đang chọn; không lấy trường từ lớp khác/học viên tốt nghiệp. Hiển thị mã trường hiện tại trong hồ sơ, chưa lưu snapshot trường theo năm.
- Thao tác từng lớp: icon mắt xem danh sách, dấu cộng mở trực tiếp tab Thêm học viên, bút chì chỉnh sửa. Dấu cộng/bút chì chỉ hiện khi năm học đang DRAFT; giữ khóa danh sách đã chốt.

## Quyết định bổ sung đã được người dùng xác nhận

1. Khởi tạo năm học `2026-2027`, lấy phân lớp hiện tại làm bản nháp đầu tiên.
2. Danh mục 6 lớp dùng chung toàn Hệ; Chỉ huy Hệ 5 xem và xếp lớp cho toàn bộ học viên Hệ 5.
3. Chỉ huy trực tiếp xếp lớp và chốt danh sách để khóa; không thêm lịch ngày bắt đầu/kết thúc đợt xếp lớp.

Các quyết định này chỉ mở rộng quyền trong chức năng xếp lớp Hệ 5. Không thay đổi quyền xem/sửa điểm, thông tin chính trị nội bộ hoặc nghiệp vụ của các Hệ khác.

## Mô hình dữ liệu và API

- `he5_placement_years`: năm học dùng chung, trạng thái `DRAFT`/`CLOSED`, năm nguồn, người/thời gian chốt; chỉ một bản nháp cho toàn Hệ.
- `he5_placements`: một bản ghi cho mỗi học viên/năm, lớp, bản chụp mã/họ tên, trạng thái `ACTIVE`/`GRADUATED`. Tốt nghiệp không xóa hồ sơ hoặc bản ghi năm cũ.
- `he5_placement_events`: lịch sử thêm/chuyển lớp, tốt nghiệp, hoàn tác tốt nghiệp trong bản nháp, chuẩn bị năm và chốt; lưu trước/sau, người, thời gian. Không có API sửa/xóa lịch sử.
- Học viên được đánh dấu tốt nghiệp khi chuẩn bị năm mới không tính vào sĩ số năm mới, không được kế thừa hoặc xếp lại ở các năm tiếp theo. Có thể sửa đánh dấu nhầm bằng cách xếp lại vào lớp khi bản nháp chưa chốt.
- Bản nháp không thay đổi `profiles.training_class_id`; khi chốt, đồng bộ lớp hiện tại theo danh sách chính thức. Không ghi đè `class_id` legacy, không thay đổi điểm/học phí hoặc tự suy ra ngày tốt nghiệp.
- API mới tại `/he5-placement/years`: xem năm, chuẩn bị năm kế tiếp; các API theo `yearId`: chi tiết, học viên chưa xếp, xếp/chuyển, tốt nghiệp, chốt, lịch sử. Chỉ Chỉ huy Hệ 5 có quyền.
- Khóa bản ghi năm học trong transaction để tuần tự hóa xếp lớp và chốt. Trigger PostgreSQL khóa danh sách đã chốt, ngăn thay đổi 6 lớp và sửa/xóa lịch sử.
- API xếp lớp không có năm học cũ của Hệ 5 bị chặn để tránh bỏ qua bước chốt. Luồng Hệ 1/3/4/7 giữ nguyên.

## Triển khai và kiểm chứng

### Điều chỉnh mới nhất: sửa danh sách từng lớp trong modal

- Bỏ nút và trang Xếp lớp riêng. URL trang cũ chuyển về bảng 6 lớp của năm học tương ứng.
- Bên cạnh nút Xem danh sách ở mỗi lớp có icon chỉnh sửa; mở modal tải danh sách của lớp theo năm học bằng React Query.
- Trong modal, Chỉ huy chọn một/nhiều học viên và chuyển sang lớp đích cùng Hệ; có thể thêm học viên chưa xếp lớp và đánh dấu tốt nghiệp theo nghiệp vụ đã thống nhất.
- Kế thừa danh sách năm trước giữ nguyên; sau thao tác cập nhật lại danh sách và sĩ số các lớp, không ghi đè năm trước.
- Chưa thay đổi quy tắc khóa sau chốt: đang chờ người dùng xác nhận giữ chốt đầu năm hay cho điều chỉnh suốt năm đang quản lý. Tạm thời icon sửa chỉ hiện với bản nháp, nút chốt danh sách chuyển về trang quản lý lớp.
- Không chạy ứng dụng/build theo yêu cầu người dùng; chỉ đọc source và rà soát diff.
- Trong modal của một lớp không hiển thị ô chọn lớp đích thường trực. Chỉ khi bấm Chuyển lớp (từng học viên hoặc nhóm đã chọn) mới mở cột dọc các lớp còn lại để chọn và xác nhận; loại trừ lớp đang mở. Thêm/khôi phục học viên dùng ngay lớp đang mở. Thanh thao tác nhóm chỉ hiện khi đã chọn học viên.
- Giữ Thêm học viên theo đính chính của người dùng: hiện ô tìm theo tên (cũng hỗ trợ mã), gợi ý học viên Hệ 5 chưa có lớp trong năm đang chọn từ API khả dụng đã scope. Chọn gợi ý để đưa vào danh sách chờ thêm, rồi bấm Thêm vào lớp đang mở. Không hiển thị toàn bộ học viên chưa xếp thành bảng mặc định; không gợi ý lại học viên đã chọn. Sau khi thêm, làm mới danh sách/lớp và sĩ số qua React Query.
- Đồng bộ hồ sơ Hệ 5: API danh sách/chi tiết bổ sung `managementClass` từ danh sách phân lớp của năm đang quản lý (cùng năm mới nhất như màn hình 6 lớp), không đọc lớp legacy tại trường ngoài để hiển thị Lớp 1–6. Bảng và chi tiết dùng trường này, làm mới query hồ sơ sau thêm/chuyển lớp hoặc đánh dấu tốt nghiệp. Không đổi phạm vi quyền hồ sơ.
- Bảng hồ sơ Hệ 5 bỏ cột/bộ lọc Đơn vị, bỏ ô Đơn vị trong form sửa, hiển thị Mã trường thay tên trường. Cố định tỷ lệ chiều rộng cột, bỏ độ rộng tối thiểu của ô học viên, cho phép xuống dòng và thu gọn avatar/khoảng cách để tránh cuộn ngang. Luồng quân sự vẫn có trường Đơn vị.

- Khóa thao tác tạo/sửa/đổi trạng thái lớp Hệ 5 ở service, bỏ nút sửa/ngừng lớp trong giao diện chung.
- Đã có model/service/controller/validation/API và giao diện riêng cho Hệ 5; dùng React Query và các thành phần bảng/chọn/xác nhận hiện có.
- Theo phản hồi giao diện mới nhất: trang chính hiển thị năm học và bảng 6 lớp; năm học chỉ ghi `2026-2027`, bỏ nhãn trạng thái trên trang chính. Bỏ nút và trang Lịch sử xếp lớp; tra cứu danh sách các năm bằng bộ chọn năm học. URL lịch sử cũ chuyển về danh sách lớp của năm tương ứng. Nút Xếp lớp và Xem danh sách điều hướng sang trang riêng; chốt danh sách chỉ xuất hiện trong trang xếp lớp. Chuẩn bị năm mới xong chuyển tới trang xếp lớp năm mới. Quay lại giữ năm học đã chọn. Dữ liệu phân lớp các năm cũ và dữ liệu truy vết nội bộ được giữ nguyên.
- Bỏ chức năng Xem toàn Hệ 5; trang xem học viên cần chọn một lớp cụ thể. Trang chính bỏ mô tả và tiêu đề lặp, chuyển bộ chọn năm học lên cạnh tiêu đề, giữ bộ lọc/chọn cột. Bảng 6 lớp dùng hàng/nút gọn, không phân trang, không ép chiều cao tối thiểu toàn màn hình gây cuộn dư. Không ẩn nội dung bằng khóa cuộn; màn hình nhỏ vẫn có thể cuộn khi cần.
- Trang xem danh sách lớp cụ thể dùng breadcrumb `Tổng quan → Quản lý lớp → Lớp 1` theo tên lớp được chọn, tiêu đề tên lớp và năm học. Quay lại dùng icon mũi tên có nhãn truy cập và tooltip; không có khung quay lại riêng. Phần bảng chỉ giữ bộ lọc/chọn cột, bỏ tiêu đề lặp và tab Trong lớp/Đánh dấu tốt nghiệp trong chế độ xem; các tác vụ chuẩn bị vẫn ở trang Xếp lớp.
- Điều chỉnh bố cục trang xem: icon quay lại bên trái, tiêu đề `Danh sách lớp` bên phải; tên lớp và năm học nằm dưới tiêu đề. Giảm chiều cao đầu bảng, hàng và vùng trống để tránh cuộn dọc dư; giữ bộ lọc/chọn cột và phân trang cho danh sách học viên.
- Thiết kế lại theo phản hồi tiếp theo: gom icon quay lại và tiêu đề thành cụm bên trái, sĩ số của lớp bên dưới; tên lớp và năm học thành nhãn gọn bên phải. Bộ lọc/chọn cột nằm sát bảng, trạng thái trống gọn, không có dòng hướng dẫn thừa. Chỉ hiển thị phân trang khi có nhiều hơn một trang. Chế độ `compact` của bảng là tùy chọn, không thay đổi bố cục mặc định ở màn hình khác. Người dùng tự kiểm tra giao diện; không chạy ứng dụng/build theo yêu cầu.
- Migration phải bảo toàn dữ liệu hiện có, có report/dry-run trước apply; không reset database.
- Kiểm tra phân quyền chéo Chỉ huy/Hệ, khóa sau chốt, kế thừa năm trước và lịch sử tốt nghiệp trước khi bàn giao.

## Vận hành

Trong `backend/`:

1. `node src/utils/migrateHe5Placement.js --report` xác nhận database và trạng thái hiện tại.
2. `node src/utils/migrateHe5Placement.js --dry-run` tạo thử và nhập phân lớp hiện tại rồi rollback.
3. Đặt `QLHV_EXPECT_DATABASE` bằng tên database đã kiểm tra, chạy `node src/utils/migrateHe5Placement.js --apply`, rồi chạy lại report.

Migration chạy lặp không nhập lại học viên, không tạo thêm năm nháp và không ghi đè dữ liệu hiện có. Migration dừng nếu không có đúng 6 lớp Hệ 5 đã thống nhất, thay vì tự chỉnh dữ liệu lớp.

`node src/utils/testHe5Placement.js` kiểm thử tích hợp trên PostgreSQL bằng transaction ngoài và savepoint, rollback cả fixture, phân lớp và schema. Script dành cho giai đoạn khởi tạo chỉ có bản nháp 2026–2027 hoặc database test tương ứng, không dùng để chốt danh sách thật. Có kiểm tra API với JWT, Chỉ huy cùng Hệ khác người, tài khoản khác Hệ/Học viên, validation, khóa sau chốt, lịch sử, kế thừa và tốt nghiệp.

## Kết quả kiểm tra

- Migration report/dry-run đạt; apply và report sau apply xác nhận năm học 2026–2027 có bản nháp, dữ liệu cũ được kế thừa, không có dữ liệu test còn lại.
- 38 kiểm tra tích hợp PostgreSQL/service/HTTP API đạt; rollback toàn bộ dữ liệu thử.
- Swagger coverage: 281 phương thức API có tài liệu.
- Frontend type-check đạt; lint không lỗi, còn 8 cảnh báo có sẵn ngoài phạm vi task.
- Production build được kiểm tra cho giao diện mới và kiểm tra lại sau khi tách route các tác vụ.
- `git diff --check` đạt.
- Chưa kiểm thử trực tiếp UI sau đăng nhập vì trình duyệt chia sẻ đang ở màn hình đăng nhập. Không tự đăng nhập hoặc chốt danh sách thật để kiểm thử.
