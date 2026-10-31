
import { MaterialIcon } from '../../components/icons';

interface GuidesLoadNoticeProps {
  retrying: boolean;
  onRetry: () => void;
}

export function GuidesLoadNotice({ retrying, onRetry }: GuidesLoadNoticeProps) {
  return (
    <div className="guides-notice" role="status">
      <p className="guides-notice__message">
        <MaterialIcon name="warning" size={18} />
        <span>
          Guias geradas indisponíveis no momento.
          <small>Novas guias continuam sendo registradas normalmente.</small>
        </span>
      </p>
      <button
        type="button"
        className="dashboard-button dashboard-button--secondary dashboard-button--compact"
        onClick={onRetry}
        disabled={retrying}
      >
        <MaterialIcon name="refresh" size={16} className={retrying ? 'dashboard-button__icon--spin' : undefined} />
        {retrying ? 'Tentando…' : 'Tentar novamente'}
      </button>
    </div>
  );
}
