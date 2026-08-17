"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { m, AnimatePresence } from "motion/react";
import {
  HiOutlineCollection,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Typography from "@/library/Typography";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { organizationService } from "@/services/organizations";
import { universityService } from "@/services/universities";
import { QUERY_KEYS } from "@/constants/query-keys";
import { DEFAULT_PAGE } from "@/constants/constants";
import OrganizationLevelsList from "./education-level/OrganizationLevelsList";
import OrganizationSkeleton from "./OrganizationSkeleton";

interface Props {
  universityId: string;
}

export default function Main({ universityId }: Props) {
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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
        {organizations && organizations.length > 0 ? (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-md dark:hover:bg-neutral-900/70 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-4 text-left cursor-pointer"
                    onClick={() => toggleExpand(org.id)}
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
                        <Badge variant={org.status === "ACTIVE" ? "success" : "neutral"}>
                          {org.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </div>
                    </div>
                  </button>
                  <ActionButton
                    tooltipText="Xem trình độ đào tạo"
                    icon={HiOutlineChevronDown}
                    color="neutral"
                    className={expandedIds.includes(org.id) ? "bg-primary-50 text-primary-600!" : ""}
                    iconClassName={`transition-transform ${expandedIds.includes(org.id) ? "rotate-180" : ""}`}
                    onClick={() => toggleExpand(org.id)}
                  />
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
                        <OrganizationLevelsList orgId={org.id} universityId={universityId} />
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div ref={setSentinelRef} className="h-10 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="size-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-950 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 transition-colors">
            <Typography color="gray">Chưa có chuyên ngành / đơn vị nào</Typography>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
