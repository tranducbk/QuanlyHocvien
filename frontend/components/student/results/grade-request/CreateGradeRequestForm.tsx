"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import Button from "@/library/Button";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { gradeRequestService } from "@/services/grade-requests";
import { useModalStore } from "@/store/useModalStore";
import {
  CreateGradeRequestRequest,
  requestTypeMap,
  SubjectResult,
} from "@/types/student-academic";
import {
  createGradeRequestSchema,
  CreateGradeRequestFormValues,
} from "@/utils/validations";
import FileUpload from "@/library/FileUpload";
import { useState } from "react";
import { useToastStore } from "@/store/useToastStore";

interface CreateGradeRequestFormProps {
  subjects: SubjectResult[];
}

export default function CreateGradeRequestForm({
  subjects,
}: CreateGradeRequestFormProps) {
  const { closeModal } = useModalStore();
  const { addToast } = useToastStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: `${subject.subjectCode || "---"} - ${subject.subjectName || "Môn học"}`,
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateGradeRequestFormValues>({
    resolver: zodResolver(createGradeRequestSchema),
    defaultValues: {
      subjectResultId: "",
      requestType: "ADD",
      proposedGradePoint10: 0,
      reason: "",
    },
  });

  const selectedSubjectId = useWatch({ control, name: "subjectResultId" });
  const selectedSubject = subjects.find(
    (subject) => String(subject.id) === String(selectedSubjectId)
  );

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_STUDENT_GRADE_REQUEST,
    mutationFn: (data: CreateGradeRequestRequest) =>
      gradeRequestService.createGradeRequest(data),
    invalidateQueryKey: [QUERY_KEYS.STUDENT_GRADE_REQUESTS],
    successMessage: "Gửi đề xuất thành công!",
    errorMessage: "Gửi đề xuất thất bại!",
    onSuccess: () => closeModal(),
  });

  const onSubmit = async (values: CreateGradeRequestFormValues) => {
    let attachmentUrl = values.attachmentUrl;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const res = await gradeRequestService.uploadEvidence(selectedFile);
        if (res.data?.url) {
          attachmentUrl = res.data.url;
        }
      } catch (err: any) {
        setIsUploading(false);
        addToast({ message: err.message || "Lỗi khi tải minh chứng lên", variant: "error" });
        return;
      }
      setIsUploading(false);
    }
    mutation.mutate({ ...values, attachmentUrl });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-h-[85vh] flex-col pb-4"
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
        <div className="rounded-3xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
          <Typography variant="label" color="primary" className="mb-1">
            Môn học hiện tại
          </Typography>
          <Typography variant="body" weight="bold">
            {selectedSubject?.subjectName || "Chọn môn học cần đề xuất"}
          </Typography>
          {selectedSubject && (
            <Typography variant="body" color="gray" className="mt-1">
              Điểm hiện tại: {selectedSubject.letterGrade || "---"} ·{" "}
              {selectedSubject.gradePoint10 ?? "---"}/10 ·{" "}
              {selectedSubject.gradePoint4 ?? "---"}/4
            </Typography>
          )}
        </div>
        <Controller
          control={control}
          name="subjectResultId"
          render={({ field }) => (
            <Select
              label="Môn học"
              placeholder="Chọn môn học cần đề xuất"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={subjectOptions}
              error={errors.subjectResultId?.message}
              emptyText="Không có môn học"
              required
              filter={{
                enabled: true,
                mode: "client",
                placeholder: "Tìm môn học cần đề xuất chỉnh sửa",
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="requestType"
          render={({ field }) => (
            <Select
              label="Loại đề xuất"
              value={field.value}
              onChange={field.onChange}
              options={Object.entries(requestTypeMap).map(([value, label]) => ({
                value,
                label,
              }))}
              error={errors.requestType?.message}
              required
            />
          )}
        />

        <Input
          label="Điểm hệ 10"
          type="number"
          placeholder="VD: 8.7"
          error={errors.proposedGradePoint10?.message}
          {...register("proposedGradePoint10", { valueAsNumber: true })}
        />

        <FileUpload
          label="Minh chứng"
          accept="image/*,.pdf"
          maxSizeMB={5}
          placeholder="Tải lên ảnh hoặc PDF minh chứng (Tối đa 5MB)"
          onFileSelect={setSelectedFile}
          value={selectedFile}
          isLoading={isUploading}
        />

        <Textarea
          label="Lý do đề xuất"
          placeholder="Trình bày rõ lý do và căn cứ đề xuất chỉnh sửa kết quả..."
          rows={4}
          maxLength={500}
          error={errors.reason?.message}
          required
          {...register("reason")}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={closeModal}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={mutation.isPending || isUploading}
          disabled={subjects.length === 0 || !isDirty && !selectedFile}
        >
          Gửi đề xuất
        </Button>
      </div>
    </form>
  );
}
