"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/library/Button";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { gradeRequestService } from "@/services/grade-requests";
import { useModalStore } from "@/store/useModalStore";
import { GradeRequest } from "@/types/student-academic";
import { formatDate, formatScore } from "@/utils/fn-common";

const rejectGradeRequestSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do từ chối")
    .max(500, "Lý do từ chối không được vượt quá 500 ký tự"),
});

type RejectGradeRequestFormValues = z.infer<typeof rejectGradeRequestSchema>;

interface RejectGradeRequestFormProps {
  request: GradeRequest;
}

export default function RejectGradeRequestForm({
  request,
}: RejectGradeRequestFormProps) {
  const { closeModal } = useModalStore();
  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.REJECT_GRADE_REQUEST,
    mutationFn: (reviewNote: string) =>
      gradeRequestService.rejectGradeRequest(request.id, { reviewNote }),
    invalidateQueryKey: [QUERY_KEYS.COMMANDER_GRADE_REQUESTS],
    successMessage: "Từ chối đề xuất thành công",
    errorMessage: "Từ chối đề xuất thất bại!",
    onSuccess: () => closeModal(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<RejectGradeRequestFormValues>({
    resolver: zodResolver(rejectGradeRequestSchema),
    defaultValues: {
      reviewNote: "",
    },
  });

  const submitHandler = (values: RejectGradeRequestFormValues) => {
    mutation.mutate(values.reviewNote);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5 pb-2">
      <div className="rounded-3xl border border-error-100 bg-error-50/70 p-4 dark:border-error-500/20 dark:bg-error-500/10">
        <Typography variant="label" color="error" className="mb-2">
          Từ chối đề xuất
        </Typography>
        <RequestSummary request={request} />
      </div>

      <StudentReason request={request} />

      <Textarea
        label="Lý do từ chối"
        placeholder="Nhập lý do từ chối đề xuất..."
        rows={4}
        maxLength={500}
        required
        disabled={mutation.isPending}
        error={errors.reviewNote?.message}
        {...register("reviewNote")}
      />

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={closeModal} disabled={mutation.isPending}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="danger"
          isLoading={mutation.isPending}
          disabled={!isDirty}
        >
          Từ chối
        </Button>
      </div>
    </form>
  );
}

function RequestSummary({ request }: { request: GradeRequest }) {
  return (
    <div className="grid gap-3 text-sm text-neutral-600 dark:text-neutral-300 sm:grid-cols-2">
      <div>
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">Môn học: </span>
        {request.subjectResult?.subjectName || "---"}
      </div>
      <div>
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">Ngày gửi: </span>
        {formatDate(request.createdAt)}
      </div>
      <div>
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">Điểm hiện tại: </span>
        {formatScore(request.subjectResult?.gradePoint10)}
      </div>
      <div>
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">Điểm đề xuất: </span>
        {formatScore(request.proposedGradePoint10)}
      </div>
    </div>
  );
}

function StudentReason({ request }: { request: GradeRequest }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <Typography variant="label" color="neutral" className="mb-2">
        Lý do của học viên
      </Typography>
      <Typography variant="body" color="gray">
        {request.reason || "Không có lý do"}
      </Typography>
    </div>
  );
}
