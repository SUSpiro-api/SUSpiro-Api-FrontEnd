import { publicFetch } from '../../api/httpClient';
import { AuthError, type AuthErrorCode, type AuthService, type LoginFormValues } from './types';
import { normalizeCpf } from '../../utils/cpf';
import { clearToken, setToken } from './token';

interface LoginApiResponse {
  token: string;
}


const KNOWN_CODES = new Set<AuthErrorCode>([
  'INVALID_CREDENTIALS',
  'CPF_NAO_CADASTRADO',
  'SENHA_INCORRETA',
  'CONTA_DESATIVADA',
  'DADOS_INVALIDOS',
  'NETWORK',
  'NOT_CONFIGURED',
  'SESSAO_EXPIRADA',
  'UNKNOWN',
]);

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  const apiError = error as { message?: string; code?: string; status?: number } | null;
  const message = apiError?.message ?? 'Não foi possível concluir a solicitação.';
  const code = apiError?.code;

  if (code && KNOWN_CODES.has(code as AuthErrorCode)) {
    return new AuthError(message, code as AuthErrorCode);
  }

  if (apiError?.status === 401 || apiError?.status === 403) {
    return new AuthError(message || 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
  }

  if (error instanceof TypeError) {
    return new AuthError('Não foi possível conectar ao serviço.', 'NETWORK');
  }

  return new AuthError(message, 'UNKNOWN');
}

export const authService: AuthService = {
  async login(values: Pick<LoginFormValues, 'cpf' | 'password'>) {
    try {
      const response = await publicFetch<LoginApiResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          cpf: normalizeCpf(values.cpf),
          senha: values.password,
        }),
      });

      if (!response.token) {
        throw new AuthError('A API não retornou um token de acesso.', 'UNKNOWN');
      }

      setToken(response.token);
    } catch (error) {
      throw toAuthError(error);
    }
  },

  async requestPasswordReset(cpf: string) {
    try {
      await publicFetch<unknown>('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ cpf: normalizeCpf(cpf) }),
      });
    } catch (error) {
      throw toAuthError(error);
    }
  },
};

export function logout(): void {
  clearToken();
}
