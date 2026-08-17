"use client";

import React from "react";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import FileUpload from "@/library/FileUpload";
import Typography from "@/library/Typography";
import { userService } from "@/services/user";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import {
  batchExcelFileSchema,
  BatchExcelFileValues,
} from "@/utils/validations";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";
import { downloadBlob } from "@/utils/fn-common";

const CreateBatchUsers: React.FC = () => {
  const { closeModal } = useModalStore();

  const {
    control,
    handleSubmit,
    resetField,
    formState: { errors, isDirty },
  } = useForm<BatchExcelFileValues>({
    resolver: zodResolver(batchExcelFileSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const templateMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.USERS, "import-template"],
    mutationFn: userService.downloadImportTemplate,
    successMessage: "Tải file mẫu thành công!",
    errorMessage: "Không thể tải file mẫu!",
    onSuccess: (blob) => downloadBlob(blob, "mau-nhap-tai-khoan.xlsx"),
  });

  const importMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.IMPORT_USERS,
    mutationFn: (data: BatchExcelFileValues) =>
      userService.importUsers(data.file),
    invalidateQueryKey: [QUERY_KEYS.USERS],
    successMessage: "Tạo tài khoản từ Excel thành công!",
    errorMessage: "Tạo tài khoản từ Excel thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => importMutation.mutate(data))}
      className="flex max-h-[85vh] flex-col"
    >
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-1">
        <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-800 dark:bg-primary-950/30">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-100 p-2 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
              <HiOutlineDownload size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <Typography variant="body" weight="bold" color="neutral">
                File mẫu tạo tài khoản
              </Typography>
              <Typography variant="caption" color="gray" className="mt-1 block">
                Sử dụng file mẫu Excel
              </Typography>
              <Button
                type="button"
                variant="ghost"
                icon={HiOutlineDownload}
                onClick={() => templateMutation.mutate()}
                isLoading={templateMutation.isPending}
                className="mt-3"
              >
                Tải file mẫu
              </Button>
            </div>
          </div>
        </div>


        <Controller
          name="file"
          control={control}
          render={({ field }) => (
            <FileUpload
              label="File Excel tài khoản"
              value={field.value}
              onFileSelect={(file) => field.onChange(file || undefined)}
              onRemove={() => resetField("file")}
              accept=".xlsx,.xls"
              error={errors.file?.message}
              isLoading={importMutation.isPending}
              placeholder="Chọn file Excel để gửi lên hệ thống"
              required
            />
          )}
        />
      </div>

      <Divide className="mt-6" />
      <div className="flex items-center justify-end gap-3 pt-6">
        <Button
          variant="ghost"
          type="button"
          onClick={() => closeModal()}
          disabled={importMutation.isPending}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          type="submit"
          icon={HiOutlineUpload}
          isLoading={importMutation.isPending}
          disabled={!isDirty}
        >
          Tải lên
        </Button>
      </div>
    </form>
  );
};

export default CreateBatchUsers;
