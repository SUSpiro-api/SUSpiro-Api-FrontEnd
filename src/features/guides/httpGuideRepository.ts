// Busca e envia guias usando a API do backend.

import { authenticatedFetch } from '../../api/httpClient';
import { guideApiRoutes } from './guideApiRoutes';
import type { GuideRepository } from './guideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from './types';

export class HttpGuideRepository implements GuideRepository {
  async create(input: CreateGuideInput, _actor: GuideActor): Promise<Guide> {
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
