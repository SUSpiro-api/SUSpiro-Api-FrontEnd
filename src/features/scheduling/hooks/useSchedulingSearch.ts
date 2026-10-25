// Carrega os dados usados pelas buscas da central de agendamento.

import { useCallback, useEffect, useState } from 'react';
import {
  loadSchedulingSearchData,
  searchRegisteredPatients,
  subscribeToGuideUpdates,
  type SchedulingSearchData,
} from '../data';

const INITIAL_DATA: SchedulingSearchData = { guides: [], patients: [], fromServer: true };

export function useSchedulingSearch() {
  const [data, setData] = useState<SchedulingSearchData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await loadSchedulingSearchData());
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPatients = useCallback(
    (term: string) => searchRegisteredPatients(term, data.patients),
    [data.patients],
  );

  useEffect(() => {
    void load();
    return subscribeToGuideUpdates(() => void load());
  }, [load]);

  return {
    guides: data.guides,
    patients: data.patients,
    fromServer: data.fromServer,
    loading,
    reload: load,
    searchPatients,
  };
}
