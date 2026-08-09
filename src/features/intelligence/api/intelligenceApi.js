import { apiClient } from "../../../shared/api/client";

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
