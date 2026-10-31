import { useLoginForm } from './useLoginForm';
import type { AuthService, LoginFormValues } from './types';

interface UseLoginControllerParams {
  onLogin?: (values: Pick<LoginFormValues, 'cpf' | 'password'>) => void | Promise<void>;
  authService: AuthService;
}

export function useLoginController({ onLogin, authService }: UseLoginControllerParams) {
  const form = useLoginForm();

  async function handleLogin() {
    if (!form.validate()) return;

    const credentials = { cpf: form.values.cpf, password: form.values.password };
    if (onLogin) await onLogin(credentials);
    else await authService.login(credentials);

    form.persistRememberedCpf();
  }

  return { ...form, handleLogin };
}
