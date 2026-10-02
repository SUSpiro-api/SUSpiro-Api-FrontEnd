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
  'NOT_AVAILABLE',
  'UNKNOWN',
]);

// O back-end atual não expõe /auth/password/forgot: a rota protegida responde 401, e uma
// rota inexistente/não permitida responde 403/404/405. Em todos os casos a funcionalidade
// simplesmente não existe ainda, e o usuário precisa ser avisado disso com clareza.
const PASSWORD_RESET_UNAVAILABLE_STATUSES = [401, 403, 404, 405];

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
      const status = (error as { status?: number } | null)?.status;

      if (status !== undefined && PASSWORD_RESET_UNAVAILABLE_STATUSES.includes(status)) {
        throw new AuthError('A recuperação de senha ainda não está disponível.', 'NOT_AVAILABLE');
      }

      throw toAuthError(error);
    }
  },
};

export function logout(): void {
  clearToken();
}
