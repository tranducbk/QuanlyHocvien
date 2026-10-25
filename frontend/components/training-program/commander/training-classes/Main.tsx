"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineUserGroup, HiOutlineViewGrid } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import { QUERY_KEYS } from "@/constants/query-keys";
import useClientTableData from "@/hooks/useClientTableData";
import { trainingClassService } from "@/services/training-program/training-classes";
import { useAuthStore } from "@/store/useAuthStore";
import type { TrainingClass } from "@/types/training-program/training-classes";
import { StatCard, type DashboardTone } from "../../../reports/commander/DashboardParts";

const systemNames: Record<string, string> = {
  HE_1: "Hệ 1",
  HE_3: "Hệ 3",
  HE_4: "Hệ 4",
  HE_7: "Hệ 7",
};

export default function Main({ systemCode, view }: { systemCode: string; view: "overview" | "classes" }) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const queryClient = useQueryClient();
  const commanderId = useAuthStore((state) => state.user?.id);
  const classesQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    queryFn: trainingClassService.getMine,
    enabled: Boolean(commanderId),
  });
  const classes = classesQuery.data?.data ?? [];
  const systemName = systemNames[systemCode] ?? "Hệ đào tạo";
  const isOverview = view === "overview";
  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, selectedClassId, "students"],
    queryFn: () => trainingClassService.getStudents(selectedClassId),
    enabled: Boolean(commanderId && selectedClassId),
  });
  const assignStudent = useMutation({
    mutationFn: () => trainingClassService.assignStudent(selectedClassId, studentCode.trim()),
    onSuccess: async () => {
      setStudentCode("");
      setAssignmentMessage("Đã xếp học viên vào lớp.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, selectedClassId, "students"] });
    },
    onError: () => setAssignmentMessage("Không xếp được học viên. Kiểm tra mã học viên, Hệ và Chỉ huy quản lý."),
  });

  return (
    <PageContainer
      breadcrumb={isOverview ? [{ label: "Tổng quan" }] : [{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý lớp học" }]}
      title={isOverview ? `Tổng quan ${systemName}` : `Quản lý lớp học · ${systemName}`}
      subtitle={isOverview ? "Lớp đào tạo thuộc phạm vi Chỉ huy của bạn." : "Danh sách lớp do Admin phân công cho tài khoản Chỉ huy hiện tại."}
      isError={classesQuery.isError}
      onRetry={() => { void classesQuery.refetch(); }}
      className="space-y-8"
    >
      {isOverview ? (
        <TrainingClassOverview classes={classes} isLoading={!commanderId || classesQuery.isLoading} />
      ) : <section className="space-y-6">
        {!commanderId || classesQuery.isLoading ? <p>Đang tải lớp...</p> : (
          <TrainingClassesTable classes={classes} onSelectClass={(id) => { setSelectedClassId(id); setAssignmentMessage(""); }} />
        )}
        {selectedClassId && (
          <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
            <Typography variant="h3" weight="bold">Học viên trong lớp {classes.find((item) => item.id === selectedClassId)?.name}</Typography>
            <form className="mt-4 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); setAssignmentMessage(""); if (studentCode.trim()) assignStudent.mutate(); }}>
              <input className="rounded-lg border border-neutral-300 px-3 py-2 dark:bg-neutral-900" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} placeholder="Mã học viên đang quản lý" aria-label="Mã học viên" required />
              <button className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={assignStudent.isPending}>Xếp vào lớp</button>
            </form>
            {assignmentMessage && <p className="mt-2 text-sm" role="status">{assignmentMessage}</p>}
            {studentsQuery.isLoading ? <p className="mt-4">Đang tải học viên...</p> : studentsQuery.isError ? <p className="mt-4 text-red-600">Không tải được danh sách học viên.</p> : (
              (studentsQuery.data?.data ?? []).length === 0 ? <p className="mt-4 text-neutral-500">Lớp chưa có học viên.</p> :
              <ul className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">{(studentsQuery.data?.data ?? []).map((student) => <li className="py-2" key={student.id}>{student.fullName} <span className="text-neutral-500">({student.code})</span></li>)}</ul>
            )}
          </section>
        )}
      </section>}
    </PageContainer>
  );
}

const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matchesClass = (row: TrainingClass, filters: Record<string, unknown>) =>
  (!filters.name || normalize(`${row.name} ${row.code}`).includes(normalize(String(filters.name))))
  && (!filters.trainingProgramName || row.trainingProgramName === filters.trainingProgramName)
  && (!filters.status || row.status === filters.status);
const classSortValue = (row: TrainingClass, field: string) => {
  if (field === "years") return row.startYear;
  return row[field as keyof TrainingClass] as string | number | null;
};

function TrainingClassesTable({ classes, onSelectClass }: { classes: TrainingClass[]; onSelectClass: (id: string) => void }) {
  const table = useClientTableData(classes, matchesClass, classSortValue);
  const columns = useMemo<ColumnDef<TrainingClass>[]>(() => [
    { id: "name", header: "Tên lớp", accessorKey: "name", cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.name}</Typography> },
    { id: "code", header: "Mã lớp", accessorKey: "code", cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.code}</Typography> },
    { id: "trainingProgramName", header: "Chương trình đào tạo", accessorKey: "trainingProgramName", cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.trainingProgramName || "—"}</Typography> },
    { id: "curriculumVersionName", header: "Phiên bản", accessorKey: "curriculumVersionName", cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.curriculumVersionName || "—"}</Typography> },
    { id: "years", header: "Niên khóa", accessorFn: (row) => row.startYear, cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.startYear != null ? `${row.original.startYear}${row.original.endYear != null ? `–${row.original.endYear}` : ""}` : "—"}</Typography> },
    { id: "status", header: "Trạng thái", accessorKey: "status", cell: ({ row }) => <Badge variant={row.original.status === "ACTIVE" ? "success" : "neutral"}>{row.original.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge> },
    { id: "actions", header: "Hành động", enableSorting: false, cell: ({ row }) => <ActionButton tooltipText="Xem và xếp học viên" icon={HiOutlineUserGroup} onClick={() => onSelectClass(row.original.id)} color="secondary" /> },
  ], [onSelectClass]);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "text", id: "name", label: "Tên hoặc mã lớp", placeholder: "Nhập tên hoặc mã lớp..." },
    { type: "select", id: "trainingProgramName", label: "Chương trình đào tạo", options: [{ value: "", label: "Tất cả chương trình" }, ...[...new Set(classes.map((item) => item.trainingProgramName).filter((name): name is string => Boolean(name)))].map((name) => ({ value: name, label: name }))] },
    { type: "select", id: "status", label: "Trạng thái", options: [{ value: "", label: "Tất cả trạng thái" }, { value: "ACTIVE", label: "Đang hoạt động" }, { value: "INACTIVE", label: "Ngừng hoạt động" }] },
  ], [classes]);

  return <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Không tìm thấy lớp học nào phù hợp" /></div>;
}

function TrainingClassOverview({ classes, isLoading }: { classes: TrainingClass[]; isLoading: boolean }) {
  const activeCount = classes.filter((item) => item.status === "ACTIVE").length;
  const stats = [
    { label: "Lớp quản lý", value: classes.length, helper: "Lớp trong phạm vi quản lý", icon: HiOutlineViewGrid, tone: "primary" },
    { label: "Đang hoạt động", value: activeCount, helper: "Lớp đang hoạt động", icon: HiOutlineCheckCircle, tone: "success" },
    { label: "Ngừng hoạt động", value: classes.length - activeCount, helper: "Lớp không còn hoạt động", icon: HiOutlineAcademicCap, tone: "neutral" },
  ] satisfies Array<{ label: string; value: number; helper: string; icon: typeof HiOutlineViewGrid; tone: DashboardTone }>;

  return <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {stats.map((item) => (
      <StatCard key={item.label} {...item} value={isLoading ? "…" : item.value.toLocaleString("vi-VN")} href="/commander/training-classes" />
    ))}
  </section>;
}
