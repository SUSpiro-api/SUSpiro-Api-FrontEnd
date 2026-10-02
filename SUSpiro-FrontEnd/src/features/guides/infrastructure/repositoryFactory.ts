import { env } from '../../../core/config/env';
import type { GuideRepository } from '../domain/GuideRepository';
import { HttpGuideRepository } from './httpGuideRepository';
import { LocalGuideRepository } from './localGuideRepository';

let repository: GuideRepository | null = null;

export function getGuideRepository(): GuideRepository {
  if (repository) return repository;
  repository = env.guideDataSource === 'api'
    ? new HttpGuideRepository()
    : new LocalGuideRepository();
  return repository;
}

export function resetGuideRepository(): void {
  repository = null;
}
