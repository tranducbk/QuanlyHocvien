"use client";

import { useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import Typography from "@/library/Typography";
import {
  getRangeState,
  isSelectableByMaxRange,
  parseValue,
  rangeClassName,
  type RangePanelProps,
  YEAR_PAGE_SIZE,
} from "./utils";

export default function YearRangePanel({
  startDate,
  endDate,
  maxRange,
  onSelect,
}: RangePanelProps) {
  const initialView = parseValue(startDate || endDate, "YYYY") ?? {
    year: new Date().getFullYear(),
    month: 0,
    day: 1,
  };
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor(initialView.year / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE
  );
  const years = Array.from(
    { length: YEAR_PAGE_SIZE },
    (_, index) => yearPageStart + index
  );

  return (
    <>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setYearPageStart(yearPageStart - YEAR_PAGE_SIZE)}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
        >
          <HiOutlineChevronLeft size={18} />
        </button>
        <Typography variant="body" weight="bold" color="neutral">
          {yearPageStart} - {yearPageStart + YEAR_PAGE_SIZE - 1}
        </Typography>
        <button
          type="button"
          onClick={() => setYearPageStart(yearPageStart + YEAR_PAGE_SIZE)}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
        >
          <HiOutlineChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => {
          const parts = { year, month: 0, day: 1 };
          const { selected, between } = getRangeState(
            parts,
            startDate,
            endDate,
            "YYYY"
          );
          const selectable = isSelectableByMaxRange(
            parts,
            startDate,
            endDate,
            "YYYY",
            maxRange
          );
          return (
            <button
              key={year}
              type="button"
              disabled={!selectable}
              onClick={() => onSelect(parts)}
              className={`
                py-3 rounded-xl text-sm font-bold transition-all
                bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800
                ${rangeClassName(selected, between)}
                ${selectable ? "cursor-pointer" : "opacity-35 cursor-not-allowed hover:bg-neutral-50! dark:hover:bg-neutral-900!"}
              `}
            >
              {year}
            </button>
          );
        })}
      </div>
    </>
  );
}
