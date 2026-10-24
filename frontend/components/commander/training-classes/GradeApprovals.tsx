"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import { QUERY_KEYS } from "@/constants/query-keys";
import useAssignedClassCollection from "@/hooks/useAssignedClassCollection";
import useClientTableData from "@/hooks/useClientTableData";
import { trainingClassAcademicService, type GradeProposal } from "@/services/training-class-academic";
import { useConfirmStore } from "@/store/useConfirmStore";

const statusLabel = { PENDING: "Đang chờ", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối" };
const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matches = (row: GradeProposal, filters: Record<string, unknown>) =>
  (!filters.classId || (row as GradeProposal & { classId: string }).classId === filters.classId)
  && (!filters.student || normalize(`${row.profile?.fullName ?? ""} ${row.profile?.code ?? ""}`).includes(normalize(String(filters.student))))
  && (!filters.subject || normalize(row.trainingClassSubject?.subjectName ?? "").includes(normalize(String(filters.subject))))
  && (!filters.status || row.status === filters.status);
const sortValue = (row: GradeProposal, field: string) => {
  if (field === "student") return row.profile?.fullName;
  if (field === "subject") return row.trainingClassSubject?.subjectName;
  if (field === "status") return row.status;
  return null;
};

export default function GradeApprovals() {
  const collection = useAssignedClassCollection<GradeProposal>("proposals", trainingClassAcademicService.getClassProposals);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const client = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const table = useClientTableData(collection.rows, matches, sortValue);
  const review = useMutation({
    mutationFn: ({ id, classId, decision }: { id: string; classId: string; decision: "approve" | "reject" }) => trainingClassAcademicService.reviewProposal(classId, id, decision, reviewNotes[id]?.trim() || undefined),
    onSuccess: async () => {
      setMessage("Đã xử lý đề xuất.");
      await Promise.all([
        client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES] }),
        client.invalidateQueries({ queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC] }),
      ]);
    },
    onError: () => setMessage("Không xử lý được đề xuất. Điểm có thể đã được ghi hoặc đề xuất đã được xử lý."),
  });
  const columns = useMemo<ColumnDef<GradeProposal & { classId: string; className: string }>[]>(() => [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "student", header: "Học viên", accessorFn: (row) => row.profile?.fullName, cell: ({ row }) => <div><Typography variant="body" weight="semibold">{row.original.profile?.fullName || "—"}</Typography><Typography variant="caption" color="gray" className="block">{row.original.profile?.code || "—"}</Typography></div> },
    { id: "subject", header: "Môn học", accessorFn: (row) => row.trainingClassSubject?.subjectName, cell: ({ row }) => <div><Typography variant="body" weight="semibold">{row.original.trainingClassSubject?.subjectName || "—"}</Typography><Typography variant="caption" color="gray" className="block">{row.original.trainingClassSemester?.schoolYear} · HK {row.original.trainingClassSemester?.code}</Typography></div> },
    { id: "scores", header: "Điểm đề xuất", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap">Giữa kỳ {row.original.midtermScore} · Cuối kỳ {row.original.finalScore}</span> },
    { id: "reason", header: "Lý do", accessorKey: "reason", cell: ({ row }) => <span className="block max-w-60 break-words">{row.original.reason}</span> },
    { id: "status", header: "Trạng thái", accessorKey: "status", cell: ({ row }) => <Badge variant={row.original.status === "APPROVED" ? "success" : row.original.status === "PENDING" ? "warning" : "neutral"}>{statusLabel[row.original.status]}</Badge> },
    { id: "review", header: "Phản hồi và xử lý", enableSorting: false, cell: ({ row }) => {
      const item = row.original;
      return item.status === "PENDING" ? <div className="min-w-56 space-y-2"><input aria-label={`Phản hồi đề xuất của ${item.profile?.fullName || "học viên"}`} className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm dark:bg-neutral-900" maxLength={2000} value={reviewNotes[item.id] ?? ""} onChange={(event) => setReviewNotes((notes) => ({ ...notes, [item.id]: event.target.value }))} /><div className="flex gap-2"><button type="button" disabled={review.isPending} className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" onClick={() => openConfirm({ title: "Duyệt điểm", message: "Duyệt sẽ ghi điểm chính thức và không thể sửa hoặc xóa. Tiếp tục?", onConfirm: () => { closeConfirm(); review.mutate({ id: item.id, classId: item.classId, decision: "approve" }); } })}>Duyệt</button><button type="button" disabled={review.isPending} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50" onClick={() => review.mutate({ id: item.id, classId: item.classId, decision: "reject" })}>Từ chối</button></div></div> : <span className="block max-w-48 text-sm text-neutral-500">{item.reviewNote || "—"}</span>;
    } },
  ], [reviewNotes, review, openConfirm, closeConfirm]);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...collection.assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "text", id: "student", label: "Học viên", placeholder: "Tên hoặc mã học viên..." },
    { type: "text", id: "subject", label: "Môn học", placeholder: "Tên môn học..." },
    { type: "select", id: "status", label: "Trạng thái", options: [{ value: "", label: "Tất cả" }, ...Object.entries(statusLabel).map(([value, label]) => ({ value, label }))] },
  ], [collection.assignedClasses]);
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Phê duyệt đề xuất" }]} title="Phê duyệt đề xuất" subtitle="Duyệt đề xuất tạo điểm chính thức một lần; điểm đã ghi không thể sửa." isError={collection.isError} onRetry={collection.refetch}>
    {message && <p role="status" className="text-sm text-primary-700">{message}</p>}
    {collection.isLoading ? <p className="p-8 text-center">Đang tải đề xuất...</p> : collection.isError ? <p role="alert">Không tải được đề xuất.</p> : <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có đề xuất phù hợp" /></div>}
  </PageContainer>;
}
