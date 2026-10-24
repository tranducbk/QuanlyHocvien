"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";
import { useAuthStore } from "@/store/useAuthStore";

export default function Subjects() {
  const commanderId = useAuthStore((state) => state.user?.id);
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [credits, setCredits] = useState(0);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const classes = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId], queryFn: trainingClassService.getMine, enabled: Boolean(commanderId) });
  const semesters = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "semesters"],
    queryFn: () => trainingClassService.getSemesters(classId), enabled: Boolean(commanderId && classId),
  });
  const subjects = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, semesterId, "subjects"],
    queryFn: () => trainingClassService.getSubjects(classId, semesterId), enabled: Boolean(commanderId && classId && semesterId),
  });
  const create = useMutation({
    mutationFn: () => trainingClassService.createSubject(classId, semesterId, { subjectCode: subjectCode.trim(), subjectName: subjectName.trim(), credits }),
    onSuccess: async () => {
      setSubjectCode(""); setSubjectName(""); setCredits(0); setMessage("Đã thêm môn học.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, semesterId, "subjects"] });
    },
    onError: () => setMessage("Không thêm được môn học. Kiểm tra mã môn đã tồn tại hoặc phạm vi lớp."),
  });

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Môn học" }]} title="Môn học" subtitle="Chỉ huy nhập môn của học kỳ trong lớp được giao." isError={classes.isError} onRetry={() => { void classes.refetch(); }}>
    <div className="flex flex-wrap gap-3">
      <label>Lớp<select className="mt-1 block rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={classId} onChange={(event) => { setClassId(event.target.value); setSemesterId(""); setMessage(""); }}><option value="">Chọn lớp</option>{(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
      <label>Học kỳ<select className="mt-1 block rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={semesterId} onChange={(event) => { setSemesterId(event.target.value); setMessage(""); }} disabled={!classId}><option value="">Chọn học kỳ</option>{(semesters.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.schoolYear} · Học kỳ {item.code}</option>)}</select></label>
    </div>
    {semesterId && <>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setMessage(""); create.mutate(); }}>
        <label>Mã môn<input className="mt-1 block rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={subjectCode} onChange={(event) => setSubjectCode(event.target.value)} maxLength={50} required /></label>
        <label>Tên môn<input className="mt-1 block rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} maxLength={255} required /></label>
        <label>Tín chỉ<input className="mt-1 block w-24 rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" type="number" min={0} max={100} value={credits} onChange={(event) => setCredits(Number(event.target.value))} required /></label>
        <button className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={create.isPending}>Thêm môn</button>
      </form>
      {message && <p role="status">{message}</p>}
      {subjects.isLoading ? <p>Đang tải môn học...</p> : subjects.isError ? <p className="text-red-600">Không tải được môn học.</p> : <ul className="space-y-2">{(subjects.data?.data ?? []).map((item) => <li key={item.id} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">{item.subjectCode} · {item.subjectName} · {item.credits} tín chỉ</li>)}</ul>}
    </>}
  </PageContainer>;
}
