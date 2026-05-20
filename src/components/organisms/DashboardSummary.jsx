import { MetricCard } from "../molecules/MetricCard";

export function DashboardSummary({ cards, score }) {
  return (
    <section className="dashboard-summary">
      <div className="nps-panel">
        <h2>Indice de Conclusao</h2>
        <div className="nps-circle">
          <strong>{score}</strong>
          <span>%</span>
        </div>
      </div>
      <div className="metrics-grid">
        {cards.map((card) => (
          <MetricCard key={card.title} title={card.title} value={card.value} accent={card.accent} />
        ))}
      </div>
    </section>
  );
}

