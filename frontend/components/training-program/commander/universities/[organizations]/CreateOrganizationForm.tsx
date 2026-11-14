"use client";

import { AiOutlineAppstore, AiOutlineClockCircle } from "@/library/icons";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizationService } from "@/services/training-program/organizations";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";
import { useQueryClient } from "@tanstack/react-query";
import type { Organization } from "@/types/training-program/organizations";

import {
  createOrganizationSchema,
  CreateOrganizationFormValues,
} from "@/utils/validations";

interface Props {
  universityId: string;
  onCreated?: (organization: Organization) => void;
}

export default function CreateOrganizationForm({
  universityId,
  onCreated,
}: Props) {
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      organizationName: "",
      travelTime: 0,
      universityId: universityId,
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_ORGANIZATION,
    mutationFn: (data: CreateOrganizationFormValues) =>
      organizationService.createOrganization(data),
    invalidateQueryKey: [QUERY_KEYS.ORGANIZATIONS, universityId],
    successMessage: "Đã tạo ngành học",
    errorMessage: "Đã có lỗi xảy ra!",
    onSuccess: async (response) => {
      await Promise.all([QUERY_KEYS.UNIVERSITIES, QUERY_KEYS.UNIVERSITY_HIERARCHY]
        .map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
      if (response.data) onCreated?.(response.data);
      closeModal();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-6 py-2"
    >
      <Input
        label="Tên ngành học"
        placeholder="VD: Công nghệ thông tin"
        prefixIcon={<AiOutlineAppstore />}
        error={errors.organizationName?.message}
        isLoading={mutation.isPending}
        {...register("organizationName")}
        required
      />
      <Input
        label="Thời gian di chuyển (phút)"
        type="number"
        placeholder="Thời gian đi từ đơn vị về trường (để tính cắt cơm)..."
        prefixIcon={<AiOutlineClockCircle />}
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
            Tạo ngành học
          </Button>
        </div>
      </div>
    </form>
  );
}
