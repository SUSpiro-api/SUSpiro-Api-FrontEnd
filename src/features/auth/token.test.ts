import { afterEach, describe, expect, it } from 'vitest';
import { clearToken, decodeToken, getCurrentUser, getToken, hasValidSession, precisaTrocarSenha, setAvisoSenhaFraca, setSenhaProvisoria, setToken, temAvisoSenhaFraca } from './token';

function makeToken(exp: number, perfil = 'MEDICO') {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: '11144477735', nome: 'Teste', perfil, exp, iat: exp - 60 }));
  return `${header}.${payload}.signature`;
}

describe('token de sessão', () => {
  afterEach(() => clearToken());

  it('persiste o JWT apenas no sessionStorage, não no localStorage', () => {
    const jwt = makeToken(Math.floor(Date.now() / 1000) + 60);
    setToken(jwt);

    expect(getToken()).toBe(jwt);
    expect(window.localStorage.getItem('suspiro.auth.token')).toBeNull();
    expect(window.sessionStorage.getItem('suspiro.auth.token')).toBe(jwt);
  });

  it('decodifica um JWT válido', () => {
    const jwt = makeToken(Math.floor(Date.now() / 1000) + 60);
    expect(decodeToken(jwt)?.sub).toBe('11144477735');
  });

  it('mantém apenas a sinalização de troca de senha na sessão atual e limpa no logout', () => {
    setSenhaProvisoria(true);
    expect(precisaTrocarSenha()).toBe(true);
    expect(localStorage.getItem('suspiro.auth.senhaProvisoria')).toBeNull();

    clearToken();
    expect(precisaTrocarSenha()).toBe(false);
  });

  it('mantém o aviso de senha fraca só na sessão atual e limpa no logout', () => {
    setAvisoSenhaFraca(true);
    expect(temAvisoSenhaFraca()).toBe(true);
    expect(localStorage.getItem('suspiro.auth.avisoSenhaFraca')).toBeNull();

    clearToken();
    expect(temAvisoSenhaFraca()).toBe(false);
  });

  it('não mantém token expirado em memória', () => {
    const jwt = makeToken(Math.floor(Date.now() / 1000) - 1);
    setToken(jwt);
    expect(getToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
    expect(hasValidSession()).toBe(false);
  });
});
