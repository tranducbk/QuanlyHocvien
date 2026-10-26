"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineCalendar } from "react-icons/hi";
import ErrorState from "@/library/ErrorState";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { timeTableService } from "@/services/schedules/time-tables";
import { trainingClassAcademicService } from "@/services/academic-results/training-class-academic";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ScheduleItem,
  TimeTable,
  TimeTableSemester,
} from "@/types/schedules/time-tables";
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
  const trainingSystemCode = useAuthStore((state) => state.user?.trainingSystemCode);
  const isCohort = Boolean(trainingSystemCode && trainingSystemCode !== "HE_5");

  const cohortTimeTablesQuery = useQuery({
    queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, "me", "time-tables"],
    queryFn: trainingClassAcademicService.getMyTimeTables,
    enabled: isCohort,
  });

  const {
    data: semestersResponse,
    isLoading: isLoadingH5Semesters,
    isError: isH5SemesterError,
    error: h5SemesterError,
    refetch: refetchH5Semesters,
  } = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_TIME_TABLE, "semesters"],
    queryFn: timeTableService.getMyTimeTableSemesters,
    enabled: trainingSystemCode === "HE_5",
  });

  const semesters = useMemo<TimeTableSemester[]>(() => {
    if (!isCohort) return semestersResponse?.data || [];

    const cohortSemesters = new Map<string, TimeTableSemester>();
    for (const timeTable of cohortTimeTablesQuery.data?.data || []) {
      const semester = timeTable.trainingClassSemester;
      if (!semester) continue;
      cohortSemesters.set(semester.id, {
        id: semester.id,
        code: semester.code,
        schoolYearInfo: {
          id: semester.id,
          schoolYear: semester.schoolYear,
        },
      });
    }
    return Array.from(cohortSemesters.values());
  }, [cohortTimeTablesQuery.data, isCohort, semestersResponse]);

  const isLoadingSemesters = isCohort
    ? cohortTimeTablesQuery.isLoading
    : trainingSystemCode === "HE_5" && isLoadingH5Semesters;
  const isSemesterError = isCohort
    ? cohortTimeTablesQuery.isError
    : trainingSystemCode === "HE_5" && isH5SemesterError;
  const semesterError = isCohort ? cohortTimeTablesQuery.error : h5SemesterError;
  const refetchSemesters = () => {
    if (isCohort) {
      void cohortTimeTablesQuery.refetch();
      return;
    }
    void refetchH5Semesters();
  };

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
    data: h5TimeTableResponse,
    isLoading: isLoadingH5TimeTable,
    isError: isH5TimeTableError,
    error: h5TimeTableError,
    refetch: refetchH5TimeTable,
  } = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_TIME_TABLE, activeSemesterId],
    queryFn: () =>
      timeTableService.getMyTimeTables({
        semesterId: activeSemesterId,
      }),
    enabled: trainingSystemCode === "HE_5" && Boolean(activeSemesterId),
  });

  const isLoadingTimeTable = isCohort
    ? cohortTimeTablesQuery.isLoading
    : isLoadingH5TimeTable;
  const isTimeTableError = isCohort
    ? cohortTimeTablesQuery.isError
    : isH5TimeTableError;
  const timeTableError = isCohort ? cohortTimeTablesQuery.error : h5TimeTableError;
  const refetchTimeTable = () => {
    if (isCohort) {
      void cohortTimeTablesQuery.refetch();
      return;
    }
    void refetchH5TimeTable();
  };

  const timeTable = useMemo<TimeTable>(() => {
    const cohortTimeTables = isCohort
      ? cohortTimeTablesQuery.data?.data?.filter((item) => item.semesterId === activeSemesterId) || []
      : [];
    const timeTables = isCohort ? [] : h5TimeTableResponse?.data || [];
    const cohortSchedules: ScheduleItem[] = cohortTimeTables.flatMap((item) =>
      item.schedules.map((schedule) => ({
        day: schedule.day === 7 ? "Chủ nhật" : `Thứ ${schedule.day + 1}`,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room || "",
        subjectName: schedule.subjectName,
        week: schedule.week,
      })),
    );
    const schedules = isCohort
      ? cohortSchedules
      : timeTables.flatMap((item) => item.schedules || []);

    return {
      id: cohortTimeTables[0]?.id || timeTables[0]?.id || "my-time-table",
      userId: timeTables[0]?.userId || "",
      semesterId: activeSemesterId || null,
      semester: selectedSemester || timeTables[0]?.semester || null,
      schedules,
      scheduleCount: schedules.length,
      subjectNames: getUniqueStringValues(schedules, "subjectName"),
      rooms: getUniqueStringValues(schedules, "room"),
      createdAt: timeTables[0]?.createdAt || "",
      updatedAt: timeTables[0]?.updatedAt || "",
    };
  }, [activeSemesterId, cohortTimeTablesQuery.data, h5TimeTableResponse, isCohort, selectedSemester]);

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
      subtitle={
        isCohort
          ? "Xem lịch học chung của lớp theo ngày và học kỳ."
          : "Xem lịch học cá nhân theo ngày và lọc theo từng học kỳ."
      }
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
