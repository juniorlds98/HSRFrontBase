import { useState } from "react";

export function AccordionPanel({ title, subtitle, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`accordion-panel ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className="accordion-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <div>
          <h2>{title}</h2>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        <strong>{isOpen ? "-" : "+"}</strong>
      </button>

      {isOpen ? <div className="accordion-content">{children}</div> : null}
    </section>
  );
}
