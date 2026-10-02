import { authenticatedFetch } from '../../../core/api/httpClient';
import { guideApiRoutes } from './guideApiRoutes';
import type { GuideRepository } from '../domain/GuideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from '../domain/types';

/**
 * Adapter HTTP da API de guias integrada ao backend Spring Boot.
 * A UI e os casos de uso não conhecem URL, payload HTTP ou autenticação.
 */
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
