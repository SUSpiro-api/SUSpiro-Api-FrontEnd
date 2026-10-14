// Mostra o histórico de registros do paciente.

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { MaterialIcon, type MaterialIconName } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import type { ClinicalRecord, ClinicalRecordType, Patient } from './types';

type Tab = 'todos' | ClinicalRecordType;

interface ClinicalRecordListProps {
  records: ClinicalRecord[];
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

const typeIcons: Record<ClinicalRecordType, MaterialIconName> = {
  consulta: 'calendar',
  retorno: 'medical_services',
  exame: 'science',
  encaminhamento: 'description',
};

const tabs = Object.keys(labels) as Tab[];

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  );
}

export function ClinicalRecordList({ records, selectedPatient, onCreate }: ClinicalRecordListProps) {
  const [tab, setTab] = useState<Tab>('todos');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const scopedRecords = useMemo(
    () => selectedPatient ? records.filter((item) => item.patientId === selectedPatient.id) : records,
    [records, selectedPatient],
  );

  const visibleRecords = useMemo(() => {
    return [...scopedRecords]
      .filter((item) => tab === 'todos' || item.type === tab)
      .sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`));
  }, [scopedRecords, tab]);

  const countByTab = useMemo(() => {
    const counts = { todos: scopedRecords.length, consulta: 0, retorno: 0, exame: 0, encaminhamento: 0 } as Record<Tab, number>;
    for (const record of scopedRecords) counts[record.type] += 1;
    return counts;
  }, [scopedRecords]);

  // As setas do teclado deixam trocar de aba sem usar o mouse.
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Partial<Record<string, number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: -index,
      End: tabs.length - 1 - index,
    };
    const move = moves[event.key];
    if (move === undefined) return;

    event.preventDefault();
    const next = tabs[(index + move + tabs.length) % tabs.length];
    setTab(next);
    tabRefs.current[tabs.indexOf(next)]?.focus();
  };

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
        {tabs.map((item, index) => (
          <button
            key={item}
            ref={(element) => { tabRefs.current[index] = element; }}
            type="button"
            role="tab"
            aria-selected={tab === item}
            tabIndex={tab === item ? 0 : -1}
            className={['dashboard-tab', tab === item && 'dashboard-tab--active'].filter(Boolean).join(' ')}
            onClick={() => setTab(item)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {labels[item]}
            <span className="dashboard-tab__count" aria-hidden="true">{countByTab[item]}</span>
          </button>
        ))}
      </div>

      {visibleRecords.length > 0 ? (
        <ul className="appointment-list">
          {visibleRecords.map((record) => (
            <li className="appointment" key={record.id}>
              <div className="appointment__type" aria-hidden="true">
                <MaterialIcon name={typeIcons[record.type]} size={20} />
              </div>
              <div className="appointment__info">
                <strong>{record.title}</strong>
                <span>
                  {typeLabels[record.type]} · {formatDate(record.date)}
                  {record.time ? ` · ${record.time}` : ''}
                </span>
                {record.observation && <small>{record.observation}</small>}
              </div>
              <span className={`appointment__status appointment__status--${record.status}`}>
                {statusLabels[record.status]}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-empty">Nenhum registro encontrado nesta categoria.</p>
      )}
    </section>
  );
}
