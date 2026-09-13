"use client";

import { useMemo, useState } from "react";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import {
  CutRice,
  MealDayKey,
  MealSlotKey,
  WeeklyCutRice,
} from "@/types/cut-rice";
import { useModalStore } from "@/store/useModalStore";
import MealWeekGrid from "@/components/meal-schedules/MealWeekGrid";
import { normalizeMealWeek } from "@/utils/meal-schedule";

const getUser = (record: CutRice) => record.User || record.user;
const getProfile = (record: CutRice) => {
  const user = getUser(record);
  return user?.Profile || user?.profile;
};

interface Props {
  record: CutRice;
}

export default function EditCutRiceForm({ record }: Props) {
  const { closeModal } = useModalStore();
  const [weekly, setWeekly] = useState<WeeklyCutRice>(() =>
    normalizeMealWeek(record.weekly)
  );
  const [notes, setNotes] = useState(record.notes || "");

  const studentLabel = useMemo(() => {
    const profile = getProfile(record);
    return profile?.code
      ? `${profile.fullName || getUser(record)?.username || record.userId} - ${profile.code}`
      : profile?.fullName || getUser(record)?.username || record.userId;
  }, [record]);

  const updateMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.CUT_RICE, record.id, "manual-update"],
    mutationFn: () =>
      cutRiceService.updateCutRice(record.id, {
        weekly,
        notes: notes.trim() || null,
      }),
    invalidateQueryKey: [QUERY_KEYS.CUT_RICE],
    successMessage: "Cập nhật lịch cắt cơm thủ công thành công!",
    errorMessage: "Cập nhật lịch cắt cơm thất bại!",
    onSuccess: () => closeModal(),
  });

  const handleToggle = (
    day: MealDayKey,
    meal: MealSlotKey,
    checked: boolean
  ) => {
    setWeekly((current) => ({
      ...current,
      [day]: {
        ...current[day],
        [meal]: checked,
      },
    }));
  };

  return (
    <div className="flex max-h-[85vh] flex-col gap-5 pt-2 pb-4">
      <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
        <Typography variant="caption" weight="bold" color="gray">
          Học viên
        </Typography>
        <Typography variant="body" weight="bold" color="neutral" className="mt-1">
          {studentLabel}
        </Typography>
      </div>

      <MealWeekGrid
        weekly={weekly}
        editable
        disabled={updateMutation.isPending}
        onToggle={handleToggle}
      />

      <Textarea
        label="Ghi chú"
        value={notes}
        maxLength={255}
        placeholder="Nhập ghi chú điều chỉnh thủ công..."
        isLoading={updateMutation.isPending}
        onChange={(event) => setNotes(event.target.value)}
      />

      </div>

      <div className="flex flex-col gap-4 px-4">
        <Divide className="w-full" />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={closeModal}
            isLoading={updateMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => updateMutation.mutate()}
            isLoading={updateMutation.isPending}
          >
            Lưu lịch thủ công
          </Button>
        </div>
      </div>
    </div>
  );
}
