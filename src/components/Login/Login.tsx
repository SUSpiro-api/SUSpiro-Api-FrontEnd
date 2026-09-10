import { authService as defaultAuthService } from '../../features/auth/service';
import { BrandPanel } from './BrandPanel';
import { LoginForm } from '../form/LoginForm';
import { useLoginForm } from '../../hooks/useLoginForm';
import type { LoginProps } from './types';
import './Login.css';

export function Login({
  onLogin,
  onForgotPassword,
  onCreateAccount,
  authService = defaultAuthService,
}: LoginProps) {
  const { values, setField } = useLoginForm();

  const handleLogin = async (formValues: typeof values) => {
    if (onLogin) {
      await onLogin({
        identifier: formValues.identifier,
        password: formValues.password,
      });
      return;
    }

    await authService.login({
      identifier: formValues.identifier,
      password: formValues.password,
    });
  };

  return (
    <main className="login-page" aria-label="Página de acesso ao SUSpiro">
      <section className="login-container" aria-label="Autenticação do SUSpiro">
        <BrandPanel />
        <section className="login-form-panel" aria-label="Formulário de login">
          <LoginForm
            values={values}
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
