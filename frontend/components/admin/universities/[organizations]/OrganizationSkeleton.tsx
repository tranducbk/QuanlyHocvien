import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import Button from "@/library/Button";
import Link from "next/link";
import { HiOutlineHome, HiOutlineChevronRight, HiOutlinePlus } from "react-icons/hi";

export default function OrganizationSkeleton() {
  return (
    <div className="space-y-8 relative rounded-2xl bg-white dark:bg-neutral-950 p-6 min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-neutral-400">
        <Link href="/commander" className="flex items-center gap-2">
          <HiOutlineHome size={14} />
          <Typography variant="label" tracking="wide">Tổng quan</Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Link href="/commander/universities">
          <Typography variant="label" tracking="wide">Cơ sở đào tạo</Typography>
        </Link>
        <HiOutlineChevronRight size={12} />
        <Skeleton width={120} height={16} />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Skeleton width={400} height={32} />
          <Typography variant="body" color="gray" className="mt-1">
            Quản lý các chuyên ngành và đơn vị trực thuộc trường
          </Typography>
        </div>
        <Button disabled className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-600 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white opacity-50 cursor-not-allowed h-auto" icon={HiOutlinePlus}>
          Thêm chuyên ngành / Đơn vị
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <Skeleton variant="rounded" width={48} height={48} />
                <div className="space-y-2">
                  <Skeleton variant="rounded" width={200} height={20} />
                  <div className="flex items-center gap-4">
                    <Skeleton variant="rounded" width={100} height={14} />
                    <Skeleton variant="rounded" width={80} height={14} />
                    <Skeleton variant="rounded" width={60} height={18} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton variant="rounded" width={36} height={36} />
                <Skeleton variant="rounded" width={36} height={36} />
                <Skeleton variant="rounded" width={36} height={36} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
