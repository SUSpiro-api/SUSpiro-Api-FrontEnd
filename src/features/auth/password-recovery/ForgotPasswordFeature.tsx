
import { ForgotPasswordPage } from '../../../pages/ForgotPassword/ForgotPasswordPage';

interface ForgotPasswordFeatureProps {
  onBack: () => void;
}

export function ForgotPasswordFeature({ onBack }: ForgotPasswordFeatureProps) {
  return <ForgotPasswordPage onBack={onBack} />;
}
