# Feature List

## Quy ước trạng thái

- **Có trong source**: đã thấy route/model/page/component liên quan; chưa khẳng định runtime pass.
- **Cần thay đổi**: có luồng cũ nhưng khác đặc tả mới.
- **Chưa thực hiện**: chưa thấy nền tảng tương ứng trong source.

Phạm vi nghiệp vụ gồm Hệ 1, 3, 4, 5 và 7. Hệ 1 và Hệ 7 dùng chung nghiệp vụ, khác chương trình đào tạo. Hệ 5 quản lý học viên tại cơ sở đào tạo ngoài quân đội, gồm nghiệp vụ cơ sở đào tạo, lớp, học tập, học phí và lịch cắt cơm. Các trạng thái dưới đây cho biết mức độ triển khai từng feature.

## F01 - Xác thực và tài khoản

### Người dùng

Tất cả vai trò.

### Mục tiêu

Đăng nhập, đổi mật khẩu, duy trì phiên và quản lý trạng thái tài khoản.

### Trạng thái

**Có trong source** cho `ADMIN`, `COMMANDER`, `STUDENT`.

## F02 - Quản trị tài khoản

### Người dùng

Admin.

### Mục tiêu

Tạo và chỉnh sửa tài khoản, gán role, khóa/mở và reset mật khẩu; Admin được xem thông tin chính trị nội bộ nhưng không xem điểm nghiệp vụ.

### Trạng thái

**Cần thay đổi** để Admin quản lý tài khoản toàn hệ thống, chỉ xem thông tin chính trị nội bộ và không truy cập điểm.

## F03 - Thông tin chính trị nội bộ học viên

### Người dùng

Admin, Chỉ huy, Học viên.

### Mục tiêu

Chỉ huy quản lý thông tin chính trị nội bộ trong hệ được phân công; Admin chỉ xem thông tin của mọi hệ; Học viên xem thông tin của chính mình.

### Trạng thái

**Có trong source** với `Profile` dùng chung.

## F04 - Cơ sở và lớp

### Người dùng

Chỉ huy.

### Mục tiêu

Quản lý trường, tổ chức/chuyên ngành, trình độ, lớp và xếp học viên.

### Trạng thái

**Có trong source**.

## F05 - Kết quả học tập

### Người dùng

Chỉ huy, Học viên.

### Mục tiêu

Chỉ huy nhập điểm; Học viên xem điểm chính thức.

### Trạng thái

**Cần thay đổi**: source còn create/update/delete kết quả và luồng đề xuất/phê duyệt.

## F06 - Lịch học và lịch cắt cơm

### Người dùng

Chỉ huy, Học viên.

### Mục tiêu

Quản lý lịch học, tự động/tùy chỉnh cắt cơm và yêu cầu liên quan.

### Trạng thái

**Có trong source**, cần kiểm thử các luồng hiện hành.

## F07 - Học phí

### Người dùng

Chỉ huy, Học viên.

### Mục tiêu

Theo dõi học phí, lịch sử thay đổi, import và xem trạng thái.

### Trạng thái

**Có trong source**.

## F08 - Thành tích và nghiên cứu

### Người dùng

Chỉ huy, Học viên.

### Mục tiêu

Quản lý thành tích, hồ sơ thành tích, đề tài và sáng kiến.

### Trạng thái

**Có trong source**.

## F09 - Học kỳ

### Người dùng

Chỉ huy.

### Mục tiêu

Quản lý năm học và học kỳ phục vụ lịch/điểm.

### Trạng thái

**Có trong source**.

## F10 - Thông báo

### Người dùng

Tất cả vai trò nghiệp vụ.

### Mục tiêu

Nhận và quản lý thông báo phát sinh từ các luồng nghiệp vụ.

### Trạng thái

**Có trong source**, chưa có đầy đủ sự kiện chuyển lớp và nhập điểm mới.

## F11 - Báo cáo và dashboard

### Người dùng

Admin, Chỉ huy, Học viên theo phạm vi.

### Mục tiêu

Xem thống kê và export dữ liệu được phép.

### Trạng thái

**Cần bảo đảm** dashboard và báo cáo chỉ trả dữ liệu trong phạm vi role và hệ; Admin không nhận dữ liệu điểm.

## F12 - Phân hệ đào tạo

### Người dùng

Toàn hệ thống.

### Mục tiêu

Quản lý năm hệ độc lập và giới hạn dữ liệu theo hệ của tài khoản đã xác thực.

### Trạng thái

**Cần triển khai** phân loại và phân quyền theo Hệ 1, 3, 4, 5 và 7 trên toàn bộ API nghiệp vụ.

## F13 - Danh mục môn học

### Người dùng

Chỉ huy.

### Mục tiêu

Quản lý danh mục môn học riêng theo từng hệ.

### Trạng thái

Quản lý danh mục môn học độc lập theo hệ; Chỉ huy chỉ truy cập môn thuộc hệ được phân công.

## F14 - Quản lý lớp theo hệ

### Người dùng

Chỉ huy.

### Mục tiêu

Chỉ huy quản lý lớp và xếp/chuyển học viên trong đúng hệ; lịch sử chuyển lớp được lưu lại.

### Trạng thái

Quản lý lớp, xếp/chuyển học viên và lưu lịch sử trong phạm vi từng hệ.

## F15 - Nhập, đề xuất và duyệt điểm

### Người dùng

Học viên và Chỉ huy theo quy trình của từng hệ.

### Mục tiêu

Chỉ huy nhập điểm trực tiếp; Học viên gửi đề xuất khi quy trình của hệ cho phép. Điểm chính thức không được sửa, xóa hoặc mở khóa.

### Trạng thái

Hỗ trợ nhập kết quả và các luồng đề xuất/duyệt theo quy định của từng hệ; điểm chính thức bất biến.

## F16 - Nghiệp vụ riêng của Hệ 5

### Người dùng

Admin, Chỉ huy Hệ 5, Học viên Hệ 5.

### Mục tiêu

Quản lý cơ sở đào tạo, tổ chức/chuyên ngành, trình độ, lớp, học phí và lịch cắt cơm cho học viên học ngoài quân đội.

### Trạng thái

**Thuộc phạm vi Hệ 5**; mức độ triển khai được xác định theo từng feature trong source.

## F17 - Audit nghiệp vụ

### Người dùng

Hệ thống và người có quyền kiểm tra phù hợp.

### Mục tiêu

Truy vết tạo/import/xem/xuất điểm, chuyển lớp, khóa tài khoản và thay đổi quyền mà không làm lộ điểm cho Admin.

### Trạng thái

**Chưa thực hiện**.
