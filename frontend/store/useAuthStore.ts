import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/auth";
import Cookies from "js-cookie";
import { getTokenExpiration, isTokenExpired } from "@/utils/fn-common";
import { JWT_CONFIG } from "@/constants/constants";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (data) => {
        const expiryDate = getTokenExpiration(data.refreshToken);

        Cookies.set("refreshToken", data.refreshToken, {
          expires: expiryDate || JWT_CONFIG.DEFAULT_EXPIRED_DATE,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        Cookies.set("accessToken", data.accessToken, {
          expires: expiryDate || JWT_CONFIG.DEFAULT_EXPIRED_DATE,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        Cookies.set("role", data.user.role, {
          expires: expiryDate || JWT_CONFIG.DEFAULT_EXPIRED_DATE,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        Cookies.remove("refreshToken");
        Cookies.remove("accessToken");
        Cookies.remove("role");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login?session_expired=1";
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.refreshToken && isTokenExpired(state.refreshToken)) {
          state.logout();
        }
      },
    }
  )
);
