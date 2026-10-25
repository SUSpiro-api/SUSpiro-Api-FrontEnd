// Define os tipos usados pelos componentes de login.

import type { AuthService, LoginFormValues } from '../../features/auth/types';

export type { LoginFormValues };

export interface LoginFormProps {
  values: LoginFormValues;
  onChange: <K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => void;
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export interface LoginProps {
  onLogin?: (values: Pick<LoginFormValues, 'cpf' | 'password'>) => void | Promise<void>;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
  authService?: AuthService;
}
