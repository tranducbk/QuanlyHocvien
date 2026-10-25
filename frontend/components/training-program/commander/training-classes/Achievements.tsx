"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import { QUERY_KEYS } from "@/constants/query-keys";
import useClientTableData from "@/hooks/useClientTableData";
import useAssignedClassCollection from "@/hooks/training-program/useAssignedClassCollection";
import { trainingClassRecordsService, type ClassAchievement } from "@/services/training-program/training-class-records";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { downloadBlob, formatDateTime, formatSemesterYear } from "@/utils/fn-common";
import AchievementToolbarActions from "@/components/achievements/commander/AchievementToolbarActions";
import AchievementEntry from "./AchievementEntry";

type AchievementRow = ClassAchievement & { classId: string; className: string };

const categories = { AWARD: "Khen thưởng", SCIENTIFIC_TOPIC: "Đề tài khoa học", SCIENTIFIC_INITIATIVE: "Sáng kiến khoa học" } as const;
const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matches = (row: AchievementRow, filters: Record<string, unknown>) => {
  const search = (field: string, value: string) => !filters[field] || normalize(value).includes(normalize(String(filters[field])));
  return (!filters.classId || row.classId === filters.classId)
    && search("student", `${row.student?.fullName ?? ""} ${row.student?.code ?? ""}`)
    && search("title", row.title)
    && (!filters.category || row.category === filters.category)
    && search("award", row.award ?? "")
    && search("schoolYear", row.schoolYear ?? "")
    && search("semester", row.semester ?? "")
    && search("unit", row.student?.unit ?? "")
    && search("year", row.year?.toString() ?? "");
};
const sortValue = (row: AchievementRow, field: string) => {
  switch (field) {
    case "student": return row.student?.fullName;
    case "category": return categories[row.category];
    case "year": return row.year;
    case "award": return row.award;
    case "schoolYear": return row.schoolYear;
    case "semester": return row.semester;
    case "unit": return row.student?.unit;
    case "className": return row.className;
    default: return row.title;
  }
};

export default function Achievements() {
  const records = useAssignedClassCollection<ClassAchievement>("achievements", trainingClassRecordsService.getAchievements);
  const { commanderId } = records;
  const { openConfirm, closeConfirm } = useConfirmStore();
  const { openModal } = useModalStore();
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const table = useClientTableData(records.rows, matches, sortValue);

  const remove = useMutation({
    mutationFn: (row: AchievementRow) => trainingClassRecordsService.deleteAchievement(row.classId, row.id),
    onSuccess: async () => { setMessage("Đã xóa thành tích."); await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId] }); },
    onError: () => setMessage("Không xóa được thành tích."),
  });
  const exportFile = useMutation({
    mutationFn: async () => {
      const classFilter = table.columnFilters.find((item) => item.id === "classId")?.value;
      const selectedClasses = classFilter ? records.assignedClasses.filter((item) => item.id === classFilter) : records.assignedClasses;
      const filters = Object.fromEntries(table.columnFilters.filter((item) => item.id !== "classId").map(({ id, value }) => [id, value]));
      for (const item of selectedClasses) {
        const blob = await trainingClassRecordsService.exportAchievements(item.id, filters);
        downloadBlob(blob, `bao-cao-thanh-tich-${item.code}.xlsx`);
      }
    },
    onError: () => setMessage("Không xuất được báo cáo thành tích."),
  });
  const openForm = useCallback((achievement?: AchievementRow) => {
    openModal({
      title: achievement ? "Cập nhật thành tích" : "Thêm thành tích",
      size: "lg",
      content: <AchievementEntry classes={records.assignedClasses} commanderId={commanderId} achievement={achievement} classId={achievement?.classId} />,
    });
  }, [openModal, records.assignedClasses, commanderId]);
  const columns = useMemo<ColumnDef<AchievementRow>[]>(() => [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "student", header: "Học viên", accessorFn: (row) => row.student?.fullName, cell: ({ row }) => <div className="min-w-44"><Typography variant="body" weight="semibold">{row.original.student?.fullName || "Không rõ học viên"}</Typography><Typography variant="caption" color="gray">{row.original.student?.code}</Typography></div> },
    { id: "title", header: "Thành tích", accessorKey: "title", cell: ({ row }) => <div className="min-w-[220px]"><Typography variant="body" weight="semibold" color="neutral">{row.original.title}</Typography><Typography variant="caption" color="gray" className="line-clamp-2 max-w-xs">{row.original.content || row.original.description || "Không có mô tả"}</Typography></div> },
    { id: "category", header: "Loại", accessorKey: "category", cell: ({ row }) => <Badge variant={row.original.category === "AWARD" ? "success" : "secondary"}>{categories[row.original.category]}</Badge> },
    { id: "award", header: "Danh hiệu", accessorKey: "award", cell: ({ row }) => <Badge variant={row.original.award ? "success" : "neutral"}>{row.original.award || "Chưa cập nhật"}</Badge> },
    { id: "schoolYear", header: "Năm học", accessorKey: "schoolYear", cell: ({ row }) => row.original.schoolYear || "—" },
    { id: "semester", header: "Học kỳ", accessorKey: "semester", cell: ({ row }) => formatSemesterYear(row.original.semester, row.original.schoolYear) },
    { id: "unit", header: "Đơn vị", accessorFn: (row) => row.student?.unit, cell: ({ row }) => row.original.student?.unit || "—" },
    { id: "year", header: "Năm", accessorKey: "year", cell: ({ row }) => row.original.year || "—" },
    { id: "updatedAt", header: "Cập nhật", accessorKey: "updatedAt", cell: ({ row }) => <Typography variant="caption" weight="semibold" color="gray" className="whitespace-nowrap">{formatDateTime(row.original.updatedAt)}</Typography> },
    { id: "actions", header: "Hành động", enableSorting: false, cell: ({ row }) => <div className="flex gap-1"><ActionButton tooltipText="Cập nhật" icon={HiOutlinePencil} onClick={() => openForm(row.original)} /><ActionButton tooltipText="Xóa thành tích" icon={HiOutlineTrash} color="red" onClick={() => openConfirm({ title: "Xóa thành tích", message: `Xóa thành tích “${row.original.title}”?`, variant: "danger", onConfirm: () => { closeConfirm(); remove.mutate(row.original); } })} /></div> },
  ], [openConfirm, closeConfirm, remove, openForm]);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...records.assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "text", id: "student", label: "Học viên", placeholder: "Tên hoặc mã học viên..." },
    { type: "text", id: "title", label: "Thành tích", placeholder: "Tên thành tích..." },
    { type: "select", id: "category", label: "Loại", options: [{ value: "", label: "Tất cả" }, ...Object.entries(categories).map(([value, label]) => ({ value, label }))] },
    { type: "text", id: "award", label: "Danh hiệu", placeholder: "Tên danh hiệu..." },
    { type: "text", id: "schoolYear", label: "Năm học", placeholder: "VD: 2025-2026" },
    { type: "text", id: "semester", label: "Học kỳ", placeholder: "VD: 1" },
    { type: "text", id: "unit", label: "Đơn vị", placeholder: "Tên đơn vị..." },
    { type: "text", id: "year", label: "Năm", placeholder: "VD: 2026" },
  ], [records.assignedClasses]);

  return (
    <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý thành tích" }]} title="Quản lý thành tích" subtitle="Theo dõi và ghi nhận thành tích học viên trong phạm vi quản lý." isError={records.isError} onRetry={records.refetch}>
      {message && <p role="status" className="text-sm text-primary-700">{message}</p>}
      {records.isLoading ? <p className="p-8 text-center">Đang tải thành tích...</p> : records.isError ? <p role="alert" className="p-8 text-center text-error-700">Không tải được thành tích. <button type="button" className="underline" onClick={() => { void records.refetch(); }}>Thử lại</button></p> : (
        <div className="relative overflow-hidden bg-white transition-colors dark:bg-neutral-950">
          <div className="px-4">
            <Table
              data={table.data}
              columns={columns}
              pagination={table.pagination}
              onPaginationChange={table.setPagination}
              columnFilters={table.columnFilters}
              onColumnFiltersChange={table.onColumnFiltersChange}
              sorting={table.sorting}
              onSortingChange={table.onSortingChange}
              filterFields={filterFields}
              emptyText="Không tìm thấy thành tích phù hợp"
              onAdd={records.assignedClasses.length ? () => openForm() : undefined}
              addLabel="Thêm thành tích"
              actions={
                <AchievementToolbarActions
                  onImport={() => openModal({
                    title: "Nhập thành tích từ Excel",
                    size: "md",
                    content: <AchievementEntry classes={records.assignedClasses} commanderId={commanderId} importMode />,
                  })}
                  onExport={() => exportFile.mutate()}
                  exporting={exportFile.isPending}
                />
              }
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
