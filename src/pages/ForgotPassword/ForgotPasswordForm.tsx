import { useState } from 'react';
import { validateResetCpf } from '../../features/auth/validation';
import { getPasswordResetErrorMessage } from '../../features/auth/errorMessages';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { formatCpf } from '../../utils/cpf';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSubmit: (cpf: string) => Promise<void>;
}

export function ForgotPasswordForm({ onBack, onSubmit }: ForgotPasswordFormProps) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cpfError = validateResetCpf(cpf);
    setError(cpfError);
    setFormError('');

    if (cpfError) return;

    setIsSubmitting(true);

    try {
      await onSubmit(cpf);
    } catch (submitError) {
      setFormError(getPasswordResetErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="login-recovery" aria-labelledby="forgot-password-title">
      <header>
        <h1 id="forgot-password-title" className="login-login-form__title">
          Esqueceu sua senha?
        </h1>
        <p className="login-login-form__subtitle">
          Informe seu CPF. Enviaremos uma senha provisória para o e-mail cadastrado.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate aria-label="Recuperação de senha">
        <TextField
          label="CPF"
          placeholder="000.000.000-00"
          autoComplete="username"
          inputMode="numeric"
          maxLength={14}
          value={cpf}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'cpf-error' : undefined}
          onChange={(event) => {
            setCpf(formatCpf(event.target.value));
            setError('');
            setFormError('');
          }}
        />

        {error && (
          <p id="cpf-error" className="login-field__error" role="alert">
            {error}
          </p>
        )}

        {formError && (
          <p className="login-form-error" role="alert">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="login-login-form__submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
        </Button>

        <button
          type="button"
          className="login-link login-link--button login-link--back"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Voltar para o login
        </button>
      </form>
    </article>
  );
}
