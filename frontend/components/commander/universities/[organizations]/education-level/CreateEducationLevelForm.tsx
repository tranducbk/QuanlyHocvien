"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizationService } from "@/services/organizations";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { createEducationLevelSchema, CreateEducationLevelFormValues } from "@/utils/validations";
import Divide from "@/library/Divide";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  organizationId: string;
}

export default function CreateEducationLevelForm({ organizationId }: Props) {
  const { closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateEducationLevelFormValues>({
    resolver: zodResolver(createEducationLevelSchema),
    defaultValues: {
      levelName: "",
      organizationId: organizationId,
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_EDUCATION_LEVEL,
    mutationFn: (data: CreateEducationLevelFormValues) =>
      organizationService.createEducationLevel(data),
    invalidateQueryKey: [QUERY_KEYS.EDUCATION_LEVELS, organizationId],
    successMessage: "Thêm mới trình độ thành công!",
    errorMessage: "Đã có lỗi xảy ra!",
    onSuccess: () => closeModal(),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6 py-2">
      <Input
        label="Tên trình độ đào tạo"
        placeholder="VD: Đại học, Cao đẳng, Sau đại học..."
        prefixIcon={<HiOutlineAcademicCap />}
        error={errors.levelName?.message}
        isLoading={mutation.isPending}
        {...register("levelName")}
        required
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
            Thêm mới
          </Button>
        </div>
      </div>
    </form>
  );
}
