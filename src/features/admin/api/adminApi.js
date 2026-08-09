import { apiClient } from "../../../shared/api/client";

export const adminKeys = {
  root: ["admin"],
  dashboard: (days = 7) => ["admin", "dashboard", days],
  pendingPharmacies: ["admin", "pharmacies", "pending"],
  pendingOrganizations: ["admin", "organizations", "pending"],
  pendingWarehouses: ["admin", "warehouses", "pending"],
  homeTicker: ["admin", "home-ticker"],
  homeTickerPharmacies: ["admin", "home-ticker", "pharmacies"],
  accounts: (params = {}) => ["admin", "accounts", params],
  account: (userId) => ["admin", "accounts", userId],
  organizationVerification: (organizationId) => [
    "admin",
    "organizations",
    organizationId,
    "verification",
  ],
};

export async function getHomeTickerItems() {
  return (await apiClient.get("/admin/home-ticker")).data;
}
export async function getHomeTickerPharmacies() {
  return (await apiClient.get("/admin/home-ticker/pharmacies")).data;
}
export async function createHomeTickerItem(payload) {
  return (await apiClient.post("/admin/home-ticker", payload)).data;
}
export async function updateHomeTickerItem(id, payload) {
  return (await apiClient.put(`/admin/home-ticker/${id}`, payload)).data;
}
export async function deleteHomeTickerItem(id) {
  return apiClient.delete(`/admin/home-ticker/${id}`);
}
export async function getAdminAccounts(params = {}) {
  return (await apiClient.get("/admin/accounts", { params })).data;
}
export async function getAdminAccount(userId) {
  return (await apiClient.get(`/admin/accounts/${userId}`)).data;
}
export async function updateAdminAccountStatus(userId, payload) {
  return apiClient.put(`/admin/accounts/${userId}/status`, payload);
}

export async function getAdminDashboard(days = 7) {
  return (await apiClient.get("/admin/dashboard", { params: { days } })).data;
}

export async function getPendingPharmacies() {
  return (await apiClient.get("/admin/pharmacies/pending")).data;
}

export async function updatePharmacyApproval(
  pharmacyId,
  isApproved,
  reason = null,
  isManualDecision = false,
) {
  return (
    await apiClient.put(`/admin/pharmacies/${pharmacyId}/approval`, {
      isApproved,
      reason,
      isManualDecision,
    })
  ).data;
}

export async function getPharmacyLicenseVerification(pharmacyId) {
  return (
    await apiClient.get(`/admin/pharmacies/${pharmacyId}/license-verification`)
  ).data;
}

export async function getPharmacyLicenseDocument(pharmacyId, verificationId) {
  return apiClient.get(
    `/admin/pharmacies/${pharmacyId}/license-verification/${verificationId}/document`,
    { responseType: "blob" },
  );
}

export async function getPendingOrganizations() {
  return (await apiClient.get("/admin/organizations/pending")).data;
}

export async function updateOrganizationApproval(organizationId, isApproved) {
  return (
    await apiClient.put(`/admin/organizations/${organizationId}/approval`, {
      isApproved,
    })
  ).data;
}
export async function getPendingWarehouses() {
  return (await apiClient.get("/admin/warehouses/pending")).data;
}
export async function updateWarehouseApproval(warehouseId, isApproved, reason) {
  return (
    await apiClient.put(`/admin/warehouses/${warehouseId}/approval`, {
      isApproved,
      isManualDecision: true,
      reason,
    })
  ).data;
}

export async function getOrganizationVerification(organizationId) {
  return (
    await apiClient.get(`/admin/organizations/${organizationId}/verification`)
  ).data;
}

export async function reviewOrganizationVerification(organizationId, review) {
  return (
    await apiClient.put(
      `/admin/organizations/${organizationId}/verification`,
      review,
    )
  ).data;
}

export async function getOrganizationVerificationDocument(
  organizationId,
  documentId,
) {
  return apiClient.get(
    `/admin/organizations/${organizationId}/verification/documents/${documentId}`,
    { responseType: "blob" },
  );
}
