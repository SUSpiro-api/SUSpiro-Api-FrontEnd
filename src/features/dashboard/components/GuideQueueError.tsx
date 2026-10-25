// Mostra o erro ao carregar a fila e permite tentar novamente.

import { MaterialIcon } from '../../../components/icons';

interface GuideQueueErrorProps {
  message: string;
  onRetry: () => void;
}

export function GuideQueueError({ message, onRetry }: GuideQueueErrorProps) {
  return (
    <div className="guide-queue-error" role="alert">
      <p className="guide-queue-error__message">
        <MaterialIcon name="error" size={20} />
        {message}
      </p>
      <button
        type="button"
        className="dashboard-button dashboard-button--secondary"
        onClick={onRetry}
      >
        Tentar novamente
      </button>
    </div>
  );
}
