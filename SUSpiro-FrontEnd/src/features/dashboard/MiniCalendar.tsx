import { useMemo, useState } from 'react';
import { MaterialIcon } from '../../components/icons';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function MiniCalendar() {
  const [current, setCurrent] = useState(() => new Date(2026, 8, 30));

  const days = useMemo(() => {
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();
    const totalDays = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const previousMonthDays = new Date(current.getFullYear(), current.getMonth(), 0).getDate();
    const cells: Array<{ day: number; outside?: boolean; date: string }> = [];

    for (let offset = firstDay - 1; offset >= 0; offset -= 1) {
      const day = previousMonthDays - offset;
      const date = new Date(current.getFullYear(), current.getMonth() - 1, day);
      cells.push({ day, outside: true, date: date.toISOString().slice(0, 10) });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(current.getFullYear(), current.getMonth(), day);
      cells.push({ day, date: date.toISOString().slice(0, 10) });
    }

    let nextDay = 1;
    while (cells.length < 42) {
      const date = new Date(current.getFullYear(), current.getMonth() + 1, nextDay);
      cells.push({ day: nextDay, outside: true, date: date.toISOString().slice(0, 10) });
      nextDay += 1;
    }

    return cells;
  }, [current]);

  const month = current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const goMonth = (delta: number) => setCurrent((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1));

  return (
    <section className="dashboard-card" aria-labelledby="calendario-title">
      <header className="dashboard-card__header">
        <h2 id="calendario-title" className="dashboard-card__title">
          <span className="sr-only">Calendário: </span>{month}
        </h2>
        <div className="calendar-nav">
          <button type="button" className="dashboard-icon-button" aria-label="Mês anterior" onClick={() => goMonth(-1)}>
            <MaterialIcon name="chevron_left" size={18} />
          </button>
          <button type="button" className="dashboard-icon-button" aria-label="Próximo mês" onClick={() => goMonth(1)}>
            <MaterialIcon name="chevron_right" size={18} />
          </button>
        </div>
      </header>
      <div className="calendar" role="grid" aria-label={`Calendário de ${month}`}>
        {weekdays.map((day) => <span className="calendar__weekday" role="columnheader" key={day}>{day}</span>)}
        {days.map((item) => (
          <button
            type="button"
            role="gridcell"
            key={item.date}
            className={['calendar__day', item.outside && 'calendar__day--outside', item.date === '2026-09-30' && 'calendar__day--today'].filter(Boolean).join(' ')}
            aria-label={item.date}
          >
            {item.day}
          </button>
        ))}
      </div>
    </section>
  );
}
