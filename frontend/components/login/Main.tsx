"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { loginSchema, LoginFormValues } from "@/utils/validations";
import { ROLES } from "@/constants/constants";
import Link from "next/link";
import { m } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { useLoadingStore } from "@/store/useLoadingStore";
import AnimatedContainer from "@/library/AnimatedContainer";
import Divide from "@/library/Divide";
import Typography from "@/library/Typography";
import { LoginRequest } from "@/types/auth";

export default function Main() {
  const [showPassword, setShowPassword] = useState(false);
  const { replace } = useRouter();
  const { setAuth } = useAuthStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("session_expired") === "1") {
        addToast({
          message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          variant: "warning",
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [addToast]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => {
      showLoading();
      return authService.login(data);
    },
    onSuccess: (response) => {
      if (!response.data) return;
      setAuth({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      hideLoading();
      addToast({ message: "Đăng nhập thành công!", variant: "success" });

      const userRole = response.data.user.role;
      if (userRole === ROLES.COMMANDER.ROLE) {
        replace("/commander");
      } else if (userRole === ROLES.ADMIN.ROLE) {
        replace("/admin");
      } else {
        replace("/student");
      }
    },

    onError: (error: ApiResponse) => {
      hideLoading();
      addToast({
        message: error.message || "Đăng nhập thất bại. Vui lòng thử lại!",
        variant: "error",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

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

      {/* Login card */}
      <AnimatedContainer
        variant="slideUp"
        className="w-full max-w-md bg-white/80 dark:bg-neutral-950/85 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/40 p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 transition-colors"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
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
            Quản lý Học viên
          </Typography>
          <Typography variant="body" color="neutral" className="mt-1">
            Chào mừng bạn đến với hệ thống quản lý học viên - HVKHQS
          </Typography>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            id="login-username"
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            size="lg"
            floatingLabel={false}
            prefixIcon={<FiUser size={18} />}
            isLoading={loginMutation.isPending}
            error={errors.username?.message}
            {...register("username")}
            required={true}
          />

          <Input
            id="login-password"
            label="Mật khẩu"
            floatingLabel={false}
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            size="lg"
            isLoading={loginMutation.isPending}
            prefixIcon={<FiLock size={18} />}
            suffixIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
            required={true}
          />

          {/* Remember & Forgot */}
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Typography variant="caption" weight="semibold">
                Quên mật khẩu?
              </Typography>
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            fullWidth
            isLoading={loginMutation.isPending}
            disabled={!isDirty}
            id="login-submit"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="mt-4 flex items-baseline justify-center gap-1.5">
          <Typography variant="caption" color="neutral">
            Bạn chưa có tài khoản?
          </Typography>
          <Link
            href="/contact"
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Typography variant="caption" weight="bold">
              Liên hệ với quản trị viên
            </Typography>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center pt-2">
          <Divide className="mb-4" faded={true} />
          <Typography variant="caption" color="neutral" className="opacity-70">
            © 2026 Hệ thống Quản lý Học viên
          </Typography>
        </div>
      </AnimatedContainer>
    </div>
  );
}
