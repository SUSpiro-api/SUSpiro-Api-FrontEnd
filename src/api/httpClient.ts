import { getToken, clearToken } from '../features/auth/token';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

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

/**
 * Wrapper de fetch para rotas autenticadas do back-end SUSpiro.
 * Sempre anexa o header Authorization com o token salvo.
 */
export async function authenticatedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao serviço.', 0, 'NETWORK');
  }

  if (response.status === 401) {
    // token ausente/expirado/inválido - encerra a sessão local
    clearToken();
    throw new ApiError('Sua sessão expirou. Faça login novamente.', 401, 'SESSAO_EXPIRADA');
  }

  if (response.ok) {
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }

  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // corpo vazio/não-JSON
  }

  throw new ApiError(
    body.mensagem ?? body.message ?? 'Não foi possível concluir a solicitação.',
    response.status,
    body.code,
  );
}
