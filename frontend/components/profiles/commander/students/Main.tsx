"use client";

import { AiOutlineEdit, AiOutlineEye } from "@/library/icons";

import { useCallback, useMemo } from "react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import ActionButton from "@/library/ActionButton";
import Avatar from "@/library/Avatar";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import useTableQuery from "@/hooks/useTableQuery";
import { FilterField } from "@/library/table/TableFilter";
import { GENDER, RANKS } from "@/constants/constants";
import { QUERY_KEYS, MUTATION_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import { userService } from "@/services/accounts/user";
import { Student, StudentProfileQueryRequest } from "@/types/accounts/user";
import { formatDate, textOrDash } from "@/utils/fn-common";
import ProfileSkeleton from "./ProfileSkeleton";
import StudentProfileDetail from "./StudentProfileDetail";
import UpdateStudentProfileForm from "./UpdateStudentProfileForm";

export default function Main({ militaryMode = false }: { militaryMode?: boolean }) {
  const { openModal } = useModalStore();

  const {
    data: profilesData,
    isLoading,
    isError,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Student, StudentProfileQueryRequest>({
    queryKey: [QUERY_KEYS.STUDENT_PROFILES],
    fetchData: userService.getStudentProfiles,
  });

  const handleOpenDetailModal = useCallback(
    (student: Student) => {
      openModal({
        title: "Chi tiết hồ sơ học viên",
        content: (
          <StudentProfileDetail studentId={student.id} initialData={student} militaryMode={militaryMode} />
        ),
        size: "xl",
      });
    },
    [openModal, militaryMode]
  );

  const handleOpenUpdateModal = useCallback(
    (student: Student) => {
      openModal({
        title: "Cập nhật hồ sơ học viên",
        content: <UpdateStudentProfileForm student={student} militaryMode={militaryMode} />,
        size: "lg",
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_STUDENT_PROFILE,
        },
      });
    },
    [openModal, militaryMode]
  );

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "student",
        header: "Học viên",
        size: 280,
        cell: (info) => {
          const student = info.row.original;
          return (
            <div className={`flex items-center gap-2 ${militaryMode ? "min-w-[220px]" : "min-w-0"}`}>
              <Avatar
                src={student.avatar}
                alt={student.fullName}
                size={militaryMode ? 42 : 32}
                iconSize={militaryMode ? 22 : 18}
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <Typography
                  variant="body"
                  weight="semibold"
                  color="neutral"
                  className={militaryMode ? "wrap-break-word" : "wrap-break-word !text-sm"}
                >
                  {textOrDash(student.fullName)}
                </Typography>
                <Typography variant="caption" color="gray">
                  {militaryMode ? "Mã học viên: " : ""}{textOrDash(student.code)}
                </Typography>
              </div>
            </div>
          );
        },
      },
      {
        id: "gender",
        header: "Giới tính",
        size: 85,
        accessorKey: "gender",
        cell: (info) => (
          <Badge variant="neutral">
            {info.row.original.gender === "MALE" ? GENDER.MALE : GENDER.FEMALE}
          </Badge>
        ),
      },
      ...(militaryMode ? [{
        id: "militaryClass",
        header: "Lớp quân sự",
        cell: (info: CellContext<Student, unknown>) => <Typography variant="body" color="neutral">{textOrDash(info.row.original.militaryClass?.className || info.row.original.militaryClass?.classCode)}</Typography>,
      }] : [{
        id: "class",
        header: "Lớp",
        size: 90,
        cell: (info: CellContext<Student, unknown>) => (
          <Typography variant="body" color="neutral">
            {info.row.original.managementClass?.status === "GRADUATED" ? "Tốt nghiệp" : info.row.original.managementClass?.name || "Chưa xếp lớp"}
          </Typography>
        ),
      }]),
      ...(militaryMode ? [{
        id: "unit",
        header: "Đơn vị",
        accessorKey: "unit",
        cell: (info: CellContext<Student, unknown>) => <Typography variant="body" color="neutral">{textOrDash(info.row.original.unit)}</Typography>,
      }] : []),
      ...(!militaryMode ? [{
        id: "university",
        header: "Mã trường",
        size: 95,
        cell: (info: CellContext<Student, unknown>) => (
          <Typography variant="body" color="neutral" className="break-all !text-sm">
            {textOrDash(info.row.original.university?.universityCode)}
          </Typography>
        ),
      }] : []),
      {
        id: "rank",
        header: "Cấp bậc",
        size: 110,
        accessorKey: "rank",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.rank)}
          </Typography>
        ),
      },
      {
        id: "birthday",
        header: "Ngày sinh",
        size: 110,
        accessorKey: "birthday",
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className={militaryMode ? "whitespace-nowrap" : "break-words"}
          >
            {formatDate(info.row.original.birthday)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: militaryMode ? "Hành động" : "Thao tác",
        size: 90,
        cell: (info) => {
          const student = info.row.original;
          return (
            <div className="flex flex-wrap items-center justify-start gap-1">
              <ActionButton
                tooltipText="Xem chi tiết"
                icon={AiOutlineEye}
                onClick={() => handleOpenDetailModal(student)}
                color="green"
              />
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={AiOutlineEdit}
                onClick={() => handleOpenUpdateModal(student)}
                color="blue"
              />
            </div>
          );
        },
      },
    ],
    [handleOpenDetailModal, handleOpenUpdateModal, militaryMode]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "fullName",
        label: "Họ và tên",
        placeholder: "Nhập họ và tên...",
      },
      {
        type: "text",
        id: "code",
        label: "Mã học viên",
        placeholder: "Nhập mã học viên...",
      },
      {
        type: "select",
        id: "gender",
        label: "Giới tính",
        options: [
          { value: "", label: "Tất cả giới tính" },
          { value: "MALE", label: GENDER.MALE },
          { value: "FEMALE", label: GENDER.FEMALE },
        ],
        placeholder: "Chọn giới tính...",
      },
      ...(militaryMode ? [{
        type: "text",
        id: "unit",
        label: "Đơn vị",
        placeholder: "Nhập đơn vị...",
      } satisfies FilterField] : []),
      {
        type: "select",
        id: "rank",
        label: "Cấp bậc",
        placeholder: "Chọn cấp bậc...",
        options: Object.values(RANKS).map((rank) => ({
          value: rank,
          label: rank,
        })),
        selectFilter: {
          enabled: true,
          mode: "client",
          placeholder: "Tìm kiếm cấp bậc...",
        },
      },
    ],
    [militaryMode]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Hồ sơ học viên" },
      ]}
      title="Hồ sơ học viên"
      className={!militaryMode ? "!min-h-0 !space-y-3 !p-4" : undefined}
      isLoading={isLoading}
      skeleton={<ProfileSkeleton />}
      isError={isError}
      onRetry={refetch}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className={militaryMode ? "px-4" : ""}>
          <Table
            data={profilesData}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterOptions}
            emptyText="Không tìm thấy hồ sơ học viên nào phù hợp"
            fitToContainer={!militaryMode}
            compact={!militaryMode}
            className={!militaryMode ? "[&_thead_th]:!py-3 [&_tbody_td]:!py-2 [&_tbody_td]:break-words [&_th]:!tracking-normal [&_th_span]:!whitespace-normal" : undefined}
          />
        </div>
      </div>
    </PageContainer>
  );
}
