export function DateRangeFilters({ fromDate, toDate, onFromDateChange, onToDateChange, onApply }) {
  return (
    <section className="analytics-filters">
      <label>
        <span>De</span>
        <input type="date" className="patient-input" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} />
      </label>
      <label>
        <span>Ate</span>
        <input type="date" className="patient-input" value={toDate} onChange={(event) => onToDateChange(event.target.value)} />
      </label>
      <button type="button" className="screen-action" onClick={onApply}>
        Aplicar filtro
      </button>
    </section>
  );
}
