import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Main from "@/components/training-program/commander/training-programs/Main";

const systemNames: Record<string, string> = {
  HE_1: "HE_1",
  HE_3: "HE_3",
  HE_4: "HE_4",
  HE_5: "HE_5",
  HE_7: "HE_7",
};

export default async function CommanderTrainingProgramsPage() {
  const systemCode = (await cookies()).get("trainingSystemCode")?.value ?? "";
  if (!systemNames[systemCode]) redirect("/commander");
  return <Main systemCode={systemCode} />;
}
