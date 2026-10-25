// Cuida da troca de paciente no formulário de agendamento.

import { useEffect, useState } from 'react';
import { isValidCpf } from '../../../utils/cpf';
import type { Patient } from '../types';

interface UseSchedulePatientParams {
  open: boolean;
  patient: Patient | null;
  findPatient: (cpf: string) => Patient | null | Promise<Patient | null>;
  onPatientChange: (patient: Patient) => void;
}

export function useSchedulePatient({ open, patient, findPatient, onPatientChange }: UseSchedulePatientParams) {
  const [editingCpf, setEditingCpf] = useState(false);
  const [cpfDraft, setCpfDraft] = useState('');
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    if (!open) return;
    setEditingCpf(false);
    setCpfDraft(patient?.cpf ?? '');
    setCpfError('');
  }, [open, patient?.cpf]);

  function startCpfEdit() {
    setEditingCpf(true);
  }

  function handleCpfChange(value: string) {
    setCpfDraft(value.replace(/\D/g, '').slice(0, 11));
    setCpfError('');
  }

  function cancelCpfEdit() {
    setCpfDraft(patient?.cpf ?? '');
    setCpfError('');
    setEditingCpf(false);
  }

  async function applyCpf() {
    if (!isValidCpf(cpfDraft)) { setCpfError('Informe um CPF válido com 11 dígitos.'); return; }
    try {
      const nextPatient = await findPatient(cpfDraft);
      if (!nextPatient) { setCpfError('Nenhum paciente foi encontrado com esse CPF.'); return; }
      onPatientChange(nextPatient);
      setCpfDraft(nextPatient.cpf);
      setEditingCpf(false);
      setCpfError('');
    } catch (cause) {
      setCpfError(cause instanceof Error ? cause.message : 'Não foi possível consultar o paciente.');
    }
  }

  return { editingCpf, cpfDraft, cpfError, startCpfEdit, handleCpfChange, cancelCpfEdit, applyCpf };
}
