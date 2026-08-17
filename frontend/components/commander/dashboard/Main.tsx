"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineExternalLink,
  HiOutlineIdentification,
  HiOutlineViewGrid,
} from "react-icons/hi";
import type { IconType } from "react-icons";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import { BarsChart, DonutChart } from "@/library/charts";
import { QUERY_KEYS } from "@/constants/query-keys";
import { dashboardService } from "@/services/dashboard";
import {
  DashboardGradeRequestAlert,
  DashboardRecentStudent,
  DashboardRiskStudent,
  DashboardTuitionAlert,
} from "@/types/dashboard";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatSemesterYear,
} from "@/utils/fn-common";

type Tone = "primary" | "success" | "warning" | "error" | "sky" | "neutral";

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
  neutral:
    "border-neutral-100 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
};

const formatNumber = (value?: number) => (value ?? 0).toLocaleString("vi-VN");

export default function Main() {
  const dashboardQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_DASHBOARD],
    queryFn: dashboardService.getCommanderDashboard,
  });

  const dashboard = dashboardQuery.data?.data;

  const stats = [
    {
      label: "Học viên",
      value: formatNumber(dashboard?.overview.totalStudents),
      helper: "Hồ sơ đang quản lý",
      href: "/commander/profiles",
      icon: HiOutlineIdentification,
      tone: "primary",
    },
    {
      label: "Lớp học",
      value: formatNumber(dashboard?.overview.totalClasses),
      helper: "Lớp trong hệ thống",
      href: "/commander/classes",
      icon: HiOutlineViewGrid,
      tone: "sky",
    },
    {
      label: "Chờ duyệt",
      value: formatNumber(dashboard?.overview.pendingGradeRequests),
      helper: "Đề xuất kết quả học tập",
      href: "/commander/approvals",
      icon: HiOutlineCheckCircle,
      tone: "warning",
    },
    {
      label: "Chưa nộp phí",
      value: formatNumber(dashboard?.overview.unpaidTuitionRecords),
      helper: "Bản ghi cần theo dõi",
      href: "/commander/tuition",
      icon: HiOutlineCash,
      tone: "error",
    },
    {
      label: "Thành tích",
      value: formatNumber(dashboard?.overview.totalAchievements),
      helper: "Khen thưởng đã ghi nhận",
      href: "/commander/achievements",
      icon: HiOutlineBadgeCheck,
      tone: "success",
    },
    {
      label: "Rủi ro",
      value: formatNumber(dashboard?.overview.atRiskStudents),
      helper: "Học viên cần chú ý",
      href: "/commander/profiles",
      icon: HiOutlineExclamation,
      tone: "neutral",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    helper: string;
    href: string;
    icon: IconType;
    tone: Tone;
  }>;

  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan" }]}
      title="Tổng quan hệ thống"
      subtitle="Thống kê nhanh tình hình học viên, học phí, học tập và thành tích."
      isLoading={dashboardQuery.isLoading}
      skeleton={<DashboardSkeleton />}
      isError={dashboardQuery.isError}
      onRetry={dashboardQuery.refetch}
      className="space-y-8"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Học lực theo năm">
            <BarsChart data={dashboard?.charts.academicStatus || []} />
          </Panel>
          <Panel title="Trạng thái học phí">
            <DonutChart data={dashboard?.charts.tuitionStatus || []} />
          </Panel>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Học viên theo đơn vị">
            <BarsChart data={dashboard?.charts.studentsByUnit || []} color="#0ea5e9" />
          </Panel>
          <Panel title="Đề xuất điểm">
            <BarsChart data={dashboard?.charts.gradeRequests || []} color="#f59e0b" />
          </Panel>
        </section>


        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel
            title="Đề xuất cần xử lý"
            href="/commander/approvals"
            actionLabel="Xem tất cả"
          >
            <div className="space-y-3">
              {dashboard?.alerts.pendingRequests.length ? (
                dashboard.alerts.pendingRequests.map((request) => (
                  <PendingRequestItem key={request.id} request={request} />
                ))
              ) : (
                <EmptyLine
                  icon={HiOutlineCheckCircle}
                  title="Không có đề xuất chờ duyệt"
                  description="Các đề xuất mới của học viên sẽ xuất hiện tại đây."
                />
              )}
            </div>
          </Panel>

          <Panel
            title="Học phí chưa thanh toán"
            href="/commander/tuition"
            actionLabel="Quản lý học phí"
          >
            <div className="space-y-3">
              {dashboard?.alerts.unpaidTuition.length ? (
                dashboard.alerts.unpaidTuition.map((item) => (
                  <TuitionItem key={item.id} tuition={item} />
                ))
              ) : (
                <EmptyLine
                  icon={HiOutlineCash}
                  title="Chưa có cảnh báo học phí"
                  description="Các khoản chưa thanh toán sẽ được tổng hợp tại đây."
                />
              )}
            </div>
          </Panel>

          <Panel
            title="Hồ sơ cập nhật gần đây"
            href="/commander/profiles"
            actionLabel="Xem hồ sơ"
          >
            <div className="space-y-3">
              {dashboard?.recent.students.length ? (
                dashboard.recent.students.map((student) => (
                  <StudentItem key={student.id} student={student} />
                ))
              ) : (
                <EmptyLine
                  icon={HiOutlineAcademicCap}
                  title="Chưa có hồ sơ học viên"
                  description="Khi có hồ sơ mới hoặc thay đổi, danh sách sẽ hiển thị tại đây."
                />
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
  href,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  href: string;
  icon: IconType;
  tone: Tone;
}) => (
  <Link
    href={href}
    className={`group block rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none ${toneStyles[tone]}`}
  >
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
  </Link>
);

const Panel = ({
  title,
  href,
  actionLabel,
  children,
}: {
  title: string;
  href?: string;
  actionLabel?: string;
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
          {actionLabel || "Xem thêm"}
          <HiOutlineExternalLink size={16} />
        </Link>
      )}
    </div>
    {children}
  </section>
);

const RiskStudentItem = ({ student }: { student: DashboardRiskStudent }) => (
  <Link
    href="/commander/profiles"
    className="block rounded-xl border border-amber-100 bg-amber-50/60 p-4 transition-colors hover:border-amber-200 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:border-amber-800"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Typography variant="body" weight="semibold" className="break-words">
          {student.fullName}
        </Typography>
        <Typography variant="caption" color="gray" className="mt-1 block">
          {student.code || "Chưa có mã"} - CPA:{" "}
          {student.cpa4 !== null ? Number(student.cpa4).toFixed(2) : "Chưa có"}
        </Typography>
      </div>
      <Badge variant="warning">{student.reasons.length} cảnh báo</Badge>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {student.reasons.map((reason) => (
        <Badge key={reason} variant="neutral">
          {reason}
        </Badge>
      ))}
    </div>
  </Link>
);

const PendingRequestItem = ({ request }: { request: DashboardGradeRequestAlert }) => (
  <Link
    href="/commander/approvals"
    className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50/50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-primary-800 dark:hover:bg-primary-950/20"
  >
    <div className="min-w-0">
      <Typography variant="body" weight="semibold" className="break-words">
        {request.studentName}
      </Typography>
      <Typography variant="caption" color="gray" className="mt-1 block">
        {request.subjectName} - {formatDate(request.createdAt)}
      </Typography>
    </div>
    <Badge variant="warning">Chờ duyệt</Badge>
  </Link>
);

const TuitionItem = ({ tuition }: { tuition: DashboardTuitionAlert }) => (
  <Link
    href="/commander/tuition"
    className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 transition-colors hover:border-error-200 hover:bg-error-50/40 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-error-900 dark:hover:bg-error-950/20"
  >
    <div className="min-w-0">
      <Typography variant="body" weight="semibold" className="break-words">
        {tuition.studentName}
      </Typography>
      <Typography variant="caption" color="gray" className="mt-1 block">
        {formatSemesterYear(String(tuition.semester), tuition.schoolYear)}
      </Typography>
    </div>
    <Typography variant="caption" weight="bold" className="whitespace-nowrap text-amber-600">
      {formatCurrency(tuition.amount)}
    </Typography>
  </Link>
);

const StudentItem = ({ student }: { student: DashboardRecentStudent }) => (
  <Link
    href="/commander/profiles"
    className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 transition-colors hover:border-sky-200 hover:bg-sky-50/40 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-sky-900 dark:hover:bg-sky-950/20"
  >
    <div className="min-w-0">
      <Typography variant="body" weight="semibold" className="break-words">
        {student.fullName || "Chưa cập nhật"}
      </Typography>
      <Typography variant="caption" color="gray" className="mt-1 block">
        {student.code || "Chưa có mã"} -{" "}
        {student.className || student.unit || "Chưa phân lớp"}
      </Typography>
    </div>
    <Typography variant="caption" color="gray" className="whitespace-nowrap">
      {formatDateTime(student.updatedAt)}
    </Typography>
  </Link>
);

const EmptyLine = ({
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
      <Skeleton width={520} height={18} />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} height={142} />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Skeleton height={330} />
      <Skeleton height={330} />
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Skeleton height={360} />
      <Skeleton height={360} />
      <Skeleton height={360} />
    </div>
  </div>
);
