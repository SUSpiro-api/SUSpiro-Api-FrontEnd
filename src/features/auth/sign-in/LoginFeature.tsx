import { LoginPage } from '../../../pages/Login/LoginPage';
import { authService } from '../service';
import type { LoginFormValues } from '../types';

interface LoginFeatureProps {
  onForgotPassword: () => void;
  onCreateAccount?: () => void;
  onLoginSuccess: () => void;
}

export function LoginFeature({ onForgotPassword, onCreateAccount, onLoginSuccess }: LoginFeatureProps) {
  const handleLogin = async (values: Pick<LoginFormValues, 'identifier' | 'password'>) => {
    await authService.login(values);
    onLoginSuccess();
  };

  return (
    <LoginPage
      onForgotPassword={onForgotPassword}
      onCreateAccount={onCreateAccount}
      onLogin={handleLogin}
    />
  );
}
