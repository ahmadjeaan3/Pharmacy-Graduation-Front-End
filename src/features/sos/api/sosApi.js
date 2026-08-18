import { apiClient } from "../../../shared/api/client";

export const sosKeys = {
  mine: ["sos", "mine"],
  nearby: ["sos", "nearby"],
  admin: ["sos", "admin"],
};
export const createSosAlert = async (payload) =>
  (await apiClient.post("/sos", payload)).data;
export const getMySosAlerts = async () => (await apiClient.get("/sos/me")).data;
export const getNearbySosAlerts = async (status = "") =>
  (await apiClient.get("/sos/nearby", { params: status ? { status } : {} }))
    .data;
export const getAdminSosAlerts = async (status = "") =>
  (await apiClient.get("/sos/admin", { params: status ? { status } : {} }))
    .data;
export const updateSosAlert = async (id, payload) =>
  (await apiClient.put(`/sos/${id}/status`, payload)).data;
