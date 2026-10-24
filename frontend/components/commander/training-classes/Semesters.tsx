"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

type ClassSemester = { id: string; code: number; schoolYear: string; classId: string; className: string };
const matches = (row: ClassSemester, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId)
  && (!filters.schoolYear || row.schoolYear.includes(String(filters.schoolYear)))
  && (!filters.code || row.code === Number(filters.code));
const sortValue = (row: ClassSemester, field: string) => row[field as keyof ClassSemester];

export default function Semesters() {
  const collection = useAssignedClassCollection<Omit<ClassSemester, "classId" | "className">>("semesters", trainingClassService.getSemesters);
  const [classId, setClassId] = useState("");
  const [code, setCode] = useState(1);
  const [schoolYear, setSchoolYear] = useState("");
  const [message, setMessage] = useState("");
  const client = useQueryClient();
  const table = useClientTableData(collection.rows, matches, sortValue);
  const create = useMutation({
    mutationFn: () => trainingClassService.createSemester(classId, { code, schoolYear: schoolYear.trim() }),
    onSuccess: async () => {
      setMessage("Đã tạo học kỳ.");
      await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, collection.commanderId, classId, "semesters"] });
    },
    onError: () => setMessage("Không tạo được học kỳ. Kiểm tra năm học và học kỳ trùng."),
  });
  const columns = useMemo<ColumnDef<ClassSemester>[]>(() => [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "schoolYear", header: "Năm học", accessorKey: "schoolYear" },
    { id: "code", header: "Học kỳ", accessorKey: "code", cell: ({ row }) => `Học kỳ ${row.original.code}` },
  ], []);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...collection.assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "text", id: "schoolYear", label: "Năm học", placeholder: "VD: 2026-2027" },
    { type: "select", id: "code", label: "Học kỳ", options: [{ value: "", label: "Tất cả" }, ...[1, 2, 3, 4].map((value) => ({ value: String(value), label: `Học kỳ ${value}` }))] },
  ], [collection.assignedClasses]);

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý học kỳ" }]} title="Quản lý học kỳ" subtitle="Học kỳ của tất cả lớp trong phạm vi quản lý." isError={collection.isError} onRetry={collection.refetch}>
    <form className="grid gap-4 rounded-2xl border border-neutral-100 p-5 shadow-sm dark:border-neutral-800 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); setMessage(""); create.mutate(); }}>
      <Select label="Lớp" placeholder="Chọn lớp để tạo học kỳ" required value={classId} onChange={(value) => setClassId(String(value))} options={collection.assignedClasses.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
      <Select label="Học kỳ" value={code} onChange={(value) => setCode(Number(value))} options={[1, 2, 3, 4].map((value) => ({ value, label: `Học kỳ ${value}` }))} />
      <Input label="Năm học" value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} placeholder="2026-2027" pattern="[0-9]{4}-[0-9]{4}" required />
      <Button type="submit" isLoading={create.isPending} disabled={!classId}>Tạo học kỳ</Button>
    </form>
    {message && <p role="status">{message}</p>}
    {collection.isLoading ? <p>Đang tải học kỳ...</p> : collection.isError ? <p role="alert">Không tải được học kỳ.</p> : <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có học kỳ phù hợp" /></div>}
  </PageContainer>;
}
