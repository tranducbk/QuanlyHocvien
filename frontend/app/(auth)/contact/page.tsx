import type { Metadata } from "next";
import Main from "@/components/contact/Main";

export const metadata: Metadata = {
  title: "Liên hệ | Quản lý Học viên",
  description: "Thông tin liên hệ với các chỉ huy hệ học viên",
};

export default function Page() {
  return <Main />;
}
