// Mostra e valida o formulário de recuperação de senha.

import { useForgotPasswordForm } from './hooks/useForgotPasswordForm';
import { Button } from '../../components/Login/ui/Button';
import { TextField } from '../../components/Login/ui/TextField';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSubmit: (cpf: string) => Promise<void>;
}

export function ForgotPasswordForm({ onBack, onSubmit }: ForgotPasswordFormProps) {
  const form = useForgotPasswordForm({ onSubmit });

  return (
    <article className="login-recovery" aria-labelledby="forgot-password-title">
      <header>
        <h1 id="forgot-password-title" className="login-login-form__title">
          Esqueceu sua senha?
        </h1>
        <p className="login-login-form__subtitle">
          Informe seu CPF. Se ele estiver cadastrado, enviaremos as instruções para o e-mail associado.
        </p>
      </header>

      <form onSubmit={form.handleSubmit} noValidate aria-label="Recuperação de senha">
        <TextField
          label="CPF"
          placeholder="000.000.000-00"
          autoComplete="username"
          inputMode="numeric"
          maxLength={14}
          value={form.cpf}
          aria-invalid={Boolean(form.error)}
          aria-describedby={form.error ? 'cpf-error' : undefined}
          onChange={form.handleCpfChange}
        />

        {form.error && (
          <p id="cpf-error" className="login-field__error" role="alert">
            {form.error}
          </p>
        )}

        {form.formError && (
          <p className="login-form-error" role="alert">
            {form.formError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="login-login-form__submit"
          disabled={form.isSubmitting}
          aria-busy={form.isSubmitting}
        >
          {form.isSubmitting ? 'Enviando...' : 'Enviar instruções'}
        </Button>

        <button
          type="button"
          className="login-link login-link--button login-link--back"
          onClick={onBack}
          disabled={form.isSubmitting}
        >
          Voltar para o login
        </button>
      </form>
    </article>
  );
}
