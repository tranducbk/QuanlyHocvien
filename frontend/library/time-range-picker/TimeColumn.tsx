"use client";

import { useLayoutEffect, useRef } from "react";

interface TimeColumnProps {
  /** Danh sách giá trị thời gian hiển thị trong cột */
  items: string[];
  /** Giá trị đang được chọn */
  selected: string;
  /** Callback khi chọn một giá trị */
  onSelect: (value: string) => void;
  /** Có scroll tới giá trị đang chọn khi component được mở hay không */
  scrollToSelectedOnOpen: boolean;
}

export default function TimeColumn({
  items,
  selected,
  onSelect,
  scrollToSelectedOnOpen,
}: TimeColumnProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!scrollToSelectedOnOpen) return;

    selectedRef.current?.scrollIntoView({
      block: "center",
      behavior: "instant",
    });
  }, [scrollToSelectedOnOpen]);

  return (
    <div className="flex-1 h-48 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-0.5 p-1">
        {items.map((item) => (
          <button
            key={item}
            ref={item === selected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(item)}
            className={`
              px-2 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer
              ${
                item === selected
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-300"
              }
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
