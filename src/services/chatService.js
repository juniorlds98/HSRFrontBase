import { httpClient } from "./httpClient";

export async function fetchChatConversations() {
  const { data } = await httpClient.get("/api/v1/chat/conversas");
  return Array.isArray(data) ? data : [];
}

export async function fetchChatMessages(conversationId) {
  const { data } = await httpClient.get(`/api/v1/chat/conversas/${conversationId}/mensagens`);
  return Array.isArray(data) ? data : [];
}

export async function sendChatMessage(payload) {
  const { data } = await httpClient.post("/api/v1/chat/mensagens", payload);
  return data;
}

export async function createChatConversation(payload) {
  const { data } = await httpClient.post("/api/v1/chat/conversas", payload);
  return data;
}

export async function sendWhatsappWebhook(payload) {
  const { data } = await httpClient.post("/api/v1/chat/webhook/whatsapp", payload);
  return data;
}

export function formatChatTime(dateIso) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

