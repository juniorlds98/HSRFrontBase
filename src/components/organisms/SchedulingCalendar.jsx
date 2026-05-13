const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function EventCard({ event }) {
  return (
    <div className="calendar-event">
      <strong>{event.title}</strong>
      <span>{event.time}</span>
    </div>
  );
}

export function SchedulingCalendar({ monthLabel, cells, eventsByDay, onPrevMonth, onNextMonth }) {
  return (
    <section className="calendar-board">
      <header className="calendar-board-header">
        <button type="button" aria-label="Mes anterior" onClick={onPrevMonth}>
          &larr;
        </button>
        <h3>{monthLabel}</h3>
        <button type="button" aria-label="Proximo mes" onClick={onNextMonth}>
          &rarr;
        </button>
      </header>

      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div className="calendar-weekday" key={day}>
            {day}
          </div>
        ))}

        {cells.map((cell) => {
          const events = cell.day ? eventsByDay[cell.dateKey] ?? [] : [];

          return (
            <article className={`calendar-cell ${cell.muted ? "muted" : ""}`} key={cell.dateKey}>
              {cell.day ? <span className="calendar-day-number">{cell.day}</span> : null}
              <div className="calendar-events">
                {cell.day && events.length === 0 ? <span className="calendar-empty">Sem eventos</span> : null}
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
