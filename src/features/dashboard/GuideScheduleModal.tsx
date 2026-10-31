import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { todayIsoDate } from './date';
import { formatIsoDate, guideDetail, guidePriorityLabels, guideTypeLabels } from './guideLabels';
import type { Guide } from '../guides';
import { useGuideScheduleForm } from './hooks/useGuideScheduleForm';

interface GuideScheduleModalProps {
  guide: Guide | null;
  onClose: () => void;
  onScheduled: (guide: Guide) => void;
}

export function GuideScheduleModal({ guide, onClose, onScheduled }: GuideScheduleModalProps) {
  const form = useGuideScheduleForm({ guide, onClose, onScheduled });

  if (!guide) {
    return <dialog ref={form.dialogRef} className="schedule-modal" />;
  }

  const detail = guideDetail(guide);

  return (
    <dialog
      ref={form.dialogRef}
      className="schedule-modal"
      aria-labelledby="guide-schedule-title"
      onCancel={form.handleCancel}
      onClick={form.handleDialogClick}
    >
      <div className="schedule-modal__panel">
        <header className="schedule-modal__header">
          <div>
            <h2 id="guide-schedule-title">Agendar guia</h2>
            <p>Informe quando e onde o atendimento acontecerá para concluir o agendamento.</p>
          </div>
          <button
            type="button"
            className="ui-icon-button"
            aria-label="Fechar janela"
            onClick={onClose}
            disabled={form.submitting}
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <section className="guide-schedule-summary" aria-label="Dados da guia">
          <div>
            <span>Paciente</span>
            <strong title={guide.pacienteNome}>{guide.pacienteNome}</strong>
          </div>
          <div>
            <span>Solicitação</span>
            <strong title={`${guideTypeLabels[guide.tipo]} · ${detail}`}>
              {guideTypeLabels[guide.tipo]} · {detail}
            </strong>
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

        <form onSubmit={form.handleSubmit} noValidate>
          <div className="schedule-form__grid">
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="guide-schedule-date">
                Data do agendamento
              </label>
              <input
                id="guide-schedule-date"
                data-autofocus
                className="ui-field__input"
                type="date"
                min={todayIsoDate()}
                value={form.date}
                onChange={(event) => form.setDate(event.target.value)}
                required
              />
            </div>
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="guide-schedule-time">Horário</label>
              <input
                id="guide-schedule-time"
                className="ui-field__input"
                type="time"
                value={form.time}
                onChange={(event) => form.setTime(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="schedule-location-grid">
            <div className="ui-field schedule-location-grid__wide">
              <label className="ui-field__label" htmlFor="guide-schedule-facility">Hospital ou clínica</label>
              <input
                id="guide-schedule-facility"
                className="ui-field__input"
                type="text"
                autoComplete="organization"
                maxLength={180}
                placeholder="Nome da unidade de saúde"
                value={form.clinicName}
                onChange={(event) => form.setClinicName(event.target.value)}
                required
              />
            </div>
            <div className="ui-field schedule-location-grid__wide">
              <label className="ui-field__label" htmlFor="guide-schedule-address">Endereço</label>
              <input
                id="guide-schedule-address"
                className="ui-field__input"
                type="text"
                autoComplete="street-address"
                maxLength={300}
                placeholder="Rua, número e complemento"
                value={form.clinicAddress}
                onChange={(event) => form.setClinicAddress(event.target.value)}
                required
              />
            </div>
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="guide-schedule-city">Cidade</label>
              <input
                id="guide-schedule-city"
                className="ui-field__input"
                type="text"
                autoComplete="address-level2"
                maxLength={120}
                placeholder="Cidade"
                value={form.clinicCity}
                onChange={(event) => form.setClinicCity(event.target.value)}
                required
              />
            </div>
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="guide-schedule-state">UF</label>
              <input
                id="guide-schedule-state"
                className="ui-field__input"
                type="text"
                autoComplete="address-level1"
                maxLength={2}
                minLength={2}
                placeholder="SP"
                value={form.clinicState}
                onChange={(event) => form.setClinicState(event.target.value)}
                required
              />
            </div>
          </div>
          {form.error && <p className="ui-field__error" role="alert">{form.error}</p>}

          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" disabled={form.submitting} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.submitting} aria-busy={form.submitting}>
              {form.submitting ? 'Agendando...' : 'Confirmar agendamento'}
            </Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
