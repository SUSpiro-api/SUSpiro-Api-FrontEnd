import { MaterialIcon } from '../../components/icons';
import type { ClinicalRecord, Patient } from './types';

interface PendingListProps {
  records: ClinicalRecord[];
  patient: Patient | null;
}

const typeLabels = {
  consulta: 'Consulta',
  retorno: 'Retorno',
  exame: 'Exame',
  encaminhamento: 'Encaminhamento',
} as const;

export function PendingList({ records, patient }: PendingListProps) {
  const pending = records
    .filter((record) => record.status === 'pendente')
    .sort((a, b) => Number(b.priority === 'urgente') - Number(a.priority === 'urgente'))
    .slice(0, 4);

  return (
    <section className="dashboard-card" aria-labelledby="pendencias-title">
      <header className="dashboard-card__header">
        <div>
          <h2 id="pendencias-title" className="dashboard-card__title">{patient ? 'Pendências do paciente' : 'Pendências clínicas'}</h2>
          <p className="dashboard-card__subtitle">{patient ? 'Itens que ainda precisam de ação.' : 'O que exige acompanhamento agora.'}</p>
        </div>
      </header>

      {pending.length > 0 ? (
        <ul className="pending-list">
          {pending.map((record) => (
            <li
              key={record.id}
              className={['pending-item', record.priority === 'urgente' && 'pending-item--urgent'].filter(Boolean).join(' ')}
            >
              <span className="pending-item__icon" aria-hidden="true">
                <MaterialIcon name={record.type === 'exame' ? 'science' : record.type === 'encaminhamento' ? 'description' : 'warning'} size={18} />
              </span>
              <span className="pending-item__content">
                <strong>{record.title}</strong>
                <small>{typeLabels[record.type]} · {record.date.slice(8, 10)}/{record.date.slice(5, 7)}</small>
              </span>
              {record.priority === 'urgente' && <span className="pending-item__priority">Urgente</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-empty">Nenhuma pendência encontrada.</p>
      )}
    </section>
  );
}
