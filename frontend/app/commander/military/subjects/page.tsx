"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { militaryClassService } from "@/services/military-classes";

export default function MilitarySubjectsPage() {
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [credits, setCredits] = useState("0");
  const classes = useQuery({ queryKey: [QUERY_KEYS.MILITARY_CLASSES], queryFn: militaryClassService.getAll });
  const semesters = useQuery({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS], queryFn: militaryAcademicService.getSemesters });
  const subjects = useQuery({ queryKey: [QUERY_KEYS.MILITARY_SUBJECTS, classId], queryFn: () => militaryAcademicService.getSubjects(classId), enabled: Boolean(classId) });
  const create = useMutation({ mutationFn: () => militaryAcademicService.createSubject(classId, { subjectCode: subjectCode.trim(), subjectName: subjectName.trim(), credits: Number(credits), semesterId }), onSuccess: async () => { setSubjectCode(""); setSubjectName(""); await client.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_SUBJECTS, classId] }); } });
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate(); };
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Môn quân sự" }]} title="Môn học quân sự" isLoading={classes.isLoading || semesters.isLoading} isError={classes.isError || semesters.isError} onRetry={() => { void classes.refetch(); void semesters.refetch(); }}>
    <div className="mb-4 grid gap-3 md:grid-cols-2"><label className="grid gap-1 text-sm">Lớp<select value={classId} onChange={event => setClassId(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900"><option value="">Chọn lớp</option>{classes.data?.data?.map(row => <option key={row.id} value={row.id}>{row.classCode} · {row.className}</option>)}</select></label><label className="grid gap-1 text-sm">Học kỳ<select value={semesterId} onChange={event => setSemesterId(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900"><option value="">Chọn học kỳ</option>{semesters.data?.data?.map(row => <option key={row.id} value={row.id}>{row.schoolYear} · Học kỳ {row.code}</option>)}</select></label></div>
    <form onSubmit={submit} className="mb-5 grid gap-3 rounded-xl border p-4 md:grid-cols-4"><input required placeholder="Mã môn" value={subjectCode} onChange={event => setSubjectCode(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><input required placeholder="Tên môn" value={subjectName} onChange={event => setSubjectName(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><input required type="number" min="0" placeholder="Tín chỉ" value={credits} onChange={event => setCredits(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><button disabled={!classId || !semesterId || create.isPending} className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Thêm môn</button>{create.isError && <p role="alert" className="text-sm text-red-600 md:col-span-4">Không thể thêm môn; kiểm tra dữ liệu và môn trùng mã.</p>}</form>
    <ul className="divide-y rounded-xl border">{subjects.data?.data?.map(row => <li key={row.id} className="p-4">{row.subjectCode} · {row.subjectName} · {row.credits} tín chỉ</li>)}{classId && !subjects.data?.data?.length && <li className="p-4 text-center text-neutral-500">Lớp chưa có môn học.</li>}</ul>
  </PageContainer>;
}
