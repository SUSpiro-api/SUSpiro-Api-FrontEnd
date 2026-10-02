import type { GuidePriority, GuideStatus, GuideType } from './guideService';
import { specialtyOptions, type Specialty } from './catalogs';

export const guideTypeLabels: Record<GuideType, string> = {
  CONSULTA: 'Consulta',
  RETORNO: 'Retorno',
  EXAME: 'Exame',
  ENCAMINHAMENTO: 'Encaminhamento',
};

export const specialtyLabels: Record<Specialty, string> = specialtyOptions.reduce((labels, specialty) => {
  labels[specialty] = specialty;
  return labels;
}, {} as Record<Specialty, string>);

export const guideStatusLabels: Record<GuideStatus, string> = {
  AGUARDANDO_AGENDAMENTO: 'Aguardando agendamento',
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
};

export const guidePriorityLabels: Record<GuidePriority, string> = {
  NORMAL: 'Normal',
  URGENTE: 'Urgente',
};

export function formatIsoDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}
