import { apiClient } from "../../../shared/api/client";

export async function login(credentials) {
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
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
