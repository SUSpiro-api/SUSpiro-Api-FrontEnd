// Mostra os campos e botões do formulário de login.

import { useLoginSubmission } from './hooks/useLoginSubmission';
import { TextField } from './ui/TextField';
import { PasswordField } from './ui/PasswordField';
import { Toggle } from './ui/Toggle';
import { Button } from './ui/Button';
import { MaterialIcon } from '../icons';
import type { LoginFormProps } from './types';
import type { LoginFieldErrors } from '../../features/auth/useLoginForm';
import { formatCpf } from '../../utils/cpf';

interface Props extends LoginFormProps {
  fieldErrors: LoginFieldErrors;
}

export function LoginForm({
  values,
  fieldErrors,
  onChange,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}: Props) {
  const { formError, isSubmitting, handleSubmit } = useLoginSubmission(onSubmit);

  return (
    <article className="login-login-form" aria-labelledby="login-form-title">
      <header>
        <h1 id="login-form-title" className="login-login-form__title">
          Bem-vindo(a) de volta ao SUSpiro
        </h1>
        <p className="login-login-form__subtitle">
          Gerencie solicitações, agendamentos e reagendamentos de consultas e exames em um só lugar.
        </p>
      </header>

      <form onSubmit={(event) => void handleSubmit(event, values)} noValidate aria-label="Formulário de autenticação">
        <TextField
          label="CPF"
          placeholder="000.000.000-00"
          autoComplete="username"
          inputMode="numeric"
          maxLength={14}
          required
          aria-invalid={Boolean(fieldErrors.cpf)}
          aria-describedby={fieldErrors.cpf ? 'login-cpf-error' : undefined}
          startIcon={<MaterialIcon name="person" size={18} />}
          value={values.cpf}
          onChange={(event) => onChange('cpf', formatCpf(event.target.value))}
        />
        {fieldErrors.cpf && (
          <p id="login-cpf-error" className="login-field__error" role="alert">
            {fieldErrors.cpf}
          </p>
        )}

        <PasswordField
          label="Senha de acesso"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
        />
        {fieldErrors.password && (
          <p id="login-password-error" className="login-field__error" role="alert">
            {fieldErrors.password}
          </p>
        )}

        <div className="login-login-form__row login-login-form__row--end">
          <button
            type="button"
            className="login-link login-link--button"
            onClick={onForgotPassword}
            disabled={!onForgotPassword || isSubmitting}
          >
            Esqueceu a senha?
          </button>
        </div>

        {formError && (
          <p className="login-form-error" role="alert">
            {formError}
          </p>
        )}

        <section
          className="login-login-form__row login-login-form__row--spaced"
          aria-label="Opções de sessão"
        >
          <Toggle
            label="Lembrar CPF"
            checked={values.rememberCpf}
            onChange={(checked) => onChange('rememberCpf', checked)}
            disabled={isSubmitting}
          />
        </section>

        <Button
          type="submit"
          variant="primary"
          className="login-login-form__submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>

        {onCreateAccount && (
          <p className="login-login-form__footer-note">
            Ainda não tem uma conta?{' '}
            <button
              type="button"
              className="login-link login-link--button"
              onClick={onCreateAccount}
              disabled={isSubmitting}
            >
              Criar conta
            </button>
          </p>
        )}

        <p className="login-login-form__footer-note">
          Ambiente restrito e seguro do SUSpiro.
        </p>
      </form>
    </article>
  );
}
