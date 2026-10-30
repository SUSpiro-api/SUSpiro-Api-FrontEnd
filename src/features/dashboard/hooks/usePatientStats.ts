import { useMemo } from 'react';
import type { ClinicalRecord, Patient } from '../types';

interface PatientStat {
  label: string;
  type: ClinicalRecord['type'];
  value: number;
  meta: string;
}

const recordTypes: Array<{
  label: string;
  type: ClinicalRecord['type'];
  gender: 'feminine' | 'masculine';
}> = [
  { label: 'Consultas', type: 'consulta', gender: 'feminine' },
  { label: 'Retornos', type: 'retorno', gender: 'masculine' },
  { label: 'Exames', type: 'exame', gender: 'masculine' },
  { label: 'Encaminhamentos', type: 'encaminhamento', gender: 'masculine' },
];

export function usePatientStats(records: ClinicalRecord[], patient: Patient): PatientStat[] {
  return useMemo(() => {
    const patientRecords = records.filter((record) => record.patientId === patient.id);

    return recordTypes.map((type) => {
      const typeRecords = patientRecords.filter((record) => record.type === type.type);
      const pending = typeRecords.filter((record) => record.status === 'pendente').length;
      const scheduled = typeRecords.filter((record) => record.status === 'agendado').length;
      const completed = typeRecords.filter((record) => record.status === 'realizado').length;
      const scheduledLabel = type.gender === 'feminine' ? 'agendada' : 'agendado';
      const completedLabel = type.gender === 'feminine' ? 'realizada' : 'realizado';

      return {
        label: type.label,
        type: type.type,
        value: typeRecords.length,
        meta: [
          formatCount(pending, 'pendente', 'pendentes'),
          formatCount(scheduled, scheduledLabel, `${scheduledLabel}s`),
          formatCount(completed, completedLabel, `${completedLabel}s`),
        ].join(' · '),
      };
    });
  }, [records, patient]);
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
