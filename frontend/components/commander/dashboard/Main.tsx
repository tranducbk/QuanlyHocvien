"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
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
import { EmptyLine, Panel, StatCard, type DashboardTone } from "./DashboardParts";
import { dashboardService } from "@/services/dashboard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DashboardGradeRequestAlert,
  DashboardRecentStudent,
  DashboardTuitionAlert,
} from "@/types/dashboard";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatSemesterYear,
} from "@/utils/fn-common";

const formatNumber = (value?: number) => (value ?? 0).toLocaleString("vi-VN");

export default function Main() {
  const trainingSystemCode = useAuthStore((state) => state.user?.trainingSystemCode);
  const dashboardQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_DASHBOARD],
    queryFn: dashboardService.getCommanderDashboard,
  });

  const dashboard = dashboardQuery.data?.data;

  if (trainingSystemCode && trainingSystemCode !== "HE_5") {
    const militaryStats = [
      { label: "Học viên", value: dashboard?.overview.totalStudents || 0, href: "/commander/military/students" },
      { label: "Lớp được giao", value: dashboard?.overview.totalClasses || 0, href: "/commander/military/classes" },
      { label: "Môn học", value: dashboard?.overview.totalSubjects || 0, href: "/commander/military/subjects" },
      { label: "Đề xuất chờ duyệt", value: dashboard?.overview.pendingGradeRequests || 0, href: "/commander/military/approvals" },
      { label: "Thành tích", value: dashboard?.overview.totalAchievements || 0, href: "/commander/military/achievements" },
      { label: "Lịch trực", value: dashboard?.overview.totalDutySchedules || 0, href: "/commander/military/duty-schedules" },
    ];
    return (
      <PageContainer breadcrumb={[{ label: "Tổng quan" }]} title="Tổng quan hệ quân sự" subtitle="Tình hình các lớp được giao, học tập và công việc cần xử lý." isLoading={dashboardQuery.isLoading} skeleton={<DashboardSkeleton />} isError={dashboardQuery.isError} onRetry={dashboardQuery.refetch} className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {militaryStats.map((item) => <Link key={item.label} href={item.href} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"><Typography variant="label" weight="bold" color="gray">{item.label}</Typography><p className="mt-3 text-3xl font-black text-primary-700 dark:text-primary-300">{formatNumber(item.value)}</p></Link>)}
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Đề xuất điểm cần xử lý" href="/commander/military/approvals" actionLabel="Xem đề xuất">
            <div className="space-y-3">{dashboard?.alerts.pendingRequests.length ? dashboard.alerts.pendingRequests.map((request) => <PendingRequestItem key={request.id} request={request} />) : <EmptyLine icon={HiOutlineCheckCircle} title="Không có đề xuất chờ duyệt" description="Đề xuất điểm của học viên sẽ được hiển thị ở đây." />}</div>
          </Panel>
          <Panel title="Hồ sơ học viên cập nhật gần đây" href="/commander/military/students" actionLabel="Xem học viên">
            <div className="space-y-3">{dashboard?.recent.students.length ? dashboard.recent.students.map((student) => <Link key={student.id} href="/commander/military/students" className="block rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50"><Typography variant="body" weight="semibold">{student.fullName || "Chưa cập nhật"}</Typography><Typography variant="caption" color="gray" className="mt-1 block">{student.code || "Chưa có mã"} · {student.className || "Chưa xếp lớp"}</Typography></Link>) : <EmptyLine icon={HiOutlineAcademicCap} title="Chưa có học viên trong lớp" description="Học viên thuộc các lớp được giao sẽ hiển thị tại đây." />}</div>
          </Panel>
        </section>
      </PageContainer>
    );
  }

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
    tone: DashboardTone;
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

const PendingRequestItem = ({ request, href }: { request: DashboardGradeRequestAlert; href?: string }) => {
  const trainingSystemCode = useAuthStore((state) => state.user?.trainingSystemCode);
  return <Link
    href={href || (trainingSystemCode && trainingSystemCode !== "HE_5" ? "/commander/military/approvals" : "/commander/approvals")}
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
  </Link>;
};

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
