// src/services/api.js
import axios from "axios";

// ── Base URL Configuration ────────────────────────────────────────────────
// Agar environment variable nahi milega, toh automatic live Render backend par hit karega
const BASE_URL = import.meta.env.VITE_API_URL || "https://shieldher-backend-8bl2.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Render free tier ke cold start ko handle karne ke liye 30s diya hai
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing     = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = data.data;
        localStorage.setItem("accessToken",  accessToken);
        localStorage.setItem("refreshToken", newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────
export const authAPI = {
  register:   (data) => api.post("/auth/register",      data),
  verifyOtp:  (data) => api.post("/auth/verify-otp",    data),
  resendOtp:  (data) => api.post("/auth/resend-otp",    data),
  login:      (data) => api.post("/auth/login",         data),
  refresh:    (data) => api.post("/auth/refresh-token", data),
  logout:     ()     => api.post("/auth/logout"),
};

export default api;