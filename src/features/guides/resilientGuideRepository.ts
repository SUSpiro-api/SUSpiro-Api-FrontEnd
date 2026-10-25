// Usa a API de guias e, se ela ainda não existir ou estiver fora do ar, guarda no navegador.
// As guias guardadas localmente são reenviadas ao backend assim que ele responder.

import { ApiError } from '../../api/httpClient';
import type { GuideRepository } from './guideRepository';
import { HttpGuideRepository } from './httpGuideRepository';
import { LocalGuideRepository, readLocalGuides, writeLocalGuides } from './localGuideRepository';
import type { CreateGuideInput, Guide, GuideActor, ScheduleGuideInput } from './types';

/** Erros que indicam "backend/endpoint indisponível" (e não um dado inválido enviado pelo usuário). */
export function isBackendUnavailable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return !(error instanceof DOMException);
  if (error.code === 'SESSAO_EXPIRADA') return false;
  return [0, 404, 405, 501, 502, 503, 504].includes(error.status) || error.status >= 500;
}

function isPendingSync(guide: Guide): boolean {
  return guide.sincronizacaoPendente === true;
}

function toCreateInput(guide: Guide): CreateGuideInput {
  return {
    pacienteId: guide.pacienteId,
    pacienteNome: guide.pacienteNome,
    pacienteCpf: guide.pacienteCpf,
    tipo: guide.tipo,
    especialidade: guide.especialidade ?? undefined,
    detalhe: guide.detalhe ?? undefined,
    dataSolicitada: guide.dataSolicitada,
    observacao: guide.observacao ?? undefined,
    prioridade: guide.prioridade,
  };
}

export class ResilientGuideRepository implements GuideRepository {
  private readonly remote: GuideRepository;
  private readonly local: GuideRepository;
  private syncing: Promise<void> | null = null;

  constructor(remote: GuideRepository = new HttpGuideRepository(), local: GuideRepository = new LocalGuideRepository(true)) {
    this.remote = remote;
    this.local = local;
  }

  async create(input: CreateGuideInput, actor: GuideActor): Promise<Guide> {
    try {
      return await this.remote.create(input, actor);
    } catch (error) {
      if (!isBackendUnavailable(error)) throw error;
      return this.local.create(input, actor);
    }
  }

  async listByRequester(actorId: number): Promise<Guide[]> {
    await this.syncPending();
    const localGuides = (await this.local.listByRequester(actorId)).filter(isPendingSync);

    try {
      const remoteGuides = await this.remote.listByRequester(actorId);
      return [...localGuides, ...remoteGuides];
    } catch (error) {
      if (!isBackendUnavailable(error)) throw error;
      return this.local.listByRequester(actorId);
    }
  }

  async listPending(): Promise<Guide[]> {
    await this.syncPending();
    const localGuides = (await this.local.listPending()).filter(isPendingSync);

    try {
      const remoteGuides = await this.remote.listPending();
      return sortQueue([...localGuides, ...remoteGuides]);
    } catch (error) {
      if (!isBackendUnavailable(error)) throw error;
      return this.local.listPending();
    }
  }

  async schedule(id: number, input: ScheduleGuideInput, actor: GuideActor): Promise<Guide> {
    const localGuide = readLocalGuides().find((guide) => guide.id === id);
    if (localGuide) return this.local.schedule(id, input, actor);
    return this.remote.schedule(id, input, actor);
  }

  /** Reenvia ao backend as guias que ficaram só no navegador. Nunca lança erro. */
  syncPending(): Promise<void> {
    if (this.syncing) return this.syncing;
    this.syncing = this.runSync().finally(() => { this.syncing = null; });
    return this.syncing;
  }

  private async runSync(): Promise<void> {
    const pending = readLocalGuides().filter((guide) => isPendingSync(guide) && guide.status === 'AGUARDANDO_AGENDAMENTO');
    if (pending.length === 0) return;

    const sent = new Set<number>();
    for (const guide of [...pending].reverse()) {
      try {
        await this.remote.create(toCreateInput(guide), { id: guide.solicitanteId, name: guide.solicitanteNome });
        sent.add(guide.id);
      } catch (error) {
        // Backend ainda fora do ar: tenta de novo na próxima atualização.
        if (isBackendUnavailable(error)) break;
        // Rejeição definitiva (dados inválidos): mantém a guia local para não perder o registro.
        continue;
      }
    }

    if (sent.size > 0) writeLocalGuides(readLocalGuides().filter((guide) => !sent.has(guide.id)));
  }
}

function sortQueue(guides: Guide[]): Guide[] {
  return [...guides].sort((a, b) => {
    if (a.prioridade !== b.prioridade) return a.prioridade === 'URGENTE' ? -1 : 1;
    return a.criadoEm.localeCompare(b.criadoEm);
  });
}
