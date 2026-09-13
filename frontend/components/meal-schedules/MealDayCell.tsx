import type { MealSlots } from "@/types/cut-rice";

const meals = [
  { key: "morning", label: "Bữa sáng" },
  { key: "noon", label: "Bữa trưa" },
  { key: "evening", label: "Bữa tối" },
] as const;

export default function MealDayCell({ slots }: { slots: MealSlots }) {
  return (
    <div className="grid grid-cols-3 w-[4.5rem] mx-auto overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-lg divide-x divide-neutral-200 dark:divide-neutral-800">
      {meals.map((meal) => {
        const isCut = Boolean(slots[meal.key]);
        return (
          <span
            key={meal.key}
            className={`grid min-w-0 h-7 place-items-center text-sm font-black transition-colors ${
              isCut
                ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
                : "bg-white dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700"
            }`}
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
