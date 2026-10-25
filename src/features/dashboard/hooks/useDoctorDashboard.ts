// Guarda os dados e as ações da tela de atendimento.

import { useCallback, useEffect, useRef, useState } from 'react';
import { listMyGuides, subscribeToGuideUpdates, type Guide } from '../../guides';
import { findPatientByCpf, patients as demoPatients } from '../data';
import { findPatientByCpfApi } from '../patientApi';
import { env } from '../../../config/env';
import { ApiError } from '../../../api/httpClient';
import { guideToClinicalRecord } from '../guideToClinicalRecord';
import type { ClinicalRecord, Patient, ScheduleType } from '../types';

export function useDoctorDashboard() {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<Patient[]>(() =>
    env.guideDataSource === 'local' ? demoPatients : [],
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('consulta');
  const [pendingScheduleType, setPendingScheduleType] = useState<ScheduleType | null>(null);
  const [successGuide, setSuccessGuide] = useState<Guide | null>(null);
  const [guidesLoadFailed, setGuidesLoadFailed] = useState(false);
  const [guidesLoading, setGuidesLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  // Carrega as guias que já foram criadas para mostrar no histórico.
  const loadMyGuides = useCallback(async () => {
    setGuidesLoading(true);

    try {
      const guides = await listMyGuides();
      if (!isMountedRef.current) return;

      const apiRecords = guides.map(guideToClinicalRecord);
      setRecords(apiRecords);
      setRegisteredPatients((current) => {
        const patientsById = new Map(current.map((patient) => [String(patient.id), patient] as const));
        for (const guide of guides) {
          const id = String(guide.pacienteId);
          const existing = patientsById.get(id);
          patientsById.set(id, {
            id: guide.pacienteId,
            name: guide.pacienteNome,
            cpf: guide.pacienteCpf,
            birthDate: existing?.birthDate,
          });
        }
        return [...patientsById.values()];
      });
      setGuidesLoadFailed(false);
    } catch (error) {
      if (!isMountedRef.current) return;
      if (error instanceof ApiError && error.code === 'SESSAO_EXPIRADA') return;
      setGuidesLoadFailed(true);
    } finally {
      if (isMountedRef.current) setGuidesLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void loadMyGuides();
    // Mantém o histórico do paciente em dia quando a guia muda (ex.: recepção agenda).
    const unsubscribe = subscribeToGuideUpdates(() => void loadMyGuides());
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [loadMyGuides]);

  function openSchedule(type: ScheduleType = 'consulta') {
    setScheduleType(type);

    if (!selectedPatient) {
      setPendingScheduleType(type);
      setPatientSearchOpen(true);
      return;
    }

    setScheduleModalOpen(true);
  }

  function handlePatientFound(patient: Patient) {
    setRegisteredPatients((current) => [patient, ...current.filter((item) => String(item.id) !== String(patient.id))]);
    setSelectedPatient(patient);
    setPatientSearchOpen(false);

    if (pendingScheduleType) {
      setScheduleType(pendingScheduleType);
      setPendingScheduleType(null);
      setScheduleModalOpen(true);
    }
  }

  function handleCreated(guide: Guide) {
    setRegisteredPatients((current) => {
      const patient = current.find((item) => String(item.id) === String(guide.pacienteId));
      return [{
        id: guide.pacienteId,
        name: guide.pacienteNome,
        cpf: guide.pacienteCpf,
        birthDate: patient?.birthDate,
      }, ...current.filter((item) => String(item.id) !== String(guide.pacienteId))];
    });
    setRecords((current) => [
      guideToClinicalRecord(guide),
      ...current.filter((record) => record.id !== guide.id),
    ]);
    setSuccessGuide(guide);
  }

  function closePatientSearch() {
    setPatientSearchOpen(false);
    setPendingScheduleType(null);
  }

  function clearSelectedPatient() {
    setSelectedPatient(null);
    setPendingScheduleType(null);
  }

  return {
    records,
    patients: registeredPatients,
    selectedPatient,
    setSelectedPatient,
    patientSearchOpen,
    setPatientSearchOpen,
    scheduleModalOpen,
    setScheduleModalOpen,
    scheduleType,
    successGuide,
    setSuccessGuide,
    guidesLoadFailed,
    guidesLoading,
    retryLoadGuides: loadMyGuides,
    searchInputRef,
    openSchedule,
    handlePatientFound,
    handleCreated,
    closePatientSearch,
    clearSelectedPatient,
    findPatientByCpf: (cpf: string) => env.guideDataSource === 'local'
      ? findPatientByCpf(cpf)
      : findPatientByCpfApi(cpf),
  };
}
