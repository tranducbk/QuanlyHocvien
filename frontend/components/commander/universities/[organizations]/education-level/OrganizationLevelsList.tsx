import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { HiOutlineAcademicCap } from "react-icons/hi";
import ErrorState from "@/library/ErrorState";
import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { organizationService } from "@/services/organizations";

interface OrganizationLevelsListProps {
  orgId: string;
  universityId: string;
}

export default function OrganizationLevelsList({
  orgId,
  universityId,
}: OrganizationLevelsListProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.EDUCATION_LEVELS, orgId],
    queryFn: () =>
      organizationService.getEducationLevels({ organizationId: orgId }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 ml-4 border-l border-neutral-100 dark:border-neutral-800 pl-4 mt-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton width={150} height={16} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ml-4 border-l border-neutral-100 dark:border-neutral-800 pl-4 mt-3">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const levels = data?.data || [];

  return (
    <div className="space-y-4 mt-3 ml-4 border-l border-neutral-100 dark:border-neutral-800 pl-4">
      {levels.map((level) => (
        <div key={level.id} className="space-y-2">
          <Link
            href={`/commander/universities/${universityId}/${orgId}/${level.id}`}
            className="flex items-center gap-4 cursor-pointer group flex-1"
          >
            <div className="flex items-center gap-2 group">
              <HiOutlineAcademicCap size={18} className="text-secondary-500" />
              <Typography
                variant="body"
                weight="semibold"
                className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
              >
                Trình độ: {level.levelName}
              </Typography>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
