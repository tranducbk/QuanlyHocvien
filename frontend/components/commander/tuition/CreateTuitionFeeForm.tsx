"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  HiOutlineCash,
  HiOutlineClipboardList,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
} from "react-icons/hi";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Select from "@/library/Select";
import { DEFAULT_PAGE, ROLES } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import { useDebounce } from "@/hooks/useDebounce";
import { useModalStore } from "@/store/useModalStore";
import { semesterService } from "@/services/semesters";
import { tuitionFeeService } from "@/services/tuition-fees";
import { userService } from "@/services/user";
import {
  createTuitionFeeSchema,
  CreateTuitionFeeFormValues,
} from "@/utils/validations";
import CurrencyInput from "@/library/CurrencyInput";
import Textarea from "@/library/Textarea";

export default function CreateTuitionFeeForm() {
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

  const studentOptions = useMemo(
    () =>
      studentsData?.map((student) => ({
        value: student.id,
        label: student.profile?.code
          ? `${student.profile?.fullName || student.username} - ${student.profile.code}`
          : student.profile?.fullName || student.username,
      })) ?? [],
    [studentsData]
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTuitionFeeFormValues>({
    resolver: zodResolver(createTuitionFeeSchema),
    defaultValues: {
      userId: "",
      totalAmount: 0,
      semester: "",
      schoolYear: "",
      content: "",
      status: "UNPAID",
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
        schoolYear: selectedSchoolYear,
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
    mutationKey: MUTATION_KEYS.CREATE_TUITION_FEE,
    mutationFn: (data: CreateTuitionFeeFormValues) =>
      tuitionFeeService.createTuitionFee(data),
    invalidateQueryKey: [QUERY_KEYS.TUITION_FEES],
    successMessage: "Ghi nhận học phí thành công!",
    errorMessage: "Ghi nhận học phí thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-5 py-2"
    >
      <Controller
        name="userId"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Select
            label="Học viên"
            placeholder="Chọn học viên"
            prefixIcon={<HiOutlineAcademicCap />}
            value={value}
            onChange={onChange}
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
              placeholder: "Tìm theo họ tên hoặc mã học viên...",
            }}
          />
        )}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="totalAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Số tiền cần nộp"
              placeholder="VD: 2.500.000"
              prefixIcon={<HiOutlineCash />}
              value={field.value}
              onChange={field.onChange}
              error={errors.totalAmount?.message}
              isLoading={mutation.isPending}
              required
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              label="Trạng thái"
              error={errors.status?.message}
              options={[
                { label: "Chưa thanh toán", value: "UNPAID" },
                { label: "Đã thanh toán", value: "PAID" },
              ]}
              value={value}
              onChange={(value) => onChange(value)}
              isLoading={mutation.isPending}
              required
            />
          )}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="schoolYear"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              label="Năm học"
              placeholder="Chọn năm học"
              prefixIcon={<HiOutlineCalendar />}
              value={value}
              onChange={(selectedValue) => {
                onChange(String(selectedValue));
                setValue("semester", "", { shouldDirty: true });
              }}
              options={schoolYearOptions}
              error={errors.schoolYear?.message}
              isLoading={mutation.isPending || isLoadingSchoolYears}
              emptyText="Chưa có năm học"
              required
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
              value={value}
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
              required
            />
          )}
        />
      </div>

      <Textarea
        label="Nội dung"
        placeholder="VD: Học phí học kỳ 1 năm học 2024-2025"
        prefixIcon={<HiOutlineClipboardList />}
        error={errors.content?.message}
        isLoading={mutation.isPending}
        {...register("content")}
        required
      />

      <Divide />
      <div className="flex justify-end gap-3 px-4">
        <Button
          variant="ghost"
          type="button"
          onClick={closeModal}
          isLoading={mutation.isPending}
        >
          Hủy bỏ
        </Button>
        <Button variant="primary" type="submit" isLoading={mutation.isPending}>
          Ghi nhận
        </Button>
      </div>
    </form>
  );
}
