import Main from "@/components/commander/semesters/Main";
import CohortMain from "@/components/commander/training-classes/Semesters";
import { cookies } from "next/headers";

export default async function SemestersPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  return code && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(code) ? <CohortMain /> : <Main />;
}
