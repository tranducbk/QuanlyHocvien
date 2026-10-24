"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";
import { trainingClassRecordsService, type AchievementInput, type ClassAchievement } from "@/services/training-class-records";
import { useAuthStore } from "@/store/useAuthStore";
import { useConfirmStore } from "@/store/useConfirmStore";

const categories = { AWARD: "Khen thưởng", SCIENTIFIC_TOPIC: "Đề tài khoa học", SCIENTIFIC_INITIATIVE: "Sáng kiến khoa học" } as const;

export default function Achievements() {
  const commanderId = useAuthStore((state) => state.user?.id);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [studentUserId, setStudentUserId] = useState("");
  const [category, setCategory] = useState<ClassAchievement["category"]>("AWARD");
  const [title, setTitle] = useState("");
  const [award, setAward] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const key = [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "achievements"];
  const classes = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId], queryFn: trainingClassService.getMine, enabled: Boolean(commanderId) });
  const students = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "students"], queryFn: () => trainingClassService.getStudents(classId), enabled: Boolean(commanderId && classId) });
  const records = useQuery({ queryKey: key, queryFn: () => trainingClassRecordsService.getAchievements(classId), enabled: Boolean(commanderId && classId) });
  const reset = () => { setStudentUserId(""); setCategory("AWARD"); setTitle(""); setAward(""); setYear(""); setDescription(""); setEditingId(""); };
  const input = (): AchievementInput => ({ category, title: title.trim(), award: award.trim() || null, year: year ? Number(year) : null, description: description.trim() || null });
  const save = useMutation({
    mutationFn: () => editingId
      ? trainingClassRecordsService.updateAchievement(classId, editingId, input())
      : trainingClassRecordsService.createAchievement(classId, { ...input(), studentUserId }),
    onSuccess: async () => { reset(); setMessage("Đã lưu thành tích."); await client.invalidateQueries({ queryKey: key }); },
    onError: () => setMessage("Không lưu được thành tích. Kiểm tra học viên và thông tin nhập."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => trainingClassRecordsService.deleteAchievement(classId, id),
    onSuccess: async () => { setMessage("Đã xóa thành tích."); await client.invalidateQueries({ queryKey: key }); },
    onError: () => setMessage("Không xóa được thành tích."),
  });
  const edit = (row: ClassAchievement) => { setEditingId(row.id); setStudentUserId(row.studentUserId); setCategory(row.category); setTitle(row.title); setAward(row.award || ""); setYear(row.year?.toString() || ""); setDescription(row.description || ""); setMessage(""); };
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý thành tích" }]} title="Quản lý thành tích" subtitle="Thành tích của học viên trong lớp được giao." isError={classes.isError} onRetry={() => { void classes.refetch(); }}>
    <label>Lớp<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={classId} onChange={(event) => { setClassId(event.target.value); reset(); setMessage(""); }}><option value="">Chọn lớp</option>{(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
    {classId && <>
      <form className="grid gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setMessage(""); save.mutate(); }}>
        <label>Học viên<select className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" value={studentUserId} onChange={(event) => setStudentUserId(event.target.value)} disabled={Boolean(editingId)} required><option value="">Chọn học viên</option>{(students.data?.data ?? []).map((item) => <option key={item.id} value={item.userId}>{item.fullName} ({item.code})</option>)}</select></label>
        <label>Loại<select className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" value={category} onChange={(event) => setCategory(event.target.value as ClassAchievement["category"])}>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Tên thành tích<input className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required /></label>
        <label>Danh hiệu / giải thưởng<input className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" value={award} onChange={(event) => setAward(event.target.value)} maxLength={255} /></label>
        <label>Năm<input className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" type="number" min={1900} max={2200} value={year} onChange={(event) => setYear(event.target.value)} /></label>
        <label>Mô tả<textarea className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} /></label>
        <div className="flex items-end gap-2"><button className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={save.isPending}>{editingId ? "Lưu chỉnh sửa" : "Thêm thành tích"}</button>{editingId && <button type="button" className="rounded-lg border px-4 py-2" onClick={reset}>Hủy sửa</button>}</div>
      </form>
      {message && <p role="status">{message}</p>}
      {records.isLoading ? <p>Đang tải thành tích...</p> : records.isError ? <p className="text-red-600">Không tải được thành tích.</p> : <ul className="space-y-2">{(records.data?.data ?? []).map((row) => <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"><span>{row.student.fullName} ({row.student.code}) · {categories[row.category]} · {row.title}{row.year ? ` · ${row.year}` : ""}</span><span className="flex gap-3"><button type="button" className="text-primary-700" onClick={() => edit(row)}>Sửa</button><button type="button" className="text-red-600" onClick={() => openConfirm({ title: "Xóa thành tích", message: `Xóa thành tích “${row.title}”?`, variant: "danger", onConfirm: () => remove.mutate(row.id) })}>Xóa</button></span></li>)}</ul>}
    </>}
  </PageContainer>;
}
