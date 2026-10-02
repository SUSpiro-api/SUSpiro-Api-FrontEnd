import { useMemo, useState } from 'react';
import { MaterialIcon } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import type { ClinicalRecord, ClinicalRecordType, Patient } from './types';

type Tab = 'todos' | ClinicalRecordType;

interface ClinicalRecordListProps {
  records: ClinicalRecord[];
  patients: Patient[];
  selectedPatient: Patient | null;
  onCreate: () => void;
}

const labels: Record<Tab, string> = {
  todos: 'Todos',
  consulta: 'Consultas',
  retorno: 'Retornos',
  exame: 'Exames',
  encaminhamento: 'Encaminhamentos',
};

const statusLabels = {
  agendado: 'Agendado',
  pendente: 'Pendente',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
} as const;

const typeLabels: Record<ClinicalRecordType, string> = {
  consulta: 'Consulta',
  retorno: 'Retorno',
  exame: 'Exame',
  encaminhamento: 'Encaminhamento',
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  );
}

export function ClinicalRecordList({ records, patients, selectedPatient, onCreate }: ClinicalRecordListProps) {
  const [tab, setTab] = useState<Tab>('todos');

  const visibleRecords = useMemo(() => {
    const scoped = selectedPatient ? records.filter((item) => item.patientId === selectedPatient.id) : records;
    return [...scoped]
      .filter((item) => tab === 'todos' || item.type === tab)
      .sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`));
  }, [records, selectedPatient, tab]);

  const title = selectedPatient ? `Histórico de ${selectedPatient.name}` : 'Atendimentos e pendências';
  const subtitle = selectedPatient
    ? `${formatCpf(selectedPatient.cpf)} · consulte o que está pendente e o que já foi realizado.`
    : 'Visão geral da agenda e dos registros que precisam de acompanhamento.';

  return (
    <section className="dashboard-card dashboard-records" aria-labelledby="records-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="records-title" className="dashboard-card__title">{title}</h2>
          <p className="dashboard-card__subtitle">{subtitle}</p>
        </div>
        <div className="dashboard-card__actions">
          <button type="button" className="dashboard-button dashboard-button--primary" onClick={onCreate}>
            <MaterialIcon name="add" size={17} />
            Novo registro
          </button>
        </div>
      </header>

      <div className="dashboard-tabs" role="tablist" aria-label="Filtrar registros">
        {(Object.keys(labels) as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={['dashboard-tab', tab === item && 'dashboard-tab--active'].filter(Boolean).join(' ')}
            onClick={() => setTab(item)}
          >
            {labels[item]}
          </button>
        ))}
      </div>

      {visibleRecords.length > 0 ? (
        <ul className="appointment-list">
          {visibleRecords.map((record) => {
            const patient = patients.find((item) => item.id === record.patientId);

            return (
              <li className="appointment" key={record.id}>
                <div className="appointment__type" aria-hidden="true">
                  <MaterialIcon
                    name={record.type === 'consulta' ? 'calendar' : record.type === 'retorno' ? 'medical_services' : record.type === 'exame' ? 'science' : 'description'}
                    size={20}
                  />
                </div>
                <div className="appointment__info">
                  <strong>{record.title}</strong>
                  <span>
                    {patient?.name ?? 'Paciente'} · {typeLabels[record.type]} · {formatDate(record.date)}
                    {record.time ? ` · ${record.time}` : ''}
                  </span>
                  {record.observation && <small>{record.observation}</small>}
                </div>
                <span className={`appointment__status appointment__status--${record.status}`}>
                  {statusLabels[record.status]}
                </span>
                <button type="button" className="dashboard-icon-button" aria-label={`Mais ações para ${record.title}`}>
                  <MaterialIcon name="more_vert" size={20} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="dashboard-empty">Nenhum registro encontrado nesta categoria.</p>
      )}
    </section>
  );
}
