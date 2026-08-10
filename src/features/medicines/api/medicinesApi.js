import { apiClient } from "../../../shared/api/client";

const compact = (values = {}) =>
  Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const medicineKeys = {
  root: ["medicines"],
  list: (params = {}) => ["medicines", "list", params],
  detail: (id) => ["medicines", "detail", id],
};

export async function getMedicines(params = {}) {
  return (await apiClient.get("/Medicines", { params: compact(params) })).data;
}

export async function getMedicine(id) {
  return (await apiClient.get(`/Medicines/${id}`)).data;
}

export async function createMedicine(payload) {
  return (await apiClient.post("/Medicines", payload)).data;
}

export async function updateMedicineLocalization(id, payload) {
  return (await apiClient.put(`/Medicines/${id}/localization`, payload)).data;
}

export async function importSyrianMedicineCatalog(file, dryRun = true) {
  const form = new FormData();
  form.append("File", file, file.name);

  return (
    await apiClient.post("/Medicines/import/syrian-catalog", form, {
      params: { dryRun },
      timeout: 120_000,
    })
  ).data;
}
