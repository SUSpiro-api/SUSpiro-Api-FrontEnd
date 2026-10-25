// Calendário mensal com a agenda do dia escolhido, para o médico se organizar no dia e no mês.

import { MaterialIcon } from '../../components/icons';
import { recordStatusLabels, recordTypeIcons, recordTypeLabels } from './clinicalRecordConfig';
import { formatDayLabel, formatDayTitle, formatMonthTitle, weekdayLabels } from './calendar';
import { useAgendaCalendar } from './hooks/useAgendaCalendar';
import type { ClinicalRecord, Patient } from './types';

interface AgendaCalendarProps {
  records: ClinicalRecord[];
  patients: Patient[];
  /** Quando há paciente em atendimento, a agenda mostra só os registros dele. */
  patient: Patient | null;
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function AgendaCalendar({ records, patients, patient }: AgendaCalendarProps) {
  const agenda = useAgendaCalendar(records, patient?.id);
  const patientNames = new Map(patients.map((item) => [item.id, item.name] as const));
  const { monthTotals, selectedDay } = agenda;

  return (
    <section id="agenda-do-dia" className="dashboard-card agenda" aria-labelledby="agenda-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="agenda-title" className="dashboard-card__title">Agenda</h2>
          <p className="dashboard-card__subtitle">
            {patient ? `Registros de ${patient.name}.` : 'Registros de todos os pacientes.'}
          </p>
        </div>
      </header>

      <div className="agenda__nav">
        <button type="button" className="ui-icon-button" aria-label="Mês anterior" onClick={() => agenda.showMonth(-1)}>
          <MaterialIcon name="chevron_left" size={20} />
        </button>
        <p id="agenda-month" className="agenda__month" aria-live="polite">{formatMonthTitle(agenda.view)}</p>
        <button type="button" className="ui-icon-button" aria-label="Próximo mês" onClick={() => agenda.showMonth(1)}>
          <MaterialIcon name="chevron_right" size={20} />
        </button>
        <button type="button" className="dashboard-button dashboard-button--secondary dashboard-button--compact" onClick={agenda.goToToday}>
          Hoje
        </button>
      </div>

      <table
        ref={agenda.gridRef}
        className="agenda__grid"
        role="grid"
        aria-labelledby="agenda-month"
        onKeyDown={agenda.handleGridKeyDown}
      >
        <thead>
          <tr>
            {weekdayLabels.map((day) => (
              <th key={day.full} scope="col" abbr={day.full}>{day.short}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {agenda.weeks.map((week) => (
            <tr key={week[0].iso}>
              {week.map((cell) => {
                const summary = agenda.summaryFor(cell.iso);
                const selected = cell.iso === agenda.selectedIso;
                const details = summary?.tone
                  ? `, ${plural(summary.records.length, 'registro', 'registros')}${summary.urgent > 0 ? `, ${plural(summary.urgent, 'urgente', 'urgentes')}` : ''}`
                  : '';

                return (
                  <td key={cell.iso} role="gridcell" aria-selected={selected}>
                    <button
                      type="button"
                      data-iso={cell.iso}
                      className={[
                        'agenda__day',
                        !cell.inMonth && 'agenda__day--outside',
                        cell.iso === agenda.today && 'agenda__day--today',
                        selected && 'agenda__day--selected',
                      ].filter(Boolean).join(' ')}
                      tabIndex={cell.iso === agenda.focusableIso ? 0 : -1}
                      aria-label={`${formatDayLabel(cell.iso)}${details}`}
                      aria-current={cell.iso === agenda.today ? 'date' : undefined}
                      onClick={() => agenda.selectDay(cell.iso)}
                    >
                      <span aria-hidden="true">{cell.day}</span>
                      {summary?.tone && <span className={`agenda__dot agenda__dot--${summary.tone}`} aria-hidden="true" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="agenda__month-summary">
        {monthTotals.open === 0
          ? 'Nenhum registro em aberto neste mês.'
          : `${plural(monthTotals.open, 'registro em aberto', 'registros em aberto')} neste mês${monthTotals.urgent > 0 ? `, ${plural(monthTotals.urgent, 'urgente', 'urgentes')}` : ''}.`}
      </p>

      <div className="agenda__selected" aria-live="polite">
        <h3 className="agenda__selected-title">{formatDayTitle(agenda.selectedIso)}</h3>

        {selectedDay.records.length === 0 ? (
          <p className="agenda__empty">Nenhum registro neste dia.</p>
        ) : (
          <ul className="agenda__list">
            {selectedDay.records.map((record) => (
              <li key={record.id} className="agenda-item">
                <span className="agenda-item__time">{record.time ? record.time.slice(0, 5) : 'Sem hora'}</span>
                <span className="agenda-item__icon" aria-hidden="true">
                  <MaterialIcon name={recordTypeIcons[record.type]} size={18} />
                </span>
                <span className="agenda-item__info">
                  <strong>{record.title}</strong>
                  <small>
                    {recordTypeLabels[record.type]}
                    {!patient && ` · ${patientNames.get(record.patientId) ?? record.patientName ?? 'Paciente'}`}
                  </small>
                </span>
                <span className="agenda-item__tags">
                  {record.priority === 'urgente' && record.status !== 'cancelado' && (
                    <span className="appointment__status appointment__status--urgente">Urgente</span>
                  )}
                  <span className={`appointment__status appointment__status--${record.status}`}>
                    {recordStatusLabels[record.status]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
