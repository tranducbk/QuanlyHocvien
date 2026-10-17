# HV-02 - Xem thông tin chính trị nội bộ

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-02
- **Tên chức năng:** Xem thông tin chính trị nội bộ

## Mô tả
Học viên có thể xem thông tin chính trị nội bộ của mình, gồm thông tin nhận diện và thông tin quân nhân. Thông tin học tập được xem tại các chức năng học tập tương ứng.

## Module liên quan
- User Module
- Profile Module
- Student Record Module

## Luồng hoạt động chi tiết

### 1. Xem thông tin chính trị nội bộ
1. **Thông tin cơ bản:** họ tên, ngày sinh, giới tính, CMND/CCCD, số điện thoại, email, địa chỉ.
2. **Thông tin học tập:** mã học viên, lớp, khóa học, ngành học, trường đào tạo.
3. **Thông tin quân nhân:** quân hàm, chức vụ.

Học viên chỉ có quyền xem thông tin chính trị nội bộ của mình; không có thao tác cập nhật trực tiếp.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/auth/profile` | Token | Lấy thông tin chính trị nội bộ (học viên + chỉ huy) |

### Luồng nghiệp vụ
```
1. GET /api/auth/profile → Xem thông tin đầy đủ theo role

2. Không cung cấp thao tác cập nhật thông tin từ tài khoản Học viên.
```

## Dữ liệu & Database
- Bảng: `students`
- Cột: `full_name`, `dob`, `gender`, `cccd`, `current_address`, `phone_number`, `email`, `student_code`, `class_id`, `course`, `major`, `university_id`, `rank`, `position_government`, `position_party`

## Lưu ý bảo mật / Quyền hạn
- Học viên chỉ được xem thông tin của chính mình theo tài khoản đã xác thực.
- Một số trường nhạy cảm (CCCD, ngày sinh) bị khóa chỉnh sửa, chỉ có thể xem.
