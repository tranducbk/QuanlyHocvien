import { HiOutlineCheck } from "react-icons/hi";
import Skeleton from "@/library/Skeleton";

export interface SelectOption {
  value: string | number;
  label: string;
}

/** Props cho component danh sách lựa chọn */
interface SelectOptionsProps {
  /** Danh sách các option hiển thị (sau khi đã lọc/phân trang) */
  visibleOptions: SelectOption[];
  /** Giá trị đang được chọn */
  value?: string | number | null;
  /** Số option tối đa hiển thị trước khi cuộn */
  maxVisibleItems: number;
  /** Văn bản hiển thị khi danh sách rỗng */
  emptyText?: string;
  /** Đang tải thêm trang tiếp theo (infinite scroll) */
  isFetchingNextPage?: boolean;
  /** Callback gán ref cho sentinel element dùng để trigger load thêm */
  setSentinelRef: (el: HTMLDivElement | null) => void;
  /** Callback khi người dùng chọn một option */
  onChange?: (value: string | number) => void;
  /** Cho phép fullwidth */
  fullWidth?: boolean;
}

export default function SelectOptions({
  visibleOptions,
  value,
  maxVisibleItems,
  emptyText,
  isFetchingNextPage,
  setSentinelRef,
  onChange,
  fullWidth = true,
}: SelectOptionsProps) {
  return (
    <div
      style={{
        maxHeight: `${maxVisibleItems * 40 + (maxVisibleItems - 1) * 4}px`,
      }}
      className="overflow-auto custom-scrollbar"
    >
      <div
        className={`flex flex-col gap-1.5 min-w-0 text-neutral-900 dark:text-neutral-100 ${fullWidth ? "w-full" : ""}`}
      >
        {visibleOptions.length > 0 ? (
          visibleOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                onClick={() => onChange?.(opt.value)}
                className={`relative flex h-10 items-center justify-between gap-2 rounded-xl px-3 text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <HiOutlineCheck
                    size={16}
                    className="text-primary-600 dark:text-primary-400 shrink-0 ml-2"
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-3 text-center text-neutral-400 dark:text-neutral-500 text-sm">
            {emptyText || "Không tìm thấy dữ liệu"}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={setSentinelRef} className="h-0" />

        {isFetchingNextPage && (
          <div className="flex flex-col gap-1 p-1">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center px-3 py-2">
                <Skeleton width={120} height={16} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
