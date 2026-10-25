// Controla o calendário da agenda: mês exibido, dia escolhido, indicadores e teclado.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { todayIsoDate } from '../../../utils/date';
import {
  buildMonthGrid,
  chunkWeeks,
  monthOfIso,
  shiftIsoDay,
  shiftIsoMonth,
  shiftMonth,
  type MonthView,
} from '../calendar';
import type { ClinicalRecord } from '../types';

export type DayTone = 'urgent' | 'open' | 'done';

export interface DaySummary {
  records: ClinicalRecord[];
  open: number;
  urgent: number;
  tone: DayTone | null;
}

export function agendaDate(record: ClinicalRecord): string {
  return record.scheduledDate ?? record.date;
}

function summarize(records: ClinicalRecord[]): DaySummary {
  const sorted = [...records].sort((first, second) => (first.time ?? '99:99').localeCompare(second.time ?? '99:99'));
  const active = sorted.filter((record) => record.status !== 'cancelado');
  const open = active.filter((record) => record.status === 'agendado' || record.status === 'pendente');
  const urgent = open.filter((record) => record.priority === 'urgente').length;
  const tone: DayTone | null = urgent > 0 ? 'urgent' : open.length > 0 ? 'open' : active.length > 0 ? 'done' : null;

  return { records: sorted, open: open.length, urgent, tone };
}

export function useAgendaCalendar(records: ClinicalRecord[], patientId?: string | number) {
  const today = todayIsoDate();
  const [view, setView] = useState<MonthView>(() => monthOfIso(today));
  const [selectedIso, setSelectedIso] = useState(today);
  const gridRef = useRef<HTMLTableElement>(null);
  const focusAfterMove = useRef(false);

  const byDate = useMemo(() => {
    const groups = new Map<string, ClinicalRecord[]>();
    for (const record of records) {
      if (patientId !== undefined && record.patientId !== patientId) continue;
      const key = agendaDate(record);
      groups.set(key, [...(groups.get(key) ?? []), record]);
    }
    return new Map([...groups].map(([key, list]) => [key, summarize(list)] as const));
  }, [records, patientId]);

  const weeks = useMemo(() => chunkWeeks(buildMonthGrid(view)), [view]);

  const monthPrefix = `${view.year}-${String(view.month + 1).padStart(2, '0')}-`;
  const monthTotals = useMemo(() => {
    let open = 0;
    let urgent = 0;
    for (const [iso, summary] of byDate) {
      if (!iso.startsWith(monthPrefix)) continue;
      open += summary.open;
      urgent += summary.urgent;
    }
    return { open, urgent };
  }, [byDate, monthPrefix]);

  // Só um dia da grade recebe Tab; as setas andam entre os dias.
  const focusableIso = selectedIso.startsWith(monthPrefix) ? selectedIso : `${monthPrefix}01`;

  useEffect(() => {
    if (!focusAfterMove.current) return;
    focusAfterMove.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-iso="${selectedIso}"]`)?.focus();
  }, [selectedIso, view]);

  function selectDay(iso: string, moveFocus = false) {
    focusAfterMove.current = moveFocus;
    setSelectedIso(iso);
    setView(monthOfIso(iso));
  }

  function showMonth(delta: number) {
    setView((current) => shiftMonth(current, delta));
  }

  function goToToday() {
    selectDay(todayIsoDate());
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLElement>) {
    const focused = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-iso]') : null;
    const base = focused?.dataset.iso ?? selectedIso;
    const moves: Record<string, () => string> = {
      ArrowLeft: () => shiftIsoDay(base, -1),
      ArrowRight: () => shiftIsoDay(base, 1),
      ArrowUp: () => shiftIsoDay(base, -7),
      ArrowDown: () => shiftIsoDay(base, 7),
      PageUp: () => shiftIsoMonth(base, -1),
      PageDown: () => shiftIsoMonth(base, 1),
    };
    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    selectDay(move(), true);
  }

  return {
    today,
    view,
    weeks,
    selectedIso,
    focusableIso,
    selectedDay: byDate.get(selectedIso) ?? summarize([]),
    monthTotals,
    gridRef,
    summaryFor: (iso: string) => byDate.get(iso),
    selectDay,
    showMonth,
    goToToday,
    handleGridKeyDown,
  };
}
