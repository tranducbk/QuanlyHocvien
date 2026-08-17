import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { ENDPOINTS } from "@/constants/endpoints";
import { LoginResponse } from "@/types/auth";
import { isTokenExpired } from "@/utils/fn-common";
import { AUTH_ROUTES } from "@/constants/constants";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const res = await axios.post<ApiResponse<LoginResponse>>(
    `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const data = res.data.data;
  if (!data) throw new Error("Refresh failed");

  useAuthStore.getState().setAuth({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data.accessToken;
};

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isAuthRoute = AUTH_ROUTES.some((route) =>
      config.url?.includes(route)
    );

    if (isAuthRoute) return config;

    const { accessToken, refreshToken, logout } = useAuthStore.getState();

    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    }

    if (!refreshToken || isTokenExpired(refreshToken)) {
      logout();
      return Promise.reject(new Error("No refresh token"));
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken).finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${newToken}`;
    } catch (error) {
      logout();
      return Promise.reject(error);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse>) =>
    Promise.reject(error.response?.data || error)
);

export default apiClient;
