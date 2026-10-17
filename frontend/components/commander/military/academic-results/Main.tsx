"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { militaryClassService } from "@/services/military-classes";
import { MilitarySubjectResult } from "@/types/military-academic";
import { useModalStore } from "@/store/useModalStore";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

export default function MilitaryAcademicResultsPage() {
  const client = useQueryClient();
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
  const students = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES, classId, "students"],
    queryFn: () => militaryClassService.getStudents(classId),
    enabled: Boolean(classId),
  });
  const results = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_RESULTS, classId, semesterId],
    queryFn: () => militaryAcademicService.getClassResults(classId, semesterId),
    enabled: Boolean(classId && semesterId),
  });
  const save = useMutation({
    mutationFn: (
      data: Pick<
        MilitarySubjectResult,
        | "profileId"
        | "militarySubjectId"
        | "letterGrade"
        | "gradePoint4"
        | "gradePoint10"
      >
    ) => militaryAcademicService.createClassResult(classId, data),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_RESULTS, classId, semesterId],
      }),
  });
  const resultFields = [
    {
      name: "profileId",
      label: "Học viên",
      type: "select" as const,
      required: true,
      options: (students.data?.data || []).map((profile) => ({
        value: profile.id,
        label: `${profile.code} · ${profile.fullName || "Chưa có tên"}`,
      })),
    },
    {
      name: "militarySubjectId",
      label: "Môn học",
      type: "select" as const,
      required: true,
      options: (subjects.data?.data || [])
        .filter((subject) => subject.semesterId === semesterId)
        .map((subject) => ({
          value: subject.id,
          label: `${subject.subjectCode} · ${subject.subjectName}`,
        })),
    },
    { name: "letterGrade", label: "Điểm chữ", required: true, maxLength: 5 },
    {
      name: "gradePoint4",
      label: "Điểm hệ 4",
      type: "number" as const,
      required: true,
      min: 0,
      max: 4,
      step: 0.01,
    },
    {
      name: "gradePoint10",
      label: "Điểm hệ 10",
      type: "number" as const,
      required: true,
      min: 0,
      max: 10,
      step: 0.01,
    },
  ];
  const openAddResult = () =>
    openModal({
      title: "Ghi nhận điểm",
      size: "lg",
      content: (
        <MilitaryEntityForm
          fields={resultFields}
          submitLabel="Ghi nhận điểm"
          onSubmit={async (values) => {
            await save.mutateAsync({
              profileId: values.profileId,
              militarySubjectId: values.militarySubjectId,
              letterGrade: values.letterGrade.trim(),
              gradePoint4: Number(values.gradePoint4),
              gradePoint10: Number(values.gradePoint10),
            });
          }}
        />
      ),
    });
  const columns = useMemo<ColumnDef<MilitarySubjectResult>[]>(
    () => [
      {
        id: "studentCode",
        header: "Mã học viên",
        accessorFn: (row) => row.Profile?.code || "—",
      },
      {
        id: "studentName",
        header: "Họ và tên",
        accessorFn: (row) => row.Profile?.fullName || "—",
      },
      {
        id: "subject",
        header: "Môn học",
        accessorFn: (row) => row.MilitarySubject?.subjectName || "—",
      },
      { accessorKey: "letterGrade", header: "Điểm chữ" },
      { accessorKey: "gradePoint4", header: "Hệ 4" },
      { accessorKey: "gradePoint10", header: "Hệ 10" },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học tập" },
      ]}
      title="Quản lý học tập"
      subtitle="Ghi nhận điểm theo lớp và học kỳ. Điểm chính thức đã nhập không thể sửa hoặc xóa."
      isLoading={classes.isLoading || semesters.isLoading}
      isError={classes.isError || semesters.isError}
      onRetry={() => {
        void classes.refetch();
        void semesters.refetch();
      }}
    >
      <MilitarySection title="Bảng điểm">
        <MilitaryDataTable
          data={results.data?.data || []}
          columns={columns}
          emptyText="Chọn lớp và học kỳ để xem bảng điểm."
          onAdd={classId && semesterId ? openAddResult : undefined}
          addLabel="Ghi nhận điểm"
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
              id: "studentName",
              label: "Họ và tên",
              type: "text",
              placeholder: "Nhập họ tên...",
            },
            {
              id: "studentCode",
              label: "Mã học viên",
              type: "text",
              placeholder: "Nhập mã học viên...",
            },
            {
              id: "subject",
              label: "Môn học",
              type: "text",
              placeholder: "Nhập môn học...",
            },
            {
              id: "letterGrade",
              label: "Điểm chữ",
              type: "text",
              placeholder: "Nhập điểm chữ...",
            },
          ]}
        />
        {save.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể ghi điểm. Mỗi học viên chỉ có một điểm chính thức cho mỗi
            môn.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
