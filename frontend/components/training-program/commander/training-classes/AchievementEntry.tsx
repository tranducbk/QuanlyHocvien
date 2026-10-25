"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "@/library/Select";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import type { ClassAchievement } from "@/services/training-program/training-class-records";
import type { TrainingClass } from "@/types/training-program/training-classes";
import AchievementForm from "@/components/achievements/commander/AchievementForm";
import ImportAchievementsForm from "@/components/achievements/commander/ImportAchievementsForm";

export default function AchievementEntry({ classes, commanderId, achievement, classId: presetClassId, importMode = false }: {
  classes: TrainingClass[];
  commanderId?: string;
  achievement?: ClassAchievement;
  classId?: string;
  importMode?: boolean;
}) {
  const [chosenClassId, setChosenClassId] = useState("");
  const classId = presetClassId ?? chosenClassId;
  const students = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "students"], queryFn: () => trainingClassService.getStudents(classId), enabled: Boolean(classId) });
  const semesters = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "semesters"], queryFn: () => trainingClassService.getSemesters(classId), enabled: Boolean(classId && !importMode) });

  return <div className="space-y-4">
    {!presetClassId && <Select label="Lớp" placeholder="Chọn lớp" value={classId} onChange={(value) => setChosenClassId(String(value))} options={classes.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />}
    {classId && (importMode
      ? <ImportAchievementsForm classContext={{ classId, commanderId }} />
      : students.isLoading || semesters.isLoading ? <p>Đang tải học viên và học kỳ...</p>
      : students.isError || semesters.isError ? <p role="alert">Không tải được học viên hoặc học kỳ.</p>
      : <AchievementForm classContext={{ classId, commanderId, students: students.data?.data ?? [], semesters: semesters.data?.data ?? [] }} classAchievement={achievement} />)}
  </div>;
}
