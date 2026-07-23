import { apiClient } from "../../../shared/api/client";

const compact = (values = {}) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const donationKeys = {
  offers: (params = {}) => ["donations", "offers", params],
  assistanceRequests: (params = {}) => [
    "donations",
    "assistance-requests",
    params,
  ],
  organizations: ["donations", "organizations"],
  campaigns: (organizationId, purpose) => [
    "donations",
    "campaigns",
    organizationId,
    purpose,
  ],
};

export const createDonationOffer = async (payload) =>
  (await apiClient.post("/donations/offers", payload)).data;
export const getMyDonationOffers = async (params = {}) =>
  (await apiClient.get("/donations/my/offers", { params: compact(params) }))
    .data;
export const createAssistanceRequest = async (payload) =>
  (await apiClient.post("/donations/assistance-requests", payload)).data;
export const getMyAssistanceRequests = async (params = {}) =>
  (
    await apiClient.get("/donations/my/assistance-requests", {
      params: compact(params),
    })
  ).data;
export const getApprovedOrganizations = async () =>
  (await apiClient.get("/organizations")).data;
export const getActiveCampaigns = async (organizationId) =>
  (
    await apiClient.get("/organizations/campaigns/active", {
      params: compact({ organizationId, take: 100 }),
    })
  ).data;
