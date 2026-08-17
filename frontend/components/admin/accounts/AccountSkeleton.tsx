import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Link from "next/link";
import { HiOutlineHome, HiOutlineChevronRight, HiOutlineDownload } from "react-icons/hi";

export default function AccountSkeleton() {
  const columnCount = 8; // STT + Tài khoản + Thông tin + Vai trò + Trạng thái + Ngày tạo + Ngày cập nhật + Hành động

  return (
    <div className="space-y-8 rounded-2xl bg-white dark:bg-neutral-950 p-6 min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-neutral-400">
        <Link href="/admin" className="flex items-center gap-2">
          <HiOutlineHome size={14} />
          <Typography variant="label" tracking="wide">Tổng quan</Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Typography variant="label" color="primary" tracking="wide">Quản lý tài khoản</Typography>
      </div>

      {/* Header */}
      <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <Typography variant="h1" transform="uppercase">Quản lý tài khoản</Typography>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button disabled className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl opacity-50 cursor-not-allowed">
            <HiOutlineDownload size={16} className="text-neutral-600" />
            <Typography variant="label" color="neutral">Xuất Excel</Typography>
          </button>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <div className="space-y-4">
            {/* Toolbar skeleton */}
            <div className="flex flex-row items-center justify-end gap-2 mb-4 px-2">
              <Skeleton width={160} height={36} />
              <Skeleton width={140} height={36} />
              <Skeleton width={100} height={36} />
              <Skeleton width={120} height={36} />
            </div>

            {/* Table */}
            <div className="w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {/* Header */}
                  <thead className="bg-neutral-50/50 dark:bg-neutral-900/70">
                    <tr>
                      {Array.from({ length: columnCount }).map((_, i) => (
                        <th key={i} className="px-4 py-3">
                          <Skeleton variant="text" width={i === 0 ? 30 : 80} height={14} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {/* Rows */}
                  <tbody>
                    {Array.from({ length: 10 }).map((_, rowIdx) => (
                      <tr key={rowIdx} className="border-t border-neutral-50 dark:border-neutral-800">
                        {/* STT */}
                        <td className="px-4 py-3"><Skeleton variant="text" width={20} height={14} /></td>
                        {/* Tài khoản */}
                        <td className="px-4 py-3"><Skeleton variant="text" width={100} height={14} /></td>
                        {/* Thông tin cá nhân */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <Skeleton variant="text" width={120} height={14} />
                            <Skeleton variant="text" width={160} height={12} />
                          </div>
                        </td>
                        {/* Vai trò */}
                        <td className="px-4 py-3"><Skeleton variant="rounded" width={70} height={24} /></td>
                        {/* Trạng thái */}
                        <td className="px-4 py-3"><Skeleton variant="rounded" width={100} height={24} /></td>
                        {/* Ngày tạo */}
                        <td className="px-4 py-3"><Skeleton variant="text" width={110} height={14} /></td>
                        {/* Ngày cập nhật */}
                        <td className="px-4 py-3"><Skeleton variant="text" width={110} height={14} /></td>
                        {/* Hành động */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} variant="rounded" width={36} height={36} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination skeleton */}
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
