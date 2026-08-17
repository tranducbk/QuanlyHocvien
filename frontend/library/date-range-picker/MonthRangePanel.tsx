"use client";

import { useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import Typography from "@/library/Typography";
import {
  getRangeState,
  isSelectableByMaxRange,
  MONTH_LABELS,
  parseValue,
  rangeClassName,
  type RangePanelProps,
} from "./utils";

export default function MonthRangePanel({
  startDate,
  endDate,
  maxRange,
  onSelect,
}: RangePanelProps) {
  const initialView = parseValue(startDate || endDate, "MM/YYYY") ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: 1,
  };
  const [viewYear, setViewYear] = useState(initialView.year);

  return (
    <>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setViewYear(viewYear - 1)}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
        >
          <HiOutlineChevronLeft size={18} />
        </button>
        <Typography variant="body" weight="bold" color="neutral">
          {viewYear}
        </Typography>
        <button
          type="button"
          onClick={() => setViewYear(viewYear + 1)}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
        >
          <HiOutlineChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MONTH_LABELS.map((month, index) => {
          const parts = { year: viewYear, month: index, day: 1 };
          const { selected, between } = getRangeState(
            parts,
            startDate,
            endDate,
            "MM/YYYY"
          );
          const selectable = isSelectableByMaxRange(
            parts,
            startDate,
            endDate,
            "MM/YYYY",
            maxRange
          );
          return (
            <button
              key={month}
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
              {month}
            </button>
          );
        })}
      </div>
    </>
  );
}
