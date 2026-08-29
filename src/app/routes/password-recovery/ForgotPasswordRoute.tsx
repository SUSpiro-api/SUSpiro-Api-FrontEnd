import { ForgotPasswordPage } from '../../../pages/ForgotPassword/ForgotPasswordPage';

interface ForgotPasswordRouteProps {
  onBack: () => void;
}

export function ForgotPasswordRoute({ onBack }: ForgotPasswordRouteProps) {
  return <ForgotPasswordPage onBack={onBack} />;
}
