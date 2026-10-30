import { useCallback, useEffect, useState } from 'react';
import { loadPatientCareData, subscribeToGuideUpdates, type PatientCareData } from '../data';

const INITIAL_DATA: PatientCareData = { items: [], fromServer: true };

export function usePatientCare() {
  const [data, setData] = useState<PatientCareData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await loadPatientCareData());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return subscribeToGuideUpdates(() => void load());
  }, [load]);

  return { items: data.items, fromServer: data.fromServer, loading, reload: load };
}
