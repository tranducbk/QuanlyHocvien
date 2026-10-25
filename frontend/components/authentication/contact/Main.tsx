"use client";
import Image from "next/image";
import Link from "next/link";
import { m } from "motion/react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import Button from "@/library/Button";
import AnimatedContainer from "@/library/AnimatedContainer";
import Divide from "@/library/Divide";
import Typography from "@/library/Typography";

const channels = [
  {
    icon: FiUser,
    title: "Liên hệ trực tiếp",
    description: "Gặp trực tiếp chỉ huy tại phòng làm việc trong giờ hành chính.",
    accent: "text-primary-600 dark:text-primary-400",
    badge: "bg-primary-100 dark:bg-primary-500/20",
  },
  {
    icon: FiPhone,
    title: "Liên hệ gián tiếp",
    description: "Gọi điện thoại, nhắn tin hoặc gửi email theo thông tin bên dưới.",
    accent: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 dark:bg-emerald-500/20",
  },
];

const commanders = [
  {
    name: "Bùi Đình Thế",
    role: "Hệ Trưởng",
    phone: "0123456789",
    email: "buidinhthe@gmail.com",
  },
  {
    name: "Đặng Quốc Hưng",
    role: "Chính Trị Viên",
    phone: "0112233445",
    email: "dangquochung@gmail.com",
  },
  {
    name: "Phạm Hữu Khôi",
    role: "Phó Hệ Trưởng",
    phone: "0111122222",
    email: "phamhuukhoi@gmail.com",
  },
];

export default function Main() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/img.png')] p-4 relative overflow-hidden bg-cover bg-center">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-40 -left-40 size-96 bg-primary-500/30 rounded-full blur-3xl"
        />
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 3,
            delay: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -bottom-32 -right-32 size-80 bg-secondary-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Contact card */}
      <AnimatedContainer
        variant="slideUp"
        className="w-full max-w-2xl bg-white/80 dark:bg-neutral-950/85 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/40 p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 transition-colors"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={70}
              height={70}
              priority
              style={{ height: "auto" }}
            />
          </div>
          <Typography variant="h1" color="neutral" weight="bold">
            Liên hệ
          </Typography>
          <Typography variant="body" color="neutral" className="mt-1">
            Thông tin liên hệ với các chỉ huy hệ học viên
          </Typography>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {channels.map(({ icon: Icon, title, description, accent, badge }) => (
            <div
              key={title}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`inline-flex items-center justify-center size-9 rounded-full ${badge} ${accent}`}
                >
                  <Icon size={16} />
                </span>
                <Typography variant="h4" color="neutral" weight="bold">
                  {title}
                </Typography>
              </div>
              <Typography variant="caption" color="neutral" weight="normal">
                {description}
              </Typography>
            </div>
          ))}
        </div>

        {/* Commanders list */}
        <ul className="mt-4 space-y-3">
          {commanders.map(({ name, role, phone, email }) => (
            <li
              key={email}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center size-10 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 shrink-0">
                  <FiUser size={18} />
                </span>
                <div>
                  <Typography variant="h4" color="neutral" weight="bold">
                    {name}
                  </Typography>
                  <Typography variant="caption" color="neutral" weight="normal">
                    {role}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-5 pl-13 sm:pl-0">
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
                >
                  <FiPhone size={15} className="shrink-0" />
                  <Typography variant="caption" weight="semibold">
                    {phone}
                  </Typography>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity"
                >
                  <FiMail size={15} className="shrink-0" />
                  <Typography variant="caption" weight="semibold">
                    {email}
                  </Typography>
                </a>
              </div>
            </li>
          ))}
        </ul>

        {/* Important note */}
        <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <FiAlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <div>
              <Typography variant="caption" color="warning" weight="bold">
                Lưu ý quan trọng
              </Typography>
              <Typography
                variant="caption"
                color="warning"
                weight="normal"
                className="mt-0.5 block opacity-90"
              >
                Không nên gọi điện hoặc gặp trực tiếp vào giờ ngủ trưa, ngủ tối,
                không phải giờ làm việc nếu không phải công việc cấp bách, quan
                trọng!
              </Typography>
            </div>
          </div>
        </div>

        {/* Back to login */}
        <Link href="/login" className="mt-6 block">
          <Button type="button" size="lg" variant="primary" fullWidth icon={FiArrowLeft}>
            Quay lại đăng nhập
          </Button>
        </Link>

        {/* Footer */}
        <div className="mt-4 text-center pt-2">
          <Divide faded={true} className="mb-4" />
          <Typography variant="caption" color="neutral" className="opacity-70">
            © 2026 Hệ thống Quản lý Học viên
          </Typography>
        </div>
      </AnimatedContainer>
    </div>
  );
}
