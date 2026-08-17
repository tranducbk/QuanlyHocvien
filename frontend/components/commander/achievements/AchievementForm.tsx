"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
  HiOutlineClipboardList,
} from "react-icons/hi";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Textarea from "@/library/Textarea";
import { DEFAULT_PAGE, ROLES } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import { useDebounce } from "@/hooks/useDebounce";
import { useModalStore } from "@/store/useModalStore";
import { achievementService } from "@/services/achievements";
import { semesterService } from "@/services/semesters";
import { userService } from "@/services/user";
import { Achievement } from "@/types/achievements";
import {
  createAchievementSchema,
  CreateAchievementFormValues,
  updateAchievementSchema,
} from "@/utils/validations";

interface AchievementFormProps {
  achievement?: Achievement;
}

const parseNumber = (value: string) => (value === "" ? null : Number(value));

export default function AchievementForm({ achievement }: AchievementFormProps) {
  const { closeModal } = useModalStore();
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedSearch = useDebounce(studentSearch);
  const isUpdate = Boolean(achievement);

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
      studentsData?.map((student) => ({
        value: student.id,
        label: student.profile?.code
          ? `${student.profile?.fullName || student.username} - ${student.profile.code}`
          : student.profile?.fullName || student.username,
      })) || [];

    if (
      achievement?.user &&
      !options.some((option) => option.value === achievement.userId)
    ) {
      options.unshift({
        value: achievement.userId,
        label: achievement.user.profile?.code
          ? `${achievement.user.profile?.fullName || achievement.user.username} - ${achievement.user.profile.code}`
          : achievement.user.profile?.fullName || achievement.user.username,
      });
    }

    return options;
  }, [achievement, studentsData]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateAchievementFormValues>({
    resolver: zodResolver(
      isUpdate ? updateAchievementSchema : createAchievementSchema
    ),
    defaultValues: {
      userId: achievement?.userId || "",
      title: achievement?.title || "",
      award: achievement?.award || "",
      semester: achievement?.semester || "",
      schoolYear: achievement?.schoolYear || "",
      year: achievement?.year ?? null,
      content: achievement?.content || "",
      description: achievement?.description || "",
    },
  });

  const selectedSchoolYear = useWatch({ control, name: "schoolYear" });

  const { data: schoolYearsResponse, isLoading: isLoadingSchoolYears } =
    useQuery({
      queryKey: [QUERY_KEYS.SEMESTERS, "school-years"],
      queryFn: () => semesterService.getSchoolYears({ fetchAll: true }),
    });

  const { data: semestersResponse, isLoading: isLoadingSemesters } = useQuery({
    queryKey: [QUERY_KEYS.SEMESTERS, "terms", selectedSchoolYear],
    queryFn: () =>
      semesterService.getSemesters({
        fetchAll: true,
        schoolYear: selectedSchoolYear || "",
      }),
    enabled: Boolean(selectedSchoolYear),
  });

  const schoolYearOptions = useMemo(
    () =>
      (schoolYearsResponse?.data || []).map((item) => ({
        value: item.schoolYear,
        label: item.schoolYear,
      })),
    [schoolYearsResponse]
  );

  const semesterOptions = useMemo(
    () =>
      (semestersResponse?.data || []).map((item) => ({
        value: String(item.code),
        label: `Học kỳ ${item.code}`,
      })),
    [semestersResponse]
  );

  const mutation = useAppMutation({
    mutationKey: isUpdate
      ? MUTATION_KEYS.UPDATE_ACHIEVEMENT
      : MUTATION_KEYS.CREATE_ACHIEVEMENT,
    mutationFn: (data: CreateAchievementFormValues) =>
      isUpdate && achievement
        ? achievementService.updateAchievement(achievement.id, data)
        : achievementService.createAchievement(data),
    invalidateQueryKey: [QUERY_KEYS.ACHIEVEMENTS],
    successMessage: isUpdate
      ? "Cập nhật thành tích thành công!"
      : "Thêm thành tích thành công!",
    errorMessage: isUpdate
      ? "Cập nhật thành tích thất bại!"
      : "Thêm thành tích thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="flex max-h-[85vh] flex-col gap-5 pt-2 pb-4"
    >
      <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar">
        <Controller
          name="userId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              label="Học viên"
              placeholder="Chọn học viên"
              prefixIcon={<HiOutlineAcademicCap />}
              value={value}
              onChange={(selectedValue) => onChange(selectedValue)}
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
                placeholder: "Tìm theo họ tên học viên...",
              }}
            />
          )}
        />

        <Input
          label="Tên thành tích"
          placeholder="Nhập tên thành tích"
          prefixIcon={<HiOutlineBadgeCheck />}
          error={errors.title?.message}
          isLoading={mutation.isPending}
          {...register("title")}
          required
        />

        <Input
          label="Danh hiệu / giải thưởng"
          placeholder="Ví dụ: Chiến sĩ tiên tiến"
          prefixIcon={<HiOutlineClipboardList />}
          error={errors.award?.message}
          isLoading={mutation.isPending}
          {...register("award")}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="schoolYear"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                label="Năm học"
                placeholder="Chọn năm học"
                prefixIcon={<HiOutlineCalendar />}
                value={value ?? ""}
                onChange={(selectedValue) => {
                  onChange(String(selectedValue));
                  setValue("semester", "", { shouldDirty: true });
                }}
                options={schoolYearOptions}
                error={errors.schoolYear?.message}
                isLoading={mutation.isPending || isLoadingSchoolYears}
                emptyText="Chưa có năm học"
              />
            )}
          />

          <Controller
            name="semester"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                label="Học kỳ"
                placeholder="Chọn học kỳ"
                prefixIcon={<HiOutlineCalendar />}
                value={value ?? ""}
                onChange={(selectedValue) => onChange(String(selectedValue))}
                options={semesterOptions}
                disabled={!selectedSchoolYear}
                error={errors.semester?.message}
                isLoading={mutation.isPending || isLoadingSemesters}
                emptyText={
                  selectedSchoolYear
                    ? "Năm học này chưa có học kỳ"
                    : "Chọn năm học trước"
                }
              />
            )}
          />
          <Input
            label="Năm"
            type="number"
            placeholder="VD: 2024"
            prefixIcon={<HiOutlineCalendar />}
            error={errors.year?.message}
            isLoading={mutation.isPending}
            {...register("year", { setValueAs: parseNumber })}
          />
        </div>

        <Textarea
          label="Nội dung"
          placeholder="Nhập nội dung thành tích"
          error={errors.content?.message}
          isLoading={mutation.isPending}
          maxLength={1000}
          {...register("content")}
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả bổ sung"
          error={errors.description?.message}
          isLoading={mutation.isPending}
          maxLength={1000}
          {...register("description")}
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
            disabled={isUpdate && !isDirty}
            isLoading={mutation.isPending}
          >
            {isUpdate ? "Cập nhật" : "Thêm thành tích"}
          </Button>
        </div>
      </div>
    </form>
  );
}
