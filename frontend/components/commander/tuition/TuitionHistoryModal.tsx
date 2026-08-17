"use client";

import { useQuery } from "@tanstack/react-query";
import { HiOutlineUser, HiOutlineClock } from "react-icons/hi";
import { tuitionFeeService } from "@/services/tuition-fees";
import { formatDateTime } from "@/utils/fn-common";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";

interface TuitionHistoryModalProps {
  tuitionFeeId: string;
}

export default function TuitionHistoryModal({ tuitionFeeId }: TuitionHistoryModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tuition-fee-histories", tuitionFeeId],
    queryFn: () => tuitionFeeService.getHistories(tuitionFeeId),
  });

  if (isLoading) {
    return <div className="p-4 text-center">Đang tải lịch sử...</div>;
  }

  if (isError || !data?.data) {
    return <div className="p-4 text-center text-error-500">Lỗi khi tải lịch sử</div>;
  }

  const histories = data.data;

  if (histories.length === 0) {
    return <div className="p-4 text-center">Chưa có lịch sử thay đổi nào</div>;
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 space-y-6">
        {histories.map((history: any) => {
          const isPaid = history.newStatus === "PAID";
          const oldIsPaid = history.oldStatus === "PAID";
          
          return (
            <div key={history.id} className="relative pl-6">
              <div className="absolute -left-2 top-1 size-4 rounded-full border-2 border-white bg-primary-500 dark:border-neutral-900" />
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={oldIsPaid ? "success" : "warning"}>
                      {oldIsPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </Badge>
                    <span className="text-neutral-400">→</span>
                    <Badge variant={isPaid ? "success" : "warning"}>
                      {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                    <HiOutlineClock size={14} />
                    {formatDateTime(history.createdAt)}
                  </div>
                </div>
                
                <div className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold">Ghi chú: </span>
                  {history.note || "Cập nhật trạng thái học phí"}
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <HiOutlineUser size={14} />
                  {history.changer?.profile?.fullName || "Hệ thống"} 
                  {history.changer?.profile?.code ? ` (${history.changer.profile.code})` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
