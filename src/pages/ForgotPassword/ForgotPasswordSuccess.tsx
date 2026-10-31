
import { MaterialIcon } from '../../components/icons';

interface ForgotPasswordSuccessProps {
  onBack: () => void;
  mode?: 'request' | 'reset';
}

export function ForgotPasswordSuccess({ onBack, mode = 'request' }: ForgotPasswordSuccessProps) {
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
            {mode === 'reset' ? 'Senha alterada com sucesso' : 'Verifique seu e-mail'}
          </p>
          <p className="login-success-card__text">
            {mode === 'reset'
              ? 'Sua senha foi atualizada. Entre no SUSpiro usando a nova senha.'
              : 'Se o CPF estiver cadastrado, enviaremos um link de redefinição para o e-mail associado. O link expira em 30 minutos.'}
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
