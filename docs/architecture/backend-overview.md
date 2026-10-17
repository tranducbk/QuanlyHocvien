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

## 4. API theo hệ

Router tổng tại `backend/src/routes/index.js`, gồm:

- auth, files, users;
- tài khoản, role, trạng thái và phân công hệ;
- thông tin chính trị nội bộ dùng chung;
- đơn vị, khóa, chương trình đào tạo và lớp của Hệ 1, 3, 4, 7;
- cơ sở đào tạo, tổ chức, trình độ và lớp của Hệ 5;
- môn, học kỳ, lịch học và kết quả được scope theo hệ;
- rèn luyện, thành tích, khen thưởng, kỷ luật, lịch trực và đăng ký ra ngoài;
- học phí, lịch cắt cơm, đề tài và sáng kiến của Hệ 5;
- đề xuất/duyệt điểm, thông báo, audit log và báo cáo theo quyền.
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

Middleware xác thực:

- Xác minh JWT và tải `User` kèm `Profile`.
- Gắn `req.userId` và `req.user`.
- Có helper xác thực role và hệ được gán.

Mọi API nghiệp vụ được bảo vệ theo role và hệ của tài khoản đã xác thực; không nhận hệ hoặc phạm vi phân quyền từ client. Hệ thống có năm phạm vi: Hệ 1, 3, 4, 5 và 7. Hệ 1 và Hệ 7 dùng chung nghiệp vụ với chương trình đào tạo riêng; Hệ 5 có nghiệp vụ cơ sở đào tạo, học phí và lịch cắt cơm. Thông tin chính trị nội bộ dùng model `Profile` chung.

## 6. Dữ liệu hiện tại

Model và quan hệ dữ liệu được tổ chức theo nhóm nghiệp vụ:

- Hệ 1, 3, 4, 7: đơn vị, khóa, chương trình, lớp và học viên.
- Hệ 5: cơ sở đào tạo, tổ chức/chuyên ngành, trình độ và lớp.
- Chung: User, Profile, môn, học kỳ, lịch học, kết quả, thông báo và audit log.
- Theo hệ: rèn luyện, thành tích, khen thưởng, kỷ luật, lịch trực, đề xuất điểm.
- Riêng Hệ 5: học phí, lịch cắt cơm, đề tài và sáng kiến.

`Profile` lưu thông tin chính trị nội bộ. Dữ liệu đào tạo được liên kết với học viên, hệ, lớp và chương trình tương ứng.

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

Đã có nền tảng route/controller/service/model cho tài khoản, thông tin chính trị nội bộ, lớp, học tập và các nghiệp vụ liên quan.

Đã có lớp, môn, học kỳ, lịch theo lớp, kết quả điểm và luồng học viên đề xuất/Chỉ huy duyệt. Điểm chính thức được tạo một lần, không có API sửa/xóa. Cần hoàn thiện phân quyền và trải nghiệm theo đủ năm hệ.

Còn thiếu: dashboard/báo cáo tổng hợp quân sự, import/export Excel cho các nghiệp vụ quân sự và audit log đầy đủ.

## 10. Nguyên tắc mở rộng

- Giữ lớp kiến trúc hiện tại; không đưa nghiệp vụ vào controller.
- Mọi truy vấn nghiệp vụ phải lọc scope ở backend.
- Không dựa vào `systemType` client gửi để cấp quyền.
- Không dùng `sync({ force: true })` để thay đổi dữ liệu hiện có.
- Điểm chính thức chỉ có create/read; không có update/delete. Đề xuất quân sự đã gửi cũng không có update/delete.
