import { AuthError, type AuthErrorCode, type AuthService, type LoginFormValues } from './types';
import { setToken, clearToken } from './token';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

interface ApiErrorResponse {
  message?: string;
  code?: string;
}

interface LoginApiResponse {
  token: string;
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
    throw new AuthError('A API vai ser configurada', 'NOT_CONFIGURED');
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
    // corpo vazio ou não-JSON, segue com body = {}
  }

  // O backend do SUSpiro devolve { code, message } específicos
  // (CPF_NAO_CADASTRADO, SENHA_INCORRETA, CONTA_DESATIVADA, DADOS_INVALIDOS).
  if (body.code) {
    const code = toAuthErrorCode(body.code, 'UNKNOWN');
    throw new AuthError(body.message ?? 'Não foi possível concluir a solicitação.', code);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthError(body.message ?? 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
  }

  throw new AuthError(body.message ?? 'Não foi possível concluir a solicitação.', 'UNKNOWN');
}

// O back-end SUSpiro autentica exclusivamente por CPF (11 dígitos).
// Se o usuário digitar e-mail no campo "identifier", o back não vai
// reconhecer o formato e retorna DADOS_INVALIDOS.
function toCpf(identifier: string): string {
  return identifier.replace(/\D/g, '');
}

export const authService: AuthService = {
  async login(values: Pick<LoginFormValues, 'identifier' | 'password'>) {
    const { token } = await request<LoginApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        cpf: toCpf(values.identifier),
        senha: values.password,
      }),
    });

    setToken(token);
  },

  async requestPasswordReset(cpf: string) {
    // ATENÇÃO: /auth/password/forgot ainda não existe no back-end atual
    // (o LoginController só expõe POST /auth/login). Essa chamada vai
    // sempre retornar erro até que esse endpoint seja implementado no back.
    await request('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ cpf }),
    });
  },
};

export function logout(): void {
  clearToken();
}
