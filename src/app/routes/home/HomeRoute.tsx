import { LoginPage } from '../../../pages/Login/LoginPage';

interface HomeRouteProps {
  onForgotPassword: () => void;
}

export function HomeRoute({ onForgotPassword }: HomeRouteProps) {
  return <LoginPage onForgotPassword={onForgotPassword} />;
}
