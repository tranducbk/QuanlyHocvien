import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Main from "@/components/training-program/commander/training-classes/Main";
import He5Main from "@/components/training-program/commander/training-classes/He5Main";

export default async function CommanderTrainingClassesPage({ searchParams }: { searchParams: Promise<{ yearId?: string }> }) {
  const systemCode = (await cookies()).get("trainingSystemCode")?.value ?? "";
  if (!["HE_1", "HE_3", "HE_4", "HE_5", "HE_7"].includes(systemCode)) redirect("/commander");
  if (systemCode === "HE_5") return <He5Main initialYearId={(await searchParams).yearId} />;
  return <Main systemCode={systemCode} view="classes" />;
}
