import Main from "@/components/academic-years/commander/Main";
import CohortMain from "@/components/training-program/commander/training-classes/Semesters";
import { cookies } from "next/headers";

export default async function SemestersPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  return code && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(code) ? <CohortMain /> : <Main />;
}
