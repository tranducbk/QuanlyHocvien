# AGENTS.md

## 1. Vai trò của AI

AI làm việc như một Full-stack Developer trong repository Hệ thống Quản lý Học viên. AI phải đọc context và source liên quan, giữ kiến trúc hiện tại, triển khai đúng phạm vi task và tự kiểm tra thay đổi trước khi bàn giao.

## 2. Thứ tự đọc context

Trước khi triển khai một task:

1. Đọc `AGENTS.md`.
2. Đọc `docs/project-brief.md`.
3. Đọc task hiện tại trong `docs/tasks/`.
4. Đọc `docs/architecture/backend-overview.md` và/hoặc `docs/architecture/frontend-overview.md` theo phạm vi.
5. Đọc `docs/product/feature-list.md` khi task liên quan đến trạng thái hoặc phụ thuộc feature.
6. Đọc `QLHV.md` nếu task liên quan đến mở rộng ba hệ đào tạo, quản lý lớp hoặc kết quả học tập.
7. Đọc source và tài liệu chi tiết trong `doc/` có liên quan.

Khi tài liệu mâu thuẫn:

- `QLHV.md` là nguồn nghiệp vụ ưu tiên cho kiến trúc ba hệ và quy trình điểm mới.
- Source hiện tại là nguồn mô tả hành vi đang tồn tại.
- Task đã được chốt là nguồn xác định phạm vi thay đổi của lần triển khai.
- Phải nêu rõ mâu thuẫn; không âm thầm chọn tài liệu cũ.

## 3. Công nghệ hiện tại

### Backend

- Node.js, CommonJS.
- Express 4.
- Sequelize 6 và PostgreSQL.
- Yup cho validation.
- JWT cho xác thực.
- ExcelJS cho import/export.
- MinIO cho lưu file.

### Frontend

- Next.js App Router, React, TypeScript.
- TanStack React Query cho server state.
- Zustand cho auth và UI state.
- Axios cho API client.
- Tailwind CSS và component library nội bộ.

## 4. Quy tắc kiến trúc bắt buộc

- Backend giữ luồng `route -> controller -> service -> model` và validation trong `backend/src/validations`.
- Controller chỉ điều phối request/response; nghiệp vụ và transaction đặt trong service.
- Dùng các helper response/error hiện có thay vì tạo định dạng phản hồi mới.
- Frontend gọi API qua `frontend/services`, endpoint tập trung tại `frontend/constants/endpoints.ts`.
- Dữ liệu từ server được quản lý bằng React Query; Zustand chỉ dùng cho auth hoặc state UI dùng chung.
- Tái sử dụng hook và component hiện có trước khi tạo abstraction mới.
- Tên field JavaScript dùng camelCase; ánh xạ database theo quy ước Sequelize `underscored` hiện tại.
- Không đưa secret, token hoặc thông tin thật vào source, log, fixture hay tài liệu.

## 5. Bất biến nghiệp vụ hiện hành

- Mỗi học viên chỉ thuộc một hệ đào tạo.
- Dữ liệu đào tạo, môn học và điểm của các hệ phải được cách ly.
- Hệ ngoài/dân sự: chỉ Chỉ huy đúng hệ được tạo/import điểm.
- Hệ quân sự: Chỉ huy được nhập điểm trực tiếp; Học viên cũng có thể tạo đề xuất bảng điểm cho chính mình để Chỉ huy duyệt/từ chối.
- Điểm quân sự chính thức được tạo từ Chỉ huy nhập trực tiếp hoặc từ đề xuất đã duyệt trong transaction.
- Điểm đã nhập là bất biến: không có sửa, xóa hoặc mở khóa.
- Chỉ huy trực tiếp quản lý lớp, môn, học kỳ và điểm trong đúng hệ.
- Admin không được xem hồ sơ hoặc điểm nghiệp vụ.

Chi tiết và tiêu chí đầy đủ nằm trong `QLHV.md`.

## 6. Không được tự làm

- Không sửa file ngoài phạm vi task nếu không cần thiết để hoàn thành acceptance criteria.
- Không tự thêm dependency khi giải pháp hiện tại đã đủ.
- Không refactor diện rộng trong một task feature nhỏ.
- Không tự đổi API contract đang được frontend sử dụng mà không cập nhật đồng bộ.
- Không chạy `npm run db:refresh` trên database cần giữ dữ liệu; script này dùng `sync({ force: true })`.
- Không dùng `sequelize.sync({ force: true })` làm migration.
- Không xóa dữ liệu, reset database, commit hoặc push Git nếu người dùng chưa yêu cầu rõ.
- Không coi file trong `doc/` là chính xác tuyệt đối nếu source hoặc `QLHV.md` đã thay đổi.

## 7. Quy trình thực hiện task

1. Kiểm tra Git status và bảo vệ thay đổi có sẵn của người dùng.
2. Review mục tiêu, yêu cầu, ngoài phạm vi và tiêu chí hoàn thành.
3. Đọc source liên quan và xác định phần có thể tái sử dụng.
4. Nêu plan ngắn cho task nhiều file hoặc có migration.
5. Triển khai thay đổi nhỏ nhất đáp ứng task.
6. Chạy kiểm tra phù hợp.
7. Review `git diff --check`, `git diff --stat` và diff các file đã sửa.
8. Cập nhật context nếu kiến trúc hoặc trạng thái feature thực sự thay đổi.

## 8. Khi nào phải hỏi lại

- Requirement nghiệp vụ mâu thuẫn hoặc chưa đủ để chọn hành vi an toàn.
- Cần migration phá vỡ dữ liệu hoặc thay đổi quan hệ cốt lõi.
- Cần thêm dịch vụ ngoài, dependency mới hoặc secret.
- Cần mở rộng phạm vi sang feature khác.
- Cần thao tác xóa/reset/ghi đè dữ liệu quan trọng.

## 9. Kiểm tra sau triển khai

### Backend

Chạy trong `backend/` khi phù hợp:

- `npm run swagger:check`
- `npm run test:api` (yêu cầu backend/database test đang chạy)

`npm test` hiện chưa có test suite thực và không được dùng làm bằng chứng pass.

### Frontend

Chạy trong `frontend/`:

- `npm run lint`
- `npm run type-check`
- `npm run build` cho thay đổi có ảnh hưởng production build

### Manual

- Test acceptance criteria trên UI/API.
- Test phân quyền và trường hợp truy cập chéo hệ khi task liên quan auth.
- Kiểm tra regression ở luồng cũ liên quan.

## 10. Git

- Không tự commit hoặc push.
- Không ghi đè thay đổi không thuộc task.
- Bàn giao danh sách file thay đổi, kiểm tra đã chạy và phần chưa kiểm tra được.
