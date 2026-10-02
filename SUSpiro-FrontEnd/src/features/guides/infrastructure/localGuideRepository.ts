import { browserStorage } from '../../../shared/lib/storage';
import type { GuideRepository } from '../domain/GuideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from '../domain/types';

const STORAGE_KEY = 'suspiro.frontend.guias';

function readGuides(): Guide[] {
  const guides = browserStorage.get<unknown>(STORAGE_KEY);
  return Array.isArray(guides) ? guides as Guide[] : [];
}

function writeGuides(guides: Guide[]): void {
  browserStorage.set(STORAGE_KEY, guides);
  window.dispatchEvent(new CustomEvent('suspiro:guides-updated'));
}

function nextGuideId(guides: Guide[]): number {
  const maxId = guides.reduce((max, guide) => Math.max(max, guide.id), 0);
  return Math.max(Date.now(), maxId + 1);
}

export class LocalGuideRepository implements GuideRepository {
  async create(input: CreateGuideInput, actor: GuideActor): Promise<Guide> {
    const guides = readGuides();
    const guide: Guide = {
      id: nextGuideId(guides),
      ...input,
      especialidade: input.especialidade ?? null,
      detalhe: input.detalhe ?? null,
      observacao: input.observacao ?? null,
      status: 'AGUARDANDO_AGENDAMENTO',
      solicitanteId: actor.id,
      solicitanteNome: actor.name,
      dataAgendamento: null,
      horaAgendamento: null,
      agendadoPorId: null,
      agendadoPorNome: null,
      criadoEm: new Date().toISOString(),
    };

    writeGuides([guide, ...guides]);
    return guide;
  }

  async listByRequester(actorId: number): Promise<Guide[]> {
    return readGuides().filter((guide) => guide.solicitanteId === actorId);
  }

  async listPending(): Promise<Guide[]> {
    return readGuides()
      .filter((guide) => guide.status === 'AGUARDANDO_AGENDAMENTO')
      .sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade === 'URGENTE' ? -1 : 1;
        return a.criadoEm.localeCompare(b.criadoEm);
      });
  }

  async schedule(id: number, input: ScheduleGuideInput, actor: GuideActor): Promise<Guide> {
    const guides = readGuides();
    const index = guides.findIndex((guide) => guide.id === id);
    if (index < 0) throw new Error('Guia não encontrada neste navegador.');

    const updated = {
      ...guides[index],
      status: 'AGENDADO' as const,
      dataAgendamento: input.dataAgendamento,
      horaAgendamento: input.horaAgendamento,
      agendadoPorId: actor.id,
      agendadoPorNome: actor.name,
    };

    guides[index] = updated;
    writeGuides(guides);
    return updated;
  }
}
