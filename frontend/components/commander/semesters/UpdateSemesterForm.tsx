"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  updateSemesterSchema,
  UpdateSemesterFormValues,
} from "@/utils/validations";
import { semesterService } from "@/services/semesters";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Select from "@/library/Select";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { Semester } from "@/types/semesters";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  semester: Semester;
}

export default function UpdateSemesterForm({ semester }: Props) {
  const { closeModal } = useModalStore();
  const { data: schoolYearsResponse, isLoading: isLoadingSchoolYears } =
    useQuery({
      queryKey: [QUERY_KEYS.SEMESTERS, "school-years"],
      queryFn: () => semesterService.getSchoolYears({ fetchAll: true }),
    });

  const schoolYearOptions = useMemo(
    () =>
      (schoolYearsResponse?.data || []).map((item) => ({
        value: item.schoolYear,
        label: item.schoolYear,
      })),
    [schoolYearsResponse]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateSemesterFormValues>({
    resolver: zodResolver(updateSemesterSchema),
    defaultValues: {
      code: String(semester.code),
      schoolYear: semester.schoolYearInfo?.schoolYear || "",
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_SEMESTER,
    mutationFn: (data: UpdateSemesterFormValues) =>
      semesterService.updateSemester(semester.id, {
        schoolYear: data.schoolYear,
        code: Number(data.code),
      }),
    invalidateQueryKey: [QUERY_KEYS.SEMESTERS],
    successMessage: "Cập nhật học kỳ thành công!",
    errorMessage: "Đã có lỗi xảy ra!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-6 py-2"
    >
      <Controller
        control={control}
        name="code"
        render={({ field }) => (
          <Select
            label="Học kỳ"
            placeholder="Chọn học kỳ"
            prefixIcon={<HiOutlineAcademicCap />}
            options={[1, 2, 3].map((semester) => ({
              value: String(semester),
              label: `Học kỳ ${semester}`,
            }))}
            value={field.value}
            onChange={(value) => field.onChange(String(value))}
            error={errors.code?.message}
            isLoading={mutation.isPending}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="schoolYear"
        render={({ field }) => (
          <Select
            label="Năm học"
            placeholder="Chọn năm học"
            prefixIcon={<HiOutlineAcademicCap />}
            options={schoolYearOptions}
            value={field.value}
            onChange={(value) => field.onChange(String(value))}
            error={errors.schoolYear?.message}
            isLoading={mutation.isPending || isLoadingSchoolYears}
            emptyText="Chưa có năm học"
            required
          />
        )}
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
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
  );
}
