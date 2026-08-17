"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateClassSchema, UpdateClassFormValues } from "@/utils/validations";
import { classService } from "@/services/classes";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Class } from "@/types/classes";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  cls: Class;
  educationLevelId: string;
}

export default function UpdateClassForm({ cls, educationLevelId }: Props) {
  const { closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateClassFormValues>({
    resolver: zodResolver(updateClassSchema),
    defaultValues: {
      className: cls.className,
      studentCount: cls.studentCount,
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_CLASS,
    mutationFn: (data: UpdateClassFormValues) =>
      classService.updateClass(cls.id, data),
    invalidateQueryKey: [QUERY_KEYS.CLASSES, educationLevelId],
    successMessage: "Cập nhật lớp học thành công!",
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
      <Input
        label="Số lượng học viên"
        type="number"
        placeholder="Nhập số lượng học viên hiện tại..."
        prefixIcon={<HiOutlineUserGroup />}
        error={errors.studentCount?.message}
        isLoading={mutation.isPending}
        {...register("studentCount", { valueAsNumber: true })}
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
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
  );
}
