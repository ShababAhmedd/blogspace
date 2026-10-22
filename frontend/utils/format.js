import { API_URL } from "./api";

const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
})();

export const getImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const getFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown author";

export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", options);
};

export const getPreview = (text, length = 160) => {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trimEnd()}…` : clean;
};

export const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : "");
