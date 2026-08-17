"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineCollection,
  HiOutlineExclamation,
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
} from "react-icons/hi";
import type { IconType } from "react-icons";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import { BarsChart, DonutChart } from "@/library/charts";
import { QUERY_KEYS } from "@/constants/query-keys";
import { dashboardService } from "@/services/dashboard";
import { formatDateTime } from "@/utils/fn-common";

type Tone = "primary" | "success" | "warning" | "error" | "sky";

const toneStyles: Record<Tone, string> = {
  primary:
    "border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-700/60 dark:bg-primary-950/40 dark:text-primary-100",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning:
    "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100",
  error:
    "border-error-100 bg-error-50 text-error-700 dark:border-error-700/60 dark:bg-error-950/40 dark:text-error-100",
  sky: "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-100",
};

const formatNumber = (value?: number) => (value ?? 0).toLocaleString("vi-VN");

export default function Main() {
  const dashboardQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
    queryFn: dashboardService.getAdminDashboard,
  });

  const dashboard = dashboardQuery.data?.data;
  const overview = dashboard?.overview;

  const stats = [
    {
      label: "Tài khoản",
      value: formatNumber(overview?.totalUsers),
      helper: "Tổng người dùng",
      icon: HiOutlineUserGroup,
      tone: "primary",
    },
    {
      label: "Đang hoạt động",
      value: formatNumber(overview?.activeUsers),
      helper: "Tài khoản khả dụng",
      icon: HiOutlineCheckCircle,
      tone: "success",
    },
    {
      label: "Bị khóa",
      value: formatNumber(overview?.inactiveUsers),
      helper: "Cần rà soát",
      icon: HiOutlineExclamation,
      tone: "warning",
    },
    {
      label: "Cơ sở đào tạo",
      value: formatNumber(overview?.totalUniversities),
      helper: "Trường/đơn vị cấp trường",
      icon: HiOutlineOfficeBuilding,
      tone: "primary",
      href: "/admin/universities",
    },
    {
      label: "Khoa/Đơn vị",
      value: formatNumber(overview?.totalOrganizations),
      helper: "Đơn vị trực thuộc",
      icon: HiOutlineCollection,
      tone: "sky",
      href: "/admin/universities",
    },
    {
      label: "Lớp học",
      value: formatNumber(overview?.totalClasses),
      helper: "Lớp đang quản lý",
      icon: HiOutlineAcademicCap,
      tone: "success",
      href: "/admin/classes",
    },
    {
      label: "Học viên",
      value: formatNumber(overview?.totalStudents),
      helper: "Tài khoản học viên",
      icon: HiOutlineIdentification,
      tone: "warning",
      href: "/admin/accounts",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    helper: string;
    icon: IconType;
    tone: Tone;
    href?: string;
  }>;

  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan" }]}
      title="Tổng quan hệ thống"
      subtitle="Theo dõi tài khoản, dữ liệu nền và các cảnh báo vận hành."
      isLoading={dashboardQuery.isLoading}
      skeleton={<DashboardSkeleton />}
      isError={dashboardQuery.isError}
      onRetry={dashboardQuery.refetch}
      className="space-y-8"
    >
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Người dùng theo vai trò">
            <DonutChart data={dashboard?.charts.usersByRole || []} />
          </Panel>
          <Panel title="Trạng thái tài khoản">
            <DonutChart data={dashboard?.charts.userStatus || []} />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Dữ liệu nền">
            <BarsChart data={dashboard?.charts.masterData || []} color="#747a56" />
          </Panel>
          <Panel title="Bản ghi theo phân hệ">
            <BarsChart
              data={dashboard?.charts.recordsByModule || []}
              color="#0ea5e9"
            />
          </Panel>
        </section>
      </div>
    </PageContainer>
  );
}

const StatCard = ({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  helper: string;
  icon: IconType;
  tone: Tone;
  href?: string;
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Typography variant="label" weight="bold" className="opacity-80">
            {label}
          </Typography>
          <div className="mt-3 text-3xl font-black leading-none">{value}</div>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-current shadow-sm dark:bg-neutral-950/40">
          <Icon size={20} />
        </div>
      </div>
      <Typography variant="caption" className="mt-3 block opacity-75">
        {helper}
      </Typography>
    </>
  );

  const baseClass = `block rounded-2xl border p-5 ${toneStyles[tone]}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClass} transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none`}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
};

const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
    <Typography variant="h3" weight="bold" className="mb-4">
      {title}
    </Typography>
    {children}
  </section>
);

const AlertLine = ({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-white text-primary-600 dark:bg-neutral-950 dark:text-primary-300">
        <Icon size={18} />
      </div>
      <Typography variant="body" weight="semibold">
        {label}
      </Typography>
    </div>
    <Badge variant={value ? "warning" : "success"}>{formatNumber(value)}</Badge>
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-dashed border-neutral-200 p-5 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
    <Icon size={22} className="mt-0.5 shrink-0" />
    <div>
      <Typography variant="body" weight="semibold" color="neutral">
        {title}
      </Typography>
      <Typography variant="caption" color="gray" className="mt-1 block">
        {description}
      </Typography>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen space-y-8 rounded-2xl bg-white p-6 dark:bg-neutral-950">
    <div className="space-y-2">
      <Skeleton width={260} height={36} />
      <Skeleton width={460} height={18} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} height={132} />
      ))}
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Skeleton height={300} />
      <Skeleton height={300} />
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Skeleton height={330} />
      <Skeleton height={330} />
    </div>
  </div>
);
