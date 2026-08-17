"use client";

import {
  Control,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  Controller,
} from "react-hook-form";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import Button from "@/library/Button";
import Input from "@/library/Input";
import MultiSelect from "@/library/MultiSelect";
import TimeRangePicker from "@/library/TimeRangePicker";
import Typography from "@/library/Typography";
import { CreateTimeTableFormValues } from "@/utils/validations";

type TimeTableFormValues = CreateTimeTableFormValues;
type ScheduleItem = NonNullable<TimeTableFormValues["schedules"]>[number];
type ScheduleError = Record<
  number,
  Partial<Record<keyof ScheduleItem, { message?: string }>>
>;

const weekDays = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const weekOptions = Array.from({ length: 20 }, (_, index) => ({
  value: index + 1,
  label: `Tuần ${index + 1}`,
}));

export const emptySchedule: ScheduleItem = {
  day: "Thứ 2",
  room: "",
  subjectName: "",
  week: [],
  timeRange: {
    startTime: "",
    endTime: "",
  },
};

interface TimeTableCalendarFormProps {
  control: Control<TimeTableFormValues>;
  fields: (ScheduleItem & { id: string })[];
  register: UseFormRegister<TimeTableFormValues>;
  errors: FieldErrors<TimeTableFormValues>;
  append: UseFieldArrayAppend<TimeTableFormValues, "schedules">;
  remove: UseFieldArrayRemove;
}

interface ScheduleFieldsProps {
  control: Control<TimeTableFormValues>;
  register: UseFormRegister<TimeTableFormValues>;
  remove: UseFieldArrayRemove;
  index: number;
  fieldsLength: number;
  schedulesErrors?: ScheduleError;
}

function ScheduleFields({
  control,
  register,
  remove,
  index,
  fieldsLength,
  schedulesErrors,
}: ScheduleFieldsProps) {
  return (
    <>
      <input type="hidden" {...register(`schedules.${index}.day`)} />
      <div className="mb-3 flex items-center justify-between gap-3">
        <Typography
          variant="caption"
          weight="semibold"
          className="text-primary-700 dark:text-primary-100"
        >
          Ca học #{index + 1}
        </Typography>
        {fieldsLength > 1 && (
          <Button type="button" variant="ghost" onClick={() => remove(index)}>
            <HiOutlineTrash /> Xóa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Controller
          control={control}
          name={`schedules.${index}.week`}
          render={({ field }) => (
            <MultiSelect
              label="Tuần học"
              placeholder="Chọn tuần học"
              options={weekOptions}
              value={field.value ?? []}
              onChange={field.onChange}
              error={schedulesErrors?.[index]?.week?.message}
            />
          )}
        />
        <Controller
          control={control}
          name={`schedules.${index}.timeRange`}
          render={({ field }) => (
            <TimeRangePicker
              label="Thời gian"
              mode="HH:mm"
              value={field.value}
              onChange={field.onChange}
              error={schedulesErrors?.[index]?.timeRange?.message}
              required
            />
          )}
        />
        <Input
          label="Phòng học"
          placeholder="VD: P451"
          error={schedulesErrors?.[index]?.room?.message}
          {...register(`schedules.${index}.room`)}
          required
        />
        <Input
          label="Tên môn học"
          required
          placeholder="VD: Toán cao cấp"
          error={schedulesErrors?.[index]?.subjectName?.message}
          {...register(`schedules.${index}.subjectName`)}
        />
      </div>
    </>
  );
}

export default function TimeTableCalendarForm({
  control,
  fields,
  register,
  errors,
  append,
  remove,
}: TimeTableCalendarFormProps) {
  const schedulesErrors = errors.schedules as ScheduleError | undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="body" weight="semibold" color="neutral">
            Lịch học
          </Typography>
          <Typography variant="caption" color="gray">
            Thêm ca học vào từng ngày, hệ thống sẽ lưu theo đúng cấu trúc lịch
            học
          </Typography>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {weekDays.map((day) => {
          const dayFields = fields
            .map((field, index) => ({ field, index }))
            .filter(({ field }) => field.day === day);

          return (
            <div
              key={day}
              className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900"
            >
              <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-700/80">
                <Typography
                  variant="body"
                  weight="bold"
                  className="text-neutral-900 dark:text-neutral-100"
                >
                  {day}
                </Typography>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => append({ ...emptySchedule, day })}
                >
                  <HiOutlinePlus /> Thêm
                </Button>
              </div>

              {dayFields.length ? (
                <div className="space-y-3">
                  {dayFields.map(({ field, index }) => (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-primary-100 bg-primary-50/70 p-3 dark:border-primary-700/50 dark:bg-primary-950/40"
                    >
                      <ScheduleFields
                        control={control}
                        register={register}
                        remove={remove}
                        index={index}
                        fieldsLength={fields.length}
                        schedulesErrors={schedulesErrors}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-800/70">
                  <Typography
                    variant="caption"
                    className="text-neutral-500 dark:text-neutral-300"
                  >
                    Chưa có ca học
                  </Typography>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
