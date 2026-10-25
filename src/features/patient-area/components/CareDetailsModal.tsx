// Mostra os detalhes de um atendimento do paciente em uma janela.

import { useDialog } from '../../../hooks/useDialog';
import { MaterialIcon } from '../../../components/icons';
import { Button } from '../../../components/ui/Button';
import { formatIsoDate } from '../../dashboard/guideLabels';
import { careDisplayTitle, careStatusLabels, careTypeIcons, careTypeLabels, type CareItem, type CareStatus } from '../data';

interface CareDetailsModalProps {
  item: CareItem | null;
  onClose: () => void;
}

const statusHints: Record<CareStatus, string> = {
  agendado: 'Este atendimento já tem data e horário confirmados. Chegue com alguns minutos de antecedência.',
  pendente: 'A recepção da clínica vai definir a data e o horário. Assim que isso acontecer, o atendimento passa para "Próximos atendimentos".',
  realizado: 'Este atendimento já foi realizado.',
  cancelado: 'Esta guia foi cancelada pela unidade.',
  vencido: 'Esta solicitação venceu antes de ser agendada. Entre em contato com a unidade de saúde para obter orientação.',
};

function dateRow(item: CareItem): { label: string; value: string } {
  if (item.status === 'agendado') {
    return {
      label: 'Data e horário',
      value: formatIsoDate(item.date) + (item.time ? ` às ${item.time.slice(0, 5)}` : ''),
    };
  }
  if (item.status === 'pendente') {
    return { label: 'Data desejada', value: formatIsoDate(item.date) };
  }
  return { label: 'Data', value: formatIsoDate(item.date) + (item.time ? ` · ${item.time.slice(0, 5)}` : '') };
}

export function CareDetailsModal({ item, onClose }: CareDetailsModalProps) {
  const dialog = useDialog({ isOpen: Boolean(item), focusSelector: '[data-autofocus]', onClose });

  if (!item) {
    return <dialog ref={dialog.dialogRef} className="care-modal" aria-labelledby="care-modal-title" />;
  }

  const date = dateRow(item);

  return (
    <dialog
      ref={dialog.dialogRef}
      className="care-modal"
      aria-labelledby="care-modal-title"
      onCancel={dialog.handleCancel}
      onClick={dialog.handleDialogClick}
    >
      <div className="care-modal__panel">
        <header className="care-modal__top">
          <span className={['care-modal__icon', item.urgent && 'care-modal__icon--urgent'].filter(Boolean).join(' ')} aria-hidden="true">
            <MaterialIcon name={careTypeIcons[item.type]} size={22} />
          </span>
          <button
            type="button"
            className="ui-icon-button"
            aria-label="Fechar janela"
            onClick={onClose}
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <div className="care-modal__title-row">
          <h2 id="care-modal-title" className="care-modal__title">{careDisplayTitle(item)}</h2>
          <span className={`appointment__status appointment__status--${item.status}`}>{careStatusLabels[item.status]}</span>
          {item.urgent && <span className="appointment__status appointment__status--urgente">Urgente</span>}
        </div>

        <p className="care-modal__type"><strong>Tipo:</strong> {careTypeLabels[item.type]}</p>
        <p className="care-modal__hint">{statusHints[item.status]}</p>

        <dl className="care-modal__details">
          <div>
            <dt>{date.label}</dt>
            <dd>{date.value}</dd>
          </div>
          <div>
            <dt>Local de atendimento</dt>
            <dd>{item.location?.trim() || (item.status === 'pendente' ? 'A definir pela unidade' : 'A confirmar pela unidade')}</dd>
          </div>
          {item.professional && (
            <div>
              <dt>Profissional solicitante</dt>
              <dd>{item.professional}</dd>
            </div>
          )}
          {item.guideNumber !== undefined ? (
            <div>
              <dt>Código da guia</dt>
              <dd>GUIA-{item.guideNumber} (Nº {item.guideNumber})</dd>
            </div>
          ) : item.referenceCode ? (
            <div>
              <dt>{item.source === 'requisicao' ? 'Protocolo' : 'Código do registro'}</dt>
              <dd>{item.source === 'registro' ? `REG-${item.referenceCode}` : item.referenceCode}</dd>
            </div>
          ) : null}
        </dl>

        {item.note && (
          <p className="care-modal__obs">
            <strong>Observação:</strong> {item.note}
          </p>
        )}

        <footer className="care-modal__footer">
          <Button type="button" data-autofocus onClick={onClose}>Fechar</Button>
        </footer>
      </div>
    </dialog>
  );
}
