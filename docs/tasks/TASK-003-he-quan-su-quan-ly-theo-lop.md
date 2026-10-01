# TASK-003: Hệ quân sự quản lý theo lớp

## Quyết định

Yêu cầu ngày 01/10/2026 tái mở rộng hệ thống theo các hệ đào tạo, thay thế quyết định hủy phân hệ ghi ở đầu `QLHV.md`. Triển khai hệ quân sự trước; hệ thứ hai được hoãn. Dữ liệu cũ thuộc hệ ngoài. Hệ quân sự giữ quản lý học viên, lớp, môn, học kỳ, lịch học và kết quả học tập theo lớp. Không triển khai cơ sở đào tạo, học phí hoặc cắt cơm cho hệ quân sự.

## Phạm vi triển khai

- Thêm `systemType` cho tài khoản với `EXTERNAL`, `MILITARY`; Admin để trống. Hệ thứ hai chưa được triển khai.
- Bảo vệ API hệ quân sự bằng vai trò và hệ của tài khoản đã xác thực; không tin giá trị hệ do client gửi.
- Tạo lớp quân sự độc lập, không phụ thuộc trường, tổ chức hoặc trình độ đào tạo; Chỉ huy hệ quân sự quản lý lớp của mình và xếp học viên quân sự theo lớp.
- Tiếp tục triển khai môn, học kỳ, lịch học và kết quả trong các bước kế tiếp của task; mọi dữ liệu nghiệp vụ phải giới hạn theo hệ.
- Không cung cấp chức năng hoặc điều hướng học phí, cắt cơm, cơ sở đào tạo trong trải nghiệm quân sự.

## An toàn dữ liệu

- Migration có thể chạy lặp lại, chỉ thêm cấu trúc; dữ liệu tài khoản hiện hữu được gán `EXTERNAL`, Admin giữ `NULL`.
- Không đổi/xóa bảng và dữ liệu nghiệp vụ cũ. Không dùng `sync({ force: true })`.
- Tuyệt đối không cho phép Chỉ huy hệ quân sự đọc/ghi lớp của hệ ngoài hoặc ngược lại.

## Tiêu chí hoàn thành

1. Tài khoản đăng nhập có hệ đào tạo; tài khoản cũ tiếp tục hoạt động trong hệ ngoài.
2. API quản lý lớp quân sự chỉ dành cho Chỉ huy quân sự và chỉ trả lớp do Chỉ huy đó quản lý.
3. Chỉ học viên quân sự được xếp vào lớp quân sự; có thể xem và chuyển học viên khỏi lớp.
4. Các luồng môn, học kỳ, lịch và kết quả cho hệ quân sự được triển khai, bảo vệ scope phía backend và có giao diện tương ứng.
5. Giao diện quân sự không hiển thị nghiệp vụ cơ sở đào tạo, học phí và cắt cơm.
6. Hệ thứ hai vẫn nằm ngoài phạm vi task này.
