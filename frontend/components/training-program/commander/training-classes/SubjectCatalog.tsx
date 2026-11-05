"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { isAxiosError } from "axios";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Table from "@/library/Table";
import useClientTableData from "@/hooks/useClientTableData";
import {
  subjectCatalogService,
  type CatalogSubject,
} from "@/services/training-program/subject-catalog";

const matches = (row: CatalogSubject, filters: Record<string, unknown>) =>
  !filters.subject ||
  `${row.subjectCode} ${row.subjectName}`
    .toLocaleLowerCase("vi")
    .includes(String(filters.subject).toLocaleLowerCase("vi"));
const sortValue = (row: CatalogSubject, field: string) =>
  row[field as keyof CatalogSubject];

export default function SubjectCatalog({
  items,
  onSelect,
  onSaved,
}: {
  items: CatalogSubject[];
  onSelect: (id: string) => void;
  onSaved: () => Promise<unknown>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [credits, setCredits] = useState(0);
  const [message, setMessage] = useState("");
  const table = useClientTableData(items, matches, sortValue);
  const reset = () => {
    setEditingId(null);
    setSubjectCode("");
    setSubjectName("");
    setCredits(0);
  };
  const save = useMutation({
    mutationFn: () => {
      const values = {
        subjectCode: subjectCode.trim(),
        subjectName: subjectName.trim(),
        credits,
      };
      return editingId
        ? subjectCatalogService.update(editingId, values)
        : subjectCatalogService.create(values);
    },
    onSuccess: async () => {
      reset();
      setMessage("Đã lưu danh mục môn học.");
      await onSaved();
    },
    onError: (error) =>
      setMessage(
        isAxiosError(error)
          ? error.response?.data?.message || "Không lưu được môn học."
          : "Không lưu được môn học."
      ),
  });
  const columns = useMemo<ColumnDef<CatalogSubject>[]>(
    () => [
      { accessorKey: "subjectCode", header: "Mã môn" },
      { accessorKey: "subjectName", header: "Tên môn" },
      { accessorKey: "credits", header: "Tín chỉ" },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={save.isPending}
              onClick={() => onSelect(row.original.id)}
            >
              Thêm vào lớp
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={save.isPending}
              onClick={() => {
                const item = row.original;
                setEditingId(item.id);
                setSubjectCode(item.subjectCode);
                setSubjectName(item.subjectName);
                setCredits(item.credits);
                setMessage("");
              }}
            >
              Sửa
            </Button>
          </div>
        ),
      },
    ],
    [onSelect, save.isPending]
  );

  return (
    <section aria-label="Danh mục môn học" className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-semibold">Danh mục môn của Hệ</h2>
        <p className="text-sm text-neutral-500">
          Tạo môn một lần để dùng cho nhiều lớp. Sửa danh mục không thay đổi môn
          đã thêm vào lớp.
        </p>
      </div>
      <form
        className="grid items-end gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:grid-cols-2 sm:p-5 xl:grid-cols-[1fr_2fr_0.7fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          save.mutate();
        }}
      >
        <Input
          label="Mã môn"
          disabled={save.isPending}
          required
          maxLength={50}
          value={subjectCode}
          onChange={(event) => setSubjectCode(event.target.value)}
        />
        <Input
          label="Tên môn"
          disabled={save.isPending}
          required
          maxLength={255}
          value={subjectName}
          onChange={(event) => setSubjectName(event.target.value)}
        />
        <Input
          label="Tín chỉ"
          disabled={save.isPending}
          required
          type="number"
          min={0}
          max={100}
          step={1}
          value={credits}
          onChange={(event) => setCredits(Number(event.target.value))}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            isLoading={save.isPending}
            disabled={!subjectCode.trim() || !subjectName.trim()}
          >
            {editingId ? "Lưu thay đổi" : "Tạo môn"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              disabled={save.isPending}
              onClick={reset}
            >
              Hủy
            </Button>
          )}
        </div>
      </form>
      {message && (
        <p
          role={save.isError ? "alert" : "status"}
          className={`rounded-xl px-4 py-3 text-sm ${save.isError ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"}`}
        >
          {message}
        </p>
      )}
      <Table
        data={table.data}
        columns={columns}
        pagination={table.pagination}
        onPaginationChange={table.setPagination}
        columnFilters={table.columnFilters}
        onColumnFiltersChange={table.onColumnFiltersChange}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        filterFields={[
          {
            type: "text",
            id: "subject",
            label: "Môn học",
            placeholder: "Tên hoặc mã môn...",
          },
        ]}
        emptyText="Chưa có môn trong danh mục. Tạo môn trước khi thêm vào lớp."
      />
    </section>
  );
}
