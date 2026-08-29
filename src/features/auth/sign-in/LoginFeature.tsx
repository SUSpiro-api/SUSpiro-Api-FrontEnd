import { LoginPage } from '../../../pages/Login/LoginPage';

interface LoginFeatureProps {
  onForgotPassword: () => void;
}

export function LoginFeature({ onForgotPassword }: LoginFeatureProps) {
  return <LoginPage onForgotPassword={onForgotPassword} />;
}
