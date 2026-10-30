import { MaterialIcon } from '../../components/icons';
import { initialsFromName } from '../../utils/initials';
import { formatCpf } from '../../utils/cpf';
import type { Patient } from './types';

interface RecentPatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenPatientSearch: () => void;
}

export function RecentPatientList({ patients, onSelectPatient, onOpenPatientSearch }: RecentPatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="dashboard-empty dashboard-empty--compact">
        <p>Nenhum paciente recente.</p>
        <button type="button" className="dashboard-button dashboard-button--secondary" onClick={onOpenPatientSearch}>
          Atender paciente
        </button>
      </div>
    );
  }

  return (
    <ul className="recent-patient-list">
      {patients.map((patient) => (
        <li key={patient.id}>
          <button
            type="button"
            className="recent-patient"
            onClick={() => onSelectPatient(patient)}
            aria-label={`Abrir atendimento de ${patient.name}`}
          >
            <span className="recent-patient__avatar" aria-hidden="true">
              {initialsFromName(patient.name) || '—'}
            </span>
            <span className="recent-patient__info">
              <strong>{patient.name}</strong>
              <small>{patient.cpf ? formatCpf(patient.cpf) : 'CPF não informado'}</small>
            </span>
            <MaterialIcon name="chevron_right" size={20} className="recent-patient__arrow" />
          </button>
        </li>
      ))}
    </ul>
  );
}
