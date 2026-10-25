import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Link from "next/link";
import { HiOutlineHome, HiOutlineChevronRight } from "react-icons/hi";

export default function SemesterSkeleton() {
  const columnCount = 6;

  return (
    <div className="space-y-8 rounded-2xl bg-white dark:bg-neutral-950 p-6 min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
        <Link href="/commander" className="flex items-center gap-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          <HiOutlineHome size={14} />
          <Typography variant="label" tracking="wide">Tổng quan</Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Typography variant="label" color="primary" tracking="wide">Quản lý học kỳ</Typography>
      </div>

      <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <Typography variant="h1" transform="uppercase">Quản lý học kỳ</Typography>
        </div>
      </div>

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
                      {Array.from({ length: columnCount }).map((_, i) => (
                        <th key={i} className="px-4 py-3">
                          <Skeleton variant="text" width={i === 0 ? 30 : 100} height={14} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, rowIdx) => (
                      <tr key={rowIdx} className="border-t border-neutral-50 dark:border-neutral-800/70 transition-colors">
                        <td className="px-4 py-3"><Skeleton variant="text" width={20} height={14} /></td>
                        <td className="px-4 py-3"><Skeleton variant="text" width={150} height={14} /></td>
                        <td className="px-4 py-3"><Skeleton variant="text" width={100} height={14} /></td>
                        <td className="px-4 py-3"><Skeleton variant="text" width={110} height={14} /></td>
                        <td className="px-4 py-3"><Skeleton variant="text" width={110} height={14} /></td>
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
