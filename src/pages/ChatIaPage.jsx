import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildAtendimentoPayload, createAtendimento } from "../services/atendimentosService";
import { buildPatientPayload, createPatient } from "../services/patientsService";
import { createAgendamento, fetchSchedulingReferences } from "../services/schedulingService";

const SPECIALTIES = [
  "Aparelho digestivo",
  "Cirurgia plastica",
  "Dermatologia",
  "Ginecologia",
  "Nutricionista",
  "Ortopedia",
  "Otorrinolologia",
  "Reproducao assistida",
  "Urologia",
  "Vascular",
];

const POSITIVE_TERMS = ["sim", "tenho", "quero", "gostaria", "ok", "claro", "s"];
const NEGATIVE_TERMS = ["nao", "nÃ£o", "sem interesse", "agora nao", "agora nÃ£o", "n"];
const SUSPICIOUS_PATTERN = /<\/?script|drop\s+table|truncate\s+table|--|\/\*/i;

const STEP = {
  INTEREST: "interest",
  SPECIALTY: "specialty",
  NAME: "name",
  CPF: "cpf",
  EMAIL: "email",
  BIRTH: "birth",
  SEX: "sex",
  PHONE: "phone",
  HEIGHT: "height",
  WEIGHT: "weight",
  PATIENT_CONFIRM: "patient_confirm",
  ATTENDANCE_NOTES: "attendance_notes",
  ATTENDANCE_CONFIRM: "attendance_confirm",
  DONE: "done",
};

function formatBrazilDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(date);
}

function buildWelcomeMessages() {
  const today = new Date();
  return [
    {
      role: "assistant",
      content:
        `Ola! Eu sou o Agente Inteligente (IA) do Hospital Sao Rafael. Hoje e ${formatBrazilDate(today)}.` +
        " Vou te ajudar com seu cadastro de forma guiada e segura.",
    },
    {
      role: "assistant",
      content:
        `Voce tem interesse em realizar algum procedimento dentro destas especialidades? ${SPECIALTIES.join(", ")}? ` +
        "Se sim, vamos iniciar agora. Responda com sim ou nao.",
    },
  ];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isPositiveAnswer(value) {
  const normalized = normalizeText(value);
  return POSITIVE_TERMS.some((term) => normalized === term || normalized.includes(term));
}

function isNegativeAnswer(value) {
  const normalized = normalizeText(value);
  return NEGATIVE_TERMS.some((term) => normalized === term || normalized.includes(term));
}

function normalizeCpf(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function parseDateInput(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const br = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const [, day, month, year] = br;
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatDateIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validateUserInput(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "Mensagem vazia.";
  if (trimmed.length > 220) return "Mensagem muito longa. Use no maximo 220 caracteres.";
  if (SUSPICIOUS_PATTERN.test(trimmed)) return "Entrada bloqueada por seguranca.";

  return "";
}

function findSpecialty(value) {
  const normalized = normalizeText(value);
  return SPECIALTIES.find((item) => {
    const safe = normalizeText(item);
    return normalized.includes(safe) || safe.includes(normalized);
  });
}

function selectMedicoForSpecialty(medicos, specialty) {
  if (!Array.isArray(medicos) || medicos.length === 0) return null;
  const normalized = normalizeText(specialty);

  const keywordMap = {
    digestivo: ["gastro", "digest"],
    plastica: ["plast"],
    dermatologia: ["dermat"],
    ginecologia: ["gineco", "obst"],
    nutricionista: ["nutri"],
    ortopedia: ["ortop"],
    otorrinolologia: ["otorrino", "orl"],
    reproducao: ["reproduc", "fertil"],
    urologia: ["uro"],
    vascular: ["vascular", "angio"],
  };

  const keywords = Object.entries(keywordMap).find(([key]) => normalized.includes(key))?.[1] || [];

  const found = medicos.find((medico) => {
    const doctorText = `${medico?.nome || ""} ${medico?.cargo?.nome || ""}`.toLowerCase();
    return keywords.some((keyword) => doctorText.includes(keyword));
  });

  return found || medicos[0];
}

function messageWithTime(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function ChatIaPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [step, setStep] = useState(STEP.INTEREST);
  const [input, setInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [messages, setMessages] = useState(() => buildWelcomeMessages().map((item) => messageWithTime(item.role, item.content)));
  const [error, setError] = useState("");
  const [refs, setRefs] = useState({ pacientes: [], medicos: [], etapas: [], status: [] });

  const [form, setForm] = useState({
    specialty: "",
    nome: "",
    cpf: "",
    email: "",
    dataNascimento: "",
    sexo: "",
    telefone: "",
    alturaCm: "",
    pesoKg: "",
    atendimentoObservacoes: "",
  });

  const [createdPatient, setCreatedPatient] = useState(null);
  const [createdAgendamento, setCreatedAgendamento] = useState(null);
  const [createdAtendimento, setCreatedAtendimento] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadRefs() {
      try {
        const data = await fetchSchedulingReferences();
        if (mounted) setRefs(data);
      } catch {
        if (mounted) {
          setError("Não foi possível carregar referencias medicas para atendimento.");
        }
      }
    }

    loadRefs();
    return () => {
      mounted = false;
    };
  }, []);

  const canSend = useMemo(() => !isBusy && step !== STEP.DONE, [isBusy, step]);

  function addAssistantMessage(content) {
    setMessages((current) => [...current, messageWithTime("assistant", content)]);
  }

  function addUserMessage(content) {
    setMessages((current) => [...current, messageWithTime("user", content)]);
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  function handleFlowError(message) {
    setError(message);
    addAssistantMessage(`Guardrail: ${message}`);
  }

  async function finalizePatient() {
    setIsBusy(true);
    setError("");
    addAssistantMessage("Perfeito. Estou criando o cadastro do paciente agora...");

    try {
      const payload = buildPatientPayload({
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        dataNascimento: form.dataNascimento,
        sexo: form.sexo,
        telefone: form.telefone,
        alturaCm: form.alturaCm,
        pesoKg: form.pesoKg,
      });

      const patient = await createPatient(payload);
      setCreatedPatient(patient);

      addAssistantMessage(
        `Paciente cadastrado com sucesso (ID ${patient?.id ?? "n/a"}). Agora vou registrar o atendimento. ` +
          "Descreva em uma frase o motivo do atendimento ou observacoes iniciais.",
      );
      setStep(STEP.ATTENDANCE_NOTES);
    } catch (err) {
      handleFlowError(err?.response?.data?.message || err?.message || "Falha ao cadastrar paciente.");
    } finally {
      setIsBusy(false);
    }
  }

  async function finalizeAttendance() {
    if (!createdPatient?.id) {
      handleFlowError("Paciente ainda nao foi cadastrado.");
      return;
    }

    if (!refs?.medicos?.length || !refs?.etapas?.length || !refs?.status?.length) {
      handleFlowError("Sem medicos/etapas/status disponiveis para criar atendimento.");
      return;
    }

    setIsBusy(true);
    setError("");
    addAssistantMessage("Entendido. Estou criando agendamento e atendimento completo...");

    try {
      const medico = selectMedicoForSpecialty(refs.medicos, form.specialty);
      const etapa = refs.etapas[0];
      const status = refs.status[0];

      if (!medico?.id || !etapa?.id || !status?.id) {
        throw new Error("Referencias insuficientes para criar atendimento.");
      }

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const localDateTime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

      const agendamento = await createAgendamento({
        pacienteId: String(createdPatient.id),
        medicoId: String(medico.id),
        etapaId: String(etapa.id),
        statusId: String(status.id),
        dataHora: localDateTime,
      });

      setCreatedAgendamento(agendamento);

      const atendimentoPayload = buildAtendimentoPayload({
        pacienteId: createdPatient.id,
        medicoId: medico.id,
        agendamentoId: agendamento?.id,
        etapaId: etapa.id,
        observacoes: form.atendimentoObservacoes,
      });

      const atendimento = await createAtendimento(atendimentoPayload);
      setCreatedAtendimento(atendimento);

      addAssistantMessage(
        `Atendimento cadastrado com sucesso. IDs: paciente=${createdPatient.id}, ` +
          `agendamento=${agendamento?.id ?? "n/a"}, atendimento=${atendimento?.id ?? "n/a"}. ` +
          "Fluxo concluido com sucesso.",
      );
      setStep(STEP.DONE);
    } catch (err) {
      handleFlowError(err?.response?.data?.message || err?.message || "Falha ao criar atendimento.");
    } finally {
      setIsBusy(false);
    }
  }

  async function processFlow(userText) {
    switch (step) {
      case STEP.INTEREST: {
        if (isNegativeAnswer(userText)) {
          addAssistantMessage("Sem problemas. Quando quiser iniciar o cadastro, e so me chamar aqui.");
          setStep(STEP.DONE);
          return;
        }

        if (isPositiveAnswer(userText)) {
          addAssistantMessage("Perfeito. Qual especialidade voce deseja? Pode escolher uma da lista que te enviei.");
          setStep(STEP.SPECIALTY);
          return;
        }

        addAssistantMessage("Para eu continuar com seguranca, responda apenas com sim ou nao.");
        return;
      }

      case STEP.SPECIALTY: {
        const specialty = findSpecialty(userText);
        if (!specialty) {
          addAssistantMessage("Nao reconheci essa especialidade. Escolha uma das opcoes que eu mostrei, por favor.");
          return;
        }

        setForm((current) => ({ ...current, specialty }));
        addAssistantMessage(`Especialidade registrada: ${specialty}. Agora me informe o nome completo do paciente.`);
        setStep(STEP.NAME);
        return;
      }

      case STEP.NAME: {
        if (userText.length < 3) {
          addAssistantMessage("Esse nome ficou muito curto. Pode informar o nome completo do paciente?");
          return;
        }
        setForm((current) => ({ ...current, nome: userText }));
        addAssistantMessage("Perfeito. Agora informe o CPF do paciente com 11 digitos (ex.: 12345678901).");
        setStep(STEP.CPF);
        return;
      }

      case STEP.CPF: {
        const cpf = normalizeCpf(userText);
        if (cpf.length !== 11) {
          addAssistantMessage("CPF invalido. Preciso de exatamente 11 digitos para continuar.");
          return;
        }
        setForm((current) => ({ ...current, cpf }));
        addAssistantMessage("Otimo. Agora informe o e-mail do paciente.");
        setStep(STEP.EMAIL);
        return;
      }

      case STEP.EMAIL: {
        const email = userText.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          addAssistantMessage("E-mail invalido. Pode digitar novamente no formato nome@dominio.com?");
          return;
        }
        setForm((current) => ({ ...current, email }));
        addAssistantMessage("Perfeito. Informe a data de nascimento (dd/mm/aaaa ou aaaa-mm-dd).");
        setStep(STEP.BIRTH);
        return;
      }

      case STEP.BIRTH: {
        const date = parseDateInput(userText);
        if (!date) {
          addAssistantMessage("Data invalida. Use o formato dd/mm/aaaa ou aaaa-mm-dd.");
          return;
        }
        const now = new Date();
        if (date > now) {
          addAssistantMessage("Data futura nao e permitida. Informe uma data valida, por favor.");
          return;
        }
        if (date.getFullYear() < 1900) {
          addAssistantMessage("Data muito antiga. Revise e tente novamente.");
          return;
        }

        setForm((current) => ({ ...current, dataNascimento: formatDateIso(date) }));
        addAssistantMessage("Obrigado. Agora informe o sexo: MASCULINO, FEMININO ou OUTRO.");
        setStep(STEP.SEX);
        return;
      }

      case STEP.SEX: {
        const normalized = normalizeText(userText);
        let sexo = "";
        if (normalized.startsWith("m")) sexo = "MASCULINO";
        if (normalized.startsWith("f")) sexo = "FEMININO";
        if (normalized.startsWith("o")) sexo = "OUTRO";

        if (!sexo) {
          addAssistantMessage("Valor invalido. Use apenas MASCULINO, FEMININO ou OUTRO.");
          return;
        }

        setForm((current) => ({ ...current, sexo }));
        addAssistantMessage("Certo. Informe o telefone com DDD.");
        setStep(STEP.PHONE);
        return;
      }

      case STEP.PHONE: {
        const digits = userText.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 13) {
          addAssistantMessage("Telefone invalido. Informe DDD + numero (somente digitos ou com mascara).");
          return;
        }

        setForm((current) => ({ ...current, telefone: digits }));
        addAssistantMessage("Perfeito. Informe a altura em cm (ex.: 172).");
        setStep(STEP.HEIGHT);
        return;
      }

      case STEP.HEIGHT: {
        const height = Number(String(userText).replace(",", "."));
        if (!Number.isFinite(height) || height < 50 || height > 250) {
          addAssistantMessage("Altura fora do intervalo seguro (50 a 250 cm). Pode revisar?");
          return;
        }

        setForm((current) => ({ ...current, alturaCm: String(Math.round(height)) }));
        addAssistantMessage("Obrigado. Agora informe o peso em kg (ex.: 68.5).");
        setStep(STEP.WEIGHT);
        return;
      }

      case STEP.WEIGHT: {
        const weight = Number(String(userText).replace(",", "."));
        if (!Number.isFinite(weight) || weight < 2 || weight > 400) {
          addAssistantMessage("Peso fora do intervalo seguro (2 a 400 kg). Pode informar novamente?");
          return;
        }

        setForm((current) => ({ ...current, pesoKg: String(weight) }));
        addAssistantMessage(
          "Perfeito, chegamos ao resumo do paciente: " +
            `${form.nome || ""}, CPF ${form.cpf || ""}, email ${form.email || ""}. ` +
            "Se estiver tudo certo, responda CONFIRMAR para eu criar o cadastro.",
        );
        setStep(STEP.PATIENT_CONFIRM);
        return;
      }

      case STEP.PATIENT_CONFIRM: {
        if (normalizeText(userText) !== "confirmar") {
          addAssistantMessage("Para prosseguir com seguranca, responda exatamente CONFIRMAR.");
          return;
        }
        await finalizePatient();
        return;
      }

      case STEP.ATTENDANCE_NOTES: {
        if (userText.length < 5) {
          addAssistantMessage("Pode detalhar um pouco mais as observacoes iniciais do atendimento?");
          return;
        }

        setForm((current) => ({ ...current, atendimentoObservacoes: userText }));
        addAssistantMessage(
          "Vou usar a data/hora atual para inicio do atendimento. " +
            "Se estiver de acordo, responda CONFIRMAR para concluir o cadastro completo.",
        );
        setStep(STEP.ATTENDANCE_CONFIRM);
        return;
      }

      case STEP.ATTENDANCE_CONFIRM: {
        if (normalizeText(userText) !== "confirmar") {
          addAssistantMessage("Para concluir com seguranca, responda exatamente CONFIRMAR.");
          return;
        }

        await finalizeAttendance();
        return;
      }

      default:
        addAssistantMessage("Fluxo encerrado. Se desejar novo cadastro, recarregue a pagina.");
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !canSend) return;

    const validationError = validateUserInput(text);
    if (validationError) {
      handleFlowError(validationError);
      return;
    }

    setInput("");
    addUserMessage(text);
    await processFlow(text);
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="chat-ia"
      hideSidebar
    >
      <section className="chat-layout ai-chat-layout">
        <section className="chat-window ai-chat-window">
          <header className="chat-header">Chat com IA - Cadastro Guiado</header>

          <div className="chat-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat-bubble ${message.role === "user" ? "outbound" : "inbound"}`}
              >
                <p>{message.content}</p>
                <time>{message.time}</time>
              </article>
            ))}
          </div>

          <div className="chat-compose">
            <input
              type="text"
              placeholder={step === STEP.DONE ? "Fluxo encerrado" : "Digite sua resposta"}
              value={input}
              disabled={!canSend}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <button type="button" className="screen-action" onClick={handleSend} disabled={!canSend}>
              {isBusy ? "Processando..." : "Enviar"}
            </button>
          </div>

          <div className="chat-actions ai-chat-status">
            <span>Especialidade: {form.specialty || "-"}</span>
            <span>Paciente ID: {createdPatient?.id || "-"}</span>
            <span>Agendamento ID: {createdAgendamento?.id || "-"}</span>
            <span>Atendimento ID: {createdAtendimento?.id || "-"}</span>
          </div>
        </section>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
    </DashboardTemplate>
  );
}


