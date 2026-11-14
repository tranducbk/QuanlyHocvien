import Main from "@/components/profiles/commander/students/Main";
import { cookies } from "next/headers";

export default async function CommanderStudentProfilesPage() {
  const systemCode = (await cookies()).get("trainingSystemCode")?.value;
  return <Main militaryMode={systemCode !== "HE_5"} />;
}
