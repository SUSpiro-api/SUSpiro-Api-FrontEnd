// Mostra os espaços enquanto a fila está carregando.

export function GuideQueueLoading() {
  return (
    <ul className="guide-queue-skeleton" role="status" aria-label="Carregando guias">
      {[0, 1, 2].map((row) => (
        <li key={row}>
          <span className="guide-queue-skeleton__block" aria-hidden="true" />
          <span className="guide-queue-skeleton__lines" aria-hidden="true">
            <span className="guide-queue-skeleton__line guide-queue-skeleton__line--lg" />
            <span className="guide-queue-skeleton__line guide-queue-skeleton__line--sm" />
          </span>
          <span className="guide-queue-skeleton__block guide-queue-skeleton__block--action" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}
