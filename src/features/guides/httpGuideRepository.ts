// Busca e envia guias usando a API do backend.

import { authenticatedFetch } from '../../api/httpClient';
import { guideApiRoutes } from './guideApiRoutes';
import type { GuideRepository } from './guideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from './types';
import { ApiError } from '../../api/httpClient';

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
