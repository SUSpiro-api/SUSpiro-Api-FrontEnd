import type { Guide, GuidePriority, GuideStatus, GuideType } from '../guides';
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

export function specialtyLabel(especialidade: string | null | undefined): string {
  if (!especialidade) return '';
  return specialtyLabels[especialidade as Specialty] ?? especialidade;
}

export const guideStatusLabels: Record<GuideStatus, string> = {
  AGUARDANDO_AGENDAMENTO: 'Aguardando agendamento',
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
};

export const guidePriorityLabels: Record<GuidePriority, string> = {
  NORMAL: 'Normal',
  URGENTE: 'Urgente',
};

export function formatIsoDate(date: string | null | undefined): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Data não informada';
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function guideDetail(guide: Guide): string {
  if (guide.tipo === 'CONSULTA' && guide.especialidade) return specialtyLabel(guide.especialidade);
  return guide.detalhe?.trim() || guideTypeLabels[guide.tipo] || 'Atendimento não especificado';
}
