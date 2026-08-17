"use client";

import Typography from "../Typography";
import TimeColumn from "./TimeColumn";
import { buildTime, hours, minutes, parseTime, seconds, TimeMode } from "./utils";

interface TimePanelProps {
  /** Giá trị thời gian hiện tại của panel */
  value: string;
  /** Callback khi giá trị thời gian thay đổi */
  onChange: (value: string) => void;
  /** Chế độ hiển thị thời gian */
  mode: TimeMode;
  /** Nhãn hiển thị phía trên panel */
  label: string;
  /** Có scroll tới giá trị đang chọn khi component được mở hay không */
  scrollToSelectedOnOpen: boolean;
}

export default function TimePanel({
  value,
  onChange,
  mode,
  label,
  scrollToSelectedOnOpen,
}: TimePanelProps) {
  const { h, m, s } = parseTime(value, mode);

  const handleHourSelect = (hour: string) => {
    onChange(buildTime(hour, m, s, mode));
  };

  const handleMinuteSelect = (minute: string) => {
    onChange(buildTime(h || "00", minute, s, mode));
  };

  const handleSecondSelect = (second: string) => {
    onChange(buildTime(h || "00", m || "00", second, mode));
  };

  return (
    <div className="flex-1">
      <Typography
        variant="caption"
        weight="bold"
        color="gray"
        className="mb-2 block text-center"
      >
        {label}
      </Typography>
      <div className="flex gap-0.5 rounded-xl border border-neutral-100 dark:border-neutral-700/80 overflow-hidden">
        <TimeColumn
          items={hours}
          selected={h}
          onSelect={handleHourSelect}
          scrollToSelectedOnOpen={scrollToSelectedOnOpen}
        />
        {mode !== "HH" && (
          <TimeColumn
            items={minutes}
            selected={m}
            onSelect={handleMinuteSelect}
            scrollToSelectedOnOpen={scrollToSelectedOnOpen}
          />
        )}
        {mode === "HH:mm:ss" && (
          <TimeColumn
            items={seconds}
            selected={s}
            onSelect={handleSecondSelect}
            scrollToSelectedOnOpen={scrollToSelectedOnOpen}
          />
        )}
      </div>
    </div>
  );
}
