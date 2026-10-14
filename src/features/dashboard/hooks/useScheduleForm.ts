// Guarda os campos, confere os dados e envia o formulário de guia.

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../../api/httpClient';
import { formatCpf, isValidCpf } from '../../../utils/cpf';
import { examGroups, specialtyOptions } from '../catalogs';
import { specialtyLabel, specialtyLabels } from '../guideLabels';
import {
  createGuide,
  type ConsultationSpecialty,
  type CreateGuideInput,
  type Guide,
  type GuideType,
} from '../../guides';
import { isPastIsoDate, todayIsoDate } from '../date';
import type { Patient, ScheduleType } from '../types';

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
  findPatient: (cpf: string) => Patient | null;
  onPatientChange: (patient: Patient) => void;
}

function mapGuideType(type: ScheduleType): GuideType {
  return type.toUpperCase() as GuideType;
}

function getTitle(type: ScheduleType): string {
  const labels: Record<ScheduleType, string> = {
    consulta: 'Nova consulta',
    retorno: 'Novo retorno',
    exame: 'Novo exame',
    encaminhamento: 'Novo encaminhamento',
  };
  return labels[type];
}

function needsDetail(type: ScheduleType): boolean {
  return type === 'exame' || type === 'encaminhamento';
}

function validateSchedule(
  patient: Patient | null,
  date: string,
  type: ScheduleType,
  detail: string,
  specialty: ConsultationSpecialty | '',
): string {
  if (!patient || !date) return 'Identifique o paciente e informe a data solicitada.';
  if (isPastIsoDate(date)) return 'A data solicitada não pode ser anterior à data de hoje.';
  if (needsDetail(type) && !detail.trim()) {
    return type === 'exame'
      ? 'Selecione o exame solicitado.'
      : 'Selecione a especialidade de destino.';
  }
  if (type === 'consulta' && !specialty) return 'Selecione a especialidade da consulta.';
  return '';
}

function makeGuideInput(
  patient: Patient,
  type: ScheduleType,
  specialty: ConsultationSpecialty | '',
  detail: string,
  date: string,
  observation: string,
  priority: 'normal' | 'urgente',
): CreateGuideInput {
  const hasDetail = needsDetail(type);

  return {
    pacienteId: patient.id,
    pacienteNome: patient.name,
    pacienteCpf: patient.cpf.replace(/\D/g, ''),
    tipo: mapGuideType(type),
    especialidade: type === 'consulta' ? specialty || undefined : undefined,
    detalhe: hasDetail ? detail.trim() : undefined,
    dataSolicitada: date,
    observacao: observation.trim() || undefined,
    prioridade: priority === 'urgente' ? 'URGENTE' : 'NORMAL',
  };
}

export function useScheduleForm({
  open,
  initialType,
  patient,
  onCreated,
  onClose,
  findPatient,
  onPatientChange,
}: UseScheduleFormParams) {
  const [type, setType] = useState<ScheduleType>(initialType);
  const [specialty, setSpecialty] = useState<ConsultationSpecialty | ''>('');
  const [date, setDate] = useState(todayIsoDate());
  const [detail, setDetail] = useState('');
  const [observation, setObservation] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgente'>('normal');
  const [editingCpf, setEditingCpf] = useState(false);
  const [cpfDraft, setCpfDraft] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(initialType);
    setSpecialty('');
    setDate(todayIsoDate());
    setDetail('');
    setObservation('');
    setPriority('normal');
    setEditingCpf(false);
    setCpfDraft(patient?.cpf ?? '');
    setCpfError('');
    setSubmitError('');
    setIsSubmitting(false);
  }, [open, initialType, patient?.cpf]);

  function handleSpecialtyChange(value: ConsultationSpecialty) {
    setSpecialty(value);
    setSubmitError('');
  }

  function handleDateChange(value: string) {
    setDate(value);
    setSubmitError('');
  }

  const handleTypeChange = (nextType: ScheduleType) => {
    setType(nextType);
    setDetail('');
    setSpecialty('');
    setSubmitError('');
  };

  const handleCpfChange = (value: string) => {
    setCpfDraft(value.replace(/\D/g, '').slice(0, 11));
    setCpfError('');
  };

  const cancelCpfEdit = () => {
    setCpfDraft(patient?.cpf ?? '');
    setCpfError('');
    setEditingCpf(false);
  };

  const applyCpf = () => {
    if (!isValidCpf(cpfDraft)) {
      setCpfError('Informe um CPF válido com 11 dígitos.');
      return;
    }
    const nextPatient = findPatient(cpfDraft);
    if (!nextPatient) {
      setCpfError('Nenhum paciente foi encontrado com esse CPF.');
      return;
    }
    onPatientChange(nextPatient);
    setCpfDraft(nextPatient.cpf);
    setEditingCpf(false);
    setCpfError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      const guideInput = makeGuideInput(
        patient,
        type,
        specialty,
        detail,
        date,
        observation,
        priority,
      );
      const guide = await createGuide(guideInput);
      onCreated(guide);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível gerar a guia. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = getTitle(type);
  const selectedDetail = type === 'consulta'
    ? specialty ? specialtyLabel(specialty) : 'Consulta'
    : detail.trim() || (type === 'retorno' ? 'Retorno' : type);

  return {
    type,
    specialty,
    date,
    detail,
    observation,
    priority,
    editingCpf,
    cpfDraft,
    cpfError,
    submitError,
    isSubmitting,
    title,
    selectedDetail,
    today: todayIsoDate(),
    specialtyOptions,
    specialtyLabels,
    examGroups,
    typeOptions: scheduleTypeOptions,
    formatCpf,
    onTypeChange: handleTypeChange,
    setSpecialty: handleSpecialtyChange,
    setDate: handleDateChange,
    setDetail,
    setObservation,
    setPriority,
    setEditingCpf,
    handleCpfChange,
    cancelCpfEdit,
    applyCpf,
    handleSubmit,
  };
}
