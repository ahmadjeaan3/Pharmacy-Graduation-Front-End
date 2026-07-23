import { apiClient } from "../../../shared/api/client";

const compact = (values = {}) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const notificationKeys = {
  root: ["notifications"],
  list: (params = {}) => ["notifications", "list", params],
  summary: ["notifications", "summary"],
  unreadCount: ["notifications", "unread-count"],
};

export const getMyNotifications = async (params = {}) =>
  (await apiClient.get("/Notifications/me", { params: compact(params) })).data;
export const getNotificationSummary = async () =>
  (await apiClient.get("/Notifications/me/summary")).data;
export const getUnreadNotificationCount = async () =>
  (await apiClient.get("/Notifications/me/unread-count")).data;
export const markNotificationAsRead = async (id) =>
  (await apiClient.post(`/Notifications/${id}/read`)).data;
export const markAllNotificationsAsRead = async () =>
  (await apiClient.post("/Notifications/me/read-all")).data;
