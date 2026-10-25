"use client";

import Skeleton from "@/library/Skeleton";

export default function CutRiceSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-3">
        <Skeleton className="h-11 w-32 rounded-2xl" />
        <Skeleton className="h-11 w-36 rounded-2xl" />
      </div>
      <div className="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
        <div className="mb-4 grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
