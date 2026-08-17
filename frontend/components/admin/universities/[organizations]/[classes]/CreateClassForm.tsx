"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClassSchema, CreateClassFormValues } from "@/utils/validations";
import { classService } from "@/services/classes";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { HiOutlineUserGroup } from "react-icons/hi";
import Divide from "@/library/Divide";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  educationLevelId: string;
}

export default function CreateClassForm({ educationLevelId }: Props) {
  const { closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      educationLevelId: educationLevelId,
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_CLASS,
    mutationFn: (data: CreateClassFormValues) => classService.createClass(data),
    invalidateQueryKey: [QUERY_KEYS.CLASSES, educationLevelId],
    successMessage: "Thêm mới lớp học thành công!",
    errorMessage: "Đã có lỗi xảy ra!",
    onSuccess: () => closeModal(),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6 py-2">
      <Input
        label="Tên lớp học"
        placeholder="VD: CNTT-K60, AT15..."
        prefixIcon={<HiOutlineUserGroup />}
        error={errors.className?.message}
        isLoading={mutation.isPending}
        {...register("className")}
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
