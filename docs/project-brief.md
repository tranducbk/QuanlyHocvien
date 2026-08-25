# Project Brief

## 1. Tên dự án

Hệ thống Quản lý Học viên (QuanlyHocvien).

## 2. Mô tả ngắn

Ứng dụng web full-stack quản lý tài khoản, hồ sơ, cơ sở/lớp đào tạo, kết quả học tập, lịch học, lịch cắt cơm, học phí, thành tích, lịch trực, thông báo và báo cáo cho học viên quân đội.

Hệ thống hiện tại chủ yếu phục vụ quân nhân được cử đi học tại trường ngoài. Định hướng trong `QLHV.md` mở rộng thành ba hệ độc lập: hệ ngoài, nội bộ quân sự và nội bộ dân sự.

## 3. Mục tiêu

- Quản lý tập trung hồ sơ và quá trình đào tạo của học viên.
- Cung cấp đúng chức năng theo vai trò và hệ đào tạo.
- Cách ly dữ liệu giữa các hệ, tránh truy cập hoặc nhập nhầm dữ liệu.
- Chuẩn hóa nhập điểm trực tiếp và quy trình đề xuất/duyệt điểm quân sự, báo cáo và truy vết thao tác.
- Giữ nguyên dữ liệu hệ ngoài khi mở rộng kiến trúc.

## 4. Người dùng

- `ADMIN`: quản trị tài khoản, role, trạng thái và danh mục kỹ thuật; không xem hồ sơ/điểm nghiệp vụ.
- `COMMANDER`: quản lý học viên, nhập điểm trực tiếp trong đúng hệ và duyệt/từ chối đề xuất điểm quân sự.
- `STUDENT`: xem dữ liệu cá nhân, lịch và kết quả của chính mình.

Hệ thống sử dụng ba role `ADMIN`, `COMMANDER`, `STUDENT`; không có role Giảng viên.

## 5. Chức năng chính

- Xác thực, đổi mật khẩu và quản lý trạng thái tài khoản.
- Quản lý hồ sơ học viên.
- Quản lý trường, tổ chức/chuyên ngành, trình độ và lớp hệ ngoài.
- Quản lý học kỳ, lịch học, học phí, thành tích và nghiên cứu khoa học.
- Quản lý kết quả môn, học kỳ, năm học và báo cáo.
- Quản lý lịch cắt cơm, yêu cầu cắt cơm, lịch trực và thông báo.
- Import/export Excel ở các nghiệp vụ hỗ trợ.
- Mở rộng hồ sơ, enrollment, môn, lớp và điểm riêng cho từng hệ.

## 6. Phạm vi

### Có làm

- Web application có backend REST API và frontend theo role.
- PostgreSQL lưu dữ liệu nghiệp vụ.
- Xác thực JWT và phân quyền ở backend.
- Quản lý file qua MinIO.
- Migration an toàn, bảo toàn dữ liệu hiện tại khi triển khai kiến trúc mới.

### Không làm hoặc chưa làm

- Không cho học viên chuyển giữa các hệ đào tạo.
- Không cho sửa, xóa hoặc mở khóa điểm đã nhập.
- Không có role, phân quyền hoặc portal dành cho Giảng viên.
- Chưa triển khai đầy đủ lớp và giao diện hệ dân sự ở giai đoạn đầu.
- Không dùng reset database thay cho migration trên dữ liệu thật.

## 7. Công nghệ chính

- Backend: Node.js, Express, Sequelize, PostgreSQL, Yup, JWT, ExcelJS, MinIO.
- Frontend: Next.js App Router, React, TypeScript, React Query, Zustand, Axios, Tailwind CSS.
- Tài liệu API: Swagger/OpenAPI sinh từ JSDoc route và schema cấu hình.

## 8. Nguồn sự thật

- `QLHV.md`: đặc tả mở rộng ba hệ và quy trình điểm mới.
- `docs/product/feature-list.md`: bản đồ feature và trạng thái theo source.
- `docs/architecture/`: mô tả kiến trúc thực tế hiện tại.
- `doc/`: tài liệu chi tiết của hệ thống cũ; có thể chưa đồng bộ với `QLHV.md`.
- Source code: hành vi đang tồn tại thực tế.

## 9. Điều kiện hoàn thành định hướng mở rộng

- Ba hệ có dữ liệu đào tạo, môn và điểm cách ly.
- Không API nào làm lộ dữ liệu chéo hệ.
- Chỉ Chỉ huy đúng hệ tạo điểm trực tiếp.
- Điểm quân sự còn có thể được tạo từ đề xuất của Học viên sau khi Chỉ huy quân sự duyệt.
- Điểm đã nhập không thể sửa hoặc xóa.
- Chỉ huy quản lý lớp và dữ liệu nghiệp vụ trong đúng hệ.
- Admin không truy cập được hồ sơ/điểm.
- Dữ liệu hệ ngoài hiện tại được migration và bảo toàn.
- Backend API, frontend và tài liệu được kiểm thử/cập nhật đồng bộ.
