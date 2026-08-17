"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { m, AnimatePresence } from "motion/react";
import {
  HiOutlinePlus,
  HiOutlineCollection,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineLockOpen,
  HiOutlineLockClosed,
} from "react-icons/hi";

import Typography from "@/library/Typography";
import Button from "@/library/Button";
import Badge from "@/library/Badge";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { organizationService } from "@/services/organizations";
import { universityService } from "@/services/universities";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { DEFAULT_PAGE } from "@/constants/constants";
import { Organization } from "@/types/organizations";

import CreateOrganizationForm from "./CreateOrganizationForm";
import UpdateOrganizationForm from "./UpdateOrganizationForm";

import OrganizationLevelsList from "./education-level/OrganizationLevelsList";
import OrganizationSkeleton from "./OrganizationSkeleton";
import useAppMutation from "@/hooks/useAppMutation";

interface Props {
  universityId: string;
}

export default function Main({ universityId }: Props) {
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();

  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const {
    data: organizations,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, universityId],
    queryFn: ({ pageParam }) =>
      organizationService.getOrganizations({
        universityId,
        page: pageParam,
        limit: DEFAULT_PAGE.PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((page) => page.data || []),
  });

  const {
    data: universityData,
    isLoading: isUniversityLoading,
    isError: isUniversityError,
  } = useQuery({
    queryKey: [QUERY_KEYS.UNIVERSITIES, universityId],
    queryFn: () => universityService.getUniversity(universityId),
    select: (res) => res.data,
  });

  const setSentinelRef = useInfiniteScroll({
    callback: fetchNextPage,
    hasNextPage,
    isFetching: isFetchingNextPage,
  });

  const deleteOrganizationMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_ORGANIZATION,
    mutationFn: (id: string) => organizationService.deleteOrganization(id),
    invalidateQueryKey: [QUERY_KEYS.ORGANIZATIONS, universityId],
    successMessage: "Xóa đơn vị thành công",
    errorMessage: "Xóa đơn vị thất bại!",
  });

  const toggleOrganizationStatusMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.TOGGLE_ORGANIZATION_STATUS,
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "INACTIVE";
    }) => organizationService.toggleOrganizationStatus(id, status),
    invalidateQueryKey: [QUERY_KEYS.ORGANIZATIONS, universityId],
    successMessage: "Cập nhật trạng thái thành công",
    errorMessage: "Cập nhật trạng thái thất bại!",
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenCreateOrgModal = () => {
    openModal({
      title: "Thêm chuyên ngành mới",
      content: <CreateOrganizationForm universityId={universityId} />,
      size: "md",
      config: {
        mutationKey: MUTATION_KEYS.CREATE_ORGANIZATION,
      },
    });
  };

  const handleOpenUpdateOrgModal = (org: Organization) => {
    openModal({
      title: "Chỉnh sửa chuyên ngành",
      content: (
        <UpdateOrganizationForm
          organization={org}
          universityId={universityId}
        />
      ),
      size: "md",
      config: {
        mutationKey: MUTATION_KEYS.UPDATE_ORGANIZATION,
      },
    });
  };

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/admin" },
        { label: "Cơ sở đào tạo", href: "/admin/universities" },
        { label: universityData?.universityName || "Đang tải..." },
      ]}
      title={`Ngành đào tạo - ${universityData?.universityName || ""}`}
      subtitle="Quản lý các chuyên ngành và đơn vị trực thuộc trường"
      isLoading={isLoading || isUniversityLoading}
      skeleton={<OrganizationSkeleton />}
      isError={isError || isUniversityError}
      onRetry={() => refetch()}
    >
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => handleOpenCreateOrgModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-600 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-primary-700 hover:border-primary-700 transition-all shadow-lg shadow-primary-600/20 cursor-pointer active:scale-95 h-auto"
          icon={HiOutlinePlus}
        >
          Thêm chuyên ngành / Đơn vị
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {organizations && organizations.length > 0 ? (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-md dark:hover:bg-neutral-900/70 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex flex-1 items-center gap-4 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(org.id);
                    }}
                  >
                    <div className="size-12 rounded-xl bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-300">
                      <HiOutlineCollection size={24} />
                    </div>
                    <div>
                      <Typography variant="h3" weight="bold">
                        {org.organizationName}
                      </Typography>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-neutral-400">
                          <HiOutlineClock size={14} />
                          <Typography variant="caption">
                            Di chuyển: {org.travelTime} phút
                          </Typography>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <HiOutlineUserGroup size={14} />
                          <Typography variant="caption">
                            {org.totalStudents} học viên
                          </Typography>
                        </div>
                        <Badge
                          variant={
                            org.status === "ACTIVE" ? "success" : "neutral"
                          }
                        >
                          {org.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton
                      tooltipText={
                        org.status === "ACTIVE"
                          ? "Tạm dừng hoạt động"
                          : "Kích hoạt hoạt động"
                      }
                      icon={
                        org.status === "ACTIVE"
                          ? HiOutlineLockOpen
                          : HiOutlineLockClosed
                      }
                      color={org.status === "ACTIVE" ? "amber" : "green"}
                      onClick={() =>
                        openConfirm({
                          title:
                            org.status === "ACTIVE"
                              ? "Xác nhận tạm dừng"
                              : "Xác nhận kích hoạt",
                          message: `Bạn có chắc chắn muốn ${org.status === "ACTIVE" ? "tạm dừng" : "kích hoạt"} đơn vị "${org.organizationName}" không?`,
                          confirmText:
                            org.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt",
                          variant:
                            org.status === "ACTIVE" ? "danger" : "primary",
                          mutationKey: MUTATION_KEYS.TOGGLE_ORGANIZATION_STATUS,
                          onConfirm: () =>
                            toggleOrganizationStatusMutation.mutate({
                              id: org.id,
                              status: org.status,
                            }),
                        })
                      }
                    />
                    <ActionButton
                      tooltipText="Chỉnh sửa"
                      icon={HiOutlinePencil}
                      color="blue"
                      onClick={() => handleOpenUpdateOrgModal(org)}
                    />
                    <ActionButton
                      tooltipText="Xóa đơn vị"
                      icon={HiOutlineTrash}
                      color="red"
                      onClick={() =>
                        openConfirm({
                          title: "Xác nhận xóa",
                          message: `Xóa đơn vị "${org.organizationName}"?`,
                          variant: "danger",
                          mutationKey: MUTATION_KEYS.DELETE_ORGANIZATION,
                          onConfirm: () =>
                            deleteOrganizationMutation.mutate(org.id),
                        })
                      }
                    />
                    <ActionButton
                      tooltipText="Xem trình độ đào tạo"
                      icon={HiOutlineChevronDown}
                      color="neutral"
                      className={
                        expandedIds.includes(org.id)
                          ? "bg-primary-50 text-primary-600!"
                          : ""
                      }
                      iconClassName={`transition-transform ${expandedIds.includes(org.id) ? "rotate-180" : ""}`}
                      onClick={() => {
                        toggleExpand(org.id);
                      }}
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {expandedIds.includes(org.id) && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-800">
                        <OrganizationLevelsList
                          orgId={org.id}
                          universityId={universityId}
                        />
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Sentinel for infinite scroll */}
            <div
              ref={setSentinelRef}
              className="h-10 flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <div className="size-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-950 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 transition-colors">
            <Typography color="gray">
              Chưa có chuyên ngành / đơn vị nào
            </Typography>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
