import type { ClinicalRecordType } from './types';

export type RecordTab = 'todos' | ClinicalRecordType;

export const recordTabLabels: Record<RecordTab, string> = {
  todos: 'Todos', consulta: 'Consultas', retorno: 'Retornos', exame: 'Exames', encaminhamento: 'Encaminhamentos',
};

export const recordStatusLabels = {
  agendado: 'Agendado', pendente: 'Pendente', realizado: 'Realizado', cancelado: 'Cancelado',
} as const;

export const recordTypeLabels: Record<ClinicalRecordType, string> = {
  consulta: 'Consulta', retorno: 'Retorno', exame: 'Exame', encaminhamento: 'Encaminhamento',
};


export const recordTabs = Object.keys(recordTabLabels) as RecordTab[];

export function formatClinicalDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(`${date}T12:00:00`));
}
