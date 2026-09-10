"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMoon,
  HiOutlinePaperAirplane,
  HiOutlineSun,
} from "react-icons/hi";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import DatePicker from "@/library/DatePicker";
import ErrorState from "@/library/ErrorState";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Typography from "@/library/Typography";
import { useModalStore } from "@/store/useModalStore";
import { QUERY_KEYS } from "@/constants/query-keys";
import { cutRiceService } from "@/services/cut-rice";
import { timeTableService } from "@/services/time-tables";
import {
  CutRiceRequest,
} from "@/types/cut-rice";
import { TimeTableSemester } from "@/types/time-tables";
import { formatDateTime } from "@/utils/fn-common";
import MealScheduleSkeleton from "./MealScheduleSkeleton";
import CreateMealRequestForm from "./CreateMealRequestForm";
import MealWeekGrid from "@/components/meal-schedules/MealWeekGrid";
import {
  countCutMeals,
  countCutMealsBySlot,
  getMealSlots,
  MEAL_DAYS,
  MEAL_SLOTS,
} from "@/utils/meal-schedule";
import styles from "./MealSchedule.module.css";

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

const getSemesterLabel = (semester: TimeTableSemester) => {
  const schoolYear = semester.schoolYearInfo?.schoolYear;
  return [schoolYear, `Học kỳ ${semester.code}`].filter(Boolean).join(" - ");
};

const getRequestStatus = (request: CutRiceRequest) => {
  if (request.status === "APPROVED") return { label: "Đã duyệt", variant: "success" as const };
  if (request.status === "REJECTED") return { label: "Từ chối", variant: "error" as const };
  return { label: "Chờ duyệt", variant: "warning" as const };
};

const mealIcons = {
  morning: HiOutlineSun,
  noon: HiOutlineClock,
  evening: HiOutlineMoon,
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
    const totalSlots = MEAL_DAYS.length * MEAL_SLOTS.length;
    const cutCount = countCutMeals(cutRice?.weekly);

    return {
      totalSlots,
      cutCount,
      mealTotals: countCutMealsBySlot(cutRice?.weekly),
      activeDays: MEAL_DAYS.filter((day) => {
        const slot = getMealSlots(cutRice?.weekly, day);
        return MEAL_SLOTS.some((meal) => slot[meal.key]);
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
              <div className={styles.mealSummary}>
                {MEAL_SLOTS.map((meal) => {
                  const MealIcon = mealIcons[meal.key];
                  return (
                    <div
                      key={meal.key}
                      className={`${styles.mealSummaryCard} ${styles[meal.key]}`}
                    >
                      <div className={styles.mealSummaryIcon}>
                        <MealIcon aria-hidden="true" />
                      </div>
                      <div>
                        <Typography variant="body" weight="bold">
                          {meal.label}
                        </Typography>
                        <Typography variant="caption" color="gray">
                          {meal.time}
                        </Typography>
                      </div>
                      <div className={styles.mealSummaryValue}>
                        <strong>{summary.mealTotals[meal.key]}</strong>
                        <span>/7 ngày cắt</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.metadata}>
                <Badge variant={cutRice?.isAutoGenerated ? "success" : "warning"}>
                  {cutRice?.isAutoGenerated ? "Tự động" : "Thủ công"}
                </Badge>
                <Badge variant="secondary">
                  Tổng {summary.cutCount}/{summary.totalSlots} bữa
                </Badge>
                <Badge variant="secondary">
                  {summary.activeDays}/7 ngày có lịch cắt
                </Badge>
                <Badge variant="secondary">
                  {cutRice?.notes || "Không có ghi chú"}
                </Badge>
                <Badge variant="neutral">
                  Tuần {formatWeekRange(cutRice?.weekStartDate || activeWeekRange.weekStartDate, cutRice?.weekEndDate || activeWeekRange.weekEndDate)}
                </Badge>
                <span className={styles.updatedAt}>
                  Cập nhật: {cutRice?.lastUpdated
                    ? formatDateTime(cutRice.lastUpdated)
                    : cutRice?.updatedAt
                      ? formatDateTime(cutRice.updatedAt)
                      : "Chưa có dữ liệu"}
                </span>
              </div>

              <section className={styles.scheduleSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <Typography variant="h4" weight="bold">
                      Lịch theo tuần
                    </Typography>
                    <Typography variant="caption" color="gray">
                      Đối chiếu từng ngày theo ba khung giờ ăn cố định.
                    </Typography>
                  </div>
                  <HiOutlineCalendar aria-hidden="true" />
                </div>
                <MealWeekGrid weekly={cutRice?.weekly} />
              </section>

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
                        const cutCount = countCutMeals(request.weekly);

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
