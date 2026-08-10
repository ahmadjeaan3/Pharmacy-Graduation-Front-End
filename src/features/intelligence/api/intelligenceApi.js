import { apiClient } from "../../../shared/api/client";

export const intelligenceKeys = {
  health: ["intelligence", "health"],
};

export const getIntelligenceHealth = async () =>
  (await apiClient.get("/intelligence/health")).data;

export const recommendMedicineAlternatives = async (medicineName, topN = 5) =>
  (
    await apiClient.post(
      "/intelligence/alternatives",
      {
        medicineName,
        topN,
      },
      {
        timeout: 120_000,
      },
    )
  ).data;
