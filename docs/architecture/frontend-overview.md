# Frontend Overview

## 1. Công nghệ hiện tại

- Next.js App Router, React, TypeScript.
- TanStack React Query cho dữ liệu server.
- Zustand cho auth, loading, toast, modal và confirm.
- Axios client/server cho HTTP.
- Tailwind CSS, Motion và component library nội bộ.
- React Hook Form kết hợp Zod ở các form.

## 2. Entry point và provider

Root layout: `frontend/app/layout.tsx`.

Provider chính:

```text
RootLayout
→ ThemeProvider
→ QueryProvider
→ MotionProvider
→ OfflineDetector
→ Toast / Loading / Modal / Confirm
→ Page
```

React Query được cấu hình tại `frontend/components/providers/QueryProvider.tsx` với `staleTime` mặc định 60 giây và retry một lần.

## 3. Routing

App Router nằm trong `frontend/app`.

Route chính hiện tại:

- `/login`, `/forgot-password`, `/contact`.
- `/admin/*`.
- `/commander/*`.
- `/student/*`.

`frontend/proxy.ts` bảo vệ route theo cookie role. `frontend/constants/constants.ts` khai báo ba role nghiệp vụ `ADMIN`, `COMMANDER`, `STUDENT`; không có role hoặc route Giảng viên.

## 4. State management

### Server state

- React Query.
- Query key tập trung tại `frontend/constants/query-keys.ts`.
- `useTableQuery` chuẩn hóa bảng có filter/sort/pagination.
- `useAppMutation` chuẩn hóa mutation, toast, confirm và invalidate query.

### Client/global state

Zustand stores tại `frontend/store`:

- `useAuthStore`: user, token, trạng thái đăng nhập và cookie.
- `useToastStore`, `useModalStore`, `useConfirmStore`, `useLoadingStore`.

## 5. API layer

- Endpoint: `frontend/constants/endpoints.ts`.
- Axios: `frontend/services/axios-client.ts`, `axios-server.ts`.
- Service theo domain: users, classes, semesters, academic results, grade requests, schedules, tuition, achievements, notifications...

Luồng phổ biến:

```text
Page
→ domain Main component
→ useTableQuery/useQuery/useAppMutation
→ service
→ axios client
→ backend /api
```

## 6. Pages và components

- `frontend/app`: route/page/layout mỏng.
- `frontend/components/admin`: nghiệp vụ Admin.
- `frontend/components/commander`: nghiệp vụ Chỉ huy.
- `frontend/components/student`: nghiệp vụ Học viên.
- `frontend/components/providers`: provider toàn ứng dụng.
- `frontend/library`: UI dùng chung như Table, Input, Select, Modal, Typography.

Types theo domain nằm trong `frontend/types`; validation dùng chung nằm tại `frontend/utils/validations.ts`.

## 7. Chức năng giao diện hiện có

- Admin: dashboard, tài khoản, trường/lớp và thông báo.
- Chỉ huy: dashboard, trường/lớp, hồ sơ, kết quả, phê duyệt điểm cũ, học kỳ, lịch học, cắt cơm, học phí, thành tích, lịch trực, thông báo.
- Học viên: dashboard, hồ sơ, kết quả/đề xuất điểm cũ, lịch học, cắt cơm, học phí, thành tích, thông báo.

Các page/component tồn tại trong source chưa đồng nghĩa đã được kiểm thử runtime đầy đủ.

## 8. Trạng thái so với `QLHV.md`

Chưa có:

- `system_type` trong auth type/store/proxy.
- Giao diện Chỉ huy tách theo ba hệ.
- UI quản lý lớp, môn và học kỳ theo hệ dành cho Chỉ huy.
- UI Chỉ huy nhập điểm trực tiếp cho đúng hệ và duyệt đề xuất điểm quân sự.
- UI Học viên quân sự nhập bảng điểm, gửi và theo dõi đề xuất.
- Khung hệ dân sự.

Luồng đề xuất điểm hệ ngoài cũ cần được ngừng nhưng phải bảo toàn dữ liệu lịch sử. Luồng đề xuất mới chỉ áp dụng cho hệ quân sự.

## 9. Quy tắc khi mở rộng

- Page trong `app` giữ mỏng; đặt nghiệp vụ vào `components` và `services`.
- Tái sử dụng component trong `library` và hook hiện có.
- Thêm endpoint/query key/type trước khi nối UI.
- Không chỉ ẩn menu: backend vẫn phải là lớp bảo vệ quyền chính.
- Không tạo mutation sửa/xóa cho điểm mới.
