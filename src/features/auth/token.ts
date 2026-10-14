// Guarda os dados do usuário e o token durante o uso do sistema.

import type { AuthUser, PerfilUsuario } from './types';

export interface TokenPayload {
  sub: string;
  nome?: string;
  perfil?: PerfilUsuario;
  exp: number;
  iat: number;
}

// O token fica só na memória e não é salvo no navegador.
let inMemoryToken: string | null = null;
let inMemoryUser: AuthUser | null = null;
const TEMP_PASSWORD_KEY = 'suspiro.auth.senhaProvisoria';

export function precisaTrocarSenha(): boolean {
  try {
    return sessionStorage.getItem(TEMP_PASSWORD_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSenhaProvisoria(provisoria: boolean): void {
  try {
    if (provisoria) sessionStorage.setItem(TEMP_PASSWORD_KEY, 'true');
    else sessionStorage.removeItem(TEMP_PASSWORD_KEY);
  } catch {

  }
}

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
  setSenhaProvisoria(false);
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
