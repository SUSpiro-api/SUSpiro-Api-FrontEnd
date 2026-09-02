export interface LoginFormValues {
  identifier: string;
  password: string;
  rememberIdentifier: boolean;
}

export interface AuthService {
  login(values: Pick<LoginFormValues, 'identifier' | 'password'>): Promise<void>;
  requestPasswordReset(cpf: string): Promise<void>;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'CPF_NAO_CADASTRADO'
  | 'SENHA_INCORRETA'
  | 'CONTA_DESATIVADA'
  | 'DADOS_INVALIDOS'
  | 'NETWORK'
  | 'NOT_CONFIGURED'
  | 'UNKNOWN';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
