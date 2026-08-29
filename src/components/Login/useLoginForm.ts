import { useCallback, useState } from 'react';
import type { LoginFormValues } from './types';

const INITIAL_VALUES: LoginFormValues = {
  cpf: '',
  senha: '',
  lembrar: true,
};

/**
 * Encapsula o estado dos campos do formulário de login.
 * O submit em si é responsabilidade do componente `LoginForm`
 * (que já lida com o evento nativo do <form>), então este hook
 * cuida apenas de guardar e atualizar valores.
 */
export function useLoginForm() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);

  const setField = useCallback(<K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  return { values, setField };
}
