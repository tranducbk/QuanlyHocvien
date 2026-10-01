"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryClassService } from "@/services/military-classes";

export default function MilitaryClassesPage() {
  const queryClient = useQueryClient();
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentCodes, setStudentCodes] = useState("");
  const classes = useQuery({ queryKey: [QUERY_KEYS.MILITARY_CLASSES], queryFn: militaryClassService.getAll });
  const students = useQuery({ queryKey: [QUERY_KEYS.MILITARY_CLASSES, selectedClassId, "students"], queryFn: () => militaryClassService.getStudents(selectedClassId), enabled: Boolean(selectedClassId) });
  const createClass = useMutation({
    mutationFn: militaryClassService.create,
    onSuccess: async () => {
      setClassName(""); setClassCode("");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_CLASSES] });
    },
  });
  const assign = useMutation({ mutationFn: () => militaryClassService.assignStudentsByCode(selectedClassId, studentCodes.split(/[\n,;]+/).map(code => code.trim()).filter(Boolean)), onSuccess: async () => { setStudentCodes(""); await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_CLASSES, selectedClassId, "students"] }); await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_CLASSES] }); } });
  const remove = useMutation({ mutationFn: (userId: string) => militaryClassService.removeStudent(selectedClassId, userId), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_CLASSES, selectedClassId, "students"] }); await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_CLASSES] }); } });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createClass.mutate({ className: className.trim(), classCode: classCode.trim() });
  };

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Lớp quân sự" }]} title="Quản lý lớp quân sự" subtitle="Quản lý học viên trực tiếp theo lớp quân sự." isLoading={classes.isLoading} isError={classes.isError} onRetry={() => void classes.refetch()}>
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-neutral-200 p-4 md:grid-cols-[1fr_1fr_auto]">
      <label className="grid gap-1 text-sm">Tên lớp<input required maxLength={255} value={className} onChange={event => setClassName(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /></label>
      <label className="grid gap-1 text-sm">Mã lớp<input required maxLength={50} value={classCode} onChange={event => setClassCode(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /></label>
      <button disabled={createClass.isPending} className="self-end rounded-lg bg-primary-600 px-5 py-2 font-semibold text-white disabled:opacity-50">{createClass.isPending ? "Đang lưu…" : "Thêm lớp"}</button>
      {createClass.isError && <p role="alert" className="text-sm text-red-600 md:col-span-3">Không thể tạo lớp. Hãy kiểm tra mã lớp đã tồn tại chưa.</p>}
    </form>
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full text-left text-sm"><thead className="bg-neutral-50 dark:bg-neutral-900"><tr><th className="p-3">Mã lớp</th><th className="p-3">Tên lớp</th><th className="p-3">Sĩ số</th></tr></thead>
        <tbody>{classes.data?.data?.map(item => <tr key={item.id} className="border-t"><td className="p-3">{item.classCode}</td><td className="p-3"><Typography variant="body" weight="semibold">{item.className}</Typography></td><td className="p-3">{item.studentCount}</td></tr>)}
          {!classes.data?.data?.length && <tr><td colSpan={3} className="p-5 text-center text-neutral-500">Chưa có lớp quân sự.</td></tr>}</tbody></table>
    </div>
    <section className="mt-6 space-y-3 rounded-xl border border-neutral-200 p-4">
      <h2 className="text-lg font-semibold">Xếp học viên theo mã</h2>
      <select value={selectedClassId} onChange={event => setSelectedClassId(event.target.value)} className="w-full rounded-lg border px-3 py-2 dark:bg-neutral-900"><option value="">Chọn lớp</option>{classes.data?.data?.map(item => <option key={item.id} value={item.id}>{item.classCode} · {item.className}</option>)}</select>
      <form onSubmit={event => { event.preventDefault(); assign.mutate(); }} className="grid gap-3 md:grid-cols-[1fr_auto]"><textarea required value={studentCodes} onChange={event => setStudentCodes(event.target.value)} placeholder="Nhập mã học viên, phân tách bằng dấu phẩy hoặc xuống dòng" className="min-h-20 rounded-lg border px-3 py-2 dark:bg-neutral-900" /><button disabled={!selectedClassId || assign.isPending} className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-white disabled:opacity-50">Xếp vào lớp</button>{assign.isError && <p role="alert" className="text-sm text-red-600 md:col-span-2">Không thể xếp học viên. Kiểm tra mã và hệ đào tạo.</p>}</form>
      {selectedClassId && <ul className="divide-y rounded-lg border">{students.data?.data?.map(profile => <li key={profile.id} className="flex items-center justify-between gap-3 p-3">{profile.code} · {profile.fullName || "Chưa có tên"}<button type="button" disabled={remove.isPending} onClick={() => { const userId = profile.User?.id || profile.user?.id; if (userId) remove.mutate(userId); }} className="text-sm text-red-600 disabled:opacity-50">Chuyển khỏi lớp</button></li>)}{!students.data?.data?.length && <li className="p-3 text-center text-neutral-500">Chưa xếp học viên.</li>}</ul>}
    </section>
  </PageContainer>;
}
