"use client";

import { useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
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
import { userService } from "@/services/user";
import { Student, StudentProfileQueryRequest } from "@/types/user";
import { formatDate, textOrDash } from "@/utils/fn-common";
import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import ProfileSkeleton from "./ProfileSkeleton";
import StudentProfileDetail from "./StudentProfileDetail";
import UpdateStudentProfileForm from "./UpdateStudentProfileForm";

export default function Main() {
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
          <StudentProfileDetail studentId={student.id} initialData={student} />
        ),
        size: "xl",
      });
    },
    [openModal]
  );

  const handleOpenUpdateModal = useCallback(
    (student: Student) => {
      openModal({
        title: "Cập nhật hồ sơ học viên",
        content: <UpdateStudentProfileForm student={student} />,
        size: "lg",
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_STUDENT_PROFILE,
        },
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "student",
        header: "Học viên",
        meta: { noWrap: true },
        cell: (info) => {
          const student = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[220px]">
              <Avatar
                src={student.avatar}
                alt={student.fullName}
                size={42}
                iconSize={22}
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <Typography
                  variant="body"
                  weight="semibold"
                  color="neutral"
                  className="wrap-break-word"
                >
                  {textOrDash(student.fullName)}
                </Typography>
                <Typography variant="caption" color="gray">
                  Mã học viên: {textOrDash(student.code)}
                </Typography>
              </div>
            </div>
          );
        },
      },
      {
        id: "gender",
        header: "Giới tính",
        accessorKey: "gender",
        cell: (info) => (
          <Badge variant="neutral">
            {info.row.original.gender === "MALE" ? GENDER.MALE : GENDER.FEMALE}
          </Badge>
        ),
      },
      {
        id: "class",
        header: "Lớp",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.class?.className)}
          </Typography>
        ),
      },
      {
        id: "organization",
        header: "Đơn vị",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(
              info.row.original.organization?.organizationName ||
                info.row.original.unit
            )}
          </Typography>
        ),
      },
      {
        id: "university",
        header: "Trường đào tạo",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.university?.universityName)}
          </Typography>
        ),
      },
      {
        id: "rank",
        header: "Cấp bậc",
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
        accessorKey: "birthday",
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDate(info.row.original.birthday)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const student = info.row.original;
          return (
            <div className="flex items-center justify-start gap-1">
              <ActionButton
                tooltipText="Xem chi tiết"
                icon={HiOutlineEye}
                onClick={() => handleOpenDetailModal(student)}
                color="green"
              />
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                onClick={() => handleOpenUpdateModal(student)}
                color="blue"
              />
            </div>
          );
        },
      },
    ],
    [handleOpenDetailModal, handleOpenUpdateModal]
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
      {
        type: "text",
        id: "unit",
        label: "Đơn vị",
        placeholder: "Nhập đơn vị...",
      },
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
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Hồ sơ học viên" },
      ]}
      title="Hồ sơ học viên"
      subtitle="Tra cứu, xem chi tiết và cập nhật thông tin học viên trong đơn vị quản lý."
      isLoading={isLoading}
      skeleton={<ProfileSkeleton />}
      isError={isError}
      onRetry={refetch}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
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
          />
        </div>
      </div>
    </PageContainer>
  );
}
