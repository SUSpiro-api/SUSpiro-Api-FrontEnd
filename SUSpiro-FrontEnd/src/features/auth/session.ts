import { clearToken, decodeToken, getToken } from './token';

/** Evento disparado quando a sessão deixa de valer (expirada ou rejeitada pela API). */
export const AUTH_EXPIRED_EVENT = 'suspiro:auth-expired';

const MAX_TIMEOUT_MS = 2_147_483_647;

export function msUntilSessionExpires(now: number = Date.now()): number | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  return Math.max(0, payload.exp * 1000 - now);
}

export function expireSession(): void {
  clearToken();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

/**
 * O modo cookie não expõe o JWT ao JavaScript. Nesse modo a validade da sessão
 * é responsabilidade do servidor e o frontend reage aos 401.
 */
export function watchSessionExpiry(): () => void {
  // No modo cookie, o JWT é HttpOnly e não existe token para o JavaScript observar.
  // A expiração é detectada pelo backend via HTTP 401.
  if (!getToken()) return () => undefined;

  const check = () => {
    const remaining = msUntilSessionExpires();
    if (remaining === null || remaining <= 0) {
      expireSession();
      return false;
    }
    return true;
  };

  if (!check()) return () => undefined;

  const remaining = msUntilSessionExpires() ?? 0;
  const timer = window.setTimeout(check, Math.min(remaining, MAX_TIMEOUT_MS));
  const onVisible = () => {
    if (document.visibilityState === 'visible') check();
  };

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', check);

  return () => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', check);
  };
}
