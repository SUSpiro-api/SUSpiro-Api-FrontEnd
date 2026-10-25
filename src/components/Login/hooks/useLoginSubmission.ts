// Cuida do envio do login e mostra os erros da tentativa.

import { useState, type FormEvent } from 'react';
import { getLoginErrorMessage } from '../../../features/auth/errorMessages';
import type { LoginFormValues } from '../../../features/auth/types';

export function useLoginSubmission(onSubmit: (values: LoginFormValues) => void | Promise<void>) {
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>, values: LoginFormValues) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { formError, isSubmitting, handleSubmit };
}
