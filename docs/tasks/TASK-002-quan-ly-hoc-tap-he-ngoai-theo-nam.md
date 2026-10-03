# TASK-002: Quản lý học tập theo học kỳ và năm học

## Mục tiêu

Mở rộng màn **Quản lý học tập** của Chỉ huy để ngoài cách theo dõi kết quả theo từng học kỳ còn có thể tra cứu, xem chi tiết và xuất kết quả tổng hợp theo từng năm học.

Kết quả năm học là dữ liệu tổng hợp của các học kỳ thuộc cùng học viên và năm học. Đây không phải một luồng nhập điểm độc lập và không được tạo ra cơ chế sửa/xóa điểm đã ghi nhận.

## Bối cảnh hiện tại

- Source đã có các bảng `yearly_results`, `semester_results`, `subject_results` và quan hệ năm học → học kỳ → môn học.
- Backend đã có API đọc chi tiết, danh sách và xuất Excel `yearly-results`.
- Trang `/commander/academic-results` hiện chỉ lấy `semester-results`, mặc định hiển thị học kỳ mới nhất của mỗi học viên và mở rộng để xem các học kỳ khác.
- Portal Học viên đã đọc dữ liệu theo năm rồi trải phẳng thành các nhóm học kỳ; Portal Chỉ huy chưa có giao diện quản lý theo năm.
- Bộ lọc năm học trên Portal Chỉ huy đang khai báo cứng một số năm thay vì lấy từ danh mục năm học.
- API kết quả năm hiện cho phép `ADMIN` và còn công khai `POST`, `PUT`, `DELETE`. Điều này mâu thuẫn với `QLHV.md`: Admin không được xem điểm nghiệp vụ và điểm đã nhập là bất biến.

## Người dùng và user story

### Chỉ huy

- Tôi muốn chuyển giữa hai chế độ **Theo học kỳ** và **Theo năm học** trên cùng màn Quản lý học tập.
- Tôi muốn xem mỗi học viên có kết quả gì trong một năm học và các chỉ số tổng hợp của năm đó.
- Tôi muốn mở chi tiết một kết quả năm để xem các học kỳ cấu thành và đi tiếp tới chi tiết từng học kỳ.
- Tôi muốn lọc và xuất danh sách kết quả năm trong phạm vi quản lý học tập.

### Học viên

- Tiếp tục xem kết quả của chính mình theo năm học, học kỳ và môn học như luồng hiện tại.
- Không được xem kết quả của học viên khác.

### Admin

- Không được truy cập dữ liệu kết quả học tập qua API danh sách, chi tiết hoặc export.

## Quy tắc nghiệp vụ

1. Một kết quả năm thuộc duy nhất một học viên và một năm học.
2. Một kết quả học kỳ chỉ thuộc kết quả năm của cùng học viên và cùng năm học.
3. Chế độ theo năm chỉ tổng hợp dữ liệu chính thức đã có; không có form nhập điểm năm riêng.
4. Các chỉ số năm phải dùng dữ liệu từ `yearly_results`; danh sách học kỳ cấu thành lấy từ `semester_results`.
5. Khi hiển thị chi tiết năm, không cộng GPA của các học kỳ theo trung bình cộng đơn giản. Nếu có bước tính lại trong luồng nhập điểm, GPA năm phải được tính có trọng số tín chỉ theo quy tắc nghiệp vụ hiện hành.
6. CPA là kết quả tích lũy đến cuối năm học; GPA năm là kết quả riêng của năm. UI phải dùng nhãn khác nhau, không hiển thị hai giá trị như cùng một chỉ số.
7. Không bổ sung nút hoặc API sửa, xóa, mở khóa kết quả năm/học kỳ/môn đã nhập.
8. Backend tự xác định quyền từ tài khoản đăng nhập; không tin role hoặc `commanderId` do client gửi để cấp quyền.
9. Dữ liệu và bộ lọc năm học phải lấy từ API/danh mục hiện có, không hard-code danh sách năm.
10. Không thay đổi dữ liệu lịch sử chỉ để phục vụ cách hiển thị mới.

## Phạm vi backend

### 1. API danh sách kết quả theo năm

Tái sử dụng `GET /api/yearly-results` và chuẩn hóa cho Chỉ huy:

- Chỉ cho phép tài khoản có role `COMMANDER`.
- Luôn lọc bản ghi thuộc tài khoản `STUDENT` ở service, kể cả khi client không truyền bộ lọc.
- Hỗ trợ tối thiểu các query hiện có: `page`, `limit`, `schoolYear`, `userId`, `fullName`, `unit`, `gpaFrom`, `gpaTo`, `cpaFrom`, `cpaTo`, `sortBy`, `sortOrder`.
- Danh sách trả thông tin học viên cần cho bảng: mã học viên, họ tên, đơn vị, trường, lớp; không trả secret hoặc trường tài khoản không cần thiết.
- Trả các chỉ số năm: `schoolYear`, GPA hệ 4/hệ 10, CPA hệ 4/hệ 10, tổng tín chỉ năm, tín chỉ tích lũy, tổng môn, môn đạt, môn chưa đạt, tín chỉ nợ và xếp loại học tập.
- Không bắt buộc tải toàn bộ môn học trong API danh sách để tránh payload lớn.

### 2. API chi tiết kết quả năm

Tái sử dụng `GET /api/yearly-results/:id`:

- Kiểm tra bản ghi thuộc tài khoản Học viên.
- Trả thông tin tổng hợp năm và danh sách các `semesterResults` cùng năm của đúng học viên.
- Mỗi học kỳ trả đủ ID và chỉ số tổng hợp để frontend có thể điều hướng tới màn chi tiết học kỳ hiện có.
- Không trả kết quả gắn với tài khoản không phải Học viên; trả lỗi/not found theo convention hiện tại của dự án.

### 3. Export kết quả năm

Tái sử dụng `GET /api/yearly-results/export`:

- Áp dụng cùng scope và bộ lọc với API danh sách.
- File Excel phải phản ánh đúng dữ liệu đã lọc, có tối thiểu mã học viên, họ tên, đơn vị, trường/lớp, năm học và các chỉ số GPA/CPA/tín chỉ/môn học.
- Không cho Admin hoặc Học viên export dữ liệu quản lý học tập.
- Ghi audit cho hành động export nếu hạ tầng audit của task liên quan đã sẵn sàng; nếu chưa, ghi rõ dependency thay vì tạo cơ chế log riêng.

### 4. Endpoint ghi dữ liệu cũ

- UI mới không gọi `POST`, `PUT`, `DELETE /api/yearly-results`.
- Trong technical plan phải rà soát nơi đang sử dụng ba endpoint này.
- Nếu không còn consumer hợp lệ, loại khỏi route và Swagger để tuân thủ nguyên tắc bất biến.
- Nếu luồng nhập điểm cũ vẫn phụ thuộc, không âm thầm xóa; chuyển việc tạo/cập nhật tổng hợp vào service nội bộ/transaction của luồng nhập điểm và lập kế hoạch tương thích trước khi đóng endpoint công khai.
- Tuyệt đối không giữ `PUT`/`DELETE` công khai chỉ để phục vụ màn theo năm.

### 5. Validation, query và hiệu năng

- Bổ sung validation cho query lọc/sắp xếp; chỉ cho sắp xếp theo whitelist field hợp lệ.
- Tránh nhận `sortBy` tự do rồi đưa trực tiếp vào Sequelize.
- Kiểm tra hoặc bổ sung index phù hợp cho `user_id`, `school_year` và khóa liên kết kết quả năm/học kỳ bằng migration có phiên bản nếu thực sự thiếu.
- Không dùng `sequelize.sync({ force: true })` hoặc `npm run db:refresh`.

## Phạm vi frontend

### 1. Màn danh sách

Tại `/commander/academic-results`:

- Thêm hai tab hoặc segmented control: **Theo học kỳ** và **Theo năm học**.
- Giữ hành vi hiện tại của tab Theo học kỳ, ngoại trừ việc danh sách năm học phải lấy động từ service hiện có.
- Tab Theo năm học gọi API `yearly-results` qua `frontend/services`; khai báo endpoint tại `frontend/constants/endpoints.ts` và query key riêng.
- Không gọi API trực tiếp trong component.

Để bảng Theo năm học gọn và tập trung vào thông tin cần thiết, hiển thị:

- Học viên (họ tên và mã học viên trong cùng một cột).
- Năm học.
- GPA hệ 10 và GPA hệ 4 của năm.
- Tín chỉ tích lũy.
- Xếp loại học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu/Kém).
- Hành động Xem chi tiết.

Không hiển thị riêng đơn vị, CPA và tổng tín chỉ năm ở bảng danh sách; các chỉ số
chi tiết vẫn có trong màn hình chi tiết năm học và file export.

### 2. Bộ lọc và trạng thái

- Hỗ trợ tìm theo họ tên, đơn vị và năm học.
- Danh sách năm học lấy từ API danh mục năm học; không khai báo cứng `2023-2024`, `2024-2025`, ...
- Pagination và sorting phải do server xử lý, không phân trang lại trên tập dữ liệu của riêng một trang.
- Mỗi tab có query key/cache riêng để chuyển tab không làm lẫn dữ liệu hoặc bộ lọc.
- Có loading, error, retry và empty state theo component library hiện tại.
- Trạng thái tab có thể lưu trên URL query (`view=semester|year`) để tải lại trang hoặc chia sẻ link vẫn giữ đúng chế độ; mặc định là `semester` để không làm thay đổi hành vi cũ.

### 3. Màn chi tiết năm học

Tạo màn chi tiết theo convention App Router hiện tại, dự kiến:

`/commander/academic-results/yearly/[id]`

Màn hình gồm:

- Thông tin học viên và năm học.
- Các thẻ tổng quan GPA năm, CPA, tổng tín chỉ, tín chỉ tích lũy, môn đạt/chưa đạt và xếp loại.
- Bảng các học kỳ thuộc năm: học kỳ, tổng tín chỉ, GPA hệ 10/hệ 4, CPA và tín chỉ nợ.
- Hành động xem chi tiết học kỳ điều hướng tới `/commander/academic-results/[semesterResultId]`.
- Không có thao tác sửa hoặc xóa kết quả năm.

### 4. Type và service

- Bổ sung `YEARLY_RESULTS` vào endpoints/query keys thay vì dùng chung key mơ hồ với dữ liệu học kỳ.
- Bổ sung `YearlyResultQueryRequest` và các method `getYearlyResults`, `getYearlyResultDetail`, `exportYearlyResults` trong service quản lý học tập.
- Chuẩn hóa type quan hệ `user/profile`, `semesterResults` theo đúng response thực tế; không lạm dụng `any` cho bảng mới.
- Khi export, giải phóng object URL sau khi tải file và hiển thị toast khi lỗi.

## API contract dự kiến

### Danh sách

```http
GET /api/yearly-results?page=1&limit=10&schoolYear=2025-2026&fullName=Nguyen
```

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "schoolYear": "2025-2026",
      "averageGrade10": 8.1,
      "averageGrade4": 3.3,
      "cumulativeGrade10": 7.9,
      "cumulativeGrade4": 3.15,
      "totalCredits": 36,
      "cumulativeCredits": 72,
      "totalSubjects": 12,
      "passedSubjects": 11,
      "failedSubjects": 1,
      "debtCredits": 3,
      "academicStatus": "Khá",
      "user": {
        "id": "uuid",
        "profile": {
          "code": "HV001",
          "fullName": "Nguyễn Văn A",
          "unit": "Đại đội 1"
        }
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

Tên association trong JSON phải bám serializer/convention đã thống nhất trong source khi triển khai; frontend không được phụ thuộc đồng thời vào cả `User/Profile` và `user/profile`.

## Ngoài phạm vi

- Không xây dựng lại toàn bộ công thức GPA/CPA trong task giao diện này.
- Không cho nhập một bộ điểm tổng hợp riêng ở cấp năm.
- Không bổ sung sửa, xóa hoặc mở khóa điểm.
- Không thay đổi quy trình đề xuất/duyệt điểm quân sự.
- Không refactor diện rộng toàn bộ module kết quả học tập cũ.

## Tiêu chí hoàn thành

1. Chỉ huy thấy hai chế độ Theo học kỳ và Theo năm học trên màn Quản lý học tập.
2. Tab Theo học kỳ vẫn hoạt động như trước và dùng danh sách năm học động.
3. Tab Theo năm học hiển thị đúng một dòng cho mỗi kết quả học viên/năm học mà API trả về, có pagination server-side.
4. Bộ lọc họ tên, đơn vị và năm học hoạt động; chuyển tab không làm lẫn cache hoặc dữ liệu lọc.
5. Mở chi tiết năm hiển thị đúng các học kỳ của cùng học viên và cùng năm; có thể đi tới chi tiết học kỳ.
6. Export theo năm dùng đúng bộ lọc hiện tại và tải được file Excel hợp lệ.
7. `ADMIN` và `STUDENT` không thể đọc hoặc export API quản lý kết quả năm.
8. Đổi `userId` hoặc đoán UUID không làm trả về kết quả gắn với tài khoản không phải Học viên.
9. Không xuất hiện nút/form sửa, xóa hoặc nhập điểm trực tiếp ở cấp kết quả năm.
10. Không có danh sách năm học hard-code trong màn Quản lý học tập.
11. Swagger mô tả đúng query, response và phân quyền của API kết quả năm.
12. Dữ liệu lịch sử trong `yearly_results`, `semester_results`, `subject_results` không bị thay đổi hoặc mất.
13. `npm run swagger:check`, `npm run lint`, `npm run type-check` thành công.
14. `npm run build` thành công vì task thêm route và màn hình production mới.
15. `git diff --check` không báo lỗi.

## Kịch bản kiểm thử chính

### Phân quyền

- Chỉ huy lấy được danh sách/chi tiết/export kết quả học tập.
- Admin gọi endpoint danh sách, chi tiết hoặc export bị từ chối.
- Học viên gọi endpoint quản lý danh sách, chi tiết hoặc export bị từ chối.
- UUID chi tiết của bản ghi gắn với tài khoản không phải Học viên không làm lộ nội dung.

### Danh sách và bộ lọc

- Không chọn bộ lọc: trả danh sách có phân trang.
- Lọc theo từng năm học chỉ trả đúng năm.
- Lọc kết hợp năm học, họ tên và đơn vị trả đúng giao của các điều kiện.
- Sorting field không hợp lệ bị validation từ chối hoặc quay về mặc định an toàn.
- Năm không có dữ liệu hiển thị empty state, không hiển thị lỗi giả.

### Chi tiết và tính nhất quán

- Kết quả năm 2025-2026 chỉ chứa các học kỳ của đúng học viên trong năm 2025-2026.
- Link chi tiết học kỳ mở đúng bản ghi hiện có.
- Nhãn GPA năm và CPA được hiển thị tách biệt.
- Giá trị null hiển thị bằng placeholder thống nhất, không biến thành `0` nếu backend không có dữ liệu.

### Regression

- Danh sách Theo học kỳ, chi tiết học kỳ và import/nhập điểm hiện có không bị hỏng bởi việc thêm tab năm.
- Portal Học viên tiếp tục đọc kết quả cá nhân như trước.
- Export cũ không vượt phạm vi sau khi bổ sung kiểm tra hệ.

## Ghi chú review trước implementation

Technical plan phải xác nhận:

- Middleware `requireRole('COMMANDER')` được áp dụng cho toàn bộ route quản lý kết quả năm.
- API hiện tại serialize association theo tên nào và frontend sẽ chuẩn hóa ra sao.
- Có consumer nào còn gọi `POST`, `PUT`, `DELETE /api/yearly-results` hay không.
- Chỉ số năm đang được tạo/cập nhật ở luồng nào; task này không được tự đưa ra công thức mới khi nghiệp vụ chưa chốt.
- Index/unique constraint hiện có có bảo đảm tối đa một `yearly_result` cho mỗi `user_id + school_year` hay chưa. Nếu cần bổ sung constraint, phải kiểm tra dữ liệu trùng trước migration và báo lại nếu phát hiện xung đột.

