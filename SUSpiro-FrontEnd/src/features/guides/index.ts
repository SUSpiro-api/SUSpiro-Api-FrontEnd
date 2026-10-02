import { createGuideService } from './application/guideService';
import { getGuideRepository } from './infrastructure/repositoryFactory';

const guideService = createGuideService(getGuideRepository());

export const createGuide = guideService.create;
export const listMyGuides = guideService.listMy;
export const listPendingGuides = guideService.listPending;
export const scheduleGuide = guideService.schedule;

export type {
  ConsultationSpecialty,
  CreateGuideInput,
  Guide,
  GuidePriority,
  GuideStatus,
  GuideType,
  ScheduleGuideInput,
} from './domain/types';
