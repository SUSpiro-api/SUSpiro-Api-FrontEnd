import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../../../api/httpClient';
import { formatIsoDate, guideDetail } from '../guideLabels';
import { todayIsoDate } from '../date';
import { GUIDE_PRIORITIES, GUIDE_STATUSES, GUIDE_TYPES, type GuideType } from '../../guides/types';
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
      const response: unknown = await listPendingGuides();
      if (!Array.isArray(response)) {
        throw new ApiError('O serviço retornou uma lista de guias em formato inesperado. Atualize a tela ou contate o suporte.', 502, 'INVALID_GUIDE_RESPONSE');
      }
      const validGuides = response.filter(isRenderableGuide);
      setGuides(validGuides);
      setLastUpdated(new Date());

      if (previousCount.current !== null && validGuides.length > previousCount.current) {
        const newGuideCount = validGuides.length - previousCount.current;
        setNotice({
          tone: 'info',
          text: newGuideCount === 1
            ? '1 nova guia na fila.'
            : `${newGuideCount} novas guias na fila.`,
        });
      }

      previousCount.current = validGuides.length;
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
        || (guide.pacienteNome ?? '').toLowerCase().includes(term)
        || (cpfTerm.length > 0 && (guide.pacienteCpf ?? '').includes(cpfTerm))
        || guideDetail(guide).toLowerCase().includes(term)
        || (guide.solicitanteNome ?? '').toLowerCase().includes(term)
        || String(guide.id).includes(term)
        || (guide.protocolo ?? '').toLowerCase().includes(term);
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

function isRenderableGuide(value: unknown): value is Guide {
  if (!value || typeof value !== 'object') return false;
  const guide = value as Partial<Guide>;
  return typeof guide.id === 'number'
    && Number.isFinite(guide.id)
    && typeof guide.pacienteId === 'string'
    && typeof guide.pacienteNome === 'string'
    && typeof guide.pacienteCpf === 'string'
    && GUIDE_TYPES.includes(guide.tipo as (typeof GUIDE_TYPES)[number])
    && typeof guide.dataSolicitada === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(guide.dataSolicitada)
    && GUIDE_PRIORITIES.includes(guide.prioridade as (typeof GUIDE_PRIORITIES)[number])
    && GUIDE_STATUSES.includes(guide.status as (typeof GUIDE_STATUSES)[number])
    && typeof guide.solicitanteId === 'number'
    && Number.isFinite(guide.solicitanteId)
    && isOptionalText(guide.protocolo)
    && isOptionalText(guide.especialidade)
    && isOptionalText(guide.detalhe)
    && isOptionalText(guide.observacao)
    && isOptionalText(guide.solicitanteNome)
    && isOptionalText(guide.dataAgendamento)
    && isOptionalText(guide.horaAgendamento)
    && isOptionalText(guide.estabelecimentoNome)
    && isOptionalText(guide.estabelecimentoEndereco)
    && isOptionalText(guide.estabelecimentoCidade)
    && isOptionalText(guide.estabelecimentoEstado)
    && isOptionalText(guide.agendadoPorNome)
    && (guide.agendadoPorId == null || (typeof guide.agendadoPorId === 'number' && Number.isFinite(guide.agendadoPorId)))
    && typeof guide.criadoEm === 'string';
}

function isOptionalText(value: unknown): boolean {
  return value == null || typeof value === 'string';
}
