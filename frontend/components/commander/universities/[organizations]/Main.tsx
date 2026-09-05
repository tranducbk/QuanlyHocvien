"use client";

import { useState, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { HiOutlinePlus } from "react-icons/hi";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import Typography from "@/library/Typography";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { organizationService } from "@/services/organizations";
import { universityService } from "@/services/universities";
import { QUERY_KEYS } from "@/constants/query-keys";
import { DEFAULT_PAGE } from "@/constants/constants";
import { useModalStore } from "@/store/useModalStore";
import { Organization } from "@/types/organizations";
import CreateOrganizationForm from "./CreateOrganizationForm";
import UpdateOrganizationForm from "./UpdateOrganizationForm";
import OrganizationCard from "./OrganizationCard";
import OrganizationSkeleton from "./OrganizationSkeleton";

interface Props {
  universityId: string;
}

export default function Main({ universityId }: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const { openModal } = useModalStore();

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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreateModal = useCallback(() => {
    openModal({
      title: "Thêm mới chuyên ngành / đơn vị",
      content: <CreateOrganizationForm universityId={universityId} />,
      size: "md",
    });
  }, [openModal, universityId]);

  const handleOpenUpdateModal = useCallback(
    (org: Organization) => {
      openModal({
        title: "Chỉnh sửa chuyên ngành / đơn vị",
        content: (
          <UpdateOrganizationForm
            organization={org}
            universityId={universityId}
          />
        ),
        size: "md",
      });
    },
    [openModal, universityId]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Cơ sở đào tạo", href: "/commander/universities" },
        { label: universityData?.universityName || "Đang tải..." },
      ]}
      title={`Ngành đào tạo - ${universityData?.universityName || ""}`}
      subtitle="Danh sách chuyên ngành và trình độ trực thuộc trường"
      isLoading={isLoading || isUniversityLoading}
      skeleton={<OrganizationSkeleton />}
      isError={isError || isUniversityError}
      onRetry={() => refetch()}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={HiOutlinePlus}
            onClick={handleOpenCreateModal}
          >
            Thêm chuyên ngành
          </Button>
        </div>

        {organizations && organizations.length > 0 ? (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                universityId={universityId}
                isExpanded={expandedIds.includes(org.id)}
                onToggleExpand={toggleExpand}
                onEdit={handleOpenUpdateModal}
              />
            ))}

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
