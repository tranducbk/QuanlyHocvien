import type {
  MealDayKey,
  MealSlotKey,
  MealSlots,
  WeeklyCutRice,
} from "@/types/cut-rice";

export const MEAL_DAYS: MealDayKey[] = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

export const MEAL_SLOTS: Array<{
  key: MealSlotKey;
  label: string;
  time: string;
}> = [
  { key: "morning", label: "Bữa sáng", time: "06:00" },
  { key: "noon", label: "Bữa trưa", time: "11:00" },
  { key: "evening", label: "Bữa tối", time: "17:30" },
];

export const getMealSlots = (
  weekly: WeeklyCutRice | null | undefined,
  day: MealDayKey
): MealSlots => weekly?.[day] || weekly?.[day.toLowerCase()] || {};

export const createEmptyMealWeek = (): WeeklyCutRice =>
  MEAL_DAYS.reduce<WeeklyCutRice>((week, day) => {
    week[day] = { morning: false, noon: false, evening: false };
    return week;
  }, {});

export const normalizeMealWeek = (
  weekly: WeeklyCutRice | null | undefined
): WeeklyCutRice =>
  MEAL_DAYS.reduce<WeeklyCutRice>((week, day) => {
    const slots = getMealSlots(weekly, day);
    week[day] = {
      morning: Boolean(slots.morning),
      noon: Boolean(slots.noon),
      evening: Boolean(slots.evening),
    };
    return week;
  }, {});

export const countCutMeals = (weekly: WeeklyCutRice | null | undefined) =>
  MEAL_DAYS.reduce(
    (total, day) =>
      total +
      MEAL_SLOTS.reduce(
        (dayTotal, meal) =>
          dayTotal + Number(Boolean(getMealSlots(weekly, day)[meal.key])),
        0
      ),
    0
  );

export const countCutMealsBySlot = (
  weekly: WeeklyCutRice | null | undefined
) =>
  MEAL_SLOTS.reduce<Record<MealSlotKey, number>>(
    (totals, meal) => {
      totals[meal.key] = MEAL_DAYS.reduce(
        (total, day) =>
          total + Number(Boolean(getMealSlots(weekly, day)[meal.key])),
        0
      );
      return totals;
    },
    { morning: 0, noon: 0, evening: 0 }
  );
