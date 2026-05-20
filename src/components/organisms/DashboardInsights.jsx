import { ProgressList } from "../molecules/ProgressList";
import { MiniBarChart } from "../molecules/MiniBarChart";

export function DashboardInsights({ surgeryStatus, atendimentoSteps, monthlyAttendances }) {
  return (
    <section className="dashboard-insights">
      <ProgressList title="Cirurgias por Status" items={surgeryStatus.slice(0, 6)} />
      <ProgressList title="Atendimentos por Etapa" items={atendimentoSteps.slice(0, 6)} />
      <MiniBarChart title="Atendimentos por Mes" points={monthlyAttendances.slice(-8)} />
    </section>
  );
}

