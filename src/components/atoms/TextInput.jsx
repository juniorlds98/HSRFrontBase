export function TextInput({ label, id, error, className = "", ...props }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input id={id} className="field-input" {...props} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

