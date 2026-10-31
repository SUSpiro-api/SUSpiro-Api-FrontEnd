import type { Guide } from '../guides';
import { authenticatedFetch } from '../../api/httpClient';
import { subscribeToGuideUpdates } from '../guides/guideEvents';
export { subscribeToGuideUpdates };

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



export interface PatientCareData {
  items: CareItem[];
  /** false quando o endpoint autenticado não respondeu; nenhum fallback local é exibido. */
  fromServer: boolean;
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

function guideStatus(guide: Guide): CareStatus {
  if (guide.status === 'AGENDADO') return 'agendado';
  if (guide.status === 'CANCELADO') return 'cancelado';
  return 'pendente';
}

function guideTitle(guide: Guide): string {
  const specialty = typeof guide.especialidade === 'string' ? guide.especialidade.trim() : '';
  const detail = typeof guide.detalhe === 'string' ? guide.detalhe.trim() : '';
  if (guide.tipo === 'CONSULTA') return specialty || 'Consulta';
  if (guide.tipo === 'EXAME') return detail || 'Exame';
  if (guide.tipo === 'ENCAMINHAMENTO') return detail || 'Encaminhamento';
  return detail || 'Retorno';
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function safeDate(value: unknown, fallback: string): string {
  const candidate = typeof value === 'string' ? value.slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : fallback;
}

function fromGuide(guide: Guide): CareItem {
  const location = [
    optionalText(guide.estabelecimentoNome),
    optionalText(guide.estabelecimentoEndereco),
    [optionalText(guide.estabelecimentoCidade), optionalText(guide.estabelecimentoEstado)].filter(Boolean).join('/'),
  ].filter(Boolean).join(' · ');

  return {
    id: `guia-${guide.id}`,
    type: guide.tipo.toLowerCase() as CareType,
    title: guideTitle(guide),
    status: guideStatus(guide),
    date: safeDate(guide.dataAgendamento, guide.dataSolicitada),
    time: optionalText(guide.horaAgendamento),
    professional: optionalText(guide.solicitanteNome),
    location: location || null,
    note: optionalText(guide.observacao),
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
  const dataHora = optionalText(requisicao.agendamento?.dataHora);
  const observacoes = [
    optionalText(requisicao.observacao),
    optionalText(requisicao.agendamento?.observacao),
  ].filter((value): value is string => value !== null);
  const dataAgendada = dataHora?.split('T')[0];
  const horaAgendada = dataHora?.split('T')[1]?.slice(0, 5);

  return {
    id: `requisicao-${requisicao.id}`,
    type: requisitionType(requisicao.descricao),
    title: requisicao.descricao.trim(),
    status: status[requisicao.status],
    date: safeDate(dataAgendada, requisicao.dataVencimento),
    time: optionalText(horaAgendada),
    professional: optionalText(requisicao.agendamento?.agendadoPor) ?? requisicao.solicitante.trim(),
    location: optionalText(requisicao.agendamento?.local) ?? optionalText(requisicao.localAtendimento),
    note: observacoes.join(' · ') || null,
    referenceCode: optionalText(requisicao.protocolo) || String(requisicao.id),
    urgent: false,
    source: 'requisicao',
  };
}




const GUIDE_TYPE_SET = new Set<Guide['tipo']>(['CONSULTA', 'RETORNO', 'EXAME', 'ENCAMINHAMENTO']);
const GUIDE_STATUS_SET = new Set<Guide['status']>(['AGUARDANDO_AGENDAMENTO', 'AGENDADO', 'CANCELADO']);
const REQUISITION_STATUS_SET = new Set<RequisicaoApi['status']>(['PENDENTE', 'AGENDADA', 'CONCLUIDA', 'VENCIDA']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isGuide(value: unknown): value is Guide {
  if (!isRecord(value)) return false;
  return Number.isInteger(value.id)
    && isNonEmptyString(value.pacienteId)
    && isNonEmptyString(value.pacienteNome)
    && isNonEmptyString(value.pacienteCpf)
    && typeof value.tipo === 'string'
    && GUIDE_TYPE_SET.has(value.tipo as Guide['tipo'])
    && typeof value.dataSolicitada === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value.dataSolicitada)
    && typeof value.status === 'string'
    && GUIDE_STATUS_SET.has(value.status as Guide['status']);
}

function isRequisicao(value: unknown): value is RequisicaoApi {
  if (!isRecord(value)) return false;
  return Number.isInteger(value.id)
    && isNonEmptyString(value.descricao)
    && typeof value.dataVencimento === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value.dataVencimento)
    && isNonEmptyString(value.solicitante)
    && typeof value.status === 'string'
    && REQUISITION_STATUS_SET.has(value.status as RequisicaoApi['status'])
    && (value.agendamento === null || value.agendamento === undefined || isRecord(value.agendamento));
}

/**
 * Carrega somente os atendimentos vinculados à sessão do paciente.
 * Os dois endpoints são protegidos e filtrados pelo backend usando o usuário autenticado.
 * Não consulta listagens gerais nem aceita identificadores enviados pelo cliente.
 */
export async function loadPatientCareData(): Promise<PatientCareData> {
  try {
    const [rawGuides, rawRequisitions] = await Promise.all([
      authenticatedFetch<unknown>('/guias/minhas', { retries: 0 }),
      authenticatedFetch<unknown>('/requisicoes/minhas', { retries: 0 }),
    ]);

    if (!Array.isArray(rawGuides) || !Array.isArray(rawRequisitions)) {
      return { items: [], fromServer: false };
    }

    const guides = rawGuides.filter(isGuide).map(fromGuide);
    const requisitions = rawRequisitions.filter(isRequisicao).map(fromRequisicao);
    const items = [...guides, ...requisitions].sort((first, second) => {
      const dateOrder = second.date.localeCompare(first.date);
      return dateOrder || second.id.localeCompare(first.id);
    });

    return { items, fromServer: true };
  } catch {
    // Não exibe dados fictícios ou de outro paciente quando a API não responde.
    return { items: [], fromServer: false };
  }
}
