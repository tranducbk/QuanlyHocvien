"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { militaryClassService } from "@/services/military-classes";
import { MilitaryGradeProposal } from "@/types/military-academic";
import { useModalStore } from "@/store/useModalStore";
import MilitaryDataTable from "@/components/commander/military/MilitaryDataTable";
import MilitaryEntityForm from "@/components/commander/military/MilitaryEntityForm";
import MilitarySection from "@/components/commander/military/MilitarySection";

const statusLabel = {
  PENDING: "Đang chờ",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

export default function MilitaryApprovalsPage() {
  const client = useQueryClient();
  const { openModal } = useModalStore();
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("");
  const classes = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES],
    queryFn: militaryClassService.getAll,
  });
  const proposals = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_GRADE_PROPOSALS, classId, status],
    queryFn: () =>
      militaryAcademicService.getClassGradeProposals(
        classId,
        status || undefined
      ),
    enabled: Boolean(classId),
  });
  const review = useMutation({
    mutationFn: ({
      id,
      approved,
      note,
    }: {
      id: string;
      approved: boolean;
      note: string;
    }) =>
      militaryAcademicService.reviewGradeProposal(id, approved, note.trim()),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_GRADE_PROPOSALS, classId],
      });
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_RESULTS, classId],
      });
    },
  });
  const openReview = (proposalId: string, approved: boolean) =>
    openModal({
      title: approved ? "Duyệt đề xuất điểm" : "Từ chối đề xuất điểm",
      size: "md",
      content: (
        <MilitaryEntityForm
          fields={[
            {
              name: "note",
              label: "Ghi chú xử lý",
              type: "textarea",
              maxLength: 2000,
              placeholder: "Ghi chú không bắt buộc",
            },
          ]}
          submitLabel={approved ? "Duyệt đề xuất" : "Từ chối đề xuất"}
          onSubmit={async (values) => {
            await review.mutateAsync({
              id: proposalId,
              approved,
              note: values.note || "",
            });
          }}
        />
      ),
    });
  const columns: ColumnDef<MilitaryGradeProposal>[] = [
    {
      id: "student",
      header: "Học viên",
      accessorFn: (row) =>
        `${row.Profile?.code || "—"} · ${row.Profile?.fullName || "—"}`,
    },
    {
      id: "subject",
      header: "Môn / học kỳ",
      accessorFn: (row) =>
        `${row.MilitarySubject?.subjectName || ""} ${row.MilitarySubject?.MilitarySemester?.schoolYear || ""} HK ${row.MilitarySubject?.MilitarySemester?.code || ""}`,
      cell: ({ row }) => (
        <div>
          {row.original.MilitarySubject?.subjectName || "—"}
          <p className="text-xs text-neutral-500">
            {row.original.MilitarySubject?.MilitarySemester?.schoolYear} · HK{" "}
            {row.original.MilitarySubject?.MilitarySemester?.code}
          </p>
        </div>
      ),
    },
    {
      id: "grade",
      header: "Điểm đề xuất",
      accessorFn: (row) =>
        `${row.proposedLetterGrade} · ${row.proposedGradePoint4}/4 · ${row.proposedGradePoint10}/10`,
    },
    { accessorKey: "reason", header: "Lý do" },
    {
      id: "status",
      header: "Trạng thái",
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "APPROVED"
              ? "success"
              : row.original.status === "REJECTED"
                ? "error"
                : "warning"
          }
        >
          {statusLabel[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Xử lý",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "PENDING" ? (
          <div className="flex items-center gap-1">
            <ActionButton
              tooltipText="Duyệt đề xuất"
              icon={HiOutlineCheck}
              color="green"
              disabled={review.isPending}
              onClick={() => openReview(row.original.id, true)}
            />
            <ActionButton
              tooltipText="Từ chối đề xuất"
              icon={HiOutlineX}
              color="red"
              disabled={review.isPending}
              onClick={() => openReview(row.original.id, false)}
            />
          </div>
        ) : (
          <span className="text-neutral-400">Đã xử lý</span>
        ),
    },
  ];

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Phê duyệt đề xuất" },
      ]}
      title="Phê duyệt đề xuất"
      subtitle="Xem xét điểm do học viên quân sự gửi để duyệt hoặc từ chối."
      isLoading={classes.isLoading}
      isError={classes.isError}
      onRetry={() => void classes.refetch()}
    >
      <MilitarySection title="Danh sách đề xuất">
        <MilitaryDataTable
          data={proposals.data?.data || []}
          columns={columns}
          emptyText={
            classId ? "Không có đề xuất phù hợp." : "Chọn lớp để xem đề xuất."
          }
          onFiltersChange={(filters) => {
            setClassId(
              String(filters.find((item) => item.id === "classId")?.value || "")
            );
            setStatus(
              String(filters.find((item) => item.id === "status")?.value || "")
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
              id: "status",
              label: "Trạng thái",
              type: "select",
              options: [
                { value: "PENDING", label: "Đang chờ" },
                { value: "APPROVED", label: "Đã duyệt" },
                { value: "REJECTED", label: "Đã từ chối" },
              ],
            },
            {
              id: "student",
              label: "Học viên / mã học viên",
              type: "text",
              placeholder: "Nhập tên hoặc mã học viên...",
            },
            {
              id: "subject",
              label: "Môn học / học kỳ",
              type: "text",
              placeholder: "Nhập môn học hoặc học kỳ...",
            },
            {
              id: "grade",
              label: "Điểm đề xuất",
              type: "text",
              placeholder: "Nhập điểm...",
            },
            {
              id: "reason",
              label: "Lý do",
              type: "text",
              placeholder: "Nhập lý do...",
            },
          ]}
        />
        {proposals.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể tải đề xuất của lớp.
          </p>
        )}
        {review.isError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Không thể xử lý đề xuất. Hãy tải lại danh sách và thử lại.
          </p>
        )}
      </MilitarySection>
    </PageContainer>
  );
}
