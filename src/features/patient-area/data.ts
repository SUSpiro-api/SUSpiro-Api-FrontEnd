// Dados da área do paciente. Sessões reais consultam guias e requisições
// vinculadas à identidade autenticada; demonstração é só para admins.

import { listPendingGuides, type Guide } from '../guides';
import { authenticatedFetch } from '../../api/httpClient';
import { readLocalGuides } from '../guides/localGuideRepository';
import { subscribeToGuideUpdates } from '../guides/guideEvents';
import { clinicalRecords, patients } from '../dashboard/data';
import { normalizeCpf } from '../../utils/cpf';
import { env } from '../../config/env';
import type { MaterialIconName } from '../../components/icons';
import type { ClinicalRecord } from '../dashboard/types';

export type CareStatus = 'agendado' | 'pendente' | 'realizado' | 'cancelado' | 'vencido';
export type CareType = 'consulta' | 'retorno' | 'exame' | 'encaminhamento' | 'solicitacao';

export interface CareItem {
  id: string;
  type: CareType;
  title: string;
  status: CareStatus;
  /** Data marcada (agendado/realizado) ou desejada (pendente). */
  date: string;
  time?: string | null;
  professional?: string | null;
  /** Unidade/local de atendimento retornado pela API; não é inferido pelo frontend. */
  location?: string | null;
  note?: string | null;
  /** Número da guia quando o atendimento veio de uma guia. */
  guideNumber?: number;
  /** Protocolo/código informado pela API para localizar a solicitação. */
  referenceCode?: string | null;
  urgent: boolean;
  source: 'guia' | 'registro' | 'requisicao';
}

export const careTypeLabels: Record<CareType, string> = {
  consulta: 'Consulta',
  retorno: 'Retorno',
  exame: 'Exame',
  encaminhamento: 'Encaminhamento',
  solicitacao: 'Solicitação',
};

export const careStatusLabels: Record<CareStatus, string> = {
  agendado: 'Agendado',
  pendente: 'Pendente',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  vencido: 'Vencido',
};

/** Nome do atendimento com seu tipo explícito para evitar títulos ambíguos na lista. */
export function careDisplayTitle(item: Pick<CareItem, 'type' | 'title'>): string {
  const title = item.title.trim();
  const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const beginsWith = (prefix: string) => normalized.startsWith(prefix);

  if (item.type === 'consulta') {
    return beginsWith('consulta') || beginsWith('primeira consulta')
      ? title
      : `Consulta · ${title || 'Especialidade não informada'}`;
  }
  if (item.type === 'retorno') {
    return beginsWith('retorno') ? title : `Retorno · ${title || 'Especialidade não informada'}`;
  }
  if (item.type === 'exame') {
    return beginsWith('exame ') || beginsWith('exame:') || beginsWith('exame ·')
      ? title
      : `Exame · ${title || 'Tipo de exame não informado'}`;
  }
  if (item.type === 'encaminhamento') {
    return beginsWith('encaminhamento')
      ? title
      : `Encaminhamento · ${title || 'Especialidade não informada'}`;
  }
  return beginsWith('solicitacao') ? title : `Solicitação · ${title || 'Detalhes não informados'}`;
}

/** Identificador legível exibido na lista, sem confundir o paciente com o status. */
export function careReferenceLabel(item: CareItem): string {
  if (item.guideNumber !== undefined) return `Código: GUIA-${item.guideNumber}`;

  const suffix = item.referenceCode?.trim();
  if (item.source === 'requisicao') {
    return suffix ? `Protocolo: ${suffix}` : `Código: REQ-${item.id.replace(/^requisicao-/, '')}`;
  }
  if (item.source === 'registro') {
    return `Código: REG-${suffix || item.id.replace(/^registro-/, '')}`;
  }
  return suffix ? `Código: GUIA-${suffix}` : 'Código não informado';
}

export const careTypeIcons: Record<CareType, MaterialIconName> = {
  consulta: 'stethoscope',
  retorno: 'calendar',
  exame: 'science',
  encaminhamento: 'assignment',
  solicitacao: 'description',
};

export interface PatientCareData {
  items: CareItem[];
  /** false quando o endpoint autenticado não respondeu; nenhum fallback local é exibido. */
  fromServer: boolean;
  /** true quando a pré-visualização do admin está usando a jornada de demonstração. */
  demoPreview: boolean;
}

interface RequisicaoApi {
  id: number;
  protocolo?: string | null;
  descricao: string;
  observacao?: string | null;
  dataVencimento: string;
  status: 'PENDENTE' | 'AGENDADA' | 'CONCLUIDA' | 'VENCIDA';
  solicitante: string;
  localAtendimento?: string | null;
  agendamento?: {
    dataHora: string;
    local?: string | null;
    observacao?: string | null;
    agendadoPor?: string | null;
  } | null;
}

// Paciente de demonstração com jornada completa registrada no frontend.
const DEMO_PATIENT_CPF = '529.982.247-25';

function guideStatus(guide: Guide): CareStatus {
  if (guide.status === 'AGENDADO') return 'agendado';
  if (guide.status === 'CANCELADO') return 'cancelado';
  return 'pendente';
}

function guideTitle(guide: Guide): string {
  if (guide.tipo === 'CONSULTA') return guide.especialidade ?? 'Consulta';
  if (guide.tipo === 'EXAME') return guide.detalhe ?? 'Exame';
  if (guide.tipo === 'ENCAMINHAMENTO') return guide.detalhe ?? 'Encaminhamento';
  return guide.detalhe ?? 'Retorno';
}

function fromGuide(guide: Guide): CareItem {
  return {
    id: `guia-${guide.id}`,
    type: guide.tipo.toLowerCase() as CareType,
    title: guideTitle(guide),
    status: guideStatus(guide),
    date: guide.dataAgendamento ?? guide.dataSolicitada,
    time: guide.horaAgendamento ?? null,
    professional: guide.solicitanteNome ?? null,
    location: guide.localAtendimento ?? guide.local ?? guide.agendamento?.local ?? null,
    note: guide.observacao ?? null,
    guideNumber: guide.id,
    referenceCode: String(guide.id),
    urgent: guide.prioridade === 'URGENTE',
    source: 'guia',
  };
}

function requisitionType(description: string): CareType {
  const normalized = description.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized.includes('exame')) return 'exame';
  if (normalized.includes('retorno')) return 'retorno';
  if (normalized.includes('consulta')) return 'consulta';
  if (normalized.includes('encaminhamento')) return 'encaminhamento';
  return 'solicitacao';
}

function fromRequisicao(requisicao: RequisicaoApi): CareItem {
  const status: Record<RequisicaoApi['status'], CareStatus> = {
    PENDENTE: 'pendente',
    AGENDADA: 'agendado',
    CONCLUIDA: 'realizado',
    VENCIDA: 'vencido',
  };
  const dataHora = requisicao.agendamento?.dataHora;
  const observacoes = [
    requisicao.observacao,
    requisicao.agendamento?.observacao,
  ].filter((value): value is string => Boolean(value?.trim()));

  return {
    id: `requisicao-${requisicao.id}`,
    type: requisitionType(requisicao.descricao),
    title: requisicao.descricao,
    status: status[requisicao.status],
    date: dataHora?.split('T')[0] ?? requisicao.dataVencimento,
    time: dataHora?.split('T')[1]?.slice(0, 5) ?? null,
    professional: requisicao.agendamento?.agendadoPor ?? requisicao.solicitante,
    location: requisicao.agendamento?.local ?? requisicao.localAtendimento ?? null,
    note: observacoes.join(' · ') || null,
    referenceCode: requisicao.protocolo?.trim() || String(requisicao.id),
    urgent: false,
    source: 'requisicao',
  };
}

function fromDemoRecord(record: ClinicalRecord): CareItem {
  return {
    id: `registro-${record.id}`,
    type: record.type,
    title: record.title,
    status: record.status,
    date: record.date,
    time: record.time ?? null,
    professional: null,
    note: record.observation ?? null,
    referenceCode: String(record.id),
    urgent: record.priority === 'urgente',
    source: 'registro',
  };
}

function guidesForPatient(guides: Guide[], cpf: string): Guide[] {
  return guides.filter((guide) => normalizeCpf(guide.pacienteCpf) === normalizeCpf(cpf));
}

function demoRecordsFor(cpf: string): CareItem[] {
  if (normalizeCpf(cpf) === normalizeCpf(DEMO_PATIENT_CPF)) {
    return clinicalRecords.map(fromDemoRecord);
  }
  return [];
}

export async function loadPatientCareData(cpf: string, preview = false): Promise<PatientCareData> {
  // Pré-visualização local só existe no desenvolvimento com modo explicitamente não-API.
  // Sessões reais de paciente nunca usam dados locais ou globais.
  if (preview && !import.meta.env.PROD && env.guideDataSource !== 'api') {
    let guides = guidesForPatient(readLocalGuides(), cpf);
    try {
      const pending = guidesForPatient(await listPendingGuides(), cpf);
      const byId = new Map(guides.map((guide) => [guide.id, guide]));
      for (const guide of pending) {
        if (!byId.has(guide.id)) byId.set(guide.id, guide);
      }
      guides = [...byId.values()];
    } catch {
      // Dados de demonstração continuam disponíveis para a pré-visualização administrativa.
    }

    let items = [...guides.map(fromGuide), ...demoRecordsFor(cpf)];
    let demoPreview = false;
    if (items.length === 0) {
      items = clinicalRecords.map(fromDemoRecord);
      demoPreview = true;
    }
    return { items, fromServer: true, demoPreview };
  }

  // Para pacientes reais, o backend deriva o paciente da conta autenticada.
  // O navegador não envia CPF/pacienteId e nunca filtra listas globais.
  try {
    const [guias, requisicoes] = await Promise.all([
      authenticatedFetch<Guide[]>('/guias/minhas', { retries: 0 }),
      authenticatedFetch<RequisicaoApi[]>('/requisicoes/minhas', { retries: 0 }),
    ]);
    const items = [...guias.map(fromGuide), ...requisicoes.map(fromRequisicao)]
      .sort((first, second) => first.date.localeCompare(second.date));
    return { items, fromServer: true, demoPreview: false };
  } catch {
    // Fail closed: falha de API não pode recorrer a localStorage, outros pacientes ou demonstração.
    return { items: [], fromServer: false, demoPreview: false };
  }
}

/** Nome de exibição do paciente, quando ele é um dos pacientes de demonstração. */
export function demoPatientName(cpf: string): string | undefined {
  return patients.find((patient) => normalizeCpf(patient.cpf) === normalizeCpf(cpf))?.name;
}

export { subscribeToGuideUpdates };
