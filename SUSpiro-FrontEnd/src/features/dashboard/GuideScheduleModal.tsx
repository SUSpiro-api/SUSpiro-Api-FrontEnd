import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../../core/api/httpClient';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { todayIsoDate, isPastIsoDate } from './date';
import { formatIsoDate, guidePriorityLabels, guideTypeLabels, specialtyLabels } from './guideLabels';
import { scheduleGuide, type Guide } from '../guides';

interface GuideScheduleModalProps {
  guide: Guide | null;
  onClose: () => void;
  onScheduled: (guide: Guide) => void;
}

export function GuideScheduleModal({ guide, onClose, onScheduled }: GuideScheduleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState(todayIsoDate());
  const [time, setTime] = useState('08:00');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (guide && !dialog.open) {
      setDate(guide.dataSolicitada >= todayIsoDate() ? guide.dataSolicitada : todayIsoDate());
      setTime('08:00');
      setError('');
      setSubmitting(false);
      dialog.showModal();
      requestAnimationFrame(() => dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus());
    }

    if (!guide && dialog.open) dialog.close();
  }, [guide]);

  if (!guide) {
    return <dialog ref={dialogRef} className="schedule-modal" />;
  }

  const detail = guide.tipo === 'CONSULTA' && guide.especialidade
    ? specialtyLabels[guide.especialidade]
    : guide.detalhe ?? guideTypeLabels[guide.tipo];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!date) {
      setError('Informe a data do agendamento.');
      return;
    }

    if (isPastIsoDate(date)) {
      setError('A data do agendamento não pode ser anterior à data de hoje.');
      return;
    }

    if (!time) {
      setError('Informe o horário do agendamento.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await scheduleGuide(guide.id, {
        dataAgendamento: date,
        horaAgendamento: time,
      });
      onScheduled(updated);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível concluir o agendamento. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="schedule-modal"
      aria-labelledby="guide-schedule-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="schedule-modal__panel">
        <header className="schedule-modal__header">
          <div>
            <p className="schedule-modal__eyebrow">Fila de agendamento</p>
            <h2 id="guide-schedule-title">Agendar guia</h2>
            <p>Defina a data e o horário para transformar esta solicitação em um atendimento agendado.</p>
          </div>
          <button type="button" className="dashboard-icon-button" aria-label="Fechar janela" onClick={onClose}>
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <section className="guide-schedule-summary" aria-label="Dados da guia">
          <div>
            <span>Paciente</span>
            <strong>{guide.pacienteNome}</strong>
          </div>
          <div>
            <span>Solicitação</span>
            <strong>{guideTypeLabels[guide.tipo]} · {detail}</strong>
          </div>
          <div>
            <span>Data solicitada</span>
            <strong>{formatIsoDate(guide.dataSolicitada)}</strong>
          </div>
          <div>
            <span>Prioridade</span>
            <strong>{guidePriorityLabels[guide.prioridade]}</strong>
          </div>
        </section>

        <form onSubmit={handleSubmit} noValidate>
          <div className="schedule-form__grid">
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="guide-schedule-date">Data do agendamento</label>
              <input
                id="guide-schedule-date"
                data-autofocus
                className="ui-field__input"
                type="date"
                min={todayIsoDate()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="guide-schedule-time">Horário</label>
              <input
                id="guide-schedule-time"
                className="ui-field__input"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="ui-field__error" role="alert">{error}</p>}

          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" disabled={submitting} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting} aria-busy={submitting}>
              <MaterialIcon name="event_available" size={18} />
              {submitting ? 'Agendando...' : 'Confirmar agendamento'}
            </Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
