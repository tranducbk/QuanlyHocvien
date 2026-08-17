"use client";

import { useForm, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Divide from "@/library/Divide";
import { universityService } from "@/services/universities";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { universitySchema, UniversityFormValues } from "@/utils/validations";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";

export default function CreateUniversityForm() {
  const { closeModal } = useModalStore();

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_UNIVERSITY,
    mutationFn: (data: UniversityFormValues) =>
      universityService.createUniversity(data),
    invalidateQueryKey: [QUERY_KEYS.UNIVERSITIES],
    successMessage: "Thêm mới thành công!",
    errorMessage: "Thêm mới thất bại!",
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
      universityCode: "",
      universityName: "",
      status: "ACTIVE",
      organizations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizations",
  });

  const onSubmit: SubmitHandler<UniversityFormValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col py-2 gap-4">
      <div className="flex-1 p-4 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
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

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Danh sách Khoa / Ngành trực thuộc
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ organizationName: "" })}
              icon={HiOutlinePlus}
              disabled={mutation.isPending}
            >
              Thêm Khoa
            </Button>
          </div>
          
          {fields.length === 0 ? (
            <div className="text-sm text-neutral-500 italic p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
              Chưa có khoa/ngành nào. Bấm "Thêm Khoa" để tạo kèm khoa.
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="flex-1 grid grid-cols-1 gap-3">
                    <Input
                      placeholder={`Tên khoa/ngành thứ ${index + 1}...`}
                      {...register(`organizations.${index}.organizationName`)}
                      error={errors.organizations?.[index]?.organizationName?.message}
                      isLoading={mutation.isPending}
                    />
                    <Input
                      placeholder={`Các Bậc đào tạo (VD: Đại học, Thạc sĩ...) - Mặc định: Đại học, Thạc sĩ, Tiến sĩ`}
                      {...register(`organizations.${index}.educationLevels`)}
                      error={errors.organizations?.[index]?.educationLevels?.message}
                      isLoading={mutation.isPending}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!text-error-500 hover:!bg-error-50 dark:hover:!bg-error-500/10 h-11 w-11 !p-0 shrink-0 mt-0"
                    onClick={() => remove(index)}
                    disabled={mutation.isPending}
                  >
                    <HiOutlineTrash size={18} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-4 mt-2">
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
