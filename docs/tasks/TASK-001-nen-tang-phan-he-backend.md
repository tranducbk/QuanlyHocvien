# TASK-001: Nền tảng phân hệ ở backend

## Mục tiêu

Backend nhận biết người dùng thuộc hệ `EXTERNAL`, `MILITARY` hoặc `CIVILIAN` và cung cấp nền tảng scope để các task nghiệp vụ sau không truy cập chéo hệ.

## Bối cảnh cần đọc

- `AGENTS.md`
- `docs/project-brief.md`
- `docs/architecture/backend-overview.md`
- `docs/product/feature-list.md`
- `QLHV.md`, đặc biệt mục tài khoản và phân quyền
- `backend/src/models/user.js`
- `backend/src/models/index.js`
- `backend/src/middlewares/auth.middleware.js`
- auth/user service, validation, route và Swagger liên quan

## Yêu cầu

- Bổ sung `systemType` cho User với các giá trị `EXTERNAL`, `MILITARY`, `CIVILIAN` hoặc null.
- `STUDENT` và `COMMANDER` bắt buộc có `systemType`.
- `ADMIN` phải có `systemType = null`.
- Chỉ sử dụng ba role `ADMIN`, `COMMANDER`, `STUDENT`.
- Tài khoản `STUDENT`/`COMMANDER` hiện tại được backfill thành `EXTERNAL` bằng migration an toàn, lặp lại không gây hỏng dữ liệu.
- Login/refresh/profile trả `systemType` để frontend có thể định tuyến ở task sau.
- Middleware cung cấp cách kiểm tra role kết hợp system scope cho route/service sử dụng lại.
- Không tin `systemType` do client gửi để xác định phạm vi truy cập sau khi đã đăng nhập.
- Cập nhật seed/test fixture cần thiết nhưng không reset database.
- Cập nhật Swagger cho role và field mới.

## Ngoài phạm vi

- Chưa tạo `military_profiles`, `civilian_profiles` hoặc các bảng enrollment.
- Chưa tạo bảng môn, lớp theo hệ hoặc kết quả học tập mới.
- Chưa thay đổi luồng điểm/grade request hiện tại.
- Chưa refactor toàn bộ middleware permission-based.
- Không thay đổi frontend trong task này.

## Tiêu chí hoàn thành

- Migration thêm cột/backfill không xóa dữ liệu và chạy lại an toàn.
- User hiện tại có role `STUDENT`/`COMMANDER` nhận `EXTERNAL`; Admin nhận null.
- Không tạo được `STUDENT` hoặc `COMMANDER` thiếu hệ.
- Không tạo được `ADMIN` có hệ.
- Token/profile response chứa đúng `systemType`.
- Helper scope từ chối role/hệ không phù hợp và cho phép đúng role/hệ.
- API hiện tại của ba role cũ không regression trong phạm vi kiểm thử.
- `npm run swagger:check` thành công.
- `npm run test:api` thành công khi môi trường test sẵn sàng.
- `git diff --check` không báo lỗi.

## Ghi chú review trước implementation

Technical plan phải xác nhận cách migration dựa trên các script migration hiện có, constraint database cần dùng và các API/fixture bị ảnh hưởng. Không dùng `db:refresh` hoặc `sync({ force: true })`.
