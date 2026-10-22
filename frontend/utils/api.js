import axios from "axios";
import { getToken, removeToken } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const AUTH_EXPIRED_EVENT = "blogspace:auth-expired";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const hadToken = Boolean(error.config?.headers?.Authorization);

    // token expired/invalid, or the account was deactivated: end the session
    if (hadToken && (status === 401 || message.includes("deactivated"))) {
      removeToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { message } }));
      }
    }
    return Promise.reject(error);
  },
);

// turns any API/axios error into a message that is safe to show to users
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error?.response) {
    const message = error.response.data?.message;
    if (typeof message === "string" && message.trim()) {
      const text = message.trim();
      const sentence = text.charAt(0).toUpperCase() + text.slice(1);
      return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
    }
    if (error.response.status >= 500) return "The server ran into a problem. Please try again later.";
    return fallback;
  }
  if (error?.request) return "Unable to reach the server. Please check your connection.";
  return fallback;
};

export default api;
