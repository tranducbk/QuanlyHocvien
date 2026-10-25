"use client";

import React from "react";
import Skeleton from "@/library/Skeleton";

const DetailUserSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 py-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={24} />
          <div className="flex gap-2">
            <Skeleton variant="rounded" width={80} height={20} />
            <Skeleton variant="rounded" width={60} height={20} />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        {/* Account Section */}
        <div className="space-y-4">
          <Skeleton variant="text" width={150} height={16} />
          <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={40} />
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <Skeleton variant="text" width={150} height={16} />
          <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={40} />
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <Skeleton variant="text" width={150} height={16} />
          <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
          </div>
        </div>

        {/* Work & Position */}
        <div className="space-y-4">
          <Skeleton variant="text" width={150} height={16} />
          <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
          </div>
        </div>

        {/* Political & Background */}
        <div className="md:col-span-2 space-y-4">
          <Skeleton variant="text" width={200} height={16} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="space-y-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
            <div className="space-y-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
            <div className="space-y-4">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailUserSkeleton;
