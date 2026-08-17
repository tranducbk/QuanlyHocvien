"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePaperAirplane,
  HiOutlineXCircle,
} from "react-icons/hi";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import Checkbox from "@/library/Checkbox";
import DatePicker from "@/library/DatePicker";
import ErrorState from "@/library/ErrorState";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import { timeTableService } from "@/services/time-tables";
import {
  CutRice,
  CutRiceRequest,
  MealDayKey,
  MealSlotKey,
  WeeklyCutRice,
} from "@/types/cut-rice";
import { TimeTableSemester } from "@/types/time-tables";
import { formatDateTime } from "@/utils/fn-common";
import MealScheduleSkeleton from "./MealScheduleSkeleton";
import CreateMealRequestForm from "./CreateMealRequestForm";

const mealDays: MealDayKey[] = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const mealSlots: Array<{ key: MealSlotKey; label: string; time: string }> = [
  { key: "morning", label: "Bữa sáng", time: "06:00" },
  { key: "noon", label: "Bữa trưa", time: "11:00" },
  { key: "evening", label: "Bữa tối", time: "17:30" },
];

const toDateOnly = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
};

const getWeekRange = (value: string) => {
  const date = value ? parseLocalDate(value) : new Date();
  date.setHours(0, 0, 0, 0);
  const diffToMonday = date.getDay() === 0 ? -6 : 1 - date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { weekStartDate: toDateOnly(start), weekEndDate: toDateOnly(end) };
};

const formatWeekRange = (start?: string | null, end?: string | null) =>
  start && end
    ? `${start.split("-").reverse().join("/")} - ${end.split("-").reverse().join("/")}`
    : "Chưa chọn tuần";

const getSlot = (record: CutRice | undefined, day: MealDayKey) => {
  const weekly = record?.weekly || {};
  return weekly[day] || weekly[day.toLowerCase()] || {};
};

const getRequestSlot = (record: CutRiceRequest, day: MealDayKey) => {
  const weekly = record.weekly || {};
  return weekly[day] || weekly[day.toLowerCase()] || {};
};


const getSemesterLabel = (semester: TimeTableSemester) => {
  const schoolYear = semester.schoolYearInfo?.schoolYear;
  return [schoolYear, `Học kỳ ${semester.code}`].filter(Boolean).join(" - ");
};

const getRequestStatus = (request: CutRiceRequest) => {
  if (request.status === "APPROVED") return { label: "Đã duyệt", variant: "success" as const };
  if (request.status === "REJECTED") return { label: "Từ chối", variant: "error" as const };
  return { label: "Chờ duyệt", variant: "warning" as const };
};

export default function Main() {
  const { openModal } = useModalStore();
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedWeekDate, setSelectedWeekDate] = useState(() =>
    toDateOnly(new Date())
  );

  const {
    data: semestersResponse,
    isLoading: isLoadingSemesters,
    isError: isSemesterError,
    error: semesterError,
    refetch: refetchSemesters,
  } = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_TIME_TABLE, "semesters"],
    queryFn: timeTableService.getMyTimeTableSemesters,
  });

  const semesters = useMemo(
    () => semestersResponse?.data || [],
    [semestersResponse]
  );

  const activeSemesterId = semesters.some(
    (semester) => semester.id === selectedSemesterId
  )
    ? selectedSemesterId
    : semesters[0]?.id || "";

  const activeWeekRange = useMemo(
    () => getWeekRange(selectedWeekDate),
    [selectedWeekDate]
  );

  const semesterOptions = useMemo(
    () =>
      semesters.map((semester) => ({
        value: semester.id,
        label: getSemesterLabel(semester),
      })),
    [semesters]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.CUT_RICE, "student", activeSemesterId, activeWeekRange.weekStartDate],
    queryFn: () =>
      cutRiceService.getMyCutRice({
        semesterId: activeSemesterId,
        weekStartDate: activeWeekRange.weekStartDate,
      }),
    enabled: Boolean(activeSemesterId),
  });

  const {
    data: requestsResponse,
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: [QUERY_KEYS.CUT_RICE_REQUESTS, "student", activeSemesterId, activeWeekRange.weekStartDate],
    queryFn: () =>
      cutRiceService.getMyRequests({
        semesterId: activeSemesterId,
        weekStartDate: activeWeekRange.weekStartDate,
        limit: 5,
      }),
    enabled: Boolean(activeSemesterId),
  });

  const cutRice = data?.data;
  const requests = requestsResponse?.data || [];

  const summary = useMemo(() => {
    const totalSlots = mealDays.length * mealSlots.length;
    const cutCount = mealDays.reduce((total, day) => {
      const slot = getSlot(cutRice, day);
      return (
        total +
        mealSlots.reduce(
          (dayTotal, meal) => dayTotal + Number(Boolean(slot[meal.key])),
          0
        )
      );
    }, 0);

    return {
      totalSlots,
      cutCount,
      activeDays: mealDays.filter((day) => {
        const slot = getSlot(cutRice, day);
        return mealSlots.some((meal) => slot[meal.key]);
      }).length,
    };
  }, [cutRice]);

  return (
    <PageContainer
      breadcrumb={[
        { label: "Trang chủ", href: "/student" },
        { label: "Lịch cắt cơm" },
      ]}
      title="Lịch cắt cơm"
      subtitle="Theo dõi lịch cắt cơm theo học kỳ và gửi yêu cầu điều chỉnh khi cần."
      isLoading={isLoadingSemesters}
      skeleton={<MealScheduleSkeleton />}
      isError={isSemesterError}
      errorMessage={semesterError?.message}
      onRetry={refetchSemesters}
      className="space-y-8"
      actions={
        <Button
          icon={HiOutlinePaperAirplane}
          onClick={() => {
            if (!activeSemesterId) return;
            openModal({
              title: "Tạo yêu cầu cắt cơm",
              content: (
                <CreateMealRequestForm
                  semesterId={activeSemesterId}
                  weekStartDate={activeWeekRange.weekStartDate}
                  onSuccessCallback={refetchRequests}
                />
              ),
              size: "lg",
            });
          }}
        >
          Tạo yêu cầu cắt cơm
        </Button>
      }
    >
      {semesters.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-end gap-3">
            <div className="w-full sm:max-w-sm">
              <Select
                label="Học kỳ"
                placeholder="Chọn học kỳ"
                prefixIcon={<HiOutlineCalendar />}
                value={activeSemesterId}
                onChange={(value) => {
                  setSelectedSemesterId(String(value));
                }}
                options={semesterOptions}
                emptyText="Chưa có học kỳ"
              />
            </div>
            <div className="w-full sm:max-w-sm">
              <DatePicker
                label="Tuần áp dụng"
                value={selectedWeekDate}
                onChange={(value) => {
                  setSelectedWeekDate(value || toDateOnly(new Date()));
                }}
                placeholder="Chọn ngày trong tuần"
              />
            </div>
          </div>

          {isLoading ? (
            <MealScheduleSkeleton />
          ) : isError ? (
            <ErrorState
              title="Không thể tải lịch cắt cơm"
              message={error?.message}
              onRetry={refetch}
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 dark:border-primary-700/60 dark:bg-primary-950/40">
                  <div className="flex items-center gap-2 text-primary-700 dark:text-primary-100">
                    <HiOutlineCalendar size={18} />
                    <Typography variant="caption" weight="bold">
                      Tổng bữa cắt
                    </Typography>
                  </div>
                  <Typography variant="h2" className="mt-2 text-primary-700 dark:text-primary-100">
                    {summary.cutCount}/{summary.totalSlots}
                  </Typography>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-700/60 dark:bg-emerald-950/40">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-100">
                    <HiOutlineCheckCircle size={18} />
                    <Typography variant="caption" weight="bold">
                      Ngày có lịch cắt
                    </Typography>
                  </div>
                  <Typography variant="h2" className="mt-2 text-emerald-700 dark:text-emerald-100">
                    {summary.activeDays}/7
                  </Typography>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-700/60 dark:bg-amber-950/40">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-100">
                    <HiOutlineClock size={18} />
                    <Typography variant="caption" weight="bold">
                      Cập nhật
                    </Typography>
                  </div>
                  <Typography variant="body" weight="black" className="mt-3 text-amber-700 dark:text-amber-100">
                    {cutRice?.lastUpdated
                      ? formatDateTime(cutRice.lastUpdated)
                      : cutRice?.updatedAt
                        ? formatDateTime(cutRice.updatedAt)
                        : "Chưa có dữ liệu"}
                  </Typography>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant={cutRice?.isAutoGenerated ? "success" : "warning"}>
                  {cutRice?.isAutoGenerated ? "Tự động" : "Thủ công"}
                </Badge>
                <Badge variant="secondary">
                  {cutRice?.notes || "Không có ghi chú"}
                </Badge>
                <Badge variant="neutral">
                  Tuần {formatWeekRange(cutRice?.weekStartDate || activeWeekRange.weekStartDate, cutRice?.weekEndDate || activeWeekRange.weekEndDate)}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {mealDays.map((day) => {
                  const slot = getSlot(cutRice, day);
                  const cutMeals = mealSlots.filter((meal) => slot[meal.key]).length;

                  return (
                    <div
                      key={day}
                      className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors dark:border-neutral-700/80 dark:bg-neutral-900 dark:shadow-black/20"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-700/80">
                        <Typography variant="body" weight="bold" className="text-neutral-900 dark:text-neutral-100">
                          {day}
                        </Typography>
                        <Badge variant={cutMeals ? "success" : "secondary"}>
                          {cutMeals}/3 bữa
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {mealSlots.map((meal) => {
                          const isCut = Boolean(slot[meal.key]);
                          const StatusIcon = isCut ? HiOutlineXCircle : HiOutlineCheckCircle;

                          return (
                            <div
                              key={meal.key}
                              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                                isCut
                                  ? "border-amber-100 bg-amber-50/80 dark:border-amber-700/60 dark:bg-amber-950/40"
                                  : "border-neutral-100 bg-neutral-50/70 dark:border-neutral-700/70 dark:bg-neutral-800/70"
                              }`}
                            >
                              <div className="min-w-0">
                                <Typography variant="body" weight="semibold" className="text-neutral-900 dark:text-neutral-100">
                                  {meal.label}
                                </Typography>
                                <Typography variant="caption" className="text-neutral-500 dark:text-neutral-400">
                                  {meal.time}
                                </Typography>
                              </div>
                              <Badge variant={isCut ? "warning" : "neutral"} className="shrink-0 gap-1.5 whitespace-nowrap">
                                <StatusIcon size={13} />
                                {isCut ? "Cắt cơm" : "Không cắt"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900">
                <Typography variant="h5" weight="bold">
                    Yêu cầu gần đây
                  </Typography>
                  <div className="mt-4 space-y-3">
                    {isLoadingRequests ? (
                      <Typography variant="body" color="gray">
                        Đang tải yêu cầu...
                      </Typography>
                    ) : requests.length ? (
                      requests.map((request) => {
                        const status = getRequestStatus(request);
                        const cutCount = mealDays.reduce((total, day) => {
                          const slot = getRequestSlot(request, day);
                          return total + mealSlots.reduce((sum, meal) => sum + Number(Boolean(slot[meal.key])), 0);
                        }, 0);

                        return (
                          <div key={request.id} className="rounded-2xl border border-neutral-100 p-3 dark:border-neutral-700">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant={status.variant}>{status.label}</Badge>
                              <Typography variant="caption" color="gray">
                                {formatDateTime(request.createdAt)}
                              </Typography>
                            </div>
                            <Typography variant="body" weight="semibold" className="mt-2">
                              {cutCount}/21 bữa đề xuất cắt
                            </Typography>
                            {request.notes && (
                              <Typography variant="caption" color="gray" className="mt-1 block">
                                {request.notes}
                              </Typography>
                            )}
                            {request.reviewNote && (
                              <Typography variant="caption" color="gray" className="mt-1 block">
                                Phản hồi: {request.reviewNote}
                              </Typography>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <Typography variant="body" color="gray">
                        Chưa có yêu cầu nào cho học kỳ này.
                      </Typography>
                    )}
                  </div>
                </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Typography variant="body" weight="semibold" className="text-neutral-600 dark:text-neutral-300">
            Bạn chưa có thời khóa biểu cho học kỳ nào.
          </Typography>
        </div>
      )}
    </PageContainer>
  );
}
