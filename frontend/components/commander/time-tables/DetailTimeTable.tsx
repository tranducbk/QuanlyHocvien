"use client";

import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import { ScheduleItem, TimeTable } from "@/types/time-tables";
import { formatSemesterYear } from "@/utils/fn-common";

const weekDays = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const getScheduleTime = (schedule: ScheduleItem) =>
  `${schedule.startTime} - ${schedule.endTime}`;

const formatWeeks = (week: ScheduleItem["week"]) => {
  if (Array.isArray(week)) return week.length ? week.join(", ") : "";
  return week ? String(week) : "";
};


interface TimeTableCalendarProps {
  timeTable: TimeTable;
}

export default function TimeTableCalendar({
  timeTable,
}: TimeTableCalendarProps) {
  const schedules = timeTable.schedules || [];
  const studentName =
    timeTable.user?.profile?.fullName ||
    timeTable.user?.username ||
    timeTable.userId;

  const schedulesByDay = weekDays.map((day) => ({
    day,
    schedules: schedules.filter((schedule) => schedule.day === day),
  }));

  return (
    <div className="max-h-[85vh] space-y-6 overflow-y-auto text-neutral-900 dark:text-neutral-100">
      <div className="rounded-3xl border border-primary-100 p-5 shadow-sm dark:border-primary-700/50 dark:from-primary-950/70 dark:via-neutral-900 dark:to-secondary-950/60 dark:shadow-primary-950/20">
        <Typography
          variant="label"
          color="primary"
          tracking="wide"
          transform="uppercase"
        >
          Lịch học cá nhân
        </Typography>
        <Typography
          variant="h3"
          className="mt-2 text-neutral-950 dark:text-white"
        >
          {studentName}
        </Typography>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge
            variant="primary"
            className="dark:border-primary-700 dark:bg-primary-500/20 dark:text-primary-100"
          >
            {schedules.length} buổi học
          </Badge>
          <Badge
            variant="secondary"
            className="dark:border-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-100"
          >
            {formatSemesterYear(
              timeTable.semester?.code,
              timeTable.semester?.schoolYearInfo?.schoolYear
            )}
          </Badge>
          {timeTable.rooms?.map((room) => (
            <Badge
              key={room}
              variant="secondary"
              className="dark:border-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-100"
            >
              Phòng {room}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-6">
        {schedulesByDay.map(({ day, schedules: daySchedules }) => (
          <div
            key={day}
            className="min-h-44 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors dark:border-neutral-700/80 dark:bg-neutral-900 dark:shadow-black/20"
          >
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-700/80">
              <Typography
                variant="body"
                weight="bold"
                className="text-neutral-900 dark:text-neutral-100"
              >
                {day}
              </Typography>
              <Badge
                variant={daySchedules.length ? "success" : "secondary"}
                className={
                  daySchedules.length
                    ? "dark:border-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100"
                    : "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                }
              >
                {daySchedules.length} ca
              </Badge>
            </div>

            {daySchedules.length ? (
              <div className="space-y-3">
                {daySchedules.map((schedule, index) => (
                  <div
                    key={`${schedule.day}-${schedule.startTime}-${schedule.room}-${index}`}
                    className="rounded-2xl border border-primary-100 bg-primary-50/70 p-3 shadow-sm dark:border-primary-700/50 dark:bg-primary-950/50 dark:shadow-black/10"
                  >
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-primary-700 dark:text-primary-100"
                    >
                      {getScheduleTime(schedule)}
                    </Typography>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {schedule.subjectName && (
                        <Badge
                          variant="primary"
                          className="dark:border-primary-700 dark:bg-primary-500/20 dark:text-primary-100"
                        >
                          {schedule.subjectName}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="dark:border-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-100"
                      >
                        Phòng {schedule.room}
                      </Badge>
                      {formatWeeks(schedule.week) && (
                        <Badge
                          variant="secondary"
                          className="dark:border-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-100"
                        >
                          Tuần {formatWeeks(schedule.week)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-800/70">
                <Typography
                  variant="caption"
                  className="text-neutral-500 dark:text-neutral-300"
                >
                  Không có lịch học
                </Typography>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
