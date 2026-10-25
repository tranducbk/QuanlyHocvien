import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { HiOutlineExternalLink } from "react-icons/hi";
import Typography from "@/library/Typography";

export type DashboardTone = "primary" | "success" | "warning" | "error" | "sky" | "neutral";

const toneStyles: Record<DashboardTone, string> = {
  primary: "border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-700/60 dark:bg-primary-950/40 dark:text-primary-100",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100",
  error: "border-error-100 bg-error-50 text-error-700 dark:border-error-700/60 dark:bg-error-950/40 dark:text-error-100",
  sky: "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-100",
  neutral: "border-neutral-100 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
};

export function StatCard({ label, value, helper, href, icon: Icon, tone }: {
  label: string;
  value: string;
  helper: string;
  href: string;
  icon: IconType;
  tone: DashboardTone;
}) {
  return (
    <Link href={href} className={`group block rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Typography variant="label" weight="bold" className="opacity-80">{label}</Typography>
          <div className="mt-3 text-3xl font-black leading-none">{value}</div>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-current shadow-sm dark:bg-neutral-950/40">
          <Icon size={20} />
        </div>
      </div>
      <Typography variant="caption" className="mt-3 block opacity-75">{helper}</Typography>
    </Link>
  );
}

export function Panel({ title, href, actionLabel, children }: {
  title: string;
  href?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Typography variant="h3" weight="bold">{title}</Typography>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-primary-700 dark:hover:text-primary-300">
            {actionLabel || "Xem thêm"}
            <HiOutlineExternalLink size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function EmptyLine({ icon: Icon, title, description }: {
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-neutral-200 p-5 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <Icon size={22} className="mt-0.5 shrink-0" />
      <div>
        <Typography variant="body" weight="semibold" color="neutral">{title}</Typography>
        <Typography variant="caption" color="gray" className="mt-1 block">{description}</Typography>
      </div>
    </div>
  );
}
