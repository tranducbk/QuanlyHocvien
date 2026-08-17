import Main from "@/components/commander/duty-schedules/Main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý lịch trực | Hệ thống quản lý học viên",
  description: "Quản lý lịch trực của học viên và cán bộ, quản lý lịch trực tuần, lịch trực tháng và lịch trực theo năm học.",
};

export default function DutySchedulesPage() {
  return <Main />;
}
