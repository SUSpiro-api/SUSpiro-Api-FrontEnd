import { useDialog } from '../../hooks/useDialog';
import { Button } from '../../components/ui/Button';
import { formatIsoDate, guidePriorityLabels, guideStatusLabels, guideTypeLabels, specialtyLabel } from './guideLabels';
import type { Guide } from '../guides';

interface GuideSuccessModalProps {
  guide: Guide | null;
  onClose: () => void;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export function GuideSuccessModal({ guide, onClose }: GuideSuccessModalProps) {
  const dialog = useDialog({ isOpen: Boolean(guide), focusSelector: '[data-autofocus]', onClose });

  if (!guide) {
    return (
      <dialog ref={dialog.dialogRef} className="guide-success-modal" aria-labelledby="guide-success-title" />
    );
  }

  const detail = guide.tipo === 'CONSULTA'
    ? guide.especialidade ? specialtyLabel(guide.especialidade) : 'Consulta'
    : guide.detalhe ?? guideTypeLabels[guide.tipo];

  return (
    <dialog
      ref={dialog.dialogRef}
      className="guide-success-modal"
      aria-labelledby="guide-success-title"
      onCancel={dialog.handleCancel}
      onClick={dialog.handleDialogClick}
    >
      <div className="guide-success-modal__panel">
        <h2 id="guide-success-title">Guia gerada com sucesso</h2>
        <p className="guide-success-modal__number">
          {guide.sincronizacaoPendente ? 'Guia registrada neste dispositivo' : `Protocolo ${guide.protocolo ?? `#${guide.id}`}`}
        </p>
        <p className="guide-success-modal__description">
          {guide.sincronizacaoPendente
            ? 'A guia foi registrada e já está na fila de agendamento e no histórico do paciente. Ela será enviada ao servidor automaticamente assim que a conexão estiver disponível.'
            : 'A guia foi salva e encaminhada para a fila de agendamento da recepção e enfermagem e para o histórico do paciente.'}
        </p>

        <dl className="guide-success-modal__details">
          <div>
            <dt>Paciente</dt>
            <dd>{guide.pacienteNome}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{guideTypeLabels[guide.tipo]}</dd>
          </div>
          <div>
            <dt>Solicitação</dt>
            <dd>{detail}</dd>
          </div>
          <div>
            <dt>Data solicitada</dt>
            <dd>{formatIsoDate(guide.dataSolicitada)}</dd>
          </div>
          <div>
            <dt>Prioridade</dt>
            <dd>{guidePriorityLabels[guide.prioridade]}</dd>
          </div>
          <div>
            <dt>Situação</dt>
            <dd>{guideStatusLabels[guide.status]}</dd>
          </div>
          <div>
            <dt>Solicitante</dt>
            <dd>{guide.solicitanteNome}</dd>
          </div>
          <div>
            <dt>Gerada em</dt>
            <dd>{formatCreatedAt(guide.criadoEm)}</dd>
          </div>
          {guide.observacao && (
            <div className="guide-success-modal__wide">
              <dt>Observação</dt>
              <dd>{guide.observacao}</dd>
            </div>
          )}
        </dl>

        <footer className="schedule-modal__footer">
          <Button type="button" data-autofocus onClick={onClose}>Fechar</Button>
        </footer>
      </div>
    </dialog>
  );
}
