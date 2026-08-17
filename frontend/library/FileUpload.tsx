"use client";

import React, { useState, useRef } from "react";
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineX,
} from "react-icons/hi";
import Typography from "./Typography";

/** Các định dạng được phép: ảnh, PDF, Excel, Word (.docx) */
const ALLOWED_ACCEPT =
  "image/*,.pdf,.xlsx,.xls,.docx";

/** Phần mở rộng được phép (so khớp không phân biệt hoa thường) */
const ALLOWED_EXTENSIONS = ["pdf", "xlsx", "xls", "docx"];

/** Kiểm tra file có thuộc nhóm định dạng cho phép không */
const isAllowedFile = (file: File): boolean => {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.includes(ext);
};

interface FileUploadProps {
  /** Hàm callback khi file được chọn hoặc bị gỡ bỏ */
  onFileSelect: (file: File | null) => void;
  /** Các định dạng file chấp nhận (VD: .xlsx, .xls). Mặc định: ảnh, PDF, Excel, Word */
  accept?: string;
  /** Dung lượng tối đa cho phép (MB) */
  maxSizeMB?: number;
  /** Nhãn hiển thị phía trên khu vực tải file */
  label?: string;
  /** Văn bản hiển thị trong khu vực tải file khi trống */
  placeholder?: string;
  /** Thông báo lỗi hiển thị phía dưới */
  error?: string;
  /** Hiển thị dấu * bắt buộc */
  required?: boolean;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Trạng thái đang tải (vô hiệu hóa tương tác) */
  isLoading?: boolean;
  /** Hàm callback riêng khi gỡ bỏ file */
  onRemove?: () => void;
  /** Giá trị file hiện tại (Controlled) */
  value?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ALLOWED_ACCEPT,
  maxSizeMB = 5,
  label,
  placeholder = "Kéo thả file vào đây hoặc click để chọn",
  error,
  required,
  disabled,
  isLoading,
  onRemove,
  value,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isInteractionDisabled = disabled || isLoading;

  const handleFile = (file: File) => {
    if (isInteractionDisabled) return;
    if (!isAllowedFile(file)) {
      setTypeError("Định dạng không hợp lệ. Chỉ chấp nhận ảnh, PDF, Excel, Word.");
      onFileSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setTypeError(null);
    onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isInteractionDisabled) return;
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isInteractionDisabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInteractionDisabled) return;
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInteractionDisabled) return;
    setTypeError(null);
    onFileSelect(null);
    if (onRemove) onRemove();
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayError = error || typeError || undefined;

  return (
    <div className={`space-y-2 ${disabled ? "opacity-60" : ""}`}>
      {label && (
        <Typography variant="body" weight="semibold" className="ml-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      )}

      <div
        onClick={() => !isInteractionDisabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all
          flex flex-col items-center justify-center gap-3
          ${disabled ? "cursor-not-allowed bg-neutral-100 border-neutral-200" : "cursor-pointer"}
          ${!isInteractionDisabled && isDragging ? "border-primary-500 bg-primary-50/50" : ""}
          ${!isInteractionDisabled && !isDragging && !isLoading ? "border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-900/40 dark:bg-neutral-900/40" : ""}
          ${displayError ? "border-error-500! bg-error-50/10" : ""}
        `}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={onFileInputChange}
          accept={accept}
          className="hidden"
          disabled={isInteractionDisabled}
        />

        {value ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`p-4 rounded-xl ${disabled ? "bg-neutral-200 text-neutral-400" : "bg-green-50 text-green-600"}`}
            >
              <HiOutlineDocumentText size={40} />
            </div>
            <div className="text-center px-4">
              <Typography
                variant="body"
                weight="bold"
                className="block truncate max-w-62.5"
              >
                {value.name}
              </Typography>
              <Typography variant="caption" color="gray">
                {(value.size / 1024).toFixed(1)} KB
              </Typography>
            </div>
            {!isInteractionDisabled && (
              <button
                onClick={removeFile}
                className="cursor-pointer mt-2 flex items-center gap-1 text-error-500 hover:text-error-600 text-sm font-bold transition-colors"
              >
                <HiOutlineX size={16} />
                Gỡ bỏ file
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={`p-4 rounded-xl transition-colors ${
                disabled
                  ? "bg-neutral-200 text-neutral-400"
                  : isDragging
                    ? "bg-primary-100 text-primary-600"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              <HiOutlineCloudUpload size={40} />
            </div>
            <div className="text-center">
              <Typography
                variant="body"
                weight="semibold"
                className="text-neutral-600"
              >
                {isLoading ? "Đang xử lý file..." : placeholder}
              </Typography>
              {!isLoading && (
                <Typography
                  variant="caption"
                  color="gray"
                  className="block mt-1"
                >
                  Định dạng hỗ trợ: {accept || "Mọi định dạng"} (Tối đa{" "}
                  {maxSizeMB}MB)
                </Typography>
              )}
            </div>
          </>
        )}
      </div>

      {displayError && (
        <Typography variant="caption" color="error" className="ml-1">
          {displayError}
        </Typography>
      )}
    </div>
  );
};

export default FileUpload;
