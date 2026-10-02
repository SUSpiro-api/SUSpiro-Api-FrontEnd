import { getCurrentUser } from '../auth/token';
import type { Specialty } from './catalogs';

export type GuideType = 'CONSULTA' | 'RETORNO' | 'EXAME' | 'ENCAMINHAMENTO';
export type ConsultationSpecialty = Specialty;
export type GuidePriority = 'NORMAL' | 'URGENTE';
export type GuideStatus = 'AGUARDANDO_AGENDAMENTO' | 'AGENDADO' | 'CANCELADO';

export interface CreateGuideInput {
  pacienteId: number;
  pacienteNome: string;
  pacienteCpf: string;
  tipo: GuideType;
  especialidade?: ConsultationSpecialty;
  detalhe?: string;
  dataSolicitada: string;
  observacao?: string;
  prioridade: GuidePriority;
}

export interface Guide {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  pacienteCpf: string;
  tipo: GuideType;
  especialidade?: ConsultationSpecialty | null;
  detalhe?: string | null;
  dataSolicitada: string;
  observacao?: string | null;
  prioridade: GuidePriority;
  status: GuideStatus;
  solicitanteId: number;
  solicitanteNome: string;
  dataAgendamento?: string | null;
  horaAgendamento?: string | null;
  agendadoPorId?: number | null;
  agendadoPorNome?: string | null;
  criadoEm: string;
}

export interface ScheduleGuideInput {
  dataAgendamento: string;
  horaAgendamento: string;
}

const STORAGE_KEY = 'suspiro.frontend.guias';

function readGuides(): Guide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Guide[]) : [];
  } catch {
    return [];
  }
}

function writeGuides(guides: Guide[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
    window.dispatchEvent(new CustomEvent('suspiro:guides-updated'));
  } catch {
    // O fluxo continua disponível mesmo quando o navegador bloqueia o storage.
  }
}

function currentActor(): { id: number; name: string } {
  const user = getCurrentUser();
  const id = Number(user?.sub);
  return {
    id: Number.isFinite(id) ? id : 0,
    name: user?.nome?.trim() || 'Profissional',
  };
}

function nextGuideId(): number {
  const existing = readGuides();
  const maxId = existing.reduce((max, guide) => Math.max(max, guide.id), 0);
  return Math.max(Date.now(), maxId + 1);
}

/**
 * Persistência temporária exclusivamente no frontend.
 * Enquanto a entidade de guia não estiver no backend, as solicitações ficam
 * no localStorage deste navegador para permitir a demonstração do fluxo
 * médico → recepção/enfermagem.
 */
export async function createGuide(input: CreateGuideInput): Promise<Guide> {
  const actor = currentActor();
  const guide: Guide = {
    id: nextGuideId(),
    pacienteId: input.pacienteId,
    pacienteNome: input.pacienteNome,
    pacienteCpf: input.pacienteCpf,
    tipo: input.tipo,
    especialidade: input.especialidade ?? null,
    detalhe: input.detalhe ?? null,
    dataSolicitada: input.dataSolicitada,
    observacao: input.observacao ?? null,
    prioridade: input.prioridade,
    status: 'AGUARDANDO_AGENDAMENTO',
    solicitanteId: actor.id,
    solicitanteNome: actor.name,
    dataAgendamento: null,
    horaAgendamento: null,
    agendadoPorId: null,
    agendadoPorNome: null,
    criadoEm: new Date().toISOString(),
  };

  writeGuides([guide, ...readGuides()]);
  return guide;
}

export async function listMyGuides(): Promise<Guide[]> {
  const actor = currentActor();
  return readGuides().filter((guide) => guide.solicitanteId === actor.id);
}

export async function listPendingGuides(): Promise<Guide[]> {
  return readGuides()
    .filter((guide) => guide.status === 'AGUARDANDO_AGENDAMENTO')
    .sort((a, b) => {
      if (a.prioridade !== b.prioridade) return a.prioridade === 'URGENTE' ? -1 : 1;
      return a.criadoEm.localeCompare(b.criadoEm);
    });
}

export async function scheduleGuide(id: number, input: ScheduleGuideInput): Promise<Guide> {
  const guides = readGuides();
  const index = guides.findIndex((guide) => guide.id === id);
  if (index < 0) throw new Error('Guia não encontrada neste navegador.');

  const actor = currentActor();
  const updated: Guide = {
    ...guides[index],
    status: 'AGENDADO',
    dataAgendamento: input.dataAgendamento,
    horaAgendamento: input.horaAgendamento,
    agendadoPorId: actor.id,
    agendadoPorNome: actor.name,
  };

  guides[index] = updated;
  writeGuides(guides);
  return updated;
}
