import { Button } from "../atoms/Button";

function ServiceStat({ label, value }) {
  return (
    <div className="service-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getStatusText(status) {
  if (status === "active") return "Ativo";
  if (status === "inactive") return "Desativado";
  return "Degradado";
}

export function ServiceControlBoard({ services, onRestart, onDisable, pendingId }) {
  const essentialServices = services.filter((s) => !s.isFacultative);
  const optionalServices = services.filter((s) => s.isFacultative);

  return (
    <section className="services-container" id="servicos">
      {essentialServices.length > 0 && (
        <>
          <div className="services-section-header">
            <h2>Serviços Essenciais</h2>
            <p className="services-section-help">Estes serviços são críticos para o funcionamento do sistema.</p>
          </div>
          <div className="services-grid">
            {essentialServices.map((service) => (
              <ServiceCard key={service.id} service={service} onRestart={onRestart} onDisable={onDisable} pendingId={pendingId} />
            ))}
          </div>
        </>
      )}

      {optionalServices.length > 0 && (
        <>
          <div className="services-section-header">
            <h2>Serviços Opcionais</h2>
            <p className="services-section-help">Estes serviços melhoram a experiência mas não são críticos. Você pode desligá-los se necessário.</p>
          </div>
          <div className="services-grid">
            {optionalServices.map((service) => (
              <ServiceCard key={service.id} service={service} onRestart={onRestart} onDisable={onDisable} pendingId={pendingId} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ServiceCard({ service, onRestart, onDisable, pendingId }) {
  const isPending = pendingId === service.id;
  const isDisabled = service.status === "inactive";

  return (
    <article key={service.id} className="service-card">
      <header className="service-card-header">
        <h3>{service.name}</h3>
        <span className={`service-chip service-chip-${service.status}`}>{getStatusText(service.status)}</span>
      </header>

      <p className="service-url">{service.url || "Serviço interno"}</p>

      <div className="service-actions-row">
        <Button className="service-action-btn restart" onClick={() => onRestart(service)} disabled={isPending}>
          Reiniciar
        </Button>
        <Button
          className={`service-action-btn stop ${service.isFacultative ? "optional" : "disabled"}`}
          onClick={() => onDisable(service)}
          disabled={isPending || !service.isFacultative}
          title={service.isFacultative ? "Desativar serviço" : "Serviço essencial não pode ser desligado"}
        >
          {service.isFacultative ? "Parar" : "Crítico"}
        </Button>
      </div>

      <div className="service-stats-row">
        <ServiceStat label="Modo" value={service.source === "mock-control" ? "Mock" : "Real"} />
        <ServiceStat
          label="Resposta"
          value={service.responseTimeMs != null ? `${service.responseTimeMs} ms` : "-"}
        />
        <ServiceStat label="Tipo" value={service.isFacultative ? "Opcional" : "Essencial"} />
      </div>
    </article>
  );
}

