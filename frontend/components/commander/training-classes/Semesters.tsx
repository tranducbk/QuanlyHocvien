"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";
import { useAuthStore } from "@/store/useAuthStore";

export default function Semesters() {
  const commanderId = useAuthStore((state) => state.user?.id);
  const [classId, setClassId] = useState("");
  const [code, setCode] = useState(1);
  const [schoolYear, setSchoolYear] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const classes = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    queryFn: trainingClassService.getMine,
    enabled: Boolean(commanderId),
  });
  const semesters = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "semesters"],
    queryFn: () => trainingClassService.getSemesters(classId),
    enabled: Boolean(commanderId && classId),
  });
  const create = useMutation({
    mutationFn: () => trainingClassService.createSemester(classId, { code, schoolYear: schoolYear.trim() }),
    onSuccess: async () => {
      setMessage("Đã tạo học kỳ.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "semesters"] });
    },
    onError: () => setMessage("Không tạo được học kỳ. Kiểm tra năm học và học kỳ trùng."),
  });
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý học kỳ" }]} title="Quản lý học kỳ" subtitle="Học kỳ thuộc lớp được giao trong Hệ của bạn." isError={classes.isError} onRetry={() => { void classes.refetch(); }}>
    <label className="block font-semibold">Lớp được giao</label>
    <select className="mt-2 rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={classId} onChange={(event) => { setClassId(event.target.value); setMessage(""); }}>
      <option value="">Chọn lớp</option>
      {(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
    </select>
    {classId && <>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setMessage(""); create.mutate(); }}>
        <label>Học kỳ<select className="mt-1 block rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={code} onChange={(event) => setCode(Number(event.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>Học kỳ {value}</option>)}</select></label>
        <label>Năm học<input className="mt-1 block rounded-lg border border-neutral-300 p-2 dark:bg-neutral-900" value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} placeholder="2026-2027" pattern="[0-9]{4}-[0-9]{4}" required /></label>
        <button className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={create.isPending}>Tạo học kỳ</button>
      </form>
      {message && <p role="status">{message}</p>}
      {semesters.isLoading ? <p>Đang tải học kỳ...</p> : semesters.isError ? <p className="text-red-600">Không tải được học kỳ.</p> : <ul className="space-y-2">{(semesters.data?.data ?? []).map((item) => <li key={item.id} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">Năm học {item.schoolYear} · Học kỳ {item.code}</li>)}</ul>}
    </>}
  </PageContainer>;
}
