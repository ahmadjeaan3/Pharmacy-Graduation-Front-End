import { apiClient } from "../../../shared/api/client";

export const userKeys = {
  root: ["user"],
  profile: ["user", "profile"],
  medicalProfile: ["user", "medical-profile"],
  healthCard: ["user", "health-card"],
  dashboard: (params = {}) => ["user", "dashboard", params],
  locationContext: (params = {}) => ["user", "location-context", params],
  nearestPharmacyRoute: (params = {}) => [
    "user",
    "nearest-pharmacy-route",
    params,
  ],
  nearestPharmacies: (params = {}) => ["user", "nearest-pharmacies", params],
  pharmacy: (pharmacyId, params = {}) => [
    "user",
    "pharmacy",
    pharmacyId,
    params,
  ],
  medicineRequests: (params = {}) => ["user", "medicine-requests", params],
  medicineRequest: (requestId) => ["user", "medicine-request", requestId],
  searchHistory: (take = 20) => ["user", "search-history", take],
};

const compactParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export async function getUserProfile() {
  return (await apiClient.get("/Users/me")).data;
}
export async function getMedicalProfile() {
  return (await apiClient.get("/Users/me/medical-profile")).data;
}
export async function updateMedicalProfile(payload) {
  return (await apiClient.put("/Users/me/medical-profile", payload)).data;
}
export async function getHealthCard() {
  return (await apiClient.get("/Users/me/health-card")).data;
}
export async function getUserDashboard(params = {}) {
  return (
    await apiClient.get("/Users/me/dashboard", {
      params: compactParams(params),
    })
  ).data;
}
export async function updateUserLocation(payload) {
  return (await apiClient.put("/Users/me/location", payload)).data;
}
export async function getLocationContext(params = {}) {
  return (
    await apiClient.get("/Users/me/location-context", {
      params: compactParams(params),
    })
  ).data;
}
export async function getNearestPharmacyRoute(params = {}) {
  return (
    await apiClient.get("/Users/me/nearest-pharmacy-route", {
      params: compactParams(params),
    })
  ).data;
}
export async function searchMedicines(payload) {
  return (await apiClient.post("/Users/me/search-medicines", payload)).data;
}
export async function getNearestPharmacies(params = {}) {
  return (
    await apiClient.get("/Users/me/nearest-pharmacies", {
      params: compactParams(params),
    })
  ).data;
}
export async function getPharmacyDetails(pharmacyId, params = {}) {
  return (
    await apiClient.get(`/Users/me/pharmacies/${pharmacyId}`, {
      params: compactParams(params),
    })
  ).data;
}
export async function createMedicineRequest(pharmacyId, payload) {
  return (
    await apiClient.post(
      `/Users/me/pharmacies/${pharmacyId}/medicine-requests`,
      payload,
    )
  ).data;
}
export async function getMedicineRequests(params = {}) {
  return (
    await apiClient.get("/Users/me/medicine-requests", {
      params: compactParams(params),
    })
  ).data;
}
export async function getMedicineRequest(requestId) {
  return (await apiClient.get(`/Users/me/medicine-requests/${requestId}`)).data;
}
export async function cancelMedicineRequest(requestId) {
  return (
    await apiClient.post(`/Users/me/medicine-requests/${requestId}/cancel`)
  ).data;
}
export async function ratePharmacy(pharmacyId, payload) {
  return (
    await apiClient.post(`/Users/me/pharmacies/${pharmacyId}/rating`, payload)
  ).data;
}
export async function getSearchHistory(take = 20) {
  return (await apiClient.get("/Users/me/search-history", { params: { take } }))
    .data;
}
export async function deleteSearchHistoryItem(historyId) {
  return apiClient.delete(`/Users/me/search-history/${historyId}`);
}
export async function clearSearchHistory() {
  return apiClient.delete("/Users/me/search-history");
}
