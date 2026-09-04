"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Typography from "@/library/Typography";
import { Class } from "@/types/classes";
import { formatDateTime, textOrDash } from "@/utils/fn-common";
import ClassActions from "./ClassActions";

interface UseClassColumnsProps {
  onAddStudents: (cls: Class) => void;
  onViewStudents: (cls: Class) => void;
  onEdit: (cls: Class) => void;
  invalidateQueryKey?: unknown[];
}

export function useClassColumns({
  onAddStudents,
  onViewStudents,
  onEdit,
  invalidateQueryKey,
}: UseClassColumnsProps): ColumnDef<Class>[] {
  return useMemo<ColumnDef<Class>[]>(
    () => [
      {
        id: "className",
        header: "Tên lớp",
        accessorKey: "className",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {info.row.original.className}
          </Typography>
        ),
      },
      {
        id: "universityName",
        header: "Trường đại học",
        accessorKey: "universityName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.universityName)}
          </Typography>
        ),
      },
      {
        id: "organizationName",
        header: "Khoa/Ngành",
        accessorKey: "organizationName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.organizationName)}
          </Typography>
        ),
      },
      {
        id: "levelName",
        header: "Trình độ",
        accessorKey: "levelName",
        meta: { align: "center" },
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.levelName)}
          </Typography>
        ),
      },
      {
        id: "studentCount",
        header: "Số học viên",
        accessorKey: "studentCount",
        meta: { align: "center" },
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {info.row.original.studentCount}
          </Typography>
        ),
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        accessorKey: "createdAt",
        meta: { align: "center", noWrap: true },
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDateTime(info.row.original.createdAt)}
          </Typography>
        ),
      },
      {
        id: "updatedAt",
        header: "Ngày cập nhật",
        accessorKey: "updatedAt",
        meta: { align: "center", noWrap: true },
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDateTime(info.row.original.updatedAt)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        meta: { align: "center" },
        cell: (info) => (
          <div className="flex justify-center">
            <ClassActions
              cls={info.row.original}
              onAddStudents={onAddStudents}
              onViewStudents={onViewStudents}
              onEdit={onEdit}
              invalidateQueryKey={invalidateQueryKey}
            />
          </div>
        ),
      },
    ],
    [onAddStudents, onViewStudents, onEdit, invalidateQueryKey]
  );
}
