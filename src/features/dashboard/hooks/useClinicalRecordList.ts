import { useMemo, useState } from 'react';
import { useArrowKeyTabs } from '../../../hooks/useArrowKeyTabs';
import { formatCpf } from '../../../utils/cpf';
import type { ClinicalRecord, Patient } from '../types';
import { recordTabs, type RecordTab } from '../clinicalRecordConfig';

export function useClinicalRecordList(records: ClinicalRecord[], selectedPatient: Patient | null) {
  const [selectedTab, setSelectedTab] = useState<RecordTab>('todos');
  const { refs: tabRefs, handleKeyDown: handleTabKeyDown } = useArrowKeyTabs<RecordTab>(recordTabs, setSelectedTab);

  const patientRecords = useMemo(() => {
    if (!selectedPatient) return records;
    return records.filter((record) => record.patientId === selectedPatient.id);
  }, [records, selectedPatient]);

  const visibleRecords = useMemo(() => [...patientRecords]
    .filter((record) => selectedTab === 'todos' || record.type === selectedTab)
    .sort((first, second) => `${second.date}${second.time ?? ''}`.localeCompare(`${first.date}${first.time ?? ''}`)),
  [patientRecords, selectedTab]);

  const counts = useMemo(() => {
    const result: Record<RecordTab, number> = {
      todos: patientRecords.length, consulta: 0, retorno: 0, exame: 0, encaminhamento: 0,
    };
    for (const record of patientRecords) result[record.type] += 1;
    return result;
  }, [patientRecords]);

  const title = selectedPatient ? `Histórico de ${selectedPatient.name}` : 'Atendimentos e pendências';
  const subtitle = selectedPatient
    ? `${formatCpf(selectedPatient.cpf)} · consulte o que está pendente e o que já foi realizado.`
    : 'Visão geral da agenda e dos registros que precisam de acompanhamento.';

  return { selectedTab, setSelectedTab, tabRefs, visibleRecords, counts, title, subtitle, handleTabKeyDown };
}
