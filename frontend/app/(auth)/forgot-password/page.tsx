import type { Metadata } from "next";
import Main from "@/components/forgot-password/Main";

export const metadata: Metadata = {
  title: "Quên mật khẩu | Quản lý Học viên",
  description: "Liên hệ phòng CNTT để được cấp lại mật khẩu",
};

export default function Page() {
  return <Main />;
}
