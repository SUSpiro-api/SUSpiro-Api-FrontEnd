export const GUIDE_TYPES = ['CONSULTA', 'RETORNO', 'EXAME', 'ENCAMINHAMENTO'] as const;
export type GuideType = (typeof GUIDE_TYPES)[number];

export const GUIDE_PRIORITIES = ['NORMAL', 'URGENTE'] as const;
export type GuidePriority = (typeof GUIDE_PRIORITIES)[number];

export const GUIDE_STATUSES = ['AGUARDANDO_AGENDAMENTO', 'AGENDADO', 'CANCELADO'] as const;
export type GuideStatus = (typeof GUIDE_STATUSES)[number];

export type ConsultationSpecialty = string;

export interface CreateGuideInput {
  pacienteId: string;
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
  protocolo?: string | null;
  pacienteId: string;
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
  estabelecimentoNome?: string | null;
  estabelecimentoEndereco?: string | null;
  estabelecimentoCidade?: string | null;
  estabelecimentoEstado?: string | null;
  agendadoPorId?: number | null;
  agendadoPorNome?: string | null;
  criadoEm: string;
  /** true enquanto a guia só existe neste navegador e ainda não foi enviada ao backend. */
  sincronizacaoPendente?: boolean;
}

export interface ScheduleGuideInput {
  dataAgendamento: string;
  horaAgendamento: string;
  estabelecimentoNome: string;
  estabelecimentoEndereco: string;
  estabelecimentoCidade: string;
  estabelecimentoEstado: string;
}

export interface GuideActor {
  id: number;
  name: string;
}
