# TASK-003: Hệ quân sự quản lý theo lớp

## Quyết định

Yêu cầu ngày 01/10/2026 tái mở rộng hệ thống theo các hệ đào tạo, thay thế quyết định hủy phân hệ ghi ở đầu `QLHV.md`. Triển khai hệ quân sự trước; hệ thứ hai được hoãn. Dữ liệu cũ thuộc hệ ngoài. Hệ quân sự giữ quản lý học viên, lớp, môn, học kỳ, lịch học và kết quả học tập theo lớp. Không triển khai cơ sở đào tạo, học phí hoặc cắt cơm cho hệ quân sự.

## Phạm vi triển khai

- Thêm `systemType` cho tài khoản với `EXTERNAL`, `MILITARY`; Admin để trống. Hệ thứ hai chưa được triển khai.
- Bảo vệ API hệ quân sự bằng vai trò và hệ của tài khoản đã xác thực; không tin giá trị hệ do client gửi.
- Tạo lớp quân sự độc lập, không phụ thuộc trường, tổ chức hoặc trình độ đào tạo; Admin tạo/sửa/xóa lớp và phân công Chỉ huy hệ quân sự. Chỉ huy chỉ xem lớp được giao và xếp học viên quân sự theo lớp.
- Tiếp tục triển khai môn, học kỳ, lịch học và kết quả trong các bước kế tiếp của task; mọi dữ liệu nghiệp vụ phải giới hạn theo hệ.
- Không cung cấp chức năng hoặc điều hướng học phí, cắt cơm, cơ sở đào tạo trong trải nghiệm quân sự.

## Bổ sung phạm vi theo yêu cầu

- Hệ quân sự có các luồng tương ứng: quản lý lớp, hồ sơ học viên, điểm học tập, phê duyệt đề xuất điểm, thành tích, môn học, học kỳ, lịch học và phân công lịch trực.
- Không triển khai cắt cơm và học phí cho hệ quân sự.
- Lịch học quân sự thuộc lớp và học kỳ; mọi học viên trong cùng lớp xem cùng một lịch.
- Điểm quân sự lưu trong bảng riêng. Chỉ huy có thể ghi điểm mới; học viên có thể gửi đề xuất điểm để Chỉ huy duyệt hoặc từ chối. Điểm chính thức đã tạo không có API sửa/xóa.
- Thành tích và lịch trực quân sự lưu riêng, được giới hạn theo lớp của Chỉ huy đã xác thực.
- Hồ sơ cá nhân dùng chung `Profile`; không dùng chung dữ liệu đào tạo hoặc lớp giữa hai hệ.

## An toàn dữ liệu

- Migration có thể chạy lặp lại, chỉ thêm cấu trúc; dữ liệu tài khoản hiện hữu được gán `EXTERNAL`, Admin giữ `NULL`.
- Không đổi/xóa bảng và dữ liệu nghiệp vụ cũ. Không dùng `sync({ force: true })`.
- Tuyệt đối không cho phép Chỉ huy hệ quân sự đọc/ghi lớp của hệ ngoài hoặc ngược lại.

## Tiêu chí hoàn thành

1. Tài khoản đăng nhập có hệ đào tạo; tài khoản cũ tiếp tục hoạt động trong hệ ngoài.
2. Admin tạo/sửa/xóa lớp và phân công Chỉ huy quân sự; API của Chỉ huy chỉ trả lớp được giao và hỗ trợ quản lý học viên trong lớp.
3. Chỉ học viên quân sự được xếp vào lớp quân sự; có thể xem và chuyển học viên khỏi lớp.
4. Các luồng môn, học kỳ, lịch và kết quả cho hệ quân sự được triển khai, bảo vệ scope phía backend và có giao diện tương ứng.
5. Giao diện quân sự không hiển thị nghiệp vụ cơ sở đào tạo, học phí và cắt cơm.
6. Hệ thứ hai vẫn nằm ngoài phạm vi task này.
