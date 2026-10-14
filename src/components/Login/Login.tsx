// Monta os elementos principais da tela de login.

import { authService as defaultAuthService } from '../../features/auth/service';
import { useLoginForm } from '../../features/auth/useLoginForm';
import { BrandPanel } from './BrandPanel';
import { LoginForm } from './LoginForm';
import type { LoginProps } from './types';
import './Login.css';

export function Login({
  onLogin,
  onForgotPassword,
  onCreateAccount,
  authService = defaultAuthService,
}: LoginProps) {
  const { values, setField, fieldErrors, validate, persistRememberedCpf } = useLoginForm();

  const handleLogin = async () => {
    if (!validate()) return;

    if (onLogin) {
      await onLogin({ cpf: values.cpf, password: values.password });
    } else {
      await authService.login({ cpf: values.cpf, password: values.password });
    }

    persistRememberedCpf();
  };

  return (
    <main className="login-page" aria-label="Página de acesso ao SUSpiro">
      <section className="login-container" aria-label="Autenticação do SUSpiro">
        <BrandPanel />
        <section className="login-form-panel" aria-label="Formulário de login">
          <LoginForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setField}
            onForgotPassword={onForgotPassword}
            onCreateAccount={onCreateAccount}
            onSubmit={handleLogin}
          />
        </section>
      </section>
    </main>
  );
}
