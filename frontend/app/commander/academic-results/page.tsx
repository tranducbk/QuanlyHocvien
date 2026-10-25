import { Metadata } from "next";
import Main from "@/components/academic-results/commander/Main";
import CohortMain from "@/components/training-program/commander/training-classes/AcademicResults";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Quản lý học tập",
};

export default async function AcademicResultsPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  return code && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(code) ? <CohortMain /> : <Main />;
}
