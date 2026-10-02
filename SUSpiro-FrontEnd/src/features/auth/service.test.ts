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
  it('em modo cookie não persiste nem lê o JWT do login', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({
        user: { id: 2, nome: 'Dr. Teste', perfil: 'MEDICO' },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));

    const user = await authService.login({ cpf: '52998224725', password: 'senha' });

    expect(user.sub).toBe('2');
    expect(user.perfil).toBe('MEDICO');
    expect(getToken()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ credentials: 'include' }));
  });
});
