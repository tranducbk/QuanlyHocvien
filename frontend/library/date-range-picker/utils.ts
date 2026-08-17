export type DateRangeMode = "DD/MM/YYYY" | "MM/YYYY" | "YYYY";

export interface DateRangeValue {
  startDate?: string;
  endDate?: string;
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

export interface RangePanelProps {
  startDate?: string;
  endDate?: string;
  maxRange?: number;
  onSelect: (parts: DateParts) => void;
}

export const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const MONTH_LABELS = [
  "T.1",
  "T.2",
  "T.3",
  "T.4",
  "T.5",
  "T.6",
  "T.7",
  "T.8",
  "T.9",
  "T.10",
  "T.11",
  "T.12",
];

export const YEAR_PAGE_SIZE = 12;

export const placeholders: Record<DateRangeMode, string> = {
  "DD/MM/YYYY": "DD/MM/YYYY",
  "MM/YYYY": "MM/YYYY",
  YYYY: "YYYY",
};

export const popoverWidthStyles: Record<DateRangeMode, string> = {
  "DD/MM/YYYY": "w-80",
  "MM/YYYY": "w-80",
  YYYY: "w-80",
};

const pad2 = (value: number) => value.toString().padStart(2, "0");

export const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const firstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

export function parseValue(
  value: string | undefined | null,
  mode: DateRangeMode
) {
  if (!value) return null;
  const parts = value.split("T")[0].split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1] ?? 1) - 1;
  const day = Number(parts[2] ?? 1);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  if (mode === "YYYY") return { year, month: 0, day: 1 };
  if (mode === "MM/YYYY") return { year, month, day: 1 };
  return { year, month, day };
}

export function formatValue(parts: DateParts, mode: DateRangeMode) {
  if (mode === "YYYY") return `${parts.year}`;
  if (mode === "MM/YYYY") return `${parts.year}-${pad2(parts.month + 1)}`;
  return `${parts.year}-${pad2(parts.month + 1)}-${pad2(parts.day)}`;
}

export function formatDisplay(value: string | undefined, mode: DateRangeMode) {
  const parts = parseValue(value, mode);
  if (!parts) return "";
  if (mode === "YYYY") return `${parts.year}`;
  if (mode === "MM/YYYY") return `${pad2(parts.month + 1)}/${parts.year}`;
  return `${pad2(parts.day)}/${pad2(parts.month + 1)}/${parts.year}`;
}

export function getComparable(parts: DateParts | null, mode: DateRangeMode) {
  if (!parts) return null;
  if (mode === "YYYY") return parts.year;
  if (mode === "MM/YYYY") return parts.year * 12 + parts.month;
  return new Date(parts.year, parts.month, parts.day).getTime();
}

export function getRangeDistance(
  start: DateParts | null,
  end: DateParts | null,
  mode: DateRangeMode
) {
  if (!start || !end) return null;
  if (mode === "YYYY") return Math.abs(end.year - start.year);
  if (mode === "MM/YYYY") {
    return Math.abs(
      end.year * 12 + end.month - (start.year * 12 + start.month)
    );
  }
  const startDate = new Date(start.year, start.month, start.day).getTime();
  const endDate = new Date(end.year, end.month, end.day).getTime();
  return Math.abs(Math.round((endDate - startDate) / 86400000));
}

export function isSelectableByMaxRange(
  candidate: DateParts,
  startDate: string | undefined,
  endDate: string | undefined,
  mode: DateRangeMode,
  maxRange: number | undefined
) {
  if (maxRange === undefined || !startDate || endDate) return true;
  const start = parseValue(startDate, mode);
  const distance = getRangeDistance(start, candidate, mode);
  return distance === null || distance <= maxRange;
}

export function normalizeRange(
  startDate: string,
  endDate: string,
  mode: DateRangeMode
) {
  const start = parseValue(startDate, mode);
  const end = parseValue(endDate, mode);
  const startKey = getComparable(start, mode);
  const endKey = getComparable(end, mode);
  if (
    !start ||
    !end ||
    startKey === null ||
    endKey === null ||
    startKey <= endKey
  ) {
    return { startDate, endDate };
  }
  return { startDate: endDate, endDate: startDate };
}

export function getRangeState(
  parts: DateParts,
  startDate: string | undefined,
  endDate: string | undefined,
  mode: DateRangeMode
) {
  const current = getComparable(parts, mode);
  const start = getComparable(parseValue(startDate, mode), mode);
  const end = getComparable(parseValue(endDate, mode), mode);
  const selected = current !== null && (current === start || current === end);
  const between =
    current !== null &&
    start !== null &&
    end !== null &&
    current > Math.min(start, end) &&
    current < Math.max(start, end);
  const inRange = selected || between;
  return { selected, between, inRange };
}

export const rangeClassName = (selected: boolean, between: boolean) => {
  if (selected) {
    return "bg-primary-500! text-white! shadow-md shadow-primary-200 dark:shadow-primary-950/40 scale-105";
  }
  if (between) {
    return "bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-200";
  }
  return "";
};
