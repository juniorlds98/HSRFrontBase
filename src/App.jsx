import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { DoctorsPage } from "./pages/DoctorsPage";
import { FinancePage } from "./pages/FinancePage";
import { ManagementPage } from "./pages/ManagementPage";
import { MarketingPage } from "./pages/MarketingPage";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { PatientsModalPage } from "./pages/PatientsModalPage";
import { PatientsPage } from "./pages/PatientsPage";
import { SchedulingModalPage } from "./pages/SchedulingModalPage";
import { SchedulingPage } from "./pages/SchedulingPage";
import { ServicesPage } from "./pages/ServicesPage";
import { QualityPage } from "./pages/QualityPage";
import { CasesPage } from "./pages/CasesPage";
import { CasesModalPage } from "./pages/CasesModalPage";
import { MedicosPage } from "./pages/MedicosPage";
import { MedicosModalPage } from "./pages/MedicosModalPage";
import { CirurgiasPage } from "./pages/CirurgiasPage";
import { CirurgiasModalPage } from "./pages/CirurgiasModalPage";
import { FuncionariosPage } from "./pages/FuncionariosPage";
import { FuncionariosModalPage } from "./pages/FuncionariosModalPage";
import { ProcedimentosPage } from "./pages/ProcedimentosPage";
import { ProcedimentosModalPage } from "./pages/ProcedimentosModalPage";
import { InternacoesPage } from "./pages/InternacoesPage";
import { InternacoesModalPage } from "./pages/InternacoesModalPage";
import { ConsentimentosPage } from "./pages/ConsentimentosPage";
import { ConsentimentosModalPage } from "./pages/ConsentimentosModalPage";
import { ComplicacoesPage } from "./pages/ComplicacoesPage";
import { ComplicacoesModalPage } from "./pages/ComplicacoesModalPage";
import { JornadasPage } from "./pages/JornadasPage";
import { JornadasModalPage } from "./pages/JornadasModalPage";
import { RelatoriosPage } from "./pages/RelatoriosPage";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
}

function wrap(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={wrap(<DashboardPage />)} />
          <Route path="/services" element={wrap(<ServicesPage />)} />
          <Route path="/mensagens" element={wrap(<ChatPage />)} />
          <Route path="/financeiro" element={wrap(<FinancePage />)} />
          <Route path="/marketing" element={wrap(<MarketingPage />)} />
          <Route path="/medicos" element={wrap(<MedicosPage />)} />
          <Route path="/medicos/modal" element={wrap(<MedicosModalPage />)} />
          <Route path="/medicos/overview" element={wrap(<DoctorsPage />)} />
          <Route path="/gestao" element={wrap(<ManagementPage />)} />
          <Route path="/qualidade" element={wrap(<QualityPage />)} />
          <Route path="/casos" element={wrap(<CasesPage />)} />
          <Route path="/casos/modal" element={wrap(<CasesModalPage />)} />
          <Route path="/agendamentos" element={wrap(<SchedulingPage />)} />
          <Route path="/agendamentos/modal" element={wrap(<SchedulingModalPage />)} />
          <Route path="/pacientes" element={wrap(<PatientsPage />)} />
          <Route path="/pacientes/modal" element={wrap(<PatientsModalPage />)} />
          <Route path="/cirurgias" element={wrap(<CirurgiasPage />)} />
          <Route path="/cirurgias/modal" element={wrap(<CirurgiasModalPage />)} />
          <Route path="/funcionarios" element={wrap(<FuncionariosPage />)} />
          <Route path="/funcionarios/modal" element={wrap(<FuncionariosModalPage />)} />
          <Route path="/procedimentos" element={wrap(<ProcedimentosPage />)} />
          <Route path="/procedimentos/modal" element={wrap(<ProcedimentosModalPage />)} />
          <Route path="/internacoes" element={wrap(<InternacoesPage />)} />
          <Route path="/internacoes/modal" element={wrap(<InternacoesModalPage />)} />
          <Route path="/consentimentos" element={wrap(<ConsentimentosPage />)} />
          <Route path="/consentimentos/modal" element={wrap(<ConsentimentosModalPage />)} />
          <Route path="/complicacoes" element={wrap(<ComplicacoesPage />)} />
          <Route path="/complicacoes/modal" element={wrap(<ComplicacoesModalPage />)} />
          <Route path="/jornadas" element={wrap(<JornadasPage />)} />
          <Route path="/jornadas/modal" element={wrap(<JornadasModalPage />)} />
          <Route path="/relatorios" element={wrap(<RelatoriosPage />)} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
