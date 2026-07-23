import { apiClient } from "../../../shared/api/client";

const compact = (values = {}) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const organizationKeys = {
  dashboard: ["organization", "dashboard"],
  profile: ["organization", "profile"],
  verification: ["organization", "verification"],
  campaigns: (params = {}) => ["organization", "campaigns", params],
  offers: (params = {}) => ["organization", "offers", params],
  assistance: (params = {}) => ["organization", "assistance", params],
};

export const getOrganizationDashboard = async () =>
  (await apiClient.get("/organization/me/dashboard")).data;
export const getMyOrganization = async () =>
  (await apiClient.get("/organization/me")).data;
export const updateOrganizationProfile = async (payload) =>
  (await apiClient.put("/organization/me/profile", payload)).data;
export const getOrganizationVerification = async () =>
  (await apiClient.get("/organization/me/verification")).data;
export const uploadVerificationDocument = async ({ documentType, file }) => {
  const data = new FormData();
  data.append("documentType", documentType);
  data.append("file", file);
  return (await apiClient.post("/organization/me/verification/documents", data))
    .data;
};
export const downloadVerificationDocument = async (documentId) =>
  apiClient.get(`/organization/me/verification/documents/${documentId}`, {
    responseType: "blob",
  });
export const getOrganizationCampaigns = async (params = {}) =>
  (
    await apiClient.get("/organization/me/campaigns", {
      params: compact(params),
    })
  ).data;
export const createOrganizationCampaign = async (payload) =>
  (await apiClient.post("/organization/me/campaigns", payload)).data;
export const updateOrganizationCampaignStatus = async (campaignId, status) =>
  (
    await apiClient.put(`/organization/me/campaigns/${campaignId}/status`, {
      status,
    })
  ).data;
export const getOrganizationDonationOffers = async (params = {}) =>
  (
    await apiClient.get("/organization/me/donation-offers", {
      params: compact(params),
    })
  ).data;
export const reviewOrganizationDonationOffer = async (offerId, payload) =>
  (
    await apiClient.put(
      `/organization/me/donation-offers/${offerId}/review`,
      payload,
    )
  ).data;
export const getOrganizationAssistanceRequests = async (params = {}) =>
  (
    await apiClient.get("/organization/me/assistance-requests", {
      params: compact(params),
    })
  ).data;
export const updateOrganizationAssistanceStatus = async (requestId, payload) =>
  (
    await apiClient.put(
      `/organization/me/assistance-requests/${requestId}/status`,
      payload,
    )
  ).data;

export const publicOrganizationKeys = {
  list: ["organizations", "public", "list"],
  campaigns: (params = {}) => ["organizations", "public", "campaigns", params],
  detail: (organizationId) => [
    "organizations",
    "public",
    "detail",
    organizationId,
  ],
};

export const getApprovedOrganizations = async () =>
  (await apiClient.get("/organizations")).data;
export const getActiveOrganizationCampaigns = async (params = {}) =>
  (
    await apiClient.get("/organizations/campaigns/active", {
      params: compact(params),
    })
  ).data;
export const getOrganizationDetails = async (organizationId) =>
  (await apiClient.get(`/organizations/${organizationId}`)).data;
