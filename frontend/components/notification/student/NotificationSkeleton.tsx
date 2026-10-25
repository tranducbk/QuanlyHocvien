import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Link from "next/link";
import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi";
 
export default function NotificationSkeleton() {
  const columns = [180, 90, 280, 100, 150, 90];
 
  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
        <Link
          href="/student"
          className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-neutral-100 transition-colors"
        >
          <HiOutlineHome size={14} className="mb-0.5" />
          <Typography variant="label" tracking="wide">
            Trang chủ
          </Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Typography variant="label" color="primary" tracking="wide">
          Thông báo
        </Typography>
      </div>

      {/* Page Header */}
      <div>
        <Typography variant="h1" transform="uppercase">
          Thông báo
        </Typography>
        <Skeleton variant="text" width={380} height={16} className="mt-2" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-end px-2">
          <Skeleton variant="rounded" width={100} height={36} />
        </div>
 
      <div className="w-full overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
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
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-neutral-100 dark:border-neutral-800"
                >
                  {columns.map((width, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <Skeleton
                        variant={cellIndex === 1 || cellIndex === 3 ? "rounded" : "text"}
                        width={cellIndex === 2 ? 240 : width}
                        height={cellIndex === 1 || cellIndex === 3 ? 22 : 14}
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
    </div>
  );
}
