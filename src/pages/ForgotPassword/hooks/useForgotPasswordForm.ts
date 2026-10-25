// Guarda o CPF, valida o campo e envia o pedido de recuperação.

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getPasswordResetErrorMessage } from '../../../features/auth/errorMessages';
import { validateResetCpf } from '../../../features/auth/validation';
import { formatCpf } from '../../../utils/cpf';

interface UseForgotPasswordFormParams {
  onSubmit: (cpf: string) => Promise<void>;
}

export function useForgotPasswordForm({ onSubmit }: UseForgotPasswordFormParams) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCpfChange(event: ChangeEvent<HTMLInputElement>) {
    setCpf(formatCpf(event.target.value));
    setError('');
    setFormError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cpfError = validateResetCpf(cpf);
    setError(cpfError);
    setFormError('');
    if (cpfError) return;

    setIsSubmitting(true);
    try {
      await onSubmit(cpf);
    } catch (submitError) {
      setFormError(getPasswordResetErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { cpf, error, formError, isSubmitting, handleCpfChange, handleSubmit };
}
