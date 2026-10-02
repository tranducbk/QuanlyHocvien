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
import { MilitaryDutySchedule } from "@/types/military-academic";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

export default function MilitaryDutySchedulesPage() {
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
    queryKey: [QUERY_KEYS.MILITARY_DUTY_SCHEDULES, classId],
    queryFn: () => militaryAcademicService.getClassDutySchedules(classId),
    enabled: Boolean(classId),
  });
  const refresh = () =>
    client.invalidateQueries({
      queryKey: [QUERY_KEYS.MILITARY_DUTY_SCHEDULES, classId],
    });
  const remove = useMutation({
    mutationFn: militaryAcademicService.deleteDutySchedule,
    onSuccess: refresh,
  });
  const fields = [
    {
      name: "userId",
      label: "Học viên",
      type: "select" as const,
      required: true,
      options: (students.data?.data || []).map((student) => ({
        value: student.User?.id || student.user?.id || "",
        label: `${student.code} · ${student.fullName || "Chưa có tên"}`,
      })),
    },
    {
      name: "position",
      label: "Nhiệm vụ trực",
      required: true,
      maxLength: 100,
    },
    {
      name: "workDay",
      label: "Ngày trực",
      type: "date" as const,
      required: true,
    },
  ];
  const save = async (values: Record<string, string>, id?: string) => {
    const payload = {
      userId: values.userId,
      position: values.position.trim(),
      workDay: values.workDay,
    };
    if (id) await militaryAcademicService.updateDutySchedule(id, payload);
    else await militaryAcademicService.createDutySchedule(classId, payload);
    await refresh();
  };
  const openCreate = () =>
    openModal({
      title: "Phân công lịch trực",
      size: "md",
      content: (
        <MilitaryEntityForm
          fields={fields}
          submitLabel="Phân công"
          onSubmit={(values) => save(values)}
        />
      ),
    });
  const openUpdate = (row: MilitaryDutySchedule) =>
    openModal({
      title: "Cập nhật lịch trực",
      size: "md",
      content: (
        <MilitaryEntityForm
          fields={fields}
          initialValues={{
            userId: row.userId,
            position: row.position,
            workDay: row.workDay.slice(0, 10),
          }}
          submitLabel="Lưu thay đổi"
          onSubmit={(values) => save(values, row.id)}
        />
      ),
    });
  const columns: ColumnDef<MilitaryDutySchedule>[] = [
    {
      id: "student",
      header: "Học viên",
      accessorFn: (row) =>
        `${row.User?.Profile?.code || "—"} · ${row.User?.Profile?.fullName || "—"}`,
    },
    {
      id: "rank",
      header: "Cấp bậc",
      accessorFn: (row) => row.User?.Profile?.rank || "—",
    },
    { accessorKey: "position", header: "Nhiệm vụ" },
    {
      id: "workDay",
      header: "Ngày trực",
      accessorFn: (row) => new Date(row.workDay).toLocaleDateString("vi-VN"),
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ActionButton
            tooltipText="Sửa lịch trực"
            icon={HiOutlinePencil}
            color="blue"
            onClick={() => openUpdate(row.original)}
          />
          <ActionButton
            tooltipText="Xóa lịch trực"
            icon={HiOutlineTrash}
            color="red"
            onClick={() =>
              openConfirm({
                title: "Xóa lịch trực",
                message: "Bạn có chắc muốn xóa phân công này?",
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
        { label: "Phân công lịch trực" },
      ]}
      title="Phân công lịch trực"
      subtitle="Phân công nhiệm vụ trực cho học viên thuộc các lớp được giao."
      isLoading={classes.isLoading}
      isError={classes.isError}
      onRetry={() => void classes.refetch()}
    >
      <MilitarySection title="Danh sách lịch trực">
        <MilitaryDataTable
          data={records.data?.data || []}
          columns={columns}
          emptyText="Chọn lớp để xem lịch trực."
          onAdd={classId ? openCreate : undefined}
          addLabel="Phân công lịch trực"
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
              id: "position",
              label: "Nhiệm vụ",
              type: "text",
              placeholder: "Nhập nhiệm vụ...",
            },
            {
              id: "rank",
              label: "Cấp bậc",
              type: "text",
              placeholder: "Nhập cấp bậc...",
            },
            {
              id: "workDay",
              label: "Ngày trực",
              type: "text",
              placeholder: "Nhập ngày trực...",
            },
          ]}
        />
        {remove.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể xóa lịch trực.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
