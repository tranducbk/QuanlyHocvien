import Main from "@/components/commander/duty-schedules/Main";
import CohortMain from "@/components/commander/training-classes/DutySchedules";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý lịch trực | Hệ thống quản lý học viên",
  description: "Quản lý lịch trực của học viên và cán bộ, quản lý lịch trực tuần, lịch trực tháng và lịch trực theo năm học.",
};

export default async function DutySchedulesPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  return code && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(code) ? <CohortMain /> : <Main />;
}
