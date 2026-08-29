import { AuthError, type AuthService, type LoginFormValues } from './types';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

interface ApiErrorResponse {
  message?: string;
  code?: string;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new AuthError(
      'A API vai ser configurada aqui, Defina VITE_API_URL no ambiente.',
      'NOT_CONFIGURED',
    );
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (response.ok) {
      return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
    }

    let body: ApiErrorResponse = {};
    try {
      body = await response.json() as ApiErrorResponse;
    } catch {
      
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthError(body.message ?? 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
    }

    throw new AuthError(body.message ?? 'Não foi possível concluir a solicitação.', 'UNKNOWN');
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Não foi possível conectar ao serviço.', 'NETWORK');
  }
}

export const authService: AuthService = {
  async login(values: Pick<LoginFormValues, 'identifier' | 'password'>) {
    await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: values.identifier,
        password: values.password,
      }),
    });
  },

  async requestPasswordReset(cpf: string) {
    await request('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ cpf }),
    });
  },
};
