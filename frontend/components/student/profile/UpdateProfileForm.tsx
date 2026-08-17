"use client";

import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/auth";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { Student } from "@/types/user";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Select from "@/library/Select";
import Typography from "@/library/Typography";
import { useModalStore } from "@/store/useModalStore";
import DatePicker from "@/library/DatePicker";
import Divide from "@/library/Divide";
import { profileSchema, ProfileFormValues } from "@/utils/validations";
import { RANKS, GENDER } from "@/constants/constants";
import useAppMutation from "@/hooks/useAppMutation";

interface UpdateProfileFormProps {
  initialData: Student;
}

export default function UpdateProfileForm({
  initialData,
}: UpdateProfileFormProps) {
  const { closeModal } = useModalStore();
  const textValue = (value: string | null | undefined) => value ?? "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: textValue(initialData.fullName),
      email: textValue(initialData.email),
      phoneNumber: textValue(initialData.phoneNumber),
      birthday: textValue(initialData.birthday),
      gender: initialData.gender,
      cccd: textValue(initialData.cccd),
      currentAddress: textValue(initialData.currentAddress),
      hometown: textValue(initialData.hometown),
      placeOfBirth: textValue(initialData.placeOfBirth),
      ethnicity: textValue(initialData.ethnicity),
      religion: textValue(initialData.religion),
      rank: textValue(initialData.rank),
      unit: textValue(initialData.unit),
      positionGovernment: textValue(initialData.positionGovernment),
      positionParty: textValue(initialData.positionParty),
      dateOfEnlistment: textValue(initialData.dateOfEnlistment),
      probationaryPartyMember: textValue(initialData.probationaryPartyMember),
      fullPartyMember: textValue(initialData.fullPartyMember),
      partyMemberCardNumber: textValue(initialData.partyMemberCardNumber),
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_PROFILE,
    mutationFn: (data: ProfileFormValues) => authService.updateProfile(data),
    invalidateQueryKey: [QUERY_KEYS.PROFILE],
    successMessage: "Cập nhật hồ sơ thành công",
    errorMessage: "Cập nhật thất bại",
    onSuccess: () => closeModal(),
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    const formattedData = { ...data };

    const dateFields = [
      "birthday",
      "dateOfEnlistment",
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
      className="flex flex-col max-h-[85vh] py-2 gap-4"
    >
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-12">
        <section>
          <SectionHeader title="Thông tin cá nhân" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              error={errors.fullName?.message}
              isLoading={mutation.isPending}
              {...register("fullName")}
              required
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  label="Giới tính"
                  value={field.value}
                  onChange={field.onChange}
                  options={Object.entries(GENDER).map(([key, value]) => ({
                    value: key,
                    label: value,
                  }))}
                  error={errors.gender?.message}
                  isLoading={mutation.isPending}
                  required
                />
              )}
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
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày sinh"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.birthday?.message}
                />
              )}
            />
            <Input
              label="Số CCCD"
              placeholder="Nhập số CCCD"
              error={errors.cccd?.message}
              {...register("cccd")}
            />
            <Input
              label="Dân tộc"
              placeholder="Nhập dân tộc"
              error={errors.ethnicity?.message}
              {...register("ethnicity")}
            />
            <Input
              label="Tôn giáo"
              placeholder="Nhập tôn giáo"
              error={errors.religion?.message}
              {...register("religion")}
            />
          </div>
        </section>

        <section>
          <SectionHeader title="Địa chỉ & Quê quán" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input
              label="Quê quán"
              placeholder="Nhập quê quán"
              error={errors.hometown?.message}
              {...register("hometown")}
            />
            <Input
              label="Nơi sinh"
              placeholder="Nhập nơi sinh"
              error={errors.placeOfBirth?.message}
              {...register("placeOfBirth")}
            />
            <div className="md:col-span-2">
              <Input
                label="Địa chỉ hiện tại"
                placeholder="Nhập địa chỉ"
                error={errors.currentAddress?.message}
                {...register("currentAddress")}
              />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Quân nhân & Chính trị" />
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
                />
              )}
            />
            <Input
              label="Đơn vị"
              placeholder="Nhập đơn vị"
              error={errors.unit?.message}
              {...register("unit")}
            />
            <Input
              label="Chức vụ chính quyền"
              placeholder="Nhập chức vụ chính quyền"
              error={errors.positionGovernment?.message}
              {...register("positionGovernment")}
            />
            <Input
              label="Chức vụ Đảng"
              placeholder="Nhập chức vụ Đảng"
              error={errors.positionParty?.message}
              {...register("positionParty")}
            />
            <Controller
              name="dateOfEnlistment"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày nhập ngũ"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.dateOfEnlistment?.message}
                />
              )}
            />
          </div>
        </section>

        <section>
          <SectionHeader title="Thông tin Đảng viên" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input
              label="Số thẻ Đảng"
              placeholder="Nhập số thẻ Đảng"
              error={errors.partyMemberCardNumber?.message}
              {...register("partyMemberCardNumber")}
            />
            <Controller
              name="probationaryPartyMember"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày vào Đảng (dự bị)"
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
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.fullPartyMember?.message}
                />
              )}
            />
          </div>
        </section>
      </div>

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
            Lưu hồ sơ
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
