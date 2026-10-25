// Testa a montagem da área do paciente e o isolamento das consultas autenticadas.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticatedFetch } from '../../api/httpClient';
import { loadPatientCareData } from './data';
import * as guidesModule from '../guides';
import * as localRepository from '../guides/localGuideRepository';

vi.mock('../../api/httpClient', () => ({ authenticatedFetch: vi.fn() }));

const CPF_ADMIN = '93541134780';
const CPF_PACIENTE = '16899546043';

const requisicao = {
  id: 50,
  protocolo: 'AB12CD34',
  pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
  pacienteNome: 'Beatriz Almeida',
  solicitante: 'Dra. Marina Duarte',
  descricao: 'Exame de sangue',
  status: 'AGENDADA' as const,
  dataVencimento: '2026-11-10',
  observacao: null,
  agendamento: {
    dataHora: '2026-10-25T09:30:00',
    local: 'Laboratório Central',
    observacao: null,
    agendadoPor: 'Recepção',
  },
};

describe('loadPatientCareData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(authenticatedFetch).mockReset();
  });

  it('mostra uma lista vazia quando o paciente não tem guias nem requisições', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const data = await loadPatientCareData(CPF_PACIENTE, false);

    expect(data.items).toHaveLength(0);
    expect(data.demoPreview).toBe(false);
    expect(data.fromServer).toBe(true);
    expect(authenticatedFetch).toHaveBeenNthCalledWith(1, '/guias/minhas', { retries: 0 });
    expect(authenticatedFetch).toHaveBeenNthCalledWith(2, '/requisicoes/minhas', { retries: 0 });
  });

  it('combina requisições reais e mapeia agendamento, local e profissional', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([]).mockResolvedValueOnce([requisicao]);
    vi.spyOn(localRepository, 'readLocalGuides').mockReturnValue([]);
    vi.spyOn(guidesModule, 'listPendingGuides').mockResolvedValue([]);

    const data = await loadPatientCareData(CPF_PACIENTE, false);

    expect(data.items).toHaveLength(1);
    expect(data.items[0]).toMatchObject({
      title: 'Exame de sangue',
      type: 'exame',
      status: 'agendado',
      date: '2026-10-25',
      time: '09:30',
      professional: 'Recepção',
      location: 'Laboratório Central',
      note: null,
      referenceCode: 'AB12CD34',
      source: 'requisicao',
    });
    expect(localRepository.readLocalGuides).not.toHaveBeenCalled();
    expect(guidesModule.listPendingGuides).not.toHaveBeenCalled();
  });

  it('não usa dados locais nem fictícios quando a API está ativa', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    vi.spyOn(localRepository, 'readLocalGuides').mockReturnValue([]);
    vi.spyOn(guidesModule, 'listPendingGuides').mockResolvedValue([]);

    const data = await loadPatientCareData(CPF_ADMIN, true);

    expect(data.items).toHaveLength(0);
    expect(data.demoPreview).toBe(false);
    expect(localRepository.readLocalGuides).not.toHaveBeenCalled();
    expect(guidesModule.listPendingGuides).not.toHaveBeenCalled();
  });

  it('falha de forma segura se qualquer endpoint da API não estiver disponível', async () => {
    vi.mocked(authenticatedFetch).mockRejectedValueOnce(new Error('API indisponível'));
    vi.spyOn(localRepository, 'readLocalGuides').mockReturnValue([]);

    const data = await loadPatientCareData(CPF_PACIENTE, false);

    expect(data.items).toHaveLength(0);
    expect(data.fromServer).toBe(false);
    expect(data.demoPreview).toBe(false);
    expect(localRepository.readLocalGuides).not.toHaveBeenCalled();
  });
});
