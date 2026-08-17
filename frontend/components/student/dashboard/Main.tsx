"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import type { IconType } from "react-icons";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import { DonutChart, TrendChart } from "@/library/charts";
import { QUERY_KEYS } from "@/constants/query-keys";
import { dashboardService } from "@/services/dashboard";
import {
  formatCurrency,
  formatScore,
  formatSemesterYear,
} from "@/utils/fn-common";

type Tone = "primary" | "success" | "warning" | "secondary" | "neutral";

const toneStyles: Record<Tone, string> = {
  primary:
    "border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-700/60 dark:bg-primary-950/40 dark:text-primary-100",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning:
    "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100",
  secondary:
    "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-100",
  neutral:
    "border-neutral-100 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
};

const formatNumber = (value?: number) => (value ?? 0).toLocaleString("vi-VN");

export default function Main() {
  const dashboardQuery = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_DASHBOARD],
    queryFn: dashboardService.getStudentDashboard,
  });

  const dashboard = dashboardQuery.data?.data;
  const profile = dashboard?.profile;
  const overview = dashboard?.overview;

  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan" }]}
      title={profile?.fullName || profile?.username || "Học viên"}
      subtitle="Theo dõi tiến độ học tập, lịch học, học phí và thông báo của bạn."
      isLoading={dashboardQuery.isLoading}
      skeleton={<DashboardSkeleton />}
      isError={dashboardQuery.isError}
      onRetry={dashboardQuery.refetch}
      className="space-y-8"
    >
      <div className="space-y-8">

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="CPA hệ 4"
            value={formatScore(overview?.cpa4)}
            helper={`${overview?.credits || 0} tín chỉ tích lũy`}
            icon={HiOutlineChartBar}
            tone="primary"
          />
          <StatCard
            label="Môn đã đạt"
            value={formatNumber(overview?.passedSubjects)}
            helper={`${overview?.failedSubjects || 0} môn chưa đạt`}
            icon={HiOutlineCheckCircle}
            tone="success"
          />
          <StatCard
            label="Lịch học"
            value={formatNumber(overview?.scheduleCount)}
            helper={`${overview?.cutMealCount || 0} bữa cắt cơm`}
            icon={HiOutlineCalendar}
            tone="secondary"
          />
          <StatCard
            label="Học phí chưa nộp"
            value={formatNumber(overview?.unpaidTuitionCount)}
            helper={formatCurrency(overview?.unpaidTuitionAmount || 0)}
            icon={HiOutlineCash}
            tone={overview?.unpaidTuitionCount ? "warning" : "neutral"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Tiến độ CPA theo năm">
            <TrendChart
              data={dashboard?.charts.academicTrend || []}
              valueFormatter={(value) => formatScore(value)}
              emptyText="Chưa có dữ liệu học tập."
            />
          </Panel>
          <Panel title="Tình trạng môn học">
            <DonutChart data={dashboard?.charts.subjectStatus || []} />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <Panel title="Trạng thái học phí">
            <DonutChart data={dashboard?.charts.tuitionStatus || []} />
          </Panel>

          <Panel title="Học phí của tôi" href="/student/tuition">
            <div className="space-y-3">
              {dashboard?.recent.tuition.length ? (
                dashboard.recent.tuition.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"
                  >
                    <div className="min-w-0">
                      <Typography variant="body" weight="semibold">
                        {formatCurrency(fee.amount)}
                      </Typography>
                      <Typography variant="caption" color="gray" className="mt-1 block">
                        {formatSemesterYear(String(fee.semester), fee.schoolYear)}
                      </Typography>
                    </div>
                    <Badge variant={fee.status === "PAID" ? "success" : "warning"}>
                      {fee.status === "PAID" ? "Đã nộp" : "Chưa nộp"}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyLine icon={HiOutlineCash} text="Chưa có bản ghi học phí." />
              )}
            </div>
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
}: {
  label: string;
  value: string;
  helper: string;
  icon: IconType;
  tone: Tone;
}) => (
  <div className={`rounded-2xl border p-5 ${toneStyles[tone]}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <Typography variant="label" weight="bold" className="opacity-80">
          {label}
        </Typography>
        <div className="mt-3 text-3xl font-black leading-none">{value}</div>
      </div>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm dark:bg-neutral-950/40">
        <Icon size={20} />
      </div>
    </div>
    <Typography variant="caption" className="mt-3 block opacity-75">
      {helper}
    </Typography>
  </div>
);

const QuickLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: IconType;
}) => (
  <Link
    href={href}
    className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-700 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-neutral-800 dark:text-neutral-200"
  >
    <Icon size={18} />
    {label}
  </Link>
);

const Panel = ({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
    <div className="mb-4 flex items-center justify-between gap-4">
      <Typography variant="h3" weight="bold">
        {title}
      </Typography>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
        >
          Xem thêm
          <HiOutlineExternalLink size={16} />
        </Link>
      )}
    </div>
    {children}
  </section>
);

const EmptyLine = ({ icon: Icon, text }: { icon: IconType; text: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 p-5 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
    <Icon size={22} />
    <Typography variant="body" color="gray">
      {text}
    </Typography>
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen space-y-8 rounded-2xl bg-white p-6 dark:bg-neutral-950">
    <div className="space-y-2">
      <Skeleton width={280} height={36} />
      <Skeleton width={460} height={18} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} height={132} />
      ))}
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Skeleton height={320} />
      <Skeleton height={320} />
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Skeleton height={300} />
      <Skeleton height={300} />
    </div>
  </div>
);
