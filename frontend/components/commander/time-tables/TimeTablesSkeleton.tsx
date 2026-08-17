import Skeleton from "@/library/Skeleton";

export default function TimeTablesSkeleton() {
  const columnCount = 6;

  return (
    <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
      <div className="px-4">
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-end gap-2 mb-4 px-2">
            <Skeleton width={100} height={36} />
            <Skeleton width={120} height={36} />
          </div>

          <div className="w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50/50 dark:bg-neutral-900/60 transition-colors">
                  <tr>
                    {Array.from({ length: columnCount }).map((_, index) => (
                      <th key={index} className="px-4 py-3">
                        <Skeleton variant="text" width={index === 0 ? 120 : 90} height={14} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-t border-neutral-50 dark:border-neutral-800/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <Skeleton variant="text" width={150} height={14} />
                          <Skeleton variant="text" width={90} height={12} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="rounded" width={64} height={24} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="text" width={160} height={14} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="text" width={100} height={14} />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="text" width={110} height={14} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Skeleton variant="rounded" width={36} height={36} />
                          <Skeleton variant="rounded" width={36} height={36} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between transition-colors">
              <Skeleton variant="text" width={120} height={14} />
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" width={32} height={32} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
