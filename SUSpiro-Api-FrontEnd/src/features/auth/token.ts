import type { PerfilUsuario } from './types';

const TOKEN_KEY = 'suspiro.auth.token';

export interface TokenPayload {
  sub: string;
  nome?: string;
  perfil?: PerfilUsuario;
  exp: number;
  iat: number;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage pode estar indisponível em ambientes restritos.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage pode estar indisponível em ambientes restritos.
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as Partial<TokenPayload>;

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number' ||
      typeof payload.iat !== 'number'
    ) {
      return null;
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function hasValidSession(): boolean {
  const token = getToken();
  return Boolean(token && !isTokenExpired(token));
}

export function getCurrentUser(): TokenPayload | null {
  const token = getToken();
  if (!token || isTokenExpired(token)) return null;
  return decodeToken(token);
}
