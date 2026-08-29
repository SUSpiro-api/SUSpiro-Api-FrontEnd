import { useCallback, useState } from 'react';
import type { LoginFormValues } from '../components/Login/types';
import { getRememberedIdentifier } from '../features/auth/storage';

export function useLoginForm() {
  const rememberedIdentifier = getRememberedIdentifier();

  const [values, setValues] = useState<LoginFormValues>({
    identifier: rememberedIdentifier,
    password: '',
    rememberIdentifier: Boolean(rememberedIdentifier),
  });

  const setField = useCallback(<K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  }, []);

  return { values, setField };
}
