import { authenticatedFetch } from '../../api/httpClient';
import { guideApiRoutes } from './guideApiRoutes';
import type { GuideRepository } from './guideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from './types';
import { ApiError } from '../../api/httpClient';
import { GUIDE_PRIORITIES, GUIDE_STATUSES, GUIDE_TYPES } from './types';

export class HttpGuideRepository implements GuideRepository {
  async create(input: CreateGuideInput, _actor: GuideActor): Promise<Guide> {
    if (!isUuid(input.pacienteId)) {
      throw new ApiError('O paciente selecionado não possui um UUID válido. Pesquise novamente pelo CPF de um paciente cadastrado.', 400, 'DADOS_INVALIDOS');
    }
    return authenticatedFetch<Guide>(guideApiRoutes.collection, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async listByRequester(_actorId: number): Promise<Guide[]> {
    return authenticatedFetch<Guide[]>(guideApiRoutes.mine);
  }

  async listPending(): Promise<Guide[]> {
    return authenticatedFetch<Guide[]>(guideApiRoutes.pending);
  }

  async listByPatient(patientId: string): Promise<Guide[]> {
    if (!isUuid(patientId)) {
      throw new ApiError('O paciente selecionado não possui um UUID válido. Pesquise novamente pelo CPF.', 400, 'DADOS_INVALIDOS');
    }

    const response: unknown = await authenticatedFetch<unknown>(guideApiRoutes.patient(patientId));
    if (!Array.isArray(response) || !response.every(isGuideResponse)) {
      throw new ApiError('A API retornou o histórico do paciente em formato inesperado.', 502, 'INVALID_GUIDE_RESPONSE');
    }
    return response;
  }

  async schedule(id: number, input: ScheduleGuideInput, _actor: GuideActor): Promise<Guide> {
    return authenticatedFetch<Guide>(guideApiRoutes.schedule(id), {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isGuideResponse(value: unknown): value is Guide {
  if (!value || typeof value !== 'object') return false;
  const guide = value as Partial<Guide>;
  return typeof guide.id === 'number'
    && Number.isFinite(guide.id)
    && isUuid(guide.pacienteId ?? '')
    && typeof guide.pacienteNome === 'string'
    && typeof guide.pacienteCpf === 'string'
    && GUIDE_TYPES.includes(guide.tipo as (typeof GUIDE_TYPES)[number])
    && typeof guide.dataSolicitada === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(guide.dataSolicitada)
    && GUIDE_PRIORITIES.includes(guide.prioridade as (typeof GUIDE_PRIORITIES)[number])
    && GUIDE_STATUSES.includes(guide.status as (typeof GUIDE_STATUSES)[number])
    && typeof guide.solicitanteId === 'number'
    && Number.isFinite(guide.solicitanteId)
    && typeof guide.solicitanteNome === 'string'
    && isOptionalText(guide.protocolo)
    && isOptionalText(guide.especialidade)
    && isOptionalText(guide.detalhe)
    && isOptionalText(guide.observacao)
    && isOptionalText(guide.dataAgendamento)
    && isOptionalText(guide.horaAgendamento)
    && isOptionalText(guide.estabelecimentoNome)
    && isOptionalText(guide.estabelecimentoEndereco)
    && isOptionalText(guide.estabelecimentoCidade)
    && isOptionalText(guide.estabelecimentoEstado)
    && isOptionalText(guide.agendadoPorNome)
    && (guide.agendadoPorId == null || (typeof guide.agendadoPorId === 'number' && Number.isFinite(guide.agendadoPorId)))
    && typeof guide.criadoEm === 'string';
}

function isOptionalText(value: unknown): boolean {
  return value == null || typeof value === 'string';
}
