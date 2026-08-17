"use client";

import { HiOutlineChartPie } from "react-icons/hi";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Typography from "@/library/Typography";

/** Dữ liệu tối thiểu cho một điểm trên biểu đồ. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** Bảng màu dùng chung cho các biểu đồ dashboard (anchor theo brand olive). */
export const CHART_COLORS = [
  "#747a56", // brand primary (olive)
  "#10b981", // emerald
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#ec4899", // pink
];

/** Màu trục/lưới đọc tốt trên cả nền sáng và tối. */
export const CHART_AXIS_COLOR = "#94a3b8";

const defaultFormat = (value: number) => value.toLocaleString("vi-VN");

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: ChartDatum;
  }>;
  valueFormatter?: (value: number) => string;
}

/** Tooltip dùng chung, style theo Tailwind để hỗ trợ dark mode. */
export const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter = defaultFormat,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const title = label ?? entry.name ?? entry.payload?.label;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <Typography variant="caption" weight="semibold" color="neutral">
        {title}
      </Typography>
      <div className="mt-0.5">
        <Typography variant="caption" weight="bold" color="primary">
          {valueFormatter(Number(entry.value))}
        </Typography>
      </div>
    </div>
  );
};

const ChartEmpty = ({ description }: { description?: string }) => (
  <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
    <HiOutlineChartPie size={28} />
    <Typography variant="caption" color="gray">
      {description || "Chưa có dữ liệu để hiển thị."}
    </Typography>
  </div>
);

/** Biểu đồ tròn (donut) kèm chú thích danh sách bên phải. */
export const DonutChart = ({
  data,
  emptyText,
}: {
  data: ChartDatum[];
  emptyText?: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length || !total) return <ChartEmpty description={emptyText} />;

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr] sm:items-center">
      <div className="h-56">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 320, height: 224 }}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={56}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2">
        {data.map((item, index) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    background: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <Typography
                  variant="caption"
                  weight="semibold"
                  color="neutral"
                  className="truncate"
                >
                  {item.label}
                </Typography>
              </div>
              <Typography
                variant="caption"
                weight="bold"
                color="gray"
                className="whitespace-nowrap"
              >
                {item.value.toLocaleString("vi-VN")} ({percent}%)
              </Typography>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/** Biểu đồ cột dọc. */
export const BarsChart = ({
  data,
  color = CHART_COLORS[0],
  emptyText,
}: {
  data: ChartDatum[];
  color?: string;
  emptyText?: string;
}) => {
  if (!data.length) return <ChartEmpty description={emptyText} />;

  return (
    <div className="h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height: 288 }}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_AXIS_COLOR}
            strokeOpacity={0.18}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: CHART_AXIS_COLOR, fillOpacity: 0.08 }}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Biểu đồ vùng (area) cho dữ liệu xu hướng theo thời gian. */
export const TrendChart = ({
  data,
  color = CHART_COLORS[3],
  valueFormatter,
  emptyText,
}: {
  data: ChartDatum[];
  color?: string;
  valueFormatter?: (value: number) => string;
  emptyText?: string;
}) => {
  if (!data.length) return <ChartEmpty description={emptyText} />;

  const gradientId = "trend-gradient";

  return (
    <div className="h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height: 288 }}
      >
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_AXIS_COLOR}
            strokeOpacity={0.18}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, "auto"]}
          />
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
