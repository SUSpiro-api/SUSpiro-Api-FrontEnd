import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cadastrarPaciente } from './service';
import { authenticatedFetch } from '../../api/httpClient';

vi.mock('../../api/httpClient', () => ({ authenticatedFetch: vi.fn() }));

describe('patient service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accepts a null telephone in the API response', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue({
      id: 1, nome: 'Maria', cpf: '52998224725', dataNascimento: '1990-05-20', numeroSus: '123456789012345', telefone: null, criadoEm: '2026-09-20T00:00:00',
    });

    const result = await cadastrarPaciente({
      nome: 'Maria', cpf: '529.982.247-25', dataNascimento: '1990-05-20', numeroSus: '123 456 789 012 345', telefone: '',
    });

    expect(result.telefone).toBeNull();
  });

  it('normalizes CPF, CNS and telephone before sending', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue({
      id: 1, nome: 'Maria', cpf: '52998224725', dataNascimento: '1990-05-20', numeroSus: '123456789012345', telefone: '85999999999', criadoEm: '2026-09-20T00:00:00',
    });

    await cadastrarPaciente({
      nome: ' Maria ',
      cpf: '529.982.247-25',
      dataNascimento: '1990-05-20',
      numeroSus: '123 456 789 012 345',
      telefone: '(85) 99999-9999',
    });

    expect(authenticatedFetch).toHaveBeenCalledWith('/pacientes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        nome: 'Maria', cpf: '52998224725', dataNascimento: '1990-05-20', numeroSus: '123456789012345', telefone: '85999999999',
      }),
    }));
  });
});
