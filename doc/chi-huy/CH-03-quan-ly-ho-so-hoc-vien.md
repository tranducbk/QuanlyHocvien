# CH-03 - Quản lý thông tin chính trị nội bộ học viên

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-03
- **Tên chức năng:** Quản lý thông tin chính trị nội bộ học viên

## Mô tả
Chỉ huy quản lý thông tin chính trị nội bộ của học viên trong hệ được phân công, xếp học viên vào lớp, chuyển lớp trong cùng hệ và tìm kiếm theo tiêu chí được phép.

## Module liên quan
- Student Record Module
- User Module
- Search Module

## Luồng hoạt động chi tiết

### 1. Tiếp nhận học viên
1. Tạo hoặc liên kết tài khoản với thông tin chính trị nội bộ.
2. Gán học viên vào đúng hệ, khóa, chương trình và lớp.

### 2. Cập nhật thông tin chính trị nội bộ
Chỉ huy cập nhật thông tin trong phạm vi hệ mình phụ trách. Admin chỉ có quyền xem nội dung này.

### 3. Chuyển lớp hoặc ngừng hoạt động
Chuyển lớp chỉ thực hiện trong cùng hệ và lưu lịch sử. Khi học viên ngừng hoạt động, khóa tài khoản; không xóa thông tin, điểm hoặc lịch sử.

### 4. Tìm kiếm học viên
1. Tìm kiếm theo nhiều tiêu chí: tên, mã học viên, lớp, trường đào tạo, khóa học.

## Giao diện & API

| Nghiệp vụ | Phạm vi |
|---|---|
| Xem/tìm học viên | Chỉ học viên thuộc hệ Chỉ huy phụ trách |
| Tạo/cập nhật thông tin | Theo quyền Chỉ huy trong hệ được phân công |
| Xếp/chuyển lớp | Chỉ trong cùng hệ; lưu lịch sử chuyển lớp |
| Xóa/ngừng hoạt động | Không xóa dữ liệu; khóa tài khoản khi cần |

### Luồng nghiệp vụ
```
1. Xác thực Chỉ huy và xác định hệ từ tài khoản.
2. Tìm học viên trong phạm vi hệ được phân công.
3. Cập nhật thông tin hoặc xếp/chuyển lớp trong cùng hệ.
4. Lưu lịch sử thao tác; không xóa dữ liệu học viên.
```

## Dữ liệu & Database
- Bảng: `students`
- Cột chính: `studentId` (mã HV), `fullName`, `gender`, `birthday`, `cccdNumber`, `phoneNumber`, `email`, `currentAddress`, `enrollment`, `rank`, `positionGovernment`, `positionParty`, `classId`, `universityId`, `organizationId`, `educationLevelId`, `currentCpa4`, `currentCpa10`

## Lưu ý bảo mật / Quyền hạn
- Chỉ huy chỉ quản lý học viên thuộc hệ được phân công.
- Không xóa học viên hoặc dữ liệu nghiệp vụ liên quan.
