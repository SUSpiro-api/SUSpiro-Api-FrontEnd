// Define os tipos usados no login e nos dados do usuário.

export type PerfilUsuario =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MEDICO'
  | 'ENFERMEIRO'
  | 'RECEPCIONISTA'
  | 'USUARIO';

export interface AuthUser {
  sub: string;
  nome?: string;
  perfil?: PerfilUsuario;
}

export interface LoginFormValues {
  cpf: string;
  password: string;
  rememberCpf: boolean;
}

export interface AuthService {
  login(values: Pick<LoginFormValues, 'cpf' | 'password'>): Promise<AuthUser>;
  restoreSession(): Promise<AuthUser | null>;
  logout(): Promise<void>;
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
  | 'SESSAO_EXPIRADA'
  | 'NOT_AVAILABLE'
  | 'UNKNOWN';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
