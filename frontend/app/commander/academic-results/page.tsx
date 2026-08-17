import { Metadata } from "next";
import Main from "@/components/commander/academic-results/Main";

export const metadata: Metadata = {
  title: "Quản lý học tập",
};

export default function AcademicResultsPage() {
  return <Main />;
}
