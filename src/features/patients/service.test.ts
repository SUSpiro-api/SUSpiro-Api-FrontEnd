import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cadastrarPaciente } from './service';
import { authenticatedFetch } from '../../api/httpClient';

vi.mock('../../api/httpClient', () => ({ authenticatedFetch: vi.fn() }));

const resposta = {
  id: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
  nome: 'Maria',
  cpfMascarado: '•••.•••.•••-25',
  convenio: 'Plano Exemplo',
  email: 'maria@example.com',
  criadoEm: '2026-09-20T00:00:00',
  contaCriada: true,
};

describe('patient service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accepts the minimized patient response and does not return the password', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue(resposta);
    const result = await cadastrarPaciente({
      nome: 'Maria', cpf: '529.982.247-25', dataNascimento: '1990-05-20',
      convenio: 'Plano Exemplo', telefone: '', email: 'maria@example.com',
    });

    expect(result).toMatchObject({ cpfMascarado: '•••.•••.•••-25', convenio: 'Plano Exemplo', contaCriada: true });
    expect(result).not.toHaveProperty('dataNascimento');
    expect(result).not.toHaveProperty('telefone');
    expect(result).not.toHaveProperty('cpf');
    expect(result).not.toHaveProperty('senha');
  });

  it('normalizes CPF, email and telephone before sending', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue(resposta);
    await cadastrarPaciente({
      nome: ' Maria ', cpf: '529.982.247-25', dataNascimento: '1990-05-20',
      convenio: ' Plano Exemplo ', telefone: '(85) 99999-9999', email: ' Maria@Example.com ',
    });

    expect(authenticatedFetch).toHaveBeenCalledWith('/pacientes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        nome: 'Maria', cpf: '52998224725', dataNascimento: '1990-05-20',
        convenio: 'Plano Exemplo', telefone: '8599999999', email: 'maria@example.com',
      }),
    }));
  });
});
