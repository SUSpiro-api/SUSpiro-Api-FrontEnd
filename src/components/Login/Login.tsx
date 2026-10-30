import { authService as defaultAuthService } from '../../features/auth/service';
import { useLoginController } from '../../features/auth/useLoginController';
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
  const { values, setField, fieldErrors, handleLogin } = useLoginController({ onLogin, authService });

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
