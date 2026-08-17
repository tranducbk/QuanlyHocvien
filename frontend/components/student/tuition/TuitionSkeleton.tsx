import Skeleton from "@/library/Skeleton";

export default function TuitionSkeleton() {
  const columns = [120, 220, 120, 120, 100, 150];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none"
          >
            <Skeleton variant="rounded" width={42} height={42} />
            <Skeleton variant="text" width={120} height={12} className="mt-4" />
            <Skeleton variant="text" width={150} height={30} />
            <Skeleton variant="text" width={110} height={12} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton variant="rounded" width={92} height={40} />
        <Skeleton variant="rounded" width={128} height={40} />
        <Skeleton variant="rounded" width={150} height={40} />
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
        <div className="flex justify-end gap-2 px-4 py-4">
          <Skeleton variant="rounded" width={128} height={36} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50/50 dark:bg-neutral-900/70">
              <tr>
                <th className="px-4 py-3">
                  <Skeleton variant="text" width={40} height={14} />
                </th>
                {columns.map((width, index) => (
                  <th key={index} className="px-4 py-3">
                    <Skeleton variant="text" width={width} height={14} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-neutral-100 dark:border-neutral-800"
                >
                  <td className="px-4 py-4">
                    <Skeleton variant="text" width={24} height={14} />
                  </td>
                  {columns.map((width, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <Skeleton
                        variant={cellIndex === 3 ? "rounded" : "text"}
                        width={cellIndex === 1 ? 200 : width}
                        height={cellIndex === 3 ? 22 : 14}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
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
