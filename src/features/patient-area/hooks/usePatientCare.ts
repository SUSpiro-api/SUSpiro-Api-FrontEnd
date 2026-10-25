// Carrega e mantém atualizada a jornada de cuidado do paciente logado.

import { useCallback, useEffect, useState } from 'react';
import { loadPatientCareData, subscribeToGuideUpdates, type PatientCareData } from '../data';

const INITIAL_DATA: PatientCareData = { items: [], fromServer: true, demoPreview: false };

export function usePatientCare(cpf: string, preview = false) {
  const [data, setData] = useState<PatientCareData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await loadPatientCareData(cpf, preview));
    } finally {
      setLoading(false);
    }
  }, [cpf, preview]);

  useEffect(() => {
    void load();
    return subscribeToGuideUpdates(() => void load());
  }, [load]);

  return {
    items: data.items,
    fromServer: data.fromServer,
    demoPreview: data.demoPreview,
    loading,
    reload: load,
  };
}
