import { MaterialIcon } from '../../components/icons';

interface PatientHistoryNoticeProps {
  retrying: boolean;
  onRetry: () => void;
}

export function PatientHistoryNotice({ retrying, onRetry }: PatientHistoryNoticeProps) {
  return (
    <div className="guides-notice" role="status">
      <p className="guides-notice__message">
        <MaterialIcon name="warning" size={18} />
        <span>
          Não foi possível carregar todo o histórico deste paciente.
          <small>O painel está exibindo as guias registradas por você até a conexão ser restabelecida.</small>
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
