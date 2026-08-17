import type { Metadata } from "next";
import Main from "@/components/login/Main";

export const metadata: Metadata = {
  title: "Đăng nhập | Quản lý Học viên",
  description: "Đăng nhập vào hệ thống quản lý học viên",
};

export default function Page() {
  return <Main />;
}
