# HV-02 - Xem thông tin cá nhân

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-02
- **Tên chức năng:** Xem thông tin cá nhân

## Mô tả
Học viên có thể xem toàn bộ thông tin cá nhân của mình bao gồm thông tin cơ bản, thông tin học tập và thông tin quân nhân.

## Module liên quan
- User Module
- Profile Module
- Student Record Module

## Luồng hoạt động chi tiết

### 1. Xem thông tin cá nhân
1. **Thông tin cơ bản:** họ tên, ngày sinh, giới tính, CMND/CCCD, số điện thoại, email, địa chỉ.
2. **Thông tin học tập:** mã học viên, lớp, khóa học, ngành học, trường đào tạo.
3. **Thông tin quân nhân:** quân hàm, chức vụ.

### 2. Cập nhật thông tin cá nhân
1. Học viên vào trang chỉnh sửa hồ sơ.
2. Các trường có thể tự cập nhật: số điện thoại, email, địa chỉ.
3. Các trường thông tin quân nhân (nếu có quyền): quân hàm, chức vụ.
4. Hệ thống kiểm tra định dạng và validate dữ liệu.
5. Lưu thay đổi, cập nhật `updated_at`.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/auth/profile` | Token | Lấy toàn bộ thông tin cá nhân (học viên + chỉ huy) |
| 2 | `PUT` | `/api/auth/profile` | Token | Cập nhật thông tin cá nhân (học viên + chỉ huy) |

### Luồng nghiệp vụ
```
1. GET /api/auth/profile → Xem thông tin đầy đủ theo role

2. PUT /api/auth/profile → Cập nhật thông tin (cả học viên + chỉ huy)
   Body: { currentAddress, phoneNumber, email, rank, unit, positionGovernment, positionParty }
   - Hệ thống tự động xác định role và cập nhật đúng bảng (students hoặc commanders)
```

## Dữ liệu & Database
- Bảng: `students`
- Cột: `full_name`, `dob`, `gender`, `cccd`, `current_address`, `phone_number`, `email`, `student_code`, `class_id`, `course`, `major`, `university_id`, `rank`, `position_government`, `position_party`

## Lưu ý bảo mật / Quyền hạn
- Học viên chỉ được xem và cập nhật thông tin của chính mình (`student_id` trong JWT token).
- Một số trường nhạy cảm (CCCD, ngày sinh) bị khóa chỉnh sửa, chỉ có thể xem.
