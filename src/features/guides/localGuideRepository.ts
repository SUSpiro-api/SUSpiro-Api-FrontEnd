import { browserStorage } from '../../utils/storage';
import { GUIDES_STORAGE_KEY, notifyGuidesUpdated } from './guideEvents';
import type { GuideRepository } from './guideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from './types';

const STORAGE_KEY = GUIDES_STORAGE_KEY;

export function readLocalGuides(): Guide[] {
  const guides = browserStorage.get<unknown>(STORAGE_KEY);
  return Array.isArray(guides) ? guides as Guide[] : [];
}

export function writeLocalGuides(guides: Guide[]): void {
  browserStorage.set(STORAGE_KEY, guides);
  notifyGuidesUpdated();
}

function nextGuideId(guides: Guide[]): number {
  const maxId = guides.reduce((max, guide) => Math.max(max, guide.id), 0);
  return Math.max(Date.now(), maxId + 1);
}

export class LocalGuideRepository implements GuideRepository {
  private readonly markPendingSync: boolean;

  constructor(markPendingSync = false) {
    this.markPendingSync = markPendingSync;
  }

  async create(input: CreateGuideInput, actor: GuideActor): Promise<Guide> {
    const guides = readLocalGuides();
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
      ...(this.markPendingSync ? { sincronizacaoPendente: true } : {}),
    };

    writeLocalGuides([guide, ...guides]);
    return guide;
  }

  async listByRequester(actorId: number): Promise<Guide[]> {
    return readLocalGuides().filter((guide) => guide.solicitanteId === actorId);
  }

  async listByPatient(patientId: string): Promise<Guide[]> {
    return readLocalGuides()
      .filter((guide) => String(guide.pacienteId) === String(patientId))
      .sort((first, second) => second.criadoEm.localeCompare(first.criadoEm) || second.id - first.id);
  }

  async listPending(): Promise<Guide[]> {
    return readLocalGuides()
      .filter((guide) => guide.status === 'AGUARDANDO_AGENDAMENTO')
      .sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade === 'URGENTE' ? -1 : 1;
        return a.criadoEm.localeCompare(b.criadoEm);
      });
  }

  async schedule(id: number, input: ScheduleGuideInput, actor: GuideActor): Promise<Guide> {
    const guides = readLocalGuides();
    const index = guides.findIndex((guide) => guide.id === id);
    if (index < 0) throw new Error('Guia não encontrada neste navegador.');

    if (!input.estabelecimentoNome.trim() || !input.estabelecimentoEndereco.trim()
        || !input.estabelecimentoCidade.trim() || input.estabelecimentoEstado.trim().length !== 2) {
      throw new Error('Informe a unidade e o endereço completo do atendimento.');
    }

    const updated = {
      ...guides[index],
      status: 'AGENDADO' as const,
      dataAgendamento: input.dataAgendamento,
      horaAgendamento: input.horaAgendamento,
      estabelecimentoNome: input.estabelecimentoNome.trim(),
      estabelecimentoEndereco: input.estabelecimentoEndereco.trim(),
      estabelecimentoCidade: input.estabelecimentoCidade.trim(),
      estabelecimentoEstado: input.estabelecimentoEstado.trim().toUpperCase(),
      agendadoPorId: actor.id,
      agendadoPorNome: actor.name,
    };

    guides[index] = updated;
    writeLocalGuides(guides);
    return updated;
  }
}
