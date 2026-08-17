# CH-11 - Tiện ích hỗ trợ

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-11
- **Tên chức năng:** Tiện ích hỗ trợ

## Mô tả
Công cụ hỗ trợ chuyển đổi điểm giữa các hệ điểm, tính điểm trung bình từ danh sách điểm, và xem thông tin chi tiết về từng loại điểm.

## Module liên quan
- Calculator Module
- Grade Converter Module

## Luồng hoạt động chi tiết

### 1. Chuyển đổi điểm
1. Chuyển đổi giữa các hệ điểm: điểm chữ, điểm hệ 4, điểm hệ 10.
2. Hỗ trợ nhập liệu và tính toán giữa các hệ điểm.

### 2. Tính điểm trung bình
1. Hỗ trợ tính điểm trung bình từ danh sách điểm cho trước.

### 3. Xem thông tin điểm
1. Hệ thống cung cấp thông tin chi tiết về từng loại điểm (điểm chữ).
2. Bao gồm điểm hệ 4 và điểm hệ 10 tương ứng.
3. Hiển thị bảng quy đổi tham khảo.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `POST` | `/api/semesters/grade-convert` | Token | Chuyển đổi 1 điểm giữa các hệ |
| 2 | `POST` | `/api/semesters/grade-convert/batch` | Token | Chuyển đổi hàng loạt điểm |
| 3 | `POST` | `/api/semesters/grade-convert/gpa` | Token | Tính GPA từ danh sách điểm |
| 4 | `GET` | `/api/semesters/grade-convert/table` | Token | Xem bảng quy đổi điểm |

### Luồng nghiệp vụ
```
1. GET  /api/semesters/grade-convert/table → Xem bảng: điểm chữ, hệ 4, hệ 10
2. POST /api/semesters/grade-convert       → Chuyển đổi 1 điểm
   Body: { value: 8.5, from: "10", to: "4" } → { value: 4.0, unit: "4" }
3. POST /api/semesters/grade-convert/batch → Chuyển đổi hàng loạt
   Body: { grades: [{ value, from, to }] }
4. POST /api/semesters/grade-convert/gpa   → Tính điểm trung bình
   Body: { grades: [{ point10, credits }] } → { gpa4, gpa10, totalCredits }
```

### Bảng quy đổi điểm
| Điểm chữ | Hệ 4 | Hệ 10 | Khoảng hệ 10 |
|----------|------|-------|-------------|
| A+ | 4.0 | 9.5 | 9.5 - 10 |
| A | 4.0 | 8.5 | 8.5 - 9.4 |
| B+ | 3.5 | 8.0 | 8.0 - 8.4 |
| B | 3.0 | 7.0 | 7.0 - 7.9 |
| C+ | 2.5 | 6.5 | 6.5 - 6.9 |
| C | 2.0 | 5.5 | 5.5 - 6.4 |
| D+ | 1.5 | 5.0 | 5.0 - 5.4 |
| D | 1.0 | 4.0 | 4.0 - 4.9 |
| F | 0.0 | 0.0 | 0 - 3.9 |

## Dữ liệu & Database
- Không lưu riêng — sử dụng bảng quy đổi nội bộ (gradeConversion.js)
- Bảng quy đổi gồm 9 mức: A+ → F (điểm chữ, hệ 4, hệ 10, khoảng)

## Lưu ý bảo mật / Quyền hạn
- Các tiện ích này có thể được sử dụng bởi cả chỉ huy và quản trị viên.
