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
export async function updateAccountAvatar(file) {
  const body = new FormData();
  body.append("image", file);
  return (
    await apiClient.put("/account/me/avatar", body, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
}
export async function deleteAccountAvatar() {
  return (await apiClient.delete("/account/me/avatar")).data;
}
