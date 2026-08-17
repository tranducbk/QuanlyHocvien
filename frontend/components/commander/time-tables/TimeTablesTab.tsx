"use client";

import { useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineDocumentDownload,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUpload,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import ErrorState from "@/library/ErrorState";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { timeTableService } from "@/services/time-tables";
import { semesterService } from "@/services/semesters";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { downloadBlob, formatDateTime, formatSemesterYear } from "@/utils/fn-common";
import { TimeTable, TimeTableQueryRequest } from "@/types/time-tables";

import CreateTimeTableForm from "./CreateTimeTableForm";
import ImportTimeTablesForm from "./ImportTimeTablesForm";
import TimeTableCalendar from "./DetailTimeTable";
import UpdateTimeTableForm from "./UpdateTimeTableForm";
import TimeTablesSkeleton from "./TimeTablesSkeleton";


export default function TimeTablesTab() {
  const { openModal } = useModalStore();
  const { openConfirm } = useConfirmStore();

  const {
    data,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    isLoading,
    isError,
    error,
    refetch,
  } = useTableQuery<TimeTable>({
    queryKey: [QUERY_KEYS.TIME_TABLES],
    fetchData: timeTableService.getTimeTables,
  });

  const deleteTimeTableMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_TIME_TABLE,
    mutationFn: (id: string) => timeTableService.deleteTimeTable(id),
    invalidateQueryKey: [QUERY_KEYS.TIME_TABLES],
    successMessage: "Xóa lịch học thành công!",
    errorMessage: "Xóa lịch học thất bại!",
  });

  const exportMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.TIME_TABLES, "export"],
    mutationFn: () => {
      const filterParams = columnFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      return timeTableService.exportTimeTables({
        ...filterParams,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      } as TimeTableQueryRequest);
    },
    successMessage: "Xuất báo cáo thành công!",
    errorMessage: "Xuất báo cáo thất bại!",
    onSuccess: (blob) => downloadBlob(blob, "bao-cao-thoi-khoa-bieu.xlsx"),
  });

  const handleAddTimeTable = () =>
    openModal({
      title: "Nhập lịch học",
      content: <CreateTimeTableForm />,
      size: "2xl",
      config: { mutationKey: MUTATION_KEYS.CREATE_TIME_TABLE },
    });

  const handleImportTimeTables = useCallback(() => {
    openModal({
      title: "Nhập thời khóa biểu từ Excel",
      content: <ImportTimeTablesForm />,
      size: "md",
      config: { mutationKey: [QUERY_KEYS.TIME_TABLES, "import"] },
    });
  }, [openModal]);

  const handleEditTimeTable = useCallback(
    (timeTable: TimeTable) =>
      openModal({
        title: "Cập nhật lịch học",
        content: <UpdateTimeTableForm timeTable={timeTable} />,
        size: "2xl",
        config: { mutationKey: MUTATION_KEYS.UPDATE_TIME_TABLE },
      }),
    [openModal]
  );

  const handleViewTimeTable = useCallback(
    (timeTable: TimeTable) =>
      openModal({
        title: "Chi tiết lịch học",
        content: <TimeTableCalendar timeTable={timeTable} />,
        size: "2xl",
      }),
    [openModal]
  );

  const columns = useMemo<ColumnDef<TimeTable>[]>(
    () => [
      {
        id: "student",
        header: "Học viên",
        meta: { noWrap: true },
        cell: (info) => (
          <div>
            <Typography variant="body" weight="semibold" color="neutral">
              {info.row.original.user?.profile?.fullName || "---"}
            </Typography>
            <Typography variant="caption" color="gray">
              {info.row.original.user?.profile?.code || "Chưa có mã học viên"}
            </Typography>
          </div>
        ),
      },
      {
        id: "scheduleCount",
        header: "Số buổi",
        cell: (info) => (
          <Badge variant="primary">
            {info.row.original.scheduleCount ??
              info.row.original.schedules?.length ??
              0}{" "}
            buổi
          </Badge>
        ),
      },
      {
        id: "semester",
        header: "Học kỳ",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {formatSemesterYear(
              info.row.original.semester?.code,
              info.row.original.semester?.schoolYearInfo?.schoolYear
            )}
          </Typography>
        ),
      },
      {
        id: "subjects",
        header: "Môn học",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {info.row.original.subjectNames?.join(", ") ||
              info.row.original.schedules
                ?.map((schedule) => schedule.subjectName)
                .filter(Boolean)
                .join(", ") ||
              "--"}
          </Typography>
        ),
      },
      {
        id: "rooms",
        header: "Phòng",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {info.row.original.rooms?.join(", ") || "--"}
          </Typography>
        ),
      },
      {
        id: "updatedAt",
        header: "Cập nhật",
        cell: (info) => (
          <Typography variant="caption" color="gray">
            {formatDateTime(info.row.original.updatedAt)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex gap-1">
              <ActionButton
                tooltipText="Xem chi tiết"
                icon={HiOutlineEye}
                color="secondary"
                onClick={() => handleViewTimeTable(record)}
              />
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                color="blue"
                onClick={() => handleEditTimeTable(record)}
              />
              <ActionButton
                tooltipText="Xóa"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: "Bạn có chắc muốn xóa lịch học này?",
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_TIME_TABLE,
                    onConfirm: () => deleteTimeTableMutation.mutate(record.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [
      deleteTimeTableMutation,
      handleEditTimeTable,
      handleViewTimeTable,
      openConfirm,
    ]
  );

  const { data: semestersResponse } = useQuery({
    queryKey: [QUERY_KEYS.SEMESTERS, "time-table-options"],
    queryFn: () => semesterService.getSemesters({ fetchAll: true }),
  });

  const semesters = useMemo(
    () => semestersResponse?.data || [],
    [semestersResponse]
  );

  const semesterCodeOptions = useMemo(
    () =>
      [...new Set(semesters.map((semester) => semester.code))]
        .sort((a, b) => a - b)
        .map((code) => ({ value: String(code), label: `Học kỳ ${code}` })),
    [semesters]
  );

  const schoolYearOptions = useMemo(
    () =>
      [
        ...new Set(
          semesters
            .map((semester) => semester.schoolYearInfo?.schoolYear)
            .filter((schoolYear): schoolYear is string => Boolean(schoolYear))
        ),
      ]
        .sort()
        .map((schoolYear) => ({ value: schoolYear, label: schoolYear })),
    [semesters]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "fullName",
        label: "Tên học viên",
        placeholder: "Nhập tên học viên...",
      },
      {
        type: "text",
        id: "code",
        label: "Mã học viên",
        placeholder: "Nhập mã học viên...",
      },
      {
        type: "select",
        id: "schoolYear",
        label: "Năm học",
        placeholder: "Chọn năm học",
        options: schoolYearOptions,
      },
      {
        type: "select",
        id: "semester",
        label: "Học kỳ",
        placeholder: "Chọn học kỳ",
        options: semesterCodeOptions,
      },
    ],
    [schoolYearOptions, semesterCodeOptions]
  );

  if (isLoading) return <TimeTablesSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải lịch học"
        message={error?.message || "Vui lòng thử lại sau ít phút."}
        onRetry={refetch}
      />
    );
  }

  return (
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
      emptyText="Không tìm thấy lịch học"
      onAdd={handleAddTimeTable}
      addLabel="Nhập lịch học"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleImportTimeTables}
            icon={HiOutlineUpload}
            className="flex h-auto items-center gap-2 rounded-xl border border-primary-600 bg-primary-600 px-4 py-2 text-[11px]! font-black! uppercase tracking-wider text-white shadow-lg shadow-primary-500/20 transition-all hover:border-primary-700 hover:bg-primary-700 active:scale-95"
          >
            Nhập Excel
          </Button>
          <Button
            type="button"
            onClick={() => exportMutation.mutate()}
            isLoading={exportMutation.isPending}
            icon={HiOutlineDocumentDownload}
            className="flex h-auto items-center gap-2 rounded-xl border border-secondary-500 bg-secondary-500 px-4 py-2 text-[11px]! font-black! uppercase tracking-wider text-white shadow-lg shadow-secondary-500/20 transition-all hover:border-secondary-600 hover:bg-secondary-600 active:scale-95"
          >
            Xuất báo cáo
          </Button>
        </div>
      }
    />
  );
}
