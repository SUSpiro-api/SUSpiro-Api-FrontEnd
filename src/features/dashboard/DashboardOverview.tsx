// Mostra um resumo dos atendimentos e pacientes.

import { MaterialIcon, type MaterialIconName } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import type { ClinicalRecord, Patient } from './types';

interface DashboardOverviewProps {
  records: ClinicalRecord[];
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenPatientSearch: () => void;
}

const typeLabels: Record<ClinicalRecord['type'], string> = {
  consulta: 'Consulta',
  retorno: 'Retorno',
  exame: 'Exame',
  encaminhamento: 'Encaminhamento',
};

const typeIcons: Record<ClinicalRecord['type'], MaterialIconName> = {
  consulta: 'calendar',
  retorno: 'medical_services',
  exame: 'science',
  encaminhamento: 'description',
};

const statusLabels: Record<ClinicalRecord['status'], string> = {
  agendado: 'Agendado',
  pendente: 'Pendente',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
    new Date(`${date}T12:00:00`),
  );
}

function getRecentPatients(records: ClinicalRecord[], patients: Patient[]): Patient[] {
  const latestByPatient = new Map<number, string>();

  [...records]
    .sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`))
    .forEach((record) => {
      if (!latestByPatient.has(record.patientId)) {
        latestByPatient.set(record.patientId, `${record.date}${record.time ?? ''}`);
      }
    });

  return [...latestByPatient.entries()]
    .sort(([, a], [, b]) => b.localeCompare(a))
    .map(([patientId]) => patients.find((patient) => patient.id === patientId))
    .filter((patient): patient is Patient => Boolean(patient))
    .slice(0, 5);
}

export function DashboardOverview({ records, patients, onSelectPatient, onOpenPatientSearch }: DashboardOverviewProps) {
  const recentRecords = [...records]
    .sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`))
    .slice(0, 6);

  const recentPatients = getRecentPatients(records, patients);

  return (
    <section className="dashboard-overview" aria-labelledby="dashboard-overview-title">
      <h2 id="dashboard-overview-title" className="sr-only">Visão inicial do atendimento</h2>

      <div className="dashboard-overview__grid">
        <section id="atividade-recente" className="dashboard-card dashboard-overview__activity" aria-labelledby="activity-title">
          <header className="dashboard-card__header">
            <div>
              <h2 id="activity-title" className="dashboard-card__title">Atividade recente</h2>
              <p className="dashboard-card__subtitle">Últimas guias e registros realizados no sistema.</p>
            </div>
          </header>

          {recentRecords.length > 0 ? (
            <ul className="activity-list">
              {recentRecords.map((record) => {
                const patient = patients.find((item) => item.id === record.patientId);
                return (
                  <li className="activity-item" key={record.id}>
                    <span className="activity-item__icon" aria-hidden="true">
                      <MaterialIcon name={typeIcons[record.type]} size={19} />
                    </span>
                    <div className="activity-item__content">
                      <strong>{typeLabels[record.type]} · {patient?.name ?? 'Paciente'}</strong>
                      <span>{record.title} · {formatDate(record.date)}</span>
                    </div>
                    <span className={`activity-item__status activity-item__status--${record.status}`}>
                      {statusLabels[record.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="dashboard-empty">Ainda não existem registros para exibir.</p>
          )}
        </section>

        <section id="ultimos-pacientes" className="dashboard-card dashboard-overview__patients" aria-labelledby="recent-patients-title">
          <header className="dashboard-card__header">
            <div>
              <h2 id="recent-patients-title" className="dashboard-card__title">Últimos pacientes</h2>
              <p className="dashboard-card__subtitle">Retome rapidamente um atendimento recente.</p>
            </div>
          </header>

          {recentPatients.length > 0 ? (
            <ul className="recent-patient-list">
              {recentPatients.map((patient) => (
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
          ) : (
            <div className="dashboard-empty dashboard-empty--compact">
              <p>Nenhum paciente recente.</p>
              <button type="button" className="dashboard-button dashboard-button--secondary" onClick={onOpenPatientSearch}>
                <MaterialIcon name="patients" size={17} />
                Atender paciente
              </button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
