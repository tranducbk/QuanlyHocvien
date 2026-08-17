"use client";

import { m, AnimatePresence } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineHashtag,
} from "react-icons/hi";
import Input from "@/library/Input";
import Select, {
  type SelectFilterConfig,
  type SelectOption,
} from "@/library/Select";
import DateRangePicker from "@/library/DateRangePicker";
import DatePicker from "@/library/DatePicker";
import {
  type DateRangeMode,
  type DateRangeValue,
} from "@/library/date-range-picker/utils";
import Button from "@/library/Button";

interface BaseFilterField {
  id: string;
  label: string;
}

interface TextFilterField extends BaseFilterField {
  type: "text";
  placeholder?: string;
}

interface NumberFilterField extends BaseFilterField {
  type: "number";
  placeholder?: string;
}

interface DateFilterField extends BaseFilterField {
  type: "date";
  placeholder?: string;
}

interface SelectFilterField extends BaseFilterField {
  type: "select";
  options?: SelectOption[];
  placeholder?: string;
  selectFilter?: SelectFilterConfig;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

interface DateRangeFilterField extends BaseFilterField {
  type: "date-range";
  mode: DateRangeMode;
  maxRange?: number;
  placeholder?: string;
}

export type FilterField =
  | TextFilterField
  | NumberFilterField
  | DateFilterField
  | SelectFilterField
  | DateRangeFilterField;

interface TableFilterProps<TData> {
  /** Thao tác với bảng */
  table: Table<TData>;
  /** Cấu hình các trường lọc */
  fields: FilterField[];
  /** Mở/Đóng bộ lọc */
  isOpen?: boolean;
}

const isDateRangeValue = (v: unknown): v is DateRangeValue =>
  v !== null &&
  typeof v === "object" &&
  ("startDate" in v || "endDate" in v);

const TableFilter = <TData,>({
  table,
  fields,
  isOpen = false,
}: TableFilterProps<TData>) => {
  const { control, handleSubmit, reset, register } =
    useForm<Record<string, string | number | DateRangeValue>>();

  const onSubmit = (data: Record<string, string | number | DateRangeValue>) => {
    const newFilters: ColumnFiltersState = [];
    for (const [id, value] of Object.entries(data)) {
      if (value === "" || value === undefined || value === null) continue;
      if (isDateRangeValue(value)) {
        const { startDate, endDate } = value;
        if (startDate && endDate) {
          newFilters.push({ id, value: `${startDate}-${endDate}` });
        }
      } else {
        newFilters.push({ id, value });
      }
    }
    table.setColumnFilters(newFilters);
  };

  const handleReset = () => {
    reset();
    table.resetColumnFilters();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => {
                const Icon =
                  field.type === "date"
                    ? HiOutlineCalendar
                    : field.type === "number"
                      ? HiOutlineHashtag
                      : HiOutlineSearch;
                return (
                  <div key={field.id}>
                    {field.type === "select" ? (
                      <Controller
                        name={field.id}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Select
                            label={field.label}
                            value={value as string}
                            onChange={onChange}
                            options={field.options}
                            placeholder={field.placeholder}
                            prefixIcon={<HiOutlineTag size={16} />}
                            hasNextPage={field.hasNextPage}
                            isFetchingNextPage={field.isFetchingNextPage}
                            onLoadMore={field.onLoadMore}
                            isLoading={field.isLoading}
                            filter={field.selectFilter}
                          />
                        )}
                      />
                    ) : field.type === "date-range" ? (
                      <Controller
                        name={field.id}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <DateRangePicker
                            label={field.label}
                            value={value as DateRangeValue}
                            onChange={onChange}
                            mode={field.mode}
                            maxRange={field.maxRange}
                            placeholder={field.placeholder}
                          />
                        )}
                      />
                    ) : field.type === "date" ? (
                      <Controller
                        name={field.id}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <DatePicker
                            label={field.label}
                            value={value as string}
                            onChange={onChange}
                            placeholder={field.placeholder}
                          />
                        )}
                      />
                    ) : (
                      <Input
                        {...register(field.id)}
                        id={field.id}
                        type={field.type}
                        label={field.label}
                        placeholder={field.placeholder}
                        prefixIcon={<Icon size={16} />}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={HiOutlineRefresh}
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-wider"
              >
                Làm mới
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={HiOutlineSearch}
                className="text-[10px] font-black uppercase tracking-wider"
              >
                Tìm kiếm
              </Button>
            </div>
          </form>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default TableFilter;
