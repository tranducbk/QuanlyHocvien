"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Badge, { type BadgeVariant } from "@/library/Badge";
import Table from "@/library/Table";
import Tabs from "@/library/Tabs";
import PageContainer from "@/library/PageContainer";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import { QUERY_KEYS } from "@/constants/query-keys";
import useClientTableData from "@/hooks/useClientTableData";
import useAssignedClassCollection from "@/hooks/useAssignedClassCollection";
import { trainingClassAcademicService, type AcademicSummaryRow, type GradeResult } from "@/services/training-class-academic";
import { useModalStore } from "@/store/useModalStore";
import { downloadBlob } from "@/utils/fn-common";
import AcademicSummaryTable from "./AcademicSummaryTable";
import GradeEntry from "./GradeEntry";

type ResultRow = GradeResult & { classId: string; className: string };
type SummaryRow = AcademicSummaryRow & { classId: string; className: string };

const classificationLabel = { FAIL: "Không đạt", AVERAGE: "Trung bình", GOOD: "Khá", EXCELLENT: "Giỏi" } as const;
const classificationVariant: Record<GradeResult["classification"], BadgeVariant> = { FAIL: "error", AVERAGE: "warning", GOOD: "secondary", EXCELLENT: "success" };
const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matches = (row: ResultRow, filters: Record<string, unknown>) => {
  const search = (field: string, value: string) => !filters[field] || normalize(value).includes(normalize(String(filters[field])));
  return (!filters.classId || row.classId === filters.classId)
    && (!filters.schoolYear || row.trainingClassSemester?.schoolYear === filters.schoolYear)
    && (!filters.semesterCode || row.trainingClassSemester?.code === Number(filters.semesterCode))
    && search("student", `${row.profile?.fullName ?? ""} ${row.profile?.code ?? ""}`)
    && search("subject", `${row.trainingClassSubject?.subjectName ?? ""} ${row.trainingClassSubject?.subjectCode ?? ""}`)
    && (!filters.classification || row.classification === filters.classification)
    && (!filters.attemptNo || row.attemptNo === Number(filters.attemptNo));
};
const sortValue = (row: ResultRow, field: string) => {
  switch (field) {
    case "className": return row.className;
    case "student": return row.profile?.fullName;
    case "subject": return row.trainingClassSubject?.subjectName;
    case "semester": return `${row.trainingClassSemester?.schoolYear ?? ""}-${row.trainingClassSemester?.code ?? ""}`;
    case "attemptNo": return row.attemptNo;
    case "totalScore": return Number(row.totalScore);
    case "classification": return row.classification;
    default: return null;
  }
};

export default function AcademicResults() {
  const results = useAssignedClassCollection<GradeResult>("results", trainingClassAcademicService.getClassResults);
  const { commanderId, assignedClasses } = results;
  const openModal = useModalStore((state) => state.openModal);
  const [activeTab, setActiveTab] = useState("details");
  const summaryQueries = useQueries({ queries: assignedClasses.map((item) => ({
    queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, commanderId, item.id, "summary"],
    queryFn: () => trainingClassAcademicService.getClassSummary(item.id),
    enabled: activeTab !== "details",
  })) });
  const summaryRows = (view: "semesters" | "years"): SummaryRow[] => assignedClasses.flatMap((item, index) =>
    (summaryQueries[index]?.data?.data?.[view] ?? []).map((row) => ({ ...row, classId: item.id, className: item.name }))
  );
  const exportFile = useMutation({ mutationFn: async (filters: Record<string, unknown>) => {
    const classFilter = filters.classId;
    const params = Object.fromEntries(Object.entries(filters).filter(([key]) => key !== "classId"));
    for (const item of assignedClasses.filter((entry) => !classFilter || entry.id === classFilter)) {
      downloadBlob(await trainingClassAcademicService.exportYearlySummary(item.id, params), `bao-cao-ket-qua-${item.code}.xlsx`);
    }
  } });
  const table = useClientTableData(results.rows, matches, sortValue);

  const columns = useMemo<ColumnDef<ResultRow>[]>(() => [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "student", header: "Học viên", accessorFn: (row) => row.profile?.fullName, cell: ({ row }) => <div className="min-w-44"><Typography variant="body" weight="semibold">{row.original.profile?.fullName || "Không rõ học viên"}</Typography><Typography variant="caption" color="gray">{row.original.profile?.code}</Typography></div> },
    { id: "subject", header: "Môn học", accessorFn: (row) => row.trainingClassSubject?.subjectName, cell: ({ row }) => <div className="min-w-40"><Typography variant="body" weight="semibold">{row.original.trainingClassSubject?.subjectName || "Không rõ môn"}</Typography><Typography variant="caption" color="gray">{row.original.trainingClassSubject?.subjectCode}</Typography></div> },
    { id: "semester", header: "Học kỳ", accessorFn: (row) => row.trainingClassSemester?.schoolYear, cell: ({ row }) => row.original.trainingClassSemester ? `${row.original.trainingClassSemester.schoolYear} · HK ${row.original.trainingClassSemester.code}` : "—" },
    { id: "attemptNo", header: "Lần thi", accessorKey: "attemptNo" },
    { id: "midtermScore", header: "Giữa kỳ", accessorKey: "midtermScore", enableSorting: false },
    { id: "finalScore", header: "Cuối kỳ", accessorKey: "finalScore", enableSorting: false },
    { id: "totalScore", header: "Tổng", accessorKey: "totalScore", cell: ({ row }) => <span className="font-bold text-primary-700 dark:text-primary-300">{row.original.totalScore}{row.original.isBestAttempt && <span className="ml-2 text-xs">Cao nhất</span>}</span> },
    { id: "classification", header: "Xếp loại", accessorKey: "classification", cell: ({ row }) => <Badge variant={classificationVariant[row.original.classification]}>{classificationLabel[row.original.classification]}</Badge> },
  ], []);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "select", id: "schoolYear", label: "Năm học", options: [{ value: "", label: "Tất cả" }, ...[...new Set(results.rows.map((row) => row.trainingClassSemester?.schoolYear).filter((value): value is string => Boolean(value)))].map((value) => ({ value, label: value }))] },
    { type: "select", id: "semesterCode", label: "Học kỳ", options: [{ value: "", label: "Tất cả" }, ...[1, 2, 3, 4].map((value) => ({ value: String(value), label: `Học kỳ ${value}` }))] },
    { type: "text", id: "student", label: "Học viên", placeholder: "Tên hoặc mã học viên..." },
    { type: "text", id: "subject", label: "Môn học", placeholder: "Tên hoặc mã môn..." },
    { type: "number", id: "attemptNo", label: "Lần thi", placeholder: "VD: 1" },
    { type: "select", id: "classification", label: "Xếp loại", options: [{ value: "", label: "Tất cả" }, ...Object.entries(classificationLabel).map(([value, label]) => ({ value, label }))] },
  ], [assignedClasses, results.rows]);

  const summaryLoading = summaryQueries.some((query) => query.isLoading);
  const summaryError = summaryQueries.some((query) => query.isError);
  const tabs = [
    { id: "details", label: "Điểm môn học", content: results.isLoading ? <p className="p-8 text-center">Đang tải kết quả...</p> : results.isError ? <p role="alert" className="p-8 text-center text-error-700">Không tải được kết quả. <button type="button" className="underline" onClick={results.refetch}>Thử lại</button></p> : <Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Không tìm thấy kết quả học tập phù hợp" onAdd={assignedClasses.length ? () => openModal({ title: "Ghi điểm chính thức", size: "lg", content: <GradeEntry classes={assignedClasses} commanderId={commanderId} /> }) : undefined} addLabel="Ghi điểm" /> },
    { id: "semesters", label: "Theo học kỳ", content: summaryLoading ? <p className="p-8 text-center">Đang tải kết quả học kỳ...</p> : summaryError ? <p role="alert">Không tải được kết quả học kỳ.</p> : <AcademicSummaryTable rows={summaryRows("semesters")} semesterView classes={assignedClasses} /> },
    { id: "years", label: "Theo năm học", content: summaryLoading ? <p className="p-8 text-center">Đang tải kết quả năm...</p> : summaryError ? <p role="alert">Không tải được kết quả năm học.</p> : <><AcademicSummaryTable rows={summaryRows("years")} semesterView={false} classes={assignedClasses} onExport={(filters) => exportFile.mutate(filters)} exporting={exportFile.isPending} />{exportFile.isError && <p role="alert" className="text-sm text-error-700">Không xuất được báo cáo năm học.</p>}</> },
  ];

  return (
    <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý học tập" }]} title="Quản lý học tập" subtitle="Kết quả của tất cả học viên trong phạm vi quản lý." isError={results.isError} onRetry={results.refetch}>
      <div className="bg-white px-4 dark:bg-neutral-950"><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" /></div>
    </PageContainer>
  );
}
