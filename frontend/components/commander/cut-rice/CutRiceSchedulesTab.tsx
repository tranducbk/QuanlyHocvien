"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineRefresh,
  HiOutlineUpload,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Button from "@/library/Button";
import ErrorState from "@/library/ErrorState";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import { semesterService } from "@/services/semesters";
import { downloadBlob } from "@/utils/fn-common";
import {
  CutRice,
  CutRiceDailySummary,
  CutRiceQueryRequest,
} from "@/types/cut-rice";
import DailyMealSummary from "@/components/meal-schedules/DailyMealSummary";
import MealDayCell from "@/components/meal-schedules/MealDayCell";
import { getMealSlots, MEAL_DAYS } from "@/utils/meal-schedule";
import CutRiceSkeleton from "./CutRiceSkeleton";
import EditCutRiceForm from "./EditCutRiceForm";
import ImportCutRiceForm from "./ImportCutRiceForm";
import { useModalStore } from "@/store/useModalStore";
import styles from "./CutRiceSchedulesTab.module.css";

const getCutRiceUser = (record: CutRice) => record.User || record.user;
const getCutRiceProfile = (record: CutRice) => {
  const user = getCutRiceUser(record);
  return user?.Profile || user?.profile;
};
const getStudentName = (record: CutRice) =>
  getCutRiceProfile(record)?.fullName ||
  getCutRiceUser(record)?.username ||
  record.userId;
const getUnitName = (record: CutRice) =>
  getCutRiceProfile(record)?.unit || "Chưa cập nhật đơn vị";

export default function CutRiceSchedulesTab() {
  const { openModal } = useModalStore();

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

  const cutRice = useTableQuery<
    CutRice,
    CutRiceQueryRequest,
    CutRiceDailySummary
  >({
    queryKey: [QUERY_KEYS.CUT_RICE],
    fetchData: cutRiceService.getCutRiceList,
  });

  const activeWeekStartDate = useMemo(() => {
    const weekFilter = cutRice.columnFilters.find(
      (filter) => filter.id === "weekStartDate"
    );
    return typeof weekFilter?.value === "string" ? weekFilter.value : undefined;
  }, [cutRice.columnFilters]);

  const generateAllMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.GENERATE_ALL_CUT_RICE,
    mutationFn: cutRiceService.generateAll,
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE],
    successMessage: "Tạo lịch cắt cơm tự động thành công!",
    errorMessage: "Tạo lịch cắt cơm thất bại!",
  });

  const generateOneMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.GENERATE_CUT_RICE,
    mutationFn: ({
      userId,
      semesterId,
      weekStartDate,
    }: {
      userId: string;
      semesterId?: string | null;
      weekStartDate?: string | null;
    }) =>
      cutRiceService.generateForStudent(
        userId,
        semesterId || undefined,
        weekStartDate || undefined
      ),
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE],
    successMessage: "Tạo lại lịch cắt cơm thành công!",
    errorMessage: "Tạo lại lịch cắt cơm thất bại!",
  });

  const exportMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.CUT_RICE, "export"],
    mutationFn: () => {
      const filterParams = cutRice.columnFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      return cutRiceService.exportExcel({
        ...filterParams,
        sortBy: cutRice.sorting[0]?.id,
        sortOrder: cutRice.sorting[0]?.desc ? "desc" : "asc",
      } as CutRiceQueryRequest);
    },
    successMessage: "Xuất Excel thành công!",
    errorMessage: "Xuất Excel thất bại!",
    onSuccess: (blob) => downloadBlob(blob, "lich-cat-com.xlsx"),
  });

  const handleImport = () => {
    openModal({
      title: "Nhập lịch cắt cơm từ Excel",
      content: <ImportCutRiceForm />,
      size: "md",
      config: { mutationKey: [QUERY_KEYS.CUT_RICE, "import"] },
    });
  };

  const scheduleColumns = useMemo<ColumnDef<CutRice>[]>(
    () => [
      {
        id: "unit",
        header: "Đơn vị",
        meta: { noWrap: true },
        cell: (info) => (
          <Typography variant="caption" weight="bold" color="gray">
            {getUnitName(info.row.original)}
          </Typography>
        ),
      },
      {
        id: "student",
        header: "Học viên",
        meta: { noWrap: true },
        cell: (info) => (
          <div>
            <Typography variant="body" weight="semibold" color="neutral">
              {getStudentName(info.row.original)}
            </Typography>
            <Typography variant="caption" color="gray">
              {getCutRiceProfile(info.row.original)?.code ||
                getCutRiceProfile(info.row.original)?.unit ||
                info.row.original.userId}
            </Typography>
          </div>
        ),
      },
      ...MEAL_DAYS.map<ColumnDef<CutRice>>((day) => ({
        id: `day-${day}`,
        header: () => (
          <span className={styles.dayHeader}>
            <span>{day === "Chủ nhật" ? "CN" : day.replace("Thứ ", "T")}</span>
          </span>
        ),
        enableSorting: false,
        meta: { noWrap: true },
        cell: (info) => (
          <MealDayCell slots={getMealSlots(info.row.original.weekly, day)} />
        ),
      })),
      {
        id: "actions",
        header: "Thao tác",
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className={styles.rowActions}>
              <ActionButton
                tooltipText="Chỉnh lịch cắt cơm"
                icon={HiOutlinePencil}
                color="blue"
                onClick={() =>
                  openModal({
                    title: "Chỉnh lịch cắt cơm",
                    content: <EditCutRiceForm record={record} />,
                    size: "xl",
                  })
                }
              />
              <ActionButton
                tooltipText="Tạo lại tự động"
                icon={HiOutlineRefresh}
                color="green"
                onClick={() =>
                  generateOneMutation.mutate({
                    userId: record.userId,
                    semesterId: record.semesterId,
                    weekStartDate: record.weekStartDate,
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [generateOneMutation, openModal]
  );

  const filterOptions = useMemo<FilterField[]>(
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
        type: "date",
        id: "weekStartDate",
        label: "Tuần áp dụng",
        placeholder: "Chọn ngày trong tuần",
      },
    ],
    [isLoadingSemesters, semesterOptions]
  );

  if (cutRice.isLoading) return <CutRiceSkeleton />;

  if (cutRice.isError) {
    return (
      <ErrorState
        title="Không thể tải lịch cắt cơm"
        message={cutRice.error?.message || "Vui lòng thử lại sau ít phút."}
        onRetry={() => cutRice.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Table
        data={cutRice.data}
        columns={scheduleColumns}
        pagination={cutRice.pagination}
        onPaginationChange={cutRice.setPagination}
        columnFilters={cutRice.columnFilters}
        onColumnFiltersChange={cutRice.setColumnFilters}
        sorting={cutRice.sorting}
        onSortingChange={cutRice.setSorting}
        filterFields={filterOptions}
        defaultFilterOpen
        showIndex={false}
        showVisibilityToggle={false}
        enableColumnOrdering={false}
        className={styles.matrixTable}
        contentBeforeTable={
          <div className={styles.overview}>
            <DailyMealSummary
              summary={cutRice.data?.summary}
              weekStartDate={activeWeekStartDate}
            />
            <div className={styles.legend}>
              <strong>Quy ước:</strong>
              <span className={styles.cutLegend}>×: Cắt cơm</span>
              <span className={styles.mutedText}>Ô trống: không cắt</span>
            </div>
          </div>
        }
        emptyText="Không tìm thấy lịch cắt cơm"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={handleImport}
              icon={HiOutlineUpload}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-600 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-primary-700 hover:border-primary-700 transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95 h-auto"
            >
              Nhập Excel
            </Button>
            <Button
              type="button"
              onClick={() => exportMutation.mutate()}
              isLoading={exportMutation.isPending}
              icon={HiOutlineDownload}
              className="flex items-center gap-2 px-4 py-2 bg-secondary-500 border border-secondary-500 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-secondary-600 hover:border-secondary-600 transition-all shadow-lg shadow-secondary-500/20 cursor-pointer active:scale-95 h-auto"
            >
              Xuất Excel
            </Button>
            <Button
              type="button"
              onClick={() => generateAllMutation.mutate()}
              isLoading={generateAllMutation.isPending}
              icon={HiOutlineRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 border border-emerald-600 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-emerald-700 hover:border-emerald-700 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 h-auto"
            >
              Tạo tự động
            </Button>
          </div>
        }
      />
    </div>
  );
}
