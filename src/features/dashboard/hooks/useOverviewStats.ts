import { useMemo } from 'react';
import type { ClinicalRecord } from '../types';

export interface OverviewStat {
  type: ClinicalRecord['type'];
  label: string;
  value: number;
  meta: string;
}

const types: Array<{ type: ClinicalRecord['type']; label: string }> = [
  { type: 'consulta', label: 'Consultas em aberto' },
  { type: 'retorno', label: 'Retornos em aberto' },
  { type: 'exame', label: 'Exames em aberto' },
  { type: 'encaminhamento', label: 'Encaminhamentos em aberto' },
];

export function useOverviewStats(records: ClinicalRecord[]): OverviewStat[] {
  return useMemo(
    () =>
      types.map(({ type, label }) => {
        const open = records.filter(
          (record) => record.type === type && (record.status === 'agendado' || record.status === 'pendente'),
        );
        const urgent = open.filter((record) => record.priority === 'urgente').length;
        const pending = open.filter((record) => record.status === 'pendente').length;

        return {
          type,
          label,
          value: open.length,
          meta: `${pending} ${pending === 1 ? 'aguarda agendamento' : 'aguardam agendamento'} · ${urgent} ${urgent === 1 ? 'urgente' : 'urgentes'}`,
        };
      }),
    [records],
  );
}
