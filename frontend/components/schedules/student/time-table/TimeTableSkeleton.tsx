import Skeleton from "@/library/Skeleton";

interface TimeTableSkeletonProps {
  showFilter?: boolean;
}

export default function TimeTableSkeleton({
  showFilter = true,
}: TimeTableSkeletonProps) {
  return (
    <div className="space-y-6">
      {showFilter && (
        <div className="flex justify-end">
          <Skeleton variant="rounded" width={360} height={44} />
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="p-5 sm:p-7">
            <div className="mb-7 flex items-center justify-between">
              <Skeleton variant="rounded" width={40} height={40} />
              <Skeleton variant="text" width={160} height={24} />
              <Skeleton variant="rounded" width={40} height={40} />
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton
                  key={`label-${index}`}
                  variant="text"
                  width="100%"
                  height={18}
                />
              ))}
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton
                  key={`day-${index}`}
                  variant="rounded"
                  width="100%"
                  height={52}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-100 bg-neutral-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-8 flex flex-col items-center gap-2">
              <Skeleton variant="text" width={180} height={24} />
              <Skeleton variant="text" width={140} height={14} />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  width="100%"
                  height={140}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
