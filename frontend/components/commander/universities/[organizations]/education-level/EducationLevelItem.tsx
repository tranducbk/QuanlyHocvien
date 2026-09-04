"use client";

import Link from "next/link";
import {
  HiOutlineAcademicCap,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Typography from "@/library/Typography";
import { useConfirmStore } from "@/store/useConfirmStore";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { organizationService } from "@/services/organizations";
import { EducationLevel } from "@/types/organizations";

interface EducationLevelItemProps {
  level: EducationLevel;
  orgId: string;
  universityId: string;
  onEdit: (level: EducationLevel) => void;
}

export default function EducationLevelItem({
  level,
  orgId,
  universityId,
  onEdit,
}: EducationLevelItemProps) {
  const { openConfirm } = useConfirmStore();

  const deleteLevelMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_EDUCATION_LEVEL,
    mutationFn: (id: string) => organizationService.deleteEducationLevel(id),
    invalidateQueryKey: [QUERY_KEYS.EDUCATION_LEVELS, orgId],
    successMessage: "Xóa trình độ thành công!",
    errorMessage: "Xóa trình độ thất bại!",
  });

  return (
    <div className="flex items-center justify-between gap-4 py-1.5 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group">
      <Link
        href={`/commander/universities/${universityId}/${orgId}/${level.id}`}
        className="flex items-center gap-2 flex-1 cursor-pointer"
      >
        <HiOutlineAcademicCap
          size={18}
          className="text-secondary-500 shrink-0"
        />
        <Typography
          variant="body"
          weight="semibold"
          className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        >
          Trình độ: {level.levelName}
        </Typography>
      </Link>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
        <ActionButton
          tooltipText="Chỉnh sửa trình độ"
          icon={HiOutlinePencil}
          color="blue"
          onClick={() => onEdit(level)}
        />
        <ActionButton
          tooltipText="Xóa trình độ"
          icon={HiOutlineTrash}
          color="red"
          onClick={() =>
            openConfirm({
              title: "Xác nhận xóa trình độ",
              message: `Bạn có chắc chắn muốn xóa "${level.levelName}"? Các lớp học thuộc trình độ này sẽ bị xóa.`,
              confirmText: "Xóa ngay",
              variant: "danger",
              mutationKey: MUTATION_KEYS.DELETE_EDUCATION_LEVEL,
              onConfirm: () => deleteLevelMutation.mutate(level.id),
            })
          }
        />
      </div>
    </div>
  );
}
