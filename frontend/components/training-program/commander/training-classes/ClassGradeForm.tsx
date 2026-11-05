"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Input from "@/library/Input";
import Select from "@/library/Select";
import { QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import { trainingClassAcademicService } from "@/services/academic-results/training-class-academic";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";

type Student = { id: string; code: string; fullName: string };
type Subject = { id: string; subjectCode: string; subjectName: string };

export default function ClassGradeForm({ classId, commanderId, students, subjects, closed = false }: { classId: string; commanderId?: string; students: Student[]; subjects: Subject[]; closed?: boolean }) {
  const closeModal = useModalStore((state) => state.closeModal);
  const queryClient = useQueryClient();
  const { openConfirm, closeConfirm } = useConfirmStore();
  const [profileId, setProfileId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [attemptNo, setAttemptNo] = useState("1");
  const [midtermScore, setMidtermScore] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [reason, setReason] = useState("");
  const save = useAppMutation({
    mutationFn: () => trainingClassAcademicService.createResult(classId, {
      profileId, subjectId, attemptNo: Number(attemptNo), midtermScore: Number(midtermScore), finalScore: Number(finalScore), reason: reason.trim(),
    }),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, commanderId, classId],
    successMessage: "Đã ghi điểm chính thức.",
    errorMessage: "Không ghi được điểm. Kiểm tra học viên, môn, lần thi hoặc đề xuất đang chờ.",
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "results"] });
      closeModal();
    },
  });

  return (
    <form className="flex max-h-[85vh] flex-col gap-5 pb-4 pt-2" onSubmit={(event) => {
      event.preventDefault();
      if (!profileId || !subjectId) return;
      openConfirm({ title: "Ghi điểm chính thức", message: "Điểm được lưu chính thức cùng lịch sử. Sau chốt học kỳ, sửa hoặc bổ sung điểm bắt buộc lý do. Tiếp tục?", onConfirm: () => { closeConfirm(); save.mutate(); } });
    }}>
      <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Giữa kỳ 50% · Cuối kỳ 50%. {closed ? "Học kỳ đã chốt: bổ sung điểm bắt buộc có lý do." : "Chỉ huy được sửa điểm; mọi lần sửa đều lưu lịch sử."}</p>
        <Select label="Học viên" placeholder="Chọn học viên" required value={profileId} onChange={(value) => setProfileId(String(value))} options={students.map((student) => ({ value: student.id, label: `${student.fullName} - ${student.code}` }))} filter={{ enabled: true, mode: "client", placeholder: "Tìm học viên..." }} />
        <Select label="Môn học" placeholder="Chọn môn học" required value={subjectId} onChange={(value) => setSubjectId(String(value))} options={subjects.map((subject) => ({ value: subject.id, label: `${subject.subjectName} - ${subject.subjectCode}` }))} filter={{ enabled: true, mode: "client", placeholder: "Tìm môn học..." }} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Lần thi" type="number" min={1} max={20} required value={attemptNo} onChange={(event) => setAttemptNo(event.target.value)} />
          <Input label="Giữa kỳ" type="number" min={0} max={10} step="0.01" required value={midtermScore} onChange={(event) => setMidtermScore(event.target.value)} />
          <Input label="Cuối kỳ" type="number" min={0} max={10} step="0.01" required value={finalScore} onChange={(event) => setFinalScore(event.target.value)} />
        </div>
      </div>
      <Input label={closed ? "Lý do bổ sung sau chốt" : "Lý do ghi nhận (nếu có)"} required={closed} minLength={closed ? 5 : undefined} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} />
      <div className="flex flex-col gap-4 px-4">
        <Divide className="w-full" />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={closeModal} disabled={save.isPending}>Hủy bỏ</Button>
          <Button type="submit" variant="primary" isLoading={save.isPending} disabled={!profileId || !subjectId || !midtermScore || !finalScore || (closed && reason.trim().length < 5)}>Ghi điểm chính thức</Button>
        </div>
      </div>
    </form>
  );
}
