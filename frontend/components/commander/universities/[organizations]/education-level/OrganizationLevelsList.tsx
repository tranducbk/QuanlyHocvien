"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlinePlus } from "react-icons/hi";
import Button from "@/library/Button";
import ErrorState from "@/library/ErrorState";
import Skeleton from "@/library/Skeleton";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { organizationService } from "@/services/organizations";
import { useModalStore } from "@/store/useModalStore";
import { EducationLevel } from "@/types/organizations";
import CreateEducationLevelForm from "./CreateEducationLevelForm";
import UpdateEducationLevelForm from "./UpdateEducationLevelForm";
import EducationLevelItem from "./EducationLevelItem";

interface OrganizationLevelsListProps {
  orgId: string;
  universityId: string;
}

export default function OrganizationLevelsList({
  orgId,
  universityId,
}: OrganizationLevelsListProps) {
  const { openModal } = useModalStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.EDUCATION_LEVELS, orgId],
    queryFn: () =>
      organizationService.getEducationLevels({ organizationId: orgId }),
  });

  const handleOpenCreateModal = useCallback(() => {
    openModal({
      title: "Thêm mới trình độ đào tạo",
      content: <CreateEducationLevelForm organizationId={orgId} />,
      size: "md",
    });
  }, [openModal, orgId]);

  const handleOpenUpdateModal = useCallback(
    (level: EducationLevel) => {
      openModal({
        title: "Chỉnh sửa trình độ đào tạo",
        content: (
          <UpdateEducationLevelForm
            level={level}
            organizationId={orgId}
          />
        ),
        size: "md",
      });
    },
    [openModal, orgId]
  );

  if (isLoading) {
    return (
      <div className="space-y-3 ml-4 border-l border-neutral-100 dark:border-neutral-800 pl-4 mt-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton width={150} height={16} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ml-4 border-l border-neutral-100 dark:border-neutral-800 pl-4 mt-3">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const levels = data?.data || [];

  return (
    <div className="space-y-3 mt-3 ml-4 border-l border-neutral-100 dark:border-neutral-800 pl-4">
      <div className="flex items-center justify-between pb-1">
        <Typography variant="caption" weight="bold" color="gray">
          DANH SÁCH TRÌNH ĐỘ ĐÀO TẠO
        </Typography>
        <Button
          variant="outline"
          size="sm"
          icon={HiOutlinePlus}
          onClick={handleOpenCreateModal}
        >
          Thêm trình độ
        </Button>
      </div>

      {levels.length > 0 ? (
        levels.map((level) => (
          <EducationLevelItem
            key={level.id}
            level={level}
            orgId={orgId}
            universityId={universityId}
            onEdit={handleOpenUpdateModal}
          />
        ))
      ) : (
        <Typography variant="caption" color="gray" className="block py-2">
          Chưa có trình độ đào tạo nào được tạo.
        </Typography>
      )}
    </div>
  );
}
