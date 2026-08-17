# HV-03 - Xem kết quả học tập

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-03
- **Tên chức năng:** Xem kết quả học tập

## Mô tả
Xem kết quả học tập theo từng học kỳ và năm học, bao gồm danh sách môn học với điểm số chi tiết, điểm trung bình học kỳ, điểm trung bình tích lũy (CPA), số tín chỉ đã tích lũy, số tín chỉ nợ, và các chỉ tiêu đánh giá khác.

## Module liên quan
- Grade Module
- Academic Result Module
- Dashboard Module

## Luồng hoạt động chi tiết
1. Bảng điểm chi tiết theo từng môn học, bao gồm điểm số chi tiết.
2. Điểm trung bình học kỳ và điểm trung bình tích lũy (CPA).
3. Số tín chỉ đã tích lũy, số tín chỉ nợ.
4. Hỗ trợ lọc theo học kỳ, năm học.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/students/results` | Token | Xem toàn bộ kết quả học tập |
| 2 | `GET` | `/api/students/results?schoolYear=2024-2025` | Token | Lọc kết quả theo năm học |

### Luồng nghiệp vụ
```
1. GET /api/students/results              → Lấy tất cả yearlyResults (kèm semesterResults + subjectResults)
2. GET /api/students/results?schoolYear=X → Lọc theo năm học cụ thể
   Response: { averageGrade4, cumulativeCredits, debtCredits, ... }
```

## Dữ liệu & Database
- Bảng: `yearly_results`, `semester_results`, `subject_results`
- Cột chính: `averageGrade4`, `averageGrade10`, `cumulativeGrade4`, `cumulativeGrade10`, `cumulativeCredits`, `totalCredits`, `debtCredits`, `failedSubjects`

## Lưu ý bảo mật / Quyền hạn
- *(Cập nhật theo phân quyền chi tiết)*
