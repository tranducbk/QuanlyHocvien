"use client";

import { Controller, useForm } from "react-hook-form";
import Button from "@/library/Button";
import DateRangePicker from "@/library/DateRangePicker";
import Divide from "@/library/Divide";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import { semesterService } from "@/services/semesters";
import { useModalStore } from "@/store/useModalStore";

interface SchoolYearFormValues {
  schoolYear: string;
}

export default function CreateSchoolYearForm() {
  const { closeModal } = useModalStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SchoolYearFormValues>({
    defaultValues: {
      schoolYear: "",
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_SCHOOL_YEAR,
    mutationFn: (data: SchoolYearFormValues) =>
      semesterService.createSchoolYear(data),
    invalidateQueryKey: [QUERY_KEYS.SEMESTERS],
    successMessage: "Tạo năm học thành công!",
    errorMessage: "Tạo năm học thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-6 py-2"
    >
      <Controller
        control={control}
        name="schoolYear"
        rules={{ required: "Năm học là bắt buộc" }}
        render={({ field }) => {
          const [startYear, endYear] = (field.value || "").split("-");
          return (
            <DateRangePicker
              label="Năm học"
              mode="YYYY"
              maxRange={1}
              required
              disabled={mutation.isPending}
              isLoading={mutation.isPending}
              error={errors.schoolYear?.message}
              value={{
                startDate: startYear || undefined,
                endDate: endYear || undefined,
              }}
              onChange={(value) => {
                if (value.startDate && value.endDate) {
                  field.onChange(`${value.startDate}-${value.endDate}`);
                } else {
                  field.onChange("");
                }
              }}
            />
          );
        }}
      />

      <div className="flex flex-col gap-4">
        <Divide />
        <div className="flex items-center justify-end gap-3 px-4">
          <Button
            variant="ghost"
            type="button"
            onClick={closeModal}
            isLoading={mutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={mutation.isPending}
            disabled={!isDirty}
          >
            Tạo năm học
          </Button>
        </div>
      </div>
    </form>
  );
}
