import { apiClient } from "../../../shared/api/client";

export const supplyKeys = {
  dashboard: ["supply-chain", "dashboard"],
  batches: ["supply-chain", "batches"],
  marketplace: ["supply-chain", "marketplace"],
  orders: ["supply-chain", "orders"],
  representatives: ["supply-chain", "representatives"],
  invoices: ["supply-chain", "invoices"],
  suggestions: ["supply-chain", "suggestions"],
};
export const getSupplyDashboard = async () =>
  (await apiClient.get("/supply-chain/warehouse/dashboard")).data;
export const getBatches = async () =>
  (await apiClient.get("/supply-chain/warehouse/batches")).data;
export const addBatch = async (payload) =>
  (await apiClient.post("/supply-chain/warehouse/batches", payload)).data;
export const getMarketplace = async () =>
  (await apiClient.get("/supply-chain/marketplace")).data;
export const getWarehouseCatalog = async (id, query = "") =>
  (
    await apiClient.get(`/supply-chain/marketplace/${id}/catalog`, {
      params: { query },
    })
  ).data;
export const createSupplyOrder = async (payload) =>
  (await apiClient.post("/supply-chain/orders", payload)).data;
export const getSupplyOrders = async () =>
  (await apiClient.get("/supply-chain/orders")).data;
export const updateSupplyOrder = async (id, payload) =>
  (await apiClient.put(`/supply-chain/warehouse/orders/${id}/status`, payload))
    .data;
export const assignShipment = async (id, payload) =>
  (
    await apiClient.post(
      `/supply-chain/warehouse/orders/${id}/shipment`,
      payload,
    )
  ).data;
export const getRepresentatives = async () =>
  (await apiClient.get("/supply-chain/warehouse/representatives")).data;
export const createRepresentative = async (payload) =>
  (await apiClient.post("/supply-chain/warehouse/representatives", payload))
    .data;
export const updateRepresentative = async (id, payload) =>
  (
    await apiClient.put(
      `/supply-chain/warehouse/representatives/${id}`,
      payload,
    )
  ).data;
export const getSupplyInvoices = async (status = "") =>
  (
    await apiClient.get("/supply-chain/invoices", {
      params: status ? { status } : {},
    })
  ).data;
export const updateSupplyInvoice = async (id, payload) =>
  (await apiClient.put(`/supply-chain/warehouse/invoices/${id}`, payload)).data;
export const recordSupplyPayment = async (id, payload) =>
  (await apiClient.post(`/supply-chain/invoices/${id}/payments`, payload)).data;
export const updateShipment = async (id, payload) =>
  (
    await apiClient.put(
      `/supply-chain/representative/shipments/${id}/status`,
      payload,
    )
  ).data;
export const confirmShipment = async (id, payload) =>
  (
    await apiClient.post(
      `/supply-chain/pharmacy/shipments/${id}/confirm`,
      payload,
    )
  ).data;
export const getRestockSuggestions = async () =>
  (await apiClient.get("/supply-chain/pharmacy/restock-suggestions")).data;
