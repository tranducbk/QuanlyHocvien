# HV-08 - Xem thành tích và học phí

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-08
- **Tên chức năng:** Xem thành tích và học phí

## Mô tả
Học viên có thể xem danh sách các thành tích của mình và thông tin học phí theo từng đợt, từng học kỳ.

## Module liên quan
- Achievement Module
- Tuition Module

## Luồng hoạt động chi tiết

### 1. Xem thành tích
1. Danh sách các thành tích bao gồm:
   - Thành tích học tập
   - Thành tích rèn luyện
   - Các đề tài khoa học
   - Sáng kiến
   - Các giải thưởng đã đạt được

### 2. Xem thông tin học phí
1. Hiển thị thông tin học phí theo từng đợt, từng học kỳ.
2. Bao gồm: số tiền cần nộp, trạng thái thanh toán.
3. Lịch sử thanh toán của học viên.
4. Trạng thái: Đã thanh toán, Chưa thanh toán.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/students/achievements` | Token | Xem thành tích (kèm profile, đề tài KH, sáng kiến) |
| 2 | `GET` | `/api/students/tuition-fees` | Token | Xem học phí (theo học kỳ, trạng thái) |

### Luồng nghiệp vụ
```
1. GET /api/students/achievements → { achievements, profile, yearlyAchievements }
   - achievements: danh sách thành tích (học tập, rèn luyện, giải thưởng)
   - profile: AchievementProfile (tổng số năm, đề tài, sáng kiến)
   - yearlyAchievements: kèm ScientificInitiative + ScientificTopic
2. GET /api/students/tuition-fees → [{ totalAmount, semester, schoolYear, status, ... }]
```

## Dữ liệu & Database
- Thành tích: `achievements`, `achievement_profiles`, `yearly_achievements`, `scientific_initiatives`, `scientific_topics`
- Học phí: `tuition_fees` (totalAmount, semester, schoolYear, status)

## Lưu ý bảo mật / Quyền hạn
- Học viên chỉ xem thành tích và học phí của chính mình.
