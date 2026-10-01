# Project Brief

## 1. Tên dự án

Hệ thống Quản lý Học viên (QuanlyHocvien).

## 2. Mô tả ngắn

Ứng dụng web full-stack quản lý tài khoản, hồ sơ, lớp, kết quả học tập, lịch học, thành tích, lịch trực, thông báo và báo cáo cho học viên quân đội. Hệ quân sự được quản lý trực tiếp theo lớp, không gắn với cơ sở đào tạo, học phí hay cắt cơm. Dữ liệu được phân tách theo hệ đào tạo; hệ quân sự triển khai trước, hệ thứ hai đang chờ.

## 3. Mục tiêu

- Quản lý tập trung hồ sơ và quá trình đào tạo của học viên.
- Cung cấp đúng chức năng theo vai trò.
- Chuẩn hóa quản lý kết quả theo môn, học kỳ và năm học, báo cáo và truy vết thao tác.
- Giữ nguyên dữ liệu hiện tại khi nâng cấp kiến trúc.

## 4. Người dùng

- `ADMIN`: quản trị tài khoản, role, trạng thái và danh mục kỹ thuật; không xem hồ sơ/điểm nghiệp vụ.
- `COMMANDER`: quản lý học viên, lớp, học kỳ và kết quả học tập.
- `STUDENT`: xem dữ liệu cá nhân, lịch và kết quả của chính mình.

Hệ thống sử dụng ba role `ADMIN`, `COMMANDER`, `STUDENT`; không có role Giảng viên.

## 5. Chức năng chính

- Xác thực, đổi mật khẩu và quản lý trạng thái tài khoản.
- Quản lý hồ sơ học viên.
- Quản lý trường, tổ chức/chuyên ngành, trình độ và lớp.
- Quản lý học kỳ, lịch học, học phí, thành tích và nghiên cứu khoa học.
- Quản lý kết quả môn, học kỳ, năm học và báo cáo.
- Quản lý lịch cắt cơm, yêu cầu cắt cơm, lịch trực và thông báo.
- Import/export Excel ở các nghiệp vụ hỗ trợ.

## 6. Phạm vi

### Có làm

- Web application có backend REST API và frontend theo role.
- PostgreSQL lưu dữ liệu nghiệp vụ.
- Xác thực JWT và phân quyền ở backend.
- Quản lý file qua MinIO.
- Migration an toàn, bảo toàn dữ liệu hiện tại khi thay đổi schema.

### Không làm hoặc chưa làm

- Không cho sửa, xóa hoặc mở khóa điểm đã nhập.
- Không có role, phân quyền hoặc portal dành cho Giảng viên.
- Không dùng reset database thay cho migration trên dữ liệu thật.

## 7. Công nghệ chính

- Backend: Node.js, Express, Sequelize, PostgreSQL, Yup, JWT, ExcelJS, MinIO.
- Frontend: Next.js App Router, React, TypeScript, React Query, Zustand, Axios, Tailwind CSS.
- Tài liệu API: Swagger/OpenAPI sinh từ JSDoc route và schema cấu hình.

## 8. Nguồn sự thật

- `QLHV.md`: ghi quyết định hiện hành ở đầu file; các chi tiết cũ chỉ là lịch sử nếu TASK-003 chưa xác nhận lại.
- `docs/product/feature-list.md`: bản đồ feature và trạng thái theo source.
- `docs/architecture/`: mô tả kiến trúc thực tế hiện tại.
- `doc/`: tài liệu chi tiết của hệ thống cũ; có thể chưa đồng bộ với `QLHV.md`.
- Source code: hành vi đang tồn tại thực tế.

## 9. Điều kiện hoàn thành định hướng

- API nghiệp vụ phân quyền đúng theo ba role hiện hành.
- Chỉ Chỉ huy được truy cập API quản lý điểm; Học viên chỉ xem dữ liệu cá nhân.
- Điểm đã nhập không thể sửa hoặc xóa.
- Chỉ huy quản lý lớp và dữ liệu nghiệp vụ.
- Admin không truy cập được hồ sơ/điểm.
- Dữ liệu hiện tại được bảo toàn.
- Backend API, frontend và tài liệu được kiểm thử/cập nhật đồng bộ.
