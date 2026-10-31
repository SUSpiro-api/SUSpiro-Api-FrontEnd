
interface GuideQueueEmptyProps {
  hasGuides: boolean;
}

export function GuideQueueEmpty({ hasGuides }: GuideQueueEmptyProps) {
  const message = hasGuides
    ? 'Nenhuma guia corresponde aos filtros selecionados.'
    : 'Nenhuma guia aguardando agendamento.';

  return (
    <div className="dashboard-empty guide-queue-empty">
      <p>{message}</p>
      <span>Novas guias geradas pelos médicos aparecerão automaticamente nesta central.</span>
    </div>
  );
}
