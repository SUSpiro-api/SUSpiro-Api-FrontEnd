import { useState } from 'react';
import { validateIdentifier, validatePassword } from '../../features/auth/validation';
import { getLoginErrorMessage } from '../../features/auth/errorMessages';
import { TextField } from '../ui/TextField';
import { PasswordField } from '../ui/PasswordField';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { MaterialIcon } from '../icons';
import { GovBrButton } from '../button/GovBrButton';
import type { LoginFormProps } from '../Login/types';
import { clearRememberedIdentifier, saveRememberedIdentifier } from '../../features/auth/storage';

type FieldErrors = Partial<Record<'identifier' | 'password', string>>;

export function LoginForm({
  values,
  onChange,
  onSubmit,
  onForgotPassword,
}: LoginFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: FieldErrors = {};
    const identifierError = validateIdentifier(values.identifier);
    const passwordError = validatePassword(values.password);

    if (identifierError) errors.identifier = identifierError;
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    setFormError('');

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit(values);

      if (values.rememberIdentifier) {
        saveRememberedIdentifier(values.identifier.trim());
      } else {
        clearRememberedIdentifier();
      }
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit} noValidate aria-label="Formulário de autenticação">
        <TextField
          label="E-mail ou CPF"
          placeholder="Digite seu e-mail ou CPF"
          autoComplete="username"
          inputMode="email"
          required
          aria-invalid={Boolean(fieldErrors.identifier)}
          aria-describedby={fieldErrors.identifier ? 'identifier-error' : undefined}
          startIcon={<MaterialIcon name="person" size={18} />}
          value={values.identifier}
          onChange={(event) => {
            onChange('identifier', event.target.value);
            if (fieldErrors.identifier) {
              setFieldErrors((previous) => ({ ...previous, identifier: undefined }));
            }
          }}
        />
        {fieldErrors.identifier && (
          <p id="identifier-error" className="login-field__error" role="alert">
            {fieldErrors.identifier}
          </p>
        )}

        <PasswordField
          label="Senha de Acesso"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          value={values.password}
          onChange={(event) => {
            onChange('password', event.target.value);
            if (fieldErrors.password) {
              setFieldErrors((previous) => ({ ...previous, password: undefined }));
            }
          }}
        />
        {fieldErrors.password && (
          <p id="password-error" className="login-field__error" role="alert">
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
            label="Lembrar e-mail ou CPF"
            checked={values.rememberIdentifier}
            onChange={(checked) => onChange('rememberIdentifier', checked)}
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

        <div className="login-divider" aria-hidden="true">
          <span>OU</span>
        </div>

        <GovBrButton />

        <p className="login-login-form__footer-note">
          Ambiente restrito e seguro do SUSpiro.
        </p>
      </form>
    </article>
  );
}
