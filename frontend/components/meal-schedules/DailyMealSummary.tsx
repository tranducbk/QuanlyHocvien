import { useMemo } from "react";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import type { CutRiceDailySummary, MealDayKey } from "@/types/cut-rice";
import { MEAL_DAYS } from "@/utils/meal-schedule";
import { HiOutlineChartBar } from "react-icons/hi";

interface DailyMealSummaryProps {
  summary: CutRiceDailySummary | undefined;
  weekStartDate?: string;
}

const emptyDailySummary = {
  morning: 0,
  noon: 0,
  evening: 0,
};

const getCurrentDayInWeek = (weekStartDate?: string): MealDayKey | null => {
  if (!weekStartDate) return null;

  const [year, month, day] = weekStartDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const weekStart = new Date(year, month - 1, day);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);

  if (today < weekStart || today > weekEnd) return null;
  const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  return MEAL_DAYS[dayIndex];
};

export default function DailyMealSummary({
  summary,
  weekStartDate,
}: DailyMealSummaryProps) {
  const currentDay = useMemo(
    () => getCurrentDayInWeek(weekStartDate),
    [weekStartDate]
  );

  const daysData = useMemo(() => {
    return MEAL_DAYS.map((day) => {
      const totals = summary?.daily?.[day] || emptyDailySummary;
      const isToday = currentDay === day;

      return {
        day,
        totals,
        isToday,
      };
    });
  }, [summary?.daily, currentDay]);

  const totalSchedulesFormatted = (summary?.totalSchedules ?? 0).toLocaleString(
    "vi-VN"
  );

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-4 md:p-5 shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <HiOutlineChartBar className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Typography variant="body" weight="bold" color="neutral">
              Tổng hợp cắt cơm theo ngày
            </Typography>
            <Badge variant="primary">
              {totalSchedulesFormatted} học viên
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50/80 dark:bg-neutral-900/60 px-3 py-1.5 rounded-xl border border-neutral-100 dark:border-neutral-800 self-start sm:self-auto">
          <span className="font-semibold text-neutral-600 dark:text-neutral-300">
            Quy ước:
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
            <span className="size-4 rounded bg-primary-100/70 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 flex items-center justify-center text-[11px] leading-none">
              ×
            </span>
            Cắt cơm
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <span className="size-4 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center" />
            Không cắt
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {daysData.map(({ day, totals, isToday }) => (
          <div
            key={day}
            className={`rounded-xl p-3 border transition-all ${
              isToday
                ? "border-primary-200 dark:border-primary-700/60 bg-primary-50/30 dark:bg-primary-950/20 ring-1 ring-primary-500/20 shadow-xs"
                : "border-neutral-100/80 dark:border-neutral-800/70 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/70"
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-neutral-200/50 dark:border-neutral-800">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isToday
                    ? "text-primary-700 dark:text-primary-300"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {day}
              </span>
              {isToday && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 uppercase">
                  Hôm nay
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                  Sáng
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                  {totals.morning.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-500 shrink-0" />
                  Trưa
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400 text-xs">
                  {totals.noon.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                  Tối
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                  {totals.evening.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
