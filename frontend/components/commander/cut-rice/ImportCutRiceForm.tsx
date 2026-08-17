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
import { cutRiceService } from "@/services/cut-rice";
import { useModalStore } from "@/store/useModalStore";
import {
  batchExcelFileSchema,
  BatchExcelFileValues,
} from "@/utils/validations";
import { downloadBlob } from "@/utils/fn-common";

export default function ImportCutRiceForm() {
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
    mutationKey: [QUERY_KEYS.CUT_RICE, "template"],
    mutationFn: cutRiceService.downloadImportTemplate,
    successMessage: "Tải file mẫu thành công!",
    errorMessage: "Không thể tải file mẫu!",
    onSuccess: (blob) => downloadBlob(blob, "mau-nhap-lich-cat-com.xlsx"),
  });

  const importMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.CUT_RICE, "import"],
    mutationFn: (data: BatchExcelFileValues) =>
      cutRiceService.importExcel(data.file),
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE],
    successMessage: "Nhập lịch cắt cơm từ Excel thành công!",
    errorMessage: "Nhập lịch cắt cơm từ Excel thất bại!",
    onSuccess: () => closeModal(),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => importMutation.mutate(data))}
      className="flex max-h-[85vh] flex-col gap-6 pt-2 pb-4"
    >
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
      <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-800 dark:bg-primary-950/30">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-100 p-2 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
            <HiOutlineDownload size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <Typography variant="body" weight="bold" color="neutral">
              File mẫu nhập lịch cắt cơm
            </Typography>
            <Typography variant="caption" color="gray" className="mt-1 block">
              Đánh dấu x vào các bữa cần cắt, hệ thống tự cập nhật theo mã học viên
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
            label="File Excel lịch cắt cơm"
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

      </div>

      <div className="flex flex-col gap-4 px-4">
        <Divide className="w-full" />
        <div className="flex justify-end gap-3">
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
      </div>
    </form>
  );
}
