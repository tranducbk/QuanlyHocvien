import Skeleton from "@/library/Skeleton";

export default function AchievementsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none"
          >
            <Skeleton variant="rounded" width={40} height={40} />
            <Skeleton variant="text" width={90} height={12} className="mt-4" />
            <Skeleton variant="text" width={56} height={30} />
            <Skeleton variant="text" width={120} height={12} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none"
          >
            <Skeleton variant="text" width={150} height={16} />
            <Skeleton variant="text" width="85%" height={12} />
            <Skeleton variant="rounded" width={120} height={24} />
          </div>
        ))}
      </div>

      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton variant="text" width={180} height={24} />
              <Skeleton variant="text" width={260} height={12} />
            </div>
            <Skeleton variant="rounded" width={72} height={24} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((__, itemIndex) => (
              <div
                key={itemIndex}
                className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none"
              >
                <div className="flex gap-4">
                  <Skeleton variant="rounded" width={44} height={44} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="75%" height={18} />
                    <Skeleton variant="text" width="55%" height={12} />
                    <div className="mt-3 flex gap-2">
                      <Skeleton variant="rounded" width={80} height={22} />
                      <Skeleton variant="rounded" width={90} height={22} />
                    </div>
                  </div>
                </div>
                <Skeleton variant="text" width="92%" height={12} className="mt-4" />
                <Skeleton variant="text" width="70%" height={12} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
