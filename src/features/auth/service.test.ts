import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService, dismissWeakPasswordNotice } from './service';
import { clearToken, getToken, precisaTrocarSenha, temAvisoSenhaFraca, setToken } from './token';

const fetchMock = vi.fn();

afterEach(() => {
  fetchMock.mockReset();
  clearToken();
  vi.unstubAllGlobals();
});

describe('authService', () => {
  it('consome o contrato real do backend e mantém o CPF como identidade da sessão', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
    const token = [
      encode({ alg: 'HS256', typ: 'JWT' }),
      encode({ sub: '11144477735', perfil: 'MEDICO', ver: 0, iat: now, exp: now + 3600 }),
      'assinatura',
    ].join('.');

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ token, senhaProvisoria: false, user: { id: 7, cpf: '11144477735', nome: 'Dr. Teste', perfil: 'MEDICO', senhaProvisoria: false } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    const user = await authService.login({ cpf: '111.444.777-35', password: 'senha' });

    expect(user.sub).toBe('11144477735');
    expect(user.id).toBe('7');
    expect(user.perfil).toBe('MEDICO');
    expect(getToken()).toBe(token);
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      body: JSON.stringify({ cpf: '11144477735', senha: 'senha' }),
    }));
  });

  it('impõe o fluxo de troca de senha quando o backend marca o primeiro acesso', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
    const token = [
      encode({ alg: 'HS256', typ: 'JWT' }),
      encode({ sub: '11144477735', perfil: 'PACIENTE', ver: 0, iat: now, exp: now + 3600 }),
      'assinatura',
    ].join('.');

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      token,
      senhaProvisoria: true,
      user: { id: 9, cpf: '11144477735', nome: 'Maria', perfil: 'PACIENTE', senhaProvisoria: true },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    const user = await authService.login({ cpf: '111.444.777-35', password: '20051990' });

    expect(user.perfil).toBe('PACIENTE');
    expect(precisaTrocarSenha()).toBe(true);
    expect(temAvisoSenhaFraca()).toBe(false);
  });

  it('dismisses the legacy weak-password notice locally without calling a missing API endpoint', async () => {
    vi.stubGlobal('fetch', fetchMock);
    await dismissWeakPasswordNotice();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(temAvisoSenhaFraca()).toBe(false);
  });

  it('revokes the server token when logging out of a Bearer session', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
    const token = [encode({ alg: 'HS256' }), encode({ sub: '11144477735', iat: now, exp: now + 3600 }), 'assinatura'].join('.');
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    setToken(token);

    await authService.logout();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/auth/logout'), expect.objectContaining({ method: 'POST' }));
    expect(getToken()).toBeNull();
  });
});
