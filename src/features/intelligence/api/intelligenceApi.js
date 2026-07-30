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
        timeout: 15_000,
      },
    )
  ).data;
