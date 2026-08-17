"use client";

import React from "react";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/library/Button";
import Typography from "@/library/Typography";
import FileUpload from "@/library/FileUpload";
import { userService } from "@/services/user";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import {
  batchExcelFileSchema,
  BatchExcelFileValues,
} from "@/utils/validations";
import Divide from "@/library/Divide";
import { useModalStore } from "@/store/useModalStore";
import useAppMutation from "@/hooks/useAppMutation";
import { downloadBlob } from "@/utils/fn-common";

const UpdateBatchStudents: React.FC = () => {
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
    mutationKey: [QUERY_KEYS.USERS, "batch-profiles-template"],
    mutationFn: userService.downloadBatchStudentsTemplate,
    successMessage: "Tải file mẫu thành công!",
    errorMessage: "Không thể tải file mẫu!",
    onSuccess: (blob) => downloadBlob(blob, "mau-cap-nhat-hoc-vien.xlsx"),
  });

  const updateMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_BATCH_STUDENTS,
    mutationFn: (data: BatchExcelFileValues) =>
      userService.importBatchStudents(data.file),
    invalidateQueryKey: [QUERY_KEYS.USERS],
    successMessage: "Cập nhật học viên từ Excel thành công!",
    errorMessage: "Cập nhật học viên từ Excel thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
      className="flex flex-col max-h-[85vh] py-2 gap-4"
    >
      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar space-y-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
            <HiOutlineDownload size={24} />
          </div>
          <div className="flex-1">
            <Typography variant="body" weight="bold" color="primary">
              File mẫu cập nhật hàng loạt
            </Typography>
            <Typography variant="caption" color="gray" className="block mt-1">
              Sử dụng file mẫu Excel. Cột &#34;Mã học viên&#34; là bắt buộc để
              xác định đối tượng cập nhật.
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

        <Controller
          name="file"
          control={control}
          render={({ field }) => (
            <FileUpload
              label="File Excel cập nhật"
              value={field.value}
              onFileSelect={(file) => field.onChange(file || undefined)}
              onRemove={() => resetField("file")}
              accept=".xlsx,.xls"
              error={errors.file?.message}
              isLoading={updateMutation.isPending}
              placeholder="Chọn file Excel để gửi lên hệ thống"
              required
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Divide />
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={() => closeModal()}
            disabled={updateMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            type="submit"
            icon={HiOutlineUpload}
            isLoading={updateMutation.isPending}
            disabled={!isDirty}
          >
            Tải lên
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UpdateBatchStudents;
