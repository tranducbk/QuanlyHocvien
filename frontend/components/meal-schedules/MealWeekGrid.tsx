import Typography from "@/library/Typography";
import type { MealDayKey, MealSlotKey, WeeklyCutRice } from "@/types/cut-rice";
import { getMealSlots, MEAL_DAYS, MEAL_SLOTS } from "@/utils/meal-schedule";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";

interface MealWeekGridProps {
  weekly: WeeklyCutRice | null | undefined;
  editable?: boolean;
  disabled?: boolean;
  onToggle?: (day: MealDayKey, meal: MealSlotKey, checked: boolean) => void;
}

const mealHeaderStyles = {
  morning: "bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
  noon: "bg-sky-50/60 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300",
  evening: "bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300",
};

export default function MealWeekGrid({
  weekly,
  editable = false,
  disabled = false,
  onToggle,
}: MealWeekGridProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-sm transition-colors">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="sticky left-0 z-10 w-32 min-w-[8rem] bg-neutral-50/80 dark:bg-neutral-900/80 px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Ngày
              </th>
              {MEAL_SLOTS.map((meal) => (
                <th
                  key={meal.key}
                  className={`min-w-[10rem] px-4 py-3 text-center transition-colors ${mealHeaderStyles[meal.key]}`}
                >
                  <span className="block text-sm font-black">
                    {meal.label}
                  </span>
                  <span className="block text-[11px] font-semibold opacity-70">
                    {meal.time}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {MEAL_DAYS.map((day) => {
              const slots = getMealSlots(weekly, day);
              const dailyTotal = MEAL_SLOTS.filter((meal) =>
                Boolean(slots[meal.key])
              ).length;

              return (
                <tr
                  key={day}
                  className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 w-32 min-w-[8rem] bg-white dark:bg-neutral-950 px-4 py-3 shadow-xs dark:shadow-none font-normal"
                  >
                    <Typography variant="body" weight="bold" color="neutral">
                      {day}
                    </Typography>
                    <span className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                      {dailyTotal}/3 bữa
                    </span>
                  </th>
                  {MEAL_SLOTS.map((meal) => {
                    const isCut = Boolean(slots[meal.key]);
                    const StatusIcon = isCut
                      ? HiOutlineXCircle
                      : HiOutlineCheckCircle;
                    const content = (
                      <>
                        <StatusIcon
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{isCut ? "Cắt cơm" : "Không cắt"}</span>
                      </>
                    );

                    const statusClass = isCut
                      ? "bg-amber-50/80 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                      : "bg-emerald-50/80 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";

                    return (
                      <td key={meal.key} className="p-2.5">
                        {editable ? (
                          <button
                            type="button"
                            className={`flex w-full min-h-[2.625rem] items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xs ${statusClass}`}
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
                          <div
                            className={`flex w-full min-h-[2.625rem] items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${statusClass}`}
                          >
                            {content}
                          </div>
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

      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-neutral-50/60 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400"
        aria-label="Chú thích trạng thái"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
            <span className="size-2.5 rounded-full bg-amber-500" /> Cắt cơm
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Không cắt
          </span>
        </div>
        {editable && (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">
            * Nhấn vào từng ô để thay đổi trạng thái cắt cơm
          </span>
        )}
      </div>
    </div>
  );
}
