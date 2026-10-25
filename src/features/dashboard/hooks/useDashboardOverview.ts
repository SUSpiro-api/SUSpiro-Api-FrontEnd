// Busca os atendimentos e pacientes mais recentes para a visão inicial.

import { useMemo } from 'react';
import type { ClinicalRecord, Patient } from '../types';

export interface RecentActivity {
  record: ClinicalRecord;
  patientName: string;
}

export function useDashboardOverview(records: ClinicalRecord[], patients: Patient[]) {
  const recentActivity = useMemo(() => {
    const patientNames = new Map(patients.map((patient) => [patient.id, patient.name] as const));

    return [...records]
      .sort((first, second) => getRecordDate(second).localeCompare(getRecordDate(first)))
      .slice(0, 6)
      .map((record) => ({
        record,
        patientName: patientNames.get(record.patientId) ?? record.patientName ?? 'Paciente',
      }));
  }, [records, patients]);

  const recentPatients = useMemo(() => {
    const latestRecords = [...records].sort((first, second) =>
      getRecordDate(second).localeCompare(getRecordDate(first)),
    );
    const patientIds = new Set<string | number>();
    const recentIds: Array<string | number> = [];

    for (const record of latestRecords) {
      if (patientIds.has(record.patientId)) continue;
      patientIds.add(record.patientId);
      recentIds.push(record.patientId);
    }

    const patientById = new Map(patients.map((patient) => [patient.id, patient] as const));

    return recentIds
      .map((patientId) => {
        const registeredPatient = patientById.get(patientId);
        if (registeredPatient) return registeredPatient;

        const record = latestRecords.find((item) => item.patientId === patientId);
        if (!record?.patientName || !record.patientCpf) return undefined;
        return { id: record.patientId, name: record.patientName, cpf: record.patientCpf, birthDate: undefined };
      })
      .filter((patient): patient is Patient => Boolean(patient))
      .slice(0, 5);
  }, [records, patients]);

  return { recentActivity, recentPatients };
}

function getRecordDate(record: ClinicalRecord): string {
  return `${record.date}${record.time ?? ''}`;
}
