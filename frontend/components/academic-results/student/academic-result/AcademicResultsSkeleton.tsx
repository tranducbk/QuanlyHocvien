import { Fragment } from "react";
import Skeleton from "@/library/Skeleton";

export default function AcademicResultsSkeleton() {
  const columns = [90, 180, 60, 80, 70, 70, 120];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm dark:shadow-none"
          >
            <Skeleton variant="text" width={90} height={12} />
            <Skeleton variant="text" width={70} height={32} />
            <Skeleton variant="text" width={130} height={12} />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 px-2">
        <Skeleton width={120} height={36} />
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
              {Array.from({ length: 3 }).map((_, groupIndex) => (
                <Fragment key={groupIndex}>
                  <tr className="border-t border-neutral-100 dark:border-neutral-800">
                    <td colSpan={columns.length} className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton variant="rounded" width={36} height={36} />
                        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <Skeleton variant="text" width={180} height={16} />
                            <Skeleton variant="text" width={90} height={12} />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton
                              variant="rounded"
                              width={70}
                              height={22}
                            />
                            <Skeleton
                              variant="rounded"
                              width={90}
                              height={22}
                            />
                            <Skeleton
                              variant="rounded"
                              width={80}
                              height={22}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {Array.from({ length: 2 }).map((__, rowIndex) => (
                    <tr
                      key={`subject-${groupIndex}-${rowIndex}`}
                      className="border-t border-neutral-50 dark:border-neutral-900"
                    >
                      {columns.map((width, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 first:pl-12">
                          <Skeleton
                            variant={cellIndex === 3 ? "rounded" : "text"}
                            width={cellIndex === 1 ? 160 : width}
                            height={cellIndex === 3 ? 22 : 14}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
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
