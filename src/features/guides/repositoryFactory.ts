// Escolhe se as guias serão carregadas da API ou do navegador.

import { env } from '../../config/env';
import type { GuideRepository } from './guideRepository';
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
