import Skeleton from "@/library/Skeleton";

export default function GradeRequestsSkeleton() {
  const columns = [90, 170, 90, 110, 100, 160, 140];

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 px-2">
        <Skeleton width={120} height={36} />
        <Skeleton width={150} height={36} />
        <Skeleton width={130} height={36} />
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50/50 dark:bg-neutral-900/70">
              <tr>
                {columns.map((width, index) => (
                  <th key={index} className="px-4 py-3">
                    <Skeleton variant="text" width={width} height={14} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-neutral-50 dark:border-neutral-900">
                  {columns.map((width, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <Skeleton
                        variant={
                          cellIndex === 3 || cellIndex === 4
                            ? "rounded"
                            : "text"
                        }
                        width={cellIndex === 1 ? 190 : width}
                        height={cellIndex === 3 || cellIndex === 4 ? 22 : 14}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <Skeleton variant="text" width={120} height={14} />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" width={32} height={32} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
