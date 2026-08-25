# Feature List

## Quy ước trạng thái

- **Có trong source**: đã thấy route/model/page/component liên quan; chưa khẳng định runtime pass.
- **Cần thay đổi**: có luồng cũ nhưng khác đặc tả mới.
- **Chưa thực hiện**: chưa thấy nền tảng tương ứng trong source.

## F01 - Xác thực và tài khoản

### Người dùng

Tất cả vai trò.

### Mục tiêu

Đăng nhập, đổi mật khẩu, duy trì phiên và quản lý trạng thái tài khoản.

### Trạng thái

**Có trong source** cho `ADMIN`, `COMMANDER`, `STUDENT`; chưa có `system_type`.

## F02 - Quản trị tài khoản

### Người dùng

Admin.

### Mục tiêu

Tạo tài khoản, gán role, khóa/mở và reset mật khẩu mà không truy cập hồ sơ/điểm nghiệp vụ.

### Trạng thái

**Cần thay đổi** để phù hợp giới hạn quyền mới.

## F03 - Hồ sơ học viên

### Người dùng

Chỉ huy, Học viên.

### Mục tiêu

Chỉ huy quản lý hồ sơ; Học viên xem hồ sơ của chính mình.

### Trạng thái

**Cần thay đổi**: source có `Profile` chung; chưa tách `military_profiles`, `civilian_profiles` và enrollment.

## F04 - Cơ sở và lớp hệ ngoài

### Người dùng

Chỉ huy hệ ngoài.

### Mục tiêu

Quản lý trường, tổ chức/chuyên ngành, trình độ, lớp và xếp học viên.

### Trạng thái

**Có trong source**, cần bổ sung scope hệ.

## F05 - Kết quả học tập hệ ngoài

### Người dùng

Chỉ huy hệ ngoài, Học viên hệ ngoài.

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

**Có trong source**, cần kiểm thử và bổ sung scope hệ khi mở rộng.

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

**Có trong source**, cần phân phạm vi theo hệ.

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

**Có trong source**, cần siết dữ liệu Admin và cách ly hệ.

## F12 - Nền tảng ba hệ đào tạo

### Người dùng

Toàn hệ thống.

### Mục tiêu

Mỗi Học viên/Chỉ huy thuộc đúng một hệ; dữ liệu không rò rỉ chéo hệ.

### Trạng thái

**Chưa thực hiện**.

## F13 - Môn học riêng theo hệ

### Người dùng

Chỉ huy.

### Mục tiêu

Quản lý danh mục môn riêng cho hệ ngoài, quân sự và dân sự.

### Trạng thái

**Chưa thực hiện**.

## F14 - Quản lý lớp theo hệ

### Người dùng

Chỉ huy.

### Mục tiêu

Chỉ huy quản lý lớp và xếp/chuyển học viên trong đúng hệ; lịch sử chuyển lớp được lưu lại.

### Trạng thái

**Chưa thực hiện**.

## F15 - Đề xuất và duyệt điểm quân sự

### Người dùng

Học viên quân sự, Chỉ huy quân sự.

### Mục tiêu

Chỉ huy có thể nhập điểm quân sự trực tiếp. Học viên cũng có thể tự nhập bảng điểm và gửi đề xuất để Chỉ huy duyệt/từ chối. Điểm chính thức từ cả hai luồng đều không được sửa/xóa.

### Trạng thái

**Chưa thực hiện**.

## F16 - Khung hệ dân sự

### Người dùng

Chỉ huy dân sự, Học viên dân sự.

### Mục tiêu

Có model và API cơ bản cho hồ sơ, enrollment, môn và kết quả; chưa làm quản lý lớp hoàn chỉnh.

### Trạng thái

**Chưa thực hiện**.

## F17 - Audit nghiệp vụ

### Người dùng

Hệ thống và người có quyền kiểm tra phù hợp.

### Mục tiêu

Truy vết tạo/import/xem/xuất điểm, chuyển lớp, khóa tài khoản và thay đổi quyền mà không làm lộ điểm cho Admin.

### Trạng thái

**Chưa thực hiện**.
