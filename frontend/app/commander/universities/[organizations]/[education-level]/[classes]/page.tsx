import Main from "@/components/commander/universities/[organizations]/[classes]/Main";

interface Props {
  params: Promise<{
    organizations: string;
    "education-level": string;
    classes: string;
  }>
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const universityId = resolvedParams.organizations;
  const organizationId = resolvedParams["education-level"];
  const educationLevelId = resolvedParams.classes;
  return <Main universityId={universityId} organizationId={organizationId} educationLevelId={educationLevelId} />;
}
