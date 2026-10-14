// Mostra o formulário para criar um registro ou uma guia.

import { useEffect, useRef } from 'react';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { useScheduleForm } from './hooks/useScheduleForm';
import { GuideRequestFields } from './components/GuideRequestFields';
import { PatientFields } from './components/PatientFields';
import { ScheduleTypeTabs } from './components/ScheduleTypeTabs';
import type { Guide } from '../guides';
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

export function ScheduleModal({ open, initialType = 'consulta', patient, onClose, onCreated, findPatient, onPatientChange }: ScheduleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const form = useScheduleForm({ open, initialType, patient, onCreated, onClose, findPatient, onPatientChange });

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    // Coloca o foco no tipo de registro quando a janela abre.
    requestAnimationFrame(() => dialog.querySelector<HTMLButtonElement>('.schedule-type--active')?.focus());
  }, [open]);

  useEffect(() => {
    if (open) return;
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    previousFocusRef.current?.focus();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="schedule-modal"
      aria-labelledby="schedule-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!form.isSubmitting) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !form.isSubmitting) onClose();
      }}
    >
      <div className="schedule-modal__panel">
        <header className="schedule-modal__header">
          <div>
            <h2 id="schedule-modal-title">{form.title}</h2>
            <p>O médico registra a solicitação e a guia fica disponível para a recepção/enfermagem agendar.</p>
          </div>
          <button type="button" className="ui-icon-button" aria-label="Fechar janela" onClick={onClose} disabled={form.isSubmitting}>
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <ScheduleTypeTabs value={form.type} options={form.typeOptions} disabled={form.isSubmitting} onChange={form.onTypeChange} />

        <form onSubmit={form.handleSubmit} noValidate>
          <PatientFields
            patient={patient}
            cpfDraft={form.cpfDraft}
            editingCpf={form.editingCpf}
            cpfError={form.cpfError}
            disabled={form.isSubmitting}
            onCpfChange={form.handleCpfChange}
            onToggleEdit={() => form.setEditingCpf(true)}
            onCancelEdit={form.cancelCpfEdit}
            onApplyCpf={form.applyCpf}
          />

          <GuideRequestFields
            type={form.type}
            specialty={form.specialty}
            date={form.date}
            detail={form.detail}
            observation={form.observation}
            priority={form.priority}
            today={form.today}
            specialtyLabels={form.specialtyLabels}
            specialtyOptions={form.specialtyOptions}
            examGroups={form.examGroups}
            onSpecialty={form.setSpecialty}
            onDate={form.setDate}
            onDetail={form.setDetail}
            onObservation={form.setObservation}
            onPriority={form.setPriority}
          />

          {form.submitError && <p className="ui-field__error schedule-modal__error" role="alert">{form.submitError}</p>}

          <div className="schedule-modal__summary" aria-live="polite">
            <span className="schedule-modal__summary-icon" aria-hidden="true"><MaterialIcon name="assignment_turned_in" size={18} /></span>
            <p>{patient ? `${patient.name} · ${form.formatCpf(patient.cpf)} · ${form.selectedDetail} · guia para agendamento` : 'Paciente não identificado.'}</p>
          </div>

          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" onClick={onClose} disabled={form.isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
              <MaterialIcon name="check" size={18} />
              {form.isSubmitting ? 'Gerando guia...' : 'Salvar registro'}
            </Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
