"use client";

import { useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  HiOutlineDocumentDownload,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineClock,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { tuitionFeeService } from "@/services/tuition-fees";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { TuitionFee } from "@/types/tuition-fees";
import {
  formatDateTime,
  formatCurrency,
  textOrDash,
  formatSemesterYear,
  downloadBlob,
} from "@/utils/fn-common";
import CreateTuitionFeeForm from "./CreateTuitionFeeForm";
import ImportTuitionFeesForm from "./ImportTuitionFeesForm";
import TuitionSkeleton from "./TuitionSkeleton";
import UpdateTuitionFeeForm from "./UpdateTuitionFeeForm";
import TuitionHistoryModal from "./TuitionHistoryModal";

export default function Main() {
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();

  const {
    data: tuitionFeesData,
    isLoading,
    isError,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<TuitionFee>({
    queryKey: [QUERY_KEYS.TUITION_FEES],
    fetchData: tuitionFeeService.getTuitionFees,
  });

  const deleteMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_TUITION_FEE,
    mutationFn: (id: string) => tuitionFeeService.deleteTuitionFee(id),
    invalidateQueryKey: [QUERY_KEYS.TUITION_FEES],
    successMessage: "Xóa bản ghi học phí thành công!",
    errorMessage: "Xóa bản ghi học phí thất bại!",
  });

  const exportMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.EXPORT_TUITION_REPORT,
    mutationFn: tuitionFeeService.exportTuitionReport,
    successMessage: "Xuất báo cáo học phí thành công!",
    errorMessage: "Xuất báo cáo học phí thất bại!",
    onSuccess: (blob) => downloadBlob(blob, "bao-cao-hoc-phi.xlsx"),
  });

  const handleAdd = useCallback(() => {
    openModal({
      title: "Ghi nhận học phí",
      content: <CreateTuitionFeeForm />,
      size: "lg",
      config: { mutationKey: MUTATION_KEYS.CREATE_TUITION_FEE },
    });
  }, [openModal]);

  const handleImport = useCallback(() => {
    openModal({
      title: "Nhập học phí từ Excel",
      content: <ImportTuitionFeesForm />,
      size: "lg",
      config: { mutationKey: MUTATION_KEYS.IMPORT_TUITION_FEES },
    });
  }, [openModal]);

  const handleUpdate = useCallback(
    (tuitionFee: TuitionFee) => {
      openModal({
        title: "Cập nhật học phí",
        content: <UpdateTuitionFeeForm tuitionFee={tuitionFee} />,
        size: "lg",
        config: { mutationKey: MUTATION_KEYS.UPDATE_TUITION_FEE },
      });
    },
    [openModal]
  );

  const handleViewHistory = useCallback(
    (tuitionFee: TuitionFee) => {
      openModal({
        title: "Lịch sử cập nhật",
        content: <TuitionHistoryModal tuitionFeeId={tuitionFee.id} />,
        size: "lg",
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<TuitionFee>[]>(
    () => [
      {
        id: "studentId",
        header: "Học viên",
        accessorKey: "studentId",
        meta: { noWrap: true },
        cell: (info) => {
          const item = info.row.original;
          const fullName = textOrDash(item.user?.profile?.fullName);
          const code = textOrDash(item.user?.profile?.code);
          return (
            <div>
              <Typography variant="body" weight="semibold" color="neutral">
                {fullName}
              </Typography>
              <Typography variant="caption" color="gray">
                {code}
              </Typography>
            </div>
          );
        },
      },
      {
        id: "totalAmount",
        header: "Số tiền",
        accessorKey: "totalAmount",
        cell: (info) => (
          <Typography
            variant="body"
            weight="bold"
            className="text-emerald-600 dark:text-emerald-400"
          >
            {formatCurrency(info.row.original.totalAmount)}
          </Typography>
        ),
      },
      {
        id: "semester",
        header: "Học kỳ",
        accessorKey: "semester",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {formatSemesterYear(
              info.row.original.semester,
              info.row.original.schoolYear
            )}
          </Typography>
        ),
      },
      {
        id: "content",
        header: "Nội dung",
        accessorKey: "content",
        cell: (info) => (
          <Typography
            variant="caption"
            color="gray"
            className="line-clamp-2 max-w-xs"
          >
            {info.row.original.content}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        accessorKey: "status",
        cell: (info) => {
          const isPaid = info.row.original.status === "PAID";
          return (
            <Badge variant={isPaid ? "success" : "warning"}>
              {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
            </Badge>
          );
        },
      },
      {
        id: "updatedAt",
        header: "Cập nhật",
        accessorKey: "updatedAt",
        meta: { noWrap: true },
        cell: (info) => (
          <Typography variant="caption" weight="semibold" color="gray">
            {formatDateTime(info.row.original.updatedAt)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const tuitionFee = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <ActionButton
                tooltipText="Lịch sử cập nhật"
                icon={HiOutlineClock}
                color="amber"
                onClick={() => handleViewHistory(tuitionFee)}
              />
              <ActionButton
                tooltipText="Cập nhật"
                icon={HiOutlinePencil}
                color="blue"
                onClick={() => handleUpdate(tuitionFee)}
              />
              <ActionButton
                tooltipText="Xóa học phí"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message:
                      "Bạn có chắc chắn muốn xóa bản ghi học phí này không?",
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_TUITION_FEE,
                    onConfirm: () => deleteMutation.mutate(tuitionFee.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [deleteMutation, handleUpdate, handleViewHistory, openConfirm]
  );

  const filterFields = useMemo<FilterField[]>(
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
        type: "date-range",
        id: "schoolYear",
        label: "Năm học",
        mode: "YYYY",
        maxRange: 1,
      },
      {
        type: "select",
        id: "semester",
        label: "Học kỳ",
        options: Array.from({ length: 3 }, (_, i) => ({
          label: `Học kỳ ${i + 1}`,
          value: `${i + 1}`,
        })),
      },
      {
        type: "select",
        id: "status",
        label: "Trạng thái",
        options: [
          { label: "Đã thanh toán", value: "PAID" },
          { label: "Chưa thanh toán", value: "UNPAID" },
        ],
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học phí" },
      ]}
      title="Quản lý học phí"
      isLoading={isLoading}
      skeleton={<TuitionSkeleton />}
      isError={isError}
      onRetry={refetch}
    >
      <div className="relative overflow-hidden bg-white transition-colors dark:bg-neutral-950">
        <div className="px-4">
          <Table
            data={tuitionFeesData}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterFields}
            emptyText="Không tìm thấy bản ghi học phí phù hợp"
            onAdd={handleAdd}
            addLabel="Ghi nhận học phí"
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
                  icon={HiOutlineDocumentDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-500 border border-secondary-500 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-secondary-600 hover:border-secondary-600 transition-all shadow-lg shadow-secondary-500/20 cursor-pointer active:scale-95 h-auto"
                >
                  Xuất báo cáo
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PageContainer>
  );
}
