import { useDialog } from '../../hooks/useDialog';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { formatIsoDate, guideDetail, guideTypeLabels } from './guideLabels';
import type { Guide } from '../guides';

interface AppointmentSuccessModalProps {
  guide: Guide | null;
  onClose: () => void;
}

export function AppointmentSuccessModal({ guide, onClose }: AppointmentSuccessModalProps) {
  const dialog = useDialog({ isOpen: Boolean(guide), focusSelector: '[data-autofocus]', onClose });

  if (!guide) return null;

  const local = [guide.estabelecimentoNome, guide.estabelecimentoEndereco, guide.estabelecimentoCidade, guide.estabelecimentoEstado]
    .filter(Boolean).join(' · ') || 'Não informado';

  return (
    <dialog
      ref={dialog.dialogRef}
      className="appointment-success-modal"
      aria-labelledby="appointment-success-title"
      onCancel={dialog.handleCancel}
      onClick={dialog.handleDialogClick}
    >
      <div className="appointment-success-modal__panel">
        <div className="appointment-success-modal__icon" aria-hidden="true">
          <MaterialIcon name="check_circle" size={25} />
        </div>
        <h2 id="appointment-success-title">Atendimento agendado</h2>
        <p className="appointment-success-modal__intro">
          O agendamento foi registrado. Confira os dados antes de fechar esta janela.
        </p>

        <dl className="appointment-success-modal__details">
          <div><dt>Paciente</dt><dd>{guide.pacienteNome}</dd></div>
          <div><dt>Atendimento</dt><dd>{guideTypeLabels[guide.tipo]} · {guideDetail(guide)}</dd></div>
          <div><dt>Data</dt><dd>{guide.dataAgendamento ? formatIsoDate(guide.dataAgendamento) : 'Não informada'}</dd></div>
          <div><dt>Horário</dt><dd>{guide.horaAgendamento?.slice(0, 5) ?? 'Não informado'}</dd></div>
          <div><dt>Unidade</dt><dd>{local}</dd></div>
          <div><dt>Protocolo</dt><dd>{guide.protocolo ?? `#${guide.id}`}</dd></div>
        </dl>

        <p className="appointment-success-modal__note">
          A confirmação por e-mail depende da disponibilidade do serviço de envio e do endereço cadastrado.
        </p>
        <footer className="appointment-success-modal__footer">
          <Button type="button" data-autofocus onClick={onClose}>Fechar</Button>
        </footer>
      </div>
    </dialog>
  );
}
