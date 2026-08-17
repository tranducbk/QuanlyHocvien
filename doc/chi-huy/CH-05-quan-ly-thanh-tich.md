# CH-05 - Quản lý thành tích

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-05
- **Tên chức năng:** Quản lý thành tích

## Mô tả
Quản lý toàn bộ thành tích của học viên, bao gồm thành tích học tập, thành tích rèn luyện, các đề tài khoa học, sáng kiến và giải thưởng.

## Module liên quan
- Achievement Module
- Scientific Topic Module

## Luồng hoạt động chi tiết

### 1. Thêm, chỉnh sửa, xóa thành tích
1. Quản lý thành tích học tập, thành tích rèn luyện của học viên.
2. Quản lý các đề tài khoa học, sáng kiến và giải thưởng đã đạt được.

### 2. Xem danh sách thành tích
1. Xem danh sách tất cả thành tích của học viên.
2. Tìm kiếm và lọc theo nhiều tiêu chí.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/achievements` | Token | Xem danh sách thành tích |
| 2 | `GET` | `/api/achievements?studentId=...` | Token | Lọc theo học viên |
| 3 | `POST` | `/api/achievements` | Token | Thêm thành tích mới |
| 4 | `PUT` | `/api/achievements/:id` | Token | Cập nhật thành tích |
| 5 | `DELETE` | `/api/achievements/:id` | Token | Xóa thành tích |
| 6 | `GET` | `/api/achievement-profiles` | Token | Xem hồ sơ thành tích |
| 7 | `GET` | `/api/yearly-achievements` | Token | Xem thành tích theo năm |
| 8 | `GET` | `/api/scientific-initiatives` | Token | Xem sáng kiến |
| 9 | `GET` | `/api/scientific-topics` | Token | Xem đề tài khoa học |

### Luồng nghiệp vụ
```
1. GET  /api/achievements                → Xem danh sách
2. POST /api/achievements                → Thêm thành tích
   Body: { studentId, title, award, semester, schoolYear, year, content }
3. PUT  /api/achievements/:id            → Chỉnh sửa
4. DEL  /api/achievements/:id            → Xóa
5. GET  /api/achievement-profiles        → Xem hồ sơ tổng hợp
6. GET  /api/scientific-initiatives      → Xem sáng kiến
7. GET  /api/scientific-topics           → Xem đề tài NCKH
```

## Dữ liệu & Database
- `achievements` (studentId, title, award, semester, schoolYear, year, content)
- `achievement_profiles` (studentId, totalYears, totalScientificTopics, totalScientificInitiatives)
- `yearly_achievements` (studentId, year, decisionNumber, title, hasMinistryReward, hasNationalReward)
- `scientific_initiatives` (yearlyAchievementId, title, description, year, status)
- `scientific_topics` (yearlyAchievementId, title, description, year, status)

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy mới được quản lý thành tích của học viên.
