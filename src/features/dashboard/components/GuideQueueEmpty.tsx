// Mostra uma mensagem quando a fila não tem guias para exibir.

import { MaterialIcon } from '../../../components/icons';

interface GuideQueueEmptyProps {
  hasGuides: boolean;
}

export function GuideQueueEmpty({ hasGuides }: GuideQueueEmptyProps) {
  const message = hasGuides
    ? 'Nenhuma guia corresponde aos filtros selecionados.'
    : 'Nenhuma guia aguardando agendamento.';

  return (
    <div className="dashboard-empty guide-queue-empty">
      <span className="guide-queue-empty__icon" aria-hidden="true">
        <MaterialIcon name="task_alt" size={28} />
      </span>
      <p>{message}</p>
      <span>Novas guias geradas pelos médicos aparecerão automaticamente nesta central.</span>
    </div>
  );
}
