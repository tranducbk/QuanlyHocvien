import Main from "@/components/commander/universities/Main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý cơ sở đào tạo | Hệ thống quản lý học viên",
  description: "Quản lý thông tin các trường đại học, chuyên ngành, trình độ đào tạo và lớp học.",
};

export default function UniversitiesPage() {
  return <Main />;
}
