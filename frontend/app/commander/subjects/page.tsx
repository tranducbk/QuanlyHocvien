import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Subjects from "@/components/commander/training-classes/Subjects";

export default async function CommanderSubjectsPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  if (!code || !["HE_1", "HE_3", "HE_4", "HE_7"].includes(code)) redirect("/commander");
  return <Subjects />;
}
