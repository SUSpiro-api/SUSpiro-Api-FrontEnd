import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from './types';

export interface GuideRepository {
  create(input: CreateGuideInput, actor: GuideActor): Promise<Guide>;
  listByRequester(actorId: number): Promise<Guide[]>;
  listByPatient(patientId: string): Promise<Guide[]>;
  listPending(): Promise<Guide[]>;
  schedule(id: number, input: ScheduleGuideInput, actor: GuideActor): Promise<Guide>;
}
