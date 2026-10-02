import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticatedFetch, ApiError } from './httpClient';
import { setToken, getToken, clearToken } from '../features/auth/token';

describe('httpClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('uses the local /api proxy when VITE_API_URL is not configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await authenticatedFetch('/usuarios');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/usuarios'),
      expect.anything(),
    );
  });

  it('sends bearer token to authenticated endpoints', async () => {
    setToken('token-123');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await authenticatedFetch('/usuarios');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
      }),
    );
  });

  it('clears token and emits session-expired event on 401', async () => {
    setToken('token-123');
    const listener = vi.fn();
    window.addEventListener('suspiro:auth-expired', listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ mensagem: 'unauthorized' }), { status: 401 })));

    await expect(authenticatedFetch('/usuarios')).rejects.toMatchObject({
      status: 401,
      code: 'SESSAO_EXPIRADA',
    });
    expect(getToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('suspiro:auth-expired', listener);
    clearToken();
  });

  it('converts network failures to ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(authenticatedFetch('/usuarios')).rejects.toEqual(
      expect.objectContaining({ status: 0, code: 'NETWORK' }),
    );
  });

  it('returns the backend message from JSON errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ mensagem: 'CPF já cadastrado.' }), { status: 409 })));
    const request = authenticatedFetch('/usuarios');
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ message: 'CPF já cadastrado.', status: 409 });
  });

  it('removes the technical field names from 400 validation messages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        mensagem: 'nome: O nome é obrigatório.; dataNascimento: A data de nascimento deve estar no passado.',
      }),
      { status: 400 },
    )));

    await expect(authenticatedFetch('/pacientes')).rejects.toMatchObject({
      status: 400,
      message: 'O nome é obrigatório. A data de nascimento deve estar no passado.',
    });
  });

  it('keeps non-400 messages untouched, even when they contain a colon', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ mensagem: 'Atenção: CPF de cidadão já cadastrado.' }),
      { status: 409 },
    )));

    await expect(authenticatedFetch('/pacientes')).rejects.toMatchObject({
      status: 409,
      message: 'Atenção: CPF de cidadão já cadastrado.',
    });
  });

  it('surfaces the back-end message on 403 without ending the session', async () => {
    setToken('token-123');
    const listener = vi.fn();
    window.addEventListener('suspiro:auth-expired', listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ mensagem: 'Você não tem permissão para realizar essa ação.' }),
      { status: 403 },
    )));

    await expect(authenticatedFetch('/usuarios')).rejects.toMatchObject({
      status: 403,
      message: 'Você não tem permissão para realizar essa ação.',
    });
    expect(getToken()).toBe('token-123');
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('suspiro:auth-expired', listener);
  });
});
