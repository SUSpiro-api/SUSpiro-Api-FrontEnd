// Faz as operações de login, logout e recuperação de acesso.

import { authenticatedFetch, publicFetch } from '../../api/httpClient';
import { env } from '../../config/env';
import { normalizeCpf } from '../../utils/cpf';
import { clearToken, getCurrentUser, getToken, precisaTrocarSenha, setAvisoSenhaFraca, setCurrentUser, setSenhaProvisoria, setToken } from './token';
import { AuthError, type AuthErrorCode, type AuthService, type AuthUser, type LoginFormValues, type PerfilUsuario } from './types';

interface LoginApiResponse {
  token?: string;
  user?: unknown;
  senhaProvisoria?: boolean;
  avisoSenhaFraca?: boolean;
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
  'GERENTE',
  'MEDICO',
  'ENFERMEIRO',
  'ATENDENTE',
  'PACIENTE',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null;

  const idValue = value.id;
  const subValue = value.sub ?? value.cpf ?? value.id;
  if (subValue === undefined || subValue === null) return null;

  const sub = String(subValue).trim();
  if (!sub) return null;

  const perfilValue = value.perfil;
  const perfil = typeof perfilValue === 'string' && PERFIS.has(perfilValue as PerfilUsuario)
    ? perfilValue as PerfilUsuario
    : undefined;

  const nome = typeof value.nome === 'string' ? value.nome.trim() || undefined : undefined;
  const cpfValue = typeof value.cpf === 'string' ? value.cpf.replace(/\D/g, '') : '';
  const cpfMascarado = typeof value.cpfMascarado === 'string'
    ? value.cpfMascarado
    : cpfValue.length === 11 ? `•••.•••.•••-${cpfValue.slice(-2)}` : undefined;
  return { id: idValue === undefined || idValue === null ? undefined : String(idValue), sub, nome, perfil, cpfMascarado };
}

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  const apiError = error as { message?: string; code?: string; status?: number } | null;
  const message = apiError?.message ?? 'Não foi possível concluir a solicitação.';
  const code = apiError?.code;

  if (code && KNOWN_CODES.has(code as AuthErrorCode)) {
    return new AuthError(message, code as AuthErrorCode);
  }

  if (apiError?.status === 401) return new AuthError('CPF ou senha inválidos. Confira seus dados e tente novamente.', 'INVALID_CREDENTIALS');
  if (apiError?.status === 400) return new AuthError(message || 'Confira os dados informados.', 'DADOS_INVALIDOS');
  if (apiError?.status === 403) return new AuthError(message || 'Sua conta não tem permissão para esta operação.', 'FORBIDDEN');
  if (apiError?.status === 404) return new AuthError(message || 'O recurso solicitado não foi encontrado.', 'NOT_FOUND');
  if (apiError?.status === 422) return new AuthError(message || 'Os dados informados não atendem às regras necessárias.', 'DADOS_INVALIDOS');
  if (apiError?.status === 409) return new AuthError(message || 'A operação conflita com dados já cadastrados.', 'CONFLICT');
  if (apiError?.status === 429) return new AuthError('Muitas tentativas. Aguarde antes de tentar novamente.', 'RATE_LIMITED');
  if (typeof apiError?.status === 'number' && apiError.status >= 500) return new AuthError('O serviço encontrou um erro interno. Tente novamente mais tarde.', 'SERVER');
  if (error instanceof TypeError || apiError?.status === 0) return new AuthError('Não foi possível conectar ao serviço.', 'NETWORK');
  return new AuthError(message, 'UNKNOWN');
}

function userFromLegacyToken(): AuthUser | null {
  return getCurrentUser();
}

async function restoreSession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  const cachedUser = getCurrentUser();
  // A API limita uma sessão provisória a trocar senha. Após atualizar a página,
  // usamos somente a identidade mínima desta sessão para mostrar a tela de troca;
  // o backend continua bloqueando todas as rotas de negócio até a troca.
  if (precisaTrocarSenha() && cachedUser) return cachedUser;

  try {
    const response = await authenticatedFetch<SessionApiResponse>(env.authSessionPath, {
      method: 'GET',
      retries: 0,
    });
    const rawUser = response.user ?? response.usuario ?? response;
    const user = normalizeUser(rawUser);
    if (!user) {
      clearToken();
      return null;
    }

    const rawUserIsRecord = isRecord(rawUser);
    const provisional = typeof response.senhaProvisoria === 'boolean'
      ? response.senhaProvisoria
      : rawUserIsRecord && typeof rawUser.senhaProvisoria === 'boolean'
        ? rawUser.senhaProvisoria
        : false;
    setSenhaProvisoria(provisional);
    setCurrentUser(user);
    return user;
  } catch (error) {
    const status = (error as { status?: number } | null)?.status;
    if (status === 401) {
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
      // Aviso de senha inicial fraca (paciente): só informa, não bloqueia o acesso.
      setAvisoSenhaFraca(response.avisoSenhaFraca === true);

      if (env.authMode === 'legacy-bearer-memory') {
        if (!response.token) {
          throw new AuthError('A API não retornou um token de acesso.', 'UNKNOWN');
        }

        setToken(response.token);
        // Os dados de exibição vêm do DTO da API; o JWT não carrega CPF nem nome.
        const user = normalizeUser(response.user) ?? userFromLegacyToken();
        if (!user) {
          clearToken();
          throw new AuthError('A API retornou dados de sessão inválidos.', 'UNKNOWN');
        }
        setCurrentUser(user);
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
      // Revoga o token no backend (quando Bearer) e encerra a sessão no navegador.
      // Em modo cookie, tenta também invalidar a sessão do servidor.
      if (env.authMode === 'cookie' || getToken()) {
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

/** Encerra localmente o aviso legado; a API integrada não expõe esse endpoint. */
export async function dismissWeakPasswordNotice(): Promise<void> {
  // A API atual não possui endpoint de aviso de senha fraca; o aviso é encerrado localmente.
  setAvisoSenhaFraca(false);
}

export async function logout(): Promise<void> {
  await authService.logout();
}
