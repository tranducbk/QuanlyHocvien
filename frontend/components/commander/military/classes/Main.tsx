"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlineCheckCircle } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryClassService } from "@/services/military-classes";
import {
  MilitaryClass,
  MilitaryStudentProfile,
} from "@/types/military-classes";
import { useModalStore } from "@/store/useModalStore";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

export default function MilitaryClassesPage() {
  const client = useQueryClient();
  const { openModal } = useModalStore();
  const [classId, setClassId] = useState("");
  const classes = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES],
    queryFn: militaryClassService.getAll,
  });
  const students = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES, classId, "students"],
    queryFn: () => militaryClassService.getStudents(classId),
    enabled: Boolean(classId),
  });
  const assign = useMutation({
    mutationFn: (studentCodes: string[]) =>
      militaryClassService.assignStudentsByCode(classId, studentCodes),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_CLASSES, classId, "students"],
      });
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_CLASSES],
      });
    },
  });
  const remove = useMutation({
    mutationFn: (userId: string) =>
      militaryClassService.removeStudent(classId, userId),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_CLASSES, classId, "students"],
      });
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_CLASSES],
      });
    },
  });
  const openAssign = () =>
    openModal({
      title: "Xếp học viên vào lớp",
      size: "md",
      content: (
        <MilitaryEntityForm
          fields={[
            {
              name: "studentCodes",
              label: "Mã học viên",
              type: "textarea",
              required: true,
              placeholder: "Phân tách bằng dấu phẩy hoặc xuống dòng",
            },
          ]}
          submitLabel="Xếp vào lớp"
          onSubmit={async (values) => {
            const codes = values.studentCodes
              .split(/[\n,;]+/)
              .map((code) => code.trim())
              .filter(Boolean);
            if (!codes.length)
              throw new Error("Vui lòng nhập ít nhất một mã học viên");
            await assign.mutateAsync(codes);
          }}
        />
      ),
    });
  const classColumns = useMemo<ColumnDef<MilitaryClass>[]>(
    () => [
      { accessorKey: "classCode", header: "Mã lớp" },
      { accessorKey: "className", header: "Tên lớp" },
      { accessorKey: "studentCount", header: "Sĩ số" },
      {
        id: "select",
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionButton
            tooltipText="Xem học viên trong lớp"
            icon={HiOutlineCheckCircle}
            color={classId === row.original.id ? "green" : "blue"}
            onClick={() => setClassId(row.original.id)}
          />
        ),
      },
    ],
    [classId]
  );
  const studentColumns = useMemo<ColumnDef<MilitaryStudentProfile>[]>(
    () => [
      { accessorKey: "code", header: "Mã học viên" },
      { accessorKey: "fullName", header: "Họ và tên" },
      { id: "rank", header: "Cấp bậc", accessorFn: (row) => row.rank || "—" },
      {
        id: "remove",
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => {
          const userId = row.original.User?.id || row.original.user?.id;
          return (
            <button
              type="button"
              disabled={!userId || remove.isPending}
              onClick={() => userId && remove.mutate(userId)}
              className="text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              Chuyển khỏi lớp
            </button>
          );
        },
      },
    ],
    [remove]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý lớp học" },
      ]}
      title="Quản lý lớp học"
      subtitle="Chọn lớp được Admin phân công để xem và xếp học viên."
      isLoading={classes.isLoading}
      isError={classes.isError}
      onRetry={() => void classes.refetch()}
    >
      <MilitarySection title="Lớp được phân công">
        <MilitaryDataTable
          data={classes.data?.data || []}
          columns={classColumns}
          emptyText="Chưa được Admin phân công lớp."
          filterFields={[
            {
              id: "classCode",
              label: "Mã lớp",
              type: "text",
              placeholder: "Nhập mã lớp...",
            },
            {
              id: "className",
              label: "Tên lớp",
              type: "text",
              placeholder: "Nhập tên lớp...",
            },
          ]}
        />
      </MilitarySection>
      <MilitarySection
        title={
          classId
            ? `Học viên · ${classes.data?.data?.find((row) => row.id === classId)?.className || "Lớp đã chọn"}`
            : "Học viên trong lớp"
        }
      >
        {classId ? (
          <>
            <MilitaryDataTable
              data={students.data?.data || []}
              columns={studentColumns}
              emptyText="Lớp chưa có học viên."
              onAdd={openAssign}
              addLabel="Xếp học viên"
              filterFields={[
                {
                  id: "code",
                  label: "Mã học viên",
                  type: "text",
                  placeholder: "Nhập mã học viên...",
                },
                {
                  id: "fullName",
                  label: "Họ và tên",
                  type: "text",
                  placeholder: "Nhập họ tên...",
                },
                {
                  id: "rank",
                  label: "Cấp bậc",
                  type: "text",
                  placeholder: "Nhập cấp bậc...",
                },
              ]}
            />
            {assign.isError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                Không thể xếp học viên. Kiểm tra mã và hệ đào tạo.
              </p>
            )}
            {remove.isError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                Không thể chuyển học viên khỏi lớp.
              </p>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Chọn một lớp để xem danh sách học viên.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
