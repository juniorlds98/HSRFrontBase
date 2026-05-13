import axios from "axios";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
} from "../features/auth/authStorage";
import { refreshAccessToken } from "./keycloakAuthService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          originalRequest._retry = true;
          const session = await refreshAccessToken(refreshToken);
          saveAuthSession(session);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          clearAuthStorage();
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }
    }

    if (error?.response?.status === 401) {
      clearAuthStorage();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
