// Deixa disponíveis as funções usadas para criar e buscar guias.

import { createGuideService } from './guideService';
import { getGuideRepository } from './repositoryFactory';

const guideService = createGuideService(getGuideRepository());

export const createGuide = guideService.create;
export const listMyGuides = guideService.listMy;
export const listPendingGuides = guideService.listPending;
export const scheduleGuide = guideService.schedule;

export { subscribeToGuideUpdates } from './guideEvents';

export type {
  ConsultationSpecialty,
  CreateGuideInput,
  Guide,
  GuidePriority,
  GuideStatus,
  GuideType,
  ScheduleGuideInput,
} from './types';
