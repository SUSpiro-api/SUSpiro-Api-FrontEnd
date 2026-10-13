import { AuthError, type AuthErrorCode, type AuthService, type LoginFormValues } from './types';
import { setToken, clearToken, setSenhaProvisoria } from './token';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

interface ApiErrorResponse {
  message?: string;
  mensagem?: string;
  code?: string;
}

interface LoginApiResponse {
  token: string;
  senhaProvisoria: boolean;
}

const KNOWN_CODES: AuthErrorCode[] = [
  'INVALID_CREDENTIALS',
  'CPF_NAO_CADASTRADO',
  'SENHA_INCORRETA',
  'CONTA_DESATIVADA',
  'DADOS_INVALIDOS',
];

function toAuthErrorCode(code: string | undefined, fallback: AuthErrorCode): AuthErrorCode {
  if (code && (KNOWN_CODES as string[]).includes(code)) {
    return code as AuthErrorCode;
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new AuthError('A API', 'NOT_CONFIGURED');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  } catch {
    throw new AuthError('Não foi possível conectar ao serviço.', 'NETWORK');
  }

  if (response.ok) {
    return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
  }

  let body: ApiErrorResponse = {};
  try {
    body = (await response.json()) as ApiErrorResponse;
  } catch {
    
  }

  const message = body.mensagem ?? body.message;

  if (body.code) {
    const code = toAuthErrorCode(body.code, 'UNKNOWN');
    throw new AuthError(message ?? 'Não foi possível concluir a solicitação.', code);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthError(message ?? 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
  }

  if (response.status === 404) {
    throw new AuthError(message ?? 'CPF não cadastrado', 'CPF_NAO_CADASTRADO');
  }

  throw new AuthError(message ?? 'Não foi possível concluir a solicitação.', 'UNKNOWN');
}

// O back-end SUSpiro autentica exclusivamente por CPF (11 dígitos).
// Se o usuário digitar e-mail no campo "identifier", o back não vai
// reconhecer o formato e retorna DADOS_INVALIDOS.
function toCpf(identifier: string): string {
  return identifier.replace(/\D/g, '');
}

export const authService: AuthService = {
  async login(values: Pick<LoginFormValues, 'identifier' | 'password'>) {
    const { token, senhaProvisoria } = await request<LoginApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        cpf: toCpf(values.identifier),
        senha: values.password,
      }),
    });

    setToken(token);
    setSenhaProvisoria(senhaProvisoria);
  },

  // A API gera uma senha provisória e envia para o e-mail do usuário.
  // CPF não cadastrado responde 404 (AuthError CPF_NAO_CADASTRADO).
  async requestPasswordReset(cpf: string) {
    await request('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ cpf }),
    });
  },
};

export function logout(): void {
  clearToken();
}
