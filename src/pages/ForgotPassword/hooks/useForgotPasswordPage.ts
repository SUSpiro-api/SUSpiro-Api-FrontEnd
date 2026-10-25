// Cuida do pedido de recuperação e da tela de confirmação.

import { useState } from 'react';
import { authService as defaultAuthService } from '../../../features/auth/service';
import type { AuthService } from '../../../features/auth/types';

type ForgotPasswordStage = 'form' | 'success';

interface UseForgotPasswordPageParams {
  authService?: AuthService;
}

export function useForgotPasswordPage({ authService = defaultAuthService }: UseForgotPasswordPageParams = {}) {
  const [stage, setStage] = useState<ForgotPasswordStage>('form');

  async function handleSubmit(cpf: string) {
    await authService.requestPasswordReset(cpf.replace(/\D/g, ''));
    setStage('success');
  }

  return { stage, handleSubmit };
}
