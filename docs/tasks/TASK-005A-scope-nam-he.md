# TASK-005A: Hoàn thiện scope năm hệ và bảo vệ API hiện hành

## Trạng thái

Đăng nhập Chỉ huy Hệ 1 từng bị chuyển tới `/commander/military/unavailable` và nhận 404 khi route tạm này không có trong frontend đang chạy. Trang thông báo tạm hiện nằm ngay tại `/commander`; proxy và sidebar của Hệ 1/3/4/7 cùng dùng URL này cho đến khi phân hệ quân sự có dữ liệu riêng.

Đã đạt cổng kiểm tra Phase 005A theo phạm vi route được chọn. Theo output chủ dự án cung cấp, unit test phạm vi Chỉ huy đạt 2/2, `swagger:check` đạt với 220 phương thức route được mô tả, frontend `lint` đạt với 0 lỗi/9 cảnh báo, `type-check` đạt sau khi loại file `.next/dev/types/validator.ts` sinh lỗi, và production `build` đạt sau lần sửa form hồ sơ gần nhất. Kiểm tra service và route HTTP trên PostgreSQL test có schema ứng dụng đầy đủ đã đạt cho danh sách/chi tiết hồ sơ, phạm vi Chỉ huy, quyền Admin và chặn route kết quả chéo hệ. Bài thử HTTP import/export Excel, cập nhật hồ sơ cá nhân, chặn sửa điểm, kết quả môn/học kỳ/năm có dữ liệu và báo cáo học tập đã đạt trên database test theo output chủ dự án cung cấp. Chủ dự án xác nhận trên UI rằng Chỉ huy lưu được địa chỉ học viên và Admin nhìn thấy Hệ 5 cho hai tài khoản. Auth dùng hệ gắn trên tài khoản; API kết quả học tập Hệ 5 và báo cáo của Chỉ huy được scope theo học viên được giao. Các route quân sự legacy tạm trả 403 vì bảng hiện tại chưa có khóa phân biệt Hệ 1/3/4/7; cần Phase 005B/005C trước khi mở lại. Bài thử không chứng minh mọi phương thức trong 220 route đã được kiểm tra runtime.

Rà soát tiếp sau khi đối soát tài khoản Hệ 5 phát hiện API cập nhật hồ sơ hàng loạt và xác nhận ra trường hàng loạt trước đây tìm Học viên theo mã trên toàn hệ thống. Service đã được bổ sung kiểm tra cùng hệ và đúng Chỉ huy được giao; cập nhật hồ sơ hàng loạt từ chối ghi điểm, phân công Chỉ huy và quan hệ lớp/cơ sở. Kiểm tra service và import Excel qua HTTP trên database test đã đạt cho một Học viên được giao, một Học viên cùng hệ chưa được giao và một Học viên hệ khác.

Kiểm tra riêng: `node --test test/commanderBatchScope.test.js` đã đạt 2/2 theo output chủ dự án cung cấp; `npm run swagger:check` cũng đạt 220 phương thức route. Bài thử service trên database test có schema ứng dụng đầy đủ đã xác nhận mỗi API hàng loạt chỉ thay đổi Học viên được giao, không thay đổi Học viên cùng hệ chưa được giao hay Học viên hệ khác. Lần chạy đầu đã phát hiện payload cập nhật còn chứa `code`, kết nối database thừa lúc nạp model và Swagger chưa khớp route; các lỗi này đã được sửa trước lần chạy đạt.

Đã chuẩn bị `backend/test/runCommanderScopeIntegration.ps1` và `commanderScopeIntegration.js` cho bước thử service với PostgreSQL test. PowerShell script tạo database mới trong container test, truyền `DB_HOST`/`DB_PORT`/`DB_NAME` cục bộ cho tiến trình Node rồi khôi phục môi trường. Node script xác nhận database mới rỗng, dùng `sequelize.sync()` không `force` chỉ để dựng schema test, tạo tài khoản giả và thử danh sách/chi tiết/cập nhật/ra trường theo phạm vi Chỉ huy, cùng quyền xem điểm của Admin. Đây là kiểm tra service với database thật, chưa thay thế thử API/Excel/UI đầy đủ.
Lần chạy đầu do chủ dự án cung cấp dừng trước khi dựng schema vì Sequelize bật SSL cho mọi `DATABASE_URL`, còn PostgreSQL test cục bộ không hỗ trợ SSL. Harness đã được sửa để chỉ dùng `DB_HOST`/`DB_PORT`/`DB_NAME` cục bộ; Node test xóa `DATABASE_URL` trong chính tiến trình trước khi nạp `.env`. Lần chạy tiếp theo trên database test `qlhv_scope_test_12350c0f` đã đạt theo output chủ dự án: danh sách/chi tiết, cập nhật hàng loạt, xác nhận ra trường và quyền xem điểm của Admin đúng phạm vi. Bài thử route HTTP đã đạt trên chính database test này cho đủ Hệ 1, 3, 4, 5, 7 và quyền Admin ở các route hồ sơ/kết quả được chọn: GET/PUT chi tiết của người không được giao trả 404; Học viên và Admin bị chặn ở route không thuộc quyền với 403; route quân sự legacy vẫn trả 403 như thiết kế tạm thời. Các dòng `[ERROR]` trong log là phản hồi 403/404 được mong đợi.

Lần chạy bài thử có dữ liệu điểm tổng hợp đầu tiên dừng ở `GET /yearly-results/:id` với HTTP 500 (`Cannot read properties of undefined (reading 'push')`) khi Sequelize eager-load học kỳ. Service đã được đổi sang tải năm học theo phạm vi Chỉ huy trước, sau đó tải học kỳ bằng `yearlyResultId` và `userId` của bản ghi đã được phép xem. Lần chạy tiếp theo qua được HTTP 500 nhưng bài thử dùng khóa `SemesterResults` trong khi helper response chuẩn hóa thành `semesterResults`; đã sửa bài thử. Lần chạy sau cùng đạt: danh sách/chi tiết kết quả môn, học kỳ, năm và báo cáo học tập chỉ chứa dữ liệu học viên được giao, theo output chủ dự án cung cấp.

## Mục tiêu và phạm vi

1. Backend xác định `trainingSystemId` của Chỉ huy/Học viên từ tài khoản đã xác thực. Tài khoản nghiệp vụ không có hệ bị từ chối ở API nghiệp vụ, không rơi về `EXTERNAL` mặc định.
2. Tạo helper/policy chung cho năm mã hệ và capability Hệ 5. Không tin `systemType`, `trainingSystemId`, `commanderId` hay `studentId` do client gửi để cấp quyền.
3. Scope danh sách, chi tiết theo ID, tạo, import, export và báo cáo học tập cũ theo hệ và phạm vi Chỉ huy được giao. Ưu tiên `subjectResult`, `semesterResult`, `yearlyResult`, `gradeRequest`, `/users/reports/academic` và dashboard liên quan.
4. Kiểm tra route nghiệp vụ khác có Admin ghi hoặc đọc điểm; áp dụng ma trận quyền tại `TASK-005-phase-0-audit.md`. Admin chỉ ghi tài khoản và chỉ đọc thông tin chính trị nội bộ.
5. Đồng bộ auth context, `frontend/proxy.ts`, sidebar, service và endpoint với policy backend. Backend vẫn là lớp quyết định cuối cùng.

## Điều kiện trước khi sửa dữ liệu

Database hiện có 1 Chỉ huy và 1 Học viên chưa gán hệ. Chủ dự án đã xác nhận cả hai thuộc Hệ 5. Trước khi siết scope, chủ dự án chạy `backend/src/utils/assignPhase0He5Accounts.js --report`, sau đó `--apply` và kiểm tra lại bằng script chỉ đọc `backend/src/utils/reportPhase0Baseline.js`. Script dừng nếu số lượng tài khoản hoặc hệ/phân loại legacy không đúng dự kiến; không xóa hoặc reset dữ liệu.


## Thiết kế triển khai

- Tách middleware xác thực role khỏi policy hệ; policy phải đối chiếu `trainingSystemId` với danh mục hệ đang hoạt động. Admin được phép đi qua chỉ ở API quản trị tài khoản hoặc đọc hồ sơ đã chỉ định, không đi qua mặc định ở API nghiệp vụ.
- Service nhận requester do controller truyền. Truy vấn danh sách và chi tiết phải gắn điều kiện hệ và quan hệ được giao ngay trong query hoặc kiểm tra trong cùng transaction trước khi ghi.
- Với API legacy dùng bảng `EXTERNAL/MILITARY`, chỉ giữ hoạt động cho các hệ đã xác định được ánh xạ hợp lệ. Những bảng không thể phân biệt Hệ 1/3/4/7 an toàn phải được bảo vệ hoặc ngừng nhận dữ liệu mới cho đến khi Phase 005B/005C cung cấp schema chuẩn.
- Không đổi công thức điểm hay luồng sửa điểm. Endpoint tạo điểm phải kiểm tra học viên/lớp/hệ và chống trùng. Điểm đã tạo không có sửa/xóa.
- Cập nhật Swagger sau khi đổi route; không thêm dependency nếu stack hiện tại đáp ứng.

## Tiêu chí nghiệm thu

- Ma trận `ADMIN`, `COMMANDER`, `STUDENT` × `HE_1/3/4/5/7` được kiểm bằng tài khoản test; truy cập chéo hệ với UUID hợp lệ bị chặn ở cả danh sách, chi tiết, import/export và báo cáo.
- Chỉ huy cùng hệ nhưng không được giao học viên/lớp cũng bị chặn. Học viên chỉ xem dữ liệu của chính mình.
- Admin không xem điểm ở mọi endpoint và không ghi thông tin chính trị nội bộ. Không có route sửa/xóa điểm chính thức.
- Tài khoản chưa gán hệ không truy cập API nghiệp vụ; luồng quản trị tài khoản của Admin vẫn hoạt động.
- API contract/frontend được cập nhật đồng bộ; `swagger:check`, kiểm thử API trên database test riêng, frontend lint/type-check/build và kiểm tra UI thủ công đạt hoặc có danh sách lỗi tồn đọng rõ ràng.

## Migration và rollback

- Chỉ bổ sung constraint/index sau khi báo cáo kiểm tra dữ liệu cho thấy không có tài khoản hoặc quan hệ xung đột. Dùng migration chạy lặp an toàn; tuyệt đối không dùng `db:refresh` hay `sync({ force: true })`.
- Mọi bước dữ liệu phải có bản backup và truy vấn đối soát trước/sau. Nếu migration lỗi, rollback transaction hoặc migration đảo chiều đã được kiểm tra trên database test. Không hoàn nguyên bằng cách mở lại quyền đọc điểm cho Admin hay API sửa/xóa điểm.
