# Database Schema - Student Manager

## Tổng quan

Hệ thống quản lý học viên/sinh viên trong môi trường quân đội/công an. Gồm **21 bảng** được chia thành 5 nhóm chức năng.

---

## Danh sách bảng

| STT | Tên bảng | Nhóm | Mục đích |
|:---:|:---|:---|:---|
| 1 | `universities` | Cơ cấu Tổ chức | Trường đại học liên kết |
| 2 | `organizations` | Cơ cấu Tổ chức | Đơn vị/Khoa/Viện |
| 3 | `education_levels` | Cơ cấu Tổ chức | Trình độ đào tạo |
| 4 | `classes` | Cơ cấu Tổ chức | Lớp học |
| 5 | `students` | Đối tượng Trung tâm | Hồ sơ học viên |
| 6 | `commanders` | Đối tượng Trung tâm | Hồ sơ chỉ huy/cán bộ |
| 7 | `users` | Đối tượng Trung tâm | Tài khoản đăng nhập |
| 8 | `yearly_results` | Kết quả Học tập | Kết quả theo năm học |
| 9 | `semester_results` | Kết quả Học tập | Kết quả theo học kỳ |
| 10 | `subject_results` | Kết quả Học tập | Kết quả từng môn học |
| 11 | `semesters` | Kết quả Học tập | Danh sách học kỳ |
| 12 | `time_tables` | Kết quả Học tập | Thờ khóa biểu |
| 13 | `tuition_fees` | Kết quả Học tập | Học phí |
| 14 | `achievement_profiles` | Thi đua & Nghiên cứu | Tổng hợp thành tích |
| 15 | `achievements` | Thi đua & Nghiên cứu | Chi tiết thành tích |
| 16 | `yearly_achievements` | Thi đua & Nghiên cứu | Thành tích theo năm |
| 17 | `scientific_initiatives` | Thi đua & Nghiên cứu | Sáng kiến khoa học |
| 18 | `scientific_topics` | Thi đua & Nghiên cứu | Đề tài NCKH |
| 19 | `cut_rice` | Bổ trợ & Lịch trình | Quản lý cắt cơm |
| 20 | `commander_duty_schedules` | Bổ trợ & Lịch trình | Lịch trực chỉ huy |
| 21 | `notifications` | Bổ trợ & Lịch trình | Thông báo |

---

## 1. Nhóm Cơ cấu Tổ chức

### 1.1. universities

Trường đại học liên kết đào tạo.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `university_code` | VARCHAR(50) | NO | - | Mã trường (duy nhất) |
| `university_name` | VARCHAR(255) | NO | - | Tên trường |
| `total_students` | INT | YES | `0` | Tổng số học viên |
| `status` | VARCHAR(50) | YES | `'ACTIVE'` | Trạng thái |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:** UNIQUE(`university_code`)

---

### 1.2. organizations

Đơn vị, khoa, viện trực thuộc trường.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `organization_name` | VARCHAR(255) | NO | - | Tên đơn vị |
| `travel_time` | INT | YES | - | Thờ gian di chuyển (phút) |
| `total_students` | INT | YES | `0` | Tổng số học viên |
| `status` | VARCHAR(50) | YES | `'ACTIVE'` | Trạng thái |
| `university_id` | UUID | NO | - | FK → `universities.id` |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `university_id` → `universities.id`

---

### 1.3. education_levels

Trình độ đào tạo (Đại học, Thạc sĩ...).

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `level_name` | VARCHAR(255) | NO | - | Tên trình độ |
| `organization_id` | UUID | NO | - | FK → `organizations.id` |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `organization_id` → `organizations.id`

---

### 1.4. classes

Lớp học.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `class_name` | VARCHAR(255) | NO | - | Tên lớp |
| `student_count` | INT | YES | `0` | Sĩ số |
| `education_level_id` | UUID | NO | - | FK → `education_levels.id` |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `education_level_id` → `education_levels.id`

---

## 2. Nhóm Đối tượng Trung tâm

### 2.1. students

Hồ sơ chi tiết học viên/sinh viên — bảng trung tâm quan trọng nhất.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | VARCHAR(50) | NO | - | Mã học viên (duy nhất) |
| `full_name` | VARCHAR(100) | YES | - | Họ và tên |
| `gender` | VARCHAR(20) | YES | - | Giới tính |
| `birthday` | DATETIME | YES | - | Ngày sinh |
| `hometown` | VARCHAR(255) | YES | - | Quê quán |
| `ethnicity` | VARCHAR(50) | YES | - | Dân tộc |
| `religion` | VARCHAR(50) | YES | - | Tôn giáo |
| `current_address` | VARCHAR(255) | YES | - | Địa chỉ hiện tại |
| `place_of_birth` | VARCHAR(255) | YES | - | Nơi sinh |
| `phone_number` | VARCHAR(20) | YES | - | Số điện thoại |
| `email` | VARCHAR(100) | YES | - | Email |
| `cccd_number` | VARCHAR(20) | YES | - | Số CCCD |
| `party_member_card_number` | VARCHAR(50) | YES | - | Số thẻ Đảng |
| `enrollment` | INT | YES | - | Khóa nhập học |
| `graduation_date` | DATETIME | YES | - | Ngày tốt nghiệp |
| `unit` | VARCHAR(255) | YES | - | Đơn vị |
| `rank` | VARCHAR(50) | YES | - | Quân hàm/Cấp bậc |
| `position_government` | VARCHAR(100) | YES | - | Chức vụ chính quyền |
| `position_party` | VARCHAR(100) | YES | - | Chức vụ Đảng |
| `full_party_member` | DATETIME | YES | - | Ngày vào Đảng chính thức |
| `probationary_party_member` | DATETIME | YES | - | Ngày vào Đảng dự bị |
| `date_of_enlistment` | DATETIME | YES | - | Ngày nhập ngũ |
| `avatar` | VARCHAR(255) | YES | - | Ảnh đại diện |
| `current_cpa4` | DOUBLE PRECISION | YES | - | CPA hệ 4 hiện tại |
| `current_cpa10` | DOUBLE PRECISION | YES | - | CPA hệ 10 hiện tại |
| `family_member` | JSONB | YES | - | Thông tin gia đình |
| `foreign_relations` | JSONB | YES | - | Quan hệ nước ngoài |
| `class_id` | UUID | YES | - | FK → `classes.id` |
| `organization_id` | UUID | YES | - | FK → `organizations.id` |
| `university_id` | UUID | YES | - | FK → `universities.id` |
| `education_level_id` | UUID | YES | - | FK → `education_levels.id` |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- UNIQUE: `student_id`
- FOREIGN KEY: `class_id`, `organization_id`, `university_id`, `education_level_id`

---

### 2.2. commanders

Hồ sơ chỉ huy/cán bộ quản lý.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `commander_id` | VARCHAR(50) | NO | - | Mã cán bộ (duy nhất) |
| `full_name` | VARCHAR(100) | YES | - | Họ và tên |
| `gender` | VARCHAR(20) | YES | - | Giới tính |
| `birthday` | DATETIME | YES | - | Ngày sinh |
| `place_of_birth` | VARCHAR(255) | YES | - | Nơi sinh |
| `hometown` | VARCHAR(255) | YES | - | Quê quán |
| `ethnicity` | VARCHAR(50) | YES | - | Dân tộc |
| `religion` | VARCHAR(50) | YES | - | Tôn giáo |
| `current_address` | VARCHAR(255) | YES | - | Địa chỉ hiện tại |
| `email` | VARCHAR(100) | YES | - | Email |
| `phone_number` | VARCHAR(20) | YES | - | Số điện thoại |
| `cccd` | VARCHAR(20) | YES | - | Số CCCD |
| `party_member_card_number` | VARCHAR(50) | YES | - | Số thẻ Đảng |
| `start_work` | INT | YES | - | Năm bắt đầu công tác |
| `organization` | VARCHAR(255) | YES | - | Cơ quan |
| `unit` | VARCHAR(255) | YES | - | Đơn vị |
| `rank` | VARCHAR(50) | YES | - | Quân hàm/Cấp bậc |
| `position_government` | VARCHAR(100) | YES | - | Chức vụ chính quyền |
| `position_party` | VARCHAR(100) | YES | - | Chức vụ Đảng |
| `full_party_member` | DATETIME | YES | - | Ngày vào Đảng chính thức |
| `probationary_party_member` | DATETIME | YES | - | Ngày vào Đảng dự bị |
| `date_of_enlistment` | DATETIME | YES | - | Ngày nhập ngũ |
| `avatar` | VARCHAR(255) | YES | - | Ảnh đại diện |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- UNIQUE: `commander_id`

---

### 2.3. users

Tài khoản đăng nhập hệ thống.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `username` | VARCHAR(50) | NO | - | Tên đăng nhập (duy nhất) |
| `password` | VARCHAR(255) | NO | - | Mật khẩu đã hash |
| `is_admin` | BOOLEAN | YES | `false` | Có phải admin |
| `role` | VARCHAR(50) | YES | - | Vai trò |
| `refresh_token` | TEXT | YES | - | Token refresh |
| `student_id` | UUID | YES | - | FK → `students.id` |
| `commander_id` | UUID | YES | - | FK → `commanders.id` |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |
| `delete_at` | DATETIME | YES | - | Xóa mềm (soft delete) |

**Ràng buộc:**
- UNIQUE: `username`
- FOREIGN KEY: `student_id` → `students.id`
- FOREIGN KEY: `commander_id` → `commanders.id`
- Chỉ có 1 trong 2 (`student_id` hoặc `commander_id`) được có giá trị

---

## 3. Nhóm Kết quả Học tập

### 3.1. yearly_results

Kết quả học tập tổng hợp theo năm học.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `school_year` | VARCHAR(50) | NO | - | Năm học |
| `average_grade4` | DOUBLE PRECISION | YES | - | Điểm TB hệ 4 |
| `average_grade10` | DOUBLE PRECISION | YES | - | Điểm TB hệ 10 |
| `cumulative_grade4` | DOUBLE PRECISION | YES | - | CPA hệ 4 tích lũy |
| `cumulative_grade10` | DOUBLE PRECISION | YES | - | CPA hệ 10 tích lũy |
| `cumulative_credits` | INT | YES | - | Số tín chỉ tích lũy |
| `total_credits` | INT | YES | - | Tổng tín chỉ |
| `total_subjects` | INT | YES | - | Tổng số môn |
| `passed_subjects` | INT | YES | - | Số môn đạt |
| `failed_subjects` | INT | YES | - | Số môn rớt |
| `debt_credits` | INT | YES | - | Số tín chỉ nợ |
| `academic_status` | VARCHAR(50) | YES | - | Trạng thái học tập |
| `student_level` | INT | YES | - | Xếp loại |
| `semester_ids` | UUID | YES | - | Danh sách học kỳ |
| `party_rating` | VARCHAR(50) | YES | - | Xếp loại Đảng |
| `training_rating` | VARCHAR(50) | YES | - | Xếp loại rèn luyện |
| `party_rating_decision_number` | VARCHAR(100) | YES | - | Số QĐ xếp loại Đảng |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`

---

### 3.2. semester_results

Kết quả học tập theo học kỳ.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `semester` | VARCHAR(50) | NO | - | Tên học kỳ |
| `school_year` | VARCHAR(50) | NO | - | Năm học |
| `yearly_result_id` | UUID | NO | - | FK → `yearly_results.id` |
| `total_credits` | INT | YES | - | Tổng tín chỉ |
| `average_grade4` | DOUBLE PRECISION | YES | - | Điểm TB hệ 4 |
| `average_grade10` | DOUBLE PRECISION | YES | - | Điểm TB hệ 10 |
| `cumulative_credits` | INT | YES | - | Tín chỉ tích lũy |
| `cumulative_grade4` | DOUBLE PRECISION | YES | - | CPA hệ 4 |
| `cumulative_grade10` | DOUBLE PRECISION | YES | - | CPA hệ 10 |
| `debt_credits` | INT | YES | - | Tín chỉ nợ |
| `failed_subjects` | INT | YES | - | Số môn rớt |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`
- FOREIGN KEY: `yearly_result_id` → `yearly_results.id`

---

### 3.3. subject_results

Kết quả chi tiết từng môn học.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `semester_result_id` | UUID | NO | - | FK → `semester_results.id` |
| `subject_code` | VARCHAR(50) | NO | - | Mã môn học |
| `subject_name` | VARCHAR(255) | NO | - | Tên môn học |
| `credits` | INT | YES | - | Số tín chỉ |
| `letter_grade` | VARCHAR(5) | YES | - | Điểm chữ (A, B, C...) |
| `grade_point4` | DOUBLE PRECISION | YES | - | Điểm hệ 4 |
| `grade_point10` | DOUBLE PRECISION | YES | - | Điểm hệ 10 |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `semester_result_id` → `semester_results.id`

---

### 3.4. semesters

Danh sách học kỳ.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `code` | VARCHAR(50) | NO | - | Mã học kỳ |
| `school_year` | VARCHAR(50) | NO | - | Năm học |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

---

### 3.5. time_tables

Thờ khóa biểu học tập (lưu dạng JSONB).

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `semester_id` | UUID | YES | - | FK → `semesters.id` |
| `schedules` | JSONB | YES | - | Dữ liệu TKB |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`
- FOREIGN KEY: `semester_id` → `semesters.id`

---

### 3.6. tuition_fees

Thông tin học phí.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `semester_id` | UUID | YES | - | FK → `semesters.id` |
| `total_amount` | DECIMAL | YES | - | Tổng số tiền |
| `semester` | VARCHAR(50) | YES | - | Học kỳ |
| `school_year` | VARCHAR(50) | YES | - | Năm học |
| `content` | VARCHAR(255) | YES | - | Nội dung |
| `status` | VARCHAR(50) | YES | `'UNPAID'` | Trạng thái |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`
- FOREIGN KEY: `semester_id` → `semesters.id`

---

## 4. Nhóm Thi đua & Nghiên cứu

### 4.1. achievement_profiles

Tổng hợp thành tích toàn khóa của học viên.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `total_years` | INT | YES | - | Tổng số năm |
| `total_advanced_soldier` | INT | YES | - | Số lần tiên tiến |
| `total_competitive_soldier` | INT | YES | - | Số lần thi đua |
| `total_scientific_topics` | INT | YES | - | Số đề tài NCKH |
| `total_scientific_initiatives` | INT | YES | - | Số sáng kiến |
| `eligible_for_ministry_reward` | BOOLEAN | YES | `false` | Đủ điều kiện khen Bộ |
| `eligible_for_national_reward` | BOOLEAN | YES | `false` | Đủ điều kiện khen NN |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`

---

### 4.2. achievements

Chi tiết từng thành tích/khen thưởng.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `semester` | VARCHAR(50) | YES | - | Học kỳ |
| `school_year` | VARCHAR(50) | YES | - | Năm học |
| `content` | TEXT | YES | - | Nội dung |
| `year` | INT | YES | - | Năm |
| `title` | VARCHAR(255) | YES | - | Tiêu đề |
| `description` | TEXT | YES | - | Mô tả |
| `award` | VARCHAR(255) | YES | - | Danh hiệu |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`

---

### 4.3. yearly_achievements

Thành tích được công nhận theo từng năm (có số quyết định).

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `year` | INT | NO | - | Năm |
| `decision_number` | VARCHAR(100) | YES | - | Số quyết định |
| `decision_date` | DATETIME | YES | - | Ngày quyết định |
| `title` | VARCHAR(255) | YES | - | Danh hiệu |
| `has_ministry_reward` | BOOLEAN | YES | `false` | Có khen thưởng Bộ |
| `has_national_reward` | BOOLEAN | YES | `false` | Có khen thưởng NN |
| `notes` | TEXT | YES | - | Ghi chú |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`

---

### 4.4. scientific_initiatives

Sáng kiến khoa học.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `yearly_achievement_id` | UUID | NO | - | FK → `yearly_achievements.id` |
| `title` | VARCHAR(255) | NO | - | Tên sáng kiến |
| `description` | TEXT | YES | - | Mô tả |
| `year` | INT | YES | - | Năm |
| `status` | VARCHAR(50) | YES | - | Trạng thái |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `yearly_achievement_id` → `yearly_achievements.id`

---

### 4.5. scientific_topics

Đề tài nghiên cứu khoa học.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `yearly_achievement_id` | UUID | NO | - | FK → `yearly_achievements.id` |
| `title` | VARCHAR(255) | NO | - | Tên đề tài |
| `description` | TEXT | YES | - | Mô tả |
| `year` | INT | YES | - | Năm |
| `status` | VARCHAR(50) | YES | - | Trạng thái |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `yearly_achievement_id` → `yearly_achievements.id`

---

## 5. Nhóm Bổ trợ & Lịch trình

### 5.1. cut_rice

Quản lý đăng ký/hủy cơm hàng tuần.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `weekly` | JSONB | YES | - | Lịch cắt cơm tuần |
| `is_auto_generated` | BOOLEAN | YES | `false` | Tự động tạo |
| `last_updated` | DATETIME | YES | - | Cập nhật lần cuối |
| `notes` | VARCHAR(255) | YES | - | Ghi chú |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`

---

### 5.2. commander_duty_schedules

Lịch trực/gác của cán bộ chỉ huy.

> ⚠️ **Lưu ý**: Bảng này là bảng độc lập, không có khóa ngoại với `commanders`. ID dùng INTEGER thay vì UUID.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | INTEGER | NO | AUTO_INCREMENT | Khóa chính |
| `full_name` | VARCHAR(100) | YES | - | Họ tên ngườ trực |
| `rank` | VARCHAR(50) | YES | - | Quân hàm |
| `phone_number` | VARCHAR(20) | YES | - | Số điện thoại |
| `position` | VARCHAR(100) | YES | - | Chức vụ |
| `work_day` | DATETIME | YES | - | Ngày trực |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

---

### 5.3. notifications

Thông báo gửi đến học viên.

| Cột | Kiểu | NULL | Mặc định | Mô tả |
|:---|:---|:---:|:---|:---|
| `id` | UUID | NO | UUIDv4 | Khóa chính |
| `student_id` | UUID | NO | - | FK → `students.id` |
| `title` | VARCHAR(255) | NO | - | Tiêu đề |
| `content` | TEXT | YES | - | Nội dung |
| `type` | VARCHAR(50) | YES | - | Loại thông báo |
| `link` | VARCHAR(500) | YES | - | Đường dẫn |
| `is_read` | BOOLEAN | YES | `false` | Đã đọc |
| `created_at` | DATETIME | YES | NOW | Thờ gian tạo |
| `updated_at` | DATETIME | YES | NOW | Thờ gian cập nhật |

**Ràng buộc:**
- FOREIGN KEY: `student_id` → `students.id`

---

## Sơ đồ quan hệ (ERD)

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌─────────────┐
│  universities   │◄────┤  organizations   │◄────┤  education_levels │◄────┤   classes   │
│   (UUID-PK)     │  1:N│   (UUID-PK)      │  1:N│    (UUID-PK)      │  1:N│  (UUID-PK)  │
└────────┬────────┘     └────────┬─────────┘     └─────────┬─────────┘     └──────┬──────┘
         │                       │                         │                      │
         │                       │                         │                      │
         │           ┌───────────┴───────────┐             │                      │
         │           │                       │             │                      │
         │           ▼                       ▼             ▼                      ▼
         │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐
         └──►     students    │  │    commanders   │  │            users             │
            │    (UUID-PK)    │  │   (UUID-PK)     │  │          (UUID-PK)           │
            │  FK: class_id   │  └────────┬────────┘  │  FK: student_id (nullable)   │
            │  FK: org_id     │           │           │  FK: commander_id (nullable) │
            │  FK: uni_id     │           │           └──────────────┬───────────────┘
            │  FK: edu_lvl_id │           │                          │
            └────────┬────────┘           │                    1:1   │   1:1
                     │                    │                  ┌───────┘   └───────┐
                     │                    │                  │                   │
        ┌────────────┼────────────┐      │                  ▼                   ▼
        │            │            │      │           ┌─────────────┐    ┌─────────────┐
        ▼            ▼            ▼      │           │   students  │    │  commanders │
┌───────────────┐ ┌──────────┐ ┌─────────────────┐  └─────────────┘    └─────────────┘
│yearly_results │ │ time_tables│ │ tuition_fees    │
│  (UUID-PK)    │ │(UUID-PK) │ │  (UUID-PK)      │
│ FK: student_id│ │FK: stu_id│ │ FK: student_id  │
└───────┬───────┘ └──────────┘ └─────────────────┘
        │
        │        ┌──────────────────┐     ┌─────────────────┐
        └───────►│ semester_results │◄────┤ subject_results │
          1:N    │   (UUID-PK)      │  1:N│   (UUID-PK)     │
                 │ FK: student_id   │     │ FK: sem_res_id  │
                 │ FK: yearly_res_id│     └─────────────────┘
                 └──────────────────┘

┌─────────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│ achievement_profiles│     │   achievements   │     │   yearly_achievements    │
│     (UUID-PK)       │     │    (UUID-PK)     │     │      (UUID-PK)           │
│   FK: student_id    │     │  FK: student_id  │     │    FK: student_id        │
└─────────────────────┘     └──────────────────┘     └────────────┬─────────────┘
                                                                    │
                                          ┌─────────────────────────┘
                                          │
                           ┌──────────────┴──────────────┐
                           ▼                             ▼
                  ┌──────────────────┐        ┌──────────────────┐
                  │scientific_initiatives│     │ scientific_topics│
                  │     (UUID-PK)      │      │    (UUID-PK)     │
                  │ FK: yearly_ach_id  │      │ FK: yearly_ach_id│
                  └──────────────────┘        └──────────────────┘

┌─────────────┐     ┌──────────────────────────┐     ┌───────────────┐
│  cut_rice   │     │commander_duty_schedules  │     │ notifications │
│  (UUID-PK)  │     │    (INTEGER-PK)          │     │  (UUID-PK)    │
│FK: stu_id   │     │  (không có FK)           │     │ FK: stu_id    │
└─────────────┘     └──────────────────────────┘     └───────────────┘
```

---

## Quy ước đặt tên

- **Bảng**: snake_case, số nhiều (`students`, `yearly_results`)
- **Cột**: snake_case (`full_name`, `current_address`)
- **Khóa chính**: `id`, kiểu UUID (trừ `commander_duty_schedules` dùng INTEGER)
- **Khóa ngoại**: `{table}_id`, kiểu UUID
- **Timestamp**: `created_at`, `updated_at` (tự động bởi Sequelize)
- **Soft delete**: `delete_at` (chỉ bảng `users`)
