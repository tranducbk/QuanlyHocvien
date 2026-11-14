# TASK-005 Phase 0: Kiểm kê dữ liệu và quyền truy cập

Ngày kiểm tra: 23/10/2026. Đây là baseline để triển khai các phase 005A–005F; không thay thế đặc tả nghiệp vụ trong `TASK-005-kien-truc-nam-he-va-dang-ky-mon-hoc.md`.

## 1. Baseline database

Chạy `node src/utils/reportPhase0Baseline.js` trong `backend/`. Script chỉ thực hiện truy vấn đọc trong transaction `READ ONLY`, không in tên tài khoản, hash hoặc dữ liệu cá nhân.

| Nhóm | Số bản ghi |
| --- | ---: |
| Hệ đào tạo | 5: `HE_1`, `HE_3`, `HE_4`, `HE_5`, `HE_7` |
| Admin chưa gán hệ | 1 |
| Chỉ huy chưa gán hệ | 1 |
| Học viên chưa gán hệ | 1 |
| Hồ sơ | 2 |
| Lớp thường, lớp quân sự | 0, 0 |
| Kết quả năm, kỳ, môn, môn quân sự | 0, 0, 0, 0 |
| Đề nghị chỉnh điểm cũ | 0 |

Task tổng ghi baseline sau reset chỉ có 1 Admin và không có tài khoản nghiệp vụ. Database hiện tại có thêm 1 Chỉ huy và 1 Học viên, cả hai chưa có `trainingSystemId`. Chủ dự án đã xác nhận hai tài khoản này được tạo cho **Hệ 5**. Script `backend/src/utils/assignPhase0He5Accounts.js` đã được chuẩn bị để gán `HE_5` và giữ `systemType=EXTERNAL` cho API legacy; **chưa chạy script, database chưa được sửa** theo yêu cầu chủ dự án tự chạy lệnh.

## 2. Ma trận quyền đích

Mỗi ô áp dụng riêng cho từng `HE_1`, `HE_3`, `HE_4`, `HE_5`, `HE_7`. Backend lấy hệ từ tài khoản đã xác thực. Với Chỉ huy, “hệ mình” còn phải giới hạn ở lớp/học viên được giao; với Học viên, “bản thân” là ID lấy từ token.

| Nhóm API | Admin | Chỉ huy | Học viên |
| --- | --- | --- | --- |
| Tài khoản | Xem/sửa toàn hệ | Xem trong phạm vi được giao nếu nghiệp vụ cho phép | Xem tài khoản của mình |
| Thông tin chính trị nội bộ | Chỉ đọc mọi hệ | Đọc/ghi trong phạm vi được giao | Chỉ đọc của mình |
| Chương trình, lớp, môn, kỳ, lịch | Theo quyền quản trị đã chốt trong task con | Quản lý trong hệ/lớp được giao | Chỉ đọc dữ liệu của mình |
| Điểm và đề nghị điểm | Không truy cập | Nhập/xem/duyệt trong phạm vi được giao | Chỉ xem của mình; đề nghị mới theo quy trình đã chốt |
| Học phí, cắt cơm, cơ sở ngoài quân đội | Chỉ quyền quản trị được chốt riêng | Chỉ Hệ 5 trong phạm vi được giao | Chỉ Hệ 5, dữ liệu của mình |
| Dashboard, báo cáo, import/export | Không nhận điểm | Chỉ dữ liệu hệ/lớp được giao | Chỉ dữ liệu của mình |

## 3. Kết quả rà soát source

### Đã xử lý trong bước này

- API `/subject-results` và `/semester-results` chỉ cho Chỉ huy truy cập; bỏ `PUT`/`DELETE` của kết quả chính thức và bỏ nút sửa/xóa tương ứng ở UI.
- API đề nghị chỉnh điểm cũ không còn nhận tạo mới hoặc duyệt cập nhật/xóa điểm; vẫn cho đọc lịch sử và từ chối đề nghị còn chờ. Admin không còn vào API đề nghị của Chỉ huy.
- `/users/reports/academic` không còn trả dữ liệu điểm cho Admin.
- Swagger của các endpoint bị gỡ được cập nhật theo route.

### Chưa đạt, phải làm ở Phase 005A hoặc task bảo vệ dữ liệu kế tiếp

| Mức | Vấn đề đã thấy | Bằng chứng chính | Hướng xử lý |
| --- | --- | --- | --- |
| Khẩn | API đọc/tạo kết quả cũ chưa lọc `trainingSystemId` và Chỉ huy được giao ở service; route `COMMANDER` chưa đủ để chặn truy cập chéo hệ hoặc bằng UUID | `subjectResult.service.js`, `semesterResult.service.js`, `yearlyResult.service.js` | Scope truy vấn danh sách, chi tiết, tạo/import/export theo user đã xác thực; kiểm tra ID liên kết tại service |
| Khẩn | Báo cáo học tập của Chỉ huy chưa lọc hệ/lớp dù đã chặn Admin | `commander.service.js#getAcademicReport` | Truyền `req.user`, lọc cùng hệ và Chỉ huy được giao |
| Khẩn | API đề nghị điểm cũ còn đường đọc chi tiết/từ chối chưa kiểm tra người quản lý trong service | `gradeRequest.service.js#getDetail/reject` | Giới hạn theo hệ, Chỉ huy và học viên được giao trước khi thao tác |
| Cao | API khác còn phân quyền theo `EXTERNAL/MILITARY`; `requireSystemType` cho Admin đi qua | `routes/index.js`, `auth.middleware.js`, `frontend/proxy.ts` | Dùng policy năm hệ phía backend, siết quyền theo capability và đồng bộ frontend |
| Cao | Nhiều route nghiệp vụ ngoài điểm vẫn cho `ADMIN` ghi; quyền Admin trong đặc tả chỉ gồm tài khoản và đọc thông tin chính trị nội bộ | Các route thành tích, lịch, học phí, hồ sơ trong `backend/src/routes` | Rà từng route và service theo ma trận; ưu tiên chặn mutation Admin |
| Cao | `npm run swagger:check` vẫn báo thiếu tài liệu cho 8 route hiện hữu | `checkSwaggerCoverage.js` | Bổ sung JSDoc theo route sau khi contract ổn định |

## 4. Cổng kiểm tra trước Phase 005B

1. Chạy script gán Hệ 5 đã được chuẩn bị và kiểm tra lại baseline; script dừng nếu số lượng tài khoản hoặc hệ hiện tại khác dự kiến.
2. API nghiệp vụ dùng `trainingSystemId` từ token, không tin hệ do client gửi; kiểm thử ma trận ba vai trò × năm hệ × endpoint.
3. Danh sách, chi tiết theo UUID, tạo/import/export và báo cáo đều chặn truy cập chéo hệ; Chỉ huy không truy cập học viên ngoài phạm vi được giao.
4. Admin không đọc được điểm qua API trực tiếp, báo cáo, dashboard hoặc export; không ghi thông tin chính trị nội bộ.
5. Điểm chính thức không có API sửa/xóa; luồng chỉnh điểm mới chỉ triển khai sau khi bất biến nghiệp vụ được chốt và tài liệu được cập nhật.
6. `swagger:check`, `test:api` trên database test riêng, frontend lint/type-check/build và kiểm tra UI thủ công đạt. Không chạy `db:refresh` để đạt cổng này.

## 5. Migration, rollback và phụ thuộc

- Thay đổi source của bước 0 gồm route/UI/tài liệu và hai script quản trị. Đến thời điểm bàn giao chưa đổi schema hoặc dữ liệu. Script gán Hệ 5 dùng transaction và tự rollback nếu điều kiện dữ liệu không đúng; sau khi đã commit, chỉ phục hồi `training_system_id`/`system_type` từ bản ghi đối soát hoặc backup dưới kiểm soát, trước khi có dữ liệu nghiệp vụ mới phụ thuộc hệ. Không hoàn nguyên bằng cách mở lại quyền đọc điểm cho Admin hay API sửa/xóa điểm.
- Phase 005A cần task triển khai riêng ghi rõ API contract, migration thêm ràng buộc, kiểm tra dữ liệu trước/sau, phương án rollback và dữ liệu thử nghiệm. Migration sau lần reset phải bảo toàn mọi dữ liệu mới phát sinh.
- Phase 005E phụ thuộc quyết định chính thức về chỉnh điểm: hiện `AGENTS.md` và đầu `QLHV.md` quy định điểm bất biến, trong khi TASK-005 mô tả chỉnh điểm có revision. Không dùng phần thiết kế đó để mở lại mutation trước khi cập nhật nguồn nghiệp vụ ưu tiên.

## 6. Kiểm tra khi chủ dự án chạy môi trường

Các lệnh cần chạy lại sau khi nhận thay đổi:

```text
cd backend
node src/utils/assignPhase0He5Accounts.js --report
node src/utils/assignPhase0He5Accounts.js --apply
node src/utils/reportPhase0Baseline.js
npm run swagger:check

cd ../frontend
npm run lint
npm run type-check
npm run build

cd ..
git diff --check
```

Trong lần kiểm tra này, `type-check`, kiểm tra cú pháp các route/script liên quan và lint riêng các file frontend liên quan đã qua. `swagger:check` còn thiếu mô tả của 8 route hiện hữu (không phải các endpoint vừa gỡ). Lint toàn frontend còn lỗi tại các file không thuộc thay đổi này. Build dừng vì môi trường không tải được font Geist từ Google Fonts; yêu cầu chạy lại ngoài sandbox không được chấp thuận. Không chạy `test:api` trên database đang cấu hình vì script có thể ghi dữ liệu thử nghiệm; chỉ chạy trên database test riêng sau khi đọc script và chuẩn bị dữ liệu.

Kiểm tra API thủ công trên môi trường test: Admin nhận 403 với `GET /api/subject-results`, `GET /api/semester-results`, `GET /api/users/reports/academic` và API đề nghị điểm của Chỉ huy; `PUT`/`DELETE` kết quả cũ và `POST` tạo/duyệt đề nghị chỉnh điểm cũ không còn route. Kiểm tra giao diện Chỉ huy không còn nút sửa/xóa điểm môn và giao diện Học viên không còn nút gửi đề nghị chỉnh điểm cũ. Chưa coi quyền Chỉ huy an toàn cho dữ liệu thật cho đến khi hoàn tất scope trong task 005A.
