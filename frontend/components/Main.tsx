"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  m,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "motion/react";
import {
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiAward,
  FiBell,
  FiLayers,
  FiCheckCircle,
  FiBarChart2,
  FiArrowRight,
  FiLogIn,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiZap,
  FiClock,
} from "react-icons/fi";
import Button from "@/library/Button";

/* ----------------------------- Animation presets ---------------------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* --------------------------------- Content ---------------------------------- */

const navLinks = [
  { label: "Tính năng", href: "#features" },
  { label: "Giới thiệu", href: "#about" },
  { label: "Liên hệ", href: "/contact" },
];

const features = [
  {
    icon: FiUsers,
    title: "Quản lý tài khoản",
    description:
      "Tạo, phân quyền và quản lý tài khoản học viên, chỉ huy và quản trị viên theo từng đơn vị.",
  },
  {
    icon: FiCreditCard,
    title: "Quản lý học phí",
    description:
      "Nhập, theo dõi và xuất báo cáo học phí theo từng học kỳ với thống kê trực quan.",
  },
  {
    icon: FiCalendar,
    title: "Thời khóa biểu & Lịch",
    description:
      "Xây dựng thời khóa biểu, lịch trực và lịch ăn cho từng lớp và học viên.",
  },
  {
    icon: FiBarChart2,
    title: "Kết quả học tập",
    description:
      "Theo dõi điểm số, kết quả đào tạo và tiến độ rèn luyện của từng học viên.",
  },
  {
    icon: FiAward,
    title: "Thành tích & Khen thưởng",
    description:
      "Ghi nhận và quản lý thành tích, khen thưởng trong suốt quá trình học tập, rèn luyện.",
  },
  {
    icon: FiBell,
    title: "Thông báo tức thời",
    description:
      "Gửi và nhận thông báo theo thời gian thực giữa nhà trường, chỉ huy và học viên.",
  },
  {
    icon: FiLayers,
    title: "Đơn vị, lớp & học kỳ",
    description:
      "Tổ chức cơ cấu đơn vị, lớp học và quản lý các học kỳ một cách linh hoạt.",
  },
  {
    icon: FiCheckCircle,
    title: "Phê duyệt & Báo cáo",
    description:
      "Phê duyệt yêu cầu và xem báo cáo thống kê tổng quan ngay trên bảng điều khiển.",
  },
];

const stats = [
  { value: "10+", label: "Phân hệ nghiệp vụ" },
  { value: "3", label: "Vai trò người dùng" },
  { value: "100%", label: "Số hóa quy trình" },
  { value: "24/7", label: "Truy cập mọi lúc" },
];

const highlights = [
  {
    icon: FiShield,
    title: "Bảo mật & Phân quyền",
    description:
      "Kiểm soát truy cập chặt chẽ theo vai trò: học viên, chỉ huy và quản trị viên.",
  },
  {
    icon: FiZap,
    title: "Vận hành nhanh chóng",
    description:
      "Giao diện hiện đại, thao tác mượt mà giúp tối ưu hóa toàn bộ quy trình hành chính.",
  },
  {
    icon: FiClock,
    title: "Cập nhật thời gian thực",
    description:
      "Dữ liệu học tập, lịch trình và thông báo luôn được đồng bộ tức thời.",
  },
];

/* ---------------------------------- Page ------------------------------------ */

export default function Main() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <div className="relative isolate min-h-screen text-neutral-100">
      {/* Fixed, non-scrolling page background shared by every section */}
      <div className="fixed inset-0 -z-10 bg-[url('/img.png')] bg-cover bg-center" />
      <div className="fixed inset-0 -z-10 bg-linear-to-b from-neutral-900/85 via-primary-900/75 to-neutral-900/90" />

      {/* ------------------------------- Navbar ------------------------------- */}
      <m.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "bg-neutral-950/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              priority
              style={{ height: "auto" }}
            />
            <span className="hidden sm:block text-sm font-bold uppercase tracking-wide text-white">
              Học viện Khoa học Quân sự
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button size="md" variant="primary" icon={FiLogIn}>
                Đăng nhập
              </Button>
            </Link>
          </div>
        </nav>
      </m.header>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden">
        {/* Extra tint so the headline stays legible over the fixed background */}
        <div className="absolute inset-0 bg-neutral-900/25" />

        {/* Floating blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-32 -left-32 size-96 rounded-full bg-primary-500/30 blur-3xl"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 3.5,
              delay: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute -bottom-24 -right-24 size-80 rounded-full bg-secondary-400/30 blur-3xl"
          />
        </div>

        <m.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto w-full max-w-7xl px-4 py-32 text-center sm:px-6"
        >
          <m.div variants={fadeUp} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <FiShield size={14} />
              Học viện Khoa học Quân sự — HVKHQS
            </span>
          </m.div>

          <m.h1
            variants={fadeUp}
            className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Nền tảng Quản lý Học viên
            <span className="mt-2 block bg-linear-to-r from-primary-200 via-secondary-200 to-white bg-clip-text text-transparent">
              Thông minh
            </span>
          </m.h1>

          <m.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
          >
            Giải pháp công nghệ tiên tiến cho việc quản lý sinh viên toàn diện tại
            Học viện Khoa học Quân sự. Tối ưu hóa quy trình hành chính, nâng cao
            chất lượng đào tạo và trải nghiệm học tập.
          </m.p>

          <m.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/login">
              <Button size="lg" variant="primary" icon={FiArrowRight} iconPlacement="right">
                Bắt đầu ngay
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="ghost"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                Khám phá tính năng
              </Button>
            </a>
          </m.div>
        </m.div>

        {/* Scroll hint */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 1.8, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
            <div className="size-1.5 rounded-full bg-white/70" />
          </div>
        </m.div>
      </section>

      {/* -------------------------------- Stats ------------------------------- */}
      <section className="border-y border-white/10 bg-neutral-900/30 backdrop-blur-sm">
        <m.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <m.div
              key={stat.label}
              variants={fadeUp}
              className="text-center sm:border-r sm:border-white/10 sm:last:border-r-0 lg:[&:nth-child(2)]:border-r"
            >
              <p className="text-3xl font-black text-primary-300 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">
                {stat.label}
              </p>
            </m.div>
          ))}
        </m.div>
      </section>

      {/* ------------------------------ Features ------------------------------ */}
      <section id="features" className="relative isolate scroll-mt-20 overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-144 -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-300">
              Tính năng nổi bật
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Tất cả nghiệp vụ trong một nền tảng
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              Quản lý toàn diện từ tài khoản, học phí, lịch học đến kết quả đào tạo
              và thông báo — tất cả trong một hệ thống thống nhất.
            </p>
          </m.div>

          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map(({ icon: Icon, title, description }) => (
              <m.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-primary-400/40 hover:bg-white/8"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-300 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/65">
                  {description}
                </p>
              </m.div>
            ))}
          </m.div>
        </div>
      </section>

      {/* ------------------------------- About -------------------------------- */}
      <section
        id="about"
        className="relative isolate scroll-mt-20 overflow-hidden border-y border-white/10 bg-neutral-900/30 py-20 backdrop-blur-sm sm:py-28"
      >
        <div className="pointer-events-none absolute -bottom-24 -right-24 -z-10 size-144 rounded-full bg-secondary-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <m.p variants={fadeUp} className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-300">
              Giới thiệu
            </m.p>
            <m.h2 variants={fadeUp} className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Hiện đại hóa công tác quản lý đào tạo
            </m.h2>
            <m.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-white/70">
              Hệ thống được xây dựng dành riêng cho Học viện Khoa học Quân sự,
              kết nối học viên, chỉ huy và quản trị viên trên cùng một nền tảng.
              Mọi quy trình hành chính, học tập và rèn luyện được số hóa, minh
              bạch và truy cập dễ dàng.
            </m.p>

            <m.div variants={fadeUp} className="mt-8">
              <Link href="/login">
                <Button size="lg" variant="primary" icon={FiArrowRight} iconPlacement="right">
                  Đăng nhập hệ thống
                </Button>
              </Link>
            </m.div>
          </m.div>

          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4"
          >
            {highlights.map(({ icon: Icon, title, description }) => (
              <m.div
                key={title}
                variants={fadeUp}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-primary-400/40"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-300">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">
                    {description}
                  </p>
                </div>
              </m.div>
            ))}
          </m.div>
        </div>
      </section>

      {/* --------------------------------- CTA -------------------------------- */}
      <section className="py-20 sm:py-28">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mx-auto max-w-5xl px-4 sm:px-6"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/8 px-6 py-14 text-center shadow-xl backdrop-blur-md sm:px-12">
            <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-primary-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-secondary-400/20 blur-3xl" />
            <h2 className="relative text-3xl font-black text-white sm:text-4xl">
              Sẵn sàng trải nghiệm hệ thống?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/80">
              Đăng nhập để bắt đầu quản lý học viên, học phí, lịch học và nhiều hơn
              nữa ngay hôm nay.
            </p>
            <div className="relative mt-8 flex justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="ghost"
                  icon={FiLogIn}
                  className="border-white bg-white text-primary-700 hover:bg-white/90"
                >
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          </div>
        </m.div>
      </section>

      {/* -------------------------------- Footer ------------------------------ */}
      <footer className="border-t border-white/10 bg-neutral-900/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ height: "auto" }} />
                <span className="text-sm font-bold uppercase tracking-wide text-white">
                  Học viện Khoa học Quân sự
                </span>
              </div>
              <p className="mt-3 block max-w-md text-xs leading-relaxed text-white/65">
                Nền tảng quản lý học viên thông minh — số hóa toàn diện công tác
                đào tạo, hành chính và rèn luyện.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                Liên kết
              </p>
              <ul className="mt-4 space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-primary-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-white/70 transition-colors hover:text-primary-300"
                  >
                    Đăng nhập
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                Liên hệ
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <FiMail size={15} className="shrink-0 text-primary-300" />
                  cntt@hvkhqs.edu.vn
                </li>
                <li className="flex items-center gap-2">
                  <FiPhone size={15} className="shrink-0 text-primary-300" />
                  (024) 1234-5678
                </li>
                <li className="flex items-center gap-2">
                  <FiMapPin size={15} className="shrink-0 text-primary-300" />
                  Phòng 101, Tầng 1, Tòa nhà A
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/50">
              © 2026 Hệ thống Quản lý Học viên — Học viện Khoa học Quân sự
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
