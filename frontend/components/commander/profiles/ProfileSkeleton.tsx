import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Link from "next/link";
import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi";

export default function ProfileSkeleton() {
  const columnCount = 8;

  return (
    <div className="space-y-8 rounded-2xl bg-white dark:bg-neutral-950 p-6 min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex items-center gap-2 text-neutral-400">
        <Link href="/commander" className="flex items-center gap-2">
          <HiOutlineHome size={14} />
          <Typography variant="label" tracking="wide">
            Tổng quan
          </Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Typography variant="label" color="primary" tracking="wide">
          Hồ sơ học viên
        </Typography>
      </div>

      <div>
        <Typography variant="h1" transform="uppercase">
          Hồ sơ học viên
        </Typography>
        <Skeleton variant="text" width={360} height={18} className="mt-2" />
      </div>

      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <div className="space-y-4">
            <div className="flex flex-row items-center justify-end gap-2 mb-4 px-2">
              <Skeleton width={150} height={36} />
              <Skeleton width={130} height={36} />
              <Skeleton width={100} height={36} />
            </div>

            <div className="w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50/50 dark:bg-neutral-900/70">
                    <tr>
                      {Array.from({ length: columnCount }).map((_, i) => (
                        <th key={i} className="px-4 py-3">
                          <Skeleton
                            variant="text"
                            width={i === 0 ? 30 : 88}
                            height={14}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-t border-neutral-50 dark:border-neutral-800"
                      >
                        {Array.from({ length: columnCount }).map((_, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-3">
                            {cellIdx === 1 ? (
                              <div className="space-y-1">
                                <Skeleton variant="text" width={130} height={14} />
                                <Skeleton variant="text" width={90} height={12} />
                              </div>
                            ) : cellIdx === columnCount - 1 ? (
                              <div className="flex items-center gap-1">
                                <Skeleton variant="rounded" width={36} height={36} />
                                <Skeleton variant="rounded" width={36} height={36} />
                              </div>
                            ) : (
                              <Skeleton
                                variant="text"
                                width={cellIdx === 0 ? 20 : 110}
                                height={14}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
                <Skeleton variant="text" width={120} height={14} />
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" width={32} height={32} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
