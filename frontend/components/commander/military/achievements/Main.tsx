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
import { MilitaryAchievement } from "@/types/military-academic";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

const categoryLabel: Record<MilitaryAchievement["category"], string> = {
  AWARD: "Khen thưởng",
  SCIENTIFIC_TOPIC: "Đề tài khoa học",
  SCIENTIFIC_INITIATIVE: "Sáng kiến khoa học",
};
const achievementFields = [
  {
    name: "userId",
    label: "Học viên",
    type: "select" as const,
    required: true,
    options: [] as Array<{ value: string; label: string }>,
  },
  {
    name: "category",
    label: "Loại thành tích",
    type: "select" as const,
    required: true,
    options: Object.entries(categoryLabel).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    name: "title",
    label: "Tên thành tích / đề tài",
    required: true,
    maxLength: 255,
  },
  { name: "award", label: "Danh hiệu / giải thưởng", maxLength: 255 },
  { name: "year", label: "Năm", type: "number" as const, min: 1900, max: 2200 },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea" as const,
    maxLength: 5000,
  },
];

export default function MilitaryAchievementsPage() {
  const client = useQueryClient();
  const { openConfirm } = useConfirmStore();
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
  const records = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_ACHIEVEMENTS, classId],
    queryFn: () => militaryAcademicService.getClassAchievements(classId),
    enabled: Boolean(classId),
  });
  const refresh = () =>
    client.invalidateQueries({
      queryKey: [QUERY_KEYS.MILITARY_ACHIEVEMENTS, classId],
    });
  const remove = useMutation({
    mutationFn: militaryAcademicService.deleteAchievement,
    onSuccess: refresh,
  });
  const formFields = achievementFields.map((field) =>
    field.name === "userId"
      ? {
          ...field,
          options: (students.data?.data || []).map((student) => ({
            value: student.User?.id || student.user?.id || "",
            label: `${student.code} · ${student.fullName || "Chưa có tên"}`,
          })),
        }
      : field
  );
  const save = async (values: Record<string, string>, id?: string) => {
    const payload = {
      userId: values.userId,
      category: values.category as MilitaryAchievement["category"],
      title: values.title.trim(),
      award: values.award.trim() || null,
      year: values.year ? Number(values.year) : null,
      description: values.description.trim() || null,
    };
    if (id) await militaryAcademicService.updateAchievement(id, payload);
    else await militaryAcademicService.createAchievement(classId, payload);
    await refresh();
  };
  const openCreate = () =>
    openModal({
      title: "Thêm thành tích",
      size: "lg",
      content: (
        <MilitaryEntityForm
          fields={formFields}
          submitLabel="Thêm thành tích"
          onSubmit={(values) => save(values)}
        />
      ),
    });
  const openUpdate = (row: MilitaryAchievement) =>
    openModal({
      title: "Cập nhật thành tích",
      size: "lg",
      content: (
        <MilitaryEntityForm
          fields={formFields}
          initialValues={{
            userId: row.userId,
            category: row.category,
            title: row.title,
            award: row.award || "",
            year: row.year ? String(row.year) : "",
            description: row.description || "",
          }}
          submitLabel="Lưu thay đổi"
          onSubmit={(values) => save(values, row.id)}
        />
      ),
    });
  const columns: ColumnDef<MilitaryAchievement>[] = [
    {
      id: "student",
      header: "Học viên",
      accessorFn: (row) =>
        `${row.User?.Profile?.code || "—"} · ${row.User?.Profile?.fullName || "—"}`,
    },
    {
      id: "category",
      header: "Loại",
      accessorFn: (row) => categoryLabel[row.category],
    },
    { accessorKey: "title", header: "Thành tích" },
    { id: "award", header: "Danh hiệu", accessorFn: (row) => row.award || "—" },
    { id: "year", header: "Năm", accessorFn: (row) => row.year || "—" },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ActionButton
            tooltipText="Sửa thành tích"
            icon={HiOutlinePencil}
            color="blue"
            onClick={() => openUpdate(row.original)}
          />
          <ActionButton
            tooltipText="Xóa thành tích"
            icon={HiOutlineTrash}
            color="red"
            onClick={() =>
              openConfirm({
                title: "Xóa thành tích",
                message: `Xóa “${row.original.title}” khỏi hồ sơ học viên?`,
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
        { label: "Quản lý thành tích" },
      ]}
      title="Quản lý thành tích"
      subtitle="Ghi nhận khen thưởng và hoạt động khoa học cho học viên theo lớp."
      isLoading={classes.isLoading}
      isError={classes.isError}
      onRetry={() => void classes.refetch()}
    >
      <MilitarySection title="Danh sách thành tích">
        <MilitaryDataTable
          data={records.data?.data || []}
          columns={columns}
          emptyText="Chọn lớp để xem thành tích."
          onAdd={classId ? openCreate : undefined}
          addLabel="Thêm thành tích"
          onFiltersChange={(filters) =>
            setClassId(
              String(filters.find((item) => item.id === "classId")?.value || "")
            )
          }
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
              id: "student",
              label: "Học viên",
              type: "text",
              placeholder: "Nhập tên hoặc mã học viên...",
            },
            {
              id: "category",
              label: "Loại thành tích",
              type: "select",
              options: Object.values(categoryLabel).map((label) => ({
                value: label,
                label,
              })),
            },
            {
              id: "title",
              label: "Thành tích / đề tài",
              type: "text",
              placeholder: "Nhập tên thành tích...",
            },
            {
              id: "award",
              label: "Danh hiệu",
              type: "text",
              placeholder: "Nhập danh hiệu...",
            },
            {
              id: "year",
              label: "Năm",
              type: "text",
              placeholder: "Nhập năm...",
            },
          ]}
        />
        {remove.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể xóa thành tích.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
