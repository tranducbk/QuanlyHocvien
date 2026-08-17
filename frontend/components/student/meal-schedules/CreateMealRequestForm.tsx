"use client";

import { useState } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi";
import Button from "@/library/Button";
import Checkbox from "@/library/Checkbox";
import Divide from "@/library/Divide";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import { MealDayKey, MealSlotKey, WeeklyCutRice } from "@/types/cut-rice";
import { useModalStore } from "@/store/useModalStore";

const mealDays: MealDayKey[] = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const mealSlots: Array<{ key: MealSlotKey; label: string }> = [
  { key: "morning", label: "Bữa sáng" },
  { key: "noon", label: "Bữa trưa" },
  { key: "evening", label: "Bữa tối" },
];

const createEmptyWeekly = (): WeeklyCutRice =>
  mealDays.reduce<WeeklyCutRice>((acc, day) => {
    acc[day] = { morning: false, noon: false, evening: false };
    return acc;
  }, {});

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
    createEmptyWeekly()
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

  const toggleRequestSlot = (day: MealDayKey, meal: MealSlotKey) => {
    setRequestWeekly((current) => ({
      ...current,
      [day]: {
        ...(current[day] || {}),
        [meal]: !current[day]?.[meal],
      },
    }));
  };

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
        <Typography variant="caption" color="gray">
          Chọn các bữa cần cắt cho tuần đang xem.
        </Typography>

        <div className="grid gap-3 md:grid-cols-2">
          {mealDays.map((day) => (
            <div
              key={day}
              className="rounded-2xl border border-neutral-100 p-3 dark:border-neutral-700"
            >
              <Typography variant="body" weight="bold" className="mb-3">
                {day}
              </Typography>
              <div className="flex flex-wrap gap-3">
                {mealSlots.map((meal) => (
                  <Checkbox
                    key={meal.key}
                    checked={Boolean(requestWeekly[day]?.[meal.key])}
                    onChange={() => toggleRequestSlot(day, meal.key)}
                    label={meal.label}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

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
