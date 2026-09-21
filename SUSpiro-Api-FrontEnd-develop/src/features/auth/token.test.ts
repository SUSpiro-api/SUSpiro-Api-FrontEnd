import { describe, expect, it, beforeEach } from 'vitest';
import { decodeToken, getCurrentUser, hasValidSession, isTokenExpired, setToken, clearToken } from './token';

function base64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function token(exp: number) {
  return [
    base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
    base64Url(JSON.stringify({ sub: '52998224725', perfil: 'ADMIN', exp, iat: Math.floor(Date.now() / 1000) })),
    'signature',
  ].join('.');
}

describe('token session helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('decodes a valid JWT payload', () => {
    const jwt = token(Math.floor(Date.now() / 1000) + 60);
    expect(decodeToken(jwt)?.perfil).toBe('ADMIN');
  });

  it('rejects expired and malformed tokens', () => {
    expect(isTokenExpired(token(Math.floor(Date.now() / 1000) - 1))).toBe(true);
    expect(decodeToken('invalid')).toBeNull();
  });

  it('exposes the current valid session from storage', () => {
    const jwt = token(Math.floor(Date.now() / 1000) + 60);
    setToken(jwt);
    expect(hasValidSession()).toBe(true);
    expect(getCurrentUser()?.sub).toBe('52998224725');
    clearToken();
    expect(hasValidSession()).toBe(false);
  });
});
