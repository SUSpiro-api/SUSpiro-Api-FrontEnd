import { TextField } from '../ui/TextField';
import { PasswordField } from '../ui/PasswordField';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { MaterialIcon } from '../icons';
import { GovBrButton } from './GovBrButton';
import type { LoginFormProps } from './types';
import { useState } from 'react';
import { getCpfError } from '../../utils/cpf';

{
  /* Formulário de autenticação.
   */
}
export function LoginForm({ values, onChange, onSubmit, onForgotPassword }: LoginFormProps) {
  const [fieldErrors, setFieldErrors] = useState<{ cpf?: string; senha?: string }>({});
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    const errors: { cpf?: string; senha?: string } = {};
    const cpfError = getCpfError(values.cpf);

    if (cpfError) {
      errors.cpf = cpfError;
    }

    if (!values.senha.trim()) {
      errors.senha = 'Informe sua senha.';
    }

    setFieldErrors(errors);
    setFormError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      setFormError(
        message.includes('credencial') || message.includes('senha') || message.includes('cpf')
          ? 'CPF ou senha inválidos. Confira seus dados e tente novamente.'
          : 'Não foi possível conectar ao serviço. Tente novamente em instantes.',
      );
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

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        noValidate
        aria-label="Formulário de autenticação"
      >
        <TextField
          label="E-mail ou CPF"
          placeholder="000.000.000-00"
          autoComplete="username"
          required
          aria-invalid={Boolean(fieldErrors.cpf)}
          startIcon={<MaterialIcon name="person" size={18} />}
          value={values.cpf}
          onChange={(e) => {
            const nextValue = e.target.value;
            onChange('cpf', nextValue);
            if (fieldErrors.cpf) {
              setFieldErrors((previous) => ({ ...previous, cpf: undefined }));
            }
          }}
        />
        {fieldErrors.cpf && <p className="login-field__error">{fieldErrors.cpf}</p>}

        <PasswordField
          label="Senha de Acesso"
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fieldErrors.senha)}
          value={values.senha}
          onChange={(e) => {
            onChange('senha', e.target.value);
            if (fieldErrors.senha) {
              setFieldErrors((previous) => ({ ...previous, senha: undefined }));
            }
          }}
        />
        {fieldErrors.senha && <p className="login-field__error">{fieldErrors.senha}</p>}

        <nav
          className="login-login-form__row login-login-form__row--end"
          aria-label="Ações de autenticação"
        >
          <button
            type="button"
            className="login-link login-link--button"
            onClick={onForgotPassword}
          >
            Esqueceu a senha?
          </button>
        </nav>

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
            label="Lembrar dados de acesso"
            checked={values.lembrar}
            onChange={(v) => onChange('lembrar', v)}
          />
        </section>

        <Button type="submit" variant="primary" className="login-login-form__submit">
          Entrar
        </Button>

        <div className="login-divider" aria-label="Separador entre formas de acesso">
          <span>OU</span>
        </div>

        <GovBrButton />

        <footer className="login-login-form__footer-note">
          Ambiente restrito e seguro, ministério da saúde
        </footer>
      </form>
    </article>
  );
}
