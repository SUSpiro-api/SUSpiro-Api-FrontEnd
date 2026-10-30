import { getCurrentUser } from '../auth/token';
import type { GuideRepository } from './guideRepository';
import type { CreateGuideInput, Guide, ScheduleGuideInput } from './types';

export function currentGuideActor() {
  const user = getCurrentUser();
  const id = Number(user?.id ?? user?.sub);
  return {
    id: Number.isFinite(id) ? id : 0,
    name: user?.nome?.trim() || 'Profissional',
  } as const;
}

export function createGuideService(repository: GuideRepository) {
  return {
    create(input: CreateGuideInput): Promise<Guide> {
      return repository.create(input, currentGuideActor());
    },
    listMy(): Promise<Guide[]> {
      return repository.listByRequester(currentGuideActor().id);
    },
    listByPatient(patientId: string): Promise<Guide[]> {
      return repository.listByPatient(patientId);
    },
    listPending(): Promise<Guide[]> {
      return repository.listPending();
    },
    schedule(id: number, input: ScheduleGuideInput): Promise<Guide> {
      return repository.schedule(id, input, currentGuideActor());
    },
  };
}
