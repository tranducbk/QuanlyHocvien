"use client";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/library/Button";
import DatePicker from "@/library/DatePicker";
import Divide from "@/library/Divide";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { GENDER, RANKS } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import { userService } from "@/services/user";
import { Student, UpdateProfileRequest } from "@/types/user";
import {
  studentProfileSchema,
  StudentProfileFormValues,
} from "@/utils/validations";

interface UpdateStudentProfileFormProps {
  student: Student;
}

export default function UpdateStudentProfileForm({
  student,
}: UpdateStudentProfileFormProps) {
  const { closeModal } = useModalStore();

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_STUDENT_PROFILE,
    mutationFn: (data: UpdateProfileRequest) =>
      userService.updateStudentProfile(student.id, data),
    invalidateQueryKey: [QUERY_KEYS.STUDENT_PROFILES],
    successMessage: "Cập nhật hồ sơ học viên thành công",
    errorMessage: "Cập nhật hồ sơ học viên thất bại",
    onSuccess: () => closeModal(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      code: student.code,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      birthday: student.birthday,
      gender: student.gender,
      cccd: student.cccd,
      currentAddress: student.currentAddress,
      hometown: student.hometown,
      placeOfBirth: student.placeOfBirth,
      ethnicity: student.ethnicity,
      religion: student.religion,
      rank: student.rank,
      unit: student.unit,
      positionGovernment: student.positionGovernment,
      positionParty: student.positionParty,
      dateOfEnlistment: student.dateOfEnlistment,
      enrollment: student.enrollment,
      currentCpa4: student.currentCpa4,
      currentCpa10: student.currentCpa10,
      graduationDate: student.graduationDate,
      partyMemberCardNumber: student.partyMemberCardNumber,
      probationaryPartyMember: student.probationaryPartyMember,
      fullPartyMember: student.fullPartyMember,
      familyMember: typeof student.familyMember === "string" ? student.familyMember : "",
      foreignRelations:
        typeof student.foreignRelations === "string" ? student.foreignRelations : "",
    },
  });

  const parseNumber = (value: string) => (value === "" ? null : Number(value));

  const onSubmit: SubmitHandler<StudentProfileFormValues> = (data) => {
    const formattedData = { ...data };
    const dateFields = [
      "birthday",
      "dateOfEnlistment",
      "graduationDate",
      "probationaryPartyMember",
      "fullPartyMember",
    ] as const;

    dateFields.forEach((field) => {
      if (formattedData[field] === "") {
        formattedData[field] = null;
      }
    });

    mutation.mutate(formattedData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col max-h-[85vh] pt-2 pb-4 gap-4"
    >
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-12">
        <section>
          <SectionHeader title="Thông tin cơ bản & liên hệ" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              error={errors.fullName?.message}
              isLoading={mutation.isPending}
              {...register("fullName")}
              required
            />
            <Input
              label="Mã học viên"
              placeholder="Nhập mã học viên"
              error={errors.code?.message}
              isLoading={mutation.isPending}
              {...register("code")}
              required
            />
            <Input
              label="Email"
              placeholder="Nhập email"
              error={errors.email?.message}
              isLoading={mutation.isPending}
              {...register("email")}
            />
            <Input
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              error={errors.phoneNumber?.message}
              isLoading={mutation.isPending}
              {...register("phoneNumber")}
            />
            <div className="md:col-span-2">
              <Input
                label="Địa chỉ hiện tại"
                placeholder="Nhập địa chỉ hiện tại"
                error={errors.currentAddress?.message}
                isLoading={mutation.isPending}
                {...register("currentAddress")}
              />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Thông tin cá nhân" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày sinh"
                  placeholder="Chọn ngày sinh"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.birthday?.message}
                />
              )}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  label="Giới tính"
                  placeholder="Chọn giới tính"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "MALE", label: GENDER.MALE },
                    { value: "FEMALE", label: GENDER.FEMALE },
                  ]}
                  error={errors.gender?.message}
                  isLoading={mutation.isPending}
                  required
                />
              )}
            />
            <Input
              label="Số CCCD"
              placeholder="Nhập số CCCD"
              error={errors.cccd?.message}
              isLoading={mutation.isPending}
              {...register("cccd")}
            />
            <Input
              label="Quê quán"
              placeholder="Nhập quê quán"
              error={errors.hometown?.message}
              isLoading={mutation.isPending}
              {...register("hometown")}
            />
            <Input
              label="Nơi sinh"
              placeholder="Nhập nơi sinh"
              error={errors.placeOfBirth?.message}
              isLoading={mutation.isPending}
              {...register("placeOfBirth")}
            />
            <Input
              label="Dân tộc"
              placeholder="Nhập dân tộc"
              error={errors.ethnicity?.message}
              isLoading={mutation.isPending}
              {...register("ethnicity")}
            />
            <Input
              label="Tôn giáo"
              placeholder="Nhập tôn giáo"
              error={errors.religion?.message}
              isLoading={mutation.isPending}
              {...register("religion")}
            />
          </div>
        </section>

        <section>
          <SectionHeader title="Học tập & Công tác" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Controller
              name="rank"
              control={control}
              render={({ field }) => (
                <Select
                  label="Cấp bậc"
                  placeholder="Chọn cấp bậc"
                  value={field.value}
                  onChange={field.onChange}
                  options={Object.values(RANKS).map((rank) => ({
                    value: rank,
                    label: rank,
                  }))}
                  error={errors.rank?.message}
                  isLoading={mutation.isPending}
                />
              )}
            />
            <Input
              label="Đơn vị"
              placeholder="Nhập đơn vị"
              error={errors.unit?.message}
              isLoading={mutation.isPending}
              {...register("unit")}
            />
            <Controller
              name="dateOfEnlistment"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày nhập ngũ"
                  placeholder="Chọn ngày nhập ngũ"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.dateOfEnlistment?.message}
                />
              )}
            />
            <Input
              label="Chức vụ chính quyền"
              placeholder="Nhập chức vụ chính quyền"
              error={errors.positionGovernment?.message}
              isLoading={mutation.isPending}
              {...register("positionGovernment")}
            />
            <Input
              label="Khóa nhập học"
              type="number"
              placeholder="Ví dụ: 2024"
              error={errors.enrollment?.message}
              isLoading={mutation.isPending}
              {...register("enrollment", { setValueAs: parseNumber })}
            />
            <Controller
              name="graduationDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày tốt nghiệp"
                  placeholder="Chọn ngày tốt nghiệp"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.graduationDate?.message}
                />
              )}
            />
            <Input
              label="CPA hệ 4"
              type="number"
              step="0.01"
              placeholder="Ví dụ: 3.2"
              error={errors.currentCpa4?.message}
              isLoading={mutation.isPending}
              {...register("currentCpa4", { setValueAs: parseNumber })}
            />
            <Input
              label="CPA hệ 10"
              type="number"
              step="0.01"
              placeholder="Ví dụ: 8.0"
              error={errors.currentCpa10?.message}
              isLoading={mutation.isPending}
              {...register("currentCpa10", { setValueAs: parseNumber })}
            />
          </div>
        </section>

        <section>
          <SectionHeader title="Đảng & Đoàn - Quan hệ" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input
              label="Chức vụ Đảng"
              placeholder="Nhập chức vụ Đảng"
              error={errors.positionParty?.message}
              isLoading={mutation.isPending}
              {...register("positionParty")}
            />
            <Input
              label="Số thẻ Đảng"
              placeholder="Nhập số thẻ Đảng"
              error={errors.partyMemberCardNumber?.message}
              isLoading={mutation.isPending}
              {...register("partyMemberCardNumber")}
            />
            <Controller
              name="probationaryPartyMember"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày vào Đảng (dự bị)"
                  placeholder="Chọn ngày vào Đảng (dự bị)"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.probationaryPartyMember?.message}
                />
              )}
            />
            <Controller
              name="fullPartyMember"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày vào Đảng (chính thức)"
                  placeholder="Chọn ngày vào Đảng (chính thức)"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.fullPartyMember?.message}
                />
              )}
            />
            <Input
              label="Thành phần gia đình"
              placeholder="Nhập thành phần gia đình"
              error={errors.familyMember?.message}
              isLoading={mutation.isPending}
              {...register("familyMember")}
            />
            <Input
              label="Quan hệ nước ngoài"
              placeholder="Nhập quan hệ nước ngoài"
              error={errors.foreignRelations?.message}
              isLoading={mutation.isPending}
              {...register("foreignRelations")}
            />
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <Divide className="w-full" />
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={() => closeModal()}
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
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </form>
  );
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-2 h-8 bg-primary-500 rounded-full" />
    <Typography
      variant="h4"
      weight="bold"
      transform="uppercase"
      className="tracking-tight text-neutral-800 dark:text-neutral-100"
    >
      {title}
    </Typography>
  </div>
);
