"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Divide from "@/library/Divide";
import { universityService } from "@/services/universities";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { University } from "@/types/universities";
import { universitySchema, UniversityFormValues } from "@/utils/validations";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  university: University;
}

export default function UpdateUniversityForm({
  university,
}: Props) {
  const { closeModal } = useModalStore();

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_UNIVERSITY,
    mutationFn: (data: UniversityFormValues) =>
      universityService.updateUniversity(university.id, data),
    invalidateQueryKey: [QUERY_KEYS.UNIVERSITIES],
    successMessage: "Cập nhật thành công!",
    errorMessage: "Cập nhật thất bại!",
    onSuccess: () => closeModal(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      universityCode: university.universityCode,
      universityName: university.universityName,
      status: university.status,
    },
  });

  const onSubmit: SubmitHandler<UniversityFormValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col py-2 gap-4"
    >
      <div className="flex-1 p-4 space-y-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input
              label="Mã trường"
              placeholder="Ví dụ: T01, T02..."
              {...register("universityCode")}
              error={errors.universityCode?.message}
              isLoading={mutation.isPending}
              required
            />
            <Input
              label="Tên trường"
              placeholder="Ví dụ: Học viện Khoa học Quân sự"
              {...register("universityName")}
              error={errors.universityName?.message}
              isLoading={mutation.isPending}
              required
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Trạng thái"
                  required={true}
                  placeholder="Chọn trạng thái"
                  options={[
                    { label: "Hoạt động", value: "ACTIVE" },
                    { label: "Tạm dừng", value: "INACTIVE" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.status?.message}
                  isLoading={mutation.isPending}
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
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </form>
  );
}
