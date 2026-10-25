"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import Button from "@/library/Button";
import Badge from "@/library/Badge";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import useClientTableData from "@/hooks/useClientTableData";
import type { AcademicSummaryRow } from "@/services/academic-results/training-class-academic";
import type { TrainingClass } from "@/types/training-program/training-classes";
import { getAcademicClassification, getClassificationVariant } from "@/components/academic-results/commander/classification";

const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
type SummaryRow = AcademicSummaryRow & { classId?: string; className?: string };
const matches = (row: SummaryRow, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId)
  && (!filters.student || normalize(`${row.student.fullName} ${row.student.code}`).includes(normalize(String(filters.student))))
  && (!filters.unit || normalize(row.student.unit ?? "").includes(normalize(String(filters.unit))))
  && (!filters.schoolYear || row.schoolYear.includes(String(filters.schoolYear)))
  && (!filters.semester || row.semester === Number(filters.semester));
const sortValue = (row: SummaryRow, field: string) => {
  if (field === "className") return row.className;
  if (field === "student") return row.student.fullName;
  if (field === "unit") return row.student.unit;
  if (field === "schoolYear") return row.schoolYear;
  return row[field as keyof AcademicSummaryRow] as string | number | null;
};

export default function AcademicSummaryTable({ rows, semesterView, onExport, exporting, classes = [] }: {
  rows: SummaryRow[]; semesterView: boolean; onExport?: (filters: Record<string, unknown>) => void; exporting?: boolean; classes?: TrainingClass[];
}) {
  const table = useClientTableData(rows, matches, sortValue);
  const columns = useMemo<ColumnDef<SummaryRow>[]>(() => semesterView ? [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "studentCode", header: "Mã HV", enableSorting: false, accessorFn: (row) => row.student.code, cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.student.code}</Typography> },
    { id: "student", header: "Họ và tên", enableSorting: false, accessorFn: (row) => row.student.fullName, cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.student.fullName}</Typography> },
    { id: "unit", header: "Đại đội", enableSorting: false, accessorFn: (row) => row.student.unit, cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.student.unit || "—"}</Typography> },
    { id: "semester", header: "Học kỳ", accessorKey: "semester" },
    { id: "schoolYear", header: "Năm học", accessorKey: "schoolYear" },
    { id: "averageGrade10", header: "TBC (hệ 10)", accessorKey: "averageGrade10", cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.averageGrade10?.toFixed(2) ?? "—"}</Typography> },
    { id: "averageGrade4", header: "TBC (hệ 4)", accessorKey: "averageGrade4", cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.averageGrade4?.toFixed(2) ?? "—"}</Typography> },
  ] : [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "student", header: "Học viên", accessorFn: (row) => row.student.fullName, cell: ({ row }) => <div className="flex min-w-0 flex-col gap-0.5"><Typography variant="body" weight="semibold" color="neutral" className="truncate">{row.original.student.fullName}</Typography><span className="truncate text-xs font-medium text-neutral-400">{row.original.student.code}</span></div> },
    { id: "schoolYear", header: "Năm học", accessorKey: "schoolYear" },
    { id: "averageGrade10", header: "GPA 10", accessorKey: "averageGrade10", cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.averageGrade10?.toFixed(2) ?? "—"}</Typography> },
    { id: "averageGrade4", header: "GPA 4", accessorKey: "averageGrade4", cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.averageGrade4?.toFixed(2) ?? "—"}</Typography> },
    { id: "cumulativeCredits", header: "TC tích lũy", accessorKey: "cumulativeCredits" },
    { id: "classification", header: "Xếp loại", enableSorting: false, accessorFn: (row) => getAcademicClassification(row.averageGrade10), cell: ({ row }) => { const label = getAcademicClassification(row.original.averageGrade10); return <Badge variant={getClassificationVariant(label)}>{label || "—"}</Badge>; } },
  ], [semesterView]);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...classes.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "text", id: "student", label: "Học viên", placeholder: "Tên hoặc mã học viên..." },
    { type: "text", id: "unit", label: "Đơn vị", placeholder: "Tên đơn vị..." },
    { type: "select", id: "schoolYear", label: "Năm học", placeholder: "Chọn năm học...", options: [{ value: "", label: "Tất cả" }, ...[...new Set(rows.map((row) => row.schoolYear))].map((value) => ({ value, label: value }))] },
    ...(semesterView ? [{ type: "select", id: "semester", label: "Học kỳ", options: [{ value: "", label: "Tất cả" }, ...[1, 2, 3, 4].map((value) => ({ value: String(value), label: `Học kỳ ${value}` }))] } as FilterField] : []),
  ], [semesterView, rows, classes]);
  return <Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có kết quả tổng hợp" showIndex={semesterView} showVisibilityToggle={semesterView} enableColumnOrdering={semesterView} actions={onExport ? <Button variant="outline" size="sm" icon={HiOutlineDocumentDownload} onClick={() => onExport(Object.fromEntries(table.columnFilters.map(({ id, value }) => [id, value])))} isLoading={exporting}>Xuất Excel</Button> : undefined} />;
}
