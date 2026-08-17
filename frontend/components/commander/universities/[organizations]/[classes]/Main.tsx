"use client";

import { useMemo, useCallback } from "react";
import Typography from "@/library/Typography";
import ClassSkeleton from "./ClassSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { classService } from "@/services/classes";
import { organizationService } from "@/services/organizations";
import { universityService } from "@/services/universities";
import { Class } from "@/types/classes";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import CreateClassForm from "./CreateClassForm";
import UpdateClassForm from "./UpdateClassForm";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/library/Table";
import { FilterField } from "@/library/table/TableFilter";
import ActionButton from "@/library/ActionButton";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserAdd,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { formatDateTime } from "@/utils/fn-common";
import useTableQuery from "@/hooks/useTableQuery";
import useAppMutation from "@/hooks/useAppMutation";
import PageContainer from "@/library/PageContainer";
import AddClassStudentsModal from "@/components/classes/AddClassStudentsModal";
import ClassStudentsListModal from "@/components/classes/ClassStudentsListModal";

interface Props {
  universityId: string;
  organizationId: string;
  educationLevelId: string;
}

export default function Main({
  universityId,
  organizationId,
  educationLevelId,
}: Props) {
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();

  const {
    data: organizationData,
    isLoading: isOrganizationLoading,
    isError: isOrganizationError,
    refetch: refetchOrganization,
  } = useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, organizationId],
    queryFn: () => organizationService.getOrganization(organizationId),
    select: (res) => res.data,
  });

  const {
    data: universityData,
    isLoading: isUniversityLoading,
    isError: isUniversityError,
    refetch: refetchUniversity,
  } = useQuery({
    queryKey: [QUERY_KEYS.UNIVERSITIES, universityId],
    queryFn: () => universityService.getUniversity(universityId),
    select: (res) => res.data,
  });

  const {
    data: educationLevelData,
    isLoading: isEducationLevelLoading,
    isError: isEducationLevelError,
    refetch: refetchEducationLevel,
  } = useQuery({
    queryKey: [QUERY_KEYS.EDUCATION_LEVELS, educationLevelId],
    queryFn: () => organizationService.getEducationLevel(educationLevelId),
    select: (res) => res.data,
  });

  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
    refetch: refetchClasses,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Class>({
    queryKey: [QUERY_KEYS.CLASSES, educationLevelId],
    fetchData: (params) =>
      classService.getClasses({ ...params, educationLevelId }),
  });

  const handleOpenCreateClassModal = () => {
    openModal({
      title: "Thêm lớp học mới",
      content: <CreateClassForm educationLevelId={educationLevelId} />,
      size: "md",
      config: {
        mutationKey: MUTATION_KEYS.CREATE_CLASS,
      },
    });
  };

  const handleOpenUpdateClassModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Chỉnh sửa lớp học",
        content: (
          <UpdateClassForm cls={cls} educationLevelId={educationLevelId} />
        ),
        size: "md",
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_CLASS,
        },
      });
    },
    [educationLevelId, openModal]
  );

  const handleOpenAddStudentsModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Thêm học viên vào lớp",
        content: <AddClassStudentsModal cls={cls} />,
        size: "2xl",
      });
    },
    [openModal]
  );

  const handleOpenStudentsListModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Danh sách học viên trong lớp",
        content: <ClassStudentsListModal cls={cls} />,
        size: "2xl",
      });
    },
    [openModal]
  );

  const deleteClassMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_CLASS,
    mutationFn: (id: string) => classService.deleteClass(id),
    invalidateQueryKey: [QUERY_KEYS.CLASSES, educationLevelId],
    successMessage: "Xóa lớp thành công",
    errorMessage: "Xóa lớp thất bại",
  });

  const columns = useMemo<ColumnDef<Class>[]>(
    () => [
      {
        id: "className",
        header: "Tên lớp",
        accessorKey: "className",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {info.row.original.className}
          </Typography>
        ),
      },
      {
        id: "studentCount",
        header: "Số học viên",
        accessorKey: "studentCount",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {info.row.original.studentCount}
          </Typography>
        ),
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        accessorKey: "createdAt",
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDateTime(info.row.original.createdAt)}
          </Typography>
        ),
      },
      {
        id: "updatedAt",
        header: "Ngày cập nhật",
        accessorKey: "updatedAt",
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDateTime(info.row.original.updatedAt)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const cls = info.row.original;
          return (
            <div className="flex items-center justify-start gap-1">
              <ActionButton
                tooltipText="Thêm học viên"
                icon={HiOutlineUserAdd}
                color="green"
                onClick={() => handleOpenAddStudentsModal(cls)}
              />
              <ActionButton
                tooltipText="Danh sách học viên"
                icon={HiOutlineUserGroup}
                color="secondary"
                onClick={() => handleOpenStudentsListModal(cls)}
              />
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                color="blue"
                onClick={() => handleOpenUpdateClassModal(cls)}
              />
              <ActionButton
                tooltipText="Xóa lớp"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: `Bạn có chắc chắn muốn xóa lớp "${cls.className}" không?`,
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_CLASS,
                    onConfirm: () => deleteClassMutation.mutate(cls.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [
      handleOpenAddStudentsModal,
      handleOpenStudentsListModal,
      handleOpenUpdateClassModal,
      openConfirm,
      deleteClassMutation,
    ]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "className",
        label: "Tên lớp",
        placeholder: "Nhập tên lớp...",
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Cơ sở đào tạo", href: "/commander/universities" },
        {
          label: universityData?.universityName,
          href: `/commander/universities/${universityId}`,
        },
        { label: organizationData?.organizationName || "..." },
        { label: educationLevelData?.levelName || "..." },
      ]}
      title={`Lớp học - ${educationLevelData?.levelName || ""}`}
      isLoading={
        isOrganizationLoading ||
        isUniversityLoading ||
        isEducationLevelLoading ||
        isClassesLoading
      }
      skeleton={<ClassSkeleton />}
      isError={
        isOrganizationError ||
        isUniversityError ||
        isEducationLevelError ||
        isClassesError
      }
      onRetry={() => {
        refetchOrganization();
        refetchUniversity();
        refetchEducationLevel();
        refetchClasses();
      }}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <Table
            data={classesData}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterOptions}
            emptyText="Không tìm thấy lớp học nào"
            onAdd={() => handleOpenCreateClassModal()}
            addLabel="Thêm lớp học"
          />
        </div>
      </div>
    </PageContainer>
  );
}
