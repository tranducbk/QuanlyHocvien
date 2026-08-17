"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineCalendar } from "react-icons/hi";
import ErrorState from "@/library/ErrorState";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { timeTableService } from "@/services/time-tables";
import {
  ScheduleItem,
  TimeTable,
  TimeTableSemester,
} from "@/types/time-tables";
import TimeTableCalendar from "./TimeTableCalendar";
import TimeTableSkeleton from "./TimeTableSkeleton";

const getUniqueStringValues = (
  schedules: ScheduleItem[],
  key: "subjectName" | "room"
) =>
  Array.from(
    new Set(
      schedules
        .map((schedule) => schedule[key])
        .filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0
        )
    )
  );

const getSemesterLabel = (semester: TimeTableSemester) => {
  const schoolYear = semester.schoolYearInfo?.schoolYear;
  return [schoolYear, `Học kỳ ${semester.code}`].filter(Boolean).join(" - ");
};

export default function Main() {
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

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

  const selectedSemester = useMemo(
    () =>
      semesters.find((semester) => semester.id === activeSemesterId) || null,
    [activeSemesterId, semesters]
  );

  const {
    data,
    isLoading: isLoadingTimeTable,
    isError: isTimeTableError,
    error: timeTableError,
    refetch: refetchTimeTable,
  } = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_TIME_TABLE, activeSemesterId],
    queryFn: () =>
      timeTableService.getMyTimeTables({
        semesterId: activeSemesterId,
      }),
    enabled: Boolean(activeSemesterId),
  });

  const timeTable = useMemo<TimeTable>(() => {
    const timeTables = data?.data || [];
    const schedules = timeTables.flatMap((item) => item.schedules || []);

    return {
      id: timeTables[0]?.id || "my-time-table",
      userId: timeTables[0]?.userId || "",
      semesterId: activeSemesterId || null,
      semester: timeTables[0]?.semester || selectedSemester,
      schedules,
      scheduleCount: schedules.length,
      subjectNames: getUniqueStringValues(schedules, "subjectName"),
      rooms: getUniqueStringValues(schedules, "room"),
      createdAt: timeTables[0]?.createdAt || "",
      updatedAt: timeTables[0]?.updatedAt || "",
    };
  }, [activeSemesterId, data, selectedSemester]);

  const semesterOptions = useMemo(
    () =>
      semesters.map((semester) => ({
        value: semester.id,
        label: getSemesterLabel(semester),
      })),
    [semesters]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Trang chủ", href: "/student" },
        { label: "Lịch học" },
      ]}
      title="Lịch học"
      subtitle="Xem lịch học cá nhân theo ngày và lọc theo từng học kỳ."
      isLoading={isLoadingSemesters}
      skeleton={<TimeTableSkeleton />}
      isError={isSemesterError}
      errorMessage={semesterError?.message}
      onRetry={refetchSemesters}
      className="space-y-8"
    >
      {semesters.length > 0 ? (
        <>
          <div className="flex justify-end">
            <div className="w-full sm:max-w-sm">
              <Select
                label="Học kỳ"
                placeholder="Chọn học kỳ"
                prefixIcon={<HiOutlineCalendar />}
                value={activeSemesterId}
                onChange={(value) => setSelectedSemesterId(String(value))}
                options={semesterOptions}
                isLoading={isLoadingSemesters}
                emptyText="Chưa có học kỳ"
              />
            </div>
          </div>

          {isLoadingTimeTable ? (
            <TimeTableSkeleton showFilter={false} />
          ) : isTimeTableError ? (
            <ErrorState
              title="Không thể tải lịch học"
              message={timeTableError?.message}
              onRetry={refetchTimeTable}
            />
          ) : (
            <TimeTableCalendar
              key={activeSemesterId}
              timeTable={timeTable}
            />
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Typography
            variant="body"
            weight="semibold"
            className="text-neutral-600 dark:text-neutral-300"
          >
            Bạn chưa có thời khóa biểu cho học kỳ nào.
          </Typography>
        </div>
      )}
    </PageContainer>
  );
}
