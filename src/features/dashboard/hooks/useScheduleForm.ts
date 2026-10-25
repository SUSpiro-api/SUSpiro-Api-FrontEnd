// Guarda os campos e envia o formulário de criação de guia.

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../../api/httpClient';
import { env } from '../../../config/env';
import { formatCpf } from '../../../utils/cpf';
import { examGroups, specialtyOptions } from '../catalogs';
import { specialtyLabel, specialtyLabels } from '../guideLabels';
import { createGuide, type ConsultationSpecialty, type Guide } from '../../guides';
import { todayIsoDate } from '../date';
import type { Patient, ScheduleType } from '../types';
import { getScheduleTitle, isUuid, makeGuideInput, validateSchedule } from '../scheduleFormHelpers';
import { useSchedulePatient } from './useSchedulePatient';

export const scheduleTypeOptions: Array<{ value: ScheduleType; label: string; icon: 'calendar' | 'medical_services' | 'science' | 'description' }> = [
  { value: 'consulta', label: 'Consulta', icon: 'calendar' },
  { value: 'retorno', label: 'Retorno', icon: 'medical_services' },
  { value: 'exame', label: 'Exame', icon: 'science' },
  { value: 'encaminhamento', label: 'Encaminhamento', icon: 'description' },
];

export const detailLabels: Partial<Record<ScheduleType, string>> = {
  exame: 'Exame solicitado',
  encaminhamento: 'Especialidade de destino',
};

interface UseScheduleFormParams {
  open: boolean;
  initialType: ScheduleType;
  patient: Patient | null;
  onCreated: (guide: Guide) => void;
  onClose: () => void;
  findPatient: (cpf: string) => Patient | null | Promise<Patient | null>;
  onPatientChange: (patient: Patient) => void;
}

export function useScheduleForm({ open, initialType, patient, onCreated, onClose, findPatient, onPatientChange }: UseScheduleFormParams) {
  const [type, setType] = useState<ScheduleType>(initialType);
  const [specialty, setSpecialty] = useState<ConsultationSpecialty | ''>('');
  const [date, setDate] = useState(todayIsoDate());
  const [detail, setDetail] = useState('');
  const [observation, setObservation] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgente'>('normal');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patientForm = useSchedulePatient({ open, patient, findPatient, onPatientChange });

  useEffect(() => {
    if (!open) return;
    setType(initialType);
    setSpecialty('');
    setDate(todayIsoDate());
    setDetail('');
    setObservation('');
    setPriority('normal');
    setSubmitError('');
    setIsSubmitting(false);
  }, [open, initialType, patient?.cpf]);

  function handleTypeChange(nextType: ScheduleType) {
    setType(nextType);
    setDetail('');
    setSpecialty('');
    setSubmitError('');
  }

  function handleSpecialtyChange(value: ConsultationSpecialty) {
    setSpecialty(value);
    setSubmitError('');
  }

  function handleDateChange(value: string) {
    setDate(value);
    setSubmitError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');

    const validationError = validateSchedule(patient, date, type, detail, specialty);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    if (!patient) return;

    setIsSubmitting(true);
    try {
      let patientForRequest = patient;

      // Pacientes de demonstração usam IDs numéricos (1, 2, 3...). A API exige UUID.
      // Se um registro antigo/de demonstração chegar ao formulário no modo API,
      // resolvemos novamente pelo CPF antes de enviar a guia.
      if (env.guideDataSource !== 'local' && !isUuid(String(patient.id))) {
        let registeredPatient: Patient | null;
        try {
          registeredPatient = await findPatient(patient.cpf);
        } catch (lookupError) {
          setSubmitError(lookupError instanceof ApiError
            ? lookupError.message
            : 'Não foi possível validar o cadastro do paciente na API. Pesquise novamente pelo CPF.');
          return;
        }

        if (!registeredPatient || !isUuid(String(registeredPatient.id))) {
          setSubmitError('O paciente selecionado não possui um identificador válido na API. Pesquise pelo CPF de um paciente cadastrado antes de gerar a guia.');
          return;
        }

        patientForRequest = registeredPatient;
        onPatientChange(registeredPatient);
      }

      const guide = await createGuide(makeGuideInput(patientForRequest, type, specialty, detail, date, observation, priority));
      onCreated(guide);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Não foi possível gerar a guia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedDetail = type === 'consulta'
    ? specialty ? specialtyLabel(specialty) : 'Consulta'
    : detail.trim() || (type === 'retorno' ? 'Retorno' : type);

  return {
    type, specialty, date, detail, observation, priority, submitError, isSubmitting,
    title: getScheduleTitle(type), selectedDetail, today: todayIsoDate(),
    specialtyOptions, specialtyLabels, examGroups, typeOptions: scheduleTypeOptions, formatCpf,
    onTypeChange: handleTypeChange, setSpecialty: handleSpecialtyChange, setDate: handleDateChange,
    setDetail, setObservation, setPriority, ...patientForm, handleSubmit,
  };
}
