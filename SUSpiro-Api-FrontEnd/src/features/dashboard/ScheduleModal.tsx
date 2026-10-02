import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/httpClient';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { formatCpf, isValidCpf } from '../../utils/cpf';
import { examGroups, specialtyOptions } from './catalogs';
import { specialtyLabels } from './guideLabels';
import { createGuide, type ConsultationSpecialty, type Guide, type GuideType } from './guideService';
import { isPastIsoDate, todayIsoDate } from './date';
import type { Patient, ScheduleType } from './types';

interface ScheduleModalProps {
  open: boolean;
  initialType?: ScheduleType;
  patient: Patient | null;
  onClose: () => void;
  onCreated: (guide: Guide) => void;
  findPatient: (cpf: string) => Patient | null;
  onPatientChange: (patient: Patient) => void;
}

const typeOptions: Array<{ value: ScheduleType; label: string; icon: 'calendar' | 'medical_services' | 'science' | 'description' }> = [
  { value: 'consulta', label: 'Consulta', icon: 'calendar' },
  { value: 'retorno', label: 'Retorno', icon: 'medical_services' },
  { value: 'exame', label: 'Exame', icon: 'science' },
  { value: 'encaminhamento', label: 'Encaminhamento', icon: 'description' },
];


const detailLabels: Partial<Record<ScheduleType, string>> = {
  exame: 'Exame solicitado',
  encaminhamento: 'Especialidade de destino',
};

function formatBirthDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`));
}

function buildTitle(type: ScheduleType, detail: string, specialty?: ConsultationSpecialty | ''): string {
  if (type === 'consulta') return specialty ? specialtyLabels[specialty] : 'Consulta';
  if (type === 'retorno') return 'Retorno';
  return detail.trim();
}

function mapGuideType(type: ScheduleType): GuideType {
  return type.toUpperCase() as GuideType;
}

export function ScheduleModal({
  open,
  initialType = 'consulta',
  patient,
  onClose,
  onCreated,
  findPatient,
  onPatientChange,
}: ScheduleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [type, setType] = useState<ScheduleType>(initialType);
  const [specialty, setSpecialty] = useState<ConsultationSpecialty | ''>('');
  const [date, setDate] = useState(todayIsoDate());
  const [detail, setDetail] = useState('');
  const [observation, setObservation] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgente'>('normal');
  const [editingCpf, setEditingCpf] = useState(false);
  const [cpfDraft, setCpfDraft] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setType(initialType);
    setSpecialty('');
    setDate(todayIsoDate());
    setDetail('');
    setObservation('');
    setPriority('normal');
    setEditingCpf(false);
    setCpfDraft(patient?.cpf ?? '');
    setCpfError('');
    setSubmitError('');
    setIsSubmitting(false);

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (open) return;
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    previousFocusRef.current?.focus();
  }, [open]);

  const handleCpfChange = (value: string) => {
    setCpfDraft(value.replace(/\D/g, '').slice(0, 11));
    setCpfError('');
  };

  const applyCpf = () => {
    if (!isValidCpf(cpfDraft)) {
      setCpfError('Informe um CPF válido com 11 dígitos.');
      return;
    }

    const nextPatient = findPatient(cpfDraft);
    if (!nextPatient) {
      setCpfError('Nenhum paciente foi encontrado com esse CPF.');
      return;
    }

    onPatientChange(nextPatient);
    setCpfDraft(nextPatient.cpf);
    setEditingCpf(false);
    setCpfError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!patient || !date) {
      setSubmitError('Identifique o paciente e informe a data solicitada.');
      return;
    }

    if (isPastIsoDate(date)) {
      setSubmitError('A data solicitada não pode ser anterior à data de hoje.');
      return;
    }

    const requiresDetail = type === 'exame' || type === 'encaminhamento';
    if (requiresDetail && !detail.trim()) {
      setSubmitError(type === 'exame' ? 'Selecione o exame solicitado.' : 'Selecione a especialidade de destino.');
      return;
    }

    if (type === 'consulta' && !specialty) {
      setSubmitError('Selecione a especialidade da consulta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const guide = await createGuide({
        pacienteId: patient.id,
        pacienteNome: patient.name,
        pacienteCpf: patient.cpf.replace(/\D/g, ''),
        tipo: mapGuideType(type),
        especialidade: type === 'consulta' ? specialty || undefined : undefined,
        detalhe: requiresDetail ? detail.trim() : undefined,
        dataSolicitada: date,
        observacao: observation.trim() || undefined,
        prioridade: priority === 'urgente' ? 'URGENTE' : 'NORMAL',
      });

      onCreated(guide);
      onClose();
    } catch (requestError) {
      setSubmitError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível gerar a guia. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = type === 'consulta' ? 'Nova consulta' : type === 'retorno' ? 'Novo retorno' : type === 'exame' ? 'Novo exame' : 'Novo encaminhamento';

  return (
    <dialog
      ref={dialogRef}
      className="schedule-modal"
      aria-labelledby="schedule-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isSubmitting) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="schedule-modal__panel">
        <header className="schedule-modal__header">
          <div>
            <p className="schedule-modal__eyebrow">Nova guia assistencial</p>
            <h2 id="schedule-modal-title">{title}</h2>
            <p>O médico registra a solicitação e a guia fica disponível para a recepção/enfermagem agendar.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="dashboard-icon-button"
            aria-label="Fechar janela"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <div className="schedule-modal__types" role="tablist" aria-label="Tipo de guia">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={type === option.value}
              className={['schedule-type', type === option.value && 'schedule-type--active'].filter(Boolean).join(' ')}
              onClick={() => {
                setType(option.value);
                setDetail('');
                setSubmitError('');
              }}
              disabled={isSubmitting}
            >
              <MaterialIcon name={option.icon} size={18} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="patient-form-section">
            <legend>Dados do paciente</legend>
            <div className="schedule-form__grid">
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="schedule-patient-name">Nome completo</label>
                <input id="schedule-patient-name" className="ui-field__input" value={patient?.name ?? ''} readOnly />
              </div>

              <div className="ui-field">
                <label className="ui-field__label" htmlFor="schedule-patient-cpf">CPF</label>
                <div className="patient-cpf-field">
                  <input
                    id="schedule-patient-cpf"
                    className="ui-field__input"
                    inputMode="numeric"
                    value={formatCpf(cpfDraft)}
                    readOnly={!editingCpf}
                    onChange={(event) => handleCpfChange(event.target.value)}
                    aria-invalid={Boolean(cpfError)}
                    aria-describedby={cpfError ? 'schedule-cpf-error' : undefined}
                  />
                  <button
                    type="button"
                    className="dashboard-icon-button"
                    aria-label={editingCpf ? 'Cancelar edição do CPF' : 'Alterar CPF do paciente'}
                    title={editingCpf ? 'Cancelar edição' : 'Alterar CPF'}
                    onClick={() => {
                      if (editingCpf) {
                        setCpfDraft(patient?.cpf ?? '');
                        setCpfError('');
                      }
                      setEditingCpf((current) => !current);
                    }}
                    disabled={isSubmitting}
                  >
                    <MaterialIcon name={editingCpf ? 'close' : 'edit'} size={18} />
                  </button>
                  {editingCpf && (
                    <button type="button" className="dashboard-button dashboard-button--secondary" onClick={applyCpf} disabled={isSubmitting}>
                      <MaterialIcon name="search" size={16} />
                      Aplicar
                    </button>
                  )}
                </div>
                {cpfError && <p id="schedule-cpf-error" className="ui-field__error" role="alert">{cpfError}</p>}
              </div>

              <div className="ui-field">
                <label className="ui-field__label" htmlFor="schedule-patient-birth">Data de nascimento</label>
                <input id="schedule-patient-birth" className="ui-field__input" value={patient ? formatBirthDate(patient.birthDate) : ''} readOnly />
              </div>
            </div>
          </fieldset>

          <div className="schedule-form__grid">
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="schedule-date">Data solicitada</label>
              <input
                id="schedule-date"
                className="ui-field__input"
                type="date"
                min={todayIsoDate()}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSubmitError('');
                }}
                required
              />
              <p className="ui-field__hint">A data de hoje ({new Intl.DateTimeFormat('pt-BR').format(new Date())}) ou uma data futura.</p>
            </div>

            {type === 'consulta' && (
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="schedule-consultation-specialty">Especialidade da consulta</label>
                <select
                  id="schedule-consultation-specialty"
                  className="ui-field__input ui-field__select"
                  value={specialty}
                  onChange={(event) => {
                    setSpecialty(event.target.value as ConsultationSpecialty);
                    setSubmitError('');
                  }}
                  required
                >
                  <option value="" disabled>Selecione a especialidade</option>
                  {Object.entries(specialtyLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="ui-field__hint">Informe a especialidade médica responsável pela consulta.</p>
              </div>
            )}

            {type === 'encaminhamento' && (
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="schedule-detail">{detailLabels.encaminhamento}</label>
                <select
                  id="schedule-detail"
                  className="ui-field__input ui-field__select"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  required
                >
                  <option value="" disabled>Selecione a especialidade</option>
                  {specialtyOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            )}

            {type === 'exame' && (
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="schedule-detail">{detailLabels.exame}</label>
                <select
                  id="schedule-detail"
                  className="ui-field__input ui-field__select"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  required
                >
                  <option value="" disabled>Selecione o exame</option>
                  {examGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((exam) => <option key={exam} value={exam}>{exam}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <div className="ui-field">
              <label className="ui-field__label" htmlFor="schedule-priority">Prioridade</label>
              <select
                id="schedule-priority"
                className="ui-field__input ui-field__select"
                value={priority}
                onChange={(event) => setPriority(event.target.value as 'normal' | 'urgente')}
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="ui-field schedule-form__full">
              <label className="ui-field__label" htmlFor="schedule-observation">Observação</label>
              <textarea
                id="schedule-observation"
                className="ui-field__input schedule-modal__textarea"
                value={observation}
                placeholder="Registre uma observação relevante para a equipe responsável pelo agendamento."
                onChange={(event) => setObservation(event.target.value)}
                rows={4}
              />
            </div>
          </div>

          {submitError && <p className="ui-field__error schedule-modal__error" role="alert">{submitError}</p>}

          <div className="schedule-modal__summary" aria-live="polite">
            <span className="schedule-modal__summary-icon" aria-hidden="true"><MaterialIcon name="assignment_turned_in" size={18} /></span>
            <p>
              {patient
                ? `${patient.name} · ${formatCpf(patient.cpf)} · ${buildTitle(type, detail, specialty)} · guia para agendamento`
                : 'Paciente não identificado.'}
            </p>
          </div>

          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              <MaterialIcon name="check" size={18} />
              {isSubmitting ? 'Gerando guia...' : 'Salvar registro'}
            </Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
