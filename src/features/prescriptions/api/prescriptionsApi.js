import { apiClient } from "../../../shared/api/client";

export const prescriptionKeys = {
  mine: ["prescriptions", "mine"],
  detail: (id) => ["prescriptions", id],
  pharmacy: ["prescriptions", "pharmacy"],
};
export async function analyzePrescription(file) {
  const body = new FormData();
  body.append("file", file);
  return (
    await apiClient.post("/prescriptions/analyze", body, {
      timeout: 120_000,
    })
  ).data;
}
export const getMyPrescriptions = async () =>
  (await apiClient.get("/prescriptions/mine")).data;
export const getPrescription = async (id) =>
  (await apiClient.get(`/prescriptions/${id}`)).data;
export const reservePrescription = async (id, pharmacyId) =>
  (await apiClient.post(`/prescriptions/${id}/reserve`, { pharmacyId })).data;
export const cancelPrescription = async (id) =>
  (await apiClient.post(`/prescriptions/${id}/cancel`)).data;
export const activatePrescriptionReminders = async (id, payload) =>
  (await apiClient.post(`/prescriptions/${id}/reminders`, payload)).data;
export const getPharmacyPrescriptionOrders = async () =>
  (await apiClient.get("/prescriptions/pharmacy/orders")).data;
export const updatePrescriptionStatus = async (id, payload) =>
  (await apiClient.post(`/prescriptions/pharmacy/orders/${id}/status`, payload))
    .data;
