
import { LoginPage } from '../../../pages/Login/LoginPage';
import { authService } from '../service';
import type { AuthUser, LoginFormValues } from '../types';

interface LoginFeatureProps {
  onForgotPassword: () => void;
  onCreateAccount?: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginFeature({
  onForgotPassword,
  onCreateAccount,
  onLoginSuccess,
}: LoginFeatureProps) {
  const handleLogin = async (values: Pick<LoginFormValues, 'cpf' | 'password'>) => {
    const user = await authService.login(values);
    onLoginSuccess(user);
  };



  return (
    <LoginPage
      onForgotPassword={onForgotPassword}
      onCreateAccount={onCreateAccount}
      onLogin={handleLogin}
    />
  );
}
