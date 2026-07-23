import { apiClient } from "../../../shared/api/client";

export const adminKeys = {
  root: ["admin"],
  dashboard: ["admin", "dashboard"],
  pendingPharmacies: ["admin", "pharmacies", "pending"],
  pendingOrganizations: ["admin", "organizations", "pending"],
  organizationVerification: (organizationId) => [
    "admin",
    "organizations",
    organizationId,
    "verification",
  ],
};

export async function getAdminDashboard() {
  return (await apiClient.get("/admin/dashboard")).data;
}

export async function getPendingPharmacies() {
  return (await apiClient.get("/admin/pharmacies/pending")).data;
}

export async function updatePharmacyApproval(pharmacyId, isApproved) {
  return (
    await apiClient.put(`/admin/pharmacies/${pharmacyId}/approval`, {
      isApproved,
    })
  ).data;
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
