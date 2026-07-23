import { apiClient } from "../../../shared/api/client";

export const accountKeys = { profile: ["account", "profile"] };

export async function getAccountProfile() {
  return (await apiClient.get("/account/me")).data;
}
export async function updateAccountProfile(payload) {
  return (await apiClient.put("/account/me/profile", payload)).data;
}
export async function changeAccountPassword(payload) {
  return apiClient.put("/account/me/password", payload);
}
