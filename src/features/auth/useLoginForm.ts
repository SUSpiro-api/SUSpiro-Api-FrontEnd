import { useCallback, useState } from 'react';
import type { LoginFormValues } from './types';
import { clearRememberedCpf, getRememberedCpf, saveRememberedCpf } from './storage';
import { validateLoginCpf, validatePassword } from './validation';

export type LoginField = 'cpf' | 'password' | 'rememberCpf';
export type LoginFieldErrors = Partial<Record<'cpf' | 'password', string>>;

export function useLoginForm() {
  const [values, setValues] = useState<LoginFormValues>(() => {
    const rememberedCpf = getRememberedCpf();
    return {
      cpf: rememberedCpf,
      password: '',
      rememberCpf: Boolean(rememberedCpf),
    };
  });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const setField = useCallback(<K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((previous) => ({ ...previous, [field]: value }));

    // Salva/limpa o CPF no instante em que a opção é alterada; não depende do login dar certo.
    if (field === 'rememberCpf') {
      if (value === true) saveRememberedCpf(values.cpf.trim());
      else clearRememberedCpf();
    } else if (field === 'cpf' && values.rememberCpf) {
      saveRememberedCpf(String(value).trim());
    }

    if (field === 'cpf' || field === 'password') {
      setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  }, [values.cpf, values.rememberCpf]);

  const validate = useCallback((): boolean => {
    const errors: LoginFieldErrors = {};
    const cpfError = validateLoginCpf(values.cpf);
    const passwordError = validatePassword(values.password);

    if (cpfError) errors.cpf = cpfError;
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [values.cpf, values.password]);

  const persistRememberedCpf = useCallback(() => {
    if (values.rememberCpf) {
      saveRememberedCpf(values.cpf.trim());
    } else {
      clearRememberedCpf();
    }
  }, [values.cpf, values.rememberCpf]);

  return { values, setField, fieldErrors, validate, persistRememberedCpf };
}
