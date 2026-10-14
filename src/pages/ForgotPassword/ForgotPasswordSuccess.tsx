// Mostra a confirmação do pedido de recuperação de senha.

import { MaterialIcon } from '../../components/icons';

interface ForgotPasswordSuccessProps {
  onBack: () => void;
}

export function ForgotPasswordSuccess({ onBack }: ForgotPasswordSuccessProps) {
  return (
    <article
      className="login-recovery login-recovery--success"
      aria-labelledby="recovery-success-title"
    >
      <div className="login-success-card" role="status">
        <div className="login-success-card__icon" aria-hidden="true">
          <MaterialIcon name="check" size={22} />
        </div>

        <div className="login-success-card__body">
          <p id="recovery-success-title" className="login-success-card__title">
            Verifique seu e-mail
          </p>
          <p className="login-success-card__text">
            Se o CPF estiver cadastrado, as instruções de redefinição foram enviadas para o e-mail associado.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="login-link login-link--button login-link--back"
        onClick={onBack}
      >
        Voltar para o login
      </button>
    </article>
  );
}
