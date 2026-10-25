// Mostra os dados principais do paciente selecionado.

import { formatCpf } from '../../utils/cpf';
import { ageFromIsoDate, formatIsoDate } from '../../utils/date';
import { initialsFromName } from '../../utils/initials';
import { MaterialIcon } from '../../components/icons';
import type { Patient } from './types';

interface PatientSummaryProps {
  patient: Patient;
  onChangePatient: () => void;
  onClearPatient: () => void;
}

export function PatientSummary({ patient, onChangePatient, onClearPatient }: PatientSummaryProps) {
  const initials = initialsFromName(patient.name);

  return (
    <section className="patient-context" aria-labelledby="patient-context-title">
      <div className="patient-context__icon" aria-hidden="true">
        {initials || <MaterialIcon name="person" size={24} />}
      </div>
      <div className="patient-context__info">
        <h2 id="patient-context-title">{patient.name}</h2>
        <dl className="patient-context__details">
          <div><dt>CPF</dt><dd>{formatCpf(patient.cpf)}</dd></div>
          <div><dt>Nascimento</dt><dd>{patient.birthDate ? `${formatIsoDate(patient.birthDate)} (${ageFromIsoDate(patient.birthDate)} anos)` : 'Não informado neste resumo'}</dd></div>
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
