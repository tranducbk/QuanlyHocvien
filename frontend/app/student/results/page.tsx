import Main from "@/components/student/results/Main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết quả học tập | Cổng học viên",
  description:
    "Xem kết quả học tập và gửi đề xuất điều chỉnh kết quả học tập của học viên.",
};

export default function StudentResultsPage() {
  return <Main />;
}
