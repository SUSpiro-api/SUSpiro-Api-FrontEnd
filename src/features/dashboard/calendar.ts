// Funções puras para montar a grade do calendário mensal (semana começa no domingo).

import { todayIsoDate } from '../../utils/date';

export interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
}

export interface MonthView {
  year: number;
  /** 0 = janeiro, 11 = dezembro */
  month: number;
}

export const weekdayLabels = [
  { short: 'dom', full: 'domingo' },
  { short: 'seg', full: 'segunda-feira' },
  { short: 'ter', full: 'terça-feira' },
  { short: 'qua', full: 'quarta-feira' },
  { short: 'qui', full: 'quinta-feira' },
  { short: 'sex', full: 'sexta-feira' },
  { short: 'sáb', full: 'sábado' },
] as const;

export function buildMonthGrid({ year, month }: MonthView): CalendarCell[] {
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((leading + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, index) => {
    const date = new Date(year, month, 1 - leading + index);
    return { iso: todayIsoDate(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

export function chunkWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

export function shiftMonth({ year, month }: MonthView, delta: number): MonthView {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function monthOfIso(iso: string): MonthView {
  const [year, month] = iso.split('-').map(Number);
  return { year, month: month - 1 };
}

export function shiftIsoDay(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return todayIsoDate(new Date(year, month - 1, day + days));
}

export function shiftIsoMonth(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const target = new Date(year, month - 1 + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return todayIsoDate(new Date(target.getFullYear(), target.getMonth(), Math.min(day, lastDay)));
}

function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthTitle({ year, month }: MonthView, locale = 'pt-BR'): string {
  return upperFirst(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1)));
}

export function formatDayTitle(iso: string, locale = 'pt-BR'): string {
  return upperFirst(
    new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${iso}T12:00:00`)),
  );
}

export function formatDayLabel(iso: string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(`${iso}T12:00:00`));
}
