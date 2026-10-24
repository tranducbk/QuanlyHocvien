import Main from "@/components/commander/dashboard/Main";
import CohortMain from "@/components/commander/training-classes/Main";
import { cookies } from "next/headers";

export default async function CommanderDashboardPage() {
  const trainingSystemCode = (await cookies()).get("trainingSystemCode")?.value;
  if (trainingSystemCode && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(trainingSystemCode)) {
    return <CohortMain systemCode={trainingSystemCode} view="overview" />;
  }
  return <Main />;
}
