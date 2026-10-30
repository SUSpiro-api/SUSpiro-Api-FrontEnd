import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticatedFetch } from '../../api/httpClient';
import { loadPatientCareData } from './data';

vi.mock('../../api/httpClient', () => ({ authenticatedFetch: vi.fn() }));

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

    const data = await loadPatientCareData();

    expect(data.items).toHaveLength(0);
    expect(data.fromServer).toBe(true);
    expect(authenticatedFetch).toHaveBeenNthCalledWith(1, '/guias/minhas', { retries: 0 });
    expect(authenticatedFetch).toHaveBeenNthCalledWith(2, '/requisicoes/minhas', { retries: 0 });
  });


  it('mostra a unidade selecionada quando uma guia foi agendada', async () => {
    const guia = {
      id: 71,
      protocolo: 'GUIA-71',
      pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
      pacienteNome: 'Beatriz Almeida',
      pacienteCpf: '16899546043',
      tipo: 'CONSULTA' as const,
      especialidade: 'Cardiologia',
      detalhe: null,
      dataSolicitada: '2026-10-20',
      observacao: null,
      prioridade: 'NORMAL' as const,
      status: 'AGENDADO' as const,
      solicitanteId: 9,
      solicitanteNome: 'Dra. Marina Duarte',
      dataAgendamento: '2026-11-02',
      horaAgendamento: '09:30:00',
      estabelecimentoNome: 'Unidade Regional de Saúde',
      estabelecimentoEndereco: 'Rua das Palmeiras, 120',
      estabelecimentoCidade: 'Cotia',
      estabelecimentoEstado: 'SP',
      criadoEm: '2026-10-20T10:00:00',
    };
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([guia]).mockResolvedValueOnce([]);

    const data = await loadPatientCareData();

    expect(data.items[0]).toMatchObject({
      status: 'agendado',
      location: 'Unidade Regional de Saúde · Rua das Palmeiras, 120 · Cotia/SP',
    });
  });

  it('combina requisições reais e mapeia agendamento, local e profissional', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([]).mockResolvedValueOnce([requisicao]);

    const data = await loadPatientCareData();

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
  });

  it('usa somente os dados retornados pela API autenticada', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const data = await loadPatientCareData();

    expect(data.items).toHaveLength(0);
  });

  it('ignora registros incompletos sem derrubar o dashboard do paciente', async () => {
    vi.mocked(authenticatedFetch).mockResolvedValueOnce([null, {}, { id: 'inválido' }]).mockResolvedValueOnce([{}]);

    const data = await loadPatientCareData();

    expect(data.fromServer).toBe(true);
    expect(data.items).toHaveLength(0);
  });

  it('falha de forma segura se qualquer endpoint da API não estiver disponível', async () => {
    vi.mocked(authenticatedFetch).mockRejectedValueOnce(new Error('API indisponível'));

    const data = await loadPatientCareData();

    expect(data.items).toHaveLength(0);
    expect(data.fromServer).toBe(false);
  });
});
