import { apiClient } from "../../../shared/api/client";

export async function login(credentials) {
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
}

export async function forgotPassword(email) {
  return (await apiClient.post("/auth/password/forgot", { email })).data;
}

export async function resetPassword(payload) {
  await apiClient.post("/auth/password/reset", payload);
}

export async function registerUser(payload) {
  return (await apiClient.post("/auth/register/user", payload)).data;
}

export async function registerPharmacy(payload) {
  return (await apiClient.post("/auth/register/pharmacy", payload)).data;
}

export async function registerOrganization(payload) {
  return (await apiClient.post("/auth/register/organization", payload)).data;
}
export async function registerWarehouse(payload) {
  return (await apiClient.post("/auth/register/warehouse", payload)).data;
}
