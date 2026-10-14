// Mostra o formulário para pedir a recuperação de senha.

import { ForgotPasswordPage } from '../../../pages/ForgotPassword/ForgotPasswordPage';

interface ForgotPasswordFeatureProps {
  onBack: () => void;
}

export function ForgotPasswordFeature({ onBack }: ForgotPasswordFeatureProps) {
  return <ForgotPasswordPage onBack={onBack} />;
}
