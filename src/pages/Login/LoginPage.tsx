import { Login } from '../../components/Login';
import type { LoginProps } from '../../components/Login/types';

interface LoginPageProps {
  onForgotPassword: () => void;
  onCreateAccount?: () => void;
  onLogin?: LoginProps['onLogin'];
}

export function LoginPage({ onForgotPassword, onCreateAccount, onLogin }: LoginPageProps) {
  return (
    <Login
      onForgotPassword={onForgotPassword}
      onCreateAccount={onCreateAccount}
      onLogin={onLogin}
    />
  );
}

export default LoginPage;
