"use client";
import Image from "next/image";
import Link from "next/link";
import { m } from "motion/react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import Button from "@/library/Button";
import AnimatedContainer from "@/library/AnimatedContainer";
import Divide from "@/library/Divide";
import Typography from "@/library/Typography";

const SUPPORT_EMAIL = "cntt@hvkhqs.edu.vn";

const contactInfo = [
  { icon: FiMail, label: "Email", value: SUPPORT_EMAIL },
  { icon: FiPhone, label: "Điện thoại", value: "(024) 1234-5678" },
  { icon: FiMapPin, label: "Địa chỉ", value: "Phòng 101, Tầng 1, Tòa nhà A" },
  { icon: FiClock, label: "Giờ làm việc", value: "8:00 - 17:00 (Thứ 2 - Thứ 6)" },
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

      {/* Forgot password card */}
      <AnimatedContainer
        variant="slideUp"
        className="w-full max-w-md bg-white/80 dark:bg-neutral-950/85 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/40 p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 transition-colors"
      >
        {/* Header */}
        <div className="text-center mb-4">
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
            Quên mật khẩu
          </Typography>
          <Typography variant="body" color="neutral" className="mt-1">
            Vui lòng liên hệ với phòng CNTT của HVKHQS để được cấp lại mật khẩu
          </Typography>
        </div>

        {/* Contact info */}
        <div className="rounded-xl border border-primary-100 dark:border-neutral-800 bg-primary-50/60 dark:bg-neutral-900/60 p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center size-10 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400">
              <FiMail size={18} />
            </span>
            <div>
              <Typography variant="h4" color="neutral" weight="bold">
                Thông tin liên hệ
              </Typography>
              <Typography variant="caption" color="primary" weight="semibold">
                Phòng CNTT - HVKHQS
              </Typography>
            </div>
          </div>

          <ul className="space-y-2.5">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className="shrink-0 text-primary-600 dark:text-primary-400"
                />
                <Typography variant="caption" color="neutral">
                  <span className="font-semibold">{label}:</span> {value}
                </Typography>
              </li>
            ))}
          </ul>
        </div>

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
                Khi liên hệ, vui lòng cung cấp thông tin: Họ tên, Mã học viên,
                Email đăng ký để được hỗ trợ nhanh chóng.
              </Typography>
            </div>
          </div>
        </div>

        {/* CTA */}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-6 block">
          <Button
            type="button"
            size="lg"
            variant="primary"
            fullWidth
            icon={FiMail}
          >
            Liên hệ ngay với phòng CNTT
          </Button>
        </a>

        {/* Back to login */}
        <div className="mt-4 flex items-center justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <FiArrowLeft size={16} />
            <Typography variant="caption" weight="semibold">
              Quay lại đăng nhập
            </Typography>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-2 text-center pt-2">
          <Divide faded={true} />
          <Typography variant="caption" color="neutral" className="opacity-70">
            © 2026 Hệ thống Quản lý Học viên
          </Typography>
        </div>
      </AnimatedContainer>
    </div>
  );
}
