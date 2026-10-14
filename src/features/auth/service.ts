// Faz as operações de login, logout e recuperação de acesso.

import { authenticatedFetch, publicFetch } from '../../api/httpClient';
import { env } from '../../config/env';
import { normalizeCpf } from '../../utils/cpf';
import { clearToken, getCurrentUser, setCurrentUser, setSenhaProvisoria, setToken } from './token';
import { AuthError, type AuthErrorCode, type AuthService, type AuthUser, type LoginFormValues, type PerfilUsuario } from './types';

interface LoginApiResponse {
  token?: string;
  user?: unknown;
  senhaProvisoria?: boolean;
}

interface SessionApiResponse {
  user?: unknown;
  usuario?: unknown;
  senhaProvisoria?: boolean;
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

const PASSWORD_RESET_UNAVAILABLE_STATUSES = [401, 403, 404, 405];

const PERFIS: ReadonlySet<PerfilUsuario> = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'MEDICO',
  'ENFERMEIRO',
  'RECEPCIONISTA',
  'USUARIO',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null;

  const subValue = value.sub ?? value.id;
  if (subValue === undefined || subValue === null) return null;

  const sub = String(subValue).trim();
  if (!sub) return null;

  const perfilValue = value.perfil;
  const perfil = typeof perfilValue === 'string' && PERFIS.has(perfilValue as PerfilUsuario)
    ? perfilValue as PerfilUsuario
    : undefined;

  const nome = typeof value.nome === 'string' ? value.nome.trim() || undefined : undefined;
  return { sub, nome, perfil };
}

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

function userFromLegacyToken(): AuthUser | null {
  return getCurrentUser();
}

async function restoreSession(): Promise<AuthUser | null> {
  if (env.authMode === 'legacy-bearer-memory') {
    return getCurrentUser();
  }

  const existingUser = getCurrentUser();
  if (existingUser) return existingUser;

  try {
    const response = await authenticatedFetch<SessionApiResponse>(env.authSessionPath, {
      method: 'GET',
      retries: 0,
    });

    const user = normalizeUser(response.user ?? response.usuario ?? response);
    if (!user) return null;

    if (typeof response.senhaProvisoria === 'boolean') {
      setSenhaProvisoria(response.senhaProvisoria);
    }
    setCurrentUser(user);
    return user;
  } catch (error) {
    const status = (error as { status?: number } | null)?.status;
    if (status === 401 || status === 403) {
      clearToken();
      return null;
    }
    throw toAuthError(error);
  }
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
      const provisionalFlag = isRecord(response.user) && typeof response.user.senhaProvisoria === 'boolean'
        ? response.user.senhaProvisoria
        : response.senhaProvisoria;
      if (typeof provisionalFlag === 'boolean') setSenhaProvisoria(provisionalFlag);
      else setSenhaProvisoria(false);

      if (env.authMode === 'legacy-bearer-memory') {
        if (!response.token) {
          throw new AuthError('A API não retornou um token de acesso.', 'UNKNOWN');
        }

        setToken(response.token);
        const user = userFromLegacyToken();
        if (!user) {
          clearToken();
          throw new AuthError('A API retornou um token inválido.', 'UNKNOWN');
        }
        return user;
      }

      const userReturnedByLogin = normalizeUser(response.user);
      if (userReturnedByLogin) {
        setCurrentUser(userReturnedByLogin);
        return userReturnedByLogin;
      }

      const sessionUser = await restoreSession();
      if (!sessionUser) {
        throw new AuthError(
          'O login foi aceito, mas a sessão segura não pôde ser confirmada. A API deve criar um cookie HttpOnly e disponibilizar a sessão autenticada.',
          'UNKNOWN',
        );
      }

      return sessionUser;
    } catch (error) {
      throw toAuthError(error);
    }
  },

  restoreSession,

  async logout() {
    try {
      if (env.authMode === 'cookie') {
        await authenticatedFetch<void>(env.authLogoutPath, {
          method: 'POST',
          retries: 0,
        });
      }
    } catch {
      // A sessão local é encerrada mesmo se a API estiver indisponível.
    } finally {
      clearToken();
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

export async function logout(): Promise<void> {
  await authService.logout();
}
