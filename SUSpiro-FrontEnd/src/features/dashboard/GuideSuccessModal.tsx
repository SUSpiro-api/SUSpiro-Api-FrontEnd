import { useEffect, useRef } from 'react';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { specialtyLabels, formatIsoDate, guideTypeLabels } from './guideLabels';
import type { Guide } from '../guides';

interface GuideSuccessModalProps {
  guide: Guide | null;
  onClose: () => void;
}

export function GuideSuccessModal({ guide, onClose }: GuideSuccessModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (guide && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus());
    }

    if (!guide && dialog.open) dialog.close();
  }, [guide]);

  if (!guide) {
    return (
      <dialog ref={dialogRef} className="guide-success-modal" aria-labelledby="guide-success-title" />
    );
  }

  const detail = guide.tipo === 'CONSULTA'
    ? guide.especialidade ? specialtyLabels[guide.especialidade] : 'Consulta'
    : guide.detalhe ?? guideTypeLabels[guide.tipo];

  return (
    <dialog
      ref={dialogRef}
      className="guide-success-modal"
      aria-labelledby="guide-success-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="guide-success-modal__panel">
        <div className="guide-success-modal__icon" aria-hidden="true">
          <MaterialIcon name="check_circle" size={36} />
        </div>
        <p className="schedule-modal__eyebrow">Solicitação registrada</p>
        <h2 id="guide-success-title">Guia gerada com sucesso</h2>
        <p className="guide-success-modal__description">
          A guia foi salva no sistema e encaminhada para a fila de agendamento da recepção e enfermagem.
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
        </dl>

        <footer className="schedule-modal__footer">
          <Button type="button" data-autofocus onClick={onClose}>Fechar</Button>
        </footer>
      </div>
    </dialog>
  );
}
