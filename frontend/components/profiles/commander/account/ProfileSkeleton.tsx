"use client";

import React from "react";
import Skeleton from "@/library/Skeleton";

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0 text-neutral-900 dark:text-neutral-100 transition-colors">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-neutral-900/60 backdrop-blur-sm p-6 rounded-4xl border border-white/60 dark:border-neutral-800 shadow-sm dark:shadow-none">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <Skeleton
            variant="circular"
            width={120}
            height={120}
            className="border-4 border-white dark:border-neutral-800"
          />
          <div className="absolute bottom-1 right-1 size-10 rounded-full bg-white dark:bg-neutral-900 p-1">
            <Skeleton variant="circular" width="100%" height="100%" />
          </div>
        </div>

        <div className="text-center md:text-left flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Skeleton variant="rounded" width={280} height={36} />
            <Skeleton variant="rounded" width={90} height={24} />
          </div>

          <Skeleton variant="rounded" width={160} height={20} />
          <Skeleton variant="rounded" width={110} height={24} />
        </div>
      </div>
      <div className="flex justify-center md:justify-end">
        <Skeleton variant="rounded" width={180} height={52} />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-primary-200 dark:bg-primary-500/40 rounded-full animate-pulse" />
            <Skeleton variant="rounded" width={200} height={28} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Skeleton key={i} variant="rounded" height={72} />
            ))}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-secondary-200 dark:bg-secondary-500/40 rounded-full animate-pulse" />
            <Skeleton variant="rounded" width={220} height={28} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" height={72} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="flex flex-col gap-8">
        <div className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-primary-200 dark:bg-primary-500/40 rounded-full animate-pulse" />
            <Skeleton variant="rounded" width={180} height={28} />
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={72} />
            ))}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-secondary-200 dark:bg-secondary-500/40 rounded-full animate-pulse" />
            <Skeleton variant="rounded" width={160} height={28} />
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={52}
                className="rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
