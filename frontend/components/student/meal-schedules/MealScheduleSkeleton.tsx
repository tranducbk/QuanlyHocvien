import Skeleton from "@/library/Skeleton";

export default function MealScheduleSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Skeleton variant="text" width={90} height={14} />
            <Skeleton variant="text" width={140} height={24} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900"
          >
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-700/80">
              <Skeleton variant="text" width={64} height={16} />
              <Skeleton variant="rounded" width={56} height={22} />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, mealIndex) => (
                <div
                  key={mealIndex}
                  className="flex items-center justify-between rounded-2xl border border-neutral-100 p-3 dark:border-neutral-700/50"
                >
                  <Skeleton variant="text" width={80} height={14} />
                  <Skeleton variant="rounded" width={72} height={22} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
