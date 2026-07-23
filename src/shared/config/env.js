const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5030/api";

export const env = Object.freeze({
  apiBaseUrl: rawApiBaseUrl.replace(/\/+$/, ""),
  appName: import.meta.env.VITE_APP_NAME || "حياة دوائية",
  isDevelopment: import.meta.env.DEV,
});

export const apiOrigin = new URL(env.apiBaseUrl).origin;
