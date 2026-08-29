import type { AuthService, LoginFormValues } from '../../features/auth/types';

export type { LoginFormValues };

export interface LoginFormProps {
  values: LoginFormValues;
  onChange: <K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => void;
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  onForgotPassword?: () => void;
  isSubmitting?: boolean;
  formError?: string;
}

export interface LoginProps {
  onLogin?: (values: Pick<LoginFormValues, 'identifier' | 'password'>) => void | Promise<void>;
  onForgotPassword?: () => void;
  authService?: AuthService;
}
