"use client";

import { useMemo } from "react";
import type { IconType } from "react-icons";
import {
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineSparkles,
} from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { achievementService } from "@/services/achievements";
import { Achievement } from "@/types/achievements";
import { textOrDash } from "@/utils/fn-common";
import AchievementsSkeleton from "./AchievementsSkeleton";

type SummaryTone = "primary" | "secondary" | "success" | "warning" | "sky" | "neutral";

const toneStyles: Record<SummaryTone, string> = {
  primary: "border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-700/60 dark:bg-primary-950/40 dark:text-primary-100",
  secondary: "border-secondary-100 bg-secondary-50 text-secondary-700 dark:border-secondary-700/60 dark:bg-secondary-950/40 dark:text-secondary-100",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100",
  sky: "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-100",
  neutral: "border-neutral-100 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
};

const formatNumber = (value?: number | null) => (value ?? 0).toLocaleString("vi-VN");

export default function Main() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ACHIEVEMENTS],
    queryFn: achievementService.getMyAchievements,
  });

  const achievements = useMemo(() => data?.data?.achievements || [], [data?.data?.achievements]);

  const summary = useMemo(() => {
    const allYears = new Set<number>();

    achievements.forEach((achievement) => {
      if (achievement.year) allYears.add(achievement.year);
    });

    const totalAdvancedSoldier = achievements.filter(a => a.award?.toLowerCase().includes('tiên tiến')).length;
    const totalCompetitiveSoldier = achievements.filter(a => a.award?.toLowerCase().includes('thi đua')).length;

    return {
      totalYears: allYears.size,
      totalAchievements: achievements.length,
      totalAdvancedSoldier,
      totalCompetitiveSoldier,
    };
  }, [achievements]);

  const summaryCards = [
    {
      label: "Năm ghi nhận",
      value: formatNumber(summary.totalYears),
      helper: "Năm có thành tích",
      icon: HiOutlineCalendar,
      tone: "primary",
    },
    {
      label: "Khen thưởng",
      value: formatNumber(summary.totalAchievements),
      helper: "Thành tích đã lưu",
      icon: HiOutlineBadgeCheck,
      tone: "success",
    },
    {
      label: "Chiến sĩ tiên tiến",
      value: formatNumber(summary.totalAdvancedSoldier),
      helper: "Số lần được ghi nhận",
      icon: HiOutlineFlag,
      tone: "secondary",
    },
    {
      label: "Chiến sĩ thi đua",
      value: formatNumber(summary.totalCompetitiveSoldier),
      helper: "Số lần được ghi nhận",
      icon: HiOutlineSparkles,
      tone: "warning",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    helper: string;
    icon: IconType;
    tone: SummaryTone;
  }>;

  return (
    <PageContainer
      breadcrumb={[
        { label: "Trang chủ", href: "/student" },
        { label: "Thành tích" },
      ]}
      title="Thành tích"
      subtitle="Theo dõi khen thưởng, thành tích theo năm học cá nhân."
      isLoading={isLoading}
      skeleton={<AchievementsSkeleton />}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
      className="space-y-8"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </div>

        <section className="space-y-4">
          <SectionHeader
            title="Khen thưởng"
            description="Các thành tích học tập, rèn luyện và giải thưởng đã được ghi nhận."
            count={achievements.length}
          />

          {achievements.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HiOutlineBadgeCheck}
              title="Chưa có khen thưởng"
              description="Các thành tích được phê duyệt sẽ hiển thị tại đây."
            />
          )}
        </section>
      </div>
    </PageContainer>
  );
}

const SummaryCard = ({
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
  tone: SummaryTone;
}) => (
  <div className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]}`}>
    <div className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-current shadow-sm dark:bg-white/10 dark:shadow-none">
      <Icon size={20} />
    </div>
    <p className="mt-4 text-xs font-black uppercase opacity-75">{label}</p>
    <p className="mt-2 text-3xl font-black leading-none">{value}</p>
    <p className="mt-2 text-xs font-semibold opacity-70">{helper}</p>
  </div>
);

const SectionHeader = ({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <Typography variant="h3" weight="black" transform="uppercase">
        {title}
      </Typography>
      <Typography variant="body" className="mt-1 text-neutral-500 dark:text-neutral-400">
        {description}
      </Typography>
    </div>
    <Badge variant="primary" className="w-fit">
      {count.toLocaleString("vi-VN")} mục
    </Badge>
  </div>
);

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const description = achievement.description || achievement.content;

  return (
    <article className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-colors hover:border-primary-100 hover:bg-primary-50/30 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none dark:hover:border-primary-700/60 dark:hover:bg-primary-950/20">
      <div className="flex gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200">
          <HiOutlineBadgeCheck size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <Typography variant="body" weight="black" className="text-neutral-900 dark:text-neutral-100">
            {textOrDash(achievement.title)}
          </Typography>

          <div className="mt-3 flex flex-wrap gap-2">
            {achievement.award && <Badge variant="success">{achievement.award}</Badge>}
            {achievement.year && <Badge variant="primary">{achievement.year}</Badge>}
            {achievement.schoolYear && (
              <Badge variant="secondary">{achievement.schoolYear}</Badge>
            )}
            {achievement.semester && (
              <Badge variant="neutral">Học kỳ {achievement.semester}</Badge>
            )}
          </div>
        </div>
      </div>

      <Typography variant="body" className="mt-4 text-neutral-600 dark:text-neutral-300">
        {description || "Chưa có mô tả chi tiết."}
      </Typography>
    </article>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string;
}) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
    <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm dark:bg-neutral-950 dark:text-neutral-500 dark:shadow-none">
      <Icon size={28} />
    </div>
    <Typography variant="body" weight="black" className="mt-4 text-neutral-800 dark:text-neutral-100">
      {title}
    </Typography>
    <Typography variant="body" className="mt-1 max-w-md text-neutral-500 dark:text-neutral-400">
      {description}
    </Typography>
  </div>
);
