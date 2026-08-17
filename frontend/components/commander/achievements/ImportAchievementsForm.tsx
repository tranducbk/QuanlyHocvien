"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import FileUpload from "@/library/FileUpload";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { QUERY_KEYS } from "@/constants/query-keys";
import { achievementService } from "@/services/achievements";
import { useModalStore } from "@/store/useModalStore";
import {
  batchExcelFileSchema,
  BatchExcelFileValues,
} from "@/utils/validations";
import { downloadBlob } from "@/utils/fn-common";

export default function ImportAchievementsForm() {
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
    mutationKey: [QUERY_KEYS.ACHIEVEMENTS, "template"],
    mutationFn: achievementService.downloadImportTemplate,
    successMessage: "Tải file mẫu thành công!",
    errorMessage: "Không thể tải file mẫu!",
    onSuccess: (blob) => downloadBlob(blob, "mau-nhap-thanh-tich.xlsx"),
  });

  const importMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.ACHIEVEMENTS, "import"],
    mutationFn: (data: BatchExcelFileValues) =>
      achievementService.importAchievements(data.file),
    invalidateQueryKey: [QUERY_KEYS.ACHIEVEMENTS],
    successMessage: "Nhập thành tích từ Excel thành công!",
    errorMessage: "Nhập thành tích từ Excel thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => importMutation.mutate(data))}
      className="max-h-[85vh] space-y-6 overflow-y-auto py-2 pr-2"
    >
      <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-800 dark:bg-primary-950/30">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-100 p-2 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
            <HiOutlineDownload size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <Typography variant="body" weight="bold" color="neutral">
              File mẫu nhập thành tích
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
            label="File Excel thành tích"
            value={field.value}
            accept=".xlsx,.xls"
            maxSizeMB={5}
            placeholder="Chọn file Excel để gửi lên hệ thống"
            error={errors.file?.message}
            isLoading={importMutation.isPending}
            onFileSelect={(file) => field.onChange(file || undefined)}
            onRemove={() => resetField("file")}
            required
          />
        )}
      />

      <Divide />
      <div className="flex justify-end gap-3 px-4">
        <Button
          variant="ghost"
          type="button"
          onClick={closeModal}
          isLoading={importMutation.isPending}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          type="submit"
          icon={HiOutlineUpload}
          disabled={!isDirty}
          isLoading={importMutation.isPending}
        >
          Tải lên
        </Button>
      </div>
    </form>
  );
}
