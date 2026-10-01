"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";

export default function MilitarySemestersPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("1");
  const [schoolYear, setSchoolYear] = useState("");
  const query = useQuery({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS], queryFn: militaryAcademicService.getSemesters });
  const create = useMutation({ mutationFn: militaryAcademicService.createSemester, onSuccess: async () => { setSchoolYear(""); await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS] }); } });
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ code: Number(code), schoolYear: schoolYear.trim() }); };
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Học kỳ quân sự" }]} title="Học kỳ quân sự" isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()}>
    <form onSubmit={submit} className="mb-5 grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_2fr_auto]">
      <label className="grid gap-1 text-sm">Học kỳ<select value={code} onChange={event => setCode(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900">{[1, 2, 3, 4].map(value => <option key={value} value={value}>Học kỳ {value}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Năm học<input required maxLength={50} placeholder="2026-2027" value={schoolYear} onChange={event => setSchoolYear(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /></label>
      <button disabled={create.isPending} className="self-end rounded-lg bg-primary-600 px-5 py-2 font-semibold text-white disabled:opacity-50">Thêm học kỳ</button>
      {create.isError && <p role="alert" className="text-sm text-red-600 md:col-span-3">Không thể tạo học kỳ này; học kỳ có thể đã tồn tại.</p>}
    </form>
    <ul className="divide-y rounded-xl border">{query.data?.data?.map(row => <li key={row.id} className="p-4">Năm học {row.schoolYear} · Học kỳ {row.code}</li>)}{!query.data?.data?.length && <li className="p-4 text-center text-neutral-500">Chưa có học kỳ.</li>}</ul>
  </PageContainer>;
}
