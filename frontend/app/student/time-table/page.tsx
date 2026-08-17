import Main from "@/components/student/time-table/Main";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Lịch học | Cổng học viên",
  description: "Xem lịch học cá nhân theo tuần.",
};

export default function StudentTimeTablePage() {
  return <Main />;
}
