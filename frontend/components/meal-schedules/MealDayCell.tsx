import type { MealSlots } from "@/types/cut-rice";
import styles from "./MealDayCell.module.css";

const meals = [
  { key: "morning", label: "Bữa sáng" },
  { key: "noon", label: "Bữa trưa" },
  { key: "evening", label: "Bữa tối" },
] as const;

export default function MealDayCell({ slots }: { slots: MealSlots }) {
  return (
    <div className={styles.meals}>
      {meals.map((meal) => {
        const isCut = Boolean(slots[meal.key]);
        return (
          <span
            key={meal.key}
            className={`${styles.meal} ${isCut ? styles.cut : styles.notCut}`}
            title={`${meal.label}: ${isCut ? "Cắt cơm" : "Không cắt"}`}
            aria-label={`${meal.label}: ${isCut ? "Cắt cơm" : "Không cắt"}`}
          >
            {isCut && <span aria-hidden="true">×</span>}
          </span>
        );
      })}
    </div>
  );
}
