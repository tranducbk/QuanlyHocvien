# Backend Overview

## 1. Công nghệ hiện tại

- Node.js CommonJS.
- Express 4.
- Sequelize 6 với PostgreSQL.
- Yup validation.
- JWT authentication.
- ExcelJS import/export.
- MinIO file storage.
- Swagger UI tại `/api-docs` khi server chạy.

## 2. Entry point

File: `backend/server.js`.

Luồng khởi động:

```text
server.js
→ nạp biến môi trường
→ require src/app.js
→ require src/models/index.js
→ authenticate PostgreSQL
→ app.listen
```

`backend/src/app.js` cấu hình CORS, Helmet, JSON parser, request log, `/api`, Swagger, health check, 404 và global error middleware.

## 3. Cấu trúc lớp

```text
route
→ auth/role middleware
→ controller
→ Yup validation
→ service
→ Sequelize model
→ PostgreSQL
```

- Routes: `backend/src/routes`.
- Controllers: `backend/src/controllers`.
- Services: `backend/src/services`.
- Models và quan hệ: `backend/src/models`, tập trung tại `models/index.js`.
- Validations: `backend/src/validations`.
- Middleware: `backend/src/middlewares`.
- Helper response/error: `backend/src/utils/response.js`, `apiError.js`.

## 4. API hiện tại

Router tổng tại `backend/src/routes/index.js`, gồm:

- auth, files, users;
- universities, organizations, education-levels, classes;
- yearly/semester/subject results và grade requests;
- semesters, time tables, tuition fees;
- achievements, achievement profiles, yearly achievements;
- scientific initiatives/topics;
- cut rice, duty schedules, notifications;
- dashboard/report theo role.

API response dùng dạng chung:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {}
}
```

Danh sách có thêm `pagination`.

## 5. Xác thực và phân quyền hiện tại

`backend/src/middlewares/auth.middleware.js`:

- Xác minh JWT và tải `User` kèm `Profile`.
- Gắn `req.userId` và `req.user`.
- Có helper `requireRole`, `requireStudent`, `requireAdmin`.

Hiện tại phân quyền chủ yếu theo role; chưa có `system_type` hoặc scope theo hệ. Middleware cũng mặc định tải một loại `Profile`. Đây là khoảng trống phải xử lý trước khi mở rộng ba hệ.

## 6. Dữ liệu hiện tại

`backend/src/models/index.js` khởi tạo model và khai báo quan hệ tập trung. Nhóm chính:

- Tổ chức/cơ sở: University, Organization, EducationLevel, Class.
- Tài khoản/hồ sơ: User, Profile.
- Học tập: SchoolYear, Semester, YearlyResult, SemesterResult, SubjectResult, TimeTable, TuitionFee.
- Thành tích/nghiên cứu.
- Cắt cơm, lịch trực, thông báo và grade request.

`Profile` hiện trộn thông tin cá nhân, quân nhân và đào tạo. `SubjectResult` lưu trực tiếp mã/tên môn thay vì liên kết danh mục môn.

## 7. Import/export và transaction

Nhiều service dùng ExcelJS. Một số luồng import đã dùng `db.sequelize.transaction`, nhưng cần kiểm tra từng luồng trước khi khẳng định tính nguyên tử.

## 8. Kiểm tra hiện có

Các script trong `backend/package.json`:

- `npm run swagger:check`
- `npm run test:api`
- `npm run seed`
- `npm run db:refresh`

`test:api` là script kiểm thử API tùy chỉnh, không phải test runner độc lập. `db:refresh` dùng `sync({ force: true })` và có thể xóa dữ liệu.

## 9. Trạng thái so với `QLHV.md`

Đã có nền tảng route/controller/service/model, các nghiệp vụ hệ ngoài và giao diện/API nhập kết quả.

Chưa có:

- `system_type` và scope theo hệ.
- Hồ sơ/enrollment tách theo hệ.
- Danh mục môn riêng cho ba hệ.
- Bảng điểm quân sự/dân sự riêng.
- Cơ chế điểm bất biến: Chỉ huy đúng hệ tạo trực tiếp; riêng hệ quân sự còn tạo từ đề xuất Học viên được Chỉ huy duyệt.
- Audit log nghiệp vụ đầy đủ.
- Migration có phiên bản cho đợt mở rộng.

## 10. Nguyên tắc mở rộng

- Giữ lớp kiến trúc hiện tại; không đưa nghiệp vụ vào controller.
- Mọi truy vấn nghiệp vụ phải lọc scope ở backend.
- Không dựa vào `systemType` client gửi để cấp quyền.
- Không dùng `sync({ force: true })` để thay đổi dữ liệu hiện có.
- Điểm chính thức chỉ có create/read; không có update/delete. Đề xuất quân sự đã gửi cũng không có update/delete.
