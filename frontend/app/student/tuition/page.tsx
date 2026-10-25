import Main from "@/components/tuition-and-meals/student/tuition/Main";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Học phí | Cổng học viên",
  description:
    "Xem các khoản học phí theo học kỳ, năm học và trạng thái thanh toán của học viên.",
};

export default function StudentTuitionPage() {
  return <Main />;
}
