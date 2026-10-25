// Carrega e filtra as guias que precisam ser agendadas.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../../../api/httpClient';
import { formatIsoDate, guideDetail } from '../guideLabels';
import { todayIsoDate } from '../date';
import type { GuideType } from '../../guides/types';
import { listPendingGuides, subscribeToGuideUpdates, type Guide } from '../../guides';

export type GuideQueueNotice = {
  tone: 'success' | 'info';
  text: string;
};

export type GuidePriorityFilter = 'todas' | 'URGENTE' | 'NORMAL';
export type GuideTypeFilter = 'todas' | GuideType;
export type GuideSortOrder = 'prioridade' | 'data-antiga' | 'data-recente';

export function useGuideQueue() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<GuidePriorityFilter>('todas');
  const [type, setType] = useState<GuideTypeFilter>('todas');
  const [sortOrder, setSortOrder] = useState<GuideSortOrder>('prioridade');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notice, setNotice] = useState<GuideQueueNotice | null>(null);
  const previousCount = useRef<number | null>(null);

  const loadGuides = useCallback(async () => {
    setError('');
    setRefreshing(true);

    try {
      const response = await listPendingGuides();
      setGuides(response);
      setLastUpdated(new Date());

      if (previousCount.current !== null && response.length > previousCount.current) {
        const newGuideCount = response.length - previousCount.current;
        setNotice({
          tone: 'info',
          text: newGuideCount === 1
            ? '1 nova guia na fila.'
            : `${newGuideCount} novas guias na fila.`,
        });
      }

      previousCount.current = response.length;
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível carregar a fila de guias.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadGuides();
    const intervalId = window.setInterval(() => void loadGuides(), 15000);
    // Atualiza na hora quando o médico gera uma guia (nesta aba ou em outra).
    const unsubscribe = subscribeToGuideUpdates(() => void loadGuides());
    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
    };
  }, [loadGuides]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const visibleGuides = useMemo(() => {
    const term = search.trim().toLowerCase();
    const cpfTerm = term.replace(/\D/g, '');

    const filtered = guides.filter((guide) => {
      const matchesPriority = priority === 'todas' || guide.prioridade === priority;
      const matchesType = type === 'todas' || guide.tipo === type;
      const matchesSearch = !term
        || guide.pacienteNome.toLowerCase().includes(term)
        || (cpfTerm.length > 0 && guide.pacienteCpf.includes(cpfTerm))
        || guideDetail(guide).toLowerCase().includes(term)
        || guide.solicitanteNome.toLowerCase().includes(term)
        || String(guide.id).includes(term);
      return matchesPriority && matchesType && matchesSearch;
    });

    return filtered.sort((first, second) => {
      if (sortOrder === 'prioridade') {
        const priorityDelta = Number(second.prioridade === 'URGENTE') - Number(first.prioridade === 'URGENTE');
        if (priorityDelta !== 0) return priorityDelta;
        return first.dataSolicitada.localeCompare(second.dataSolicitada);
      }
      const dateDelta = first.dataSolicitada.localeCompare(second.dataSolicitada);
      return sortOrder === 'data-recente' ? -dateDelta : dateDelta;
    });
  }, [guides, priority, search, sortOrder, type]);

  function handleScheduled(scheduledGuide: Guide) {
    setGuides((current) => current.filter((guide) => guide.id !== scheduledGuide.id));
    if (previousCount.current !== null) {
      previousCount.current = Math.max(0, previousCount.current - 1);
    }

    setNotice({
      tone: 'success',
      text: `Guia de ${scheduledGuide.pacienteNome} agendada para ${formatIsoDate(scheduledGuide.dataAgendamento ?? scheduledGuide.dataSolicitada)} às ${(scheduledGuide.horaAgendamento ?? '').slice(0, 5)}.`,
    });
  }

  return {
    guides,
    selectedGuide,
    setSelectedGuide,
    search,
    setSearch,
    priority,
    setPriority,
    type,
    setType,
    sortOrder,
    setSortOrder,
    loading,
    refreshing,
    error,
    lastUpdated,
    notice,
    loadGuides,
    visibleGuides,
    urgentCount: guides.filter((guide) => guide.prioridade === 'URGENTE').length,
    todayCount: guides.filter((guide) => guide.dataSolicitada === todayIsoDate()).length,
    handleScheduled,
  };
}
