"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { militaryClassService } from "@/services/military-classes";
import { MilitaryScheduleItem } from "@/types/military-academic";
import { useModalStore } from "@/store/useModalStore";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

type IndexedSchedule = MilitaryScheduleItem & { rowId: number };
const dayLabel = (day: number) => (day === 7 ? "Chủ nhật" : `Thứ ${day + 1}`);
const EMPTY_SCHEDULES: MilitaryScheduleItem[] = [];

export default function MilitaryTimeTablePage() {
  const client = useQueryClient();
  const { openModal } = useModalStore();
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [editedSchedules, setEditedSchedules] = useState<
    MilitaryScheduleItem[] | null
  >(null);
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
  const timetable = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_TIME_TABLES, classId, semesterId],
    queryFn: () => militaryAcademicService.getTimeTable(classId, semesterId),
    enabled: Boolean(classId && semesterId),
  });
  const serverSchedules = timetable.data?.data?.schedules ?? EMPTY_SCHEDULES;
  const schedules = editedSchedules ?? serverSchedules;
  const indexedSchedules = useMemo(
    () => schedules.map((item, rowId) => ({ ...item, rowId })),
    [schedules]
  );
  const setSchedules = useCallback(
    (update: (rows: MilitaryScheduleItem[]) => MilitaryScheduleItem[]) =>
      setEditedSchedules((rows) => update(rows ?? serverSchedules)),
    [serverSchedules]
  );
  const save = useMutation({
    mutationFn: () =>
      militaryAcademicService.saveTimeTable(classId, semesterId, schedules),
    onSuccess: async () => {
      setEditedSchedules(null);
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_TIME_TABLES, classId, semesterId],
      });
    },
  });
  const lessonFields = [
    {
      name: "subjectName",
      label: "Môn học",
      type: "select" as const,
      required: true,
      options: (subjects.data?.data || [])
        .filter((item) => item.semesterId === semesterId)
        .map((item) => ({ value: item.subjectName, label: item.subjectName })),
    },
    {
      name: "day",
      label: "Thứ",
      type: "select" as const,
      required: true,
      options: [1, 2, 3, 4, 5, 6, 7].map((value) => ({
        value: String(value),
        label: dayLabel(value),
      })),
    },
    {
      name: "startTime",
      label: "Bắt đầu",
      type: "time" as const,
      required: true,
    },
    {
      name: "endTime",
      label: "Kết thúc",
      type: "time" as const,
      required: true,
    },
    { name: "room", label: "Phòng học" },
    { name: "week", label: "Tuần học", placeholder: "Ví dụ: 1, 2, 3" },
  ];
  const openAddLesson = () =>
    openModal({
      title: "Thêm tiết học",
      size: "lg",
      content: (
        <MilitaryEntityForm
          fields={lessonFields}
          initialValues={{ day: "1", startTime: "08:00", endTime: "10:00" }}
          submitLabel="Thêm tiết"
          onSubmit={async (values) => {
            if (
              !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.startTime) ||
              !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.endTime) ||
              values.endTime <= values.startTime
            )
              throw new Error("Giờ học không hợp lệ");
            const week = values.week
              ? values.week
                  .split(",")
                  .map((value) => Number(value.trim()))
                  .filter((value) => Number.isInteger(value) && value > 0)
              : [];
            setSchedules((items) => [
              ...items,
              {
                subjectName: values.subjectName,
                day: Number(values.day),
                startTime: values.startTime,
                endTime: values.endTime,
                room: values.room.trim() || null,
                week,
              },
            ]);
          }}
        />
      ),
    });
  const columns = useMemo<ColumnDef<IndexedSchedule>[]>(
    () => [
      { id: "day", header: "Thứ", accessorFn: (row) => dayLabel(row.day) },
      { accessorKey: "startTime", header: "Bắt đầu" },
      { accessorKey: "endTime", header: "Kết thúc" },
      { accessorKey: "subjectName", header: "Môn học" },
      { id: "room", header: "Phòng", accessorFn: (row) => row.room || "—" },
      {
        id: "weeks",
        header: "Tuần học",
        accessorFn: (row) =>
          row.week?.length ? row.week.join(", ") : "Tất cả",
      },
      {
        id: "remove",
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionButton
            tooltipText="Bỏ tiết học"
            icon={HiOutlineTrash}
            color="red"
            onClick={() =>
              setSchedules((items) =>
                items.filter((_, index) => index !== row.original.rowId)
              )
            }
          />
        ),
      },
    ],
    [setSchedules]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Lịch học" },
      ]}
      title="Lịch học"
      subtitle="Lập một thời khóa biểu chung cho tất cả học viên trong cùng lớp và học kỳ."
      isLoading={classes.isLoading || semesters.isLoading}
      isError={classes.isError || semesters.isError}
      onRetry={() => {
        void classes.refetch();
        void semesters.refetch();
      }}
    >
      <MilitarySection
        title="Thời khóa biểu"
        description="Các thay đổi chỉ được lưu sau khi chọn lớp và học kỳ."
      >
        <MilitaryDataTable
          data={indexedSchedules}
          columns={columns}
          emptyText="Chưa có tiết học trong lịch này."
          showIndex={false}
          onAdd={classId && semesterId ? openAddLesson : undefined}
          addLabel="Thêm tiết học"
          onFiltersChange={(filters) => {
            const nextClassId = String(
              filters.find((item) => item.id === "classId")?.value || ""
            );
            const nextSemesterId = String(
              filters.find((item) => item.id === "semesterId")?.value || ""
            );
            if (nextClassId !== classId || nextSemesterId !== semesterId)
              setEditedSchedules(null);
            setClassId(nextClassId);
            setSemesterId(nextSemesterId);
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
              id: "day",
              label: "Thứ",
              type: "text",
              placeholder: "Nhập thứ...",
            },
            {
              id: "subjectName",
              label: "Môn học",
              type: "text",
              placeholder: "Nhập môn học...",
            },
            {
              id: "room",
              label: "Phòng học",
              type: "text",
              placeholder: "Nhập phòng học...",
            },
            {
              id: "weeks",
              label: "Tuần học",
              type: "text",
              placeholder: "Nhập tuần...",
            },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            {schedules.length} tiết học
          </p>
          <button
            type="button"
            disabled={!classId || !semesterId || save.isPending}
            onClick={() => save.mutate()}
            className="min-h-11 rounded-xl bg-primary-600 px-5 py-2 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {save.isPending ? "Đang lưu…" : "Lưu thời khóa biểu"}
          </button>
        </div>
        {save.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể lưu lịch. Kiểm tra môn học và thời gian bị trùng.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
