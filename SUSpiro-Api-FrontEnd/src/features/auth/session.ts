import { clearToken, decodeToken, getToken } from './token';

/** Evento disparado quando a sessão deixa de valer (token expirado ou rejeitado pela API). */
export const AUTH_EXPIRED_EVENT = 'suspiro:auth-expired';

// Limite do setTimeout (~24,8 dias). Acima disso o navegador dispararia na hora.
const MAX_TIMEOUT_MS = 2_147_483_647;

/** Milissegundos até o token salvo expirar, ou null se não houver token legível. */
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
 * Avisa quando a sessão expira por tempo, mesmo sem nenhuma chamada à API
 * (tela aberta e parada, aba em segundo plano, computador que voltou de suspensão).
 * Retorna a função que cancela a vigilância.
 */
export function watchSessionExpiry(): () => void {
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
