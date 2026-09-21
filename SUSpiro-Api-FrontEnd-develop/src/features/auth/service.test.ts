import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './service';
import { getToken } from './token';

describe('authService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('logs in with normalized CPF and stores the token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: 'jwt-token' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await authService.login({ cpf: '529.982.247-25', password: 'senha1234' });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      cpf: '52998224725',
      senha: 'senha1234',
    });
    expect(getToken()).toBe('jwt-token');
  });

  it('maps backend login errors to AuthError with their message and code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ mensagem: 'Senha incorreta.', code: 'SENHA_INCORRETA' }), { status: 401 }),
    ));

    await expect(authService.login({ cpf: '529.982.247-25', password: 'errada' })).rejects.toMatchObject({
      message: 'Senha incorreta.',
      code: 'SENHA_INCORRETA',
    });
  });

  it('rejects a successful response without a token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })));
    await expect(authService.login({ cpf: '529.982.247-25', password: 'senha1234' })).rejects.toMatchObject({
      code: 'UNKNOWN',
    });
  });
});
