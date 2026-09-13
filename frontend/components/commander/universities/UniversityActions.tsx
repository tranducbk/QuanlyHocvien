"use client";

import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import { useConfirmStore } from "@/store/useConfirmStore";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { universityService } from "@/services/universities";
import { University } from "@/types/universities";

interface UniversityActionsProps {
  university: University;
  onEdit: (university: University) => void;
}

export default function UniversityActions({
  university,
  onEdit,
}: UniversityActionsProps) {
  const { openConfirm } = useConfirmStore();

  const toggleStatusMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.TOGGLE_UNIVERSITY_STATUS,
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "INACTIVE";
    }) =>
      universityService.updateUniversity(id, {
        status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      }),
    invalidateQueryKey: [QUERY_KEYS.UNIVERSITIES],
    successMessage: "Cập nhật trạng thái thành công!",
    errorMessage: "Cập nhật trạng thái thất bại!",
  });

  const deleteUniversityMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_UNIVERSITY,
    mutationFn: (id: string) => universityService.deleteUniversity(id),
    invalidateQueryKey: [QUERY_KEYS.UNIVERSITIES],
    successMessage: "Xóa trường thành công!",
    errorMessage: "Xóa trường thất bại!",
  });

  const isActive = university.status === "ACTIVE";

  return (
    <div className="flex items-center justify-start gap-1">
      <ActionButton
        tooltipText={isActive ? "Tạm dừng hoạt động" : "Kích hoạt hoạt động"}
        icon={isActive ? HiOutlineLockOpen : HiOutlineLockClosed}
        color={isActive ? "amber" : "green"}
        onClick={() =>
          openConfirm({
            title: isActive ? "Xác nhận tạm dừng" : "Xác nhận kích hoạt",
            message: `Bạn có chắc chắn muốn ${
              isActive ? "tạm dừng" : "kích hoạt"
            } trường "${university.universityName}" không?`,
            confirmText: isActive ? "Tạm dừng" : "Kích hoạt",
            variant: isActive ? "danger" : "primary",
            mutationKey: MUTATION_KEYS.TOGGLE_UNIVERSITY_STATUS,
            onConfirm: () =>
              toggleStatusMutation.mutate({
                id: university.id,
                status: university.status,
              }),
          })
        }
      />

      <ActionButton
        tooltipText="Chỉnh sửa"
        icon={HiOutlinePencil}
        color="blue"
        onClick={() => onEdit(university)}
      />

      <ActionButton
        tooltipText="Xóa trường"
        icon={HiOutlineTrash}
        color="red"
        onClick={() =>
          openConfirm({
            title: "Xác nhận xóa",
            message: `Bạn có chắc chắn muốn xóa trường "${university.universityName}"? Toàn bộ dữ liệu cấp dưới sẽ bị xóa.`,
            confirmText: "Xóa ngay",
            variant: "danger",
            mutationKey: MUTATION_KEYS.DELETE_UNIVERSITY,
            onConfirm: () => deleteUniversityMutation.mutate(university.id),
          })
        }
      />
    </div>
  );
}
