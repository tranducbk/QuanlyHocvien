"use client";

import { useMemo, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import Typography from "@/library/Typography";
import {
  daysInMonth,
  firstDayOfMonth,
  getRangeState,
  isSelectableByMaxRange,
  MONTHS,
  parseValue,
  rangeClassName,
  type DateParts,
  type RangePanelProps,
  WEEKDAYS,
} from "./utils";

export default function DayRangePanel({
  startDate,
  endDate,
  maxRange,
  onSelect,
}: RangePanelProps) {
  const initialView = parseValue(startDate || endDate, "DD/MM/YYYY") ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: 1,
  };
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(viewYear, viewMonth);
    const startOffset = firstDayOfMonth(viewYear, viewMonth);
    const prevMonthTotalDays = daysInMonth(viewYear, viewMonth - 1);
    const result: (DateParts & { currentMonth: boolean })[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      result.push({
        year: viewYear,
        month: viewMonth - 1,
        day: prevMonthTotalDays - i,
        currentMonth: false,
      });
    }
    for (let day = 1; day <= totalDays; day++) {
      result.push({ year: viewYear, month: viewMonth, day, currentMonth: true });
    }
    while (result.length < 42) {
      result.push({
        year: viewYear,
        month: viewMonth + 1,
        day: result.length - startOffset - totalDays + 1,
        currentMonth: false,
      });
    }
    return result;
  }, [viewMonth, viewYear]);

  const navigateMonth = (offset: number) => {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
        >
          <HiOutlineChevronLeft size={18} />
        </button>
        <Typography variant="body" weight="bold" color="neutral">
          {MONTHS[viewMonth]}, {viewYear}
        </Typography>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
        >
          <HiOutlineChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center py-2">
            <Typography variant="caption" weight="bold" color="gray">
              {day}
            </Typography>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const { selected, between } = getRangeState(
            day,
            startDate,
            endDate,
            "DD/MM/YYYY"
          );
          const selectable = isSelectableByMaxRange(
            day,
            startDate,
            endDate,
            "DD/MM/YYYY",
            maxRange
          );
          return (
            <button
              key={`${day.year}-${day.month}-${day.day}-${index}`}
              type="button"
              disabled={!selectable}
              onClick={() => onSelect(day)}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all
                ${day.currentMonth ? "text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-300" : "text-neutral-300 dark:text-neutral-700"}
                ${rangeClassName(selected, between)}
                ${selectable ? "cursor-pointer" : "opacity-35 cursor-not-allowed hover:bg-transparent! hover:text-neutral-400!"}
              `}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </>
  );
}
