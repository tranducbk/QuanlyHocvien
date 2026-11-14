import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import He5Main from "@/components/training-program/commander/training-classes/He5Main";

export default async function He5ClassTaskPage({ params, searchParams }: {
  params: Promise<{ yearId: string; screen: string }>;
  searchParams: Promise<{ classId?: string }>;
}) {
  if ((await cookies()).get("trainingSystemCode")?.value !== "HE_5") redirect("/commander");
  const { yearId, screen } = await params;
  if (screen === "history" || screen === "placement") redirect(`/commander/training-classes?yearId=${encodeURIComponent(yearId)}`);
  if (screen !== "students") notFound();
  const { classId } = await searchParams;
  if (screen === "students" && !classId) redirect(`/commander/training-classes?yearId=${encodeURIComponent(yearId)}`);
  return <He5Main key={`${yearId}:${screen}`} screen={screen} initialYearId={yearId} classId={classId} />;
}
