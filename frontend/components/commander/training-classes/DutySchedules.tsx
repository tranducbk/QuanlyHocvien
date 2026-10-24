"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";
import { trainingClassRecordsService, type ClassDuty } from "@/services/training-class-records";
import { useAuthStore } from "@/store/useAuthStore";
import { useConfirmStore } from "@/store/useConfirmStore";

export default function DutySchedules() {
  const commanderId = useAuthStore((state) => state.user?.id);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [studentUserId, setStudentUserId] = useState("");
  const [position, setPosition] = useState("");
  const [workDay, setWorkDay] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const key = [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "duties"];
  const classes = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId], queryFn: trainingClassService.getMine, enabled: Boolean(commanderId) });
  const students = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "students"], queryFn: () => trainingClassService.getStudents(classId), enabled: Boolean(commanderId && classId) });
  const records = useQuery({ queryKey: key, queryFn: () => trainingClassRecordsService.getDuties(classId), enabled: Boolean(commanderId && classId) });
  const reset = () => { setStudentUserId(""); setPosition(""); setWorkDay(""); setEditingId(""); };
  const save = useMutation({
    mutationFn: () => editingId
      ? trainingClassRecordsService.updateDuty(classId, editingId, { position: position.trim(), workDay })
      : trainingClassRecordsService.createDuty(classId, { studentUserId, position: position.trim(), workDay }),
    onSuccess: async () => { reset(); setMessage("Đã lưu lịch trực."); await client.invalidateQueries({ queryKey: key }); },
    onError: () => setMessage("Không lưu được lịch trực. Kiểm tra học viên, ngày và phân công trùng."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => trainingClassRecordsService.deleteDuty(classId, id),
    onSuccess: async () => { setMessage("Đã xóa lịch trực."); await client.invalidateQueries({ queryKey: key }); },
    onError: () => setMessage("Không xóa được lịch trực."),
  });
  const edit = (row: ClassDuty) => { setEditingId(row.id); setStudentUserId(row.studentUserId); setPosition(row.position); setWorkDay(row.workDay); setMessage(""); };
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Phân công lịch trực" }]} title="Phân công lịch trực" subtitle="Lịch trực của học viên trong lớp được giao." isError={classes.isError} onRetry={() => { void classes.refetch(); }}>
    <label>Lớp<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={classId} onChange={(event) => { setClassId(event.target.value); reset(); setMessage(""); }}><option value="">Chọn lớp</option>{(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
    {classId && <>
      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800" onSubmit={(event) => { event.preventDefault(); setMessage(""); save.mutate(); }}>
        <label>Học viên<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={studentUserId} onChange={(event) => setStudentUserId(event.target.value)} disabled={Boolean(editingId)} required><option value="">Chọn học viên</option>{(students.data?.data ?? []).map((item) => <option key={item.id} value={item.userId}>{item.fullName} ({item.code})</option>)}</select></label>
        <label>Nhiệm vụ<input className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={position} onChange={(event) => setPosition(event.target.value)} maxLength={100} required /></label>
        <label>Ngày trực<input className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" type="date" value={workDay} onChange={(event) => setWorkDay(event.target.value)} required /></label>
        <button className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={save.isPending}>{editingId ? "Lưu chỉnh sửa" : "Phân công"}</button>
        {editingId && <button type="button" className="rounded-lg border px-4 py-2" onClick={reset}>Hủy sửa</button>}
      </form>
      {message && <p role="status">{message}</p>}
      {records.isLoading ? <p>Đang tải lịch trực...</p> : records.isError ? <p className="text-red-600">Không tải được lịch trực.</p> : <ul className="space-y-2">{(records.data?.data ?? []).map((row) => <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"><span>{row.workDay} · {row.student.fullName} ({row.student.code}) · {row.position}</span><span className="flex gap-3"><button type="button" className="text-primary-700" onClick={() => edit(row)}>Sửa</button><button type="button" className="text-red-600" onClick={() => openConfirm({ title: "Xóa lịch trực", message: `Xóa lịch trực ngày ${row.workDay} của ${row.student.fullName}?`, variant: "danger", onConfirm: () => remove.mutate(row.id) })}>Xóa</button></span></li>)}</ul>}
    </>}
  </PageContainer>;
}
