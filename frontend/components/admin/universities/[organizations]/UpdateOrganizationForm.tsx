"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizationService } from "@/services/organizations";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { HiOutlineCollection, HiOutlineClock } from "react-icons/hi";
import { Organization } from "@/types/organizations";
import Divide from "@/library/Divide";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

import {
  updateOrganizationSchema,
  UpdateOrganizationFormValues,
} from "@/utils/validations";

interface Props {
  organization: Organization;
  universityId: string;
}

export default function UpdateOrganizationForm({
  organization,
  universityId,
}: Props) {
  const { closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      organizationName: organization.organizationName,
      travelTime: organization.travelTime,
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_ORGANIZATION,
    mutationFn: (data: UpdateOrganizationFormValues) =>
      organizationService.updateOrganization(organization.id, data),
    invalidateQueryKey: [QUERY_KEYS.ORGANIZATIONS, universityId],
    successMessage: "Cập nhật đơn vị thành công!",
    errorMessage: "Đã có lỗi xảy ra!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-6 py-2"
    >
      <Input
        label="Tên đơn vị / Chuyên ngành"
        placeholder="VD: Khoa Công nghệ thông tin..."
        prefixIcon={<HiOutlineCollection />}
        error={errors.organizationName?.message}
        isLoading={mutation.isPending}
        {...register("organizationName")}
        required
      />
      <Input
        label="Thời gian di chuyển (phút)"
        type="number"
        placeholder="Thời gian đi từ đơn vị về trường (để tính cắt cơm)..."
        prefixIcon={<HiOutlineClock />}
        error={errors.travelTime?.message}
        isLoading={mutation.isPending}
        {...register("travelTime", { valueAsNumber: true })}
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
