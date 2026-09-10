import Typography from "@/library/Typography";
import type { MealDayKey, MealSlotKey, WeeklyCutRice } from "@/types/cut-rice";
import { getMealSlots, MEAL_DAYS, MEAL_SLOTS } from "@/utils/meal-schedule";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineXCircle,
} from "react-icons/hi";
import styles from "./MealWeekGrid.module.css";

interface MealWeekGridProps {
  weekly: WeeklyCutRice | null | undefined;
  editable?: boolean;
  disabled?: boolean;
  onToggle?: (day: MealDayKey, meal: MealSlotKey, checked: boolean) => void;
}

const mealIcons = {
  morning: HiOutlineSun,
  noon: HiOutlineClock,
  evening: HiOutlineMoon,
};

export default function MealWeekGrid({
  weekly,
  editable = false,
  disabled = false,
  onToggle,
}: MealWeekGridProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.dayHeading}>Ngày</th>
              {MEAL_SLOTS.map((meal) => {
                const MealIcon = mealIcons[meal.key];
                return (
                  <th
                    key={meal.key}
                    className={`${styles.mealHeading} ${styles[meal.key]}`}
                  >
                    <span className={styles.mealTitle}>
                      <MealIcon aria-hidden="true" />
                      {meal.label}
                    </span>
                    <span className={styles.mealTime}>{meal.time}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {MEAL_DAYS.map((day) => {
              const slots = getMealSlots(weekly, day);
              const dailyTotal = MEAL_SLOTS.filter((meal) =>
                Boolean(slots[meal.key])
              ).length;

              return (
                <tr key={day}>
                  <th scope="row" className={styles.dayCell}>
                    <Typography variant="body" weight="bold">
                      {day}
                    </Typography>
                    <span className={styles.dayTotal}>{dailyTotal}/3 bữa</span>
                  </th>
                  {MEAL_SLOTS.map((meal) => {
                    const isCut = Boolean(slots[meal.key]);
                    const StatusIcon = isCut
                      ? HiOutlineXCircle
                      : HiOutlineCheckCircle;
                    const content = (
                      <>
                        <StatusIcon aria-hidden="true" />
                        <span>{isCut ? "Cắt cơm" : "Không cắt"}</span>
                      </>
                    );
                    const cellClassName = `${styles.status} ${
                      isCut ? styles.cut : styles.available
                    }`;

                    return (
                      <td key={meal.key} className={styles.mealCell}>
                        {editable ? (
                          <button
                            type="button"
                            className={`${cellClassName} ${styles.editable}`}
                            aria-pressed={isCut}
                            aria-label={`${day}, ${meal.label}: ${
                              isCut ? "cắt cơm" : "không cắt"
                            }`}
                            disabled={disabled}
                            onClick={() =>
                              onToggle?.(day, meal.key, !isCut)
                            }
                          >
                            {content}
                          </button>
                        ) : (
                          <div className={cellClassName}>{content}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.legend} aria-label="Chú thích trạng thái">
        <span>
          <i className={styles.cutDot} /> Cắt cơm
        </span>
        <span>
          <i className={styles.availableDot} /> Không cắt
        </span>
        {editable && <small>Nhấn vào từng ô để thay đổi</small>}
      </div>
    </div>
  );
}
