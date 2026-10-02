import type { AuthUser, PerfilUsuario } from './types';

/**
 * Compatibilidade temporária com o contrato JWT legado.
 *
 * O token fica SOMENTE em memória. Ele nunca é persistido em localStorage,
 * sessionStorage, IndexedDB ou cookie criado pelo JavaScript.
 * Em produção, o modo recomendado é cookie HttpOnly, no qual nem mesmo este
 * objeto recebe o JWT.
 */
export interface TokenPayload {
  sub: string;
  nome?: string;
  perfil?: PerfilUsuario;
  exp: number;
  iat: number;
}

let inMemoryToken: string | null = null;
let inMemoryUser: AuthUser | null = null;

export function getToken(): string | null {
  return inMemoryToken;
}

export function setToken(token: string): void {
  const payload = decodeToken(token);
  if (!payload || isTokenExpired(token)) {
    clearToken();
    return;
  }

  inMemoryToken = token;
  inMemoryUser = payload;
}

export function setCurrentUser(user: AuthUser): void {
  inMemoryUser = user;
}

export function clearToken(): void {
  inMemoryToken = null;
  inMemoryUser = null;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const json = atob(padded);
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
  if (!inMemoryUser) return false;
  return !inMemoryToken || !isTokenExpired(inMemoryToken);
}

export function getCurrentUser(): AuthUser | null {
  if (!inMemoryUser) return null;
  if (inMemoryToken && isTokenExpired(inMemoryToken)) {
    clearToken();
    return null;
  }
  return inMemoryUser;
}
