import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddPatientModal } from "../components/organisms/AddPatientModal";
import { PatientsTable } from "../components/organisms/PatientsTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildPatientPayload, createPatient, fetchPatients, formatCpf } from "../services/patientsService";
import { mapPatientToRow } from "../utils/patientsMapper";

const initialForm = {
  email: "",
  nome: "",
  cpf: "",
  dataNascimento: "1995-01-01",
  sexo: "FEMININO",
  telefone: "",
  alturaCm: "165",
  pesoKg: "60",
};

export function PatientsModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState(initialForm);

  const pageSize = 6;

  useEffect(() => {
    let mounted = true;

    async function loadPatients() {
      setIsLoading(true);
      try {
        const data = await fetchPatients();
        if (!mounted) return;
        setPatients(data.map(mapPatientToRow));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return patients;
    }

    return patients.filter(
      (item) => item.name.toLowerCase().includes(normalized) || item.email.toLowerCase().includes(normalized),
    );
  }, [patients, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleFormChange(field, value) {
    if (field === "cpf") {
      setForm((current) => ({ ...current, cpf: formatCpf(value) }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreatePatient() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const created = await createPatient(buildPatientPayload(form));
      setPatients((current) => [mapPatientToRow(created), ...current]);
      setForm(initialForm);
      navigate("/pacientes", { replace: true });
    } catch {
      setSubmitError("Nao foi possivel criar o paciente. Verifique os dados e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="pacientes-menu"
      activeSidebar="pacientes"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Pacientes ({filteredPatients.length})</h1>

        <div className="patients-toolbar">
          <div className="services-toggle">
            <button type="button">Desativado</button>
            <button type="button" className="active">
              Ativo
            </button>
          </div>

          <button type="button" className="screen-action" onClick={() => navigate("/pacientes")}>
            + Adicionar Paciente
          </button>
        </div>
      </section>

      {isLoading ? <p className="loading">Carregando pacientes...</p> : <PatientsTable patients={pagedPatients} />}
      <AddPatientModal
        form={form}
        onChange={handleFormChange}
        onSubmit={handleCreatePatient}
        onClose={() => navigate("/pacientes")}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <footer className="patients-footer-pagination">
        <span>
          {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
          {filteredPatients.length}
        </span>
        <div>
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>
            &lt;-
          </button>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            -&gt;
          </button>
        </div>
      </footer>
    </DashboardTemplate>
  );
}
