"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { HiOutlineAcademicCap, HiOutlineCalendar } from "react-icons/hi";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Input from "@/library/Input";
import Select from "@/library/Select";
import { DEFAULT_PAGE, ROLES } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import { useDebounce } from "@/hooks/useDebounce";
import { userService } from "@/services/user";
import { useModalStore } from "@/store/useModalStore";
import { semesterService } from "@/services/semesters";
import { timeTableService } from "@/services/time-tables";
import { TimeTable } from "@/types/time-tables";
import {
  updateTimeTableSchema,
  UpdateTimeTableFormValues,
} from "@/utils/validations";
import TimeTableCalendarForm, { emptySchedule } from "./TimeTableCalendarForm";

const toFormSchedules = (schedules: TimeTable["schedules"]) =>
  schedules?.map((schedule) => ({
    day: schedule.day,
    room: schedule.room,
    subjectName: schedule.subjectName ?? "",
    week: Array.isArray(schedule.week)
      ? schedule.week
      : schedule.week != null
        ? [schedule.week]
        : [],
    timeRange: {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    },
  })) || [];

export default function UpdateTimeTableForm({
  timeTable,
}: {
  timeTable: TimeTable;
}) {
  const { closeModal } = useModalStore();
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedSearch = useDebounce(studentSearch);

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

  const studentOptions = useMemo(() => {
    const options =
      studentsData?.map((student) => {
        const name = student.profile?.fullName || student.username || student.id;
        return {
          value: student.id,
          label: student.profile?.code
            ? `${name} - ${student.profile.code}`
            : name,
        };
      }) || [];
    if (
      timeTable.user &&
      !options.some((opt) => opt.value === timeTable.userId)
    ) {
      const student = timeTable.user;
      const name = student.profile?.fullName || student.username || student.id;
      options.unshift({
        value: student.id,
        label: student.profile?.code
          ? `${name} - ${student.profile.code}`
          : name,
      });
    }

    return options;
  }, [studentsData, timeTable]);
  const { data: semestersResponse, isLoading: isLoadingSemesters } = useQuery({
    queryKey: [QUERY_KEYS.SEMESTERS, "time-table-options"],
    queryFn: () => semesterService.getSemesters({ fetchAll: true }),
  });

  const semesterOptions = useMemo(
    () =>
      (semestersResponse?.data || []).map((semester) => {
        const schoolYear = semester.schoolYearInfo?.schoolYear || "";

        return {
          value: semester.id,
          label: `${schoolYear} - Học kỳ ${String(semester.code)}`,
        };
      }),
    [semestersResponse]
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateTimeTableFormValues>({
    resolver: zodResolver(updateTimeTableSchema),
    defaultValues: {
      userId: timeTable.userId,
      semesterId: timeTable.semesterId || "",
      schedules: timeTable.schedules?.length
        ? toFormSchedules(timeTable.schedules)
        : [emptySchedule],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_TIME_TABLE,
    mutationFn: (data: UpdateTimeTableFormValues) =>
      timeTableService.updateTimeTable(timeTable.id, data),
    invalidateQueryKey: [QUERY_KEYS.TIME_TABLES],
    successMessage: "Cập nhật lịch học thành công!",
    errorMessage: "Cập nhật lịch học thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="flex max-h-[85vh] flex-col gap-6 pt-2 pb-4"
    >
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="userId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              disabled
              label="Học viên"
              placeholder="Chọn học viên"
              prefixIcon={<HiOutlineAcademicCap />}
              value={value}
              onChange={(selectedValue) => onChange(selectedValue)}
              options={studentOptions}
              hasNextPage={hasNextStudents}
              isFetchingNextPage={isFetchingNextStudents}
              onLoadMore={fetchNextStudents}
              isLoading={isLoadingStudents || mutation.isPending}
              error={errors.userId?.message}
              emptyText="Không tìm thấy học viên"
              required
              filter={{
                enabled: true,
                mode: "server",
                onChange: setStudentSearch,
                placeholder: "Tìm theo họ tên học viên...",
              }}
            />
          )}
        />

        <Controller
          name="semesterId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              disabled
              label="Học kỳ"
              placeholder="Chọn học kỳ"
              prefixIcon={<HiOutlineCalendar />}
              value={value}
              onChange={(selectedValue) => onChange(String(selectedValue))}
              options={semesterOptions}
              isLoading={mutation.isPending || isLoadingSemesters}
              error={errors.semesterId?.message}
              emptyText="Chưa có học kỳ"
              required
            />
          )}
        />
      </div>

      <TimeTableCalendarForm
        control={control}
        fields={fields}
        register={register}
        errors={errors}
        append={append}
        remove={remove}
      />

      </div>

      <div className="flex flex-col gap-4 px-4">
        <Divide className="w-full" />
        <div className="flex justify-end gap-3">
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
            disabled={!isDirty}
            isLoading={mutation.isPending}
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
  );
}
