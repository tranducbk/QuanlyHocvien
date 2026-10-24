"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Button from "@/library/Button";
import Input from "@/library/Input";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import useAssignedClassCollection from "@/hooks/useAssignedClassCollection";
import useClientTableData from "@/hooks/useClientTableData";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";

type Semester = { id: string; code: number; schoolYear: string };
type Subject = { id: string; subjectCode: string; subjectName: string; credits: number };
type SubjectRow = Subject & { classId: string; className: string; semesterId: string; semesterName: string };
const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matches = (row: SubjectRow, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId)
  && (!filters.semesterName || row.semesterName === filters.semesterName)
  && (!filters.subject || normalize(`${row.subjectName} ${row.subjectCode}`).includes(normalize(String(filters.subject))));
const sortValue = (row: SubjectRow, field: string) => row[field as keyof SubjectRow];

export default function Subjects() {
  const semesters = useAssignedClassCollection<Semester>("semesters", trainingClassService.getSemesters);
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [credits, setCredits] = useState(0);
  const [message, setMessage] = useState("");
  const client = useQueryClient();
  const pairs = semesters.rows.map((semester) => ({ ...semester, semesterName: `${semester.schoolYear} · HK ${semester.code}` }));
  const subjectQueries = useQueries({ queries: pairs.map((semester) => ({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, semesters.commanderId, semester.classId, semester.id, "subjects"],
    queryFn: () => trainingClassService.getSubjects(semester.classId, semester.id),
  })) });
  const rows: SubjectRow[] = pairs.flatMap((semester, index) => (subjectQueries[index]?.data?.data ?? []).map((subject) => ({
    ...subject, classId: semester.classId, className: semester.className, semesterId: semester.id, semesterName: semester.semesterName,
  })));
  const table = useClientTableData(rows, matches, sortValue);
  const create = useMutation({
    mutationFn: () => trainingClassService.createSubject(classId, semesterId, { subjectCode: subjectCode.trim(), subjectName: subjectName.trim(), credits }),
    onSuccess: async () => {
      setSubjectCode(""); setSubjectName(""); setCredits(0); setMessage("Đã thêm môn học.");
      await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, semesters.commanderId, classId, semesterId, "subjects"] });
    },
    onError: () => setMessage("Không thêm được môn học. Kiểm tra mã môn hoặc học kỳ."),
  });
  const columns = useMemo<ColumnDef<SubjectRow>[]>(() => [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "semesterName", header: "Học kỳ", accessorKey: "semesterName" },
    { id: "subjectCode", header: "Mã môn", accessorKey: "subjectCode" },
    { id: "subjectName", header: "Tên môn", accessorKey: "subjectName" },
    { id: "credits", header: "Tín chỉ", accessorKey: "credits" },
  ], []);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...semesters.assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "select", id: "semesterName", label: "Học kỳ", options: [{ value: "", label: "Tất cả học kỳ" }, ...[...new Set(pairs.map((item) => item.semesterName))].map((value) => ({ value, label: value }))] },
    { type: "text", id: "subject", label: "Môn học", placeholder: "Tên hoặc mã môn..." },
  ], [semesters.assignedClasses, pairs]);

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Môn học" }]} title="Môn học" subtitle="Danh sách môn của tất cả lớp trong phạm vi quản lý." isError={semesters.isError || subjectQueries.some((query) => query.isError)} onRetry={() => { semesters.refetch(); subjectQueries.forEach((query) => { void query.refetch(); }); }}>
    <form className="grid gap-4 rounded-2xl border border-neutral-100 p-5 shadow-sm dark:border-neutral-800 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); setMessage(""); create.mutate(); }}>
      <Select label="Lớp" placeholder="Chọn lớp để thêm môn" required value={classId} onChange={(value) => { setClassId(String(value)); setSemesterId(""); }} options={semesters.assignedClasses.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
      <Select label="Học kỳ" placeholder="Chọn học kỳ" required value={semesterId} onChange={(value) => setSemesterId(String(value))} disabled={!classId} options={pairs.filter((item) => item.classId === classId).map((item) => ({ value: item.id, label: item.semesterName }))} />
      <Input label="Mã môn" value={subjectCode} onChange={(event) => setSubjectCode(event.target.value)} maxLength={50} required />
      <Input label="Tên môn" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} maxLength={255} required />
      <Input label="Tín chỉ" type="number" min={0} max={100} value={credits} onChange={(event) => setCredits(Number(event.target.value))} required />
      <Button type="submit" isLoading={create.isPending} disabled={!semesterId}>Thêm môn</Button>
    </form>
    {message && <p role="status">{message}</p>}
    {semesters.isLoading || subjectQueries.some((query) => query.isLoading) ? <p>Đang tải môn học...</p> : <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có môn học phù hợp" /></div>}
  </PageContainer>;
}
