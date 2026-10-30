import type { CareItem } from './data';

export const summaryTypes = ['consulta', 'exame', 'retorno', 'encaminhamento'] as const;
export type SummaryType = (typeof summaryTypes)[number];

export interface TypeSummary {
  type: SummaryType;
  /** Tudo o que a clínica já registrou desse tipo, em qualquer situação. */
  total: number;
  /** Com data e horário confirmados. */
  scheduled: number;
  /** Aguardando a recepção definir data e horário. */
  waiting: number;
}

export function summarizeByType(items: CareItem[]): TypeSummary[] {
  return summaryTypes.map((type) => {
    const ofType = items.filter((item) => item.type === type);
    return {
      type,
      total: ofType.length,
      scheduled: ofType.filter((item) => item.status === 'agendado').length,
      waiting: ofType.filter((item) => item.status === 'pendente').length,
    };
  });
}

/** Data de hoje no fuso do dispositivo, no formato AAAA-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Primeiro atendimento com data marcada que ainda não passou. */
export function findNextScheduled(items: CareItem[], today: string = todayIso()): CareItem | null {
  const upcoming = items
    .filter((item) => item.status === 'agendado' && item.date >= today)
    .sort((first, second) => `${first.date}${first.time ?? ''}`.localeCompare(`${second.date}${second.time ?? ''}`));
  return upcoming[0] ?? null;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

export interface DateParts {
  day: string;
  month: string;
  weekday: string;
}

/** Quebra AAAA-MM-DD em dia, mês abreviado e dia da semana, sem depender de fuso horário. */
export function dateParts(iso: string): DateParts {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()] ?? '';
  return { day: String(day), month: MONTHS[month - 1] ?? '', weekday };
}
