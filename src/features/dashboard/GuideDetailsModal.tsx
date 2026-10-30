import { useDialog } from '../../hooks/useDialog';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { formatIsoDate, guidePriorityLabels, guideStatusLabels, guideTypeLabels, guideDetail } from './guideLabels';
import type { RecentActivity } from './hooks/useDashboardOverview';
import type { ClinicalRecord } from './types';

interface GuideDetailsModalProps {
  activity: RecentActivity | null;
  onClose: () => void;
}

function safeDateTime(value: string | null | undefined): string {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function valueOrFallback(value: string | null | undefined): string {
  return value?.trim() || 'Não informado';
}

function recordTypeLabel(record: ClinicalRecord): string {
  const labels: Record<ClinicalRecord['type'], string> = {
    consulta: 'Consulta',
    retorno: 'Retorno',
    exame: 'Exame',
    encaminhamento: 'Encaminhamento',
  };
  return labels[record.type];
}

export function GuideDetailsModal({ activity, onClose }: GuideDetailsModalProps) {
  const dialog = useDialog({ isOpen: Boolean(activity), focusSelector: '[aria-label=\"Fechar detalhes\"]', onClose });
  const guide = activity?.record.guide;
  const record = activity?.record;

  return (
    <dialog
      ref={dialog.dialogRef}
      className="schedule-modal guide-details-modal"
      aria-labelledby="guide-details-title"
      onCancel={dialog.handleCancel}
      onClick={dialog.handleDialogClick}
    >
      {activity && record && (
        <div className="schedule-modal__panel guide-details-modal__panel">
          <header className="schedule-modal__header">
            <div>
              <p className="guide-details-modal__eyebrow">Detalhes da guia</p>
              <h2 id="guide-details-title">{guide ? guideTypeLabels[guide.tipo] : recordTypeLabel(record)}</h2>
              <p>{activity.patientName}</p>
            </div>
            <button type="button" className="ui-icon-button" aria-label="Fechar detalhes" onClick={onClose}>
              <MaterialIcon name="close" size={20} />
            </button>
          </header>

          <div className="guide-details-modal__body">
            <div className="guide-details-modal__badges">
              <span className={`activity-item__status activity-item__status--${record.status}`}>
                {guide?.status ? guideStatusLabels[guide.status] : record.status}
              </span>
              <span className={`guide-queue-item__priority guide-queue-item__priority--${record.priority}`}>
                {guide?.prioridade ? guidePriorityLabels[guide.prioridade] : record.priority}
              </span>
            </div>

            <dl className="guide-details-grid">
              <div><dt>Protocolo</dt><dd>{valueOrFallback(guide?.protocolo)}</dd></div>
              <div><dt>Tipo</dt><dd>{guide ? guideTypeLabels[guide.tipo] : record.type}</dd></div>
              <div><dt>Descrição</dt><dd>{guide ? guideDetail(guide) : record.title}</dd></div>
              <div><dt>Data solicitada</dt><dd>{formatIsoDate(record.date)}</dd></div>
              <div><dt>Data agendada</dt><dd>{formatIsoDate(guide?.dataAgendamento ?? record.scheduledDate)}</dd></div>
              <div><dt>Horário</dt><dd>{valueOrFallback(guide?.horaAgendamento ?? record.time)}</dd></div>
              <div><dt>Profissional solicitante</dt><dd>{valueOrFallback(guide?.solicitanteNome)}</dd></div>
              <div><dt>Solicitada em</dt><dd>{safeDateTime(guide?.criadoEm)}</dd></div>
              <div><dt>Unidade</dt><dd>{valueOrFallback(guide?.estabelecimentoNome)}</dd></div>
              <div className="guide-details-grid__wide"><dt>Endereço</dt><dd>{valueOrFallback(guide?.estabelecimentoEndereco)}</dd></div>
              <div><dt>Cidade / UF</dt><dd>{[guide?.estabelecimentoCidade, guide?.estabelecimentoEstado].filter(Boolean).join(' / ') || 'Não informado'}</dd></div>
              <div><dt>Agendado por</dt><dd>{valueOrFallback(guide?.agendadoPorNome)}</dd></div>
              <div className="guide-details-grid__wide"><dt>Observações</dt><dd>{valueOrFallback(guide?.observacao ?? record.observation)}</dd></div>
            </dl>
          </div>

          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" onClick={onClose}>Fechar</Button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
