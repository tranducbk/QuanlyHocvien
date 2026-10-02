"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { MilitarySemester } from "@/types/military-academic";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

export default function MilitarySemestersPage() {
  const client = useQueryClient();
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();
  const query = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_SEMESTERS],
    queryFn: militaryAcademicService.getSemesters,
  });
  const create = useMutation({
    mutationFn: militaryAcademicService.createSemester,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS] }),
  });
  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Pick<MilitarySemester, "code" | "schoolYear">;
    }) => militaryAcademicService.updateSemester(id, data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS] }),
  });
  const remove = useMutation({
    mutationFn: militaryAcademicService.deleteSemester,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS] }),
  });
  const semesterFields = [
    {
      name: "code",
      label: "Học kỳ",
      type: "select" as const,
      required: true,
      options: [1, 2, 3, 4].map((value) => ({
        value: String(value),
        label: `Học kỳ ${value}`,
      })),
    },
    {
      name: "schoolYear",
      label: "Năm học",
      required: true,
      maxLength: 50,
      placeholder: "2026-2027",
    },
  ];
  const openCreate = () =>
    openModal({
      title: "Thêm học kỳ",
      size: "md",
      content: (
        <MilitaryEntityForm
          fields={semesterFields}
          initialValues={{ code: "1" }}
          submitLabel="Tạo học kỳ"
          onSubmit={async (values) => {
            await create.mutateAsync({
              code: Number(values.code),
              schoolYear: values.schoolYear.trim(),
            });
          }}
        />
      ),
    });
  const openUpdate = (row: MilitarySemester) =>
    openModal({
      title: "Cập nhật học kỳ",
      size: "md",
      content: (
        <MilitaryEntityForm
          fields={semesterFields}
          initialValues={{ code: String(row.code), schoolYear: row.schoolYear }}
          submitLabel="Lưu thay đổi"
          onSubmit={async (values) => {
            await update.mutateAsync({
              id: row.id,
              data: {
                code: Number(values.code),
                schoolYear: values.schoolYear.trim(),
              },
            });
          }}
        />
      ),
    });
  const columns: ColumnDef<MilitarySemester>[] = [
    { accessorKey: "schoolYear", header: "Năm học" },
    {
      id: "semester",
      header: "Học kỳ",
      accessorFn: (row) => `Học kỳ ${row.code}`,
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ActionButton
            tooltipText="Sửa học kỳ"
            icon={HiOutlinePencil}
            color="blue"
            onClick={() => openUpdate(row.original)}
          />
          <ActionButton
            tooltipText="Xóa học kỳ"
            icon={HiOutlineTrash}
            color="red"
            onClick={() =>
              openConfirm({
                title: "Xóa học kỳ",
                message: "Chỉ xóa được học kỳ chưa có môn học hoặc lịch học.",
                confirmText: "Xóa",
                variant: "danger",
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
        { label: "Quản lý học kỳ" },
      ]}
      title="Quản lý học kỳ"
      subtitle="Quản lý năm học và học kỳ phục vụ chương trình đào tạo quân sự."
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => void query.refetch()}
    >
      <MilitarySection title="Danh sách học kỳ">
        <MilitaryDataTable
          data={query.data?.data || []}
          columns={columns}
          emptyText="Chưa có học kỳ."
          onAdd={openCreate}
          addLabel="Thêm học kỳ"
          filterFields={[
            {
              id: "schoolYear",
              label: "Năm học",
              type: "text",
              placeholder: "Nhập năm học...",
            },
            {
              id: "semester",
              label: "Học kỳ",
              type: "text",
              placeholder: "Nhập học kỳ...",
            },
          ]}
        />
        {remove.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể xóa học kỳ đang được môn học hoặc lịch học sử dụng.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
