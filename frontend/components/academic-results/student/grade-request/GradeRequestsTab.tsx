"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ColumnDef } from "@tanstack/react-table";
import { QUERY_KEYS } from "@/constants/query-keys";
import useTableQuery from "@/hooks/useTableQuery";
import Button from "@/library/Button";
import Badge from "@/library/Badge";
import ErrorState from "@/library/ErrorState";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Table from "@/library/Table";
import Textarea from "@/library/Textarea";
import { gradeRequestService } from "@/services/academic-results/grade-requests";
import { trainingClassAcademicService } from "@/services/academic-results/training-class-academic";
import {
  GradeRequest,
  GradeRequestQueryRequest,
  requestTypeMap,
  statusMap,
} from "@/types/academic-results/student-academic";
import GradeRequestsSkeleton from "./GradeRequestsSkeleton";
import { formatDate, formatScore } from "@/utils/fn-common";



export default function GradeRequestsTab() {
  const trainingSystemCode = useAuthStore((state) => state.user?.trainingSystemCode);
  const isCohort = Boolean(trainingSystemCode && trainingSystemCode !== "HE_5");
  const queryClient = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [attemptNo, setAttemptNo] = useState("1");
  const [midtermScore, setMidtermScore] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [reason, setReason] = useState("");
  const [mutationMessage, setMutationMessage] = useState("");
  const subjectsQuery = useQuery({
    queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, "me", "subjects"],
    queryFn: trainingClassAcademicService.getMySubjects,
    enabled: isCohort,
  });
  const createProposal = useMutation({
    mutationFn: () =>
      trainingClassAcademicService.createProposal({
        subjectId,
        attemptNo: Number(attemptNo),
        midtermScore: Number(midtermScore),
        finalScore: Number(finalScore),
        reason: reason.trim(),
      }),
    onSuccess: async () => {
      setSubjectId("");
      setAttemptNo("1");
      setMidtermScore("");
      setFinalScore("");
      setReason("");
      setMutationMessage("Đã gửi đề xuất điểm.");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, "me", "proposals"],
      });
    },
    onError: (error) => {
      setMutationMessage(
        error instanceof Error ? error.message : "Không gửi được đề xuất điểm."
      );
    },
  });
  const {
    data,
    isLoading,
    isError,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<GradeRequest, GradeRequestQueryRequest>({
    queryKey: isCohort
      ? [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, "me", "proposals"]
      : [QUERY_KEYS.STUDENT_GRADE_REQUESTS],
    fetchData: async (params) => {
      if (!isCohort) return gradeRequestService.getStudentGradeRequests(params);

      const response = await trainingClassAcademicService.getMyProposals();
      const proposals = (response.data || [])
        .filter((proposal) => !params.status || proposal.status === params.status)
        .map((proposal): GradeRequest => ({
          id: proposal.id,
          userId: proposal.profileId,
          subjectResultId: proposal.subjectId,
          requestType: "ADD",
          status: proposal.status,
          reason: proposal.reason,
          proposedGradePoint10:
            (Number(proposal.midtermScore) + Number(proposal.finalScore)) / 2,
          reviewNote: proposal.reviewNote,
          createdAt: proposal.createdAt,
          subjectResult: {
            id: proposal.subjectId,
            semesterResultId: proposal.semesterId,
            subjectCode: proposal.trainingClassSubject.subjectCode,
            subjectName: proposal.trainingClassSubject.subjectName,
            note: `Lần thi ${proposal.attemptNo}`,
          },
        }));
      return {
        statusCode: response.statusCode,
        message: response.message,
        data: proposals,
        pagination: {
          total: proposals.length,
          page: 1,
          limit: Math.max(proposals.length, 1),
          totalPages: 1,
        },
      };
    },
    enabled: trainingSystemCode === "HE_5" || isCohort,
  });

  const handleSubmitProposal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMutationMessage("");
    createProposal.mutate();
  };

  const columns = useMemo<ColumnDef<GradeRequest>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Ngày gửi",
        cell: ({ row }) =>
          formatDate(row.original.createdAt)
      },
      {
        id: "subject",
        header: "Môn học",
        cell: ({ row }) => (
          <div>
            <span>{row.original.subjectResult?.subjectName || "---"}</span>
            {isCohort && row.original.subjectResult?.note && (
              <span className="mt-1 block text-xs text-neutral-500">
                {row.original.subjectResult.note}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "requestType",
        header: "Loại",
        cell: ({ row }) =>
           requestTypeMap[row.original.requestType]
      },
      {
        accessorKey: "proposedGradePoint10",
        header: "Điểm đề xuất",
        cell: ({ row }) => formatScore(row.original.proposedGradePoint10),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={statusMap[row.original.status].variant}>
            {statusMap[row.original.status].label}
          </Badge>
        ),
      },
      {
        accessorKey: "reason",
        header: "Lý do",
        cell: ({ row }) => row.original.reason || "---",
      },
      {
        accessorKey: "reviewNote",
        header: "Phản hồi",
        cell: ({ row }) => row.original.reviewNote || "Chưa có",
      },
    ],
    [isCohort]
  );

  if (isLoading) {
    return <GradeRequestsSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isCohort && (
        <>
          {subjectsQuery.isError && (
            <ErrorState
              title="Không thể tải danh sách môn học"
              message={
                subjectsQuery.error instanceof Error
                  ? subjectsQuery.error.message
                  : undefined
              }
              onRetry={() => void subjectsQuery.refetch()}
            />
          )}
          <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Gửi đề xuất điểm
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Điểm giữa kỳ và cuối kỳ đều bắt buộc, mỗi điểm chiếm 50%. Đề xuất đã gửi không thể sửa hoặc xóa.
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitProposal}>
            <Select
              label="Môn học"
              placeholder="Chọn môn học"
              value={subjectId}
              onChange={(value) => setSubjectId(String(value))}
              isLoading={subjectsQuery.isLoading}
              options={(subjectsQuery.data?.data || []).map((subject) => ({
                value: subject.id,
                label: `${subject.trainingClassSemester.schoolYear} · HK ${subject.trainingClassSemester.code} · ${subject.subjectName}`,
              }))}
              required
            />
            <Input
              label="Lần thi"
              type="number"
              min={1}
              max={20}
              value={attemptNo}
              onChange={(event) => setAttemptNo(event.target.value)}
              required
            />
            <Input
              label="Điểm giữa kỳ"
              type="number"
              min={0}
              max={10}
              step="0.01"
              value={midtermScore}
              onChange={(event) => setMidtermScore(event.target.value)}
              required
            />
            <Input
              label="Điểm cuối kỳ"
              type="number"
              min={0}
              max={10}
              step="0.01"
              value={finalScore}
              onChange={(event) => setFinalScore(event.target.value)}
              required
            />
            <Textarea
              label="Lý do"
              minLength={5}
              maxLength={2000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              className="md:col-span-2"
            />
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button
                type="submit"
                isLoading={createProposal.isPending}
                disabled={
                  !subjectId ||
                  !attemptNo ||
                  Number(attemptNo) < 1 ||
                  !midtermScore ||
                  !finalScore ||
                  !reason.trim() ||
                  !subjectsQuery.data?.data?.length
                }
              >
                Gửi đề xuất
              </Button>
              {mutationMessage && (
                <p
                  role="status"
                  className={`text-sm ${createProposal.isError ? "text-error-600" : "text-emerald-600"}`}
                >
                  {mutationMessage}
                </p>
              )}
            </div>
          </form>
          </section>
        </>
      )}
      <Table
        data={data}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        sorting={sorting}
        onSortingChange={setSorting}
        filterFields={[
          {
            id: "status",
            label: "Trạng thái",
            type: "select",
            options: Object.entries(statusMap).map(([value, item]) => ({
              value,
              label: item.label,
            })),
          },
        ]}
        emptyText="Chưa có đề xuất chỉnh sửa điểm"
      />
    </div>
  );
}
