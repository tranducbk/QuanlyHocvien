"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "@/library/Select";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import type { TrainingClass } from "@/types/training-program/training-classes";
import ClassGradeForm from "./ClassGradeForm";

export default function GradeEntry({ classes, commanderId }: { classes: TrainingClass[]; commanderId?: string }) {
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const semesters = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "semesters"], queryFn: () => trainingClassService.getSemesters(classId), enabled: Boolean(classId) });
  const students = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "students"], queryFn: () => trainingClassService.getStudents(classId), enabled: Boolean(classId) });
  const subjects = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, semesterId, "subjects"], queryFn: () => trainingClassService.getSubjects(classId, semesterId), enabled: Boolean(classId && semesterId) });

  return <div className="space-y-4">
    <Select label="Lớp" placeholder="Chọn lớp của học viên" value={classId} onChange={(value) => { setClassId(String(value)); setSemesterId(""); }} options={classes.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
    {classId && <Select label="Học kỳ" placeholder="Chọn học kỳ" value={semesterId} onChange={(value) => setSemesterId(String(value))} isLoading={semesters.isLoading} options={(semesters.data?.data ?? []).map((item) => ({ value: item.id, label: `${item.schoolYear} · HK ${item.code}` }))} />}
    {semesterId && (students.isLoading || subjects.isLoading ? <p>Đang tải học viên và môn học...</p>
      : students.isError || subjects.isError ? <p role="alert">Không tải được học viên hoặc môn học.</p>
      : (students.data?.data?.length ?? 0) > 0 && (subjects.data?.data?.length ?? 0) > 0 ? <ClassGradeForm classId={classId} commanderId={commanderId} students={students.data?.data ?? []} subjects={subjects.data?.data ?? []} />
      : <p>Học kỳ này cần có học viên và môn học để ghi điểm.</p>)}
  </div>;
}
