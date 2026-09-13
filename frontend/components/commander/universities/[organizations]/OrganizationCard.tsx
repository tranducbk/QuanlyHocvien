"use client";

import { m, AnimatePresence } from "motion/react";
import {
  HiOutlineCollection,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import { useConfirmStore } from "@/store/useConfirmStore";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { organizationService } from "@/services/organizations";
import { Organization } from "@/types/organizations";
import OrganizationLevelsList from "./education-level/OrganizationLevelsList";

interface OrganizationCardProps {
  organization: Organization;
  universityId: string;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (org: Organization) => void;
}

export default function OrganizationCard({
  organization,
  universityId,
  isExpanded,
  onToggleExpand,
  onEdit,
}: OrganizationCardProps) {
  const { openConfirm } = useConfirmStore();

  const deleteOrganizationMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_ORGANIZATION,
    mutationFn: (id: string) => organizationService.deleteOrganization(id),
    invalidateQueryKey: [QUERY_KEYS.ORGANIZATIONS, universityId],
    successMessage: "Xóa đơn vị thành công!",
    errorMessage: "Xóa đơn vị thất bại!",
  });

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-md dark:hover:bg-neutral-900/70 transition-all group">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex flex-1 items-center gap-4 text-left cursor-pointer"
          onClick={() => onToggleExpand(organization.id)}
        >
          <div className="size-12 rounded-xl bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-300">
            <HiOutlineCollection size={24} />
          </div>
          <div>
            <Typography variant="h3" weight="bold">
              {organization.organizationName}
            </Typography>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-neutral-400">
                <HiOutlineClock size={14} />
                <Typography variant="caption">
                  Di chuyển: {organization.travelTime} phút
                </Typography>
              </div>
              <div className="flex items-center gap-1 text-neutral-400">
                <HiOutlineUserGroup size={14} />
                <Typography variant="caption">
                  {organization.totalStudents} học viên
                </Typography>
              </div>
              <Badge
                variant={
                  organization.status === "ACTIVE" ? "success" : "neutral"
                }
              >
                {organization.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
              </Badge>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <ActionButton
            tooltipText="Chỉnh sửa đơn vị"
            icon={HiOutlinePencil}
            color="blue"
            onClick={() => onEdit(organization)}
          />
          <ActionButton
            tooltipText="Xóa đơn vị"
            icon={HiOutlineTrash}
            color="red"
            onClick={() =>
              openConfirm({
                title: "Xác nhận xóa đơn vị",
                message: `Bạn có chắc chắn muốn xóa "${organization.organizationName}"? Toàn bộ trình độ và lớp trực thuộc sẽ bị xóa.`,
                confirmText: "Xóa ngay",
                variant: "danger",
                mutationKey: MUTATION_KEYS.DELETE_ORGANIZATION,
                onConfirm: () =>
                  deleteOrganizationMutation.mutate(organization.id),
              })
            }
          />
          <ActionButton
            tooltipText="Xem trình độ đào tạo"
            icon={HiOutlineChevronDown}
            color="neutral"
            className={isExpanded ? "bg-primary-50 text-primary-600!" : ""}
            iconClassName={`transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            onClick={() => onToggleExpand(organization.id)}
          />
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-800">
              <OrganizationLevelsList
                orgId={organization.id}
                universityId={universityId}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
