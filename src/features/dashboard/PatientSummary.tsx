// Mostra os dados principais do paciente selecionado.

import { MaterialIcon } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import type { Patient } from './types';

interface PatientSummaryProps {
  patient: Patient;
  onChangePatient: () => void;
  onClearPatient: () => void;
}

function formatBirthDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`));
}

export function PatientSummary({ patient, onChangePatient, onClearPatient }: PatientSummaryProps) {
  return (
    <section className="patient-context" aria-labelledby="patient-context-title">
      <div className="patient-context__icon" aria-hidden="true">
        <MaterialIcon name="person" size={24} />
      </div>
      <div className="patient-context__info">
        <h2 id="patient-context-title">{patient.name}</h2>
        <dl className="patient-context__details">
          <div><dt>CPF</dt><dd>{formatCpf(patient.cpf)}</dd></div>
          <div><dt>Nascimento</dt><dd>{formatBirthDate(patient.birthDate)}</dd></div>
        </dl>
      </div>
      <div className="patient-context__actions">
        <button type="button" className="dashboard-button dashboard-button--secondary" onClick={onChangePatient}>
          <MaterialIcon name="search" size={17} />
          Trocar paciente
        </button>
        <button type="button" className="patient-context__clear" onClick={onClearPatient}>Limpar paciente</button>
      </div>
    </section>
  );
}
