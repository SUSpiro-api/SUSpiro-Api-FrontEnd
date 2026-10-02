import { AUTH_EXPIRED_EVENT } from '../features/auth/session';
import { getToken, clearToken } from '../features/auth/token';

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

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

interface ApiErrorBody {
  message?: string;
  mensagem?: string;
  code?: string;
}

function assertApiConfigured(): string {
  if (!API_URL) {
    throw new ApiError(
      'A API não está configurada. Defina VITE_API_URL no .env ou use o proxy local /api.',
      0,
      'NOT_CONFIGURED',
    );
  }

  return API_URL;
}

/**
 * O back-end junta os erros de validação como "campo: mensagem; campo: mensagem".
 * As mensagens já são frases completas em português, então o nome técnico do campo é removido.
 */
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
    // Algumas respostas de gateway/proxy podem não ter corpo JSON.
  }

  const serverMessage = body.message ?? body.mensagem;
  const message =
    serverMessage && response.status === 400
      ? cleanValidationMessage(serverMessage)
      : serverMessage;

  return new ApiError(
    message || 'Não foi possível concluir a solicitação.',
    response.status,
    body.code,
  );
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = assertApiConfigured();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao serviço.', 0, 'NETWORK');
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function authenticatedFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  try {
    return await apiFetch<T>(path, {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
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
}

export const publicFetch = apiFetch;
