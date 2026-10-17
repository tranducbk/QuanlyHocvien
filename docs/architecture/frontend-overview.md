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
- `/commander/*`, gồm `/commander/military/*` cho Chỉ huy quân sự.
- `/student/*`, gồm `/student/military/*` cho Học viên quân sự.

`frontend/proxy.ts` bảo vệ route theo cookie role và điều hướng theo `systemType`. `frontend/constants/constants.ts` khai báo ba role nghiệp vụ `ADMIN`, `COMMANDER`, `STUDENT`; không có role hoặc route Giảng viên.

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

## 8. Trạng thái hệ quân sự

Sidebar và route được tách theo `systemType`. Route quân sự trong `app` giữ mỏng và render `Main` trong `components/commander/military`, cùng cấu trúc với các domain hệ ngoài. Các `Main` quân sự dùng chung `PageContainer`, `Table`, `ActionButton`, `Input`, `Select`, `Textarea`, `Button` và modal hiện có; chỉ dữ liệu, API và thao tác nghiệp vụ được tách theo hệ. Học viên quân sự xem hồ sơ cá nhân, lịch chung của lớp, điểm, trạng thái đề xuất và thành tích. Hệ quân sự không hiển thị học phí hoặc cắt cơm.

Hệ dân sự đang hoãn. Các trang quân sự gọi service/endpoint quân sự riêng; không tái sử dụng endpoint nghiệp vụ hệ ngoài để đọc/ghi dữ liệu học tập.

## 9. Quy tắc khi mở rộng

- Page trong `app` giữ mỏng; đặt nghiệp vụ vào `components` và `services`.
- Tái sử dụng component trong `library` và hook hiện có.
- Thêm endpoint/query key/type trước khi nối UI.
- Không chỉ ẩn menu: backend vẫn phải là lớp bảo vệ quyền chính.
- Không tạo mutation sửa/xóa cho điểm mới.
