import { apiClient } from "../../../shared/api/client";

export const chatKeys = {
  sessions: ["chat", "sessions"],
  session: (sessionId) => ["chat", "session", sessionId],
};

export const getChatSessions = async (take = 50) =>
  (await apiClient.get("/Chat/sessions", { params: { take } })).data;
export const startChatSession = async (title = null) =>
  (await apiClient.post("/Chat/sessions", { title })).data;
export const getChatSession = async (sessionId) =>
  (await apiClient.get(`/Chat/sessions/${sessionId}`)).data;
export const sendChatMessage = async (sessionId, payload) =>
  (await apiClient.post(`/Chat/sessions/${sessionId}/messages`, payload)).data;
export const endChatSession = async (sessionId) =>
  (await apiClient.post(`/Chat/sessions/${sessionId}/end`)).data;
