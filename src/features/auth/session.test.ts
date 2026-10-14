import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_EXPIRED_EVENT, expireSession, msUntilSessionExpires, watchSessionExpiry } from './session';
import { getToken, setToken } from './token';

function makeToken(expSecondsFromNow: number): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);

  return [
    encode({ alg: 'HS256' }),
    encode({ sub: '52998224725', perfil: 'RECEPCIONISTA', iat: now, exp: now + expSecondsFromNow }),
    'assinatura',
  ].join('.');
}

describe('session', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when there is no token', () => {
    expect(msUntilSessionExpires()).toBeNull();
  });

  it('computes the time left in the session', () => {
    setToken(makeToken(3600));

    const remaining = msUntilSessionExpires() ?? 0;
    expect(remaining).toBeGreaterThan(3_590_000);
    expect(remaining).toBeLessThanOrEqual(3_600_000);
  });

  it('expireSession clears the token and emits the event', () => {
    setToken(makeToken(3600));
    const listener = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    expireSession();

    expect(getToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });

  it('expires the session when the token time runs out, without any API call', () => {
    setToken(makeToken(60));
    const listener = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    const stop = watchSessionExpiry();
    expect(listener).not.toHaveBeenCalled();

    vi.advanceTimersByTime(61_000);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getToken()).toBeNull();
    stop();
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });

  it('never stores an already-expired token, so no session survives to be watched', () => {
    setToken(makeToken(-10));
    const listener = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    expect(getToken()).toBeNull();
    expect(msUntilSessionExpires()).toBeNull();

    watchSessionExpiry();

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });

  it('stops watching after cleanup', () => {
    setToken(makeToken(60));
    const listener = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    watchSessionExpiry()();
    vi.advanceTimersByTime(120_000);

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });
});
