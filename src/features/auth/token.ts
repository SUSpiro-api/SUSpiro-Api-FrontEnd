const TOKEN_KEY = 'suspiro.auth.token';

export interface TokenPayload {
  sub: string; // cpf do usuário
  perfil?: string; // SUPER_ADMIN | ADMIN | USUARIO 
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
    
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SENHA_PROVISORIA_KEY);
  } catch {

  }
}

const SENHA_PROVISORIA_KEY = 'suspiro.auth.senhaProvisoria';

/** Enquanto for true, a API só libera a troca de senha (PATCH /usuarios/me/senha). */
export function precisaTrocarSenha(): boolean {
  try {
    return localStorage.getItem(SENHA_PROVISORIA_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSenhaProvisoria(provisoria: boolean): void {
  try {
    localStorage.setItem(SENHA_PROVISORIA_KEY, String(provisoria));
  } catch {

  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/** Sessão válida */
export function hasValidSession(): boolean {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token as string);
}

export function getCurrentUser(): TokenPayload | null {
  const token = getToken();
  if (!token || isTokenExpired(token)) return null;
  return decodeToken(token);
}
