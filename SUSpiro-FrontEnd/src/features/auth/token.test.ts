import { afterEach, describe, expect, it } from 'vitest';
import { clearToken, decodeToken, getCurrentUser, getToken, hasValidSession, setToken } from './token';

function makeToken(exp: number, perfil = 'MEDICO') {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: '52998224725', nome: 'Teste', perfil, exp, iat: exp - 60 }));
  return `${header}.${payload}.signature`;
}

describe('token em memória', () => {
  afterEach(() => clearToken());

  it('não persiste o JWT em nenhum storage do navegador', () => {
    const jwt = makeToken(Math.floor(Date.now() / 1000) + 60);
    setToken(jwt);

    expect(getToken()).toBe(jwt);
    expect(window.localStorage.getItem('suspiro.auth.token')).toBeNull();
    expect(window.sessionStorage.getItem('suspiro.auth.token')).toBeNull();
  });

  it('decodifica um JWT válido', () => {
    const jwt = makeToken(Math.floor(Date.now() / 1000) + 60);
    expect(decodeToken(jwt)?.sub).toBe('52998224725');
  });

  it('não mantém token expirado em memória', () => {
    const jwt = makeToken(Math.floor(Date.now() / 1000) - 1);
    setToken(jwt);
    expect(getToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
    expect(hasValidSession()).toBe(false);
  });
});
