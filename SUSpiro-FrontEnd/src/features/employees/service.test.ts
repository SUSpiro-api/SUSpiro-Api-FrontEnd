import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cadastrarFuncionario } from './service';
import { authenticatedFetch } from '../../core/api/httpClient';

vi.mock('../../api/httpClient', () => ({ authenticatedFetch: vi.fn() }));

describe('employee service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('normalizes CPF and trims the name before sending', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue({ id: 1, nome: 'Maria', cpf: '52998224725', perfil: 'MEDICO', ativo: true });

    await cadastrarFuncionario({
      nome: ' Maria ',
      cpf: '529.982.247-25',
      senha: 'senha1234',
      perfil: 'MEDICO',
    });

    expect(authenticatedFetch).toHaveBeenCalledWith('/usuarios', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ nome: 'Maria', cpf: '52998224725', senha: 'senha1234', perfil: 'MEDICO' }),
    }));
  });
});
