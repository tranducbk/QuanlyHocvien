"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import useAssignedClassCollection from "@/hooks/training-program/useAssignedClassCollection";
import useClientTableData from "@/hooks/useClientTableData";
import { trainingClassService } from "@/services/training-program/training-classes";

type ClassSemester = { id: string; code: number; schoolYear: string; classId: string; className: string };
const matches = (row: ClassSemester, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId)
  && (!filters.schoolYear || row.schoolYear.includes(String(filters.schoolYear)))
  && (!filters.code || row.code === Number(filters.code));
const sortValue = (row: ClassSemester, field: string) => row[field as keyof ClassSemester];

export default function Semesters() {
  const collection = useAssignedClassCollection<Omit<ClassSemester, "classId" | "className">>("semesters", trainingClassService.getSemesters);
  const table = useClientTableData(collection.rows, matches, sortValue);
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

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Học kỳ" }]} title="Học kỳ" subtitle="Mỗi năm học có HK1 và HK2, được tạo tự động theo niên khóa của lớp." isError={collection.isError} onRetry={collection.refetch}>
    <p>Không cần tạo học kỳ thủ công. Ví dụ: niên khóa 2025–2029 có 4 năm học, tổng cộng 8 học kỳ.</p>
    {collection.assignedClasses.some((item) => item.startYear == null || item.endYear == null) && <p role="status">Có lớp chưa đủ năm bắt đầu/kết thúc. Hãy bổ sung thời gian của khóa/lớp để hệ thống tạo học kỳ.</p>}
    {collection.isLoading ? <p>Đang tải học kỳ...</p> : collection.isError ? <p role="alert">Không tải được học kỳ.</p> : <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có học kỳ phù hợp" /></div>}
  </PageContainer>;
}
