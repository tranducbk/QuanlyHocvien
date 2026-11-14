"use client";

import { AiOutlineDelete, AiOutlineExclamationCircle, AiOutlinePlus } from "@/library/icons";

import { useEffect, useRef, useState } from "react";
import {
  useIsMutating,
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { useToastStore } from "@/store/useToastStore";
import useAssignedClassCollection from "@/hooks/training-program/useAssignedClassCollection";
import { QUERY_KEYS } from "@/constants/query-keys";
import TimeTableCalendarForm from "@/components/schedules/commander/time-tables/TimeTableCalendarForm";
import {
  trainingClassService,
  type TrainingClassLesson,
} from "@/services/training-program/training-classes";
import type { CreateTimeTableFormValues } from "@/utils/validations";

type Semester = { id: string; code: number; schoolYear: string };
type ScheduleScope = { classId: string; semesterId: string };
type SaveTimeTableInput = ScheduleScope & {
  schedules: TrainingClassLesson[];
  nextScope?: ScheduleScope;
};
const saveMutationKey = ["training-class-time-table-save"];

const dayName = (day: number) => (day === 7 ? "Chủ nhật" : `Thứ ${day + 1}`);
const dayNumber = (day: string) =>
  day === "Chủ nhật" ? 7 : Number(day.replace("Thứ ", "")) - 1;
const toFormSchedule = (schedule: TrainingClassLesson) => ({
  day: dayName(schedule.day),
  room: schedule.room ?? "",
  subjectName: "",
  subjectId: schedule.subjectId,
  week: schedule.week ?? [],
  timeRange: {
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  },
});
const canonicalSchedules = (schedules: TrainingClassLesson[]) =>
  schedules
    .map((schedule) => ({
      subjectId: schedule.subjectId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room?.trim() || null,
      week: [...new Set(schedule.week ?? [])].sort((a, b) => a - b),
    }))
    .sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right))
    );
const hasScheduleChanges = (
  draft: TrainingClassLesson[] | null,
  saved: TrainingClassLesson[]
) =>
  draft !== null &&
  JSON.stringify(canonicalSchedules(draft)) !==
    JSON.stringify(canonicalSchedules(saved));
const weeksOverlap = (first: number[], second: number[]) =>
  !first.length ||
  !second.length ||
  first.some((week) => second.includes(week));
const findConflict = (
  schedules: TrainingClassLesson[],
  candidate: TrainingClassLesson
) =>
  schedules.find(
    (schedule) =>
      schedule.day === candidate.day &&
      weeksOverlap(schedule.week ?? [], candidate.week ?? []) &&
      candidate.startTime < schedule.endTime &&
      schedule.startTime < candidate.endTime
  );

function TrainingClassScheduleEditor({
  control,
  register,
  errors,
  subjectOptions,
}: {
  control: Control<CreateTimeTableFormValues>;
  register: UseFormRegister<CreateTimeTableFormValues>;
  errors: FieldErrors<CreateTimeTableFormValues>;
  subjectOptions: { value: string; label: string }[];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  return (
    <TimeTableCalendarForm
      control={control}
      fields={fields}
      register={register}
      errors={errors}
      append={append}
      remove={remove}
      roomRequired={false}
      subjectOptions={subjectOptions}
    />
  );
}

function SaveScheduleButton({
  onSave,
  disabled,
}: {
  onSave: () => void;
  disabled?: boolean;
}) {
  const isSaving = useIsMutating({ mutationKey: saveMutationKey }) > 0;
  return (
    <Button
      type="button"
      isLoading={isSaving}
      disabled={disabled || isSaving}
      onClick={onSave}
    >
      Lưu thời khóa biểu
    </Button>
  );
}

export default function TimeTable() {
  const semesters = useAssignedClassCollection<Semester>(
    "semesters",
    trainingClassService.getSemesters
  );
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [edited, setEdited] = useState<TrainingClassLesson[] | null>(null);
  const [pendingScope, setPendingScope] = useState<ScheduleScope | null>(null);
  const [message, setMessage] = useState("");
  const isDirtyRef = useRef(false);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const addToast = useToastStore((state) => state.addToast);
  const {
    control,
    register,
    reset,
    getValues,
    formState: { errors: formErrors },
  } = useForm<CreateTimeTableFormValues>({
    defaultValues: { userId: "", semesterId: "", schedules: [] },
  });
  const formSchedules = useWatch({
    control,
    name: "schedules",
    defaultValue: [],
  });
  const client = useQueryClient();
  const pairs = semesters.rows.map((item) => ({
    ...item,
    semesterName: `${item.schoolYear} · HK ${item.code}`,
  }));
  const subjectQueries = useQueries({
    queries: pairs.map((item) => ({
      queryKey: [
        QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
        semesters.commanderId,
        item.classId,
        item.id,
        "subjects",
      ],
      queryFn: () => trainingClassService.getSubjects(item.classId, item.id),
    })),
  });
  const timetableQueries = useQueries({
    queries: pairs.map((item) => ({
      queryKey: [
        QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
        semesters.commanderId,
        item.classId,
        item.id,
        "time-table",
      ],
      queryFn: () => trainingClassService.getTimeTable(item.classId, item.id),
    })),
  });
  const selectedIndex = pairs.findIndex(
    (item) => item.classId === classId && item.id === semesterId
  );
  const selectedTimetable = timetableQueries[selectedIndex];
  const selectedSubjects = subjectQueries[selectedIndex];
  const savedSchedules = selectedTimetable?.data?.data?.schedules ?? [];
  const formDraft = (formSchedules ?? []).map((schedule) => ({
    subjectId: schedule.subjectId ?? "",
    day: dayNumber(schedule.day),
    startTime: schedule.timeRange?.startTime ?? "",
    endTime: schedule.timeRange?.endTime ?? "",
    room: schedule.room.trim() || null,
    week: schedule.week ?? [],
  }));
  const activeDraft = isFormOpen ? formDraft : edited;
  const schedules = activeDraft ?? savedSchedules;
  const isDirty = hasScheduleChanges(activeDraft, savedSchedules);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  const currentScope = { classId, semesterId };
  const getScopeLabel = (scope: ScheduleScope) => {
    const target = pairs.find(
      (item) => item.classId === scope.classId && item.id === scope.semesterId
    );
    const targetClass = semesters.assignedClasses.find(
      (item) => item.id === scope.classId
    );
    if (!scope.classId) return "chưa chọn lớp";
    return scope.semesterId
      ? `${targetClass?.name ?? "Lớp"} · ${target?.semesterName ?? "Học kỳ"}`
      : (targetClass?.name ?? "lớp đã chọn");
  };
  const currentScopeLabel = getScopeLabel(currentScope);
  const pendingScopeLabel = pendingScope ? getScopeLabel(pendingScope) : "";
  const subjectNames = new Map(
    (selectedSubjects?.data?.data ?? []).map((subject) => [
      subject.id,
      subject.subjectName,
    ])
  );
  const scheduleEntries = schedules
    .map((schedule, index) => ({
      ...schedule,
      index,
      subjectName:
        subjectNames.get(schedule.subjectId) ?? "Môn không còn trong danh sách",
    }))
    .sort(
      (left, right) =>
        left.day - right.day || left.startTime.localeCompare(right.startTime)
    );

  const applyScope = (scope: ScheduleScope) => {
    setClassId(scope.classId);
    setSemesterId(scope.semesterId);
    reset({
      userId: scope.classId,
      semesterId: scope.semesterId,
      schedules: [],
    });
    setIsFormOpen(false);
    setEdited(null);
  };
  const save = useMutation({
    mutationKey: saveMutationKey,
    mutationFn: ({
      classId: targetClassId,
      semesterId: targetSemesterId,
      schedules: targetSchedules,
    }: SaveTimeTableInput) =>
      trainingClassService.saveTimeTable(
        targetClassId,
        targetSemesterId,
        targetSchedules
      ),
    onSuccess: async (_result, variables) => {
      await client.invalidateQueries({
        queryKey: [
          QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
          semesters.commanderId,
          variables.classId,
          variables.semesterId,
          "time-table",
        ],
      });
      setEdited(null);
      setIsFormOpen(false);
      if (variables.nextScope) {
        applyScope(variables.nextScope);
        setPendingScope(null);
        const nextLabel = getScopeLabel(variables.nextScope);
        setMessage(
          `Đã lưu thời khóa biểu ${currentScopeLabel} và chuyển sang ${nextLabel}.`
        );
      } else {
        isDirtyRef.current = false;
        reset({
          userId: variables.classId,
          semesterId: variables.semesterId,
          schedules: variables.schedules.map(toFormSchedule),
        });
        closeModal();
      }
    },
    onError: () =>
      addToast({
        message:
          "Không lưu được thời khóa biểu. Bản nháp vẫn được giữ; hãy kiểm tra dữ liệu và thử lại.",
        variant: "error",
      }),
  });
  const requestScopeChange = (nextScope: ScheduleScope) => {
    if (
      save.isPending ||
      (nextScope.classId === classId && nextScope.semesterId === semesterId)
    ) {
      return;
    }
    if (isDirty) {
      setPendingScope(nextScope);
      setMessage("");
      return;
    }
    applyScope(nextScope);
    setMessage("");
  };

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const openScheduleEditor = () => {
    reset({
      userId: classId,
      semesterId,
      schedules: schedules.map(toFormSchedule),
    });
    setIsFormOpen(true);
    setMessage("");
    openModal({
      title: "Xếp thời khóa biểu",
      content: (
        <div className="space-y-4 pb-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {currentScopeLabel} · Chọn môn đã giao cho lớp, tuần học, thời gian
            và phòng.
          </p>
          <TrainingClassScheduleEditor
            control={control}
            register={register}
            errors={formErrors}
            subjectOptions={(selectedSubjects?.data?.data ?? []).map(
              (item) => ({
                value: item.id,
                label: `${item.subjectCode} · ${item.subjectName}`,
              })
            )}
          />
        </div>
      ),
      footer: (
        <>
          <Button
            type="button"
            variant="ghost"
            disabled={save.isPending}
            onClick={closeModal}
          >
            Hủy
          </Button>
          <SaveScheduleButton
            disabled={selectedTimetable?.isError || selectedSubjects?.isError}
            onSave={() => saveDraft()}
          />
        </>
      ),
      size: "full",
      config: {
        overlayClassName: "backdrop-blur-md",
        mutationKey: saveMutationKey,
        beforeClose: () => {
          if (!isDirtyRef.current) {
            setIsFormOpen(false);
            return true;
          }
          openConfirm({
            title: "Lịch học chưa lưu",
            message:
              "Đóng form sẽ bỏ các thay đổi chưa lưu. Bạn có muốn bỏ thay đổi và đóng form không?",
            confirmText: "Bỏ thay đổi",
            cancelText: "Tiếp tục chỉnh sửa",
            variant: "warning",
            mutationKey: saveMutationKey,
            onConfirm: () => {
              closeConfirm();
              isDirtyRef.current = false;
              reset({
                userId: classId,
                semesterId,
                schedules: savedSchedules.map(toFormSchedule),
              });
              setEdited(null);
              setIsFormOpen(false);
              setMessage("");
              closeModal();
            },
          });
          return false;
        },
      },
    });
  };
  const saveDraft = (nextScope?: ScheduleScope) => {
    if (!isDirtyRef.current && !nextScope) {
      setIsFormOpen(false);
      closeModal();
      return;
    }
    if (
      !classId ||
      !semesterId ||
      selectedTimetable?.isLoading ||
      selectedTimetable?.isError ||
      selectedSubjects?.isLoading ||
      selectedSubjects?.isError
    ) {
      addToast({
        message: "Chọn lớp, học kỳ và chờ tải dữ liệu trước khi thêm buổi.",
        variant: "warning",
      });
      return;
    }
    const formValues = getValues("schedules") ?? [];
    const candidateSchedules = formValues.map((schedule) => ({
      subjectId: schedule.subjectId ?? "",
      day: dayNumber(schedule.day),
      startTime: schedule.timeRange.startTime,
      endTime: schedule.timeRange.endTime,
      room: schedule.room.trim() || null,
      week: [...new Set(schedule.week ?? [])].sort((a, b) => a - b),
    }));
    if (candidateSchedules.some((schedule) => !schedule.subjectId)) {
      addToast({
        message: "Chọn môn học cho tất cả các buổi trước khi lưu.",
        variant: "warning",
      });
      return;
    }
    if (
      candidateSchedules.some(
        (schedule) =>
          !schedule.startTime ||
          !schedule.endTime ||
          schedule.startTime >= schedule.endTime
      )
    ) {
      addToast({
        message: "Kiểm tra giờ bắt đầu và kết thúc của từng buổi.",
        variant: "warning",
      });
      return;
    }
    for (let index = 0; index < candidateSchedules.length; index += 1) {
      const conflict = findConflict(
        candidateSchedules.slice(0, index),
        candidateSchedules[index]
      );
      if (conflict) {
        const conflictingSubject =
          selectedSubjects?.data?.data?.find(
            (item) => item.id === conflict.subjectId
          )?.subjectName ?? "một môn học khác";
        const candidate = candidateSchedules[index];
        addToast({
          message: `Buổi ${dayName(candidate.day)} ${candidate.startTime}–${candidate.endTime} bị trùng với ${conflictingSubject} trong các tuần giao nhau.`,
          variant: "warning",
        });
        return;
      }
    }
    setEdited(candidateSchedules);
    setIsFormOpen(false);
    save.mutate({
      ...currentScope,
      schedules: candidateSchedules,
      ...(nextScope ? { nextScope } : {}),
    });
  };

  const loading =
    semesters.isLoading ||
    timetableQueries.some((query) => query.isLoading) ||
    subjectQueries.some((query) => query.isLoading);
  const error =
    semesters.isError ||
    timetableQueries.some((query) => query.isError) ||
    subjectQueries.some((query) => query.isError);

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Lịch học" },
      ]}
      title="Lịch học"
      subtitle="Xếp thời khóa biểu dùng chung cho từng lớp và học kỳ."
      isError={error}
      onRetry={() => {
        semesters.refetch();
        timetableQueries.forEach((query) => {
          void query.refetch();
        });
        subjectQueries.forEach((query) => {
          void query.refetch();
        });
      }}
    >
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Thời khóa biểu lớp
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Chọn lớp và học kỳ để xem hoặc xếp lịch chung.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Lớp"
            placeholder="Chọn lớp"
            value={classId}
            disabled={save.isPending || Boolean(pendingScope)}
            onChange={(value) =>
              requestScopeChange({ classId: String(value), semesterId: "" })
            }
            options={semesters.assignedClasses.map((item) => ({
              value: item.id,
              label: `${item.name} (${item.code})`,
            }))}
          />
          <Select
            label="Học kỳ"
            placeholder="Chọn học kỳ"
            value={semesterId}
            disabled={!classId || save.isPending || Boolean(pendingScope)}
            isLoading={semesters.isLoading}
            onChange={(value) =>
              requestScopeChange({ classId, semesterId: String(value) })
            }
            options={pairs
              .filter((item) => item.classId === classId)
              .map((item) => ({ value: item.id, label: item.semesterName }))}
          />
        </div>

        {!classId || !semesterId ? (
          <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center dark:border-neutral-700">
            <p className="font-semibold text-neutral-800 dark:text-neutral-100">
              Chọn lớp và học kỳ
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Thời khóa biểu của phạm vi đã chọn sẽ hiển thị tại đây.
            </p>
          </div>
        ) : loading ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Đang tải thời khóa biểu...
          </p>
        ) : error ? (
          <p className="py-6 text-center text-sm text-error-600" role="alert">
            Không tải được lịch học hoặc môn học.
          </p>
        ) : (
          <>
            <div className="flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <Button
                type="button"
                icon={AiOutlinePlus}
                disabled={save.isPending || Boolean(pendingScope) || isFormOpen}
                onClick={openScheduleEditor}
              >
                {isDirty ? "Tiếp tục xếp lịch" : "Xếp lịch"}
              </Button>
            </div>

            {isDirty && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  Thay đổi sẽ áp dụng cho toàn bộ lịch của {currentScopeLabel}.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={save.isPending || Boolean(pendingScope)}
                    onClick={() => {
                      reset({
                        userId: classId,
                        semesterId,
                        schedules: savedSchedules.map(toFormSchedule),
                      });
                      setEdited(null);
                      setIsFormOpen(false);
                      setMessage("Đã bỏ các thay đổi chưa lưu.");
                    }}
                  >
                    Bỏ thay đổi
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      save.isPending ||
                      selectedTimetable?.isError ||
                      selectedSubjects?.isError
                    }
                    isLoading={save.isPending}
                    onClick={() => saveDraft()}
                  >
                    Lưu thời khóa biểu
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Các buổi trong thời khóa biểu
              </h3>
              {scheduleEntries.length ? (
                <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                  {scheduleEntries.map((entry) => (
                    <li
                      className="flex items-center justify-between gap-3 p-3 sm:px-4"
                      key={`${entry.subjectId}-${entry.day}-${entry.startTime}-${entry.index}`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="min-w-20 rounded-lg bg-primary-50 px-2 py-1 text-center text-xs font-semibold text-primary-800 dark:bg-primary-950/50 dark:text-primary-200">
                          {dayName(entry.day)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                            {entry.subjectName}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {entry.startTime}–{entry.endTime}
                            {entry.room ? ` · ${entry.room}` : ""}
                            {" · "}
                            {entry.week?.length
                              ? `Tuần ${entry.week.join(", ")}`
                              : "Mọi tuần"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Bỏ buổi ${entry.subjectName}, ${dayName(entry.day)} ${entry.startTime}`}
                        title="Bỏ khỏi bản nháp"
                        disabled={save.isPending || Boolean(pendingScope)}
                        onClick={() => {
                          setEdited(
                            schedules.filter(
                              (_schedule, index) => index !== entry.index
                            )
                          );
                          setMessage(
                            "Đã bỏ buổi khỏi bản nháp. Thay đổi chưa được lưu."
                          );
                        }}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-error-50 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-error-950/40"
                      >
                        <AiOutlineDelete aria-hidden="true" size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center dark:border-neutral-700">
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    Chưa có buổi học
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Bấm “Thêm buổi học” để xếp lịch cho lớp này.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {message && !pendingScope && (
        <p
          className="mt-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          role="status"
        >
          {message}
        </p>
      )}

      {pendingScope && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm">
          <section
            aria-labelledby="unsaved-schedule-title"
            aria-describedby="unsaved-schedule-description"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-950 sm:p-6"
            role="alertdialog"
          >
            <div className="flex items-start gap-3">
              <AiOutlineExclamationCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                size={24}
              />
              <div>
                <h2
                  className="font-semibold text-neutral-900 dark:text-neutral-100"
                  id="unsaved-schedule-title"
                >
                  Có thay đổi chưa lưu
                </h2>
                <p
                  className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300"
                  id="unsaved-schedule-description"
                >
                  Bản nháp của {currentScopeLabel} sẽ mất nếu rời khỏi phạm vi
                  này. Bạn muốn lưu trước khi chuyển sang {pendingScopeLabel}?
                </p>
                {message && (
                  <p className="mt-3 text-sm text-error-600" role="alert">
                    {message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={save.isPending}
                onClick={() => {
                  setPendingScope(null);
                  setMessage("");
                }}
              >
                Ở lại
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={save.isPending}
                onClick={() => {
                  const target = pendingScope;
                  const sourceLabel = currentScopeLabel;
                  const targetLabel = pendingScopeLabel;
                  setEdited(null);
                  setPendingScope(null);
                  applyScope(target);
                  setMessage(
                    `Đã bỏ bản nháp của ${sourceLabel} và chuyển sang ${targetLabel}.`
                  );
                }}
              >
                Bỏ thay đổi và chuyển
              </Button>
              <Button
                type="button"
                isLoading={save.isPending}
                onClick={() => saveDraft(pendingScope)}
              >
                Lưu và chuyển
              </Button>
            </div>
          </section>
        </div>
      )}
    </PageContainer>
  );
}
