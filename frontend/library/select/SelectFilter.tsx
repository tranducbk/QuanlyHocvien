import { ReactNode, useMemo, useState } from "react";
import { SelectOption } from "@/library/select/SelectOption";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import { normalizeSearchText } from "@/utils/fn-common";
import { HiOutlineSearch } from "react-icons/hi";

export interface SelectFilterConfig {
  /** Bật ô lọc trong dropdown */
  enabled: boolean;
  /** client: lọc options hiện có, server: parent tự gọi API rồi truyền lại options */
  mode: "client" | "server";
  /** Callback khi keyword thay đổi, dùng cho server-side filter */
  onChange?: (value: string) => void;
  /** Placeholder của ô lọc */
  placeholder?: string;
}

/** Props cho component bộ lọc tìm kiếm trong Select */
interface SelectFilterProps {
  /** Cấu hình bộ lọc (placeholder, debounce, fetch...) */
  filter: SelectFilterConfig;
  /** Toàn bộ danh sách option trước khi lọc */
  options: SelectOption[];
  /** Hàm render danh sách option sau khi đã được lọc */
  renderOptions: (visibleOptions: SelectOption[]) => ReactNode;
}

export default function SelectFilter({
  filter,
  options,
  renderOptions,
}: SelectFilterProps) {
  const [filterValue, setFilterValue] = useState("");

  const visibleOptions = useMemo(() => {
    const keyword = normalizeSearchText(filterValue.trim());
    if (filter.mode !== "client" || !keyword) return options;

    return options
      .map((option) => ({
        option,
        rank: rankItem(normalizeSearchText(option.label), keyword),
      }))
      .filter(({ rank }) => rank.passed)
      .sort((a, b) => compareItems(a.rank, b.rank))
      .map(({ option }) => option);
  }, [filter.mode, filterValue, options]);

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    if (filter.mode === "server") filter.onChange?.(value.trim());
  };

  return (
    <div>
      <div onClick={(e) => e.stopPropagation()} className="p-1">
        <div className="relative">
          <HiOutlineSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
          />
          <input
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder={filter.placeholder ?? "Tìm kiếm..."}
            className="h-9 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-3 text-sm font-semibold text-neutral-700 dark:text-neutral-100 outline-none transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-primary-500"
          />
        </div>
      </div>
      {renderOptions(visibleOptions)}
    </div>
  );
}
