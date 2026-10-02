import { useState } from 'react';
import { authService as defaultAuthService } from '../../features/auth/service';
import type { AuthService } from '../../features/auth/types';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ForgotPasswordSuccess } from './ForgotPasswordSuccess';
import './ForgotPasswordPage.css';

type ForgotPasswordStage = 'form' | 'success';

interface ForgotPasswordPageProps {
  onBack: () => void;
  authService?: AuthService;
}

export function ForgotPasswordPage({
  onBack,
  authService = defaultAuthService,
}: ForgotPasswordPageProps) {
  const [stage, setStage] = useState<ForgotPasswordStage>('form');

  const handleSubmit = async (cpf: string) => {
    await authService.requestPasswordReset(cpf.replace(/\D/g, ''));
    setStage('success');
  };

  return (
    <main className="login-page login-page--recovery" aria-label="Recuperação de senha do SUSpiro">
      <section className="login-recovery-shell" aria-label="Tela de recuperação de senha">
        {stage === 'success' ? (
          <ForgotPasswordSuccess onBack={onBack} />
        ) : (
          <ForgotPasswordForm onBack={onBack} onSubmit={handleSubmit} />
        )}
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
