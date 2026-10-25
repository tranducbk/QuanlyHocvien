import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Main from "@/components/training-program/commander/training-classes/Main";

export default async function CommanderTrainingClassesPage() {
  const systemCode = (await cookies()).get("trainingSystemCode")?.value ?? "";
  if (!["HE_1", "HE_3", "HE_4", "HE_7"].includes(systemCode)) redirect("/commander");
  return <Main systemCode={systemCode} view="classes" />;
}
