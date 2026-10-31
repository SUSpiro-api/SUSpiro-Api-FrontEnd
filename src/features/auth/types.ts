export type PerfilUsuario =
  | 'SUPER_ADMIN'
  | 'GERENTE'
  | 'MEDICO'
  | 'ENFERMEIRO'
  | 'ATENDENTE'
  | 'PACIENTE';

export interface AuthUser {
  /** Identificador interno do usuário; quando ausente, usa o subject do token. */
  id?: string;
  sub: string;
  nome?: string;
  perfil?: PerfilUsuario;
  cpfMascarado?: string;
  sexo?: string | null;
  registroProfissional?: string | null;
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
  | 'UNKNOWN'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
