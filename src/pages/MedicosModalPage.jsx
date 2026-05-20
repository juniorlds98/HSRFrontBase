import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddMedicoModal } from "../components/organisms/AddMedicoModal";
import { MedicosTable } from "../components/organisms/MedicosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildMedicoPayload, createMedico, fetchMedicoReferences, fetchMedicos } from "../services/medicosService";
import { mapMedicoToRow } from "../utils/medicosMapper";

const initialForm = {
  nome: "",
  cpf: "",
  cargoId: "",
  ativo: "true",
  crmNumero: "",
  crmUf: "SP",
};

export function MedicosModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [references, setReferences] = useState({ cargos: [] });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const [data, refs] = await Promise.all([fetchMedicos(), fetchMedicoReferences()]);
        if (!mounted) return;
        setReferences(refs);
        setMedicos(data.map(mapMedicoToRow));
        setForm((c) => ({ ...c, cargoId: refs.cargos[0]?.id ? String(refs.cargos[0].id) : "" }));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicos;
    return medicos.filter(
      (m) => m.nome.toLowerCase().includes(q) || m.cpf.toLowerCase().includes(q) || m.crmDisplay.toLowerCase().includes(q),
    );
  }, [medicos, query]);

  function handleChange(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const payload = buildMedicoPayload(form);
      const created = await createMedico(payload);
      setMedicos((c) => [mapMedicoToRow(created), ...c]);
      navigate("/medicos", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Não foi possível cadastrar o medico.");
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
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="medicos-menu"
      activeSidebar="medicos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Medicos ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/medicos")}>
            Voltar
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando medicos...</p> : <MedicosTable medicos={filtered} />}
      <AddMedicoModal
        form={form}
        references={references}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/medicos")}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </DashboardTemplate>
  );
}


