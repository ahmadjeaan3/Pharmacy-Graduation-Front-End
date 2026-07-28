import axios from "axios";
import { getAccessToken } from "../auth/session";
import { env } from "../config/env";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const authenticationChallenge =
      error.response?.headers?.["www-authenticate"] || "";
    const tokenWasRejected =
      /invalid_token|token.*expired|signature/i.test(authenticationChallenge);
    const sessionIsMissing = !getAccessToken();

    // Do not destroy a valid local session for an application-level 401.
    // Only authentication middleware challenges (or a locally missing/
    // expired session) should send the user back to the login page.
    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      (tokenWasRejected || sessionIsMissing)
    ) {
      window.dispatchEvent(new Event("pharmacy:unauthorized"));
    }
    return Promise.reject(error);
  },
);
