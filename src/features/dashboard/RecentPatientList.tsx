// Mostra os pacientes atendidos mais recentemente.

import { MaterialIcon } from '../../components/icons';
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
          <MaterialIcon name="patients" size={17} />
          Atender paciente
        </button>
      </div>
    );
  }

  return (
    <ul className="recent-patient-list">
      {patients.map((patient) => (
        <li key={patient.id}>
          <button type="button" className="recent-patient" onClick={() => onSelectPatient(patient)}>
            <span className="recent-patient__avatar" aria-hidden="true">
              <MaterialIcon name="person" size={18} />
            </span>
            <span className="recent-patient__info">
              <strong>{patient.name}</strong>
              <small>{formatCpf(patient.cpf)}</small>
            </span>
            <MaterialIcon name="chevron_right" size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
