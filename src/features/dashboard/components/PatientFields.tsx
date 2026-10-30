import { MaterialIcon } from '../../../components/icons';
import { formatCpf } from '../../../utils/cpf';
import type { Patient } from '../types';

interface PatientFieldsProps {
  patient: Patient | null;
  cpfDraft: string;
  editingCpf: boolean;
  cpfError: string;
  disabled: boolean;
  onCpfChange: (value: string) => void;
  onToggleEdit: () => void;
  onCancelEdit: () => void;
  onApplyCpf: () => void;
}

function formatBirthDate(date?: string): string {
  if (!date) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`));
}

export function PatientFields({ patient, cpfDraft, editingCpf, cpfError, disabled, onCpfChange, onToggleEdit, onCancelEdit, onApplyCpf }: PatientFieldsProps) {
  return (
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
              onChange={(event) => onCpfChange(event.target.value)}
              aria-invalid={Boolean(cpfError)}
              aria-describedby={cpfError ? 'schedule-cpf-error' : undefined}
            />
            <button
              type="button"
              className="ui-icon-button"
              aria-label={editingCpf ? 'Cancelar edição do CPF' : 'Alterar CPF do paciente'}
              title={editingCpf ? 'Cancelar edição' : 'Alterar CPF'}
              onClick={() => editingCpf ? onCancelEdit() : onToggleEdit()}
              disabled={disabled}
            >
              <MaterialIcon name={editingCpf ? 'close' : 'edit'} size={18} />
            </button>
            {editingCpf && (
              <button type="button" className="dashboard-button dashboard-button--secondary" onClick={onApplyCpf} disabled={disabled}>
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
  );
}
