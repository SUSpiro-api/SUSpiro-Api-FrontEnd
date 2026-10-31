// Guarda a sessão em memória e, para sobreviver a refresh, em sessionStorage (nunca localStorage).

import type { AuthUser, PerfilUsuario } from './types';

export interface TokenPayload {
  sub: string;
  nome?: string;
  perfil?: PerfilUsuario;
  exp: number;
  iat: number;
}

const TOKEN_KEY = 'suspiro.auth.token';
const USER_KEY = 'suspiro.auth.user';
const TEMP_PASSWORD_KEY = 'suspiro.auth.senhaProvisoria';
const WEAK_PASSWORD_NOTICE_KEY = 'suspiro.auth.avisoSenhaFraca';

let inMemoryToken: string | null = null;
let inMemoryUser: AuthUser | null = null;

function readSessionStorage(key: string): string | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key); }
  catch { return null; }
}

function writeSessionStorage(key: string, value: string | null): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch { /* O app continua funcional em navegadores que bloqueiam o storage. */ }
}

export function precisaTrocarSenha(): boolean {
  return readSessionStorage(TEMP_PASSWORD_KEY) === 'true';
}

export function setSenhaProvisoria(provisoria: boolean): void {
  writeSessionStorage(TEMP_PASSWORD_KEY, provisoria ? 'true' : null);
}

export function temAvisoSenhaFraca(): boolean {
  return readSessionStorage(WEAK_PASSWORD_NOTICE_KEY) === 'true';
}

export function setAvisoSenhaFraca(pendente: boolean): void {
  writeSessionStorage(WEAK_PASSWORD_NOTICE_KEY, pendente ? 'true' : null);
}

export function getToken(): string | null {
  if (inMemoryToken && !isTokenExpired(inMemoryToken)) return inMemoryToken;
  const stored = readSessionStorage(TOKEN_KEY);
  if (!stored) { inMemoryToken = null; return null; }
  if (!decodeToken(stored) || isTokenExpired(stored)) {
    writeSessionStorage(TOKEN_KEY, null);
    writeSessionStorage(USER_KEY, null);
    inMemoryToken = null;
    inMemoryUser = null;
    return null;
  }
  inMemoryToken = stored;
  if (!inMemoryUser) inMemoryUser = readStoredUser();
  return stored;
}

export function setToken(token: string): void {
  const payload = decodeToken(token);
  if (!payload || isTokenExpired(token)) { clearToken(); return; }
  const userBeforeRotation = inMemoryUser;
  inMemoryToken = token;
  writeSessionStorage(TOKEN_KEY, token);
  // Ao trocar/rotacionar um token, preserva os dados da sessão já confirmados pela API.
  if (!userBeforeRotation) inMemoryUser = payload;
}

export function setCurrentUser(user: AuthUser): void {
  inMemoryUser = user;
  writeSessionStorage(USER_KEY, JSON.stringify(user));
}

export function clearToken(): void {
  inMemoryToken = null;
  inMemoryUser = null;
  writeSessionStorage(TOKEN_KEY, null);
  writeSessionStorage(USER_KEY, null);
  setSenhaProvisoria(false);
  setAvisoSenhaFraca(false);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as Partial<TokenPayload>;
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return null;
    return payload as TokenPayload;
  } catch { return null; }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function hasValidSession(): boolean {
  return Boolean(getCurrentUser() && getToken());
}

export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  if (inMemoryUser) return inMemoryUser;
  const stored = readStoredUser();
  if (stored) { inMemoryUser = stored; return stored; }
  const payload = decodeToken(token);
  if (payload) { inMemoryUser = payload; return payload; }
  return null;
}

function readStoredUser(): AuthUser | null {
  const value = readSessionStorage(USER_KEY);
  if (!value) return null;
  try {
    const user = JSON.parse(value) as AuthUser;
    if (typeof user?.sub === 'string' && user.sub.length > 0) return user;
  } catch { /* Ignora sessão armazenada inválida e força nova autenticação no próximo acesso. */ }
  writeSessionStorage(USER_KEY, null);
  return null;
}
