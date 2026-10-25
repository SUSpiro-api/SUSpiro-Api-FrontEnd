// Conta o que ainda está em aberto (agendado ou pendente) em cada tipo de registro.

import { useMemo } from 'react';
import type { MaterialIconName } from '../../../components/icons';
import type { ClinicalRecord } from '../types';

export interface OverviewStat {
  type: ClinicalRecord['type'];
  label: string;
  icon: MaterialIconName;
  value: number;
  meta: string;
}

const types: Array<{ type: ClinicalRecord['type']; label: string; icon: MaterialIconName }> = [
  { type: 'consulta', label: 'Consultas em aberto', icon: 'calendar' },
  { type: 'retorno', label: 'Retornos em aberto', icon: 'medical_services' },
  { type: 'exame', label: 'Exames em aberto', icon: 'science' },
  { type: 'encaminhamento', label: 'Encaminhamentos em aberto', icon: 'description' },
];

export function useOverviewStats(records: ClinicalRecord[]): OverviewStat[] {
  return useMemo(
    () =>
      types.map(({ type, label, icon }) => {
        const open = records.filter(
          (record) => record.type === type && (record.status === 'agendado' || record.status === 'pendente'),
        );
        const urgent = open.filter((record) => record.priority === 'urgente').length;
        const pending = open.filter((record) => record.status === 'pendente').length;

        return {
          type,
          label,
          icon,
          value: open.length,
          meta: `${pending} ${pending === 1 ? 'aguarda agendamento' : 'aguardam agendamento'} · ${urgent} ${urgent === 1 ? 'urgente' : 'urgentes'}`,
        };
      }),
    [records],
  );
}
