import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/httpClient';
import type { GuideRepository } from './guideRepository';
import { LocalGuideRepository, readLocalGuides } from './localGuideRepository';
import { ResilientGuideRepository } from './resilientGuideRepository';
import type { CreateGuideInput, Guide } from './types';

const actor = { id: 2, name: 'Dr. Teste' };
const input: CreateGuideInput = {
  pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
  pacienteNome: 'Pessoa Sintética',
  pacienteCpf: '11144477735',
  tipo: 'CONSULTA',
  especialidade: 'Cardiologia',
  dataSolicitada: '2026-10-20',
  prioridade: 'NORMAL',
};

function remoteStub(overrides: Partial<GuideRepository> = {}): GuideRepository {
  return {
    create: vi.fn(),
    listByRequester: vi.fn().mockResolvedValue([]),
    listByPatient: vi.fn().mockResolvedValue([]),
    listPending: vi.fn().mockResolvedValue([]),
    schedule: vi.fn(),
    ...overrides,
  };
}

function serverGuide(id: number): Guide {
  return {
    id,
    ...input,
    especialidade: input.especialidade,
    status: 'AGUARDANDO_AGENDAMENTO',
    solicitanteId: actor.id,
    solicitanteNome: actor.name,
    criadoEm: new Date().toISOString(),
  };
}

describe('ResilientGuideRepository', () => {
  beforeEach(() => localStorage.clear());

  it('salva localmente quando o endpoint de guias não existe (404)', async () => {
    const remote = remoteStub({
      create: vi.fn().mockRejectedValue(new ApiError('Não foi possível concluir a solicitação.', 404)),
      listPending: vi.fn().mockRejectedValue(new ApiError('Não encontrado', 404)),
      listByRequester: vi.fn().mockRejectedValue(new ApiError('Não encontrado', 404)),
    });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));

    const guide = await repository.create(input, actor);

    expect(guide.sincronizacaoPendente).toBe(true);
    expect(guide.status).toBe('AGUARDANDO_AGENDAMENTO');
    expect(await repository.listPending()).toHaveLength(1);
    expect(await repository.listByRequester(actor.id)).toHaveLength(1);
  });

  it('salva localmente quando não há conexão com o servidor', async () => {
    const remote = remoteStub({
      create: vi.fn().mockRejectedValue(new ApiError('Não foi possível conectar ao serviço.', 0, 'NETWORK')),
    });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));

    const guide = await repository.create(input, actor);
    expect(guide.sincronizacaoPendente).toBe(true);
  });

  it('carrega o histórico do paciente pela API e mantém a ordenação mais recente', async () => {
    const older = { ...serverGuide(10), criadoEm: '2026-10-01T09:00:00' };
    const newer = { ...serverGuide(11), criadoEm: '2026-10-12T09:00:00' };
    const remote = remoteStub({ listByPatient: vi.fn().mockResolvedValue([older, newer]) });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));

    const history = await repository.listByPatient(input.pacienteId);

    expect(remote.listByPatient).toHaveBeenCalledWith(input.pacienteId);
    expect(history.map((guide) => guide.id)).toEqual([11, 10]);
  });

  it('não esconde erros de validação do servidor', async () => {
    const remote = remoteStub({
      create: vi.fn().mockRejectedValue(new ApiError('Data inválida.', 400)),
    });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));

    await expect(repository.create(input, actor)).rejects.toThrow('Data inválida.');
    expect(readLocalGuides()).toHaveLength(0);
  });

  it('usa a resposta do servidor quando a API está disponível', async () => {
    const remote = remoteStub({ create: vi.fn().mockResolvedValue(serverGuide(10)) });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));

    const guide = await repository.create(input, actor);
    expect(guide.id).toBe(10);
    expect(guide.sincronizacaoPendente).toBeUndefined();
    expect(readLocalGuides()).toHaveLength(0);
  });

  it('reenvia ao backend as guias guardadas localmente quando ele volta', async () => {
    const create = vi.fn()
      .mockRejectedValueOnce(new ApiError('Indisponível', 503))
      .mockResolvedValueOnce(serverGuide(77));
    const remote = remoteStub({ create });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));

    await repository.create(input, actor);
    expect(readLocalGuides()).toHaveLength(1);

    await repository.listPending();

    expect(create).toHaveBeenCalledTimes(2);
    expect(readLocalGuides()).toHaveLength(0);
  });

  it('agenda localmente uma guia que ainda não foi sincronizada', async () => {
    const remote = remoteStub({
      create: vi.fn().mockRejectedValue(new ApiError('Não encontrado', 404)),
      listPending: vi.fn().mockRejectedValue(new ApiError('Não encontrado', 404)),
    });
    const repository = new ResilientGuideRepository(remote, new LocalGuideRepository(true));
    const guide = await repository.create(input, actor);

    const scheduled = await repository.schedule(guide.id, {
      dataAgendamento: '2026-10-21',
      horaAgendamento: '09:00',
      estabelecimentoNome: 'Unidade de Saúde Central',
      estabelecimentoEndereco: 'Rua das Palmeiras, 120',
      estabelecimentoCidade: 'Cotia',
      estabelecimentoEstado: 'SP',
    }, actor);

    expect(scheduled.status).toBe('AGENDADO');
    expect(remote.schedule).not.toHaveBeenCalled();
    expect(await repository.listPending()).toHaveLength(0);
  });
});
