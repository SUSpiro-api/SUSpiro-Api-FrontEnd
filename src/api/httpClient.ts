// Faz as chamadas para a API e trata as respostas.

import { AUTH_EXPIRED_EVENT } from '../features/auth/session';
import { clearToken, getToken } from '../features/auth/token';
import { env } from '../config/env';

export interface ApiErrorBody {
  message?: string;
  mensagem?: string;
  code?: string;
  codigo?: string;
  erros?: Record<string, string> | string[];
  errors?: Record<string, string> | string[];
}

export interface RequestOptions extends RequestInit {
  retries?: number;
  cacheTtlMs?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const GET_CACHE = new Map<string, { expiresAt: number; value: unknown }>();
const DEFAULT_RETRIES = 1;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function cleanValidationMessage(message: string): string {
  return message
    .split(';')
    .map((part) => part.trim().replace(/^[A-Za-z][A-Za-z0-9_.]*:\s+/, ''))
    .filter(Boolean)
    .join(' ');
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // Erros de gateways/proxies podem não conter JSON.
  }

  const validation = body.erros ?? body.errors;
  const validationMessages = Array.isArray(validation)
    ? validation.filter((item): item is string => typeof item === 'string')
    : validation && typeof validation === 'object'
      ? Object.values(validation).filter((item): item is string => typeof item === 'string')
      : [];
  const baseMessage = body.message ?? body.mensagem;
  const cleanedBaseMessage = baseMessage && response.status === 400 ? cleanValidationMessage(baseMessage) : baseMessage?.trim();
  const usefulBaseMessage = cleanedBaseMessage && !['Dados inválidos', 'Bad Request'].includes(cleanedBaseMessage)
    ? cleanedBaseMessage
    : '';
  const message = [usefulBaseMessage, ...validationMessages].filter(Boolean).join(' ');

  const fallbackMessages: Record<number, string> = {
    400: 'Os dados enviados são inválidos. Confira os campos e tente novamente.',
    401: 'Sua autenticação não foi aceita. Confira os dados de acesso ou entre novamente.',
    403: 'Você não tem permissão para realizar esta operação.',
    404: 'O recurso solicitado não foi encontrado.',
    409: 'A operação conflita com um registro existente ou com o estado atual do recurso.',
    422: 'Os dados informados não atendem às regras necessárias.',
    429: 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.',
    500: 'O servidor encontrou um erro interno. Tente novamente mais tarde.',
    502: 'O serviço está temporariamente indisponível.',
    503: 'O serviço está temporariamente indisponível.',
    504: 'O servidor demorou demais para responder. Tente novamente.',
  };
  return new ApiError(
    message || fallbackMessages[response.status] || 'Não foi possível concluir a solicitação.',
    response.status,
    body.code ?? body.codigo,
  );
}

function shouldRetry(method: string, error: unknown): boolean {
  const normalizedMethod = method.toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) return false;
  if (error instanceof ApiError) return RETRYABLE_STATUS.has(error.status);
  return error instanceof TypeError;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const part = document.cookie.split('; ').find((item) => item.startsWith(prefix));
  if (!part) return null;
  const value = part.slice(prefix.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function csrfToken(): string | null {
  return env.authMode === 'cookie' ? readCookie(env.csrfCookieName) : null;
}

function requestCredentials(includeAuth: boolean): RequestCredentials {
  if (env.authMode === 'cookie') return 'include';
  return includeAuth ? 'same-origin' : 'same-origin';
}

function delay(attempt: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('A requisição foi cancelada.', 'AbortError'));
      return;
    }

    const timeout = window.setTimeout(resolve, attempt * 250);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timeout);
      reject(new DOMException('A requisição foi cancelada.', 'AbortError'));
    }, { once: true });
  });
}

async function request<T>(path: string, options: RequestOptions = {}, includeAuth = true): Promise<T> {
  if (!env.apiUrl) {
    throw new ApiError(
      'A API não está configurada. Defina VITE_API_URL no .env ou use o proxy local /api.',
      0,
      'NOT_CONFIGURED',
    );
  }

  const { retries: configuredRetries, cacheTtlMs: configuredCacheTtlMs, ...fetchOptions } = options;
  const method = (fetchOptions.method ?? 'GET').toUpperCase();
  const retries = configuredRetries ?? DEFAULT_RETRIES;
  const cacheTtlMs = configuredCacheTtlMs ?? 0;

  // No modo cookie, não guardamos dados privados nesse cache.
  const canUseMemoryCache = method === 'GET' && cacheTtlMs > 0 &&
    (!includeAuth || env.authMode === 'legacy-bearer-memory');
  const cacheScope = includeAuth ? `auth:${getToken() ?? 'anonymous'}` : 'public';
  const cacheKey = `${cacheScope}:${method}:${path}`;

  if (canUseMemoryCache) {
    const cached = GET_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;
    GET_CACHE.delete(cacheKey);
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const token = env.authMode === 'legacy-bearer-memory' && includeAuth ? getToken() : null;
      const csrf = includeAuth && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'
        ? csrfToken()
        : null;

      const response = await fetch(`${env.apiUrl}${path}`, {
        ...fetchOptions,
        credentials: fetchOptions.credentials ?? requestCredentials(includeAuth),
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await parseError(response);
        if (attempt < retries && shouldRetry(method, error)) {
          await delay(attempt + 1, fetchOptions.signal);
          continue;
        }
        throw error;
      }

      if (response.status === 204) return undefined as T;

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return undefined as T;
      }

      const value = (await response.json()) as T;
      if (canUseMemoryCache) {
        GET_CACHE.set(cacheKey, { expiresAt: Date.now() + cacheTtlMs, value });
      }
      return value;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;

      if (attempt < retries && shouldRetry(method, error)) {
        await delay(attempt + 1, fetchOptions.signal);
        continue;
      }

      if (error instanceof ApiError) {
        const isSessionValidationRequest = path === env.authSessionPath;
        const isLegacyAuthMode = env.authMode === 'legacy-bearer-memory';

        if (includeAuth && error.status === 401 && (isSessionValidationRequest || isLegacyAuthMode)) {
          clearToken();
          window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
          throw new ApiError(
            'Sua sessão expirou. Faça login novamente.',
            401,
            'SESSAO_EXPIRADA',
          );
        }
        throw error;
      }

      throw new ApiError('Não foi possível conectar ao serviço.', 0, 'NETWORK');
    }
  }

  throw new ApiError('Não foi possível concluir a solicitação.', 0, 'UNKNOWN');
}

export async function authenticatedFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, options);
}

export async function publicFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, options, false);
}

export function clearApiCache(): void {
  GET_CACHE.clear();
}
