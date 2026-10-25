import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Link from "next/link";
import {
  HiOutlineChevronRight,
  HiOutlineHome,
  HiOutlinePlus,
} from "react-icons/hi";

export default function UniversitySkeleton() {
  const columnCount = 6;

  return (
    <div className="space-y-8 relative rounded-2xl bg-white dark:bg-neutral-950 p-6 min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex items-center gap-2 text-neutral-400">
        <Link href="/commander" className="flex items-center gap-2">
          <HiOutlineHome size={14} />
          <Typography variant="label" tracking="wide">
            Tổng quan
          </Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Typography variant="label" color="primary" tracking="wide">
          Cơ sở đào tạo
        </Typography>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Typography variant="h1" transform="uppercase">
          Quản lý cơ sở đào tạo
        </Typography>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-600 rounded-xl text-[11px] font-black uppercase tracking-wider text-white opacity-50 cursor-not-allowed h-auto"
        >
          <HiOutlinePlus size={16} />
          Thêm trường đại học
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <div className="space-y-4">
            <div className="flex flex-row items-center justify-end gap-2 mb-4 px-2">
              <Skeleton width={130} height={36} />
              <Skeleton width={120} height={36} />
            </div>

            <div className="w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50/50 dark:bg-neutral-900/70">
                    <tr>
                      {Array.from({ length: columnCount }).map((_, index) => (
                        <th key={index} className="px-4 py-3">
                          <Skeleton
                            variant="text"
                            width={index === 0 ? 30 : 90}
                            height={14}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-neutral-50 dark:border-neutral-800">
                        <td className="px-4 py-3">
                          <Skeleton variant="text" width={24} height={14} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <Skeleton variant="text" width={180} height={14} />
                            <Skeleton variant="text" width={130} height={12} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="text" width={90} height={14} />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="text" width={70} height={14} />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="rounded" width={100} height={24} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 3 }).map((__, index) => (
                              <Skeleton
                                key={index}
                                variant="rounded"
                                width={36}
                                height={36}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
                <Skeleton variant="text" width={120} height={14} />
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rounded"
                      width={32}
                      height={32}
                    />
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
