"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import { University } from "@/types/universities";
import UniversityActions from "./UniversityActions";

interface UseUniversityColumnsProps {
  onEdit: (university: University) => void;
}

export function useUniversityColumns({
  onEdit,
}: UseUniversityColumnsProps): ColumnDef<University>[] {
  return useMemo<ColumnDef<University>[]>(
    () => [
      {
        id: "universityName",
        header: "Trường đại học",
        accessorKey: "universityName",
        cell: ({ row }) => {
          const university = row.original;
          return (
            <Link
              href={`/commander/universities/${university.id}`}
              className="group inline-flex flex-col"
            >
              <Typography
                variant="body"
                weight="semibold"
                color="neutral"
                className="group-hover:text-primary-600 transition-colors"
              >
                {university.universityName}
              </Typography>
              <Typography variant="caption" color="gray">
                Xem chuyên ngành / đơn vị
              </Typography>
            </Link>
          );
        },
      },
      {
        id: "universityCode",
        header: "Mã trường",
        accessorKey: "universityCode",
        meta: { align: "center" },
        cell: ({ row }) => (
          <Typography
            variant="body"
            weight="semibold"
            color="neutral"
            className="whitespace-nowrap"
          >
            {row.original.universityCode}
          </Typography>
        ),
      },
      {
        id: "totalStudents",
        header: "Số học viên",
        accessorKey: "totalStudents",
        meta: { align: "center" },
        cell: ({ row }) => (
          <Typography variant="body" color="neutral">
            {row.original.totalStudents}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        accessorKey: "status",
        meta: { align: "center" },
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant={row.original.status === "ACTIVE" ? "success" : "neutral"}
            >
              {row.original.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
            </Badge>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        meta: { align: "center" },
        cell: ({ row }) => (
          <div className="flex justify-center">
            <UniversityActions
              university={row.original}
              onEdit={onEdit}
            />
          </div>
        ),
      },
    ],
    [onEdit]
  );
}
