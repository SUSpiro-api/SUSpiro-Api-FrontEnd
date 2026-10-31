import { clearToken, decodeToken, getToken } from './token';

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

export function watchSessionExpiry(): () => void {

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
