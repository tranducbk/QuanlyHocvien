"use client";

import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Link from "next/link";
import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi";

export default function TuitionSkeleton() {
  const columnCount = 7;

  return (
    <div className="min-h-screen space-y-8 rounded-2xl bg-white p-6 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
        <Link href="/commander" className="flex items-center gap-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300">
          <HiOutlineHome size={14} />
          <Typography variant="label" tracking="wide">
            Tổng quan
          </Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Typography variant="label" color="primary" tracking="wide">
          Quản lý học phí
        </Typography>
      </div>

      <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
        <div>
          <Typography variant="h1" transform="uppercase">
            Quản lý học phí
          </Typography>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white transition-colors dark:bg-neutral-950">
        <div className="mb-4 flex justify-end px-4">
          <Skeleton variant="rounded" width={132} height={40} />
        </div>

        <div className="px-4">
          <div className="space-y-4">
            <div className="mb-4 flex flex-row items-center justify-end gap-2 px-2">
              <Skeleton width={100} height={36} />
              <Skeleton width={150} height={36} />
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-neutral-50/50 transition-colors dark:bg-neutral-900/60">
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
                      <tr key={rowIndex} className="border-t border-neutral-50 transition-colors dark:border-neutral-800/70">
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            <Skeleton variant="text" width={130} height={14} />
                            <Skeleton variant="text" width={90} height={12} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="text" width={110} height={14} />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="text" width={120} height={14} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            <Skeleton variant="text" width={180} height={12} />
                            <Skeleton variant="text" width={140} height={12} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="rounded" width={96} height={22} />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton variant="text" width={120} height={14} />
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

              <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 transition-colors dark:border-neutral-800">
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
    </div>
  );
}
