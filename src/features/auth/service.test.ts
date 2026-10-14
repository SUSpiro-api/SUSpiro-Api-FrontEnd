import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService } from './service';
import { clearToken, getToken } from './token';

const fetchMock = vi.fn();

afterEach(() => {
  fetchMock.mockReset();
  clearToken();
  vi.unstubAllGlobals();
});

describe('authService', () => {
  it('preserva compatibilidade com a API que devolve JWT no corpo do login', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
    const token = [
      encode({ alg: 'HS256', typ: 'JWT' }),
      encode({ sub: '52998224725', nome: 'Dr. Teste', perfil: 'MEDICO', iat: now, exp: now + 3600 }),
      'assinatura',
    ].join('.');

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ token, senhaProvisoria: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    const user = await authService.login({ cpf: '52998224725', password: 'senha' });

    expect(user.sub).toBe('52998224725');
    expect(user.perfil).toBe('MEDICO');
    expect(getToken()).toBe(token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
