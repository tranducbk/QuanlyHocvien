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

**Có trong source** cho `ADMIN`, `COMMANDER`, `STUDENT`.

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

**Có trong source**, cần siết dữ liệu Admin.

## F12 - Phân hệ đào tạo

### Người dùng

Toàn hệ thống.

### Mục tiêu

Phân tách nghiệp vụ và scope dữ liệu hệ ngoài/hệ quân sự theo `systemType`; hệ thứ hai đang hoãn.

### Trạng thái

**Có trong source** cho `EXTERNAL` và `MILITARY`; dữ liệu học tập quân sự dùng các bảng riêng.

## F13 - Danh mục môn học

### Người dùng

Chỉ huy.

### Mục tiêu

Quản lý danh mục môn học dùng chung.

### Trạng thái

**Có trong source cho hệ quân sự**: danh mục môn được gắn với lớp và học kỳ; hệ ngoài giữ luồng hiện tại.

## F14 - Quản lý lớp theo hệ

### Người dùng

Chỉ huy.

### Mục tiêu

Chỉ huy quản lý lớp và xếp/chuyển học viên trong đúng hệ; lịch sử chuyển lớp được lưu lại.

### Trạng thái

**Có trong source cho hệ quân sự**: lớp quân sự độc lập, xếp/chuyển học viên và lưu lịch sử.

## F15 - Đề xuất và duyệt điểm quân sự

### Người dùng

Học viên quân sự, Chỉ huy quân sự.

### Mục tiêu

Chỉ huy có thể nhập điểm quân sự trực tiếp. Học viên cũng có thể tự nhập bảng điểm và gửi đề xuất để Chỉ huy duyệt/từ chối. Điểm chính thức từ cả hai luồng đều không được sửa/xóa.

### Trạng thái

**Có trong source cho hệ quân sự**: học viên gửi đề xuất điểm, Chỉ huy duyệt/từ chối; điểm chính thức chỉ được tạo một lần.

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
