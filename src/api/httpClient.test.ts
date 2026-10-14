import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticatedFetch, ApiError } from './httpClient';
import { getToken, setToken, clearToken } from '../features/auth/token';

describe('httpClient — compatibilidade com JWT em memória', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    clearToken();
  });

  afterEach(() => {
    clearToken();
  });

  it('envia Authorization Bearer para o backend legado e não exige cookie de sessão', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    setToken(makeToken());

    await authenticatedFetch('/usuarios');

    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ credentials: 'same-origin' }));
    expect(fetchMock.mock.calls[0][1].headers).toHaveProperty('Authorization', `Bearer ${getToken()}`);
  });

  it('usa o proxy local /api quando VITE_API_URL não está configurado', async () => {
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

  it('não exige token CSRF quando está no modo JWT compatível', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-123';

    await authenticatedFetch('/pacientes', { method: 'POST', body: JSON.stringify({ nome: 'Teste' }) });

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('X-CSRF-TOKEN');
  });

  it('encerra a sessão quando a API legada rejeita um JWT com 401', async () => {
    const listener = vi.fn();
    window.addEventListener('suspiro:auth-expired', listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ mensagem: 'não autorizado' }), { status: 401 }),
    ));

    setToken(makeToken());
    await expect(authenticatedFetch('/guias/minhas')).rejects.toMatchObject({
      status: 401,
      code: 'SESSAO_EXPIRADA',
    });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getToken()).toBeNull();
    window.removeEventListener('suspiro:auth-expired', listener);
  });

  it('encerra a sessão quando /auth/me retorna 401', async () => {
    const listener = vi.fn();
    window.addEventListener('suspiro:auth-expired', listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ mensagem: 'sessão inválida' }), { status: 401 }),
    ));

    await expect(authenticatedFetch('/auth/me')).rejects.toMatchObject({
      status: 401,
      code: 'SESSAO_EXPIRADA',
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('suspiro:auth-expired', listener);
  });

  it('converte falha de rede em ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(authenticatedFetch('/usuarios')).rejects.toEqual(
      expect.objectContaining({ status: 0, code: 'NETWORK' }),
    );
  });

  it('retorna a mensagem do backend em erros JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ mensagem: 'CPF já cadastrado.' }),
      { status: 409 },
    )));
    await expect(authenticatedFetch('/usuarios')).rejects.toMatchObject({
      status: 409,
      message: 'CPF já cadastrado.',
    });
  });

  it('remove campos técnicos de mensagens 400 de validação', async () => {
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

  it('mantém a mensagem original em 403 e não encerra a sessão', async () => {
    setToken(makeToken());
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
    expect(getToken()).not.toBeNull();
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('suspiro:auth-expired', listener);
  });
});

function makeToken(): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);
  return [
    encode({ alg: 'HS256' }),
    encode({ sub: '2', perfil: 'MEDICO', iat: now, exp: now + 3600 }),
    'assinatura',
  ].join('.');
}
