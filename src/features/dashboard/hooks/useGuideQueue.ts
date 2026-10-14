// Carrega e filtra as guias que precisam ser agendadas.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../../../api/httpClient';
import { formatIsoDate, guideDetail } from '../guideLabels';
import { todayIsoDate } from '../date';
import { listPendingGuides, type Guide } from '../../guides';

export type GuideQueueNotice = {
  tone: 'success' | 'info';
  text: string;
};

export type GuidePriorityFilter = 'todas' | 'URGENTE' | 'NORMAL';

export function useGuideQueue() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<GuidePriorityFilter>('todas');
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
    return () => window.clearInterval(intervalId);
  }, [loadGuides]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const visibleGuides = useMemo(() => {
    const term = search.trim().toLowerCase();
    const cpfTerm = term.replace(/\D/g, '');

    return guides.filter((guide) => {
      const matchesPriority = priority === 'todas' || guide.prioridade === priority;
      const matchesSearch = !term
        || guide.pacienteNome.toLowerCase().includes(term)
        || (cpfTerm.length > 0 && guide.pacienteCpf.includes(cpfTerm))
        || guideDetail(guide).toLowerCase().includes(term);
      return matchesPriority && matchesSearch;
    });
  }, [guides, priority, search]);

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
