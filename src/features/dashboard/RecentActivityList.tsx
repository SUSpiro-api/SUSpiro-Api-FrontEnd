// Mostra os últimos atendimentos registrados no sistema.

import { MaterialIcon, type MaterialIconName } from '../../components/icons';
import { formatShortIsoDate } from '../../utils/date';
import type { RecentActivity } from './hooks/useDashboardOverview';
import type { ClinicalRecord } from './types';

interface RecentActivityListProps {
  activities: RecentActivity[];
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

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return <p className="dashboard-empty">Ainda não existem registros para exibir.</p>;
  }

  return (
    <ul className="activity-list">
      {activities.map(({ record, patientName }) => (
        <li className="activity-item" key={record.id}>
          <span className="activity-item__icon" aria-hidden="true">
            <MaterialIcon name={typeIcons[record.type]} size={19} />
          </span>
          <div className="activity-item__content">
            <strong>{typeLabels[record.type]} · {patientName}</strong>
            <span>{record.title} · {formatShortIsoDate(record.date)}</span>
          </div>
          <span className={`activity-item__status activity-item__status--${record.status}`}>
            {statusLabels[record.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
