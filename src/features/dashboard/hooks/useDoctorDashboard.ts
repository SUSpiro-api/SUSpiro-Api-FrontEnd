// Guarda os dados e as ações da tela de atendimento.

import { useEffect, useState } from 'react';
import { ApiError } from '../../../api/httpClient';
import { listMyGuides, type Guide } from '../../guides';
import { findPatientByCpf, clinicalRecords as initialRecords } from '../data';
import { guideToClinicalRecord } from '../guideToClinicalRecord';
import type { ClinicalRecord, Patient, ScheduleType } from '../types';

export function useDoctorDashboard() {
  const [records, setRecords] = useState<ClinicalRecord[]>(initialRecords);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('consulta');
  const [pendingScheduleType, setPendingScheduleType] = useState<ScheduleType | null>(null);
  const [successGuide, setSuccessGuide] = useState<Guide | null>(null);
  const [loadError, setLoadError] = useState('');

  // Carrega as guias que já foram criadas para mostrar no histórico.
  useEffect(() => {
    let isMounted = true;

    async function loadMyGuides() {
      try {
        const guides = await listMyGuides();
        if (!isMounted) return;

        const apiRecords = guides.map(guideToClinicalRecord);
        setRecords((current) => {
          const sampleRecords = current.filter(
            (record) => !guides.some((guide) => guide.id === record.id),
          );
          return [...apiRecords, ...sampleRecords];
        });
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof ApiError && error.code === 'SESSAO_EXPIRADA') return;
        setLoadError(
          'Não foi possível carregar as guias já geradas. Novas guias continuarão sendo registradas normalmente.',
        );
      }
    }

    void loadMyGuides();
    return () => { isMounted = false; };
  }, []);

  // Abre a busca quando o usuário chega pelo atalho do menu.
  useEffect(() => {
    function openFromSidebar() {
      if (window.location.hash === '#atender-paciente') setPatientSearchOpen(true);
    }

    openFromSidebar();
    window.addEventListener('hashchange', openFromSidebar);
    return () => window.removeEventListener('hashchange', openFromSidebar);
  }, []);

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
    setSelectedPatient(patient);
    setPatientSearchOpen(false);

    if (pendingScheduleType) {
      setScheduleType(pendingScheduleType);
      setPendingScheduleType(null);
      setScheduleModalOpen(true);
    }
  }

  function handleCreated(guide: Guide) {
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
    selectedPatient,
    setSelectedPatient,
    patientSearchOpen,
    setPatientSearchOpen,
    scheduleModalOpen,
    setScheduleModalOpen,
    scheduleType,
    successGuide,
    setSuccessGuide,
    loadError,
    openSchedule,
    handlePatientFound,
    handleCreated,
    closePatientSearch,
    clearSelectedPatient,
    findPatientByCpf,
  };
}
