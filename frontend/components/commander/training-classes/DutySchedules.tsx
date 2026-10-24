"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import Input from "@/library/Input";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import useAssignedClassCollection from "@/hooks/useAssignedClassCollection";
import useClientTableData from "@/hooks/useClientTableData";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";
import { trainingClassRecordsService, type ClassDuty } from "@/services/training-class-records";
import { useConfirmStore } from "@/store/useConfirmStore";

type DutyRow = ClassDuty & { classId: string; className: string };
const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matches = (row: DutyRow, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId)
  && (!filters.student || normalize(`${row.student.fullName} ${row.student.code}`).includes(normalize(String(filters.student))))
  && (!filters.position || normalize(row.position).includes(normalize(String(filters.position))))
  && (!filters.workDay || row.workDay.slice(0, 10) === String(filters.workDay));
const sortValue = (row: DutyRow, field: string) => field === "student" ? row.student.fullName : row[field as keyof DutyRow] as string;

export default function DutySchedules() {
  const duties = useAssignedClassCollection<ClassDuty>("duties", trainingClassRecordsService.getDuties);
  const students = useAssignedClassCollection<{ id: string; userId: string; code: string; fullName: string }>("students", trainingClassService.getStudents);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const client = useQueryClient();
  const [studentUserId, setStudentUserId] = useState("");
  const [position, setPosition] = useState("");
  const [workDay, setWorkDay] = useState("");
  const [editing, setEditing] = useState<DutyRow | null>(null);
  const [message, setMessage] = useState("");
  const classId = editing?.classId ?? students.rows.find((item) => item.userId === studentUserId)?.classId ?? "";
  const table = useClientTableData(duties.rows, matches, sortValue);
  const reset = () => { setStudentUserId(""); setPosition(""); setWorkDay(""); setEditing(null); };
  const save = useMutation({
    mutationFn: () => editing
      ? trainingClassRecordsService.updateDuty(classId, editing.id, { position: position.trim(), workDay })
      : trainingClassRecordsService.createDuty(classId, { studentUserId, position: position.trim(), workDay }),
    onSuccess: async () => { reset(); setMessage("Đã lưu lịch trực."); await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, duties.commanderId, classId, "duties"] }); },
    onError: () => setMessage("Không lưu được lịch trực. Kiểm tra học viên, ngày và phân công trùng."),
  });
  const remove = useMutation({
    mutationFn: (row: DutyRow) => trainingClassRecordsService.deleteDuty(row.classId, row.id),
    onSuccess: async () => { setMessage("Đã xóa lịch trực."); await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES] }); },
    onError: () => setMessage("Không xóa được lịch trực."),
  });
  const columns = useMemo<ColumnDef<DutyRow>[]>(() => [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "student", header: "Học viên", accessorFn: (row) => row.student.fullName, cell: ({ row }) => <div><Typography variant="body" weight="semibold">{row.original.student.fullName}</Typography><Typography variant="caption" color="gray" className="block">{row.original.student.code}</Typography></div> },
    { id: "position", header: "Nhiệm vụ", accessorKey: "position", cell: ({ row }) => <Badge variant="primary">{row.original.position}</Badge> },
    { id: "workDay", header: "Ngày trực", accessorKey: "workDay", cell: ({ row }) => row.original.workDay.slice(0, 10) },
    { id: "actions", header: "Hành động", enableSorting: false, cell: ({ row }) => <div className="flex gap-1"><ActionButton tooltipText="Sửa lịch trực" icon={HiOutlinePencil} onClick={() => { const item = row.original; setEditing(item); setStudentUserId(item.studentUserId); setPosition(item.position); setWorkDay(item.workDay.slice(0, 10)); setMessage(""); }} /><ActionButton tooltipText="Xóa lịch trực" icon={HiOutlineTrash} color="red" onClick={() => openConfirm({ title: "Xóa lịch trực", message: `Xóa lịch trực ngày ${row.original.workDay} của ${row.original.student.fullName}?`, variant: "danger", onConfirm: () => remove.mutate(row.original) })} /></div> },
  ], [openConfirm, remove]);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...duties.assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "text", id: "student", label: "Học viên", placeholder: "Tên hoặc mã học viên..." },
    { type: "text", id: "position", label: "Nhiệm vụ", placeholder: "Tên nhiệm vụ..." },
    { type: "date", id: "workDay", label: "Ngày trực" },
  ], [duties.assignedClasses]);

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Phân công lịch trực" }]} title="Phân công lịch trực" subtitle="Lịch trực của tất cả học viên trong phạm vi quản lý." isError={duties.isError || students.isError} onRetry={() => { duties.refetch(); students.refetch(); }}>
    <form className="grid gap-4 rounded-2xl border border-neutral-100 p-5 shadow-sm dark:border-neutral-800 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); if (!classId) { setMessage("Chọn học viên để phân công."); return; } setMessage(""); save.mutate(); }}>
      <Select label="Học viên" placeholder="Chọn học viên" required value={studentUserId} onChange={(value) => setStudentUserId(String(value))} disabled={Boolean(editing)} isLoading={students.isLoading} options={students.rows.map((item) => ({ value: item.userId, label: `${item.fullName} (${item.code}) · ${item.className}` }))} />
      <Input label="Nhiệm vụ" value={position} onChange={(event) => setPosition(event.target.value)} maxLength={100} required />
      <Input label="Ngày trực" type="date" value={workDay} onChange={(event) => setWorkDay(event.target.value)} required />
      <div className="flex flex-wrap gap-2 md:col-span-3"><Button type="submit" isLoading={save.isPending} disabled={!classId}>{editing ? "Lưu chỉnh sửa" : "Phân công"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Hủy sửa</Button>}</div>
    </form>
    {message && <p role="status">{message}</p>}
    {duties.isLoading ? <p>Đang tải lịch trực...</p> : <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có lịch trực phù hợp" /></div>}
  </PageContainer>;
}
