// Escolhe se as guias serão carregadas da API ou do navegador.

import { env } from '../../config/env';
import type { GuideRepository } from './guideRepository';
import { HttpGuideRepository } from './httpGuideRepository';
import { LocalGuideRepository } from './localGuideRepository';
import { ResilientGuideRepository } from './resilientGuideRepository';

let repository: GuideRepository | null = null;

export function getGuideRepository(): GuideRepository {
  if (repository) return repository;
  if (env.guideDataSource === 'api') repository = new HttpGuideRepository();
  else if (env.guideDataSource === 'local') repository = new LocalGuideRepository();
  else repository = new ResilientGuideRepository();
  return repository;
}

export function resetGuideRepository(): void {
  repository = null;
}
