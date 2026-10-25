import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cadastrarFuncionario } from './service';
import { authenticatedFetch } from '../../api/httpClient';

vi.mock('../../api/httpClient', () => ({ authenticatedFetch: vi.fn() }));

describe('employee service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('normalizes CPF and email and sends the manager-defined temporary password', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue({ id: 1, nome: 'Maria', cpf: '52998224725', email: 'maria@example.com', perfil: 'MEDICO', ativo: true });
    await cadastrarFuncionario({
      nome: ' Maria ', cpf: '529.982.247-25', email: ' Maria@Example.com ', perfil: 'MEDICO', senhaTemporaria: 'TempSenha#2026',
    });
    expect(authenticatedFetch).toHaveBeenCalledWith('/usuarios', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ nome: 'Maria', cpf: '52998224725', email: 'maria@example.com', perfil: 'MEDICO', senhaTemporaria: 'TempSenha#2026' }),
    }));
  });
});
