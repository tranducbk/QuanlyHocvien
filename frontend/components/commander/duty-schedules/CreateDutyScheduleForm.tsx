"use client";

import React, { useMemo, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import Button from "@/library/Button";
import Input from "@/library/Input";
import DatePicker from "@/library/DatePicker";
import Select from "@/library/Select";
import { DEFAULT_PAGE, ROLES } from "@/constants/constants";
import { dutyScheduleService } from "@/services/duty-schedules";
import { userService } from "@/services/user";
import { createDutyScheduleSchema, CreateDutyScheduleFormValues } from "@/utils/validations";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";
import { useDebounce } from "@/hooks/useDebounce";

export default function CreateDutyScheduleForm() {
  const { closeModal } = useModalStore();
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedSearch = useDebounce(studentSearch);
  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_DUTY_SCHEDULE,
    mutationFn: (data: CreateDutyScheduleFormValues) =>
      dutyScheduleService.createDutySchedule(data),
    invalidateQueryKey: [QUERY_KEYS.DUTY_SCHEDULES],
    successMessage: "Phân công thành công!",
    errorMessage: "Phân công thất bại!",
    onSuccess: () => closeModal(),
  });

  const {
    data: studentsData,
    fetchNextPage: fetchNextStudents,
    hasNextPage: hasNextStudents,
    isFetchingNextPage: isFetchingNextStudents,
    isLoading: isLoadingStudents,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.USERS, ROLES.STUDENT.ROLE, debouncedSearch],
    queryFn: ({ pageParam }) =>
      userService.getAllUsers({
        page: pageParam,
        limit: DEFAULT_PAGE.PAGE_SIZE,
        role: ROLES.STUDENT.ROLE,
        fullName: debouncedSearch || undefined,
      }),
    initialPageParam: DEFAULT_PAGE.PAGE_INDEX + 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((page) => page.data || []),
  });

  const studentOptions = useMemo(
    () =>
      studentsData?.map((student) => ({
        value: student.id,
        label: student.profile?.fullName || student.username,
      })) || [],
    [studentsData]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateDutyScheduleFormValues>({
    resolver: zodResolver(createDutyScheduleSchema),
    defaultValues: {
      userId: "",
      position: "",
      workDay: "",
    },
  });

  const onSubmit: SubmitHandler<CreateDutyScheduleFormValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
      <Controller
        name="userId"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Select
            label="Họ và tên"
            placeholder="Chọn học viên trực"
            value={value}
            onChange={(value) => onChange(value)}
            options={studentOptions}
            hasNextPage={hasNextStudents}
            isFetchingNextPage={isFetchingNextStudents}
            onLoadMore={fetchNextStudents}
            isLoading={isLoadingStudents}
            error={errors.userId?.message}
            emptyText="Không tìm thấy học viên"
            required
            filter={{
              enabled: true,
              mode: "server",
              onChange: setStudentSearch,
              placeholder: "Tìm kiếm học viên...",
            }}
          />
        )}
      />

      <Input
        label="Nhiệm vụ / Ca trực"
        placeholder="Ví dụ: Trực ban d, Trực ban c..."
        {...register("position")}
        error={errors.position?.message}
        isLoading={mutation.isPending}
        required
      />

      <Controller
        name="workDay"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Ngày trực"
            placeholder="Chọn ngày trực"
            value={field.value}
            onChange={field.onChange}
            error={errors.workDay?.message}
            required
          />
        )}
      />

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" type="button" onClick={closeModal}>
          Hủy
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={mutation.isPending}
          disabled={!isDirty}
        >
          Phân công
        </Button>
      </div>
    </form>
  );
}
