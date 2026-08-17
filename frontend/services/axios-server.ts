import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { AUTH_ROUTES } from "@/constants/constants";
import { isTokenExpired } from "@/utils/fn-common";
import { ENDPOINTS } from "@/constants/endpoints";
import { LoginResponse } from "@/types/auth";

const apiServer = axios.create({
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

  return data.accessToken;
};

apiServer.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isAuthRoute = AUTH_ROUTES.some((route) =>
      config.url?.includes(route)
    );

    if (isAuthRoute) return config;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    }

    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken && !isTokenExpired(refreshToken)) {
      const newToken = await refreshAccessToken(refreshToken);
      config.headers.Authorization = `Bearer ${newToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiServer.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse>) =>
    Promise.reject(error.response?.data || error)
);

export default apiServer;
