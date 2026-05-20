const FIELDS = [
  { key: "canal", placeholder: "Canal", type: "text" },
  { key: "origem", placeholder: "Origem", type: "text" },
  { key: "responsavel", placeholder: "Responsavel", type: "text" },
  { key: "etapa", placeholder: "Etapa", type: "text" },
  { key: "status", placeholder: "Status", type: "text" },
  { key: "cidade", placeholder: "Cidade", type: "text" },
  { key: "tag", placeholder: "Tag", type: "text" },
  { key: "scoreMin", placeholder: "Score min", type: "number" },
  { key: "scoreMax", placeholder: "Score max", type: "number" },
];

export function MarketingAdvancedFilters({ filters, onChange }) {
  return (
    <section className="analytics-advanced-filters">
      {FIELDS.map((field) => (
        <input
          key={field.key}
          className="patient-input"
          placeholder={field.placeholder}
          type={field.type}
          value={filters[field.key] ?? ""}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      ))}
    </section>
  );
}

