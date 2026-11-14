# TASK-005: Chuẩn hóa kiến trúc năm hệ và quản lý đăng ký môn học

## 1. Trạng thái

- Trạng thái: Phase 005A hoàn tất; các API học tập chưa được chuyển sang mô hình mới.
- Loại task: Thiết kế kiến trúc và kế hoạch chuyển đổi nhiều giai đoạn.
- Phạm vi hệ đào tạo: Hệ 1, Hệ 3, Hệ 4, Hệ 5 và Hệ 7.
- Điều kiện triển khai: Phải tách thành các phase nhỏ; không triển khai toàn bộ theo kiểu big bang.

## 2. Mục tiêu

Chuẩn hóa mô hình dữ liệu và luồng nghiệp vụ đào tạo để:

1. Mọi dữ liệu nghiệp vụ được phân hệ rõ ràng theo `HE_1`, `HE_3`, `HE_4`, `HE_5`, `HE_7`.
2. Hệ 1, Hệ 3, Hệ 4 và Hệ 7 quản lý môn học theo chương trình đào tạo chung của khóa/lớp.
3. Hệ 5 cho phép từng học viên tự khai báo danh sách môn học thực tế của từng kỳ tại cơ sở đào tạo ngoài quân đội, sau đó Chỉ huy duyệt.
4. Thống nhất mô hình môn học mở, đăng ký học và kết quả học tập để không phải duy trì các bảng và luồng xử lý riêng lẻ theo từng hệ.
5. Đặt tên thư mục, file, model, API và field rõ nghĩa, chuyên nghiệp, đồng nhất với kiến trúc hiện tại.
6. Tạo dữ liệu mới theo năm hệ sau lần reset database đã được người dùng yêu cầu; không ánh xạ dữ liệu `EXTERNAL | MILITARY` cũ.

## 3. Căn cứ và thứ tự ưu tiên

Task này phải được triển khai theo các tài liệu sau:

1. `AGENTS.md`.
2. `docs/project-brief.md`.
3. Task này.
4. `docs/architecture/backend-overview.md`.
5. `docs/architecture/frontend-overview.md`.
6. `docs/product/feature-list.md`.
7. Phần trạng thái và bất biến nghiệp vụ ở đầu `QLHV.md`.
8. Source hiện tại và tài liệu chi tiết trong `doc/`.

Khi có mâu thuẫn, quyết định bỏ kiến trúc phân hệ tại đầu `QLHV.md`, các bất biến trong `AGENTS.md` và quyết định đã chốt trong task này được ưu tiên. Source hiện tại chỉ được xem là hành vi đang tồn tại cần chuyển đổi, không mặc nhiên là kiến trúc đích.

### 3.1. Quyết định khởi tạo lại dữ liệu

Người dùng đã yêu cầu xóa dữ liệu trong database PostgreSQL hiện đang cấu hình và chỉ tạo lại danh mục năm hệ cùng tài khoản Admin. Đây là ngoại lệ một lần đối với mục tiêu bảo toàn dữ liệu cũ trong `QLHV.md` và `docs/project-brief.md`. Reset đã hoàn tất và được kiểm tra: 5 hệ, 1 Admin, các bảng nghiệp vụ khác trống. Từ thời điểm này, các migration tiếp theo vẫn phải bảo toàn dữ liệu mới phát sinh.

### 3.2. Mâu thuẫn nghiệp vụ cần được xử lý trước khi code

Yêu cầu mới cho phép Chỉ huy chỉnh sửa kết quả học tập và cho phép Học viên gửi yêu cầu chỉnh sửa điểm. Yêu cầu này mâu thuẫn trực tiếp với bất biến hiện tại trong `AGENTS.md` và `QLHV.md`: điểm đã nhập không có sửa, xóa hoặc mở khóa.

Task này ghi nhận thiết kế đích theo yêu cầu mới, nhưng chưa được dùng làm căn cứ code phần chỉnh điểm cho đến khi:

1. Chủ dự án xác nhận thay đổi bất biến nghiệp vụ.
2. `AGENTS.md` và phần trạng thái đầu `QLHV.md` được cập nhật đồng bộ.
3. Quyền chỉnh điểm, dữ liệu bắt buộc và yêu cầu lưu vết được chốt trong task triển khai Phase 005E.

Không được âm thầm triển khai ngoại lệ trong khi tài liệu nguồn vẫn quy định điểm bất biến.

## 4. Hiện trạng và vấn đề cần giải quyết

### 4.1. Phân hệ chưa phản ánh đúng nghiệp vụ

Source hiện tại chủ yếu phân biệt `EXTERNAL` và `MILITARY`. Cách phân loại này không thể hiện đầy đủ năm hệ độc lập, gây khó khăn khi scope dữ liệu, phân quyền và bật/tắt chức năng theo hệ.

### 4.2. Dữ liệu lớp và học tập đang bị tách theo loại hệ

Các khái niệm tương đương đang dùng tên hoặc bảng khác nhau, ví dụ lớp thường và lớp quân sự, `classId` và `militaryClassId`, cùng các model kết quả học tập riêng. Việc này làm tăng nhánh điều kiện, khó tái sử dụng service và khó bảo đảm chống truy cập chéo hệ.

### 4.3. Hai cơ chế tổ chức học tập khác nhau

- Hệ 1, Hệ 3, Hệ 4 và Hệ 7: học viên cùng khóa/lớp thường học chung các môn đã được xác định trong chương trình đào tạo.
- Hệ 5: mỗi học viên có thể học tại trường khác nhau, ở kỳ khác nhau và chọn các môn khác nhau. Không thể lấy một danh sách môn chung của lớp để áp dụng cho tất cả học viên.

Hai cơ chế này cần dùng chung lõi dữ liệu học tập nhưng có chính sách tạo đăng ký môn khác nhau.

## 5. Quyết định nghiệp vụ đã chốt

### 5.1. Danh mục hệ đào tạo

Hệ thống dùng danh mục chính thức:

- `HE_1`
- `HE_3`
- `HE_4`
- `HE_5`
- `HE_7`

`TrainingSystem` là model chuẩn. Các tài khoản Chỉ huy và Học viên phải có `trainingSystemId`. Admin có thể không thuộc một hệ cụ thể vì cần quản trị tài khoản toàn hệ thống.

### 5.2. Hệ 1 và Hệ 7

Hệ 1 và Hệ 7 có cùng quy trình nghiệp vụ quản lý. Sự khác nhau nằm ở dữ liệu chương trình đào tạo, không tạo controller, service hoặc policy nghiệp vụ riêng cho từng hệ.

### 5.3. Hệ 1, Hệ 3, Hệ 4 và Hệ 7

Các hệ này dùng cơ chế `COHORT`:

1. Admin/Chỉ huy có thẩm quyền gán chương trình và phiên bản chương trình cho khóa/lớp.
2. Danh sách môn của kỳ được lấy từ chương trình đào tạo.
3. Khi lập kế hoạch kỳ cho lớp, hệ thống tạo các `CourseOffering` dùng chung cho lớp.
4. Hệ thống tạo `CourseEnrollment` cho các học viên đang có hiệu lực trong lớp.
5. Học viên không tự tạo môn học ngoài kế hoạch chung trong phạm vi task này.

### 5.4. Hệ 5

Hệ 5 dùng cơ chế `INDIVIDUAL`:

1. Mỗi học viên được quản lý quá trình học tại cơ sở đào tạo ngoài quân đội theo từng giai đoạn.
2. Mỗi kỳ thực học của học viên được ghi bằng `StudentTermEnrollment` và liên kết với kỳ của cơ sở đào tạo.
3. Học viên tự nhập danh sách môn học mình đăng ký trong kỳ đó.
4. Dữ liệu học viên nhập ban đầu là đề nghị đăng ký môn, không được ghi trực tiếp vào danh mục môn chuẩn hoặc bảng đăng ký học chính thức.
5. Học viên chỉ được sửa hoặc xóa đề nghị khi còn ở trạng thái `DRAFT`.
6. Sau khi gửi, đề nghị trở thành bất biến đối với học viên và Chỉ huy duyệt hoặc từ chối toàn bộ danh sách trong phiên bản đầu tiên.
7. Khi duyệt, service thực hiện trong một transaction: chuẩn hóa/tìm hoặc tạo môn theo phạm vi cơ sở đào tạo; tìm hoặc tạo lớp học phần cá nhân; tạo đăng ký học; cập nhật trạng thái đề nghị; tạo thông báo nếu hạ tầng hiện có hỗ trợ.
8. Nếu một bước thất bại, toàn bộ transaction phải rollback.
9. Nhập điểm là luồng độc lập. Việc duyệt danh sách môn không đồng nghĩa với duyệt kết quả học tập.

### 5.5. Kết quả học tập

- Chỉ Chỉ huy được truy cập API quản lý kết quả học tập.
- Học viên chỉ xem kết quả của chính mình qua API dành cho Học viên.
- Admin không được xem điểm nghiệp vụ.
- Chỉ huy được chỉnh sửa kết quả của học viên thuộc phạm vi mình quản lý.
- Mọi lần chỉnh sửa phải có lý do, người thực hiện, thời điểm thực hiện và giá trị trước/sau; không được ghi đè làm mất lịch sử.
- Học viên không được tự sửa điểm. Học viên chỉ được gửi yêu cầu chỉnh sửa điểm kèm lý do và thông tin đối chiếu cho Chỉ huy.
- Chỉ huy có thể duyệt hoặc từ chối yêu cầu chỉnh sửa. Khi duyệt, Chỉ huy xác nhận giá trị điểm mới; hệ thống cập nhật kết quả hiện hành và tạo lịch sử chỉnh sửa trong cùng transaction.
- Chỉ huy vẫn có thể chủ động chỉnh sửa khi phát hiện sai sót mà không cần yêu cầu từ Học viên, nhưng bắt buộc nhập lý do.
- Không cung cấp thao tác xóa kết quả. Các bản ghi lịch sử chỉnh sửa là bất biến.
- Kết quả phải tham chiếu `CourseEnrollment`, không tham chiếu trực tiếp tới một chuỗi tên môn do người dùng nhập.

## 6. Kiến trúc dữ liệu đích

### 6.1. Phân hệ và chương trình đào tạo

#### `TrainingSystem`

Các field tối thiểu:

- `id`
- `code`: duy nhất, thuộc năm giá trị đã chốt
- `name`
- `isActive`

`enrollmentMode` là quy tắc cố định trong backend, không phải cột của `TrainingSystem`:

```text
HE_1, HE_3, HE_4, HE_7 -> COHORT
HE_5 -> INDIVIDUAL
```

Định nghĩa policy tại một nơi và kiểm thử theo từng hệ. Backend không nhận giá trị này từ client.

#### `TrainingProgram`

Đại diện chương trình đào tạo của một hệ/ngành/khóa.

Các field chính:

- `trainingSystemId`
- `code`
- `name`
- `description`
- `isActive`

#### `CurriculumVersion`

Quản lý phiên bản chương trình theo thời gian, tránh sửa trực tiếp chương trình đã áp dụng cho học viên.

#### `CurriculumSubject`

Liên kết môn học với phiên bản chương trình, gồm kỳ dự kiến, số tín chỉ và thứ tự học.

### 6.2. Lớp và lịch sử xếp lớp

#### `TrainingClass`

Thay thế cách dùng song song lớp thường và lớp quân sự ở kiến trúc đích.

Các field chính:

- `trainingSystemId`
- `code`
- `name`
- `commanderId`
- `trainingProgramId`
- `curriculumVersionId`
- `startYear`
- `endYear`
- `status`

#### `TrainingClassHistory`

Ghi nhận thời gian học viên thuộc một lớp để hỗ trợ chuyển lớp, chuyển khóa và truy vết dữ liệu lịch sử. Không ghi đè lịch sử cũ khi học viên đổi lớp.

### 6.3. Quá trình học của từng học viên

#### `StudentProgramEnrollment`

Ghi một giai đoạn học chương trình của học viên, gồm:

- `studentId`
- `trainingSystemId`
- `trainingProgramId`
- `curriculumVersionId`
- `trainingClassId`, có thể nullable với Hệ 5
- `educationProviderId`, bắt buộc theo nghiệp vụ Hệ 5
- ngày bắt đầu/kết thúc và trạng thái

#### `AcademicTerm`

Đại diện một kỳ học thực tế:

- Với `COHORT`: kỳ thuộc hệ/chương trình và được dùng chung cho lớp.
- Với Hệ 5: kỳ thuộc cơ sở đào tạo ngoài quân đội; không giả định mọi học viên Hệ 5 học cùng kỳ.

Các field chính:

- `trainingSystemId`
- `educationProviderId`, nullable với các hệ `COHORT`
- `code`
- `name`
- `academicYear`
- `startDate`
- `endDate`
- `status`

#### `StudentTermEnrollment`

Ghi nhận một học viên thực tế học một kỳ nào, gồm:

- `studentProgramEnrollmentId`
- `academicTermId`
- `studyYearNumber`
- `termNumber`
- `status`

Không suy ra kỳ hiện tại chỉ từ lớp hoặc năm tuyển sinh, đặc biệt đối với Hệ 5.

### 6.4. Môn học, lớp học phần và đăng ký học

#### `AcademicSubject`

Danh mục môn đã được chuẩn hóa. Môn của Hệ 5 cần được scope theo cơ sở đào tạo khi mã/tên môn không có ý nghĩa dùng chung toàn hệ thống.

#### `CourseOffering`

Đại diện một môn được mở trong một kỳ.

Các field chính:

- `trainingSystemId`
- `academicTermId`
- `academicSubjectId`
- `offeringMode`: `COHORT` hoặc `INDIVIDUAL`
- `trainingClassId`: bắt buộc với `COHORT`, nullable với `INDIVIDUAL`
- `trainingProgramId`
- `subjectCodeSnapshot`
- `subjectNameSnapshot`
- `creditsSnapshot`
- `status`

Snapshot phải được giữ để dữ liệu lịch sử không thay đổi khi danh mục môn được cập nhật sau này.

`CourseOffering.offeringMode` ghi cách tổ chức của từng môn mở. Backend tự xác định và kiểm tra giá trị này theo policy của hệ; client không được chọn.

#### `CourseEnrollment`

Đại diện việc một học viên học một `CourseOffering` cụ thể.

Các field chính:

- `studentTermEnrollmentId`
- `courseOfferingId`
- `source`: `CURRICULUM`, `STUDENT_PROPOSAL` hoặc nguồn hợp lệ khác được chốt sau
- `status`
- `enrolledAt`

Phải có unique constraint ngăn tạo trùng đăng ký cho cùng học viên/kỳ/lớp học phần.

### 6.5. Đề nghị đăng ký môn của Hệ 5

#### `CourseRegistrationProposal`

Các field chính:

- `studentId`
- `studentTermEnrollmentId`
- `status`: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`
- `submittedAt`
- `reviewedAt`
- `reviewedBy`
- `reviewNote`

#### `CourseRegistrationProposalItem`

Các field do học viên khai báo:

- `subjectCode`
- `subjectName`
- `credits`
- thông tin bổ sung thực sự cần cho đối chiếu, nếu có

Ràng buộc:

- Học viên chỉ thao tác đề nghị của mình và đúng kỳ đang được phép khai báo.
- Không có hơn một đề nghị `PENDING` cho cùng `StudentTermEnrollment`.
- Không được sửa/xóa item sau khi đề nghị đã gửi.
- Duyệt lặp lại phải idempotent và không tạo trùng `CourseOffering` hoặc `CourseEnrollment`.

### 6.6. Đề nghị điểm và kết quả

#### `GradeProposal`

Tham chiếu `CourseEnrollment`. Đây là vùng dữ liệu chờ duyệt; không ghi trực tiếp vào kết quả chính thức.

#### `SubjectResult`

Tham chiếu `CourseEnrollment`, lưu giá trị kết quả hiện hành, lần học/lần thi nếu nghiệp vụ yêu cầu, người duyệt ban đầu, thời điểm duyệt và số phiên bản. Chỉ Chỉ huy đúng phạm vi được cập nhật kết quả qua service chỉnh điểm; không có thao tác xóa qua API nghiệp vụ.

#### `GradeCorrectionRequest`

Đại diện yêu cầu chỉnh sửa điểm do Học viên gửi cho Chỉ huy, gồm tối thiểu:

- `studentId`
- `subjectResultId`
- `reason`
- `requestedValues`, nếu Học viên có đủ thông tin về giá trị đề nghị
- `evidenceFileId` hoặc tham chiếu minh chứng, nếu nghiệp vụ cho phép đính kèm
- `status`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- `submittedAt`
- `reviewedAt`
- `reviewedBy`
- `reviewNote`

Học viên chỉ được hủy yêu cầu của mình khi còn `PENDING` và Chỉ huy chưa xử lý. Nội dung yêu cầu đã gửi không được sửa; nếu sai, Học viên hủy và tạo yêu cầu mới để giữ lịch sử.

#### `SubjectResultRevision`

Là nhật ký bất biến của mỗi lần chỉnh sửa kết quả, gồm:

- `subjectResultId`
- `gradeCorrectionRequestId`, nullable khi Chỉ huy chủ động sửa
- `version`
- `beforeValues`
- `afterValues`
- `reason`
- `changedBy`
- `changedAt`

Mọi cập nhật `SubjectResult` phải đồng thời tạo `SubjectResultRevision` trong một transaction. Không cung cấp API sửa hoặc xóa revision.

Điểm kỳ, điểm năm và thống kê tích lũy được tính từ dữ liệu chi tiết hoặc read model; không tạo một luồng nhập điểm tổng hợp độc lập làm nguồn sự thật thứ hai.

## 7. Ràng buộc toàn vẹn và phân quyền

1. Mọi quan hệ giữa học viên, lớp, kỳ, môn mở, đăng ký học và kết quả phải cùng `trainingSystemId`.
2. Backend lấy scope hệ từ tài khoản đã xác thực đối với Chỉ huy và Học viên; không tin `trainingSystemId` do client gửi lên.
3. Chỉ huy chỉ quản lý học viên thuộc lớp/phạm vi được phân công.
4. Với lớp quân sự, Admin tạo lớp và phân công Chỉ huy; Chỉ huy quản lý học viên trong lớp được giao.
5. API đọc theo ID phải kiểm tra scope như API danh sách; UUID hợp lệ của hệ khác vẫn phải bị từ chối.
6. Chức năng riêng được kiểm soát bằng capability của hệ, không rải điều kiện `if (system === 'HE_5')` ở controller.
7. Hệ 5 có capability đăng ký môn cá nhân và các nghiệp vụ riêng như cơ sở đào tạo, học phí, cắt cơm, nghiên cứu khoa học theo phạm vi feature tương ứng.
8. Hệ 1 và Hệ 7 dùng chung capability và policy nghiệp vụ quản lý, chỉ khác dữ liệu chương trình.
9. Tạo kế hoạch kỳ, duyệt đăng ký môn và duyệt điểm phải chạy trong transaction.
10. Các thao tác có nguy cơ gửi lặp phải có unique constraint và xử lý idempotent ở service.
11. Chỉnh điểm phải dùng optimistic locking hoặc điều kiện theo `version` để ngăn hai Chỉ huy ghi đè thay đổi của nhau.
12. Một Học viên không được có nhiều yêu cầu chỉnh sửa `PENDING` cho cùng một kết quả.
13. Duyệt yêu cầu chỉnh điểm phải khóa/kiểm tra lại trạng thái yêu cầu và phiên bản kết quả trong transaction.
14. Policy đăng ký học được định nghĩa tập trung; `CourseOffering.offeringMode` phải phù hợp với policy của hệ.

## 8. Cấu trúc code và quy ước đặt tên

### 8.1. Quy ước chung

- Folder: `kebab-case`.
- React component/class: `PascalCase`.
- File JavaScript/TypeScript nghiệp vụ: `camelCase` kèm hậu tố vai trò, ví dụ `courseOffering.service.js`.
- Field JavaScript/TypeScript: `camelCase`.
- Bảng và cột PostgreSQL: `snake_case`, tên bảng số nhiều theo quy ước Sequelize hiện tại.
- API path: danh từ số nhiều, `kebab-case`.
- Không dùng tên viết tắt khó hiểu và không tạo tên riêng theo từng hệ nếu cùng một khái niệm nghiệp vụ.

### 8.2. Tên miền nghiệp vụ chuẩn

- `TrainingSystem`
- `TrainingProgram`
- `CurriculumVersion`
- `CurriculumSubject`
- `TrainingClass`
- `TrainingClassHistory`
- `AcademicTerm`
- `AcademicSubject`
- `CourseOffering`
- `StudentProgramEnrollment`
- `StudentTermEnrollment`
- `CourseEnrollment`
- `CourseRegistrationProposal`
- `CourseRegistrationProposalItem`
- `GradeProposal`
- `GradeCorrectionRequest`
- `SubjectResult`
- `SubjectResultRevision`

Các tên cũ như `MilitaryClass`, `ExternalClass`, `militaryClassId` chỉ được giữ tạm trong lớp tương thích/migration và phải có kế hoạch loại bỏ rõ ràng.

### 8.3. Backend

Giữ kiến trúc layer-first hiện tại:

```text
backend/src/
  constants/
    trainingSystems.js
    trainingCapabilities.js
  middleware/
    trainingScope.middleware.js
    trainingCapability.middleware.js
  policies/
    course-enrollment/
      cohortEnrollment.policy.js
      individualEnrollment.policy.js
      courseEnrollmentPolicy.factory.js
  models/
    TrainingSystem.js
    TrainingProgram.js
    CurriculumVersion.js
    CurriculumSubject.js
    TrainingClass.js
    TrainingClassHistory.js
    AcademicTerm.js
    AcademicSubject.js
    CourseOffering.js
    StudentProgramEnrollment.js
    StudentTermEnrollment.js
    CourseEnrollment.js
    CourseRegistrationProposal.js
    CourseRegistrationProposalItem.js
    GradeProposal.js
    GradeCorrectionRequest.js
    SubjectResult.js
    SubjectResultRevision.js
  services/
    courseOffering.service.js
    courseEnrollment.service.js
    courseRegistrationProposal.service.js
    gradeProposal.service.js
    gradeCorrectionRequest.service.js
    subjectResult.service.js
  controllers/
  routes/
  validations/
```

Controller chỉ điều phối request/response. Scope hệ, kiểm tra capability, transaction, chuẩn hóa môn và chống tạo trùng phải nằm trong middleware/policy/service phù hợp.

### 8.4. Frontend

Giữ App Router và tổ chức theo role/domain hiện tại. Tên route segment và folder dùng `kebab-case`; component dùng `PascalCase`.

Các miền giao diện dự kiến:

```text
frontend/app/
  (admin)/training-systems/
  (admin)/training-programs/
  (commander)/training-classes/
  (commander)/course-offerings/
  (commander)/course-registration-proposals/
  (commander)/grade-proposals/
  (commander)/grade-correction-requests/
  (student)/my-academic-terms/
  (student)/my-course-registrations/
  (student)/my-results/
  (student)/my-grade-correction-requests/

frontend/services/
  training-systems/
  training-programs/
  training-classes/
  course-offerings/
  course-enrollments/
  course-registration-proposals/
  grade-proposals/
  grade-correction-requests/
  subject-results/
```

Endpoint phải tập trung tại `frontend/constants/endpoints.ts`. Server state dùng React Query; Zustand chỉ dùng cho auth hoặc UI state dùng chung.

## 9. API nghiệp vụ dự kiến

Tên endpoint cuối cùng cần đối chiếu convention source trước khi code, nhưng phải bao phủ các luồng sau.

### 9.1. Quản trị nền tảng

- Quản lý danh mục hệ đào tạo.
- Quản lý chương trình và phiên bản chương trình.
- Quản lý lớp đào tạo và phân công Chỉ huy.
- Quản lý kỳ học, môn học và lớp học phần trong đúng scope hệ.

### 9.2. Lập kế hoạch học chung cho hệ `COHORT`

- Tạo kế hoạch môn của một lớp trong một kỳ từ phiên bản chương trình.
- Xem danh sách môn mở của lớp.
- Sinh đăng ký học cho học viên đang có hiệu lực trong lớp.
- Cho phép chạy lại an toàn mà không tạo dữ liệu trùng.

### 9.3. Học viên Hệ 5 khai báo môn

Các hành vi tối thiểu:

- Xem các kỳ học của bản thân.
- Tạo đề nghị đăng ký môn ở trạng thái `DRAFT`.
- Sửa/xóa draft của bản thân.
- Gửi đề nghị để chuyển sang `PENDING`.
- Xem trạng thái duyệt và lý do từ chối.

Không cung cấp API để Học viên tự tạo `AcademicSubject`, `CourseOffering` hoặc `CourseEnrollment` chính thức.

### 9.4. Chỉ huy duyệt môn Hệ 5

- Xem danh sách đề nghị thuộc học viên mình quản lý.
- Xem chi tiết danh sách môn và thông tin kỳ/trường.
- Duyệt toàn bộ đề nghị trong transaction.
- Từ chối toàn bộ đề nghị và bắt buộc ghi lý do phù hợp.
- Không được duyệt đề nghị của hệ/lớp ngoài phạm vi.

### 9.5. Điểm và kết quả

- Tạo và xem `GradeProposal` theo quyền Chỉ huy.
- Duyệt đề nghị điểm để tạo `SubjectResult` ban đầu.
- Học viên xem kết quả của chính mình.
- Học viên gửi yêu cầu chỉnh điểm cho một kết quả của chính mình, bắt buộc có lý do.
- Học viên xem lịch sử và trạng thái yêu cầu; chỉ được hủy yêu cầu đang `PENDING` chưa được xử lý.
- Chỉ huy xem các yêu cầu thuộc phạm vi quản lý, duyệt hoặc từ chối kèm ghi chú xử lý.
- Khi duyệt, Chỉ huy nhập/xác nhận giá trị điểm mới và hệ thống tạo revision trong transaction.
- Chỉ huy được chủ động chỉnh sửa kết quả thuộc phạm vi quản lý, bắt buộc có lý do.
- Cung cấp API xem lịch sử chỉnh sửa cho Chỉ huy và cho chính Học viên có kết quả đó; Admin không được truy cập.
- Không có endpoint xóa kết quả hoặc sửa/xóa lịch sử chỉnh điểm.

## 10. Kế hoạch tạo mới dữ liệu và schema

### 10.1. Nguyên tắc

1. Lần reset theo yêu cầu đã hoàn tất; không dùng `sequelize.sync({ force: true })` để tạo kiến trúc mới.
2. Database được khởi tạo với 5 `TrainingSystem` và 1 Admin, giữ username/hash mật khẩu Admin hiện tại.
3. Tạo schema mới theo từng phase bằng migration; dữ liệu mới phát sinh sau reset phải được bảo toàn.
4. Không tự nạp tài khoản, lớp hoặc điểm mẫu ngoài phạm vi người dùng đã chọn.
5. Chỉ loại bỏ bảng/cột legacy ở task cleanup sau khi API mới thay thế hoàn toàn.

### 10.2. Dữ liệu cũ

- Dữ liệu `EXTERNAL/MILITARY` trước reset đã bị xóa theo yêu cầu; không còn bước backfill hoặc yêu cầu bảng ánh xạ.
- Các trường/bảng legacy còn trong schema chỉ nhằm giữ ứng dụng hiện tại hoạt động trong lúc chuyển API. Không dùng chúng làm nguồn dữ liệu cho năm hệ mới.

### 10.3. Trình tự chuyển đổi

1. Tạo `TrainingSystem` và `users.training_system_id`; reset và xác minh dữ liệu khởi đầu.
2. Bắt buộc gán hệ khi tạo tài khoản Chỉ huy/Học viên mới.
3. Tạo chương trình, lớp, kỳ, môn mở, đăng ký và kết quả theo phase.
4. Siết ràng buộc và chuyển API/frontend sang `trainingSystemId`.
5. Chỉ loại bỏ legacy trong task cleanup sau khi luồng mới đã được kiểm thử.

## 11. Chia phase triển khai

Task tổng này phải được tách thành các task con trước khi code. Mỗi phase chỉ bắt đầu khi phase trước đã đạt acceptance criteria và có kết quả kiểm tra.

### Phase 005A - Nền tảng năm hệ và scope xác thực

- Tạo `TrainingSystem`, seed năm hệ và capability nền tảng.
- Định nghĩa policy đăng ký học theo mã hệ trong backend.
- Bổ sung `trainingSystemId` cho tài khoản/phạm vi cần thiết.
- Chuẩn hóa middleware scope hệ ở backend.
- Cập nhật auth context và contract tối thiểu cho frontend.
- Kiểm tra database sau reset và bắt buộc gán hệ cho tài khoản nghiệp vụ mới.

### Phase 005B - Chương trình, lớp và quá trình học viên

- Tạo chương trình, phiên bản chương trình và môn trong chương trình.
- Chuẩn hóa `TrainingClass` và `TrainingClassHistory`.
- Tạo `StudentProgramEnrollment`, `AcademicTerm`, `StudentTermEnrollment`.
- Tạo dữ liệu nền mới theo năm hệ, không backfill dữ liệu trước reset.

### Phase 005C - Môn mở và đăng ký học chung

- Tạo `AcademicSubject`, `CourseOffering`, `CourseEnrollment`.
- Triển khai policy `COHORT` cho Hệ 1, 3, 4, 7.
- Tạo kế hoạch kỳ từ chương trình và sinh đăng ký học idempotent.
- Chưa chuyển luồng điểm nếu dữ liệu đăng ký học chưa được đối soát.

### Phase 005D - Hệ 5 tự khai báo môn theo kỳ

- Tạo `CourseRegistrationProposal` và item.
- Triển khai draft, submit, approve, reject và phân quyền.
- Khi duyệt, tạo dữ liệu chính thức theo transaction.
- Hoàn thiện UI Học viên và Chỉ huy cho luồng này.

### Phase 005E - Hợp nhất đề nghị điểm và kết quả

- Chuyển `GradeProposal` và `SubjectResult` sang tham chiếu `CourseEnrollment`.
- Chuyển API kết quả sang model mới; không backfill kết quả trước reset.
- Tạo `GradeCorrectionRequest` và `SubjectResultRevision`.
- Triển khai luồng Học viên yêu cầu chỉnh điểm và Chỉ huy duyệt/từ chối.
- Triển khai quyền Chỉ huy chủ động sửa điểm, bắt buộc lý do và lưu giá trị trước/sau.
- Bảo đảm lịch sử chỉnh điểm bất biến, chống ghi đè đồng thời và đúng quyền truy cập theo vai trò/hệ.
- Cập nhật UI xem/duyệt kết quả.

### Phase 005F - Chuyển frontend và cleanup tương thích

- Chuyển toàn bộ màn hình liên quan sang endpoint/model chuẩn.
- Xóa nhánh frontend không còn dùng sau khi xác nhận parity.
- Lập task cleanup riêng cho bảng, cột, route và code legacy.
- Không xóa dữ liệu legacy trong phase này nếu chưa có phê duyệt thao tác phá hủy.

## 12. Ngoài phạm vi

- Không thiết kế lại toàn bộ giao diện ngoài các màn hình cần cho luồng mới.
- Không thay đổi công thức GPA/xếp loại nếu chưa có yêu cầu nghiệp vụ riêng.
- Không tích hợp tự động với hệ thống của trường ngoài quân đội.
- Không cho học viên tự duyệt môn hoặc tự nhập kết quả chính thức.
- Không cho Học viên tự áp dụng giá trị điểm đề nghị vào kết quả chính thức.
- Không cho Admin xem hoặc chỉnh sửa điểm và lịch sử chỉnh điểm.
- Không tạo ngoại lệ nghiệp vụ riêng giữa Hệ 1 và Hệ 7.
- Không thêm dependency khi stack hiện tại đáp ứng được.
- Không xóa bảng/cột/dữ liệu legacy trong task thiết kế này.
- Không commit hoặc push Git trong phạm vi task.

## 13. Tiêu chí hoàn thành tổng

### 13.1. Kiến trúc và dữ liệu

- Có đúng năm hệ và mọi dữ liệu nghiệp vụ được scope bằng backend.
- Không còn phụ thuộc nghiệp vụ cốt lõi vào phân loại `EXTERNAL | MILITARY`.
- Hệ 1, 3, 4, 7 dùng chung cơ chế chương trình/lớp; Hệ 5 dùng cơ chế đăng ký cá nhân.
- `CourseOffering` và `CourseEnrollment` là lõi dùng chung cho cả hai cơ chế.
- Kết quả chính thức tham chiếu đăng ký học; mọi lần sửa đều có revision bất biến và không mất giá trị cũ.
- Lịch sử đổi lớp, đổi chương trình, đổi trường/kỳ không bị ghi đè.

### 13.2. Hệ 5

- Hai học viên Hệ 5 có thể học khác trường, khác kỳ và khác danh sách môn mà không ảnh hưởng nhau.
- Học viên tạo/sửa draft, gửi đề nghị và theo dõi trạng thái.
- Học viên không thể sửa đề nghị sau khi gửi hoặc thao tác trên dữ liệu người khác.
- Chỉ huy duyệt/từ chối đúng phạm vi; duyệt tạo đủ dữ liệu chính thức trong một transaction.
- Chạy lại yêu cầu duyệt không tạo trùng môn mở hoặc đăng ký học.

### 13.3. Các hệ học chung theo chương trình

- Một lớp được gán đúng chương trình/phiên bản chương trình.
- Kế hoạch kỳ tạo đúng môn theo chương trình.
- Học viên đang hiệu lực trong lớp nhận đúng đăng ký học.
- Học viên chuyển lớp không làm sai lịch sử hoặc kết quả của kỳ trước.
- Hệ 1 và Hệ 7 có hành vi giống nhau nhưng dữ liệu chương trình và scope độc lập.

### 13.4. Phân quyền

- Chỉ huy/Học viên không thể đọc hoặc ghi dữ liệu hệ khác, kể cả khi biết UUID hợp lệ.
- Chỉ huy không thể quản lý học viên ngoài lớp/phạm vi được giao.
- Admin quản trị tài khoản toàn hệ thống nhưng không được xem điểm nghiệp vụ.
- Học viên chỉ xem dữ liệu học tập của bản thân.
- Học viên chỉ được yêu cầu chỉnh điểm của chính mình và không thể tự cập nhật `SubjectResult`.
- Chỉ huy sửa điểm phải cung cấp lý do và không thể xóa lịch sử chỉnh sửa.

### 13.5. Chỉnh sửa kết quả học tập

- Học viên gửi được yêu cầu chỉnh điểm kèm lý do cho một kết quả của chính mình.
- Không tạo được hai yêu cầu `PENDING` cho cùng một kết quả.
- Chỉ huy đúng phạm vi có thể duyệt hoặc từ chối yêu cầu.
- Duyệt yêu cầu cập nhật kết quả và tạo revision trong cùng transaction.
- Chỉ huy có thể chủ động chỉnh sửa điểm nhưng bắt buộc nhập lý do.
- Hệ thống lưu đầy đủ giá trị trước/sau, người sửa, thời gian và nguồn yêu cầu.
- Hai thao tác chỉnh sửa đồng thời không được âm thầm ghi đè nhau.
- Học viên xem được trạng thái yêu cầu và lịch sử chỉnh sửa của bản thân; Admin không truy cập được.

### 13.6. Khởi tạo dữ liệu

- Database sau reset có đúng 5 hệ, 1 Admin và không có bản ghi nghiệp vụ cũ.
- Tài khoản nghiệp vụ tạo mới phải thuộc đúng một hệ.
- Migration các phase sau không xóa dữ liệu mới phát sinh và không dùng `force sync`.

## 14. Kịch bản kiểm tra bắt buộc

### Backend

- Validation cho mọi transition trạng thái proposal.
- Transaction rollback khi duyệt đề nghị môn lỗi ở bất kỳ item nào.
- Race condition khi gửi hoặc duyệt cùng một đề nghị hai lần.
- Unique constraint cho đăng ký môn và kết quả.
- Validation lý do bắt buộc khi Học viên gửi yêu cầu và khi Chỉ huy chủ động sửa điểm.
- Transaction rollback khi duyệt yêu cầu chỉnh điểm thất bại.
- Race condition khi hai người cùng sửa một kết quả hoặc cùng xử lý một yêu cầu.
- Kiểm tra revision lưu đúng giá trị trước/sau và không có API sửa/xóa revision.
- Scope danh sách và scope truy cập chi tiết theo ID.
- Ma trận vai trò x hệ x capability.
- Regression luồng đăng nhập và quản lý tài khoản.
- `npm run swagger:check`.
- `npm run test:api` khi backend/database test đang chạy.

### Frontend

- Học viên Hệ 5 tạo draft nhiều môn, sửa, gửi và xem trạng thái.
- Không hiển thị thao tác sửa sau khi gửi.
- Chỉ huy xem đúng đề nghị thuộc phạm vi và duyệt/từ chối.
- Học viên gửi, xem và hủy yêu cầu chỉnh điểm hợp lệ của bản thân.
- Chỉ huy duyệt/từ chối yêu cầu chỉnh điểm và chủ động sửa điểm có lý do.
- Hiển thị lịch sử chỉnh sửa nhưng không cho sửa/xóa lịch sử.
- Hệ không có capability không nhìn thấy hoặc truy cập được màn hình Hệ 5.
- Kiểm tra loading, empty, validation và API error state.
- `npm run lint`.
- `npm run type-check`.
- `npm run build` ở phase ảnh hưởng production build.

### Schema và dữ liệu khởi đầu

- Kiểm tra đúng 5 mã hệ và 1 Admin sau reset.
- Kiểm tra các bảng nghiệp vụ cũ trống.
- Kiểm tra migration sau reset chạy lặp an toàn và không làm mất dữ liệu mới.

## 15. Điều kiện cần xác nhận trước khi bắt đầu code

1. Quyền tạo chương trình, phiên bản chương trình và kế hoạch kỳ giữa Admin và Chỉ huy.
2. Danh mục cơ sở đào tạo ngoài quân đội cần tạo mới cho Hệ 5.
3. Tập field tối thiểu Hệ 5 phải nhập cho một môn ngoài `subjectCode`, `subjectName`, `credits`.
4. Có cho phép học viên tạo lại draft sau khi đề nghị bị từ chối hay tạo phiên bản proposal mới; khuyến nghị tạo proposal mới để giữ lịch sử.
5. Quy tắc xử lý học viên vào lớp hoặc rời lớp sau khi kế hoạch kỳ đã được tạo.
6. Xác nhận chính thức việc thay đổi bất biến “điểm đã nhập không được sửa” trong `AGENTS.md` và `QLHV.md`.
7. Danh sách trường điểm nào Chỉ huy được sửa và quy tắc kiểm tra chéo giữa các thành phần điểm/tổng điểm.
8. Có bắt buộc minh chứng khi Học viên yêu cầu chỉnh điểm hay chỉ bắt buộc lý do; định dạng và giới hạn file nếu có.
9. Thời hạn Học viên được gửi yêu cầu chỉnh điểm và thời hạn Chỉ huy xử lý, nếu nghiệp vụ có giới hạn.

Các mục trên phải được chốt trong task con tương ứng. Không được tự suy đoán nếu quyết định làm thay đổi dữ liệu lịch sử, quyền truy cập hoặc quan hệ cốt lõi.

## 16. Bàn giao của task thiết kế

- Tài liệu này là đặc tả tổng; Phase 005A đã tạo nền tảng và reset dữ liệu theo yêu cầu người dùng.
- Trước khi code phải tách ít nhất Phase 005A thành task triển khai riêng, có phạm vi file, API contract, migration plan, acceptance criteria và rollback cụ thể.
- Sau mỗi phase phải cập nhật `docs/product/feature-list.md` và tài liệu kiến trúc nếu trạng thái hoặc kiến trúc thực tế đã thay đổi.
