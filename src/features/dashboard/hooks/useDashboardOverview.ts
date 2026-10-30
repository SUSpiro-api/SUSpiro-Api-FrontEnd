import { useMemo } from 'react';
import type { ClinicalRecord, Patient } from '../types';

export interface RecentActivity {
  record: ClinicalRecord;
  patientName: string;
}

export function useDashboardOverview(records: ClinicalRecord[], patients: Patient[]) {
  const recentActivity = useMemo(() => {
    const patientNames = new Map(patients.map((patient) => [String(patient.id), patient.name] as const));

    return [...records]
      .sort((first, second) => getRecordDate(second).localeCompare(getRecordDate(first)))
      .slice(0, 6)
      .map((record) => ({
        record,
        patientName: patientNames.get(String(record.patientId)) ?? record.patientName ?? 'Paciente',
      }));
  }, [records, patients]);

  const recentPatients = useMemo(() => {
    const latestRecords = [...records].sort((first, second) =>
      getRecordDate(second).localeCompare(getRecordDate(first)),
    );
    const patientIds = new Set<string>();
    const recentIds: string[] = [];

    for (const record of latestRecords) {
      const patientId = String(record.patientId);
      if (!patientId || patientIds.has(patientId)) continue;
      patientIds.add(patientId);
      recentIds.push(patientId);
    }

    const patientById = new Map(patients.map((patient) => [String(patient.id), patient] as const));

    return recentIds
      .map((patientId) => {
        const registeredPatient = patientById.get(patientId);
        if (registeredPatient) return registeredPatient;

        const record = latestRecords.find((item) => String(item.patientId) === patientId);
        if (!record?.patientName) return undefined;
        return {
          id: patientId,
          name: record.patientName,
          cpf: record.patientCpf ?? '',
          birthDate: undefined,
        } satisfies Patient;
      })
      .filter((patient): patient is Patient => Boolean(patient))
      .slice(0, 5);
  }, [records, patients]);

  return { recentActivity, recentPatients };
}

function getRecordDate(record: ClinicalRecord): string {
  // A data de criação ordena a atividade; a data solicitada pode ser futura.
  return record.guide?.criadoEm || `${record.date}T${record.time ?? '00:00:00'}`;
}
