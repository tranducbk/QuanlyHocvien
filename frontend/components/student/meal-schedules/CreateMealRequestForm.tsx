"use client";

import { useState } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import { MealDayKey, MealSlotKey, WeeklyCutRice } from "@/types/cut-rice";
import { useModalStore } from "@/store/useModalStore";
import MealWeekGrid from "@/components/meal-schedules/MealWeekGrid";
import { countCutMeals, createEmptyMealWeek } from "@/utils/meal-schedule";
import styles from "./CreateMealRequestForm.module.css";

interface Props {
  semesterId: string;
  weekStartDate: string;
  onSuccessCallback?: () => void;
}

export default function CreateMealRequestForm({
  semesterId,
  weekStartDate,
  onSuccessCallback,
}: Props) {
  const { closeModal } = useModalStore();
  const [requestWeekly, setRequestWeekly] = useState<WeeklyCutRice>(() =>
    createEmptyMealWeek()
  );
  const [requestNotes, setRequestNotes] = useState("");

  const createRequestMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_CUT_RICE_REQUEST,
    mutationFn: cutRiceService.createMyRequest,
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE_REQUESTS],
    successMessage: "Gửi yêu cầu cắt cơm thành công!",
    errorMessage: "Gửi yêu cầu cắt cơm thất bại!",
    onSuccess: () => {
      closeModal();
      if (onSuccessCallback) onSuccessCallback();
    },
  });

  const toggleRequestSlot = (
    day: MealDayKey,
    meal: MealSlotKey,
    checked: boolean
  ) => {
    setRequestWeekly((current) => ({
      ...current,
      [day]: {
        ...(current[day] || {}),
        [meal]: checked,
      },
    }));
  };

  const selectedMealCount = countCutMeals(requestWeekly);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate({
      semesterId,
      weekStartDate,
      weekly: requestWeekly,
      notes: requestNotes || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmitRequest}
      className="flex max-h-[85vh] flex-col gap-6 pt-2 pb-4"
    >
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className={styles.guide}>
          <div>
            <Typography variant="body" weight="bold">
              Chọn bữa cần cắt
            </Typography>
            <Typography variant="caption" color="gray">
              Lịch được chia theo Sáng – Trưa – Tối để bạn kiểm tra nhanh
              trước khi gửi.
            </Typography>
          </div>
          <span className={styles.counter}>{selectedMealCount}/21 bữa</span>
        </div>

        <MealWeekGrid
          weekly={requestWeekly}
          editable
          disabled={createRequestMutation.isPending}
          onToggle={toggleRequestSlot}
        />

        <Textarea
          label="Lý do"
          value={requestNotes}
          maxLength={255}
          onChange={(event) => setRequestNotes(event.target.value)}
          placeholder="Nhập lý do hoặc ghi chú cho chỉ huy..."
        />
      </div>

      <div className="flex flex-col gap-4 px-4">
        <Divide className="w-full" />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={closeModal}
            isLoading={createRequestMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={HiOutlinePaperAirplane}
            isLoading={createRequestMutation.isPending}
          >
            Gửi yêu cầu
          </Button>
        </div>
      </div>
    </form>
  );
}
