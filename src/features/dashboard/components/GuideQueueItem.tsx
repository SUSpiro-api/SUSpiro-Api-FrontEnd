// Mostra uma guia de forma resumida e destaca as informações usadas no agendamento.

import { MaterialIcon } from '../../../components/icons';
import { formatCpf } from '../../../utils/cpf';
import type { Guide } from '../../guides';
import { formatIsoDate, guidePriorityLabels, guideTypeLabels, guideDetail } from '../guideLabels';

interface GuideQueueItemProps {
  guide: Guide;
  onSchedule: (guide: Guide) => void;
}

function getGuideIcon(guide: Guide): 'science' | 'description' | 'medical_services' | 'calendar' {
  if (guide.tipo === 'EXAME') return 'science';
  if (guide.tipo === 'ENCAMINHAMENTO') return 'description';
  if (guide.tipo === 'RETORNO') return 'medical_services';
  return 'calendar';
}

function safeDateLabel(value: string | null | undefined, fallback: string): string {
  const date = value?.slice(0, 10);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? formatIsoDate(date) : formatIsoDate(fallback);
}

export function GuideQueueItem({ guide, onSchedule }: GuideQueueItemProps) {
  const detail = guideDetail(guide);
  const isUrgent = guide.prioridade === 'URGENTE';
  const createdDate = safeDateLabel(guide.criadoEm, guide.dataSolicitada);
  const requestedDate = formatIsoDate(guide.dataSolicitada);
  const patientDetails = `${formatCpf(guide.pacienteCpf)} · ${detail}`;

  return (
    <li className={['guide-queue-item', isUrgent && 'guide-queue-item--urgent'].filter(Boolean).join(' ')}>
      <div className="guide-queue-item__icon" aria-hidden="true"><MaterialIcon name={getGuideIcon(guide)} size={20} /></div>
      <div className="guide-queue-item__content">
        <div className="guide-queue-item__title-row">
          <strong title={guide.pacienteNome}>{guide.pacienteNome}</strong>
          <span className={`guide-queue-item__priority guide-queue-item__priority--${isUrgent ? 'urgente' : 'normal'}`}>
            {guidePriorityLabels[guide.prioridade]}
          </span>
          <span className="guide-queue-item__reference">Guia nº {guide.id}</span>
        </div>
        <div className="guide-queue-item__tags">
          <span className="guide-queue-item__type">{guideTypeLabels[guide.tipo]}</span>
        </div>
        <span className="guide-queue-item__details" title={patientDetails}>{patientDetails}</span>
        <div className="guide-queue-item__meta">
          <span><strong>Solicitada em:</strong> {createdDate}</span>
          <span><strong>Data desejada:</strong> {requestedDate}</span>
          <span><strong>Profissional:</strong> {guide.solicitanteNome}</span>
        </div>
        {guide.observacao && <small className="guide-queue-item__obs" title={guide.observacao}>{guide.observacao}</small>}
      </div>
      <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => onSchedule(guide)}>
        <MaterialIcon name="event_available" size={17} /> Agendar
      </button>
    </li>
  );
}
