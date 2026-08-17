import {
  ScheduleItem,
  TimeTableSemester,
} from "@/types/time-tables";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const SEMESTER_WEEK_COUNT = 20;

const atStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const addDays = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

export const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth();

export const toDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const firstMondayOnOrAfter = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const daysUntilMonday = (8 - date.getDay()) % 7;
  return addDays(date, daysUntilMonday);
};

const parseSchoolYear = (schoolYear?: string) => {
  const years = schoolYear?.match(/\d{4}/g)?.map(Number) || [];
  if (!years.length) return null;

  return {
    startYear: years[0],
    endYear: years[1] || years[0] + 1,
  };
};

export const getSemesterStart = (
  semester?: TimeTableSemester | null
): Date | null => {
  const years = parseSchoolYear(semester?.schoolYearInfo?.schoolYear);
  if (!years || !semester) return null;

  if (Number(semester.code) === 2) {
    return firstMondayOnOrAfter(years.endYear, 0);
  }

  if (Number(semester.code) === 3) {
    return firstMondayOnOrAfter(years.endYear, 5);
  }

  return firstMondayOnOrAfter(years.startYear, 8);
};

export const getSemesterEnd = (semester?: TimeTableSemester | null) => {
  const start = getSemesterStart(semester);
  return start ? addDays(start, SEMESTER_WEEK_COUNT * 7 - 1) : null;
};

export const getCalendarDays = (month: Date) => {
  const firstDay = startOfMonth(month);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -mondayBasedOffset);

  return Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index)
  );
};

export const getScheduleWeeks = (week: ScheduleItem["week"] | string) => {
  if (Array.isArray(week)) {
    return week.filter(
      (value): value is number =>
        Number.isInteger(value) && value > 0
    );
  }

  if (typeof week === "number") {
    return Number.isInteger(week) && week > 0 ? [week] : [];
  }

  if (typeof week === "string") {
    return (week.match(/\d+/g) || [])
      .map(Number)
      .filter((value) => value > 0);
  }

  return [];
};

const getScheduleDay = (day: string) => {
  const weekdayNumber = day.match(/[2-7]/)?.[0];
  if (weekdayNumber) return Number(weekdayNumber) - 1;
  return 0;
};

export const getSemesterWeek = (date: Date, semesterStart: Date) => {
  const dateUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const startUtc = Date.UTC(
    semesterStart.getFullYear(),
    semesterStart.getMonth(),
    semesterStart.getDate()
  );

  return Math.floor((dateUtc - startUtc) / DAY_IN_MS / 7) + 1;
};

export const getSchedulesForDate = (
  schedules: ScheduleItem[],
  date: Date,
  semesterStart: Date
) => {
  const week = getSemesterWeek(date, semesterStart);
  if (week < 1 || week > SEMESTER_WEEK_COUNT) return [];

  return schedules
    .filter((schedule) => {
      if (getScheduleDay(schedule.day) !== date.getDay()) return false;
      const scheduleWeeks = getScheduleWeeks(schedule.week);
      return scheduleWeeks.length === 0 || scheduleWeeks.includes(week);
    })
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
};

export const isDateInSemester = (
  date: Date,
  semesterStart: Date,
  semesterEnd: Date
) => {
  const value = atStartOfDay(date).getTime();
  return (
    value >= atStartOfDay(semesterStart).getTime() &&
    value <= atStartOfDay(semesterEnd).getTime()
  );
};

export const getInitialCalendarDate = (
  semesterStart: Date,
  semesterEnd: Date
) => {
  const today = atStartOfDay(new Date());
  if (today < semesterStart) return semesterStart;
  if (today > semesterEnd) return semesterEnd;
  return today;
};
