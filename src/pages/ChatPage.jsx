import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import {
  createChatConversation,
  fetchChatConversations,
  fetchChatMessages,
  formatChatTime,
  sendChatMessage,
  sendWhatsappWebhook,
} from "../services/chatService";
import { fetchPatients } from "../services/patientsService";

export function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [newConversation, setNewConversation] = useState({
    pacienteId: "",
    numeroContato: "",
  });

  function getApiErrorMessage(error, fallbackMessage) {
    const apiMessage = error?.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    return fallbackMessage;
  }

  useEffect(() => {
    let mounted = true;

    async function loadChat() {
      setIsLoading(true);
      setError("");

      try {
        const [conversationData, patientData] = await Promise.all([fetchChatConversations(), fetchPatients()]);
        if (!mounted) return;

        setConversations(conversationData);
        setPatients(patientData);

        const firstId = conversationData[0]?.id ?? null;
        setSelectedConversationId(firstId);

        if (firstId) {
          const messageData = await fetchChatMessages(firstId);
          if (mounted) {
            setMessages(messageData);
          }
        } else {
          setMessages([]);
        }

        if (patientData[0]?.id) {
          setNewConversation((current) => ({ ...current, pacienteId: String(patientData[0].id) }));
        }
      } catch (error) {
        if (mounted) {
          setError(getApiErrorMessage(error, "Nao foi possivel carregar as conversas."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadChat();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const state = location?.state;
    if (!state) {
      return;
    }

    if (state.phone) {
      setNewConversation((current) => ({ ...current, numeroContato: String(state.phone) }));
    }

    if (state.patientId) {
      setNewConversation((current) => ({ ...current, pacienteId: String(state.patientId) }));
    }
  }, [location]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function selectConversation(conversationId) {
    setSelectedConversationId(conversationId);
    setError("");

    try {
      const data = await fetchChatMessages(conversationId);
      setMessages(data);
    } catch (error) {
      setError(getApiErrorMessage(error, "Falha ao carregar mensagens da conversa."));
    }
  }

  async function handleSendMessage() {
    const text = newMessage.trim();
    if (!text || !selectedConversationId) return;

    setNewMessage("");
    setError("");

    try {
      const userId = Number(user?.id);

      await sendChatMessage({
        conversaId: selectedConversationId,
        conteudo: text,
        usuarioId: Number.isFinite(userId) ? userId : undefined,
        usuarioEmail: user?.email ?? undefined,
      });

      const [updatedConversations, updatedMessages] = await Promise.all([
        fetchChatConversations(),
        fetchChatMessages(selectedConversationId),
      ]);

      setConversations(updatedConversations);
      setMessages(updatedMessages);
    } catch (error) {
      setError(getApiErrorMessage(error, "Nao foi possivel enviar a mensagem."));
    }
  }

  async function handleCreateConversation() {
    if (!newConversation.numeroContato.trim() || !newConversation.pacienteId) {
      setError("Informe paciente e numero para criar conversa.");
      return;
    }

    setError("");

    try {
      await createChatConversation({
        pacienteId: Number(newConversation.pacienteId),
        numeroContato: newConversation.numeroContato.trim(),
      });

      const data = await fetchChatConversations();
      setConversations(data);

      const newId = data[0]?.id ?? null;
      if (newId) {
        await selectConversation(newId);
      }
    } catch (error) {
      setError(getApiErrorMessage(error, "Nao foi possivel criar conversa."));
    }
  }

  async function handleWebhookTest() {
    const selectedConversation = conversations.find((item) => item.id === selectedConversationId);
    if (!selectedConversation) {
      setError("Selecione uma conversa para simular webhook.");
      return;
    }

    if (!newConversation.pacienteId) {
      setError("Selecione um paciente para simular webhook.");
      return;
    }

    try {
      await sendWhatsappWebhook({
        numeroContato: selectedConversation.contatoNumero,
        pacienteId: Number(newConversation.pacienteId),
        conteudo: "Mensagem recebida via webhook WhatsApp",
      });

      const updatedMessages = await fetchChatMessages(selectedConversationId);
      const updatedConversations = await fetchChatConversations();
      setMessages(updatedMessages);
      setConversations(updatedConversations);
    } catch (error) {
      setError(getApiErrorMessage(error, "Falha ao simular webhook."));
    }
  }

  const filteredConversations = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return conversations;

    return conversations.filter(
      (item) =>
        item.pacienteNome?.toLowerCase().includes(normalized) ||
        item.contatoNumero?.toLowerCase().includes(normalized) ||
        item.ultimaMensagem?.toLowerCase().includes(normalized),
    );
  }, [conversations, search]);

  const activeConversation = conversations.find((item) => item.id === selectedConversationId);

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="conversas"
      hideSidebar
    >
      <section className="chat-layout">
        <aside className="chat-conversations">
          <h2>Conversas abertas</h2>
          <input
            className="chat-search"
            type="search"
            placeholder="Buscar contato por nome ou numero"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="chat-conversation-list">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`chat-conversation-item ${conversation.id === selectedConversationId ? "active" : ""}`}
                onClick={() => selectConversation(conversation.id)}
              >
                <strong>{conversation.pacienteNome}</strong>
                <small>{conversation.ultimaMensagem}</small>
                <small>{conversation.contatoNumero}</small>
              </button>
            ))}
            {filteredConversations.length === 0 && !isLoading ? (
              <p className="loading">Nenhuma conversa encontrada.</p>
            ) : null}
          </div>
        </aside>

        <section className="chat-window">
          <header className="chat-header">{activeConversation?.pacienteNome ?? "Selecione uma conversa"}</header>

          <div className="chat-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat-bubble ${message.sentido === "OUTBOUND" ? "outbound" : "inbound"}`}
              >
                <p>{message.conteudo}</p>
                <time>{formatChatTime(message.dataEnvio)}</time>
              </article>
            ))}
            {messages.length === 0 && !isLoading ? <p className="loading">Sem mensagens nessa conversa.</p> : null}
          </div>

          <div className="chat-compose">
            <input
              type="text"
              placeholder="Digite uma mensagem"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button type="button" className="screen-action" onClick={handleSendMessage}>
              Enviar
            </button>
          </div>

          <div className="chat-actions">
            <select
              value={newConversation.pacienteId}
              onChange={(event) => setNewConversation((current) => ({ ...current, pacienteId: event.target.value }))}
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nome}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Numero WhatsApp"
              value={newConversation.numeroContato}
              onChange={(event) => setNewConversation((current) => ({ ...current, numeroContato: event.target.value }))}
            />

            <button type="button" className="chat-action-btn" onClick={handleCreateConversation}>
              Nova conversa
            </button>
            <button type="button" className="chat-action-btn" onClick={handleWebhookTest}>
              Simular webhook
            </button>
          </div>
        </section>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
    </DashboardTemplate>
  );
}
