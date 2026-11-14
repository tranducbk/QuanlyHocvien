import TimeTablesMain from "@/components/schedules/commander/time-tables/Main";
import CohortTimeTable from "@/components/training-program/commander/training-classes/TimeTable";
import { cookies } from "next/headers";

export default async function TimeTablesPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  return code && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(code) ? <CohortTimeTable /> : <TimeTablesMain />;
}
