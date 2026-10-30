import { MaterialIcon } from '../../components/icons';
import { formatShortIsoDate } from '../../utils/date';
import type { RecentActivity } from './hooks/useDashboardOverview';
import type { ClinicalRecord } from './types';

interface RecentActivityListProps {
  activities: RecentActivity[];
  onSelectActivity: (activity: RecentActivity) => void;
}

const typeLabels: Record<ClinicalRecord['type'], string> = {
  consulta: 'Consulta',
  retorno: 'Retorno',
  exame: 'Exame',
  encaminhamento: 'Encaminhamento',
};

const statusLabels: Record<ClinicalRecord['status'], string> = {
  agendado: 'Agendado',
  pendente: 'Pendente',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
};

export function RecentActivityList({ activities, onSelectActivity }: RecentActivityListProps) {
  if (activities.length === 0) {
    return <p className="dashboard-empty">Ainda não existem registros para exibir.</p>;
  }

  return (
    <ul className="activity-list">
      {activities.map((activity) => {
        const { record, patientName } = activity;
        return (
          <li className="activity-item" key={record.id}>
            <button
              type="button"
              className="activity-item__trigger"
              onClick={() => onSelectActivity(activity)}
              aria-label={`Ver detalhes: ${typeLabels[record.type]} de ${patientName}`}
            >
              <span className="activity-item__content">
                <strong>{typeLabels[record.type]} · {patientName}</strong>
                <span>{record.title} · {formatShortIsoDate(record.date)}</span>
              </span>
              <span className={`activity-item__status activity-item__status--${record.status}`}>
                {statusLabels[record.status]}
              </span>
              <MaterialIcon name="chevron_right" size={18} className="activity-item__arrow" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
