"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToastStore } from "@/store/useToastStore";
import { academicManagementService } from "@/services/academic-results/academic-management";
import Input from "@/library/Input";
import Button from "@/library/Button";

interface SubjectResultFormProps {
  semesterResultId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const schema = z.object({
  subjectCode: z.string().min(1, "Vui lòng nhập mã môn"),
  subjectName: z.string().min(1, "Vui lòng nhập tên môn"),
  credits: z.coerce.number().min(1, "Số tín chỉ phải lớn hơn 0"),
  letterGrade: z.string().min(1, "Vui lòng nhập điểm chữ"),
  gradePoint10: z.coerce.number().min(0, "Điểm phải >= 0").max(10, "Điểm phải <= 10"),
  gradePoint4: z.coerce.number().min(0, "Điểm phải >= 0").max(4, "Điểm phải <= 4"),
});

type FormData = z.infer<typeof schema>;

export default function SubjectResultForm({
  semesterResultId,
  onSuccess,
  onCancel,
}: SubjectResultFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      subjectCode: "",
      subjectName: "",
      credits: 3,
      letterGrade: "",
      gradePoint10: undefined,
      gradePoint4: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, semesterResultId };
      await academicManagementService.createSubjectResult(payload);
      addToast({ variant: "success", message: "Thêm điểm môn học thành công" });
      onSuccess();
    } catch (error: unknown) {
      addToast({ variant: "error", message: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Mã môn học"
          {...register("subjectCode")}
          error={errors.subjectCode?.message}
          placeholder="VD: IT3011"
        />
        <Input
          label="Tên môn học"
          {...register("subjectName")}
          error={errors.subjectName?.message}
          placeholder="VD: Mạng máy tính"
        />
        <Input
          label="Số tín chỉ"
          type="number"
          {...register("credits")}
          error={errors.credits?.message}
        />
        <Input
          label="Điểm hệ 10"
          type="number"
          step="0.1"
          {...register("gradePoint10")}
          error={errors.gradePoint10?.message}
        />
        <Input
          label="Điểm hệ 4"
          type="number"
          step="0.1"
          {...register("gradePoint4")}
          error={errors.gradePoint4?.message}
        />
        <Input
          label="Điểm chữ"
          {...register("letterGrade")}
          error={errors.letterGrade?.message}
          placeholder="VD: A, B+, C"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Thêm môn học
        </Button>
      </div>
    </form>
  );
}
