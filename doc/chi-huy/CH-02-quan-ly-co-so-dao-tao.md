# CH-02 - Quản lý cơ sở đào tạo

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-02
- **Tên chức năng:** Quản lý cơ sở đào tạo

## Mô tả
Quản lý thông tin các trường đại học, chuyên ngành, trình độ đào tạo và lớp học. Mỗi đơn vị có thông tin về thời gian đi lại để tính toán lịch cắt cơm tự động.

## Module liên quan
- University Module
- Major Module
- Training Level Module
- Class Module

## Luồng hoạt động chi tiết

### 1. Quản lý trường đại học
1. Thêm, chỉnh sửa, xóa thông tin các trường đại học nơi học viên được gửi đi đào tạo.
2. Xem cấu trúc phân cấp: Cơ sở đào tạo → Chuyên ngành → Trình độ đào tạo → Lớp.
3. Mỗi đơn vị có thông tin về thời gian đi lại để tính toán lịch cắt cơm tự động.

### 2. Quản lý lớp học
1. Quản lý các lớp học, liên kết lớp với trường, đơn vị và cấp đào tạo tương ứng.
2. Hệ thống tự động đồng bộ số lượng học viên trong lớp khi có thay đổi.

## Giao diện & API

### Xem cấu trúc phân cấp
| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/universities/hierarchy` | Token | **Xem toàn bộ cây phân cấp** |

### Quản lý từng cấp
| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 2 | `GET` | `/api/universities` | Token | Xem danh sách trường |
| 3 | `POST` | `/api/universities` | Token | Thêm trường mới |
| 4 | `PUT` | `/api/universities/:id` | Token | Sửa trường |
| 5 | `DELETE` | `/api/universities/:id` | Token | Xóa trường |
| 6 | `GET` | `/api/organizations` | Token | Xem danh sách đơn vị (có travelTime) |
| 7 | `POST` | `/api/organizations` | Token | Thêm đơn vị mới |
| 8 | `PUT` | `/api/organizations/:id` | Token | Sửa đơn vị |
| 9 | `DELETE` | `/api/organizations/:id` | Token | Xóa đơn vị |
| 10 | `GET` | `/api/education-levels` | Token | Xem danh sách trình độ đào tạo |
| 11 | `POST` | `/api/education-levels` | Token | Thêm trình độ đào tạo |
| 12 | `PUT` | `/api/education-levels/:id` | Token | Sửa trình độ |
| 13 | `DELETE` | `/api/education-levels/:id` | Token | Xóa trình độ |
| 14 | `GET` | `/api/classes` | Token | Xem danh sách lớp |
| 15 | `POST` | `/api/classes` | Token | Tạo lớp mới |
| 16 | `PUT` | `/api/classes/:id` | Token | Sửa lớp |
| 17 | `DELETE` | `/api/classes/:id` | Token | Xóa lớp |

### Luồng nghiệp vụ
```
1. GET  /api/universities/hierarchy → Xem toàn bộ cây:
   [
     {
       universityName: "Đại học Kinh tế Quốc dân",
       organizations: [
         {
           organizationName: "Khoa CNTT",
           travelTime: 30,
           educationLevels: [
             {
               levelName: "Đại học",
               classes: [
                 { className: "CNTT-K60", studentCount: 30 }
               ]
             }
           ]
         }
       ]
     }
   ]

2. POST /api/universities      → Thêm trường mới
3. POST /api/organizations     → Thêm đơn vị (có travelTime để tính cắt cơm)
   Body: { organizationName, travelTime, universityId }
4. POST /api/education-levels  → Thêm trình độ đào tạo
   Body: { levelName, organizationId }
5. POST /api/classes           → Tạo lớp
   Body: { className, studentCount, educationLevelId }

Cấu trúc: University → Organization → EducationLevel → Class
```

## Dữ liệu & Database
- `universities` (universityCode, universityName, status)
- `organizations` (organizationName, travelTime, universityId)
- `education_levels` (levelName, organizationId)
- `classes` (className, studentCount, educationLevelId)

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy mới được quản lý cơ sở đào tạo.
