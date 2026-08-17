"use client";

import { useMemo, useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import { ScheduleItem, TimeTable } from "@/types/time-tables";
import {
  addMonths,
  getCalendarDays,
  getInitialCalendarDate,
  getSchedulesForDate,
  getSemesterEnd,
  getSemesterStart,
  getSemesterWeek,
  isDateInSemester,
  isSameDay,
  isSameMonth,
  startOfMonth,
  toDateKey,
} from "./calendar-utils";

const weekDayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthFormatter = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});
const selectedDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

interface TimeTableCalendarProps {
  timeTable: TimeTable;
}

export default function TimeTableCalendar({
  timeTable,
}: TimeTableCalendarProps) {
  const schedules = useMemo(
    () => timeTable.schedules || [],
    [timeTable.schedules]
  );
  const semesterStart = useMemo(
    () => getSemesterStart(timeTable.semester),
    [timeTable.semester]
  );
  const semesterEnd = useMemo(
    () => getSemesterEnd(timeTable.semester),
    [timeTable.semester]
  );
  const initialDate = useMemo(
    () =>
      semesterStart && semesterEnd
        ? getInitialCalendarDate(semesterStart, semesterEnd)
        : new Date(),
    [semesterEnd, semesterStart]
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(initialDate)
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );

  const schedulesByDate = useMemo(() => {
    if (!semesterStart || !semesterEnd) {
      return new Map<string, ScheduleItem[]>();
    }

    return new Map<string, ScheduleItem[]>(
      calendarDays.map((date) => [
        toDateKey(date),
        isDateInSemester(date, semesterStart, semesterEnd)
          ? getSchedulesForDate(schedules, date, semesterStart)
          : [],
      ])
    );
  }, [calendarDays, schedules, semesterEnd, semesterStart]);

  const selectedSchedules = useMemo(() => {
    if (!semesterStart) return [];
    return getSchedulesForDate(schedules, selectedDate, semesterStart);
  }, [schedules, selectedDate, semesterStart]);

  if (!semesterStart || !semesterEnd) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <Typography variant="body" color="gray">
          Học kỳ chưa có năm học hợp lệ để hiển thị lịch.
        </Typography>
      </div>
    );
  }

  const firstMonth = startOfMonth(semesterStart);
  const lastMonth = startOfMonth(semesterEnd);
  const canGoPrevious = visibleMonth.getTime() > firstMonth.getTime();
  const canGoNext = visibleMonth.getTime() < lastMonth.getTime();

  const selectMonth = (amount: number) => {
    const nextMonth = addMonths(visibleMonth, amount);
    const nextDays = getCalendarDays(nextMonth).filter(
      (date) =>
        isSameMonth(date, nextMonth) &&
        isDateInSemester(date, semesterStart, semesterEnd)
    );
    const firstScheduleDate = nextDays.find(
      (date) => getSchedulesForDate(schedules, date, semesterStart).length > 0
    );

    setVisibleMonth(nextMonth);
    setSelectedDate(firstScheduleDate || nextDays[0] || semesterStart);
  };

  const handleSelectDate = (date: Date) => {
    if (!isDateInSemester(date, semesterStart, semesterEnd)) return;
    setSelectedDate(date);
    if (!isSameMonth(date, visibleMonth)) {
      setVisibleMonth(startOfMonth(date));
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/20">
      <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="p-5 sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-4">
            <button
              type="button"
              aria-label="Tháng trước"
              disabled={!canGoPrevious}
              onClick={() => selectMonth(-1)}
              className="flex size-10 items-center justify-center rounded-full border border-primary-400 text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-900/40"
            >
              <HiOutlineChevronLeft size={20} />
            </button>

            <div className="text-center">
              <Typography
                variant="h2"
                weight="bold"
                className="capitalize text-neutral-950 dark:text-white"
              >
                {monthFormatter.format(visibleMonth)}
              </Typography>
              <Typography
                variant="caption"
                className="mt-1 block text-neutral-400"
              >
                Tuần {getSemesterWeek(selectedDate, semesterStart)} của học kỳ
              </Typography>
            </div>

            <button
              type="button"
              aria-label="Tháng sau"
              disabled={!canGoNext}
              onClick={() => selectMonth(1)}
              className="flex size-10 items-center justify-center rounded-full border border-primary-400 text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-900/40"
            >
              <HiOutlineChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7">
            {weekDayLabels.map((label) => (
              <div
                key={label}
                className="pb-3 text-center text-sm font-bold text-neutral-700 dark:text-neutral-300"
              >
                {label}
              </div>
            ))}

            {calendarDays.map((date) => {
              const dateSchedules =
                schedulesByDate.get(toDateKey(date)) || [];
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentMonth = isSameMonth(date, visibleMonth);
              const isAvailable = isDateInSemester(
                date,
                semesterStart,
                semesterEnd
              );

              return (
                <button
                  type="button"
                  key={toDateKey(date)}
                  disabled={!isAvailable}
                  onClick={() => handleSelectDate(date)}
                  className={`relative flex aspect-square min-h-12 flex-col items-center justify-center rounded-2xl text-sm transition sm:min-h-14 ${
                    isSelected
                      ? "bg-primary-600 font-bold text-white shadow-md shadow-primary-200 dark:bg-primary-500 dark:shadow-none"
                      : isCurrentMonth
                        ? "text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
                        : "text-neutral-400 dark:text-neutral-600"
                  } disabled:cursor-default disabled:opacity-40`}
                >
                  <span>{date.getDate()}</span>
                  {dateSchedules.length > 0 && (
                    <span className="absolute bottom-1.5 flex gap-1">
                      {dateSchedules.slice(0, 3).map((schedule, index) => (
                        <span
                          key={`${schedule.startTime}-${index}`}
                          className="size-1.5 rounded-full bg-primary-300 ring-2 ring-primary-100 dark:bg-primary-200 dark:ring-primary-700"
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="border-t border-neutral-100 bg-primary-50/40 p-5 sm:p-7 lg:border-l lg:border-t-0 dark:border-neutral-800 dark:bg-neutral-900/70">
          <div className="mb-6 text-center">
            <Typography
              variant="h2"
              weight="bold"
              className="text-neutral-950 dark:text-white"
            >
              Thông tin chi tiết
            </Typography>
            <Typography
              variant="caption"
              className="mt-1 block capitalize text-neutral-500 dark:text-neutral-400"
            >
              {selectedDateFormatter.format(selectedDate)}
            </Typography>
          </div>

          {selectedSchedules.length > 0 ? (
            <div className="space-y-4">
              {selectedSchedules.map((schedule, index) => (
                <article
                  key={`${schedule.startTime}-${schedule.room}-${index}`}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-950"
                >
                  <div className="border-r border-neutral-200 pr-4 text-center dark:border-neutral-700">
                    <Typography
                      variant="body"
                      weight="bold"
                      className="text-neutral-900 dark:text-white"
                    >
                      {schedule.startTime}
                    </Typography>
                    <div className="mx-auto my-2 h-7 w-px bg-neutral-200 dark:bg-neutral-700" />
                    <Typography
                      variant="caption"
                      className="text-neutral-600 dark:text-neutral-300"
                    >
                      {schedule.endTime}
                    </Typography>
                  </div>

                  <div className="min-w-0">
                    <Typography
                      variant="h3"
                      weight="bold"
                      className="text-primary-700 dark:text-primary-300"
                    >
                      {schedule.subjectName || "Môn học"}
                    </Typography>

                    <div className="mt-3 space-y-2 text-neutral-600 dark:text-neutral-300">
                      <div className="flex items-center gap-2">
                        <HiOutlineClock className="shrink-0 text-neutral-400" />
                        <Typography variant="body">
                          {schedule.day}, {schedule.startTime} -{" "}
                          {schedule.endTime}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineLocationMarker className="shrink-0 text-neutral-400" />
                        <Typography variant="body">
                          Phòng {schedule.room}
                        </Typography>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Badge variant="secondary">
                        Tuần {getSemesterWeek(selectedDate, semesterStart)}
                      </Badge>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white/70 px-6 text-center dark:border-neutral-700 dark:bg-neutral-950/60">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                <HiOutlineCalendar size={24} />
              </div>
              <Typography
                variant="body"
                weight="semibold"
                className="text-neutral-700 dark:text-neutral-200"
              >
                Không có lịch học trong ngày này
              </Typography>
              <Typography
                variant="caption"
                className="mt-1 text-neutral-400"
              >
                Chọn ngày có chấm vàng để xem chi tiết.
              </Typography>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
