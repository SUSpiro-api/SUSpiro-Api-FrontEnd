import { LoginPage } from '../../../pages/Login/LoginPage';

interface LoginRouteProps {
  onForgotPassword: () => void;
}

export function LoginRoute({ onForgotPassword }: LoginRouteProps) {
  return <LoginPage onForgotPassword={onForgotPassword} />;
}
