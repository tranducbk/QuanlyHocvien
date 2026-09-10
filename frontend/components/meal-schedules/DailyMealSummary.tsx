import Typography from "@/library/Typography";
import type { CutRiceDailySummary, MealDayKey } from "@/types/cut-rice";
import { MEAL_DAYS } from "@/utils/meal-schedule";
import { HiOutlineChartBar } from "react-icons/hi";
import styles from "./DailyMealSummary.module.css";

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
  const currentDay = getCurrentDayInWeek(weekStartDate);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.headingIcon}>
          <HiOutlineChartBar aria-hidden="true" />
        </span>
        <div>
          <Typography variant="body" weight="bold">
            Tổng hợp cắt cơm theo ngày
          </Typography>
          <Typography variant="caption" color="gray">
            Tổng hợp từ {summary?.totalSchedules || 0} lịch theo bộ lọc hiện tại
          </Typography>
        </div>
      </div>

      <div className={styles.scroller}>
        <div className={styles.days}>
          {MEAL_DAYS.map((day) => {
            const totals = summary?.daily?.[day] || emptyDailySummary;
            const dailyTotal = totals.morning + totals.noon + totals.evening;

            return (
              <article
                key={day}
                className={`${styles.dayCard} ${
                  currentDay === day ? styles.currentDay : ""
                }`}
              >
                <div className={styles.dayHeading}>
                  <strong>{day}</strong>
                  <span>{dailyTotal}</span>
                </div>
                <dl className={styles.meals}>
                  <div>
                    <dt>Sáng</dt>
                    <dd className={styles.morning}>{totals.morning}</dd>
                  </div>
                  <div>
                    <dt>Trưa</dt>
                    <dd className={styles.noon}>{totals.noon}</dd>
                  </div>
                  <div>
                    <dt>Tối</dt>
                    <dd className={styles.evening}>{totals.evening}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
