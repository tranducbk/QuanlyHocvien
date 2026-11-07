"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import useAppMutation from "@/hooks/useAppMutation";
import { QUERY_KEYS } from "@/constants/query-keys";
import { universityService } from "@/services/training-program/universities";
import { useModalStore } from "@/store/useModalStore";
import type { University, UniversityStudent, UniversityStudentQuery } from "@/types/training-program/universities";

const filterFields: FilterField[] = [
  { type: "text", id: "fullName", label: "Họ tên", placeholder: "Nhập họ tên" },
  { type: "text", id: "code", label: "Mã học viên", placeholder: "Nhập mã học viên" },
  { type: "select", id: "gender", label: "Giới tính", options: [
    { value: "MALE", label: "Nam" }, { value: "FEMALE", label: "Nữ" },
  ] },
];

export default function AddUniversityStudents({ university }: { university: University }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, UniversityStudent>>({});
  const queryClient = useQueryClient();
  const closeModal = useModalStore((state) => state.closeModal);
  const fetchData = useCallback((params: UniversityStudentQuery) =>
    universityService.getAvailableStudents(university.id, { ...params, search: debouncedSearch }),
  [university.id, debouncedSearch]);
  const table = useTableQuery<UniversityStudent, UniversityStudentQuery>({
    queryKey: [QUERY_KEYS.UNIVERSITIES, university.id, "available-students", debouncedSearch], fetchData,
  });
  const { setPagination } = table;
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setPagination]);

  const mutation = useAppMutation({
    mutationKey: [QUERY_KEYS.UNIVERSITIES, "add-students"],
    mutationFn: (ids: string[]) => universityService.addStudents(university.id, ids),
    successMessage: "Đã thêm học viên vào trường",
    onSuccess: async () => {
      await Promise.all([QUERY_KEYS.UNIVERSITIES, QUERY_KEYS.UNIVERSITY_HIERARCHY, QUERY_KEYS.STUDENT_PROFILES, QUERY_KEYS.HE5_PLACEMENT]
        .map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
      closeModal();
    },
    onError: () => { void table.refetch(); },
  });
  const columns = useMemo<ColumnDef<UniversityStudent>[]>(() => [
    { id: "select", header: "Chọn", size: 65, enableSorting: false, enableHiding: false,
      cell: ({ row }) => <input type="checkbox" aria-label={`Chọn ${row.original.fullName}`}
        checked={!!selected[row.original.id]} disabled={mutation.isPending}
        className="h-4 w-4 accent-primary-600"
        onChange={(event) => setSelected((previous) => {
          const next = { ...previous };
          if (event.target.checked) next[row.original.id] = row.original;
          else delete next[row.original.id];
          return next;
        })} /> },
    { accessorKey: "code", header: "Mã học viên" },
    { accessorKey: "fullName", header: "Họ tên" },
    { accessorKey: "gender", header: "Giới tính", cell: ({ row }) =>
      row.original.gender === "MALE" ? "Nam" : row.original.gender === "FEMALE" ? "Nữ" : "—" },
  ], [selected, mutation.isPending]);
  const count = Object.keys(selected).length;

  return <div className="space-y-4 py-2">
    <Input label="Tìm học viên" placeholder="Nhập tên hoặc mã học viên chưa có trường"
      value={search} onChange={(event) => setSearch(event.target.value)} />
    {count > 0 && <div className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
      <span>Đã chọn {count} học viên</span>
      {Object.values(selected).map((student) => <button key={student.id} type="button"
        disabled={mutation.isPending} aria-label={`Bỏ chọn ${student.fullName}`}
        className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800"
        onClick={() => setSelected((previous) => { const next = { ...previous }; delete next[student.id]; return next; })}>
        {student.fullName} · {student.code} ×
      </button>)}
    </div>}
    {table.isError ? <div role="alert" className="flex items-center justify-between gap-3">
      <span>Không tải được danh sách học viên.</span><Button variant="ghost" onClick={() => table.refetch()}>Thử lại</Button>
    </div> : <div aria-busy={table.isFetching} className={table.isFetching ? "pointer-events-none opacity-60" : ""}>
      <Table compact fitToContainer data={table.data} columns={columns}
        pagination={table.pagination} onPaginationChange={table.setPagination}
        columnFilters={table.columnFilters} onColumnFiltersChange={table.setColumnFilters}
        sorting={table.sorting} onSortingChange={table.setSorting} filterFields={filterFields}
        emptyText={table.isLoading ? "Đang tải học viên…" : "Không có học viên chưa có trường phù hợp"} />
    </div>}
    <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
      <Button variant="ghost" onClick={closeModal} disabled={mutation.isPending}>Hủy</Button>
      <Button variant="primary" disabled={!count || count > 500 || table.isError}
        isLoading={mutation.isPending} onClick={() => mutation.mutate(Object.keys(selected))}>
        Thêm học viên{count ? ` (${count})` : ""}
      </Button>
    </div>
  </div>;
}
