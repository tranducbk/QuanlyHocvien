"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import ErrorState from "@/library/ErrorState";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import { semesterService } from "@/services/semesters";
import { formatDateTime } from "@/utils/fn-common";
import { CutRiceRequest } from "@/types/cut-rice";
import CutRiceSkeleton from "./CutRiceSkeleton";

const mealDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const getCutRiceUser = (record: CutRiceRequest) => record.User || record.user;
const getCutRiceProfile = (record: CutRiceRequest) => {
  const user = getCutRiceUser(record);
  return user?.Profile || user?.profile;
};
const getStudentName = (record: CutRiceRequest) =>
  getCutRiceProfile(record)?.fullName ||
  getCutRiceUser(record)?.username ||
  record.userId;
const getSlot = (record: Pick<CutRiceRequest, "weekly">, day: string) => {
  const weekly = record.weekly || {};
  return weekly[day] || weekly[day.toLowerCase()] || {};
};
const getSemesterText = (record: CutRiceRequest) => {
  const semester = record.semesterInfo;
  return semester
    ? `${semester.schoolYearInfo?.schoolYear || ""} - Học kỳ ${semester.code}`.trim()
    : "Chưa gắn học kỳ";
};
const formatWeekRange = (start?: string | null, end?: string | null) =>
  start && end
    ? `${start.split("-").reverse().join("/")} - ${end.split("-").reverse().join("/")}`
    : "Chưa gắn tuần";
const getRequestStatus = (request: CutRiceRequest) => {
  if (request.status === "APPROVED") return { label: "Đã duyệt", variant: "success" as const };
  if (request.status === "REJECTED") return { label: "Từ chối", variant: "error" as const };
  return { label: "Chờ duyệt", variant: "warning" as const };
};

export default function CutRiceRequestsTab() {
  const queryClient = useQueryClient();

  const { data: semestersData, isLoading: isLoadingSemesters } = useQuery({
    queryKey: [QUERY_KEYS.SEMESTERS, "cut-rice-options"],
    queryFn: () => semesterService.getSemesters({ fetchAll: true }),
  });

  const semesterOptions = useMemo(
    () =>
      (semestersData?.data || []).map((semester) => ({
        value: semester.id,
        label: [
          semester.schoolYearInfo?.schoolYear,
          `Học kỳ ${semester.code}`,
        ]
          .filter(Boolean)
          .join(" - "),
      })),
    [semestersData?.data]
  );

  const requests = useTableQuery<CutRiceRequest>({
    queryKey: [QUERY_KEYS.CUT_RICE_REQUESTS],
    fetchData: cutRiceService.getRequests,
  });

  const approveMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.APPROVE_CUT_RICE_REQUEST,
    mutationFn: (id: string) => cutRiceService.approveRequest(id),
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE_REQUESTS],
    successMessage: "Duyệt yêu cầu cắt cơm thành công!",
    errorMessage: "Duyệt yêu cầu thất bại!",
    onSuccess: async () => {
      await requests.refetch();
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUT_RICE] });
    },
  });

  const rejectMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.REJECT_CUT_RICE_REQUEST,
    mutationFn: (id: string) => cutRiceService.rejectRequest(id),
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE_REQUESTS],
    successMessage: "Từ chối yêu cầu cắt cơm thành công!",
    errorMessage: "Từ chối yêu cầu thất bại!",
    onSuccess: async () => {
      await requests.refetch();
    },
  });

  const requestColumns = useMemo<ColumnDef<CutRiceRequest>[]>(
    () => [
      {
        id: "student",
        header: "Học viên",
        cell: (info) => (
          <div>
            <Typography variant="body" weight="semibold" color="neutral">
              {getStudentName(info.row.original)}
            </Typography>
            <Typography variant="caption" color="gray">
              {getCutRiceProfile(info.row.original)?.code || info.row.original.userId}
            </Typography>
          </div>
        ),
      },
      {
        id: "semester",
        header: "Học kỳ",
        cell: (info) => (
          <Typography variant="caption" color="gray">
            {getSemesterText(info.row.original)}
          </Typography>
        ),
      },
      {
        id: "weekly",
        header: "Đề xuất",
        cell: (info) => (
          <div className="flex max-w-xl flex-wrap gap-1">
            {mealDays.map((day) => {
              const slot = getSlot(info.row.original, day);
              const count = Number(!!slot.morning) + Number(!!slot.noon) + Number(!!slot.evening);
              return count ? (
                <Badge key={day} variant="secondary">
                  {day}: {count}/3
                </Badge>
              ) : null;
            })}
          </div>
        ),
      },
      {
        id: "week",
        header: "Tuần",
        cell: (info) => (
          <Typography variant="caption" color="gray">
            {formatWeekRange(info.row.original.weekStartDate, info.row.original.weekEndDate)}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: (info) => {
          const status = getRequestStatus(info.row.original);
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        id: "notes",
        header: "Ghi chú",
        cell: (info) => (
          <Typography variant="caption" color="gray">
            {info.row.original.reviewNote || info.row.original.notes || "Không có ghi chú"}
          </Typography>
        ),
      },
      {
        id: "createdAt",
        header: "Ngày gửi",
        cell: (info) => (
          <Typography variant="caption" color="gray">
            {formatDateTime(info.row.original.createdAt)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: (info) => {
          const record = info.row.original;
          if (record.status !== "PENDING") {
            return (
              <Typography variant="caption" color="gray">
                Đã xử lý
              </Typography>
            );
          }

          return (
            <div className="flex items-center gap-1">
              <ActionButton
                tooltipText="Duyệt yêu cầu"
                icon={HiOutlineCheck}
                color="green"
                onClick={() => approveMutation.mutate(record.id)}
              />
              <ActionButton
                tooltipText="Từ chối yêu cầu"
                icon={HiOutlineX}
                color="red"
                onClick={() => rejectMutation.mutate(record.id)}
              />
            </div>
          );
        },
      },
    ],
    [approveMutation, rejectMutation]
  );

  const requestFilterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        id: "semesterId",
        label: "Học kỳ",
        placeholder: "Chọn học kỳ",
        options: semesterOptions,
        isLoading: isLoadingSemesters,
      },
      {
        type: "text",
        id: "fullName",
        label: "Tên học viên",
        placeholder: "Nhập tên học viên...",
      },
      {
        type: "text",
        id: "userId",
        label: "User ID",
        placeholder: "Nhập userId...",
      },
      {
        type: "date",
        id: "weekStartDate",
        label: "Tuần áp dụng",
        placeholder: "Chọn ngày trong tuần",
      },
      {
        type: "select",
        id: "status",
        label: "Trạng thái",
        placeholder: "Chọn trạng thái",
        options: [
          { value: "PENDING", label: "Chờ duyệt" },
          { value: "APPROVED", label: "Đã duyệt" },
          { value: "REJECTED", label: "Từ chối" },
        ],
      },
    ],
    [isLoadingSemesters, semesterOptions]
  );

  if (requests.isLoading) return <CutRiceSkeleton />;

  if (requests.isError) {
    return (
      <ErrorState
        title="Không thể tải yêu cầu cắt cơm"
        message={requests.error?.message || "Vui lòng thử lại sau ít phút."}
        onRetry={() => requests.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Table
        data={requests.data}
        columns={requestColumns}
        pagination={requests.pagination}
        onPaginationChange={requests.setPagination}
        columnFilters={requests.columnFilters}
        onColumnFiltersChange={requests.setColumnFilters}
        sorting={requests.sorting}
        onSortingChange={requests.setSorting}
        filterFields={requestFilterOptions}
        emptyText="Không tìm thấy yêu cầu cắt cơm"
      />
    </div>
  );
}
