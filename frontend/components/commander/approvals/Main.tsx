"use client";

import { useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
  HiOutlineEye,
  HiOutlineXCircle,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { gradeRequestService } from "@/services/grade-requests";
import { useModalStore } from "@/store/useModalStore";
import {
  GradeRequest,
  GradeRequestQueryRequest,
  requestTypeMap,
  statusMap,
} from "@/types/student-academic";
import {
  formatDate,
  formatScore,
  textOrDash,
  formatSemesterYear,
} from "@/utils/fn-common";
import ApprovalGradeRequestForm from "./ApprovalGradeRequestForm";
import GradeRequestDetail from "./GradeRequestDetail";
import RejectGradeRequestForm from "./RejectGradeRequestForm";

type ReviewAction = "approve" | "reject";

const getSemesterLabel = (request: GradeRequest) => {
  const semester = request.subjectResult?.semesterResult;
  return formatSemesterYear(semester?.semester, semester?.schoolYear);
};

export default function Main() {
  const { openModal } = useModalStore();

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
    queryKey: [QUERY_KEYS.COMMANDER_GRADE_REQUESTS],
    fetchData: gradeRequestService.getCommanderGradeRequests,
  });

  const openReviewModal = useCallback(
    (request: GradeRequest, action: ReviewAction) => {
      openModal({
        title: action === "approve" ? "Phê duyệt đề xuất" : "Từ chối đề xuất",
        size: "lg",
        config: {
          mutationKey:
            action === "approve"
              ? MUTATION_KEYS.APPROVE_GRADE_REQUEST
              : MUTATION_KEYS.REJECT_GRADE_REQUEST,
        },
        content:
          action === "approve" ? (
            <ApprovalGradeRequestForm request={request} />
          ) : (
            <RejectGradeRequestForm request={request} />
          ),
      });
    },
    [openModal]
  );

  const openDetailModal = useCallback(
    (request: GradeRequest) => {
      openModal({
        title: "Chi tiết đề xuất kết quả học tập",
        size: "lg",
        content: <GradeRequestDetail request={request} />,
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<GradeRequest>[]>(
    () => [
      {
        id: "createdAt",
        header: "Ngày gửi",
        accessorKey: "createdAt",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "student",
        header: "Học viên",
        meta: { noWrap: true },
        cell: ({ row }) => (
          <>
            <Typography variant="body" weight="semibold" color="neutral">
              {textOrDash(row.original.user?.profile?.fullName)}
            </Typography>
            <Typography variant="caption" color="gray">
              {row.original.user?.profile?.code || "Chưa có mã học viên"}
            </Typography>
          </>
        ),
      },
      {
        id: "subject",
        header: "Môn học",
        cell: ({ row }) => (
          <div className="min-w-48">
            <Typography variant="body" weight="semibold" color="neutral">
              {textOrDash(row.original.subjectResult?.subjectName)}
            </Typography>
            <Typography variant="caption" color="gray">
              {getSemesterLabel(row.original)}
            </Typography>
          </div>
        ),
      },
      {
        id: "requestType",
        header: "Loại",
        accessorKey: "requestType",
        meta: { noWrap: true },
        cell: ({ row }) => requestTypeMap[row.original.requestType],
      },
      {
        id: "score",
        header: "Điểm",
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
            {formatScore(row.original.subjectResult?.gradePoint10)}
            <span className="mx-2 text-neutral-300 dark:text-neutral-600">
              →
            </span>
            <span className="font-bold text-primary-600 dark:text-primary-400">
              {formatScore(row.original.proposedGradePoint10)}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge variant={statusMap[row.original.status].variant}>
            {statusMap[row.original.status].label}
          </Badge>
        ),
      },
      {
        id: "reviewNote",
        header: "Phản hồi",
        accessorKey: "reviewNote",
        cell: ({ row }) => row.original.reviewNote || "Chưa có",
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
          const request = row.original;
          const isPending = request.status === "PENDING";

          return (
            <div className="flex items-center gap-1">
              <ActionButton
                tooltipText="Xem chi tiết"
                icon={
                  request.attachmentUrl ? HiOutlineExternalLink : HiOutlineEye
                }
                color="blue"
                onClick={() => openDetailModal(request)}
              />
              {isPending && (
                <>
                  <ActionButton
                    tooltipText="Phê duyệt"
                    icon={HiOutlineCheckCircle}
                    color="green"
                    disabled={!isPending}
                    onClick={() => openReviewModal(request, "approve")}
                  />
                  <ActionButton
                    tooltipText="Từ chối"
                    icon={HiOutlineXCircle}
                    color="red"
                    disabled={!isPending}
                    onClick={() => openReviewModal(request, "reject")}
                  />
                </>
              )}
            </div>
          );
        },
      },
    ],
    [openDetailModal, openReviewModal]
  );

  const filterOptions = useMemo(
    () => [
      {
        id: "status",
        label: "Trạng thái",
        type: "select" as const,
        options: Object.entries(statusMap).map(([value, item]) => ({
          value,
          label: item.label,
        })),
      },
      {
        id: "requestType",
        label: "Loại đề xuất",
        type: "select" as const,
        options: Object.entries(requestTypeMap).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        id: "fullName",
        label: "Họ tên",
        type: "text" as const,
        placeholder: "Nhập họ tên học viên...",
      },
      {
        id: "code",
        label: "Mã học viên",
        type: "text" as const,
        placeholder: "Nhập mã học viên...",
      },
      {
        id: "semester",
        label: "Học kỳ",
        type: "text" as const,
        placeholder: "VD: 2024-2025-HK2",
      },
      {
        id: "schoolYear",
        label: "Năm học",
        type: "text" as const,
        placeholder: "VD: 2025-2026",
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Phê duyệt đề xuất" },
      ]}
      title="Phê duyệt đề xuất kết quả học tập"
      subtitle="Xem, kiểm tra minh chứng và phê duyệt hoặc từ chối các đề xuất chỉnh sửa điểm từ học viên."
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng đề xuất",
            value: (data?.pagination?.total || 0).toLocaleString("vi-VN"),
            helper: "Đề xuất đã ghi nhận",
            className: "bg-primary-50 text-primary-700 border-primary-100",
          },
          {
            label: "Chờ duyệt",
            value: (
              data?.data?.filter((item) => item.status === "PENDING").length ||
              0
            ).toLocaleString("vi-VN"),
            helper: "Đề xuất cần xử lý",
            className: "bg-amber-50 text-amber-700 border-amber-100",
          },
          {
            label: "Đã duyệt",
            value: (
              data?.data?.filter((item) => item.status === "APPROVED").length ||
              0
            ).toLocaleString("vi-VN"),
            helper: "Đề xuất đã phê duyệt",
            className: "bg-emerald-50 text-emerald-700 border-emerald-100",
          },
          {
            label: "Từ chối",
            value: (
              data?.data?.filter((item) => item.status === "REJECTED").length ||
              0
            ).toLocaleString("vi-VN"),
            helper: "Đề xuất không hợp lệ",
            className: "bg-red-50 text-red-700 border-red-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 shadow-sm ${card.className}`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black leading-none">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-semibold opacity-70">
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white dark:bg-neutral-950">
        <Table
          data={data}
          columns={columns}
          pagination={pagination}
          onPaginationChange={setPagination}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          sorting={sorting}
          onSortingChange={setSorting}
          filterFields={filterOptions}
          emptyText="Không có đề xuất kết quả học tập nào"
        />
      </div>
    </PageContainer>
  );
}
