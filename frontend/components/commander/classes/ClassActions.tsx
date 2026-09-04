"use client";

import { HiOutlinePencil, HiOutlineTrash, HiOutlineUserAdd, HiOutlineUserGroup } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import { useConfirmStore } from "@/store/useConfirmStore";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { classService } from "@/services/classes";
import { Class } from "@/types/classes";

interface ClassActionsProps {
  cls: Class;
  onAddStudents: (cls: Class) => void;
  onViewStudents: (cls: Class) => void;
  onEdit: (cls: Class) => void;
  invalidateQueryKey?: unknown[];
}

export default function ClassActions({
  cls,
  onAddStudents,
  onViewStudents,
  onEdit,
  invalidateQueryKey = [QUERY_KEYS.CLASSES],
}: ClassActionsProps) {
  const { openConfirm } = useConfirmStore();

  const deleteClassMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_CLASS,
    mutationFn: (id: string) => classService.deleteClass(id),
    invalidateQueryKey,
    successMessage: "Xóa lớp thành công",
    errorMessage: "Xóa lớp thất bại",
  });

  return (
    <div className="flex items-center justify-start gap-1">
      <ActionButton
        tooltipText="Thêm học viên"
        icon={HiOutlineUserAdd}
        onClick={() => onAddStudents(cls)}
        color="green"
      />
      <ActionButton
        tooltipText="Danh sách học viên"
        icon={HiOutlineUserGroup}
        onClick={() => onViewStudents(cls)}
        color="secondary"
      />
      <ActionButton
        tooltipText="Chỉnh sửa"
        icon={HiOutlinePencil}
        onClick={() => onEdit(cls)}
        color="blue"
      />
      <ActionButton
        tooltipText="Xóa lớp"
        icon={HiOutlineTrash}
        onClick={() =>
          openConfirm({
            title: "Xác nhận xóa lớp học",
            message: `Bạn có chắc chắn muốn xóa lớp "${cls.className}"?`,
            confirmText: "Xóa ngay",
            variant: "danger",
            mutationKey: MUTATION_KEYS.DELETE_CLASS,
            onConfirm: () => deleteClassMutation.mutate(cls.id),
          })
        }
        color="red"
      />
    </div>
  );
}
