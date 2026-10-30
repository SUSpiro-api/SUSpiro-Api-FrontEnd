import { useCallback, useEffect, useRef, useState } from 'react';
import { listMyGuides, listPatientGuides, subscribeToGuideUpdates, type Guide } from '../../guides';
import { findPatientByCpfApi } from '../patientApi';
import { ApiError } from '../../../api/httpClient';
import { guideToClinicalRecord } from '../guideToClinicalRecord';
import type { ClinicalRecord, Patient, ScheduleType } from '../types';

export function useDoctorDashboard() {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [patientRecords, setPatientRecords] = useState<ClinicalRecord[]>([]);
  const [patientHistoryPatientId, setPatientHistoryPatientId] = useState<string | null>(null);
  const [patientHistoryLoading, setPatientHistoryLoading] = useState(false);
  const [patientHistoryLoadFailed, setPatientHistoryLoadFailed] = useState(false);
  const [registeredPatients, setRegisteredPatients] = useState<Patient[]>([]);
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
  const patientHistoryRequestRef = useRef(0);
  const recordsRef = useRef(records);
  recordsRef.current = records;

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

  const loadPatientHistory = useCallback(async (patientId: string) => {
    const requestId = ++patientHistoryRequestRef.current;
    setPatientHistoryPatientId(patientId);
    setPatientRecords([]);
    setPatientHistoryLoading(true);
    setPatientHistoryLoadFailed(false);

    try {
      const guides = await listPatientGuides(patientId);
      if (!isMountedRef.current || requestId !== patientHistoryRequestRef.current) return;
      setPatientRecords(guides.map(guideToClinicalRecord));
    } catch {
      if (!isMountedRef.current || requestId !== patientHistoryRequestRef.current) return;
      // Mantém pelo menos o histórico criado por este profissional se a API do paciente falhar.
      setPatientRecords(recordsRef.current.filter((record) => String(record.patientId) === String(patientId)));
      setPatientHistoryLoadFailed(true);
    } finally {
      if (isMountedRef.current && requestId === patientHistoryRequestRef.current) {
        setPatientHistoryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPatient?.id) {
      void loadPatientHistory(selectedPatient.id);
      return;
    }

    patientHistoryRequestRef.current += 1;
    setPatientHistoryPatientId(null);
    setPatientRecords([]);
    setPatientHistoryLoading(false);
    setPatientHistoryLoadFailed(false);
  }, [selectedPatient?.id, loadPatientHistory]);

  useEffect(() => {
    if (!selectedPatient?.id) return;
    return subscribeToGuideUpdates(() => void loadPatientHistory(selectedPatient.id));
  }, [selectedPatient?.id, loadPatientHistory]);

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
    const createdRecord = guideToClinicalRecord(guide);
    setRecords((current) => [
      createdRecord,
      ...current.filter((record) => record.id !== guide.id),
    ]);
    if (selectedPatient && String(selectedPatient.id) === String(guide.pacienteId)) {
      // Invalida uma leitura anterior para que uma resposta atrasada não apague a guia recém-criada.
      patientHistoryRequestRef.current += 1;
      setPatientHistoryLoading(false);
      setPatientHistoryLoadFailed(false);
      setPatientHistoryPatientId(selectedPatient.id);
      setPatientRecords((current) => [createdRecord, ...current.filter((record) => record.id !== guide.id)]);
    }
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
    patientRecords: patientHistoryPatientId === selectedPatient?.id ? patientRecords : [],
    patientHistoryLoading,
    patientHistoryLoadFailed,
    retryLoadPatientHistory: () => selectedPatient ? loadPatientHistory(selectedPatient.id) : Promise.resolve(),
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
    findPatientByCpf: (cpf: string) => findPatientByCpfApi(cpf),
  };
}
