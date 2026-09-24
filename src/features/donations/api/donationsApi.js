import { apiClient } from "../../../shared/api/client";

const compact = (values = {}) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const donationKeys = {
  verificationPharmacies: ["donations", "verification-pharmacies"],
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

export const createDonationOffer = async (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      form.append(key, value);
    }
  });
  return (await apiClient.post("/donations/offers", form)).data;
};

// Donation image links come from the API as `/api/donation-images/{id}`,
// while apiClient.baseURL already ends with `/api`. Axios concatenates those
// values and would otherwise request `/api/api/donation-images/{id}`.
export const normalizeDonationImageUrl = (url) => {
  const normalized = String(url || "").trim();
  if (!normalized || /^https?:\/\//i.test(normalized)) return normalized;
  return normalized.replace(/^\/?api(?=\/)/i, "");
};

export const getDonationImage = async (url) =>
  (
    await apiClient.get(normalizeDonationImageUrl(url), {
      responseType: "blob",
    })
  ).data;
export const getVerificationPharmacies = async () =>
  (await apiClient.get("/donations/verification-pharmacies")).data;
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
