import { apiClient } from "../../../shared/api/client";

const compact = (values = {}) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const pharmacyKeys = {
  dashboard: ["pharmacy", "dashboard"],
  profile: ["pharmacy", "profile"],
  openStatus: ["pharmacy", "open-status"],
  workingHours: ["pharmacy", "working-hours"],
  inventory: (params = {}) => ["pharmacy", "inventory", params],
  catalog: (params = {}) => ["pharmacy", "catalog", params],
  requests: (params = {}) => ["pharmacy", "requests", params],
  request: (id) => ["pharmacy", "request", id],
  candidates: (params = {}) => ["pharmacy", "location-candidates", params],
};

export const getPharmacyDashboard = async () =>
  (await apiClient.get("/pharmacy/me/dashboard")).data;
export const getMyPharmacy = async () =>
  (await apiClient.get("/pharmacy/me")).data;
export const updatePharmacyProfile = async (payload) =>
  (await apiClient.put("/pharmacy/me/profile", payload)).data;
export const getLicenseVerification = async () =>
  (await apiClient.get("/pharmacy/me/license-verification")).data;
export const submitLicenseVerification = async (file) => {
  const form = new FormData();
  form.append("licenseImage", file);
  return (await apiClient.post("/pharmacy/me/license-verification", form)).data;
};
export const downloadLicenseDocument = async (verificationId) =>
  (
    await apiClient.get(
      `/pharmacy/me/license-verification/${verificationId}/document`,
      { responseType: "blob" },
    )
  ).data;
export const updatePharmacyLocation = async (payload) =>
  (await apiClient.put("/pharmacy/me/location", payload)).data;
export const getLocationCandidates = async (params = {}) =>
  (
    await apiClient.get("/pharmacy/me/location/candidates", {
      params: compact(params),
    })
  ).data;
export const linkPharmacyLocation = async (payload) =>
  (await apiClient.post("/pharmacy/me/location/link", payload)).data;
export const getOpenStatus = async () =>
  (await apiClient.get("/pharmacy/me/open-status")).data;
export const getWorkingHours = async () =>
  (await apiClient.get("/pharmacy/me/working-hours")).data;
export const updateWorkingHours = async (payload) =>
  (await apiClient.put("/pharmacy/me/working-hours", payload)).data;
export const getInventory = async (params = {}) =>
  (await apiClient.get("/pharmacy/me/medicines", { params: compact(params) }))
    .data;
export const addInventoryMedicine = async (payload) =>
  (await apiClient.post("/pharmacy/me/medicines", payload)).data;
export const addInventoryBatch = async (items) =>
  (await apiClient.post("/pharmacy/me/medicines/batch", { items })).data;
export const updateInventoryMedicine = async (id, payload) =>
  (await apiClient.put(`/pharmacy/me/medicines/${id}`, payload)).data;
export const removeInventoryMedicine = async (id) =>
  apiClient.delete(`/pharmacy/me/medicines/${id}`);
export const predictInventoryStockout = async (payload) =>
  (await apiClient.post("/intelligence/stockout", payload)).data;
export const getPharmacyRequests = async (params = {}) =>
  (await apiClient.get("/pharmacy/me/requests", { params: compact(params) }))
    .data;
export const getPharmacyRequest = async (id) =>
  (await apiClient.get(`/pharmacy/me/requests/${id}`)).data;
export const respondToPharmacyRequest = async (id, payload) =>
  (await apiClient.put(`/pharmacy/me/requests/${id}/response`, payload)).data;
export const confirmMedicinePickup = async (id) =>
  (await apiClient.post(`/pharmacy/me/requests/${id}/confirm-pickup`)).data;
export const searchMedicineCatalog = async (params = {}) =>
  (
    await apiClient.get("/pharmacy/catalog/medicines", {
      params: compact(params),
    })
  ).data;

// Public discovery contract. Kept separate from the authenticated pharmacy workspace.
export const registeredNearby = async (params) =>
  (
    await apiClient.get("/Pharmacies/registered/nearby", {
      params: compact(params),
    })
  ).data;
export const registeredPharmacyDetails = async (id, params = {}) =>
  (
    await apiClient.get(`/Pharmacies/registered/${id}`, {
      params: compact(params),
    })
  ).data;
export const nearbyExternalPharmacies = async (params) =>
  (await apiClient.get("/Pharmacies/nearby", { params: compact(params) })).data;
export const searchExternalPharmacies = async (payload) =>
  (await apiClient.post("/Pharmacies/search", payload)).data;
export const closestRegisteredPharmacies = async (params) =>
  (await apiClient.get("/Pharmacies/closest", { params: compact(params) }))
    .data;
export const closestExternalPharmacies = async (params) =>
  (
    await apiClient.get("/Pharmacies/external/closest", {
      params: compact(params),
    })
  ).data;
export const externalPharmacyDetails = async (placeId) =>
  (await apiClient.get(`/Pharmacies/details/${encodeURIComponent(placeId)}`))
    .data;
export const pharmacyPhotoUrl = (reference) =>
  `${apiClient.defaults.baseURL}/Pharmacies/photo?reference=${encodeURIComponent(reference)}`;
export const clearPharmacyCache = async (hours = 24) =>
  (await apiClient.post("/Pharmacies/cache/clear", null, { params: { hours } }))
    .data;
export const getPharmacyLocatorHealth = async () =>
  (await apiClient.get("/Pharmacies/health")).data;
