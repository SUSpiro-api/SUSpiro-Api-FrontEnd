import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, authenticatedFetch } from '../../api/httpClient';
import { HttpGuideRepository } from './httpGuideRepository';

vi.mock('../../api/httpClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/httpClient')>();
  return { ...actual, authenticatedFetch: vi.fn() };
});

const patientId = '00000000-0000-4000-8000-000000000001';
const guide = {
  id: 17,
  protocolo: 'SUS-RET-00017',
  pacienteId: patientId,
  pacienteNome: 'Mariana Oliveira Santos',
  pacienteCpf: '11144477735',
  tipo: 'RETORNO' as const,
  detalhe: 'Retorno cardiológico',
  dataSolicitada: '2026-11-05',
  prioridade: 'NORMAL' as const,
  status: 'AGUARDANDO_AGENDAMENTO' as const,
  solicitanteId: 3,
  solicitanteNome: 'Dra. Ana',
  criadoEm: '2026-10-30T12:00:00',
};

beforeEach(() => vi.clearAllMocks());

describe('HttpGuideRepository.listByPatient', () => {
  it('uses the patient-history endpoint and returns the GuiaResponse contract', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue([guide]);

    await expect(new HttpGuideRepository().listByPatient(patientId)).resolves.toEqual([guide]);
    expect(authenticatedFetch).toHaveBeenCalledWith(`/guias/paciente/${patientId}`);
  });

  it('rejects invalid patient identifiers before making a request', async () => {
    await expect(new HttpGuideRepository().listByPatient('not-a-uuid')).rejects.toBeInstanceOf(ApiError);
    expect(authenticatedFetch).not.toHaveBeenCalled();
  });

  it('rejects an unexpected response instead of letting the dashboard crash', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValue([{ ...guide, tipo: 'TIPO_INVALIDO' }]);

    await expect(new HttpGuideRepository().listByPatient(patientId)).rejects.toMatchObject({
      code: 'INVALID_GUIDE_RESPONSE',
      status: 502,
    });
  });
});
