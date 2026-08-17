"use client";

import { useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  HiOutlineChevronDown,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { semesterService } from "@/services/semesters";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { Semester } from "@/types/semesters";
import { formatDateTime } from "@/utils/fn-common";
import CreateSchoolYearForm from "./CreateSchoolYearForm";
import CreateSemesterForm from "./CreateSemesterForm";
import SemesterSkeleton from "./SemesterSkeleton";
import UpdateSemesterForm from "./UpdateSemesterForm";

type SemesterTableRow = Semester & {
  rowType: "schoolYear" | "semester";
  termCount?: number;
  subRows?: SemesterTableRow[];
  schoolYear?: string;
};

const getSchoolYearValue = (semester: Semester) =>
  semester.schoolYearInfo?.schoolYear || "";

export default function Main() {
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();

  const {
    data: semestersData,
    isLoading: isSemestersLoading,
    isError: isSemestersError,
    refetch: refetchSemesters,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Semester>({
    queryKey: [QUERY_KEYS.SEMESTERS],
    fetchData: (params) =>
      semesterService.getSemesters({ ...params, fetchAll: true }),
  });

  const groupedData = useMemo<
    PaginatedResponse<SemesterTableRow> | undefined
  >(() => {
    if (!semestersData) return undefined;

    const groups = new Map<string, SemesterTableRow[]>();
    for (const semester of semestersData.data || []) {
      const schoolYear = getSchoolYearValue(semester);
      const rows = groups.get(schoolYear) || [];
      rows.push({
        ...semester,
        rowType: "semester",
      });
      groups.set(schoolYear, rows);
    }

    const rows = Array.from(groups.entries()).map(([schoolYear, semesters]) => {
      const sortedSemesters = [...semesters].sort(
        (a, b) => Number(a.code) - Number(b.code)
      );
      const first = sortedSemesters[0];

      return {
        ...first,
        id: `school-year-${schoolYear}`,
        code: 0,
        schoolYear,
        rowType: "schoolYear" as const,
        termCount: sortedSemesters.length,
        subRows: sortedSemesters,
      };
    });

    return {
      ...semestersData,
      data: rows,
      pagination: {
        ...semestersData.pagination,
        total: rows.length,
        totalPages: 1,
        page: 1,
        limit: Math.max(rows.length, 1),
      },
    };
  }, [semestersData]);

  const deleteMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_SEMESTER,
    mutationFn: (id: string) => semesterService.deleteSemester(id),
    invalidateQueryKey: [QUERY_KEYS.SEMESTERS],
    successMessage: "Xóa học kỳ thành công!",
    errorMessage: "Xóa học kỳ thất bại!",
  });

  const handleAddSchoolYear = useCallback(() => {
    openModal({
      title: "Thêm năm học mới",
      content: <CreateSchoolYearForm />,
      size: "md",
      config: {
        mutationKey: MUTATION_KEYS.CREATE_SCHOOL_YEAR,
      },
    });
  }, [openModal]);

  const handleAddSemester = useCallback(
    (schoolYear?: string) => {
      openModal({
        title: "Thêm học kỳ mới",
        content: <CreateSemesterForm initialSchoolYear={schoolYear || ""} />,
        size: "md",
        config: {
          mutationKey: MUTATION_KEYS.CREATE_SEMESTER,
        },
      });
    },
    [openModal]
  );

  const handleOpenUpdateModal = useCallback(
    (semester: Semester) => {
      openModal({
        title: "Chỉnh sửa học kỳ",
        content: <UpdateSemesterForm semester={semester} />,
        size: "md",
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_SEMESTER,
        },
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<SemesterTableRow>[]>(
    () => [
      {
        id: "schoolYear",
        header: "Năm học",
        accessorKey: "schoolYear",
        cell: (info) => {
          const row = info.row.original;
          if (row.rowType === "schoolYear") {
            return (
              <button
                type="button"
                onClick={info.row.getToggleExpandedHandler()}
                className="flex items-center gap-2 text-left"
              >
                <HiOutlineChevronDown
                  className={`text-neutral-400 transition-transform ${
                    info.row.getIsExpanded() ? "rotate-180" : ""
                  }`}
                  size={18}
                />
                <Typography variant="body" weight="bold" color="neutral">
                  {row.schoolYear}
                </Typography>
                <Badge variant="primary">{row.termCount || 0} học kỳ</Badge>
              </button>
            );
          }

          return (
            <Typography variant="body" color="gray" className="pl-8">
              {row.schoolYear}
            </Typography>
          );
        },
      },
      {
        id: "code",
        header: "Học kỳ",
        accessorKey: "code",
        cell: (info) => {
          const row = info.row.original;
          if (row.rowType === "schoolYear") {
            return null;
          }

          return (
            <Typography variant="body" weight="semibold" color="neutral">
              Học kỳ {row.code}
            </Typography>
          );
        },
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        accessorKey: "createdAt",
        cell: (info) =>
          info.row.original.rowType === "semester" ? (
            <Typography
              variant="caption"
              weight="semibold"
              color="gray"
              className="whitespace-nowrap"
            >
              {formatDateTime(info.row.original.createdAt)}
            </Typography>
          ) : (
            <span />
          ),
      },
      {
        id: "updatedAt",
        header: "Ngày cập nhật",
        accessorKey: "updatedAt",
        cell: (info) =>
          info.row.original.rowType === "semester" ? (
            <Typography
              variant="caption"
              weight="semibold"
              color="gray"
              className="whitespace-nowrap"
            >
              {formatDateTime(info.row.original.updatedAt)}
            </Typography>
          ) : (
            <span />
          ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const row = info.row.original;
          if (row.rowType === "schoolYear") {
            return null;
          }

          return (
            <div className="flex items-center justify-start gap-1">
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                onClick={() => handleOpenUpdateModal(row)}
                color="blue"
              />

              <ActionButton
                tooltipText="Xóa học kỳ"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: `Bạn có chắc chắn muốn xóa học kỳ "${row.code}" không?`,
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_SEMESTER,
                    onConfirm: () => deleteMutation.mutate(row.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [deleteMutation, handleOpenUpdateModal, openConfirm]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "date-range",
        id: "schoolYear",
        label: "Năm học",
        mode: "YYYY",
        maxRange: 1,
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý năm học & học kỳ" },
      ]}
      title="Quản lý năm học & học kỳ"
      isLoading={isSemestersLoading}
      skeleton={<SemesterSkeleton />}
      isError={isSemestersError}
      onRetry={refetchSemesters}
    >
      <div className="bg-white px-4 dark:bg-neutral-950">
        <Table
          data={groupedData}
          columns={columns}
          pagination={pagination}
          onPaginationChange={setPagination}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          sorting={sorting}
          onSortingChange={setSorting}
          filterFields={filterOptions}
          emptyText="Không tìm thấy năm học hoặc học kỳ phù hợp"
          getSubRows={(row) => row.subRows}
          onBulkUpdate={handleAddSchoolYear}
          bulkUpdateLabel="Thêm năm học"
          onAdd={() => handleAddSemester()}
          addLabel="Thêm học kỳ"
        />
      </div>
    </PageContainer>
  );
}
