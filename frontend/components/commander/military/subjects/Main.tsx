"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { militaryClassService } from "@/services/military-classes";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { MilitarySubject } from "@/types/military-academic";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

const subjectFields = [
  { name: "subjectCode", label: "Mã môn", required: true, maxLength: 50 },
  { name: "subjectName", label: "Tên môn", required: true, maxLength: 255 },
  {
    name: "credits",
    label: "Tín chỉ",
    type: "number" as const,
    required: true,
    min: 0,
  },
];

export default function MilitarySubjectsPage() {
  const client = useQueryClient();
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const classes = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES],
    queryFn: militaryClassService.getAll,
  });
  const semesters = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_SEMESTERS],
    queryFn: militaryAcademicService.getSemesters,
  });
  const subjects = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_SUBJECTS, classId],
    queryFn: () => militaryAcademicService.getSubjects(classId),
    enabled: Boolean(classId),
  });
  const refresh = () =>
    client.invalidateQueries({
      queryKey: [QUERY_KEYS.MILITARY_SUBJECTS, classId],
    });
  const remove = useMutation({
    mutationFn: (id: string) =>
      militaryAcademicService.deleteSubject(classId, id),
    onSuccess: refresh,
  });
  const openCreate = () =>
    openModal({
      title: "Thêm môn học",
      size: "lg",
      content: (
        <MilitaryEntityForm
          fields={subjectFields}
          submitLabel="Thêm môn"
          onSubmit={async (values) => {
            await militaryAcademicService.createSubject(classId, {
              subjectCode: values.subjectCode.trim(),
              subjectName: values.subjectName.trim(),
              credits: Number(values.credits),
              semesterId,
            });
            await refresh();
          }}
        />
      ),
    });
  const openUpdate = (row: MilitarySubject) =>
    openModal({
      title: "Cập nhật môn học",
      size: "lg",
      content: (
        <MilitaryEntityForm
          fields={subjectFields}
          initialValues={{
            subjectCode: row.subjectCode,
            subjectName: row.subjectName,
            credits: String(row.credits),
          }}
          submitLabel="Lưu thay đổi"
          onSubmit={async (values) => {
            await militaryAcademicService.updateSubject(classId, row.id, {
              subjectCode: values.subjectCode.trim(),
              subjectName: values.subjectName.trim(),
              credits: Number(values.credits),
              semesterId: row.semesterId,
            });
            await refresh();
          }}
        />
      ),
    });
  const columns: ColumnDef<MilitarySubject>[] = [
    { accessorKey: "subjectCode", header: "Mã môn" },
    { accessorKey: "subjectName", header: "Tên môn" },
    { accessorKey: "credits", header: "Tín chỉ" },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ActionButton
            tooltipText="Sửa môn học"
            icon={HiOutlinePencil}
            color="blue"
            onClick={() => openUpdate(row.original)}
          />
          <ActionButton
            tooltipText="Xóa môn học"
            icon={HiOutlineTrash}
            color="red"
            onClick={() =>
              openConfirm({
                title: "Xóa môn học",
                message:
                  "Không thể xóa môn đang được dùng trong lịch học hoặc kết quả.",
                variant: "danger",
                confirmText: "Xóa",
                onConfirm: () => remove.mutate(row.original.id),
              })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Môn học" },
      ]}
      title="Quản lý môn học"
      subtitle="Danh mục môn học thuộc lớp và học kỳ quân sự."
      isLoading={classes.isLoading || semesters.isLoading}
      isError={classes.isError || semesters.isError}
      onRetry={() => {
        void classes.refetch();
        void semesters.refetch();
      }}
    >
      <MilitarySection title="Danh sách môn học">
        <MilitaryDataTable
          data={
            subjects.data?.data?.filter(
              (row) => !semesterId || row.semesterId === semesterId
            ) || []
          }
          columns={columns}
          emptyText="Lớp và học kỳ đang chọn chưa có môn học."
          onAdd={classId && semesterId ? openCreate : undefined}
          addLabel="Thêm môn học"
          onFiltersChange={(filters) => {
            setClassId(
              String(filters.find((item) => item.id === "classId")?.value || "")
            );
            setSemesterId(
              String(
                filters.find((item) => item.id === "semesterId")?.value || ""
              )
            );
          }}
          filterFields={[
            {
              id: "classId",
              label: "Lớp",
              type: "select",
              placeholder: "Chọn lớp...",
              options: (classes.data?.data || []).map((row) => ({
                value: row.id,
                label: `${row.classCode} · ${row.className}`,
              })),
            },
            {
              id: "semesterId",
              label: "Học kỳ",
              type: "select",
              placeholder: "Chọn học kỳ...",
              options: (semesters.data?.data || []).map((row) => ({
                value: row.id,
                label: `${row.schoolYear} · Học kỳ ${row.code}`,
              })),
            },
            {
              id: "subjectCode",
              label: "Mã môn",
              type: "text",
              placeholder: "Nhập mã môn...",
            },
            {
              id: "subjectName",
              label: "Tên môn",
              type: "text",
              placeholder: "Nhập tên môn...",
            },
            {
              id: "credits",
              label: "Tín chỉ",
              type: "number",
              placeholder: "Nhập số tín chỉ...",
            },
          ]}
        />
        {remove.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể xóa môn đang được sử dụng trong lịch học hoặc kết quả.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
