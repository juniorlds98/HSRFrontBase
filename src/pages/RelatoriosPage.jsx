import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateRangeFilters } from "../components/molecules/DateRangeFilters";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import {
  downloadCsvReport,
  downloadHostedFile,
  fetchHostedFiles,
  uploadHostedFile,
} from "../services/reportsService";
import { toDateInputValue } from "../utils/analyticsFormatters";

function triggerBrowserDownload(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

function formatFileSize(bytes) {
  const value = Number(bytes ?? 0);
  if (value <= 0) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function RelatoriosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const today = new Date();
  const [fromDate, setFromDate] = useState(toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [toDate, setToDate] = useState(toDateInputValue(today));
  const [filters, setFilters] = useState({ fromDate, toDate });

  const [busyCsv, setBusyCsv] = useState("");
  const [csvFeedback, setCsvFeedback] = useState("");

  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [filesFeedback, setFilesFeedback] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [folder, setFolder] = useState("relatorios");
  const [busyFileAction, setBusyFileAction] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHostedFiles() {
      setIsLoadingFiles(true);
      setFilesFeedback("");

      try {
        const rows = await fetchHostedFiles();
        if (!mounted) return;
        setFiles(rows);
      } catch (error) {
        if (!mounted) return;
        setFilesFeedback(error.message ?? "Falha ao carregar arquivos hospedados.");
      } finally {
        if (mounted) {
          setIsLoadingFiles(false);
        }
      }
    }

    loadHostedFiles();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  function applyFilters() {
    setFilters({ fromDate, toDate });
    setCsvFeedback("Periodo atualizado para geracao dos CSVs.");
  }

  async function handleCsvDownload(kind) {
    setBusyCsv(kind);
    setCsvFeedback("");

    try {
      const result = await downloadCsvReport(kind, {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
      triggerBrowserDownload(result.blob, result.fileName);
      setCsvFeedback(`CSV de ${kind} gerado com sucesso.`);
    } catch (error) {
      setCsvFeedback(error.message ?? "Falha ao gerar CSV.");
    } finally {
      setBusyCsv("");
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!uploadFile) {
      setFilesFeedback("Selecione um arquivo para upload.");
      return;
    }

    setBusyFileAction("upload");
    setFilesFeedback("");

    try {
      const created = await uploadHostedFile(uploadFile, folder.trim() || "relatorios");
      setFiles((current) => [created, ...current]);
      setUploadFile(null);
      setFilesFeedback("Arquivo hospedado com sucesso.");
    } catch (error) {
      setFilesFeedback(error.message ?? "Falha no upload do arquivo.");
    } finally {
      setBusyFileAction("");
    }
  }

  async function handleFileDownload(item) {
    setBusyFileAction(item.id);
    setFilesFeedback("");

    try {
      const result = await downloadHostedFile(item);
      triggerBrowserDownload(result.blob, result.fileName);
    } catch (error) {
      setFilesFeedback(error.message ?? "Falha ao baixar arquivo.");
    } finally {
      setBusyFileAction("");
    }
  }

  const totalBytes = useMemo(() => files.reduce((sum, item) => sum + Number(item.size ?? 0), 0), [files]);

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="relatorios"
      activeSidebar="relatorios"
      searchValue=""
    >
      <section className="screen-heading-row">
        <h1>Relatorios e MinIO</h1>
      </section>

      <DateRangeFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onApply={applyFilters}
      />

      <p className="services-mode-indicator">
        Gere CSVs de leads e financeiro por periodo e hospede arquivos adicionais no MinIO.
      </p>

      <section className="overview-cards-grid">
        <article className="overview-card">
          <span>Arquivos hospedados</span>
          <strong>{isLoadingFiles ? "..." : files.length}</strong>
        </article>
        <article className="overview-card">
          <span>Espaco total</span>
          <strong>{isLoadingFiles ? "..." : formatFileSize(totalBytes)}</strong>
        </article>
        <article className="overview-card">
          <span>Periodo ativo</span>
          <strong>
            {filters.fromDate || "-"} ate {filters.toDate || "-"}
          </strong>
        </article>
      </section>

      <section className="reports-actions-grid">
        <article className="overview-panel">
          <div className="overview-panel-header">
            <h2>CSV de Leads</h2>
            <span>Pipeline comercial</span>
          </div>
          <p className="reports-panel-text">Exporta dados de leads filtrados pelo periodo selecionado.</p>
          <button
            type="button"
            className="screen-action"
            disabled={busyCsv === "leads"}
            onClick={() => handleCsvDownload("leads")}
          >
            {busyCsv === "leads" ? "Gerando..." : "Baixar CSV de leads"}
          </button>
        </article>

        <article className="overview-panel">
          <div className="overview-panel-header">
            <h2>CSV Financeiro</h2>
            <span>Receita e custos</span>
          </div>
          <p className="reports-panel-text">Exporta os totais financeiros para analise externa.</p>
          <button
            type="button"
            className="screen-action"
            disabled={busyCsv === "financeiro"}
            onClick={() => handleCsvDownload("financeiro")}
          >
            {busyCsv === "financeiro" ? "Gerando..." : "Baixar CSV financeiro"}
          </button>
        </article>
      </section>

      {csvFeedback ? <p className="services-feedback">{csvFeedback}</p> : null}

      <section className="overview-panel reports-files-panel">
        <div className="overview-panel-header">
          <h2>Hospedagem de arquivos</h2>
          <span>Bucket MinIO</span>
        </div>

        <form className="reports-upload-form" onSubmit={handleUpload}>
          <label>
            <span>Pasta</span>
            <input
              type="text"
              className="patient-input"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="relatorios"
            />
          </label>

          <label>
            <span>Arquivo</span>
            <input
              type="file"
              className="patient-input"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <button type="submit" className="screen-action" disabled={busyFileAction === "upload"}>
            {busyFileAction === "upload" ? "Enviando..." : "Hospedar arquivo"}
          </button>
        </form>

        {filesFeedback ? <p className="services-feedback">{filesFeedback}</p> : null}
        {isLoadingFiles ? <p className="loading">Carregando arquivos...</p> : null}

        {!isLoadingFiles ? (
          <div className="reports-file-table">
            <div className="reports-file-head">
              <span>Nome</span>
              <span>Tamanho</span>
              <span>Upload</span>
              <span>Acao</span>
            </div>

            {files.map((item) => (
              <article key={item.id} className="reports-file-row">
                <strong>{item.name}</strong>
                <span>{formatFileSize(item.size)}</span>
                <span>{formatDate(item.uploadedAt)}</span>
                <button
                  type="button"
                  className="submit-secondary"
                  disabled={busyFileAction === item.id}
                  onClick={() => handleFileDownload(item)}
                >
                  {busyFileAction === item.id ? "Baixando..." : "Baixar"}
                </button>
              </article>
            ))}

            {files.length === 0 ? <p className="loading">Nenhum arquivo hospedado ainda.</p> : null}
          </div>
        ) : null}
      </section>
    </DashboardTemplate>
  );
}